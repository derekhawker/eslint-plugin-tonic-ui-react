// eslint-plugin-example.js

const shorthandsRule = require("./enforce-shorthands");
const plugin = { rules: { "enforce-shorthands": shorthandsRule } };
module.exports = plugin;
