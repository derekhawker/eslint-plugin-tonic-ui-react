// enforce-foo-bar.test.js
const { RuleTester } = require("eslint");
const fooBarRule = require("./enforce-tonic-ui-react-shorthands");

const parserOptions = {
    ecmaVersion: 2018, sourceType: "module", ecmaFeatures: {
        jsx: true,
    },
};

const ruleTester = new RuleTester({ parserOptions });

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run("enforce-foo-bar", // rule name
    fooBarRule, // rule code
    { // checks
        // 'valid' checks cases that should pass
        valid: ([{
            code: "<Box padding=\"4x\" p=\"0 4px\" color=\"red\" borderColor=\"#011\" background=\"white:emphasis\" fontSize=\"xl\" />",
        }, {
            code: "<div padding=\"24px\" p=\"4px\" borderColor=\"#005242\" fontSize=\"28px\" fontSize={28} />",
        }]), // 'invalid' checks cases that should not pass
        invalid: ([{
            code: "<Box padding=\"4px\" p=\"16rem\" p={12} />",
            output: "<Box padding=\"1x\" p=\"64x\" p=\"3x\" />",
            errors: 3,
        }, {
            code: "<Box lineHeight=\"22px\" lineHeight=\"1.25rem\" lineHeight={22} />",
            output: "<Box lineHeight=\"md\" lineHeight=\"sm\" lineHeight=\"md\" />",
            errors: 3,
        }, {
            code: "<Text fontWeight=\"200\" fontWeight={100}/>",
            output: "<Text fontWeight=\"extralight\" fontWeight=\"thin\"/>",
            errors: 2,
        }, {
            code: "<Text borderColor=\"rgba(255, 255, 255, 1.0)\" background=\"#005242\" backgroundColor=\"#eee1fe\"/>",
            output: "<Text borderColor=\"white:emphasis\" background=\"teal:90\" backgroundColor=\"purple:10\"/>",
            errors: 3,
        }, {
            code: "<Flex fontSize=\"28px\" font=\"1.25rem\" fontSize={28} />",
            output: "<Flex fontSize=\"3xl\" font=\"xl\" fontSize=\"3xl\" />",
            errors: 3,
        }, {
            code: "<Stack zIndex=\"1700\" zIndex={1000}  />",
            output: "<Stack zIndex=\"toast\" zIndex=\"dropdown\"  />",
            errors: 2,
        }]),
    });

console.log("All tests passed!");
