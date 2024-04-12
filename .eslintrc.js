// eslint.config.js
"use strict";

// Import the ESLint plugin locally
const tonicUiReact = require("./index");
// const globals = require("globals");

module.exports = {
    extends: [tonicUiReact],
    // Using the eslint-plugin-example plugin defined locally
    plugins: ["react"],
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
    },
    //     languageOptions: {
    //         sourceType: "commonjs",
    //         ecmaVersion: "latest",
    // ,
    //         globals: {
    //             ...globals.browser,
    //         },
    //     },
    rules: {
        "tonic-ui-react/enforce-shorthands": "error",
    },
};
