import { useEffect, useMemo, useState } from 'react';

import {
  Box,
  Center,
  Spinner,
  Table,
  TableContainer,
  TableContainerProps,
  TableProps,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  keyframes,
} from '@chakra-ui/react';
import {
  ColumnDef,
  SortingFn,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  sortingFns,
  useReactTable,
} from '@tanstack/react-table';
import { LuArrowUpDown, LuMoveDown, LuMoveUp } from 'react-icons/lu';

type ColumnMeta = {
  sortable?: boolean;
  isNumeric?: boolean;
  sortParam?: string;
  searchable?: boolean;
  sortType?: 'string' | 'number' | 'timestamp' | 'date';
};

const blink = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0.3; }
  100% { opacity: 1; }
`;

const timestampSort: SortingFn<any> = (rowA, rowB, columnId) => {
  const a = Number(rowA.getValue(columnId));
  const b = Number(rowB.getValue(columnId));
  return a > b ? 1 : a < b ? -1 : 0;
};

const dateSort: SortingFn<any> = (rowA, rowB, columnId) => {
  const a = new Date(rowA.getValue(columnId)).getTime();
  const b = new Date(rowB.getValue(columnId)).getTime();
  return a > b ? 1 : a < b ? -1 : 0;
};

const caseInsensitiveTextSort: SortingFn<any> = (rowA, rowB, columnId) => {
  const a = String(rowA.getValue(columnId) ?? '').trim();
  const b = String(rowB.getValue(columnId) ?? '').trim();

  // For case-insensitive comparison with natural sorting
  return a.localeCompare(b, undefined, {
    sensitivity: 'base',
    numeric: true,
    ignorePunctuation: true,
  });
};

export type DataTableProps<Data extends object> = {
  data: Data[];
  columns: ColumnDef<Data, any>[];
  loading?: boolean;
  containerProps?: TableContainerProps;
  tableProps?: TableProps;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSortChange?: (columnId: string, direction: 'asc' | 'desc') => void;
  searchValue?: string;
  enableClientSideSearch?: boolean;
};

export function DataTable<Data extends object>({
  data,
  columns,
  loading,
  containerProps,
  tableProps,
  sortBy,
  sortDirection,
  onSortChange,
  searchValue = '',
  enableClientSideSearch = false,
}: DataTableProps<Data>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>(
    sortBy ? [{ id: sortBy, desc: sortDirection === 'desc' }] : []
  );

  const processedColumns = useMemo(() => {
    return columns.map((column) => {
      const meta = column.meta as ColumnMeta | undefined;
      const sortType =
        meta?.sortType || (meta?.sortable ? 'string' : undefined);

      if (!sortType) return column;

      let sortingFn: SortingFn<Data> | undefined;

      switch (sortType) {
        case 'timestamp':
          sortingFn = timestampSort;
          break;
        case 'date':
          sortingFn = dateSort;
          break;
        case 'number':
          sortingFn = sortingFns.alphanumeric;
          break;
        case 'string':
        default:
          sortingFn = caseInsensitiveTextSort;
      }

      return {
        ...column,
        sortingFn,
        enableSorting: true,
        // Add this for more consistent sorting
        sortUndefined: 1, // Always sort undefined values last
      } as ColumnDef<Data>;
    });
  }, [columns]);

  const searchableColumns = processedColumns.filter(
    (col) => (col.meta as ColumnMeta)?.searchable
  );

  const globalFuzzyFilter = (
    row: any,
    _columnId: string,
    filterValue: string
  ) => {
    return searchableColumns.some((col) => {
      const columnId = col.id || (col as any).accessorKey;
      const value = row.getValue(columnId);
      return String(value ?? '')
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    });
  };

  const table = useReactTable({
    data,
    columns: processedColumns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: enableClientSideSearch
      ? getFilteredRowModel()
      : undefined,
    getSortedRowModel: enableClientSideSearch ? getSortedRowModel() : undefined,
    manualSorting: !enableClientSideSearch,
    manualFiltering: !enableClientSideSearch,
    globalFilterFn: enableClientSideSearch ? globalFuzzyFilter : undefined,
    onSortingChange: enableClientSideSearch ? setSorting : undefined,
    onGlobalFilterChange: enableClientSideSearch ? setGlobalFilter : undefined,
    state: {
      sorting: enableClientSideSearch
        ? sorting
        : sortBy
          ? [{ id: sortBy, desc: sortDirection === 'desc' }]
          : [],
      globalFilter: enableClientSideSearch ? globalFilter : '',
    },
  });

  useEffect(() => {
    if (enableClientSideSearch) {
      setGlobalFilter(searchValue);
    }
  }, [searchValue, enableClientSideSearch]);

  const handleSort = (columnId: string) => {
    if (enableClientSideSearch) {
      console.log(columnId);
      const column = table.getColumn(columnId);
      if (column?.getCanSort()) {
        column.toggleSorting();
      }
    } else if (onSortChange) {
      const column = processedColumns.find((col) => {
        const colId = (col as any).id;
        const accessorKey = (col as any).accessorKey;
        const sortParam = (col.meta as ColumnMeta)?.sortParam;
        return (
          colId === columnId ||
          accessorKey === columnId ||
          sortParam === columnId
        );
      });

      if (!column) return;

      const meta = (column.meta as ColumnMeta) || {};
      if (!meta.sortable) return;

      const newDirection =
        sortBy === columnId
          ? sortDirection === 'asc'
            ? 'desc'
            : 'asc'
          : 'asc';

      onSortChange(columnId, newDirection);
    }
  };

  if (loading) {
    return (
      <Center p="4">
        <Spinner />
      </Center>
    );
  }

  return (
    <TableContainer
      {...containerProps}
      overflow="auto"
      border="1px"
      borderColor="gray.500"
      boxShadow="md"
      borderTopWidth="0"
    >
      <Table
        {...tableProps}
        size={tableProps?.size || 'sm'}
        bg="#0C2556"
        variant="striped"
      >
        <Thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <Tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const meta = header.column.columnDef.meta as ColumnMeta;
                const sortParam = meta?.sortParam;
                const columnId = header.column.id;
                const isSortable = meta?.sortable === true;
                const isSorted = enableClientSideSearch
                  ? header.column.getIsSorted()
                  : sortBy === (sortParam ?? columnId);
                const currentSortDirection = enableClientSideSearch
                  ? header.column.getIsSorted()
                  : sortBy === (sortParam ?? columnId)
                    ? sortDirection
                    : false;

                return (
                  <Th
                    key={header.id}
                    onClick={
                      isSortable
                        ? () => handleSort(sortParam ?? columnId)
                        : undefined
                    }
                    isNumeric={meta?.isNumeric}
                    whiteSpace="normal"
                    overflowWrap="break-word"
                    color="white"
                    p={4}
                    cursor={isSortable ? 'pointer' : 'default'}
                    position="relative"
                    _hover={{
                      bg: isSortable ? 'blue.700' : undefined,
                    }}
                  >
                    <Box display="flex" alignItems="center">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {isSortable && (
                        <Box
                          ml={2}
                          as="span"
                          display="inline-flex"
                          animation={
                            isSorted ? `${blink} 1s ease-in-out infinite` : ''
                          }
                        >
                          {isSorted ? (
                            currentSortDirection === 'desc' ? (
                              <LuMoveDown
                                aria-label="sorted descending"
                                strokeWidth={4}
                              />
                            ) : (
                              <LuMoveUp
                                aria-label="sorted ascending"
                                strokeWidth={4}
                              />
                            )
                          ) : (
                            <LuArrowUpDown
                              opacity={0.5}
                              aria-label="sortable"
                            />
                          )}
                        </Box>
                      )}
                    </Box>
                  </Th>
                );
              })}
            </Tr>
          ))}
        </Thead>
        <Tbody bg="white">
          {table.getRowModel().rows.map((row) => (
            <Tr key={row.id} _hover={{ bg: 'gray.50' }}>
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as ColumnMeta;
                return (
                  <Td key={cell.id} isNumeric={meta?.isNumeric}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Td>
                );
              })}
            </Tr>
          ))}
          {processedColumns.length > 0 &&
            table.getRowModel().rows.length === 0 && (
              <Tr>
                <Td
                  bg="white!important"
                  colSpan={processedColumns.length}
                  textAlign="center"
                >
                  {searchValue
                    ? 'No matching results found'
                    : 'No items to display'}
                </Td>
              </Tr>
            )}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
