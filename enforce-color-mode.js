// enforce-color-mode.js

const { colorProps } = require("./alias-maps");

const defaultOptions = {
  importSource: '@tonic-one/react'
};

const colorStyle = {
  dark: {
    background: {
      primary: 'gray:100',
      secondary: 'gray:90',
      tertiary: 'gray:80',
      inverted: 'gray:10',
      inverse: 'gray:10',
      highlighted: 'rgba(255, 255, 255, 0.12)',
      selected: 'rgba(0, 0, 0, 0.08)',
    },
    color: {
      emphasis: 'white:emphasis',
      primary: 'white:primary',
      secondary: 'white:secondary',
      tertiary: 'white:tertiary',
      disabled: 'white:disabled',
      success: 'green:40',
      info: 'blue:40',
      warning: 'orange:50',
      error: 'red:50',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
    text: {
      selection: 'blue:60',
      highlight: '#fce79e',
    },
    shadow: {
      thin: '0 2px 8px 0 rgba(0, 0, 0, 0.48), 0 1px 2px 0 rgba(0, 0, 0, 0.16)',
      medium: '0 4px 16px 0 rgba(0, 0, 0, 0.48), 0 2px 4px 0 rgba(0, 0, 0, 0.16)',
      thick: '0 8px 32px 0 rgba(0, 0, 0, 0.48), 0 4px 8px 0 rgba(0, 0, 0, 0.16)',
    },
  },
  light: {
    background: {
      primary: 'white:emphasis',
      secondary: 'gray:10',
      tertiary: 'gray:20',
      inverted: 'gray:70',
      inverse: 'gray:70',
      highlighted: 'rgba(0, 0, 0, 0.12)',
      selected: 'rgba(0, 0, 0, 0.08)',
    },
    color: {
      emphasis: 'black:emphasis',
      primary: 'black:primary',
      secondary: 'black:secondary',
      tertiary: 'black:tertiary',
      disabled: 'black:disabled',
      success: 'green:50',
      info: 'blue:60',
      warning: 'orange:50',
      error: 'red:60',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
    text: {
      selection: 'blue:60',
      highlight: '#fce79e',
    },
    shadow: {
      thin: '0 2px 8px 0 rgba(0, 0, 0, 0.16), 0 1px 2px 0 rgba(0, 0, 0, 0.08)',
      medium: '0 4px 16px 0 rgba(0, 0, 0, 0.16), 0 2px 4px 0 rgba(0, 0, 0, 0.08)',
      thick: '0 8px 32px 0 rgba(0, 0, 0, 0.16), 0 4px 8px 0 rgba(0, 0, 0, 0.08)',
    },
  },
};

function buildColorMap() {
  const map = new Map();
  function add(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        map.set(value, path + key);
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        add(value, path + key + '.');
      }
    }
  }
  add(colorStyle.light);
  add(colorStyle.dark);
  return map;
}

const colorValueToPath = buildColorMap();

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce use of colorStyle hooks instead of hardcoded color values",
    },
    fixable: "code",
    schema: [{
      type: 'object',
      properties: {
        importSource: { type: 'string' }
      },
      additionalProperties: false
    }],
  },
  create(context) {
    const options = Object.assign({}, defaultOptions, context.options[0]);
    let hasImport = false;
    let hasHook = false;
    let lastImport = null;
    let currentFunction = null;
    let needsImport = false;
    let needsHook = false;
    let functionNode = null;
    let importInserted = false;
    let hookInserted = false;

    return {
      Program(node) {
        for (const statement of node.body) {
          if (statement.type === 'ImportDeclaration') {
            lastImport = statement;
            if (statement.source.value === options.importSource) {
              hasImport = statement.specifiers.some(s => s.imported && (s.imported.name === 'useColorMode' || s.imported.name === 'useColorStyle'));
            }
          }
        }
      },
      FunctionDeclaration(node) {
        currentFunction = node;
        checkFunctionForHooks(node);
        needsHook = false;
        hookInserted = false;
      },
      ArrowFunctionExpression(node) {
        currentFunction = node;
        checkFunctionForHooks(node);
        needsHook = false;
        hookInserted = false;
      },
      JSXElement(node) {
        for (const attr of node.openingElement.attributes) {
          if (attr.type === 'JSXAttribute' && colorProps.has(attr.name.name)) {
            parseValue(attr, attr.value, attr.name.name);
          }
        }
      },
    };

    function checkFunctionForHooks(func) {
      if (func.body.type === 'BlockStatement') {
        for (const statement of func.body.body) {
          if (statement.type === 'VariableDeclaration') {
            for (const declarator of statement.declarations) {
              if (declarator.id.type === 'ArrayPattern') {
                for (const element of declarator.id.elements) {
                  if (element && element.name === 'colorMode' || element.name === 'colorStyle') {
                    hasHook = true;
                  }
                }
              }
            }
          }
        }
      }
    }

    function parseValue(attr, attrValue, propName) {
      if (attrValue.type === 'Literal' && typeof attrValue.value === 'string') {
        const path = colorValueToPath.get(attrValue.value);
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

              // Add import once per file if needed
              if (needsImport && !importInserted) {
                const insertPoint = lastImport || sourceCode.ast.body[0];
                const insertMethod = lastImport ? 'insertTextAfter' : 'insertTextBefore';
                const importText = 'import { useColorMode, useColorStyle } from \'@tonic-one/react\';\n\n';
                fixes.push(fixer[insertMethod](insertPoint, importText));
                importInserted = true;
              }

              // Add hooks once per function if needed
              if (needsHook && !hookInserted && functionNode) {
                const hookText = 'const [colorMode] = useColorMode();\n  const [colorStyle] = useColorStyle();\n\n';
                const firstStatement = functionNode.body.body[0];
                if (firstStatement) {
                  fixes.push(fixer.insertTextBefore(firstStatement, hookText));
                } else {
                  // If function body is empty, insert inside the block
                  fixes.push(fixer.insertTextAfter(functionNode.body, '\n' + hookText.trimEnd()));
                }
                hookInserted = true;
              }

              // Always replace the color value
              fixes.push(fixer.replaceText(attrValue, `{colorStyle.${path}}`));

              return fixes;
            }
          });
        }
      }
    }
  },
};
