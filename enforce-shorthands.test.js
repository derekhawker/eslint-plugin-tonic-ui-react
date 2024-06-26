const { RuleTester } = require("eslint");
const tonicUIReactShorthandsRule = require("./enforce-shorthands");

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
        }, {
            code: "<Flex size=\"28px\" />", // size prop only available on Text component
        }, {
            code: "<div border={1} border={{xs:1}} {...{border:1}} />",
        }]), // 'invalid' checks cases that should not pass
        invalid: ([{
            code: "<Box padding=\"4px\" p=\"16rem\" p={12} sx={{p:8}}/>",
            output: "<Box padding=\"1x\" p=\"64x\" p=\"3x\" sx={{p:\"2x\"}}/>",
            errors: 4,
        }, {
            code: "<Box h=\"4px\" w={{md:8}}/>", output: "<Box h=\"1x\" w={{md:\"2x\"}}/>", errors: 2,
        }, {
            code: "<Box lineHeight=\"22px\" lineHeight=\"1.25rem\" lineHeight={22} {...{ lineHeight: 22 }} />",
            output: "<Box lineHeight=\"md\" lineHeight=\"sm\" lineHeight=\"md\" {...{ lineHeight: \"md\" }} />",
            errors: 4,
        }, {
            code: "<Text fontWeight=\"200\" fontWeight={100}/>",
            output: "<Text fontWeight=\"extralight\" fontWeight=\"thin\"/>",
            errors: 2,
        }, {
            code: "<Text borderColor=\"rgba(255, 255, 255, 1.0)\" background=\"#005242\" backgroundColor=\"#EeE1fe\" bg=\"#EeE1fe\"/>",
            output: "<Text borderColor=\"white:emphasis\" background=\"teal:90\" backgroundColor=\"purple:10\" bg=\"purple:10\"/>",
            errors: 4,
        }, {
            code: "<Flex fontSize=\"28px\" font=\"1.25rem\" fontSize={28} />",
            output: "<Flex fontSize=\"3xl\" font=\"xl\" fontSize=\"3xl\" />",
            errors: 3,
        }, {
            code: "<Text size=\"28px\" />", output: "<Text size=\"3xl\" />", errors: 1,
        }, {
            code: "<Stack zIndex=\"1700\" zIndex={1000}  />",
            output: "<Stack zIndex=\"toast\" zIndex=\"dropdown\"  />",
            errors: 2,
        }, {
            code: "<CustomComponent borderRadius=\".75rem\" borderRadius=\".1875rem\" borderTopLeftRadius=\".75rem\" borderTopRightRadius=\".75rem\" borderBottomLeftRadius=\".75rem\" borderBottomRightRadius=\".75rem\" borderEndEndRadius=\".75rem\" borderEndStartRadius=\".75rem\" borderStartEndRadius=\".75rem\" borderStartStartRadius=\".75rem\" />",
            output: "<CustomComponent borderRadius=\"lg\" borderRadius=\"sm\" borderTopLeftRadius=\"lg\" borderTopRightRadius=\"lg\" borderBottomLeftRadius=\"lg\" borderBottomRightRadius=\"lg\" borderEndEndRadius=\"lg\" borderEndStartRadius=\"lg\" borderStartEndRadius=\"lg\" borderStartStartRadius=\"lg\" />",
            errors: 10,
        }, {
            code: "<Box font={true?\"28px\":\"24px\"} />", output: "<Box font={true?\"3xl\":\"2xl\"} />", errors: 2,
        }, {
            code: "<Box font={true && foo?\"28px\":\"24px\"} />",
            output: "<Box font={true && foo?\"3xl\":\"2xl\"} />",
            errors: 2,
        }, {
            code: "<Box {...{font:true?\"28px\":\"24px\"}} />",
            output: "<Box {...{font:true?\"3xl\":\"2xl\"}} />",
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
        }, {
            code: "<Box border=\"0 solid #5e5e5e\" borderTop=\"0 solid #005242\" borderRight=\"0 solid #5e5e5e\" borderBottom=\"0 solid #005242\" borderLeft=\"0 solid #5e5e5e\" border=\"0\" />",
            output: "<Box border=\"0 solid\" borderColor=\"gray:60\" borderTop=\"0 solid\" borderTopColor=\"teal:90\" borderRight=\"0 solid\" borderRightColor=\"gray:60\" borderBottom=\"0 solid\" borderBottomColor=\"teal:90\" borderLeft=\"0 solid\" borderLeftColor=\"gray:60\" border=\"0\" />",
            errors: 5,
        }, {
            code: "<Box border={true?\"0 solid #5e5e5e\":\"none\"}  />",
            output: "<Box border={true?\"0 solid\":\"none\"} borderColor={true?\"gray:60\":\"\"}  />",
            errors: 1,
        }, {
            code: "<Box {...{border:true?\"0 solid #5e5e5e\":\"\"}}  />",
            output: "<Box {...{border:true?\"0 solid\":\"\", borderColor:true?\"gray:60\":\"\"}}  />",
            errors: 1,
        }, {
            code: "<Box {...{border:true && foo?\"0 solid #5e5e5e\":\"0 solid #005242\"}}  />",
            output: "<Box {...{border:true && foo?\"0 solid\":\"0 solid\", borderColor:true && foo?\"gray:60\":\"teal:90\"}}  />",
            errors: 1,
        }, {
            code: "<Box {...{border:foo?\"0 solid #5e5e5e\":\"0 solid #005242\"}}  />",
            output: "<Box {...{border:foo?\"0 solid\":\"0 solid\", borderColor:foo?\"gray:60\":\"teal:90\"}}  />",
            errors: 1,
        }, {
            code: "<Box {...(isTrue && {_active:{border:\"0 solid #5e5e5e\"}})}  />",
            output: "<Box {...(isTrue && {_active:{border:\"0 solid\", borderColor:\"gray:60\"}})}  />",
            errors: 1,
        }]),
    });

console.log("All tests passed!");
