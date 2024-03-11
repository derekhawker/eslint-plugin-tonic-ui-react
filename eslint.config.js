// eslint.config.js
"use strict";

// Import the ESLint plugin locally
const eslintPluginExample = require("./eslint-plugin-example");
const react = require('eslint-plugin-react');
const globals = require('globals');
module.exports = [
    {
        files: ["**/*.js"],
        // Using the eslint-plugin-example plugin defined locally
        plugins: {"example": eslintPluginExample,react},
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
            "example/enforce-foo-bar": "error",
        },
    }
]
