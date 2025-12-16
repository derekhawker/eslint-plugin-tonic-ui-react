// enforce-color-mode.js

const { colorProps, colorShorthandLookup } = require("./alias-maps");

const defaultOptions = {
  importSource: "@tonic-ui",
  ignoredColors: [
    "gray:50",
    "blue:50",
    "green:40",
    "orange:50",
    "cyan:40",
    "red:50",
    "purple:50",
    "teal:40",
    "magenta:40",
    "green:30",
    "yellow:50",
  ],
};

const specialCssValues = new Set([
  "unset",
  "inherit",
  "initial",
  "transparent",
  "currentColor",
]);

const colorStyle = {
  dark: {
    background: {
      primary: "gray:100",
      secondary: "gray:90",
      tertiary: "gray:80",
      inverted: "gray:10",
      inverse: "gray:10",
      highlighted: "rgba(255, 255, 255, 0.12)",
      selected: "rgba(0, 0, 0, 0.08)",
    },
    color: {
      emphasis: "white:emphasis",
      primary: "white:primary",
      secondary: "white:secondary",
      tertiary: "white:tertiary",
      disabled: "white:disabled",
      success: "green:40",
      info: "blue:40",
      warning: "orange:50",
      error: "red:50",
    },
    divider: "rgba(255, 255, 255, 0.12)",
    text: {
      selection: "blue:60",
      highlight: "#fce79e",
    },
    shadow: {
      thin: "0 2px 8px 0 rgba(0, 0, 0, 0.48), 0 1px 2px 0 rgba(0, 0, 0, 0.16)",
      medium:
        "0 4px 16px 0 rgba(0, 0, 0, 0.48), 0 2px 4px 0 rgba(0, 0, 0, 0.16)",
      thick:
        "0 8px 32px 0 rgba(0, 0, 0, 0.48), 0 4px 8px 0 rgba(0, 0, 0, 0.16)",
    },
  },
  light: {
    background: {
      primary: "white:emphasis",
      secondary: "gray:10",
      tertiary: "gray:20",
      inverted: "gray:70",
      inverse: "gray:70",
      highlighted: "rgba(0, 0, 0, 0.12)",
      selected: "rgba(0, 0, 0, 0.08)",
    },
    color: {
      emphasis: "black:emphasis",
      primary: "black:primary",
      secondary: "black:secondary",
      tertiary: "black:tertiary",
      disabled: "black:disabled",
      success: "green:50",
      info: "blue:60",
      warning: "orange:50",
      error: "red:60",
    },
    divider: "rgba(0, 0, 0, 0.12)",
    text: {
      selection: "blue:60",
      highlight: "#fce79e",
    },
    shadow: {
      thin: "0 2px 8px 0 rgba(0, 0, 0, 0.16), 0 1px 2px 0 rgba(0, 0, 0, 0.08)",
      medium:
        "0 4px 16px 0 rgba(0, 0, 0, 0.16), 0 2px 4px 0 rgba(0, 0, 0, 0.08)",
      thick:
        "0 8px 32px 0 rgba(0, 0, 0, 0.16), 0 4px 8px 0 rgba(0, 0, 0, 0.08)",
    },
  },
};

