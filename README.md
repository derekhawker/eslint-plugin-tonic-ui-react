To get started, install this plugin

```bash
npm add -D eslint-plugin-tonic-ui-react
```

and add to your eslintrc. A recommended config is provided. Individual rules are listed below.

```text
  extends: ['plugin:tonic-ui-react/recommended'],
```

## Rules

### Enforce use of colorStyle hooks instead of hardcoded color values

```
"tonic-ui-react/enforce-color-mode": "error"
```

This rule enforces the use of `useColorStyle` and `useColorMode` hooks from `@tonic-ui` instead of hardcoded color values. It automatically adds the necessary imports and hook calls, and replaces hardcoded colors with references to the colorStyle object.

#### Options

- `importSource` (string): The import source for the hooks. Defaults to `'@tonic-ui'`.
- `colorStyles` (object): Custom color styles to supplement the base pattern. Should have `light` and `dark` properties, each containing nested objects of color values.

Example:

```jsx
// Before
function MyComponent() {
  return <Box background="gray:100" color="white:emphasis" />;
}

// After
import { useColorMode, useColorStyle } from "@tonic-ui";

function MyComponent() {
  const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle();

  return (
    <Box
      background={colorStyle.background.primary}
      color={colorStyle.color.emphasis}
    />
  );
}
```

With custom colorStyles:

```json
{
  "rules": {
    "tonic-ui-react/enforce-color-mode": [
      "error",
      {
        "colorStyles": {
          "light": {
            "background": {
              "customPrimary": "custom:primary"
            }
          },
          "dark": {
            "background": {
              "customPrimary": "custom:primary"
            }
          }
        }
      }
    ]
  }
}
```

With custom importSource:

```json
{
  "rules": {
    "tonic-ui-react/enforce-color-mode": [
      "error",
      {
        "importSource": "@tonic-one"
      }
    ]
  }
}
```

### Replace CSS px/rem/string values with Tonic-UI shorthand aliases

```
"tonic-ui-react/enforce-shorthands": "error"
```

Several props like margin, border, color, have shorthand values to promote consistency when styling. This rule when run will update those CSS props. Supports eslint auto-fix

Example:

```jsx
<Box padding="4px" p="16rem" p={12} sx={{p:8}}/>
<Text borderColor="rgba(255, 255, 255, 1.0)" background="#005242" backgroundColor="#EeE1fe"/>
```

to

```jsx
<Box padding="1x" p="64x" p="3x" sx={{p:"2x"}}/>
<Text borderColor="white:emphasis" background="teal:90" backgroundColor="purple:10"/>
```

## Useful links for developing

To find out the name and structure of AST used by ESLint https://astexplorer.net/
