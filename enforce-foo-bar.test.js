// enforce-foo-bar.test.js
const { RuleTester } = require("eslint");
const fooBarRule = require("./enforce-foo-bar");

const parserOptions = {
    ecmaVersion: 2018,
    sourceType: "module",
    ecmaFeatures: {
        jsx: true,
    },
};

const ruleTester = new RuleTester({ parserOptions });

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
    "enforce-foo-bar", // rule name
    fooBarRule, // rule code
    { // checks
        // 'valid' checks cases that should pass
        valid: ([{
            code: "<Box padding='4x'/>",
        }]),
        // 'invalid' checks cases that should not pass
        invalid: ([
            {
                code: "<Box padding=\"4px\" p=\".25rem\" p={4} />",
                output: "<Box padding=\"1x\" p=\"1x\" p=\"1x\" />",
                errors: 3,
            },
            {
                code: "<Box lineHeight=\"22px\" lineHeight=\"1.25rem\" lineHeight={22} />",
                output: "<Box lineHeight=\"md\" lineHeight=\"sm\" lineHeight=\"md\" />",
                errors: 3,
            },
            {
                code: "<Text fontWeight=\"200\" fontWeight={100}/>",
                output: "<Text fontWeight=\"extralight\" fontWeight=\"thin\"/>",
                errors:2,
            }]),
    },
);

console.log("All tests passed!");