function deepMerge(target, source) {
  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      target[key] = deepMerge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce use of colorStyle hooks instead of hardcoded color values",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          importSource: { type: "string" },
          colorStyles: { type: "object" },
          ignoredColors: {
            type: "array",
            items: { type: "string" },
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = Object.assign({}, defaultOptions, context.options[0]);
    const mergedColorStyle = deepMerge(
      Object.assign({}, colorStyle),
      options.colorStyles || {},
    );

    function buildColorMap() {
      const map = new Map();
      function add(obj, path = "") {
        for (const [key, value] of Object.entries(obj)) {
          if (typeof value === "string") {
            map.set(value, path + key);
          } else if (
            typeof value === "object" &&
            value !== null &&
            !Array.isArray(value)
          ) {
            add(value, path + key + ".");
          }
        }
      }
      // add(mergedColorStyle.light);
      add(mergedColorStyle.dark);
      return map;
    }

    const colorModeShorthandLookup = buildColorMap();

    // State variables are now local to each Program node
    let hasImport,
      hasHook,
      lastImport,
      currentFunction,
      needsImport,
      needsHook,
      functionNode,
      importInserted,
      hookInserted,
      componentFunctions;

    function resetState() {
      hasImport = false;
      hasHook = false;
      lastImport = null;
      currentFunction = null;
      needsImport = false;
      needsHook = false;
      functionNode = null;
      importInserted = false;
      hookInserted = false;
      componentFunctions = new Set();
    }

    return {
      Program(node) {
        resetState();
        for (const statement of node.body) {
          if (statement.type === "ImportDeclaration") {
            lastImport = statement;
            if (statement.source.value === options.importSource + "/react") {
              hasImport = statement.specifiers.some(
                (s) =>
                  s.imported &&
                  (s.imported.name === "useColorMode" ||
                    s.imported.name === "useColorStyle"),
              );
            }
          }
        }
      },
      FunctionDeclaration(node) {
        currentFunction = node;
        if (node.parent.type === "Program") {
          componentFunctions.add(node);
        }
        checkFunctionForHooks(node);
        needsHook = false;
        hookInserted = false;
      },
      ArrowFunctionExpression(node) {
        if (
          (node.parent?.type === "VariableDeclarator" &&
            node.parent.parent?.type === "VariableDeclaration" &&
            (node.parent.parent.parent?.type === "Program" ||
              node.parent.parent.parent?.type === "ExportNamedDeclaration")) ||
          (node.parent?.type === "CallExpression" &&
            node.parent.callee.name === "memo" &&
            node.parent.parent?.type === "VariableDeclarator" &&
            node.parent.parent.parent?.type === "VariableDeclaration" &&
            (node.parent.parent.parent.parent?.type === "Program" ||
              node.parent.parent.parent.parent?.type ===
                "ExportNamedDeclaration")) ||
          (node.parent?.type === "CallExpression" &&
            node.parent.callee.name === "forwardRef" &&
            node.parent.parent?.type === "VariableDeclarator" &&
            node.parent.parent.parent?.type === "VariableDeclaration" &&
            (node.parent.parent.parent.parent?.type === "Program" ||
              node.parent.parent.parent.parent?.type ===
                "ExportNamedDeclaration"))
        ) {
          componentFunctions.add(node);
          currentFunction = node;
        }
        checkFunctionForHooks(node);
        needsHook = false;
        hookInserted = false;
      },
      JSXElement(node) {
        const componentName =
          node.openingElement.name.type === "JSXIdentifier"
            ? node.openingElement.name.name
            : node.openingElement.name.type === "JSXMemberExpression"
              ? node.openingElement.name.object.name
              : "";

        // Only apply to capitalized components. Not intrinsics.
        if (componentName[0] !== componentName[0].toUpperCase()) {
          return;
        }

        for (const attr of node.openingElement.attributes) {
          if (attr.type === "JSXAttribute" && attr.name.name === "style") {
            // Skip style prop entirely
            continue;
          }
          if (attr.type === "JSXAttribute" && colorProps.has(attr.name.name)) {
            if (attr.value && attr.value.type === "Literal") {
              parseValue(attr, attr.value, attr.name.name);
            } else if (
              attr.value &&
              attr.value.type === "JSXExpressionContainer"
            ) {
              traverseExpression(attr.value.expression, attr.name.name);
            }
          } else if (
            attr.type === "JSXAttribute" &&
            attr.value &&
            attr.value.type === "JSXExpressionContainer"
          ) {
            // Use traverseExpression to catch color strings in objects/spreads
            traverseExpression(
              attr.value.expression,
              attr.name && attr.name.name,
            );
          } else if (attr.type === "JSXSpreadAttribute") {
            // Handle spread attributes like {...(condition && { backgroundColor: "gray:100" })}
            traverseExpression(attr.argument, undefined);
          }
        }
        if (node.children) node.children.forEach(visitExpression);
      },
      JSXFragment(node) {
        node.children.forEach(visitExpression);
      },
    };

    function checkFunctionForHooks(func) {
      if (func.body.type === "BlockStatement") {
        for (const statement of func.body.body) {
          if (statement.type === "VariableDeclaration") {
            for (const declarator of statement.declarations) {
              if (declarator.id.type === "ArrayPattern") {
                for (const element of declarator.id.elements) {
                  if (
                    element &&
                    (element.name === "colorMode" ||
                      element.name === "colorStyle")
                  ) {
                    hasHook = true;
                  }
                }
              }
            }
          }
        }
      }
    }

    function visitExpression(child, propName) {
      if (!child) return;
      if (child.type === "JSXExpressionContainer" && child.expression) {
        visitExpression(child.expression, propName);
      } else if (child.type === "ConditionalExpression") {
        visitExpression(child.consequent, propName);
        visitExpression(child.alternate, propName);
      } else if (child.type === "LogicalExpression") {
        visitExpression(child.left, propName);
        visitExpression(child.right, propName);
      } else if (Array.isArray(child)) {
        child.forEach((c) => visitExpression(c, propName));
      } else if (child.type === "CallExpression") {
        // Do not traverse arguments of function calls - allow dynamic color values
        return;
      } else if (child.type === "ObjectExpression") {
        for (const prop of child.properties) {
          if (prop.type === "Property") {
            let keyName = undefined;
            if (prop.key.type === "Identifier") {
              keyName = prop.key.name;
            } else if (
              prop.key.type === "Literal" &&
              typeof prop.key.value === "string"
            ) {
              keyName = prop.key.value;
            }
            if (colorProps.has(keyName)) {
              visitExpression(prop.value, keyName);
            } else {
              visitExpression(prop.value, undefined);
            }
          } else if (prop.type === "SpreadElement") {
            visitExpression(prop.argument, undefined);
          }
        }
      } else if (
        child.type === "Literal" &&
        typeof child.value === "string" &&
        colorProps.has(propName)
      ) {
        // Only report string literals if in a color prop context
        let colorKey = child.value;
        if (colorShorthandLookup.has(colorKey)) {
          colorKey = colorShorthandLookup.get(colorKey);
        }
        const path = colorModeShorthandLookup.get(colorKey);
        if (path) {
          needsImport = !hasImport;
          needsHook = !hasHook;
          functionNode = currentFunction;
          context.report({
            node: child,
            message: "Use colorStyle hook instead of hardcoded color",
            fix(fixer) {
              const fixes = [];
              const sourceCode = context.getSourceCode();
              const programNode = sourceCode.ast;

              // Skip fixes for arrow functions without block body (lambdas)
              if (
                functionNode &&
                functionNode.type === "ArrowFunctionExpression" &&
                functionNode.body.type !== "BlockStatement"
              ) {
                return [];
              }

              if (needsImport && !importInserted) {
                const insertPoint = lastImport || sourceCode.ast.body[0];
                const insertMethod = lastImport
                  ? "insertTextAfter"
                  : "insertTextBefore";
                const importText = `import { useColorMode, useColorStyle } from '${options.importSource}/react';\n\n`;
                fixes.push(fixer[insertMethod](insertPoint, importText));
                importInserted = true;
              }
              if (
                needsHook &&
                !hookInserted &&
                functionNode &&
                componentFunctions.has(functionNode)
              ) {
                const firstStatement = functionNode.body?.body?.[0];
                if (firstStatement) {
                  const indent = " ".repeat(firstStatement.loc.start.column);
                  const hookText =
                    indent +
                    "const [colorMode] = useColorMode();\n" +
                    indent +
                    "const [colorStyle] = useColorStyle({colorMode});\n\n";
                  fixes.push(fixer.insertTextBefore(firstStatement, hookText));
                } else {
                  const indent = " ".repeat(
                    functionNode.body.loc.start.column + 2,
                  );
                  const hookText =
                    indent +
                    "const [colorMode] = useColorMode();\n" +
                    indent +
                    "const [colorStyle] = useColorStyle({colorMode});\n\n";
                  fixes.push(
                    fixer.insertTextAfter(
                      functionNode.body,
                      "\n" + hookText.trimEnd(),
                    ),
                  );
                }
                hookInserted = true;
              }
              fixes.push(fixer.replaceText(child, `colorStyle.${path}`));
              return fixes;
            },
          });
        } else {
          if (!options.ignoredColors.includes(colorKey)) {
            context.report({
              node: child,
              message: "No known color mode variants for this value",
            });
          }
        }
      }
    }

    function parseValue(attr, attrValue, propName) {
      if (attrValue.type === "Literal" && typeof attrValue.value === "string") {
        // Resolve color alias if present
        let colorKey = attrValue.value;
        if (colorKey === "") return; // Allow empty strings
        if (specialCssValues.has(colorKey)) return; // Allow special CSS values
        if (colorShorthandLookup.has(colorKey)) {
          colorKey = colorShorthandLookup.get(colorKey);
        }
        const path = colorModeShorthandLookup.get(colorKey);
        if (path) {
          needsImport = !hasImport;
          needsHook = !hasHook;
          functionNode = currentFunction;
          context.report({
            node: attrValue,
            message: "Use colorStyle hook instead of hardcoded color",
            fix(fixer) {
              const fixes = [];
              const sourceCode = context.getSourceCode();
              const programNode = sourceCode.ast;

              // Skip fixes for arrow functions without block body (lambdas)
              if (
                functionNode &&
                functionNode.type === "ArrowFunctionExpression" &&
                functionNode.body.type !== "BlockStatement"
              ) {
                return [];
              }

              if (needsImport && !importInserted) {
                const insertPoint = lastImport || sourceCode.ast.body[0];
                const insertMethod = lastImport
                  ? "insertTextAfter"
                  : "insertTextBefore";
                const importText = `import { useColorMode, useColorStyle } from '${options.importSource}/react';\n\n`;
                fixes.push(fixer[insertMethod](insertPoint, importText));
                importInserted = true;
              }
              if (
                needsHook &&
                !hookInserted &&
                functionNode &&
                componentFunctions.has(functionNode)
              ) {
                const firstStatement = functionNode.body?.body?.[0];
                if (firstStatement) {
                  const indent = " ".repeat(firstStatement.loc.start.column);
                  const hookText =
                    indent +
                    "const [colorMode] = useColorMode();\n" +
                    indent +
                    "const [colorStyle] = useColorStyle({colorMode});\n\n";
                  fixes.push(fixer.insertTextBefore(firstStatement, hookText));
                } else {
                  // If function body is empty, insert inside the block
                  const indent = " ".repeat(
                    functionNode.body.loc.start.column + 2,
                  );
                  const hookText =
                    indent +
                    "const [colorMode] = useColorMode();\n" +
                    indent +
                    "const [colorStyle] = useColorStyle({colorMode});\n\n";
                  fixes.push(
                    fixer.insertTextAfter(
                      functionNode.body,
                      "\n" + hookText.trimEnd(),
                    ),
                  );
                }
                hookInserted = true;
              }

              // Always replace the color value
              fixes.push(fixer.replaceText(attrValue, `{colorStyle.${path}}`));

              return fixes;
            },
          });
        } else {
          if (!options.ignoredColors.includes(colorKey)) {
            context.report({
              node: attrValue,
              message: "No known color mode variants for this value",
            });
          }
        }
      }
    }

    // Recursively traverse expressions to find color literals in objects/spreads
    function traverseExpression(expr, parentAttr) {
      if (!expr) return;
      if (expr.type === "ObjectExpression") {
        for (const prop of expr.properties) {
          if (prop.type === "Property") {
            let keyName = undefined;
            if (prop.key.type === "Identifier") {
              keyName = prop.key.name;
            } else if (
              prop.key.type === "Literal" &&
              typeof prop.key.value === "string"
            ) {
              keyName = prop.key.value;
            }
            // Pass the property key as the prop name for recursion
            traverseExpression(prop.value, keyName);
          } else if (prop.type === "SpreadElement") {
            traverseExpression(prop.argument, parentAttr);
          }
        }
      } else if (expr.type === "ConditionalExpression") {
        traverseExpression(expr.consequent, parentAttr);
        traverseExpression(expr.alternate, parentAttr);
      } else if (expr.type === "LogicalExpression") {
        traverseExpression(expr.left, parentAttr);
        traverseExpression(expr.right, parentAttr);
      } else if (expr.type === "CallExpression") {
        // Do not traverse arguments of function calls - allow dynamic color values
        return;
      } else if (expr.type === "Literal" && typeof expr.value === "string") {
        // Resolve color alias if present
        let colorKey = expr.value;
        if (colorKey === "") return; // Allow empty strings
        if (specialCssValues.has(colorKey)) return; // Allow special CSS values
        if (colorShorthandLookup.has(colorKey)) {
          colorKey = colorShorthandLookup.get(colorKey);
        }
        // Check for color value in nested object if parentAttr is a color prop
        const path = colorModeShorthandLookup.get(colorKey);
        if (path && colorProps.has(parentAttr)) {
          needsImport = !hasImport;
          needsHook = !hasHook;
          functionNode = currentFunction;
          context.report({
            node: expr,
            message: "Use colorStyle hook instead of hardcoded color",
            fix(fixer) {
              const fixes = [];
              const sourceCode = context.getSourceCode();
              const programNode = sourceCode.ast;
              if (needsImport && !importInserted) {
                const insertPoint = lastImport || sourceCode.ast.body[0];
                const insertMethod = lastImport
                  ? "insertTextAfter"
                  : "insertTextBefore";
                const importText = `import { useColorMode, useColorStyle } from '${options.importSource}/react';\n\n`;
                fixes.push(fixer[insertMethod](insertPoint, importText));
                importInserted = true;
              }
              // Only add hooks if inside a function
              if (
                needsHook &&
                !hookInserted &&
                functionNode &&
                componentFunctions.has(functionNode)
              ) {
                const firstStatement = functionNode.body?.body?.[0];
                if (firstStatement) {
                  const indent = " ".repeat(firstStatement.loc.start.column);
                  const hookText =
                    indent +
                    "const [colorMode] = useColorMode();\n" +
                    indent +
                    "const [colorStyle] = useColorStyle({colorMode});\n\n";
                  fixes.push(fixer.insertTextBefore(firstStatement, hookText));
                } else {
                  // If function body is empty, insert inside the block
                  const indent = " ".repeat(
                    functionNode.body.loc.start.column + 2,
                  );
                  const hookText =
                    indent +
                    "const [colorMode] = useColorMode();\n" +
                    indent +
                    "const [colorStyle] = useColorStyle({colorMode});\n\n";
                  fixes.push(
                    fixer.insertTextAfter(
                      functionNode.body,
                      "\n" + hookText.trimEnd(),
                    ),
                  );
                }
                hookInserted = true;
              }
              fixes.push(fixer.replaceText(expr, `colorStyle.${path}`));
              return fixes;
            },
          });
        } else if (colorProps.has(parentAttr)) {
          if (!options.ignoredColors.includes(colorKey)) {
            context.report({
              node: expr,
              message: "No known color mode variants for this value",
            });
          }
        }
      }
    }
  },
};
