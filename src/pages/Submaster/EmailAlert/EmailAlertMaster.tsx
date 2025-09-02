import { useEffect, useState } from 'react';

import { EditIcon } from '@chakra-ui/icons';
import {
  Box,
  HStack,
  Heading,
  IconButton,
  Link,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';

import { DataTable } from '@/components/DataTable';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import { SlideIn } from '@/components/SlideIn';
import UpdateModal from '@/pages/Submaster/EmailAlert/UpdateModal';
import { dataColumn } from '@/services/email-alert/schema';
import { useEmailAlertIndex } from '@/services/email-alert/services';

export const EmailAlertMaster = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [queryParams, setQueryParams] = useState<TODO>({
    page: 1,
    per_page: itemsPerPage,
    search: '',
  });
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState<boolean>(false);
  const { data: listData, isLoading: listDataLoading } =
    useEmailAlertIndex(queryParams);
  const [emailList, setEmailList] = useState<TODO>([]);
  const [selectedData, setSelectedData] = useState<TODO>({});

  useEffect(() => {
    if (listData && listData.data) {
      const emailData = listData.data.flatMap((item: TODO) => ({
        ...item,
        emails: item.departments,
      }));
      setEmailList(emailData);
    }
  }, [listData]);

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  const openUpdateModal = (data: TODO) => {
    console.log(data);
    let obj: TODO = data;
    obj.department_ids = data.departments.map(
      (department: any) => department.id
    );
    setIsUpdateModalOpen(true);
    setSelectedData(data);
  };

  const columnHelper = createColumnHelper<dataColumn>();
  const columns = [
    columnHelper.accessor('id', {
      cell: (info) => info.getValue(),
      header: 'ID No',
    }),
    columnHelper.accessor('key', {
      cell: (info) => info.getValue(),
      header: 'Key',
    }),
    columnHelper.accessor('subject', {
      cell: (info) => info.getValue(),
      header: 'Subject',
    }),
    columnHelper.accessor('departments', {
      cell: (info) => {
        return (
          <UnorderedList styleType="none" m={0}>
            {info.getValue().map((item, index) => {
              return (
                <ListItem key={index}>
                  <Text>{item.name}</Text>
                </ListItem>
              );
            })}
          </UnorderedList>
        );
      },
      header: 'Departments',
    }),
    columnHelper.accessor('emails', {
      cell: (info) => {
        return (
          <UnorderedList styleType="none" m={0}>
            {info.getValue().map((item, index) => {
              const emails = item.emails
                .split(',')
                .map((email) => email.trim());

              return (
                <ListItem key={index}>
                  {emails.map((email, emailIndex) => (
                    <Link
                      key={`${index}_${emailIndex}`}
                      href={`mailto:${email}`}
                      color="blue.500"
                      isExternal
                      display="block"
                      mb={1}
                    >
                      {email}
                    </Link>
                  ))}
                </ListItem>
              );
            })}
          </UnorderedList>
        );
      },
      header: 'Email',
    }),
    columnHelper.accessor('actions', {
      cell: (info) => {
        return (
          <HStack justify={'flex-end'}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size={'sm'}
              onClick={() => openUpdateModal(info.row.original)}
            />
          </HStack>
        );
      },
      header: () => <Text textAlign="end">Actions</Text>,
    }),
  ];

  return (
    <SlideIn>
      <Stack pl={2} spacing={2}>
        <Box borderRadius={4}>
          <HStack
            bg={'white'}
            justify={'space-between'}
            mb={4}
            p={4}
            borderTopRadius={4}
          >
            <Heading as="h4" size={'md'}>
              Email Alert Master
            </Heading>

            <Box ml="auto" display="flex" alignItems="center">
              <PageLimit
                currentLimit={itemsPerPage}
                loading={listDataLoading}
                changeLimit={changePageLimit}
              />
            </Box>
          </HStack>
          <DataTable
            columns={columns}
            data={emailList}
            loading={listDataLoading}
          />
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
        <UpdateModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          existingData={selectedData}
        />
      </Stack>
    </SlideIn>
  );
};

export default EmailAlertMaster;
