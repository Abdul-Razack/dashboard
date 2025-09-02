import { useState } from 'react';
import { BsFillShieldLockFill } from "react-icons/bs";
import { EditIcon } from '@chakra-ui/icons';
import {
  Box,
  HStack,
  Heading,
  IconButton,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '@/components/DataTable';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useRoleIndex } from '@/services/adminuser/userrole/services';
import { DataColumn } from '@/services/submaster/schema';

import CreateModal from './UserRoleCreateModal';
import UpdateModal from './UserRoleUpdateModal';

export const UserRoleList = () => {
  const navigate = useNavigate();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [selected, setSelected] = useState<{
    id: number | null;
    name: string;
  }>({
    id: null,
    name: '',
  });

  const openUpdateModal = (itemId: number, itemName: string) => {
    setSelected({ id: itemId, name: itemName });
    setIsUpdateModalOpen(true);
  };

  const closeUpdateModal = () => {
    setIsUpdateModalOpen(false);
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  const itemList = useRoleIndex();
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
    columnHelper.accessor('actions', {
      cell: (info) => {
        return (
          <HStack justify={'flex-end'}>
            <IconButton
              aria-label="Permissions"
              icon={<BsFillShieldLockFill />}
              size={'sm'}
              isDisabled={info.row.original.id === 1}
              onClick={() =>
                navigate(`/permissions/${info.row.original.id}/info`)
              }
            />

            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size={'sm'}
              isDisabled={info.row.original.id === 1}
              onClick={() =>
                openUpdateModal(info.row.original.id, info.row.original.name)
              }
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
            Admin Users - UserRole
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
            UserRole List
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

export default UserRoleList;
