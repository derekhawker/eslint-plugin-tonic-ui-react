const { RuleTester } = require("eslint");
const colorModeRule = require("./enforce-color-mode");

const parserOptions = {
  ecmaVersion: 2022,
  sourceType: "module",
  ecmaFeatures: {
    jsx: true,
  },
};

const ruleTester = new RuleTester({ parserOptions });

// Throws error if the tests in ruleTester.run() do not pass
ruleTester.run(
  "enforce-color-mode", // rule name
  colorModeRule, // rule code
  {
    // checks
    // 'valid' checks cases that should pass
    valid: [
      {
        name: "valid: uses colorStyle in function",
        code: `import { useColorMode, useColorStyle } from '@tonic-ui/react';

function MyComponent() {
  const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

  return <Box background={colorStyle.background.primary} color={colorStyle.color.emphasis} />;
}`,
      },
      {
        name: "valid: empty value",
        code: `import { useColorMode, useColorStyle } from '@tonic-ui/react';

function MyComponent() {
  const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

  return <Box _hover={{background:""}} color="" />;
}`,
      },
      {
        name: "valid: special CSS values",
        code: '<Box color="unset" background="inherit" borderColor="initial" backgroundColor="transparent" fill="currentColor" />',
      },
      {
        name: "valid: ignored colors",
        code: '<Box color="blue:50" background="teal:40" />',
      },
      {
        name: "valid: color prop with function call",
        code: `function MyComponent() {
  return <Box color={getSeverityColor('high')} />;
}`,
      },
    ], // 'invalid' checks cases that should not pass
    invalid: [
      {
        name: "invalid: direct color string in function",
        code: `function MyComponent() {
  return <Box background="gray:100" color="white:emphasis" />;
}`,
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';

function MyComponent() {
    const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

return <Box background={colorStyle.background.primary} color={colorStyle.color.emphasis} />;
}`,
        errors: 2,
      },
      {
        name: "invalid: color string with import and hooks",
        code: `
import { useColorMode, useColorStyle } from '@tonic-ui/react';

function MyComponent() {
  const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

return <Box backgroundColor="gray:80" color={colorStyle.color.emphasis} />;
}`,
        output: `
import { useColorMode, useColorStyle } from '@tonic-ui/react';

function MyComponent() {
  const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

return <Box backgroundColor={colorStyle.background.tertiary} color={colorStyle.color.emphasis} />;
}`,
        errors: 1,
      },
      {
        name: "invalid: custom color style option",
        code: `
function MyComponent() {
  return <Box background="custom:primary" />;
}`,
        options: [
          {
            colorStyles: {
              light: { background: { customPrimary: "custom:primary" } },
              dark: { background: { customPrimary: "custom:primary" } },
            },
          },
        ],
        output: `
import { useColorMode, useColorStyle } from '@tonic-ui/react';

function MyComponent() {
    const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

return <Box background={colorStyle.background.customPrimary} />;
}`,
        errors: 1,
      },
      {
        name: "invalid: color in ternary in fragment",
        code: `<>{
  typeof foo === 'string' ? (
    <MultilineTruncateWithTooltip
      color={getIsSorted() ? 'white:primary' : undefined}
      lineLimit="2"
    >
    </MultilineTruncateWithTooltip>
  ) : (
    flexRender(header.column.columnDef.header, header.getContext())
  )
}</>`,
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';\n\n<>{
  typeof foo === 'string' ? (
    <MultilineTruncateWithTooltip
      color={getIsSorted() ? colorStyle.color.primary : undefined}
      lineLimit="2"
    >
    </MultilineTruncateWithTooltip>
  ) : (
    flexRender(header.column.columnDef.header, header.getContext())
  )
}</>`,
        errors: 1,
      },
      {
        name: "invalid: color in _hover object (hex)",
        code: "<Box _hover={{...(header.column.getCanSort() && { backgroundColor: '#303030' })}} />",
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';

<Box _hover={{...(header.column.getCanSort() && { backgroundColor: colorStyle.background.tertiary })}} />`,
        errors: 1,
      },
      {
        name: "invalid: color in _hover object (token)",
        code: "<Box _hover={{...(header.column.getCanSort() && { backgroundColor: 'gray:80' })}} />",
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';

<Box _hover={{...(header.column.getCanSort() && { backgroundColor: colorStyle.background.tertiary })}} />`,
        errors: 1,
      },
      {
        name: "invalid: complex destructuring in JSX attribute",
        code: `<TonicTableHeader
ref={refHeader}
minWidth={0}
zIndex="1" // Small z nudge that puts header above table rows when using position:sticky
minHeight="0"
width="fit-content"
{...(layout !== "inline" && {
position: "sticky",
top: "0",
backgroundColor: "gray:100",
})} />;`,
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';\n\n<TonicTableHeader\nref={refHeader}\nminWidth={0}\nzIndex=\"1\" // Small z nudge that puts header above table rows when using position:sticky\nminHeight=\"0\"\nwidth=\"fit-content\"\n{...(layout !== \"inline\" && {\nposition: \"sticky\",\ntop: \"0\",\nbackgroundColor: colorStyle.background.primary,\n})} />;`,
        errors: 1,
      },
      {
        name: "invalid: color in map over products",
        code: `<>{Object.keys(products).map((productName) => (
        <Box key={productName}>
          <Text color="white:secondary">
            {productName}
          </Text>
        </Box>
      ))}</>`,
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';\n\n<>{Object.keys(products).map((productName) => (
        <Box key={productName}>
          <Text color={colorStyle.color.secondary}>
            {productName}
          </Text>
        </Box>
      ))}</>`,
        errors: 1,
      },
      {
        name: "invalid: color in DropdownButton component",
        code: `export const DropdownButton = (props) => {
  const { displayValue, title, 'data-track': dataTrack, disabled, ...rest } = props;
  return (
    <MenuButton
      variant="secondary"
      disabled={disabled}
      data-track={dataTrack}
      textAlign="left"
      // Need to target a hidden div that wraps around the label content. Need to modify default value of minWidth('auto') so content doesn't overflow
      sx={{ '> div:first-of-type': { minWidth: 0, flex: 1 } }}
      {...rest}
    >
      <Flex minWidth="0" flex="1">
        <Text color="white:secondary" marginRight="2x">{\`\${title}:\`}</Text>
        <Box minWidth="0" flex="1">
          <TruncateWithTooltip text={displayValue} />
        </Box>
      </Flex>
    </MenuButton>
  );
};`,
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';

export const DropdownButton = (props) => {
    const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

const { displayValue, title, 'data-track': dataTrack, disabled, ...rest } = props;
  return (
    <MenuButton
      variant="secondary"
      disabled={disabled}
      data-track={dataTrack}
      textAlign="left"
      // Need to target a hidden div that wraps around the label content. Need to modify default value of minWidth('auto') so content doesn't overflow
      sx={{ '> div:first-of-type': { minWidth: 0, flex: 1 } }}
      {...rest}
    >
      <Flex minWidth="0" flex="1">
        <Text color={colorStyle.color.secondary} marginRight="2x">{\`\${title}:\`}</Text>
        <Box minWidth="0" flex="1">
          <TruncateWithTooltip text={displayValue} />
        </Box>
      </Flex>
    </MenuButton>
  );
};`,
        errors: 1,
      },
      {
        name: "invalid: color in CheckListFilter component",
        code: `const CheckListFilter = (
  props
) => {
  const menuButton =
    variant === 'tag' ? (
      <FilterTag>
      </FilterTag>
    ) : (
      <MenuButton>
        <Flex>
          <Text color="white:secondary"></Text>
        </Flex>
      </MenuButton>
    );

  return (
    <Multiselect>
      {menuButton}
    </Multiselect>
  );
};`,
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';

const CheckListFilter = (
  props
) => {
    const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

const menuButton =
    variant === 'tag' ? (
      <FilterTag>
      </FilterTag>
    ) : (
      <MenuButton>
        <Flex>
          <Text color={colorStyle.color.secondary}></Text>
        </Flex>
      </MenuButton>
    );

  return (
    <Multiselect>
      {menuButton}
    </Multiselect>
  );
};`,
        errors: 1,
      },
      {
        name: "invalid: color in TruncateWithTooltip component",
        code: `const TruncateWithTooltip = memo((props) => {
  return (
    <Box width={width} minWidth="0">
      <Tooltip
        background="gray:80"
        color="white:secondary"
      />
    </Box>
  );
});`,
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';

const TruncateWithTooltip = memo((props) => {
    const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

return (
    <Box width={width} minWidth="0">
      <Tooltip
        background={colorStyle.background.tertiary}
        color={colorStyle.color.secondary}
      />
    </Box>
  );
});`,
        errors: 2,
      },
      {
        name: "invalid: color in MultiselectTree component",
        code: `const MultiselectTree = forwardRef(
  (
    {},
    ref
  ) => {
    return (
      <Menu>
        {children}
        <MenuList>
          <CheckboxGroup value={selected} onChange={onCheckboxGroupChange}>
            {filteredOptions?.map((option, i) => {
              return (
                <MenuItem>
                  {hasChildren && (
                    <Icon
                      color="white:secondary"
                    />
                  )}
                </MenuItem>
              );
            })}
          </CheckboxGroup>
        </MenuList>
      </Menu>
    );
  }
);`,
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';

const MultiselectTree = forwardRef(
  (
    {},
    ref
  ) => {
        const [colorMode] = useColorMode();
    const [colorStyle] = useColorStyle({colorMode});

return (
      <Menu>
        {children}
        <MenuList>
          <CheckboxGroup value={selected} onChange={onCheckboxGroupChange}>
            {filteredOptions?.map((option, i) => {
              return (
                <MenuItem>
                  {hasChildren && (
                    <Icon
                      color={colorStyle.color.secondary}
                    />
                  )}
                </MenuItem>
              );
            })}
          </CheckboxGroup>
        </MenuList>
      </Menu>
    );
  }
);`,
        errors: 1,
      },
      {
        name: "invalid: Unknown dark value for the provided color",
        code: `function MyComponent() {
  return <Box background="gray:20" />;
}`,
        errors: 1,
      },
      {
        name: "invalid: background with linear-gradient",
        code: `<Box background="linear-gradient(0deg, rgba(119, 29, 220, 0.40) 11.58%, rgba(215, 25, 32, 0.00) 58.61%)" />`,
        output: `<Box background="linear-gradient(0deg, rgba(119, 29, 220, 0.40) 11.58%, rgba(215, 25, 32, 0.00) 58.61%)" />`,
        errors: 1,
      },
      {
        name: "lambda component no return",
        errors: 2,
        code: `const ApplicationMenuItem = ({ item}) => (
  <MenuItem
  >
    {item.type && (
      <Tag
        backgroundColor="gray:80"
        color="gray:30"
      />
    )}
  </MenuItem>
);
`,
        output: `const ApplicationMenuItem = ({ item}) => (
  <MenuItem
  >
    {item.type && (
      <Tag
        backgroundColor="gray:80"
        color="gray:30"
      />
    )}
  </MenuItem>
);
`,
      },
      {
        name: "invalid: color in ManageReportsMenu component",
        code: `export const OtherMenu = memo(() => {
  return (
    <Menu>
      <MenuList>
        <MenuGroup
          backgroundColor="gray:100"
        />
      </MenuList>
    </Menu>
  );
});

export const ManageReportsMenu = memo(() => {
  return (
    <Menu>
      <MenuList>
        <MenuGroup
          backgroundColor="gray:90"
        />
      </MenuList>
    </Menu>
  );
});`,
        output: `import { useColorMode, useColorStyle } from '@tonic-ui/react';

export const OtherMenu = memo(() => {
    const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

return (
    <Menu>
      <MenuList>
        <MenuGroup
          backgroundColor={colorStyle.background.primary}
        />
      </MenuList>
    </Menu>
  );
});

export const ManageReportsMenu = memo(() => {
    const [colorMode] = useColorMode();
  const [colorStyle] = useColorStyle({colorMode});

return (
    <Menu>
      <MenuList>
        <MenuGroup
          backgroundColor={colorStyle.background.secondary}
        />
      </MenuList>
    </Menu>
  );
});`,
        errors: 2,
      },
    ],
  },
);
