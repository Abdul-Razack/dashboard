import React from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useQueryClient } from 'react-query';

import { FieldInput } from '@/components/FieldInput';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useUpdateRole } from '@/services/adminuser/userrole/services';

type UserRoleUpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  itemName: string;
};

const UserRoleUpdateModal = ({
  isOpen,
  onClose,
  itemId,
  itemName,
}: UserRoleUpdateModalProps) => {
  const initialRef = React.useRef(null);
  const queryClient = useQueryClient();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const updateUserRole = useUpdateRole({
    onSuccess: () => {
      onClose();
      toastSuccess({
        title: 'UserRole updated',
      });
      queryClient.invalidateQueries(['departmentIndex']);
    },
    onError: (error) => {
      toastError({
        title: 'Error updating UserRole',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit(values) {
      updateUserRole.mutate({ id: itemId, name: values.name });
    },
  });

  return (
    <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}  closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <Formiz autoForm connect={form}>
          <ModalHeader>Update UserRole</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FieldInput
              name="name"
              placeholder="Enter UserRole"
              defaultValue={itemName}
            />
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              colorScheme="brand"
              mr={3}
              isLoading={updateUserRole.isLoading}
            >
              Update
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
};

export default UserRoleUpdateModal;
