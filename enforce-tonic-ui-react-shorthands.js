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
} = require("./alias-maps");
const getLiteralPropValue = require("jsx-ast-utils/getLiteralPropValue");

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
                const componentName = node.openingElement.name.name;
                if (componentName[0] === componentName[0].toUpperCase()) {
                    for (const it of node.openingElement.attributes) {
                        if (spacingProps.has(it.name.name)) {
                            const propValue = getLiteralPropValue(it);
                            checkNumericOrPxOrRemValue(node, it, spacingValues, propValue);
                        }
                        if (it.name.name === "lineHeight") {
                            const propValue = getLiteralPropValue(it);
                            checkNumericOrPxOrRemValue(node, it, lineHeightValues, propValue);
                        }
                        if (it.name.name === "fontWeight") {
                            const propValue = getLiteralPropValue(it);
                            checkForNumberOrStringNumberValue(node, it, fontWeightValues, propValue);
                        }
                        if (colorProps.has(it.name.name)) {
                            const propValue = getLiteralPropValue(it);
                            checkForAlias(node, it, colorAliases, propValue);
                        }
                        if (fontSizeProperties.has(it.name.name)) {
                            const propValue = getLiteralPropValue(it);
                            checkNumericOrPxOrRemValue(node, it, fontSizeValues, propValue);
                        }
                        if (it.name.name === "zIndex") {
                            const propValue = getLiteralPropValue(it);
                            checkForNumberOrStringNumberValue(node, it, zIndexValues, propValue);
                        }
                    }
                }
            },
        };

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


