const shorthandsRule = require("./enforce-shorthands");
const colorModeRule = require("./enforce-color-mode");

const plugin = {
    rules: { "enforce-shorthands": shorthandsRule,
        "enforce-color-mode": colorModeRule}, configs: {
        recommended: {
            plugins: ["tonic-ui-react"], rules: {
                "tonic-ui-react/enforce-shorthands": 1,
                "tonic-ui-react/enforce-color-mode": 1,

            },
        },
    }, meta: {
        name: "eslint-plugin-tonic-ui-react", version: "0.5.0",
    },
};

module.exports = plugin;
