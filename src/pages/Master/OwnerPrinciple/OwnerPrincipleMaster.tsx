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
import { HiRefresh } from 'react-icons/hi';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/DataTable';
import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { PrincipleOwnerDataColumn } from '@/services/master/principleowner/schema';
import { usePrincipleOwnerIndex } from '@/services/master/principleowner/services';
import {
  useCustomerList,
  useCustomerListCode,
} from '@/services/master/services';

const OwnerPrincipleMaster = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const initialFormData = {
    page: 1,
    customer_id: '',
    owner: '',
    per_page: itemsPerPage,
    search: '',
  };
  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const [types, setTypes] = useState('one');
  const [formKey, setFormKey] = useState(0);

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  const navigate = useNavigate();

  const form = useForm({
    onValidSubmit: (values) => {
      setQueryParams(values);
    },
  });

  const mobileForm = useForm({
    onValidSubmit: (values) => {
      setQueryParams(values);
    },
  });

  const { data: listData, isLoading: listLoading } =
    usePrincipleOwnerIndex(queryParams);
  const data = listData?.data ?? [];

  const columnHelper = createColumnHelper<PrincipleOwnerDataColumn>();

  const columns = [
    ...(types === 'one'
      ? [
          columnHelper.accessor('customer.business_name', {
            cell: (info) => info.getValue(),
            header: 'Business Name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => info.getValue(),
            header: 'Business Code',
          }),
          columnHelper.accessor('customer.contact_type.name', {
            cell: (info) => info.getValue(),
            header: () => 'Type of Contact',
          }),
          columnHelper.accessor('owner', {
            cell: (info) => info.getValue(),
            header: 'Owner',
          }),
          columnHelper.accessor('phone', {
            cell: (info) => info.getValue(),
            header: 'Phone Number',
          }),
          columnHelper.accessor('email', {
            cell: (info) => info.getValue(),
            header: 'Email',
          }),
        ]
      : []),

    ...(types === 'two'
      ? [
          columnHelper.accessor('customer.code', {
            cell: (info) => info.getValue(),
            header: 'Business Code',
          }),
          columnHelper.accessor('customer.business_name', {
            cell: (info) => info.getValue(),
            header: 'Business Name',
          }),
          columnHelper.accessor('customer.contact_type.name', {
            cell: (info) => info.getValue(),
            header: () => 'Type of Contact',
          }),
          columnHelper.accessor('owner', {
            cell: (info) => info.getValue(),
            header: 'Owner',
          }),
          columnHelper.accessor('phone', {
            cell: (info) => info.getValue(),
            header: 'Phone Number',
          }),
          columnHelper.accessor('email', {
            cell: (info) => info.getValue(),
            header: 'Email',
          }),
        ]
      : []),

    ...(types === 'three'
      ? [
          columnHelper.accessor('owner', {
            cell: (info) => info.getValue(),
            header: 'Owner',
          }),
          columnHelper.accessor('phone', {
            cell: (info) => info.getValue(),
            header: 'Phone Number',
          }),
          columnHelper.accessor('email', {
            cell: (info) => info.getValue(),
            header: 'Email',
          }),
          columnHelper.accessor('customer.business_name', {
            cell: (info) => info.getValue(),
            header: 'Business Name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => info.getValue(),
            header: 'Business Code',
          }),
          columnHelper.accessor('customer.contact_type.name', {
            cell: (info) => info.getValue(),
            header: () => 'Type of Contact',
          }),
        ]
      : []),

    columnHelper.accessor('id_passport_copy', {
      cell: (info) => {
        return (
          <DocumentDownloadButton size={'sm'} url={info.getValue() || ''} />
        );
      },
      header: 'Passport Copy',
    }),

    columnHelper.accessor('remarks', {
      cell: (info) => info.getValue(),
      header: 'Remarks',
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
                navigate(`/principle-of-owner-master/${info.row.original.id}`)
              }
            />
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size={'sm'}
              onClick={() =>
                navigate(
                  `/principle-of-owner-master/${info.row.original.id}/edit`
                )
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

  const customerList = useCustomerList();
  const customerListCode = useCustomerListCode();
  const customerOptions = transformToSelectOptions(customerList?.data);
  const customerCodeOptions = transformToSelectOptions(customerListCode?.data);

  let debounceTimeout: any;
  const handleInputChange = (value: any, field: string, type: string) => {
    const updatedData: any = { ...queryParams };
    updatedData[field] = value;
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      setQueryParams(updatedData);
      setTypes(type);
    }, 500);
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Principal of Owner Master
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/principle-of-owner-master/create')}
          >
            Add New owner principle
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
                          key={`customer_id_${formKey}`}
                          name="customer_id"
                          placeholder="Customer Name"
                          label="Customer Name"
                          w={{ base: 'full', md: '20%' }}
                          size={'sm'}
                          options={customerOptions}
                          onValueChange={(value) =>
                            handleInputChange(value, 'customer_id', 'one')
                          }
                          isClearable={true}
                        />
                        <FieldSelect
                          key={`customer_code_${formKey}`}
                          name="customer_id"
                          placeholder="Customer Code"
                          label="Customer Code"
                          w={{ base: 'full', md: '20%' }}
                          size={'sm'}
                          options={customerCodeOptions}
                          onValueChange={(value) =>
                            handleInputChange(value, 'customer_id', 'two')
                          }
                          isClearable={true}
                        />
                        <FieldInput
                          key={`owner_${formKey}`}
                          name="owner"
                          label="Owner"
                          placeholder="Enter Owner"
                          w={{ base: 'full', md: '20%' }}
                          size={'sm'}
                          onValueChange={(value) =>
                            handleInputChange(value, 'owner', 'three')
                          }
                        />
                        <Button
                          type="reset"
                          variant="@primary"
                          leftIcon={<HiRefresh />}
                          w={{ base: 'full', md: 'auto' }}
                          onClick={() => {
                            mobileForm.reset();
                            setFormKey((prevKey) => prevKey + 1);
                            setQueryParams(initialFormData);
                            setTypes('one');
                          }}
                          size={'sm'}
                        >
                          Reset Form
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
          <Box width="100%" bg={'white'} p={4} borderRadius={4}>
            <Box width="100%" bg={'green.200'} p={4} borderRadius={4}>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                display={{ base: 'none', md: 'flex' }}
                align={'flex-start'}
                justify={'flex-start'}
                mt={2}
                mb={2}
              >
                <FieldSelect
                  key={`customer_id_${formKey}`}
                  name="customer_id"
                  placeholder="Customer Name"
                  label="Customer Name"
                  w={{ base: 'full', md: '20%' }}
                  size={'sm'}
                  options={customerOptions}
                  onValueChange={(value) =>
                    handleInputChange(value, 'customer_id', 'one')
                  }
                  isClearable={true}
                />
                <FieldSelect
                  key={`customer_code_${formKey}`}
                  name="customer_id"
                  label="Customer Code"
                  placeholder="Customer Code"
                  w={{ base: 'full', md: '20%' }}
                  size={'sm'}
                  options={customerCodeOptions}
                  onValueChange={(value) =>
                    handleInputChange(value, 'customer_id', 'two')
                  }
                  isClearable={true}
                />
                <FieldInput
                  key={`owner_${formKey}`}
                  name="owner"
                  label="Owner"
                  placeholder="Enter Owner"
                  w={{ base: 'full', md: '20%' }}
                  size={'sm'}
                  onValueChange={(value) =>
                    handleInputChange(value, 'owner', 'three')
                  }
                />
                <Stack>
                  <Text fontSize="sm">&nbsp;</Text>
                  <Button
                    type="reset"
                    variant="@primary"
                    leftIcon={<HiRefresh />}
                    w={{ base: 'full', md: 'auto' }}
                    onClick={() => {
                      setFormKey((prevKey) => prevKey + 1);
                      form.reset();
                      setQueryParams(initialFormData);
                      setTypes('one');
                    }}
                    size={'sm'}
                  >
                    Reset Form
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
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
              Principal of Owner List
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

export default OwnerPrincipleMaster;
