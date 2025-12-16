// eslint.config.js
"use strict";

// Import the ESLint plugin locally
const tonicUiReact = require("./eslint-plugin-tonic-ui-react");
const react = require("eslint-plugin-react");
const globals = require("globals");

module.exports = [
    {
        files: ["**/*.js","**/*.jsx"],
        // Using the eslint-plugin-example plugin defined locally
        plugins: { "tonic-ui-react": tonicUiReact, react },
        languageOptions: {
            sourceType: "commonjs",
            ecmaVersion: "latest",
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            "tonic-ui-react/enforce-shorthands": "error",
            "tonic-ui-react/enforce-color-mode": "error",

        },
    },
];
