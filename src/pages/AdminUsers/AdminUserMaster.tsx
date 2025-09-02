import { useEffect, useState } from 'react';

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
import { FieldSelect } from '@/components/FieldSelect';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { useDepartmentList } from '@/services/adminuser/department/services';
import { AdminUserDataColumn } from '@/services/adminuser/schema';
import { useAdminUserIndex } from '@/services/adminuser/services';
import { useRoleList } from '@/services/adminuser/userrole/services';
//import { useUserContext } from '@/services/auth/UserContext';
import { useRouterContext } from '@/services/auth/RouteContext';

export const AdminUserMaster = () => {
  //const { userInfo } = useUserContext();
  const { otherPermissions } = useRouterContext();
  const departmentList = useDepartmentList();
  const roleList = useRoleList();
  const departmentOptions = transformToSelectOptions(departmentList?.data);
  const rolesOptions = transformToSelectOptions(roleList?.data);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [queryParams, setQueryParams] = useState<TODO>({
    page: 1,
    per_page: itemsPerPage,
    search: '',
  });
  const navigate = useNavigate();
  const [formKey, setFormKey] = useState(0);
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

  const listData = useAdminUserIndex(queryParams);
  const data = listData.data?.data ?? [];

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  const columnHelper = createColumnHelper<AdminUserDataColumn>();

  const actualColumns = [
    columnHelper.accessor('id', {
      cell: (info) => info.getValue(),
      header: 'S No',
    }),
    columnHelper.accessor('first_name', {
      cell: (info) => info.getValue(),
      header: 'First Name',
    }),
    columnHelper.accessor('last_name', {
      cell: (info) => info.getValue(),
      header: () => 'Last Name',
    }),
    columnHelper.accessor('username', {
      cell: (info) => info.getValue(),
      header: 'User Name',
    }),
    columnHelper.accessor('email', {
      cell: (info) => info.getValue(),
      header: 'Email',
    }),
    columnHelper.accessor('phone', {
      cell: (info) => info.getValue(),
      header: 'Phone',
    }),
    columnHelper.accessor('role.name', {
      cell: (info) => info.getValue(),
      header: 'Role',
    }),
    columnHelper.accessor('department.name', {
      cell: (info) => info.getValue(),
      header: 'Department',
    }),
    columnHelper.accessor('actions', {
      cell: (info) => {
        console.log(otherPermissions);
        return (
          <HStack spacing={4} justify={'flex-end'}>
            <IconButton
              display={
                otherPermissions && otherPermissions?.view === 1
                  ? 'inline-block'
                  : 'none'
              }
              aria-label="View"
              icon={<ViewIcon />}
              size={'sm'}
              onClick={() => navigate(`/admin-users/${info.row.original.id}`)}
            />

            <IconButton
              display={
                otherPermissions && otherPermissions?.update === 1
                  ? 'inline-block'
                  : 'none'
              }
              aria-label="Edit"
              icon={<EditIcon />}
              size={'sm'}
              onClick={() =>
                navigate(`/admin-users/${info.row.original.id}/edit`)
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

  const [columns, setColumns] = useState<TODO>(actualColumns);

  useEffect(() => {
    if (otherPermissions?.view !== 1 && otherPermissions?.update !== 1) {
      const filteredColumns = columns.filter(
        (column: any) => column.accessorKey !== 'actions'
      );
      setColumns(filteredColumns);
    } else {
      setColumns(actualColumns);
    }
  }, [otherPermissions]);

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Admin User Master
          </Heading>
          {otherPermissions?.create == 1 && (
            <ResponsiveIconButton
              variant={'@primary'}
              icon={<LuPlus />}
              size={{ base: 'sm', md: 'md' }}
              onClick={() => navigate('/admin-users/create')}
            >
              Add New Admin
            </ResponsiveIconButton>
          )}
         
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
                          name="keyword"
                          placeholder="Search"
                          w={{ base: 'full', md: '20%' }}
                        />

                        <FieldSelect
                          key={`mobile_dept_${formKey}`}
                          name="department_id"
                          placeholder="Select Department"
                          options={departmentOptions}
                          w={{ base: 'full', md: '20%' }}
                        />

                        <FieldSelect
                          key={`mobile_role_${formKey}`}
                          name="role_id"
                          placeholder="Select User ROle"
                          options={rolesOptions}
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
                            mobileForm.setValues({
                              [`department_id`]: '',
                              [`role_id`]: '',
                            });
                            mobileForm.reset();
                            setQueryParams({}),
                              setFormKey((prevKey) => prevKey + 1);
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
              name="keyword"
              placeholder="Search"
              w={{ base: 'full', md: '20%' }}
            />

            <FieldSelect
              key={`desk_dept_${formKey}`}
              name="department_id"
              placeholder={'Select Department'}
              options={departmentOptions}
              w={{ base: 'full', md: '20%' }}
            />

            <FieldSelect
              key={`desk_role_${formKey}`}
              name="role_id"
              placeholder={'Select User Role'}
              options={rolesOptions}
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
                form.setValues({ [`department_id`]: '', [`role_id`]: '' });
                form.reset();
                setFormKey((prevKey) => prevKey + 1);
                setQueryParams({});
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
              Admin User List
            </Heading>
             <Box ml="auto" display="flex" alignItems="center">
            <PageLimit
              currentLimit={itemsPerPage}
              loading={listData.isLoading}
              changeLimit={changePageLimit}
            />
          </Box>
          </HStack>
          <DataTable
            columns={columns}
            data={data}
            loading={listData.isLoading}
          />
          <Box p={4} mt={4} display="flex" justifyContent="space-between">
            {listData?.data && listData?.data?.total > 0 && (
              <Text fontSize="sm" color="gray.500">
                {`Showing ${listData?.data?.current_page * itemsPerPage - (itemsPerPage - 1)} to ${Math.min(listData?.data?.current_page * itemsPerPage, listData?.data?.total)} of ${listData?.data?.total} records`}
              </Text>
            )}
            <Pagination
              currentPage={listData.data?.current_page ?? 1}
              totalCount={listData.data?.total ?? 0}
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

export default AdminUserMaster;
