const { RuleTester } = require("eslint");
const tonicUIReactShorthandsRule = require("./enforce-shorthands");

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
  "enforce-shorthands", // rule name
  tonicUIReactShorthandsRule, // rule code
  {
    // checks
    // 'valid' checks cases that should pass
    valid: [
      {
        name: "valid: mixed valid shorthands and non-shorthands",
        code: '<Box disabled  padding="4x" p="0 4px" color="red" borderColor="#011" background="white:emphasis" fontSize="xl" style={{padding:"4px"}} {...props} />',
      },
      {
        name: "valid: non-shorthand values on div",
        code: '<div padding="24px" p="4px" borderColor="#005242" fontSize="28px" fontSize={28} />',
      },
      {
        name: "valid: style object with non-shorthand values",
        code: '<div style={{ padding:"4px", borderColor:"#005242", fontSize:"28px"}} />',
      },
      {
        name: "valid: size prop on Flex component",
        code: '<Flex size="28px" />', // size prop only available on Text component
      },
      {
        name: "valid: border as number/object",
        code: "<div border={1} border={{xs:1}} {...{border:1}} />",
      },
      {
        name: "valid: unknown color value(1)",
        code: '<Box background="gray:40" borderColor="gray:40" color="gray:40" />',
        options: [{ onlyAllowKnownAliases: true }],
      },
      {
        name: "valid: background with linear-gradient",
        code: `<Box background="linear-gradient(0deg, rgba(119, 29, 220, 0.40) 11.58%, rgba(215, 25, 32, 0.00) 58.61%)" />`,
        output: `<Box background="linear-gradient(0deg, rgba(119, 29, 220, 0.40) 11.58%, rgba(215, 25, 32, 0.00) 58.61%)" />`,
        options: [{ onlyAllowKnownAliases: true }],
      },
      {
        name: "valid: special CSS values",
        code: '<Box color="unset" background="inherit" borderColor="initial" backgroundColor="transparent" fill="currentColor" />',
      },
    ], // 'invalid' checks cases that should not pass
    invalid: [
      {
        name: "invalid: padding shorthands",
        code: '<Box padding="4px" p="16rem" p={12} sx={{p:8}}/>',
        output: '<Box padding="1x" p="64x" p="3x" sx={{p:"2x"}}/>',
        errors: 4,
      },
      {
        name: "invalid: height and width shorthands",
        code: '<Box h="4px" w={{md:8}}/>',
        output: '<Box h="1x" w={{md:"2x"}}/>',
        errors: 2,
      },
      {
        name: "invalid: lineHeight shorthands",
        code: '<Box lineHeight="22px" lineHeight="1.25rem" lineHeight={22} {...{ lineHeight: 22 }} />',
        output:
          '<Box lineHeight="md" lineHeight="sm" lineHeight="md" {...{ lineHeight: "md" }} />',
        errors: 4,
      },
      {
        name: "invalid: fontWeight shorthands",
        code: '<Text fontWeight="200" fontWeight={100}/>',
        output: '<Text fontWeight="extralight" fontWeight="thin"/>',
        errors: 2,
      },
      {
        name: "invalid: color shorthands",
        code: '<Text borderColor="rgba(255, 255, 255, 1.0)" background="#005  242" backgroundColor="#EeE1fe" bg="#EeE1fe"/>',
        output:
          '<Text borderColor="white:emphasis" background="teal:90" backgroundColor="purple:10" bg="purple:10"/>',
        errors: 4,
      },
      {
        name: "invalid: fontSize shorthands",
        code: '<Flex fontSize="28px" font="1.25rem" fontSize={28} />',
        output: '<Flex fontSize="3xl" font="xl" fontSize="3xl" />',
        errors: 3,
      },
      {
        name: "invalid: size shorthand on Text",
        code: '<Text size="28px" />',
        output: '<Text size="3xl" />',
        errors: 1,
      },
      {
        name: "invalid: zIndex shorthands",
        code: '<Stack zIndex="1700" zIndex={1000}  />',
        output: '<Stack zIndex="toast" zIndex="dropdown"  />',
        errors: 2,
      },
      {
        name: "invalid: borderRadius shorthands",
        code: '<CustomComponent borderRadius=".75rem" borderRadius=".1875rem" borderTopLeftRadius=".75rem" borderTopRightRadius=".75rem" borderBottomLeftRadius=".75rem" borderBottomRightRadius=".75rem" borderEndEndRadius=".75rem" borderEndStartRadius=".75rem" borderStartEndRadius=".75rem" borderStartStartRadius=".75rem" />',
        output:
          '<CustomComponent borderRadius="lg" borderRadius="sm" borderTopLeftRadius="lg" borderTopRightRadius="lg" borderBottomLeftRadius="lg" borderBottomRightRadius="lg" borderEndEndRadius="lg" borderEndStartRadius="lg" borderStartEndRadius="lg" borderStartStartRadius="lg" />',
        errors: 10,
      },
      {
        name: "invalid: font in ternary",
        code: '<Box font={true?"28px":"24px"} />',
        output: '<Box font={true?"3xl":"2xl"} />',
        errors: 2,
      },
      {
        name: "invalid: font in logical expression",
        code: '<Box font={true && foo?"28px":"24px"} />',
        output: '<Box font={true && foo?"3xl":"2xl"} />',
        errors: 2,
      },
      {
        name: "invalid: font in spread object",
        code: '<Box {...{font:true?"28px":"24px"}} />',
        output: '<Box {...{font:true?"3xl":"2xl"}} />',
        errors: 2,
      },
      {
        // responsive props
        name: "invalid: responsive font props",
        code: '<Box font={{sm:"28px"}} {...{font:{sm:"1.25rem"}}} />',
        output: '<Box font={{sm:"3xl"}} {...{font:{sm:"xl"}}} />',
        errors: 2,
      },
      {
        // pseudo props
        name: "invalid: pseudo props with lineHeight",
        code: '<>{true && <Box _hover={{lineHeight:"22px"}} {...{_hover:{lineHeight:"1.25rem"}}} sx={{_hover:{lineHeight:"1.25rem"}}}/>}</>',
        output:
          '<>{true && <Box _hover={{lineHeight:"md"}} {...{_hover:{lineHeight:"sm"}}} sx={{_hover:{lineHeight:"sm"}}}/>}</>',
        errors: 3,
      },
      {
        name: "invalid: border with color values",
        code: '<Box border="0 solid #5e5e5e" borderTop="0 solid #005242" borderRight="0 solid #5e5e5e" borderBottom="0 solid #005242" borderLeft="0 solid #5e5e5e" border="0" />',
        output:
          '<Box border="0 solid" borderColor="gray:60" borderTop="0 solid" borderTopColor="teal:90" borderRight="0 solid" borderRightColor="gray:60" borderBottom="0 solid" borderBottomColor="teal:90" borderLeft="0 solid" borderLeftColor="gray:60" border="0" />',
        errors: 5,
      },
      {
        name: "invalid: border in ternary",
        code: '<Box border={true?"0 solid #5e5e5e":"none"}  />',
        output:
          '<Box border={true?"0 solid":"none"} borderColor={true?"gray:60":""}  />',
        errors: 1,
      },
      {
        name: "invalid: border in spread object",
        code: '<Box {...{border:true?"0 solid #5e5e5e":""}}  />',
        output:
          '<Box {...{border:true?"0 solid":"", borderColor:true?"gray:60":""}}  />',
        errors: 1,
      },
      {
        name: "invalid: border in logical expression",
        code: '<Box {...{border:true && foo?"0 solid #5e5e5e":"0 solid #005242"}}  />',
        output:
          '<Box {...{border:true && foo?"0 solid":"0 solid", borderColor:true && foo?"gray:60":"teal:90"}}  />',
        errors: 1,
      },
      {
        name: "invalid: border in conditional spread",
        code: '<Box {...{border:foo?"0 solid #5e5e5e":"0 solid #005242"}}  />',
        output:
          '<Box {...{border:foo?"0 solid":"0 solid", borderColor:foo?"gray:60":"teal:90"}}  />',
        errors: 1,
      },
      {
        name: "invalid: border in pseudo spread",
        code: '<Box {...(isTrue && {_active:{border:"0 solid #5e5e5e"}})}  />',
        output:
          '<Box {...(isTrue && {_active:{border:"0 solid", borderColor:"gray:60"}})}  />',
        errors: 1,
      },
      {
        name: "invalid: backgroundColor in hover spread",
        code: "<Box _hover={{...(header.column.getCanSort() && { backgroundColor: '#303030' })}} />",
        output:
          '<Box _hover={{...(header.column.getCanSort() && { backgroundColor: "gray:80" })}} />',
        errors: 1,
      },
      {
        name: "invalid: unknown color value(1)",
        code: '<Box background="notacolor" />',
        options: [{ onlyAllowKnownAliases: true }],
        errors: 1,
      },
      {
        name: "invalid: unknown color value(2)",
        code: '<Box background="#342324" />',
        options: [{ onlyAllowKnownAliases: true }],
        errors: 1,
      },
    ],
  },
);

ruleTester.run(
  "enforce-shorthands", // rule name
  tonicUIReactShorthandsRule, // rule code
  {
    valid: [],
    invalid: [
      {
        name: "unfixable: complex border object in responsive prop",
        code: '<Box border={{sm:true?"0 solid #5e5e5e":"none", lg:"none"}}  />',
        output:
          '<Box border={{sm:true?"0 solid":"none", borderColor:true?"gray:60":"", lg:"none"}}  />',
        errors: 1,
      },
    ],
  },
);
console.log("All tests passed!");
