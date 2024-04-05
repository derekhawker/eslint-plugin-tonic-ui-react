

## Rules
### tonic-ui-react/enforce-shorthands
Several props like margin, border, color, have shorthand values to promote consistency when styling. This rule when run will update CSS props with those values. Supports --fix

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


