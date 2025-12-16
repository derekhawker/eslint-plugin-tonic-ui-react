export const tableFixture =`
const Table = (props) => {
    const [colorMode] = useColorMode();
    return (
        <Stack {...componentContainerStyle}>
            <Flex ref={refContainer} {...containerStyle}>
                {tableWidth.current.currWidth === 0 ? null : (
                    <TonicTable layout="flexbox" size="md" {...tableStyle} {...tableProps}>
                        <ScrollbarWrapper
                            {...(layout === 'static' && {
                                sx: {
                                    // Prevents the vertical scrollbar from becoming hidden by header. This cuts it off making it a misleading indicator
                                    '[data-scrollbar-track="vertical"]': { top: 36 },
                                },
                                scrollTop: lastScrollTopRef.current,
                                height: '100%',
                                overflow: 'visible',
                                onUpdate: (values) => {
                                    lastScrollTopRef.current = values.scrollTop;
                                },
                            })}
                        >
                            <TonicTableHeader
                                ref={refHeader}
                                minWidth={0}
                                zIndex="1" // Small z nudge that puts header above table rows when using position:sticky
                                minHeight="0"
                                width="fit-content"
                                {...(layout !== 'inline' && {
                                    position: 'sticky',
                                    top: '0',
                                    backgroundColor: 'gray:100',
                                })}
                                {...tableHeaderProps}
                                style={{
                                    ...(isLoading && layout === 'inline' && { marginBottom: '96px' }),
                                }}
                            >
                                {table.getHeaderGroups().map((headerGroup) => (
                                    <TonicTableRow key={headerGroup.id}>
                                        {headerGroup.headers.map((header) => {
                                            return (
                                                <TonicTableCell
                                                    key={header.id}
                                                    display="flex"
                                                    flexDirection="column"
                                                    justifyContent="flex-end"
                                                    userSelect="none" // Disable text selection because it can be triggered accidentally by clicking the header
                                                    _hover={{
                                                        ...(header.column.getCanSort() && { backgroundColor: '#303030' }),
                                                    }}
                                                    tabIndex={header.column.getCanSort() ? 0 : undefined}
                                                    style={{
                                                        minWidth: 0, // default 'auto' value is unsafe value when we want to clip content
                                                        width: header.getSize(),
                                                        cursor: header.column.getCanSort() ? 'pointer' : 'default',
                                                    }}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                    onKeyDown={(e) => {
                                                        if (e?.key === 'Enter' && header.column.getCanSort()) {
                                                            e.stopPropagation();
                                                            header.column.toggleSorting();
                                                        }
                                                    }}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        <Flex
                                                            alignItems="center"
                                                            style={{
                                                                ...(header.column.columnDef.meta?.align && {
                                                                    alignSelf: flexAlignSelfAlias[header.column.columnDef.meta.align],
                                                                }),
                                                                ...(header.column.getIsSorted() ? { color: 'white:primary' } : {}),
                                                            }}
                                                        >
                                                            {typeof header.column.columnDef.header === 'string' ? (
                                                                <MultilineTruncateWithTooltip
                                                                    color={header.column.getIsSorted() ? 'white:primary' : undefined}
                                                                    lineLimit="2"
                                                                >
                                                                    {flexRender(
                                                                        header.column.columnDef.header,
                                                                        header.getContext()
                                                                    )?.toString() ?? ''}
                                                                </MultilineTruncateWithTooltip>
                                                            ) : (
                                                                 flexRender(header.column.columnDef.header, header.getContext())
                                                             )}
                                                            <ColumnSortIcon
                                                                isSorted={header.column.getIsSorted()}
                                                                canSort={header.column.getCanSort()}
                                                                alignSelf="flex-end"
                                                                color="white:primary"
                                                            />
                                                        </Flex>
                                                    )}
                                                </TonicTableCell>
                                            );
                                        })}
                                    </TonicTableRow>
                                ))}
                            </TonicTableHeader>
                        </ScrollbarWrapper>
                    </TonicTable>
                )}
            </Flex>
        </Stack>
    );
};
`
