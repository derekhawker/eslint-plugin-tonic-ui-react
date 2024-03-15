const { RuleTester } = require("eslint");
const tonicUIReactShorthandsRule = require("./enforce-tonic-ui-react-shorthands");

const parserOptions = {
    ecmaVersion: 2018, sourceType: "module", ecmaFeatures: {
        jsx: true,
    },
};

const ruleTester = new RuleTester({ parserOptions });

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run("enforce-shorthands", // rule name
    tonicUIReactShorthandsRule, // rule code
    { // checks
        // 'valid' checks cases that should pass
        valid: ([{
            code: "<Box disabled  padding=\"4x\" p=\"0 4px\" color=\"red\" borderColor=\"#011\" background=\"white:emphasis\" fontSize=\"xl\" style={{padding:\"4px\"}} {...props} />",
        }, {
            code: "<div padding=\"24px\" p=\"4px\" borderColor=\"#005242\" fontSize=\"28px\" fontSize={28} />",
        }, {
            code: "<div style={{ padding:\"4px\", borderColor:\"#005242\", fontSize:\"28px\"}} />",
        }]), // 'invalid' checks cases that should not pass
        invalid: ([{
            code: "<Box padding=\"4px\" p=\"16rem\" p={12} sx={{p:8}}/>",
            output: "<Box padding=\"1x\" p=\"64x\" p=\"3x\" sx={{p:\"2x\"}}/>",
            errors: 4,
        }, {
            code: "<Box lineHeight=\"22px\" lineHeight=\"1.25rem\" lineHeight={22} {...{ lineHeight: 22 }} />",
            output: "<Box lineHeight=\"md\" lineHeight=\"sm\" lineHeight=\"md\" {...{ lineHeight: \"md\" }} />",
            errors: 4,
        }, {
            code: "<Text fontWeight=\"200\" fontWeight={100}/>",
            output: "<Text fontWeight=\"extralight\" fontWeight=\"thin\"/>",
            errors: 2,
        }, {
            code: "<Text borderColor=\"rgba(255, 255, 255, 1.0)\" background=\"#005242\" backgroundColor=\"#EeE1fe\"/>",
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
        }, {
            code: "<CustomComponent borderRadius=\".75rem\" borderRadius=\".1875rem\" />",
            output: "<CustomComponent borderRadius=\"lg\" borderRadius=\"sm\" />",
            errors: 2,
        }, {
            // responsive props
            code: "<Box font={{sm:\"28px\"}} {...{font:{sm:\"1.25rem\"}}} />",
            output: "<Box font={{sm:\"3xl\"}} {...{font:{sm:\"xl\"}}} />",
            errors: 2,
        }, {
            // pseudo props
            code: "<>{true && <Box _hover={{lineHeight:\"22px\"}} {...{_hover:{lineHeight:\"1.25rem\"}}} sx={{_hover:{lineHeight:\"1.25rem\"}}}/>}</>",
            output: "<>{true && <Box _hover={{lineHeight:\"md\"}} {...{_hover:{lineHeight:\"sm\"}}} sx={{_hover:{lineHeight:\"sm\"}}}/>}</>",
            errors: 3,
        }]),
    });

console.log("All tests passed!");
