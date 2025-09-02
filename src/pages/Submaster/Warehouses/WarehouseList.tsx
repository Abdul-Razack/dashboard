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
import { HiOutlineSearch, HiOutlineXCircle } from 'react-icons/hi';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/DataTable';
import { FieldInput } from '@/components/FieldInput';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { WarehouseDataColumn } from '@/services/submaster/warehouse/schema';
import { useWarehouseIndex } from '@/services/submaster/warehouse/services';

const WarehouseList = () => {
  const [queryParams, setQueryParams] = useState({});
  const navigate = useNavigate();

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
  
  const {
    data: listData,
    isLoading: listLoading,
  } = useWarehouseIndex(queryParams);
  // const listData = useWarehouseIndex(queryParams);
  const data = listData?.items ?? [];

  const columnHelper = createColumnHelper<WarehouseDataColumn>();

  const columns = [
    columnHelper.accessor('id', {
      cell: (info) => info.getValue(),
      header: 'ID No',
    }),
    columnHelper.accessor('name', {
      cell: (info) => info.getValue(),
      header: 'Name',
    }),
    columnHelper.accessor('consignee_name', {
      cell: (info) => info.getValue(),
      header: 'Consignee Name',
    }),
    columnHelper.accessor('phone', {
      cell: (info) => info.getValue(),
      header: () => 'Phone',
    }),
    columnHelper.accessor('email', {
      cell: (info) => info.getValue(),
      header: () => 'Email',
    }),
    columnHelper.accessor('city', {
      cell: (info) => info.getValue(),
      header: 'City',
    }),
    columnHelper.accessor('state', {
      cell: (info) => info.getValue(),
      header: 'State',
    }),
    columnHelper.accessor('zip_code', {
      cell: (info) => info.getValue(),
      header: 'Zip Code',
    }),

    columnHelper.accessor('actions', {
      cell: (info) => {
        return (
          <HStack spacing={4} justify={'flex-end'}>
            <IconButton
              aria-label="View"
              icon={<ViewIcon />}
              size={'sm'}
              onClick={() =>
                navigate(`/submaster/warehouse/${info.row.original.id}`)
              }
            />
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size={'sm'}
              onClick={() =>
                navigate(`/submaster/warehouse/${info.row.original.id}/edit`)
              }
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

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Warehouses
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/submaster/warehouse/create')}
          >
            Add New Warehouse
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
                        <FieldInput
                          name="name"
                          placeholder="Enter Name"
                          w={{ base: 'full', md: '20%' }}
                        />
                        <FieldInput
                          name="phone"
                          placeholder="Enter Phone"
                          w={{ base: 'full', md: '20%' }}
                          type="phone-number"
                          maxLength={15}
                        />

                        <FieldInput
                          name="email"
                          placeholder="Enter Email"
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
                            // setQueryParams({});
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
            <FieldInput
              name="name"
              placeholder="Enter Name"
              w={{ base: 'full', md: '20%' }}
            />

            <FieldInput
              name="phone"
              placeholder="Enter Phone"
              w={{ base: 'full', md: '20%' }}
            />

            <FieldInput
              name="email"
              placeholder="Enter Email"
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
                form.reset();
                // setQueryParams({});
              }}
            >
              Clear
            </Button>
          </Stack>
        </Formiz>

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
              Warehouse List
            </Heading>
          </HStack>
          <DataTable
            columns={columns}
            data={data}
            loading={listLoading}
          />
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default WarehouseList;
