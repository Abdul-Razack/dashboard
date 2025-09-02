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
  Stack,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { useQueryClient } from 'react-query';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { useDepartmentList } from '@/services/adminuser/department/services';
import { useUpdateEmailAlert } from '@/services/email-alert/services';

type UpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  existingData: TODO;
};

const UpdateModal = ({ isOpen, onClose, existingData }: UpdateModalProps) => {
  const initialRef = React.useRef(null);
  const queryClient = useQueryClient();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const departmentList = useDepartmentList();
  const departmentOptions = transformToSelectOptions(departmentList?.data);
  const updateItem = useUpdateEmailAlert({
    onSuccess: () => {
      onClose();
      toastSuccess({
        title: 'Email alert updated',
      });
      queryClient.invalidateQueries(['emailAlertIndex']);
    },
    onError: (error) => {
      toastError({
        title: 'Error updating Email alert',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit(values) {
      const intArray = values.department_ids.map((item: string) => parseInt(item));
      updateItem.mutate({ id: existingData?.id, department_ids: intArray, subject: values.subject });
    },
  });

  return (
    <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}  closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <Formiz autoForm connect={form}>
          <ModalHeader>Update Email Alert</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4} direction={{ base: 'column' }}>
              <FieldInput
                label={'Key'}
                name="key"
                placeholder="Enter key"
                defaultValue={existingData?.key}
                isReadOnly={true}
              />

              <FieldInput
                label={'Subject'}
                name="subject"
                placeholder="Enter Subject"
                defaultValue={existingData?.subject}
              />

              <FieldSelect
                label="Department"
                name={'department_ids'}
                placeholder="Select..."
                options={departmentOptions}
                isMulti
                required={'Department is required'}
                defaultValue={existingData?.department_ids ? existingData?.department_ids.map((num: any) => String(num)): ''}
              />
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button
              type="submit"
              colorScheme="brand"
              mr={3}
              isLoading={updateItem.isLoading}
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

export default UpdateModal;
