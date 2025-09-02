import { useState } from 'react';

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
  useDisclosure,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { LuPlus } from 'react-icons/lu';

import { DataTable } from '@/components/DataTable';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useDepartmentIndex } from '@/services/adminuser/department/services';
import { DataColumn } from '@/services/adminuser/schema';

import CreateModal from './DepartmentCreateModal';
import UpdateModal from './DepartmentUpdateModal';

export const DepartmentList = () => {
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selected, setSelected] = useState<{
    id: number | null;
    name: string;
    emails: TODO;
  }>({
    id: null,
    name: '',
    emails: [{ email: '' }],
  });

  const openUpdateModal = (
    itemId: number,
    itemName: string,
    itemEmails: TODO
  ) => {
    setSelected({ id: itemId, name: itemName, emails: itemEmails });
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const itemList = useDepartmentIndex();
  const data = itemList.data?.items ?? [];

  const columnHelper = createColumnHelper<DataColumn>();

  const columns = [
    columnHelper.accessor('id', {
      cell: (info) => info.getValue(),
      header: 'ID',
    }),
    columnHelper.accessor('name', {
      cell: (info) => info.getValue(),
      header: 'Name',
    }),
    columnHelper.accessor('created_at', {
      cell: (info) => format(new Date(info.getValue()), 'yyyy-MM-dd HH:mm'),
      header: 'Created At',
    }),
    columnHelper.accessor('modified_at', {
      cell: (info) => format(new Date(info.getValue()), 'yyyy-MM-dd HH:mm'),
      header: 'Modified At',
    }),
    columnHelper.accessor('emails', {
      cell: (info) => {
        const emails = info
          .getValue()
          .split(',')
          .map((email: string) => email.trim()); // Split and trim emails once

        return (
          <UnorderedList styleType="none" m={0}>
            {emails.map((email: string, emailIndex: number) => (
              <ListItem key={emailIndex}>
                <Link
                  href={`mailto:${email}`}
                  color="blue.500"
                  isExternal
                  display="block"
                  mb={1}
                >
                  {email}
                </Link>
              </ListItem>
            ))}
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
              size="sm"
              onClick={() => {
                setSelected({
                  id: null,
                  name: '',
                  emails: [{ email: '' }]
                });
                const { id, name, emails } = info.row.original;
                const formattedEmails = emails.split(',').map((email) => ({ email: email.trim() }));
                console.log(formattedEmails)
                openUpdateModal(id, name, formattedEmails);
              }}
            />
          </HStack>
        );
      },
      header: () => <Text textAlign="end">Actions</Text>,
    }),
  ];

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Admin Users - Department
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={onOpen}
          >
            Add New
          </ResponsiveIconButton>
        </HStack>

        <CreateModal isOpen={isOpen} onClose={onClose} />

        <UpdateModal
          isOpen={isUpdateModalOpen}
          onClose={closeUpdateModal}
          itemId={selected.id ?? 0}
          itemName={selected.name}
          itemEmails={selected.emails}
        />

        <Box borderRadius={4}>
          <HStack
            bg={'white'}
            justify={'space-between'}
            mb={4}
            p={4}
            borderTopRadius={4}
          >
            <Heading as="h4" size={'md'}>
              Department List
            </Heading>
          </HStack>
          <DataTable
            columns={columns}
            data={data}
            loading={itemList.isLoading}
          />
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default DepartmentList;
