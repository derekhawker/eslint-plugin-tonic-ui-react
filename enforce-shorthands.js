// enforce-tonic-ui-react-shorthands.js

const {
  fontWeightValues,
  lineHeightValues,
  spacingValues,
  spacingProps,
  tonicComponentNames,
  colorProps,
  colorShorthandLookup,
  colorShorthandValues,
  fontSizeProperties,
  fontSizeValues,
  zIndexValues,
  breakpoints,
  radiiProps,
  radiiValues,
  borderProps,
} = require("./alias-maps");
const getLiteralPropValue = require("jsx-ast-utils/getLiteralPropValue");
const elementType = require("jsx-ast-utils/elementType");

const optionDefaults = {
  onlyAllowKnownAliases: false,
};

function conditional2Str(test) {
  switch (test.type) {
    case "LogicalExpression":
      return (
        conditional2Str(test.left) +
        " " +
        test.operator +
        " " +
        conditional2Str(test.right)
      );
    default:
      return test.raw ?? test.name;
  }
}

function writeExtraProperty(key, value, isObjectProperty) {
  // Two ways to reach this. A object property needs to be added. Or a JSX property is being added.
  // Need a comma for object properties
  return isObjectProperty ? `, ${key}:"${value}"` : ` ${key}="${value}"`;
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforce tonic-ui shorthands are used over raw px/rem/color codes.",
    },
    fixable: "code",
    schema: [
      {
        type: "object",
        properties: {
          onlyAllowKnownAliases: { type: "boolean" },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const configuration = Object.assign({}, optionDefaults, context.options[0]);

    return {
      JSXElement(node) {
        // Checking against only tonic components is too restrictive.
        // if (!tonicComponentNames.has(node.openingElement.name.name)) {
        //     return;
        // }
        const componentName =
          node.openingElement.name.type === "JSXIdentifier"
            ? node.openingElement.name.name
            : node.openingElement.name.type === "JSXMemberExpression"
              ? node.openingElement.name.object.name
              : "";

        // Only apply to capitalized components. Not intrinsics.
        // TODO: This rule gets applied to any components. Could be dangerous by also helps because we support transforms on wrapper components
        if (componentName[0] === componentName[0].toUpperCase()) {
          for (const attr of node.openingElement.attributes) {
            parseAttribute(componentName.toLowerCase(), attr, node);
          }
        }
      },
    };

    function parseValue(componentName, node, attr, attrValue, propName) {
      switch (attrValue.type) {
        case "JSXExpressionContainer": {
          const exprContainer = attrValue.expression;
          if (
            borderProps.has(propName) &&
            exprContainer.type === "ConditionalExpression"
          ) {
            if (parseBorderShorthand(node, attr, propName, exprContainer, true))
              break;
          } else {
            parseValue(componentName, node, attr, exprContainer, propName);
          }
          break;
        }
        case "ObjectExpression":
          for (const prop of attrValue.properties) {
            parseValue(componentName, node, attr, prop, propName);
          }
          break;
        case "Property":
          const pName = breakpoints.has(attrValue.key.name)
            ? propName
            : attrValue.key.name;
          if (borderProps.has(pName)) {
            if (parseBorderShorthand(node, attr, propName, attrValue.value))
              break;
          }
          parseValue(componentName, node, attr, attrValue.value, pName);

          break;
        case "Literal": {
          checkAliasProps(componentName, node, attrValue, propName);
          break;
        }
        case "LogicalExpression": {
          parseValue(componentName, node, attr, attrValue.left, propName);
          parseValue(componentName, node, attr, attrValue.right, propName);
          break;
        }
        case "ConditionalExpression": {
          parseValue(componentName, node, attr, attrValue.consequent, propName);
          parseValue(componentName, node, attr, attrValue.alternate, propName);
          break;
        }
        case "SpreadElement": {
          parseValue(componentName, node, attr, attrValue.argument, propName);
          break;
        }
      }
    }

    function parseAttribute(componentName, attr, node) {
      switch (attr.type) {
        case "JSXAttribute":
          // simple boolean props are null (
          if (!attr.value && attr.name?.type === "JSXIdentifier") {
            return;
          }

          // Shorthands don't work in style. Don't even try
          if (attr.name.name === "style") return;

          parseValue(componentName, node, attr, attr.value, attr.name?.name);
          break;

        case "JSXSpreadAttribute":
          const argument = attr.argument;
          parseValue(componentName, node, attr, argument, argument.name?.name);

          break;
      }
    }

    function checkAliasProps(componentName, node, prop, propName) {
      if (spacingProps.has(propName)) {
        const propValue = prop.value;
        checkNumericOrPxOrRemValue(
          node,
          prop,
          {
            message: `Spacing shorthand`,
            values2Alias: spacingValues,
          },
          propValue,
        );
      }
      if (propName === "lineHeight") {
        const propValue = prop.value;
        checkNumericOrPxOrRemValue(
          node,
          prop,
          {
            message: "Line-height shorthand",
            values2Alias: lineHeightValues,
          },
          propValue,
        );
      }
      if (propName === "fontWeight") {
        const propValue = prop.value;
        checkForNumberOrStringNumberValue(
          node,
          prop,
          {
            message: "Font-weight shorthand",
            values2Alias: fontWeightValues,
          },
          propValue,
        );
      }
      if (colorProps.has(propName)) {
        const propValue = prop.value.replaceAll(" ", "");
        if (colorShorthandValues.has(propValue)) return;

        // Check if background is something like linear-gradient or other hard to parse thing
        let isComplexBackground =
          (propName === "background" || propName === "bg") &&
          propValue.includes("(");
        checkForAlias(
          node,
          prop,
          {
            message: "Color shorthand",
            values2Alias: colorShorthandLookup,
            reportIfNotFound: isComplexBackground
              ? false
              : configuration.onlyAllowKnownAliases,
          },
          typeof propValue === "string" ? propValue.toLowerCase() : propValue,
        );
      }

      if (
        (componentName === "text" && propName === "size") ||
        fontSizeProperties.has(propName)
      ) {
        const propValue = prop.value;
        checkNumericOrPxOrRemValue(
          node,
          prop,
          {
            message: "Font-size shorthand",
            values2Alias: fontSizeValues,
          },
          propValue,
        );
      }
      if (propName === "zIndex") {
        const propValue = prop.value;
        checkForNumberOrStringNumberValue(
          node,
          prop,
          {
            message: "Z-index shorthand",
            values2Alias: zIndexValues,
          },
          propValue,
        );
      }

      if (borderProps.has(propName)) {
        if (!parseBorderShorthand(node, prop, propName, prop.parent, true)) {
          const propValues =
            typeof prop.value === "string" ? prop.value.split(" ") : [];

          // We can use the color shorthands by splitting border into border (without color) and borderColor
          if (propValues.length === 3) {
            const color = colorShorthandLookup.get(propValues[2].toLowerCase());
            if (color) {
              context.report({
                node,
                message: `Border-color has shorthand [${color}] `,
                loc: prop.loc,
                fix(fixer) {
                  return [
                    fixer.replaceText(
                      prop,
                      `"${propValues[0]} ${propValues[1]}"`,
                    ),
                    fixer.insertTextAfter(
                      prop,
                      `${writeExtraProperty(`${propName}Color`, `${color}`, prop.parent?.type === "Property")}`,
                    ),
                  ];
                },
              });
            }
          }
        }
      }

      if (radiiProps.has(propName)) {
        const propValue = prop.value;
        checkNumericOrPxOrRemValue(
          node,
          prop,
          {
            message: "Border-radius shorthand",
            values2Alias: radiiValues,
          },
          propValue,
        );
      }
    }

    function parseBorderShorthand(
      node,
      attr,
      propName,
      propValue,
      isJSXExpression,
    ) {
      if (propValue.type === "ConditionalExpression") {
        const consequentSplit =
          typeof propValue.consequent.value === "string"
            ? propValue.consequent.value.split(" ")
            : [];
        const alternateSplit =
          typeof propValue.alternate.value === "string"
            ? propValue.alternate.value.split(" ")
            : [];

        // We can use the color shorthands by splitting border into border (without color) and borderColor
        if (consequentSplit.length === 3 || alternateSplit.length == 3) {
          const consequentColor =
            consequentSplit.length === 3
              ? colorShorthandLookup.get(consequentSplit[2].toLowerCase())
              : undefined;
          const alternateColor =
            alternateSplit.length === 3
              ? colorShorthandLookup.get(alternateSplit[2].toLowerCase())
              : undefined;
          if (consequentColor || alternateColor) {
            const consequentStart =
              consequentSplit.length === 3
                ? `"${consequentSplit[0]} ${consequentSplit[1]}"`
                : propValue.consequent.raw;
            const alternateStart =
              alternateSplit.length === 3
                ? `"${alternateSplit[0]} ${alternateSplit[1]}"`
                : propValue.alternate.raw;
            if (isJSXExpression) {
              context.report({
                node,
                message: `Border-color has shorthand [${consequentColor || alternateColor}] `,
                loc: propValue.loc,
                fix(fixer) {
                  return [
                    fixer.replaceText(propValue.consequent, consequentStart),
                    fixer.replaceText(propValue.alternate, alternateStart),
                    fixer.insertTextAfter(
                      propValue,
                      `} ${propName}Color={${conditional2Str(propValue.test)}?"${consequentColor ?? propValue.consequent.value}":"${alternateColor ?? ""}"`,
                    ),
                  ];
                },
              });
            } else {
              context.report({
                node,
                message: `Border-color has shorthand [${consequentColor || alternateColor}] `,
                loc: propValue.loc,
                fix(fixer) {
                  return [
                    fixer.replaceText(propValue.consequent, consequentStart),
                    fixer.replaceText(propValue.alternate, alternateStart),
                    fixer.insertTextAfter(
                      propValue,
                      `, borderColor:${conditional2Str(propValue.test)}?"${consequentColor ?? propValue.consequent.value}":"${alternateColor ?? ""}"`,
                    ),
                  ];
                },
              });
            }
            return true;
          }
        }
      }
    }

    function checkForAlias(
      node,
      attribute,
      { message, values2Alias, reportIfNotFound = false },
      value,
    ) {
      if (values2Alias.has(value)) {
        context.report({
          node,
          message: `${message} has shorthand [${values2Alias.get(value)}] `,
          loc: attribute.loc,
          fix(fixer) {
            return fixer.replaceText(
              attribute.parent?.type === "JSXExpressionContainer"
                ? attribute.parent
                : attribute,
              `"${values2Alias.get(value)}"`,
            );
          },
        });
      } else if (reportIfNotFound) {
        context.report({
          node,
          message: `${message} must use known aliases only`,
          loc: attribute.loc,
        });
      }
    }

    function checkNumericOrPxOrRemValue(
      node,
      attribute,
      { message, values2Alias },
      value,
    ) {
      if (typeof value === "number") {
        checkForAlias(node, attribute, { message, values2Alias }, value);
      }
      if (typeof value === "string") {
        if (value.endsWith("px")) {
          const numValue = Number(value.substring(0, value.length - 2));
          checkForAlias(node, attribute, { message, values2Alias }, numValue);
        }

        if (value.endsWith("rem")) {
          const numValue = 16 * Number(value.substring(0, value.length - 3));
          checkForAlias(node, attribute, { message, values2Alias }, numValue);
        }
      }
    }

    function checkForNumberOrStringNumberValue(
      node,
      attribute,
      { message, values2Alias },
      _value,
    ) {
      let value = _value;
      if (typeof value == "string") {
        value = Number(value);
        if (Number.isNaN(value)) return;
      }
      checkForAlias(node, attribute, { message, values2Alias }, value);
    }
  },
};
