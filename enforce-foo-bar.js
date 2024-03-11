// enforce-foo-bar.js

const getProp = require("jsx-ast-utils/getProp");
const getLiteralPropValue = require("jsx-ast-utils/getLiteralPropValue");
const tonicComponentNames = new Set(["Button", "Box", "Text"]);
const spacingProps = new Set(["p", "padding"]);
const pxSpacingValues = new Map([
    [4, "1x"],
    [8, "2x"],
    [12, "3x"],
    [16, "4x"],
    [20, "5x"],
    [24, "6x"],
    [28, "7x"],
    [32, "8x"],
    [36, "9x"],
    [40, "10x"],
    [44, "11x"],
    [48, "12x"],
    [52, "13x"],
    [56, "14x"],
    [60, "15x"],
    [64, "16x"],
    [68, "17x"],
    [72, "18x"],
    [76, "19x"],
    [80, "20x"],
    [96, "24x"],
    [128, "32x"],
    [160, "40x"],
    [192, "48x"],
    [224, "56x"],
    [256, "64x"],
]);

const remSpacingValues = new Map([
    [".25rem", "1x"],
    [".5rem", "2x"],
    [".75rem", "3x"],
    ["1rem", "4x"],
    ["1.25rem", "5x"],
    ["1.5rem", "6x"],
    ["1.75rem", "7x"],
    ["2rem", "8x"],
    ["2.25rem", "9x"],
    ["2.5rem", "10x"],
    ["2.75rem", "11x"],
    ["3rem", "12x"],
    ["3.25rem", "13x"],
    ["3.5rem", "14x"],
    ["3.75rem", "15x"],
    ["4rem", "16x"],
    ["4.25rem", "17x"],
    ["4.5rem", "18x"],
    ["4.75rem", "19x"],
    ["5rem", "20x"],
    ["6rem", "24x"],
    ["8rem", "32x"],
    ["0rem", "40x"],
    ["2rem", "48x"],
    ["4rem", "56x"],
    ["6rem", "64x"],
]);
const lineHeights = {
    normal: "normal",
    base: "1.5",
    xs: "1.125rem",
    sm: "1.25rem",
    md: "1.375rem",
    lg: "1.5rem",
    xl: "1.75rem",
    "2xl": "2rem",
    "3xl": "2.25rem",
    "4xl": "2.5rem",
};
const remLineHeights = new Map([
    ["1.125rem", "xs"],
    ["1.25rem", "sm"],
    ["1.375rem", "md"],
    ["1.5rem", "lg"],
    ["1.75rem", "xl"],
    ["2rem", "'2xl'"],
    ["2.25rem", "3xl"],
    ["2.5rem", "4xl"],

]);
const pxLineHeights = new Map([
    [18, "xs"],
    [20, "sm"],
    [22, "md"],
    [24, "lg"],
    [28, "xl"],
    [32, "2xl"],
    [36, "3xl"],
    [40, "4xl"],
]);

const fontWeights = new Map([
    [100, "thin"],
    [200, "extralight"],
    [300, "light"],
    [400, "normal"],
    [500, "medium"],
    [600, "semibold"],
    [700, "bold"],
    [800, "extrabold"],
    [900, "black"],
]);

const optionDefaults = {};

