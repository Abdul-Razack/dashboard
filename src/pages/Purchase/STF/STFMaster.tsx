import { useState } from 'react';

import { EditIcon, ViewIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  HStack,
  Heading,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { HiOutlineSearch, HiOutlineXCircle } from 'react-icons/hi';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/DataTable';
import { FieldSelect } from '@/components/FieldSelect';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { usePurchaseOrderList } from '@/services/purchase/purchase-orders/services';
import { STFDataColumn } from '@/services/purchase/stf/schema';
import { useSTFIndex } from '@/services/purchase/stf/services';

const STFMaster = () => {
  const navigate = useNavigate();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [queryParams, setQueryParams] = useState<TODO>({
    page: 1,
    per_page: itemsPerPage,
  });

  const poList = usePurchaseOrderList();
  const poOptions = transformToSelectOptions(poList.data);

  const form = useForm({
    onValidSubmit: (values) => {
      setQueryParams({ search: values });
    },
  });

  const mobileForm = useForm({
    onValidSubmit: (values) => {
      setQueryParams({ search: values });
    },
  });

  const { data: listData, isLoading: listLoading } = useSTFIndex(queryParams);
  const data = listData?.data ?? [];

  const columnHelper = createColumnHelper<STFDataColumn>();

  const columns = [
    columnHelper.accessor('id', {
      cell: (info) => info.getValue(),
      header: 'STF ID',
    }),
    columnHelper.accessor('sft_number', {
      cell: (info) => info.getValue(),
      header: 'STF Number',
    }),
    columnHelper.accessor('created_at', {
      cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
      header: 'Created At',
    }),
    columnHelper.accessor('awb_number', {
      cell: (info) => info.getValue(),
      header: 'AWB Number',
    }),
    columnHelper.accessor('logistic_request_id', {
      cell: (info) => info.getValue(),
      header: 'Logistic Request ID',
    }),
    columnHelper.accessor('actions', {
      cell: (info) => {
        return (
          <HStack spacing={4} justify={'flex-end'}>
            <IconButton
              aria-label="View"
              icon={<ViewIcon />}
              size={'sm'}
              onClick={() => navigate(`/purchase/stf/${info.row.original.id}`)}
            />
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size={'sm'}
              onClick={() =>
                navigate(`/purchase/stf/${info.row.original.id}/edit`)
              }
              isDisabled
            />
            {/* <IconButton aria-label="Delete" icon={<DeleteIcon />} size={'sm'} /> */}
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

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            STF Master
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/purchase/stf/add/new')}
          >
            Add STF
          </ResponsiveIconButton>
        </HStack>

        <Formiz autoForm connect={mobileForm}>
          <Box width="100%" mt={2} display={{ base: 'flex', md: 'none' }}>
            <Accordion defaultIndex={[]} allowToggle w={'100%'}>
              <AccordionItem border="none">
                {({ isExpanded }) => (
                  <>
                    <AccordionButton
                      px={4}
                      py={2}
                      bg="white"
                      borderRadius="md"
                      _expanded={{
                        bg: 'white',
                        borderBottomEndRadius: 0,
                        borderBottomStartRadius: 0,
                      }}
                      width="100%"
                    >
                      <Box flex="1" textAlign="left">
                        Filter Options
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel p={0}>
                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        bg={'white'}
                        p={6}
                        borderRadius={4}
                        spacing={4}
                        align={'flex-start'}
                        justify={'flex-start'}
                      >
                        <FieldSelect
                          name={'purchase_order_id'}
                          required={'Purchase Order ID is required'}
                          placeholder="Select Quotation ID"
                          options={poOptions}
                          w={{ base: 'full', md: '20%' }}
                        />

                        <Button
                          type="submit"
                          variant="@primary"
                          w={{ base: 'full', md: 'auto' }}
                          leftIcon={<HiOutlineSearch />}
                        >
                          Search
                        </Button>

                        <Button
                          type="reset"
                          bg={'gray.200'}
                          leftIcon={<HiOutlineXCircle />}
                          w={{ base: 'full', md: 'auto' }}
                          onClick={() => {
                            mobileForm.reset();
                            setQueryParams({});
                          }}
                        >
                          Clear
                        </Button>
                      </Stack>
                    </AccordionPanel>
                    {!isExpanded && (
                      <Box display={{ md: 'none' }} p={6}>
                        {/* Placeholder box to maintain space when accordion is collapsed */}
                      </Box>
                    )}
                  </>
                )}
              </AccordionItem>
            </Accordion>
          </Box>
        </Formiz>

        <Formiz autoForm connect={form}>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            display={{ base: 'none', md: 'flex' }}
            bg={'white'}
            p={6}
            borderRadius={4}
            spacing={4}
            align={'flex-start'}
            justify={'flex-start'}
            mt={2}
          >
            <FieldSelect
              name={'purchase_order_id'}
              required={'Purchase Order ID is required'}
              placeholder="Select Quotation ID"
              options={poOptions}
              w={{ base: 'full', md: '20%' }}
            />

            <Button
              type="submit"
              variant="@primary"
              w={{ base: 'full', md: 'auto' }}
              leftIcon={<HiOutlineSearch />}
            >
              Search
            </Button>

            <Button
              type="reset"
              bg={'gray.200'}
              leftIcon={<HiOutlineXCircle />}
              w={{ base: 'full', md: 'auto' }}
              onClick={() => {
                mobileForm.reset();
                setQueryParams({});
              }}
            >
              Clear
            </Button>
          </Stack>
        </Formiz>

        <Box borderRadius={4}>
          <HStack
            bg={'white'}
            justify={'space-between'}
            mb={4}
            p={4}
            borderTopRadius={4}
          >
            <Heading as="h4" size={'md'}>
              STF List
            </Heading>

            <Box ml="auto" display="flex" alignItems="center">
              <PageLimit
                currentLimit={itemsPerPage}
                loading={listLoading}
                changeLimit={changePageLimit}
              />
            </Box>
          </HStack>

          <DataTable columns={columns} data={data} loading={listLoading} />
          <Box p={4} mt={4} display="flex" justifyContent="space-between">
            {listData && listData?.total > 0 && (
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

export default STFMaster;
