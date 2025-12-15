const tonicComponentNames = new Set(["Accordion", "AccordionBody", "AccordionCollapse", "AccordionContent", "AccordionHeader", "AccordionItem", "AccordionToggle", "AccordionToggleIcon", "Alert", "AlertCloseButton", "AlertIcon", "AlertMessage", "Badge", "Box", "Button", "ButtonBase", "ButtonGroup", "ButtonLink", "CSSBaseline", "Checkbox", "CheckboxGroup", "Code", "Collapse", "ColorModeProvider", "ColorStyleProvider", "ControlBox", "DarkMode", "Divider", "Drawer", "DrawerBody", "DrawerCloseButton", "DrawerContainer", "DrawerContent", "DrawerFooter", "DrawerHeader", "DrawerOverlay", "Fade", "FlatButton", "Flex", "Grid", "Grow", "Icon", "Image", "Input", "InputAdornment", "InputBase", "InputControl", "InputGroup", "InputGroupAddon", "InputGroupAppend", "InputGroupPrepend", "InvertedMode", "LightMode", "LinearProgress", "Link", "LinkButton", "Menu", "MenuButton", "MenuContent", "MenuDivider", "MenuGroup", "MenuItem", "MenuList", "MenuToggle", "MenuToggleIcon", "Modal", "ModalBody", "ModalCloseButton", "ModalContainer", "ModalContent", "ModalFooter", "ModalHeader", "ModalOverlay", "Option", "OptionGroup", "OverflowTooltip", "Pagination", "PaginationItem", "Popover", "PopoverArrow", "PopoverBody", "PopoverContent", "PopoverFooter", "PopoverHeader", "PopoverTrigger", "Popper", "PopperArrow", "Portal", "PortalManager", "PseudoBox", "Radio", "RadioGroup", "ResizeHandle", "SVGIcon", "Scale", "Scrollbar", "SearchInput", "Select", "Skeleton", "Slide", "Space", "Spinner", "Stack", "Submenu", "SubmenuContent", "SubmenuList", "SubmenuToggle", "Switch", "Tab", "TabList", "TabPanel", "TabPanels", "Table", "TableBody", "TableCell", "TableColumnResizeHandle", "TableHeader", "TableHeaderCell", "TableHeaderRow", "TableRow", "TableScrollbar", "Tabs", "Tag", "TagCloseButton", "Text", "TextLabel", "Textarea", "ThemeProvider", "Toast", "ToastCloseButton", "ToastContainer", "ToastController", "ToastIcon", "ToastManager", "ToastMessage", "ToastProvider", "ToastTransition", "ToggleSwitch", "TonicProvider", "Tooltip", "TooltipArrow", "TooltipContent", "TooltipTrigger", "Tree", "TreeItem", "TreeItemContent", "TreeItemToggle", "TreeItemToggleIcon", "Truncate", "VisuallyHidden", "Zoom",

]);

const sizingProps = new Set(["outlineWidth", "w", "h", "textDecorationThickness", "borderSpacing", "borderInlineStartWidth", "borderInlineEndWidth", "borderInlineWidth", "borderImageWidth", "borderBlockStartWidth", "borderBlockEndWidth", "borderBlockWidth", "borderLeftWidth", "borderBottomWidth", "borderRightWidth", "borderTopWidth"]);

const spacingProps = new Set([...[...sizingProps.keys()], "p", "padding", "paddingX", "px", "paddingY", "py", "paddingBlockEnd", "paddingBlockStart", "paddingBottom", "pb", "paddingInlineEnd", "paddingInlineStart", "paddingLeft", "pl", "paddingRight", "pr", "paddingTop", "pt", "margin", "m", "marginX", "mx", "marginY", "my", "marginBlockEnd", "marginBlockStart", "marginBottom", "mb", "marginInlineEnd", "marginInlineStart", "marginLeft", "ml", "marginRight", "mr", "marginTop", "mt", "gap", "colGap", "rowGap", "backgroundPosition", "backgroundPositionX", "backgroundPositionY", "bgPosition", "bgPositionX", "bgPositionY", "backgroundSize", "minWidth", "minHeight", "maxWidth", "maxHeight", "outlineWidth", "shapeMargin", "textUnderlineOffset", "borderImageSlice", "borderImageOutset"]);

const spacingValues = new Map([[4, "1x"], [8, "2x"], [12, "3x"], [16, "4x"], [20, "5x"], [24, "6x"], [28, "7x"], [32, "8x"], [36, "9x"], [40, "10x"], [44, "11x"], [48, "12x"], [52, "13x"], [56, "14x"], [60, "15x"], [64, "16x"], [68, "17x"], [72, "18x"], [76, "19x"], [80, "20x"], [96, "24x"], [128, "32x"], [160, "40x"], [192, "48x"], [224, "56x"], [256, "64x"]]);

const lineHeightValues = new Map([[18, "xs"], [20, "sm"], [22, "md"], [24, "lg"], [28, "xl"], [32, "2xl"], [36, "3xl"], [40, "4xl"]]);

const fontWeightValues = new Map([[100, "thin"], [200, "extralight"], [300, "light"], [400, "normal"], [500, "medium"], [600, "semibold"], [700, "bold"], [800, "extrabold"], [900, "black"]]);

const colorProps = new Set(["color", "borderColor", "borderLeftColor", "borderTopColor", "borderRightColor", "borderBottomColor", "fill", "stroke", "background", "backgroundColor", "bg", "borderInlineStartColor", "borderInlineEndColor", "borderInlineColor", "borderBlockStartColor", "borderBlockEndColor", "borderBlockColor", "outlineColor", "textDecorationColor"]);

