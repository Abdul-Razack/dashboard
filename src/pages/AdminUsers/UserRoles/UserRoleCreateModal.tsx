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
import { useCreateRole } from '@/services/adminuser/userrole/services';

type UserRoleCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const UserRoleCreateModal = ({
  isOpen,
  onClose,
}: UserRoleCreateModalProps) => {
  const initialRef = React.useRef(null);
  const queryClient = useQueryClient();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const CreateItem = useCreateRole({
    onSuccess: () => {
      onClose();
      toastSuccess({
        title: 'UserRole created',
      });
      queryClient.invalidateQueries(['fobIndex']);
    },
    onError: (error) => {
      toastError({
        title: 'Error creating UserRole',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit(values) {
      CreateItem.mutate(values);
    },
  });
  return (
    <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}  closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <Formiz autoForm connect={form}>
          <ModalHeader>Add UserRole</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FieldInput name="name" placeholder="Enter UserRole Name" required={'UserRole Name required'}/>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              colorScheme="brand"
              mr={3}
              isLoading={CreateItem.isLoading}
            >
              Add
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
};

export default UserRoleCreateModal;
