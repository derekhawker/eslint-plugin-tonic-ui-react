// enforce-tonic-ui-react-shorthands.js

const {
    fontWeightValues,
    lineHeightValues,
    spacingValues,
    spacingProps,
    tonicComponentNames,
    colorProps,
    colorAliases,
    fontSizeProperties,
    fontSizeValues,
    zIndexValues,
    breakpoints,
    radiiValues,
} = require("./alias-maps");
const getLiteralPropValue = require("jsx-ast-utils/getLiteralPropValue");
const elementType = require("jsx-ast-utils/elementType");

const optionDefaults = {};

module.exports = {
    meta: {
        type: "problem", docs: {
            description: "Enforce tonic-ui shorthands are used over raw px/rem/color codes.",
        }, fixable: "code", schema: [],
    }, create(context) {
        const configuration = Object.assign({}, optionDefaults, context.options[0]);
        return {
            JSXElement(node) {
                // Checking against only tonic components is too restrictive.
                // if (!tonicComponentNames.has(node.openingElement.name.name)) {
                //     return;
                // }
                const componentName = node.openingElement.name.type === "JSXIdentifier" ? node.openingElement.name.name : node.openingElement.name.type === "JSXMemberExpression" ? node.openingElement.name.object.name : "";

                // Only match on non-intrinsic components
                if (!componentName) {
                    console.log(node.loc, node);
                }

                if (componentName[0] === componentName[0].toUpperCase()) {

                    for (let i = 0; i < node.openingElement.attributes.length-1; i++) {
                         const attr =  node.openingElement.attributes[i];
                         // simple boolean props are null (
if (!attr.value) continue;
                                          if (attr.type === "JSXAttribute") {
                            if (attr.name.name === "style") continue;

                            try {
                                if (attr.value.type === "JSXExpressionContainer" && attr.value.expression.type === "ObjectExpression") {
                                    for (const prop of attr.value.expression.properties) {
                                        handleObjectProperty(node, prop);
                                    }
                                }
                                else {
                                    handleJSXAttribute(node, attr);
                                }
                            }
                            catch (e) {
                                console.log(i, node.loc, attr.type,node);
                                throw e;
                            }
                        }
                        else if (attr.type === "JSXSpreadAttribute") {
                            if (attr.argument.type === "ObjectExpression") {
                                for (const prop of attr.argument.properties) {
                                    handleObjectProperty(node, prop);
                                }
                            }
                        }
                    }
                }
            },
        };

        function checkAliasProps(node, prop, propName) {
            if (spacingProps.has(propName)) {
                const propValue = getObjectValue(prop);
                checkNumericOrPxOrRemValue(node, prop, spacingValues, propValue);
            }
            if (propName === "lineHeight") {
                const propValue = getObjectValue(prop);
                checkNumericOrPxOrRemValue(node, prop, lineHeightValues, propValue);
            }
            if (propName === "fontWeight") {
                const propValue = getObjectValue(prop);
                checkForNumberOrStringNumberValue(node, prop, fontWeightValues, propValue);
            }
            if (colorProps.has(propName)) {
                const propValue = getObjectValue(prop);
                checkForAlias(node, prop, colorAliases, propValue);
            }
            if (fontSizeProperties.has(propName)) {
                const propValue = getObjectValue(prop);
                checkNumericOrPxOrRemValue(node, prop, fontSizeValues, propValue);
            }
            if (propName === "zIndex") {
                const propValue = getObjectValue(prop);
                checkForNumberOrStringNumberValue(node, prop, zIndexValues, propValue);
            }
            if (propName === "borderRadius") {
                const propValue = getObjectValue(prop);
                checkNumericOrPxOrRemValue(node, prop, radiiValues, propValue);
            }
        }

        function handleObjectProperty(node, prop) {
            if (prop.value.type === "ObjectExpression") {
                for (const _prop of prop.value.properties) {
                    handleObjectProperty(node, _prop);
                }
            }

            let propName = prop.key.name || prop.key.value;

            if (breakpoints.has(propName)) {
                // TODO: need a more sane way of grabbing the parent prop. Maybe recurse up parent, but check the type
                if (prop.parent.parent.type === "Property") {
                    propName = prop.parent.parent.key.name;
                }
                else {
                    propName = prop.parent.parent.parent.name.name;
                }
            }
            checkAliasProps(node, prop, propName);
        }

        function handleJSXAttribute(node, attr) {
            let propName = attr.name.name;
            checkAliasProps(node, attr, propName);
        }

        function checkForAlias(node, attribute, values2Alias, value) {
            if (values2Alias.has(value)) {
                context.report({
                    node, message: "Spacing name", data: {}, fix(fixer) {
                        return fixer.replaceText(attribute.value, `"${values2Alias.get(value)}"`);
                    },
                });
            }
        }

        function checkNumericOrPxOrRemValue(node, attribute, values2Alias, value) {
            if (typeof value === "number") {
                checkForAlias(node, attribute, values2Alias, value);
            }
            if (typeof value === "string") {
                if (value.endsWith("px")) {
                    const numValue = Number(value.substring(0, value.length - 2));
                    checkForAlias(node, attribute, values2Alias, numValue);
                }

                if (value.endsWith("rem")) {
                    const numValue = 16 * Number(value.substring(0, value.length - 3));
                    checkForAlias(node, attribute, values2Alias, numValue);
                }
            }
        }

        function checkForNumberOrStringNumberValue(node, attribute, values2Alias, _value) {
            let value = _value;
            if (typeof value == "string") {
                value = Number(value);
                if (Number.isNaN(value)) return;
            }
            checkForAlias(node, attribute, values2Alias, value);
        }
    },
};

function getObjectValue(property) {
    if (property.value.type === "JSXExpressionContainer") {
        return property.value.expression.value;
    }
    else {
        return property.value.value;
    }
}