const colorAliases = new Map([["currentColor", "current"], ["#6e0002", "red:100"], ["#9d0003", "red:90"], ["#b80003", "red:80"], ["#d71920", "red:70"], ["#e52630", "red:60"], ["#f24c4f", "red:50"], ["#f46f71", "red:40"], ["#fd999a", "red:30"], ["#fcc3c4", "red:20"], ["#fee1e2", "red:10"], ["#750037", "magenta:100"], ["#960043", "magenta:90"], ["#b3004c", "magenta:80"], ["#ca0455", "magenta:70"], ["#dc1d68", "magenta:60"], ["#e94181", "magenta:50"], ["#f36fa0", "magenta:40"], ["#f9a0c1", "magenta:30"], ["#fcc3d8", "magenta:20"], ["#fee1ec", "magenta:10"], ["#460086", "purple:100"], ["#5300a5", "purple:90"], ["#6304ca", "purple:80"], ["#771ddc", "purple:70"], ["#8f41e9", "purple:60"], ["#ab6ff3", "purple:50"], ["#bb89f6", "purple:40"], ["#cca6f9", "purple:30"], ["#ddc3fc", "purple:20"], ["#eee1fe", "purple:10"], ["#002a7e", "blue:100"], ["#00349d", "blue:90"], ["#003db8", "blue:80"], ["#0547cd", "blue:70"], ["#1e5ede", "blue:60"], ["#578aef", "blue:50"], ["#6f9bf4", "blue:40"], ["#95b7fc", "blue:30"], ["#c3d6fc", "blue:20"], ["#e1ebfe", "blue:10"], ["#003011", "green:100"], ["#00461a", "green:90"], ["#005c24", "green:80"], ["#00712e", "green:70"], ["#008539", "green:60"], ["#00a94f", "green:50"], ["#04c45a", "green:40"], ["#40e884", "green:30"], ["#89f6b2", "green:20"], ["#c3fcd8", "green:10"], ["#004034", "teal:100"], ["#005242", "teal:90"], ["#006451", "teal:80"], ["#00755f", "teal:70"], ["#00866c", "teal:60"], ["#00a584", "teal:50"], ["#04caa1", "teal:40"], ["#41e9c5", "teal:30"], ["#89f6df", "teal:20"], ["#c3fcf0", "teal:10"], ["#003664", "cyan:100"], ["#004575", "cyan:90"], ["#005486", "cyan:80"], ["#006496", "cyan:70"], ["#0075a5", "cyan:60"], ["#0095bf", "cyan:50"], ["#10b4d3", "cyan:40"], ["#41d8e9", "cyan:30"], ["#89f0f6", "cyan:20"], ["#c3f9fc", "cyan:10"], ["#151515", "gray:100"], ["#212121", "gray:90"], ["#303030", "gray:80"], ["#424242", "gray:70"], ["#5e5e5e", "gray:60"], ["#8a8a8a", "gray:50"], ["#adadad", "gray:40"], ["#c9c9c9", "gray:30"], ["#e0e0e0", "gray:20"], ["#f2f2f2", "gray:10"], ["#ff7633", "orange:50"], ["#faba2a", "yellow:50"], ["rgba(255, 255, 255, 1.0)", "white:emphasis"], ["rgba(255, 255, 255, .92)", "white:primary"], ["rgba(255, 255, 255, .60)", "white:secondary"], ["rgba(255, 255, 255, .47)", "white:tertiary"], ["rgba(255, 255, 255, .28)", "white:disabled"], ["rgba(0, 0, 0, 1.0)", "black:emphasis"], ["rgba(0, 0, 0, .92)", "black:primary"], ["rgba(0, 0, 0, .65)", "black:secondary"], ["rgba(0, 0, 0, .54)", "black:tertiary"], ["rgba(0, 0, 0, .30)", "black:disabled"]]);

const fontSizeProperties = new Set(["font", "fontSize"]);

const fontSizeValues = new Map([[12, "xs"], [14, "sm"], [16, "md"], [18, "lg"], [20, "xl"], [24, "2xl"], [28, "3xl"], [32, "4xl"]]);

const zIndexValues = new Map([[-1, "hide"], ["auto", "auto"], [0, "base"], [1000, "dropdown"], [1100, "sticky"], [1200, "fixed"], [1300, "overlay"], [1400, "drawer"], [1500, "modal"], [1600, "popover"], [1700, "toast"], [1800, "tooltip"]]);

const breakpoints = new Set(["sm", "md", "lg", "xl", "2xl"]);

const radiiProps = new Set(["borderRadius", "borderTopLeftRadius", "borderTopRightRadius", "borderBottomLeftRadius", "borderBottomRightRadius", "borderEndEndRadius", "borderEndStartRadius", "borderStartEndRadius", "borderStartStartRadius"]);

const radiiValues = new Map([[3, "sm"], [6, "md"], [12, "lg"]]);

const borderProps = new Set(["border", "borderTop", "borderLeft", "borderBottom", "borderRight"]);

const responsiveProps = new Set(["sm", "md", "lg", "xl", "2xl"]);

module.exports = {
    lineHeightValues,
    spacingValues,
    colorAliases,
    colorProps,
    tonicComponentNames,
    spacingProps,
    fontWeightValues,
    fontSizeProperties,
    fontSizeValues,
    zIndexValues,
    breakpoints,
    radiiProps,
    radiiValues,
    borderProps,
    responsiveProps,
};
