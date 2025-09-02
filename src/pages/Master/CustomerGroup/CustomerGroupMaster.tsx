import { useState } from 'react';

import { EditIcon, ViewIcon } from '@chakra-ui/icons';
import {
  Box,
  HStack,
  Heading,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/DataTable';
import { TableSearchBox } from '@/components/DataTable/SearchBox';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { CustomerGroupDataColumn } from '@/services/master/group/schema';
import { useCustomerGroupIndex } from '@/services/master/group/services';

const CustomerGroupMaster = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const initialFormData = {
    page: 1,
    per_page: itemsPerPage,
    search: '',
  };

  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const navigate = useNavigate();
  const { data: listData, isLoading: listLoading } =
    useCustomerGroupIndex(queryParams);
  const [refreshKey, setRefreshKey] = useState(0);
  const data = listData?.data ?? [];
  const [sortBy, setSortBy] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const columnHelper = createColumnHelper<CustomerGroupDataColumn>();
  const [searchTerm, setSearchTerm] = useState('');

  const columns = [
    columnHelper.display({
      cell: (info) => {
        return info.row.index + 1;
      },
      header: '#',
      id: 'sNo',
      size: 60,
    }),
    columnHelper.accessor('name', {
      id: 'name',
      header: 'Name',
      cell: (info) => info.getValue(),
      meta: {
        sortable: true,
        //searchable: true,
        sortType: 'string',
      },
    }),
    columnHelper.accessor('user.username', {
      cell: (info) => info.getValue() ?? 'N/A',
      header: 'Created By',
      meta: {
        sortable: true,
        searchable: true,
        sortType: 'string',
      },
    }),
    columnHelper.accessor('created_at', {
      cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
      header: 'Created At',
      id: 'created_at',
      meta: {
        sortable: true,
        sortType: 'date',
      },
    }),

    columnHelper.accessor('actions', {
      cell: (info) => {
        return (
          <HStack>
            <IconButton
              aria-label="View"
              icon={<ViewIcon />}
              size={'sm'}
              onClick={() =>
                navigate(`/customer-group-master/${info.row.original.id}`)
              }
            />
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size={'sm'}
              onClick={() =>
                navigate(`/customer-group-master/${info.row.original.id}/edit`)
              }
            />
          </HStack>
        );
      },
      header: () => <Text textAlign="end">Actions</Text>,
      meta: {
        isNumeric: true,
      },
    }),
  ];

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  const handleSortChange = (columnId: string, direction: 'asc' | 'desc') => {
    setSortBy(columnId);
    setSortDirection(direction);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Contact Group Master
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/customer-group-master/create')}
          >
            Add New customer group
          </ResponsiveIconButton>
        </HStack>

        <Box borderRadius={4}>
          {/* Table goes here */}
          <HStack
            bg={'white'}
            justify={'space-between'}
            mb={4}
            p={4}
            borderTopRadius={4}
          >
            <Heading as="h4" size={'md'}>
              Contact Group List
            </Heading>
            <Box ml="auto" display="flex" alignItems="center">
              <TableSearchBox
                value={searchTerm}
                onChange={setSearchTerm}
                width="100%"
                placeholder={'Search Contact Group'}
              />
              <PageLimit
                currentLimit={itemsPerPage}
                loading={listLoading}
                changeLimit={changePageLimit}
              />
            </Box>
          </HStack>
          <DataTable
            columns={columns}
            data={data}
            loading={listLoading}
            sortBy={sortBy}
            sortDirection={sortDirection}
            onSortChange={handleSortChange}
            searchValue={searchTerm}
            enableClientSideSearch={true}
            key={refreshKey}
          />
          <Box p={4} mt={4} display="flex" justifyContent="space-between">
            {listData?.data && listData?.total > 0 && (
              <Text fontSize="sm" color="gray.500">
                {`Showing ${(listData?.current_page - 1) * itemsPerPage + 1} to ${Math.min(listData?.current_page * itemsPerPage, listData?.total)} of ${listData?.total} records`}
              </Text>
            )}
            <Pagination
              currentPage={listData?.current_page ?? 1}
              totalCount={listData?.total ?? 0}
              pageSize={itemsPerPage}
              onPageChange={(page) => {
                setQueryParams({ ...queryParams, page });
              }}
            />
          </Box>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default CustomerGroupMaster;
