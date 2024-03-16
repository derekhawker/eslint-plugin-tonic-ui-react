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
        type: "suggestion", docs: {
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

                if (componentName[0] === componentName[0].toUpperCase()) {

                    for (const attr of node.openingElement.attributes) {
                        parseAttribute(attr, node);
                    }
                }
            },
        };

        function parseValue(node, attr, attrValue) {
            switch (attrValue.type) {
                case "JSXExpressionContainer": {
                    const exprContainer = attrValue.expression;
                    parseValue(node, attr, exprContainer);
                    break;
                }
                case "ObjectExpression":
                    for (const prop of attrValue.properties) {
                        handleObjectProperty(node, prop);
                    }
                    break;
                case "Literal": {
                    let propName = attr.name.name;
                    checkAliasProps(node, attrValue, propName);
                    break;
                }
            }
        }

        function parseAttribute(attr, node) {
            switch (attr.type) {
                case "JSXAttribute":
                    // simple boolean props are null (
                    if (!attr.value && attr.name?.type === "JSXIdentifier") {
                        return;
                    }

                    // Shorthands don't work in style. Skip
                    if (attr.name.name === "style") return;

                    parseValue(node, attr, attr.value);
                    break;

                case "JSXSpreadAttribute":
                    const argument = attr.argument;
                    switch (argument.type) {
                        case "ObjectExpression":
                            for (const prop of argument.properties) {
                                handleObjectProperty(node, prop);
                            }
                            break;
                        case "ConditionalExpression":
                            switch (argument.consequent.type) {

                            }
                            switch (argument.alternate.type) {

                            }
                            break;
                    }
                    break;
            }

        }

        function checkAliasProps(node, prop, propName) {
            if (spacingProps.has(propName)) {
                const propValue = prop.value;
                checkNumericOrPxOrRemValue(node, prop, {
                    message: "Spacing shorthand", values2Alias: spacingValues,
                }, propValue);
            }
            if (propName === "lineHeight") {
                const propValue = prop.value;
                checkNumericOrPxOrRemValue(node, prop, {
                    message: "Line-height shorthand", values2Alias: lineHeightValues,
                }, propValue);
            }
            if (propName === "fontWeight") {
                const propValue = prop.value;
                checkForNumberOrStringNumberValue(node, prop, {
                    message: "Font-weight shorthand", values2Alias: fontWeightValues,
                }, propValue);
            }
            if (colorProps.has(propName)) {
                const propValue = prop.value;
                checkForAlias(node, prop, {
                    message: "Color shorthand", values2Alias: colorAliases,
                }, typeof propValue === "string" ? propValue.toLowerCase() : propValue);
            }
            if (fontSizeProperties.has(propName)) {
                const propValue = prop.value;
                checkNumericOrPxOrRemValue(node, prop, {
                    message: "Font-size shorthand", values2Alias: fontSizeValues,
                }, propValue);
            }
            if (propName === "zIndex") {
                const propValue = prop.value;
                checkForNumberOrStringNumberValue(node, prop, {
                    message: "Z-index shorthand", values2Alias: zIndexValues,
                }, propValue);
            }

            if (propName === "border") {
                const propValue = prop.value;
                const split = propValue.split(" ");
                if (split.length === 3) {
                    const color = colorAliases.get(split[2].toLowerCase());
                    if (color) {
                        context.report({
                            node, message: "Border-color has shorthand", loc: prop.loc, fix(fixer) {
                                return [fixer.replaceText(prop, `"${split[0]} ${split[1]}"`), fixer.insertTextAfter(prop, ` borderColor="${color}"`)];
                            },
                        });
                    }
                }

            }
            if (propName === "borderRadius") {
                const propValue = prop.value;
                checkNumericOrPxOrRemValue(node, prop, {
                    message: "Border-radius shorthand", values2Alias: radiiValues,
                }, propValue);
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
            checkAliasProps(node, prop.value, propName);
        }

        function checkForAlias(node, attribute, { message, values2Alias }, value) {
            if (values2Alias.has(value)) {
                context.report({
                    node, message, loc: attribute.loc, fix(fixer) {
                        return fixer.replaceText(attribute.parent?.type === "JSXExpressionContainer" ? attribute.parent : attribute, `"${values2Alias.get(value)}"`);
                    },
                });
            }
        }

        function checkNumericOrPxOrRemValue(node, attribute, { message, values2Alias }, value) {
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

        function checkForNumberOrStringNumberValue(node, attribute, {
            message, values2Alias,
        }, _value) {
            let value = _value;
            if (typeof value == "string") {
                value = Number(value);
                if (Number.isNaN(value)) return;
            }
            checkForAlias(node, attribute, { message, values2Alias }, value);
        }
    },
};

