const { RuleTester } = require("eslint");
const colorModeRule = require("./enforce-color-mode");

const parserOptions = {
    ecmaVersion: 2018, sourceType: "module", ecmaFeatures: {
        jsx: true,
    },
};

const ruleTester = new RuleTester({ parserOptions });

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run("enforce-color-mode", // rule name
    colorModeRule, // rule code
    { // checks
        // 'valid' checks cases that should pass
        valid: ([{
            code: `import { useColorMode, useColorStyle } from '@tonic-one/react';

function MyComponent() {
  const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle();

  return <Box background={colorStyle.background.primary} color={colorStyle.color.emphasis} />;
}`,
        }, {
            code: "<div background=\"notacolor\" />",
        }]), // 'invalid' checks cases that should not pass
        invalid: ([{
            code: `function MyComponent() {
  return <Box background="gray:100" color="white:emphasis" />;
}`,
            output: `import { useColorMode, useColorStyle } from '@tonic-one/react';

function MyComponent() {
  const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle();

return <Box background={colorStyle.background.primary} color={colorStyle.color.emphasis} />;
}`,
            errors: 2,
        },
            {
                code: `import { useColorMode, useColorStyle } from '@tonic-one/react';

function MyComponent() {
  const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle();

return <Box backgroundColor="gray:20" color={colorStyle.color.emphasis} />;
}`,
                output: `import { useColorMode, useColorStyle } from '@tonic-one/react';

function MyComponent() {
  const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle();

return <Box backgroundColor={colorStyle.background.tertiary} color={colorStyle.color.emphasis} />;
}`,
                errors: 1,
            }]),
    });

