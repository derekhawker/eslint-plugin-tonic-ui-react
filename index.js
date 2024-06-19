const shorthandsRule = require("./enforce-shorthands");

const plugin = {
    rules: { "enforce-shorthands": shorthandsRule }, configs: {
        recommended: {
            plugins: ["tonic-ui-react"], rules: {
                "tonic-ui-react/enforce-shorthands": 1,
            },
        },
    }, meta: {
        name: "eslint-plugin-tonic-ui-react", version: "0.4.0",
    },
};

module.exports = plugin;

