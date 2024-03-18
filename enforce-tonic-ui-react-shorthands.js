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

function conditional2Str(test) {
    switch (test.type) {
        case "LogicalExpression":
            return conditional2Str(test.left) + test.operator + conditional2Str(test.right);
        default:
            return test.raw ?? test.name;
    }
}

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

        function parseValue(node, attr, attrValue, propName) {
            switch (attrValue.type) {
                case "JSXExpressionContainer": {
                    const exprContainer = attrValue.expression;
                    parseValue(node, attr, exprContainer, propName);
                    break;
                }
                case "ObjectExpression":
                    for (const prop of attrValue.properties) {
                        parseValue(node, attr, prop, propName);
                    }
                    break;
                case "Property":
                    parseValue(node, attr, attrValue.value, (breakpoints.has(attrValue.key.name)) ? propName : attrValue.key.name);
                    break;
                case "Literal": {
                    checkAliasProps(node, attrValue, propName);
                    break;
                }
                case "ConditionalExpression":
                    parseValue(node, attr, attrValue.consequent, propName);
                    parseValue(node, attr, attrValue.alternate, propName);
                    break;

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

                    parseValue(node, attr, attr.value, attr.name?.name);
                    break;

                case "JSXSpreadAttribute":
                    const argument = attr.argument;
                    parseValue(node, attr, argument, argument.name?.name);

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
                console.log("border", prop);
                // TODO: Haven't fixed the alternate branch of conditional
                const propValue = prop.value;
                if (prop.type === "ConditionalExpression") {

                    const consequentSplit = prop.consequent.value.split(" ");
                    const alternateSplit = prop.alternate.value.split(" ");

                    // We can use the color shorthands by splitting border into border (without color) and borderColor
                    if (consequentSplit.length === 3 || alternateSplit.length == 3) {
                        const consequentColor = consequentSplit.length === 3 ? colorAliases.get(consequentSplit[2].toLowerCase()) : undefined;
                        const alternateColor = alternateSplit.length === 3 ? colorAliases.get(alternateSplit[2].toLowerCase()) : undefined;
                        if (consequentColor || alternateColor) {
                            const consequentStart = consequentSplit.length === 3 ? `"${consequentSplit[0]} ${consequentSplit[1]}"` : prop.consequent.raw;
                            const alternateStart = alternateSplit.length === 3 ? `"${alternateSplit[0]} ${alternateSplit[1]}"` : prop.alternate.raw;
                            console.log(prop);
                            context.report({
                                node,
                                message: "Border-color has shorthand",
                                loc: prop.loc,
                                fix(fixer) {
                                    return [fixer.replaceText(prop.consequent, consequentStart), fixer.replaceText(prop.alternate, alternateStart), fixer.insertTextAfter(prop, `, borderColor:${prop.test.raw ?? prop.test.name}?"${consequentColor ?? prop.consequent.value}":"${alternateColor ?? prop.alternate.value}"`)];
                                },
                            });
                        }
                    }
                }
                else {
                    const consquentSplit = propValue.split(" ");
                    // We can use the color shorthands by splitting border into border (without color) and borderColor
                    if (consquentSplit.length === 3) {
                        const color = colorAliases.get(consquentSplit[2].toLowerCase());
                        if (color) {
                            switch (prop.parent.type) {
                                case "ConditionalExpression":
                                    // Handle case where we found border Inside a conditional. We need to add border color as a duplicate after the conditional
                                    // console.log(prop.parent);
                                    if (prop.parent.parent.type === "JSXExpressionContainer") {
                                        context.report({
                                            node,
                                            message: "Border-color has shorthand",
                                            loc: prop.loc,
                                            fix(fixer) {
                                                return [fixer.replaceText(prop, `"${consquentSplit[0]} ${consquentSplit[1]}"`), fixer.insertTextAfter(prop.parent.parent, ` borderColor={${(conditional2Str(prop.parent.test))}?"${color}":${prop.parent.alternate.raw}}`)];
                                            },
                                        });
                                    }
                                    break;
                                default:
                                    context.report({
                                        node,
                                        message: "Border-color has shorthand",
                                        loc: prop.loc,
                                        fix(fixer) {
                                            return [fixer.replaceText(prop, `"${consquentSplit[0]} ${consquentSplit[1]}"`), fixer.insertTextAfter(prop, ` borderColor="${color}"`)];
                                        },
                                    });
                            }
                        }
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