module.exports = {
    meta: {
        type: "problem",
        docs: {
            description: "Enforce that shorthands are used instead of raw px or rem values'.",
        },
        fixable: "code",
        schema: [],
    },
    create(context) {
        const configuration = Object.assign({}, optionDefaults, context.options[0]);

        function checkSpacingValue(node, attribute, value) {
            if (typeof value === "number") {
                if (pxSpacingValues.has(value)) {
                    context.report({
                        node,
                        message: "Spacing name",
                        data: {},
                        fix(fixer) {
                            return fixer.replaceText(attribute.value, `"${pxSpacingValues.get(value)}"`);
                        },
                    });
                }
            }

            if (typeof value === "string") {
                if (value.endsWith("px")) {
                    const numValue = Number(value.substring(0, value.length - 2));
                    if (pxSpacingValues.has(numValue)) {
                        context.report({
                            node,
                            message: "Spacing name",
                            data: {},
                            fix(fixer) {
                                return fixer.replaceText(attribute.value, `"${pxSpacingValues.get(numValue)}"`);
                            },
                        });
                    }
                }
                if (value.endsWith("rem") && remSpacingValues.has(value)) {
                    context.report({
                        node,
                        message: "Spacing name",
                        data: {},
                        fix(fixer) {
                            return fixer.replaceText(attribute.value, `"${remSpacingValues.get(value)}"`);
                        },
                    });
                }
            }
        }

        function checkFontWeightValue(node, attribute, _value) {
            let value = _value;
            if (typeof value == "string") {
                value = Number(value);
                if (Number.isNaN(value)) return;
            }
            if (fontWeights.has(value)) {
                context.report({
                    node,
                    message: "font weight name",
                    data: {},
                    fix(fixer) {
                        return fixer.replaceText(attribute.value, `"${fontWeights.get(value)}"`);
                    },
                });
            }
        }

        function checkLineHeightValue(node, attribute, value) {
            if (typeof value === "number") {
                if (pxLineHeights.has(value)) {
                    context.report({
                        node,
                        message: "Lineheight name",
                        data: {},
                        fix(fixer) {
                            return fixer.replaceText(attribute.value, `"${pxLineHeights.get(value)}"`);
                        },
                    });
                }
            }

            if (typeof value === "string") {
                if (value.endsWith("px")) {
                    const numValue = Number(value.substring(0, value.length - 2));
                    if (pxLineHeights.has(numValue)) {
                        context.report({
                            node,
                            message: "Lineheight name",
                            data: {},
                            fix(fixer) {
                                return fixer.replaceText(attribute.value, `"${pxLineHeights.get(numValue)}"`);
                            },
                        });
                    }
                }
                if (value.endsWith("rem") && remLineHeights.has(value)) {
                    context.report({
                        node,
                        message: "Lineheight name",
                        data: {},
                        fix(fixer) {
                            return fixer.replaceText(attribute.value, `"${remLineHeights.get(value)}"`);
                        },
                    });
                }
            }

        }

        return {
            JSXElement(node) {
                if (!tonicComponentNames.has(node.openingElement.name.name)) {
                    return;
                }

                for (const it of node.openingElement.attributes) {
                    if (spacingProps.has(it.name.name)) {
                        const propValue = getLiteralPropValue(it);
                        checkSpacingValue(node, it, propValue);
                    }
                    if (it.name.name === "lineHeight") {
                        const propValue = getLiteralPropValue(it);
                        checkLineHeightValue(node, it, propValue);
                    }
                    if (it.name.name === "fontWeight") {
                        const propValue = getLiteralPropValue(it);
                        checkFontWeightValue(node, it, propValue);
                    }
                }

                // console.log(node.openingElement.attributes)

                // const typeProp = getProp(node.openingElement.attributes, 'type');
                //
                // if (!typeProp) {
                //     reportMissing(node);
                //     return;
                // }
                //
                // if (typeProp.value && typeProp.value.type === 'JSXExpressionContainer') {
                //     checkExpression(node, typeProp.value.expression);
                //     return;
                // }
                //
                // const propValue = getLiteralPropValue(typeProp);
                // checkValue(node, propValue);
            },
            // Performs action in the function on every variable declarator
            VariableDeclarator(node) {

                // Check if a `const` variable declaration
                if (node.parent.kind === "const") {

                    // Check if variable name is `foo`
                    if (node.id.type === "Identifier" && node.id.name === "foo") {

                        // Check if value of variable is "bar"
                        if (node.init && node.init.type === "Literal" && node.init.value !== "bar") {

                            /*
                             * Report error to ESLint. Error message uses
                             * a message placeholder to include the incorrect value
                             * in the error message.
                             * Also includes a `fix(fixer)` function that replaces
                             * any values assigned to `const foo` with "bar".
                             */
                            context.report({
                                node,
                                message: "Value other than \"bar\" assigned to `const foo`. Unexpected value: {{ notBar }}.",
                                data: {
                                    notBar: node.init.value,
                                },
                                fix(fixer) {
                                    return fixer.replaceText(node.init, "\"bar\"");
                                },
                            });
                        }
                    }
                }
            },
        };
    },
};


