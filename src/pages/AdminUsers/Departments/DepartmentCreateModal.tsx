import React, { useState } from 'react';

import { DeleteIcon } from '@chakra-ui/icons';
import {
  Button,
  HStack,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { LuPlus } from 'react-icons/lu';
import { useQueryClient } from 'react-query';

import { FieldInput } from '@/components/FieldInput';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useCreateDepartment } from '@/services/adminuser/department/services';

type DepartmentCreateModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const DepartmentCreateModal = ({
  isOpen,
  onClose,
}: DepartmentCreateModalProps) => {
  const initialRef = React.useRef(null);
  const queryClient = useQueryClient();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const [emails, setEmails] = useState<any>([{ email: '' }]);

  const addNewEmail = () => {
    const newEmail = { email: '' };
    setEmails((prevRows: any) => [...prevRows, newEmail]);
  };

  const deleteEmail = (index: number) => {
    let updatedEmails = [...emails];
    updatedEmails.splice(index, 1);
    setEmails(updatedEmails);
  };

  const handleInputChange = (value: any, index: number) => {
    const updatedData = [...emails];
    updatedData[index] = { ...updatedData[index], email: value };
    setEmails(updatedData);
  };

  const CreateItem = useCreateDepartment({
    onSuccess: () => {
      onClose();
      toastSuccess({
        title: 'Department created',
      });
      queryClient.invalidateQueries(['fobIndex']);
    },
    onError: (error) => {
      toastError({
        title: 'Error creating Department',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit(values) {
      console.log(values);
      const email_items = emails.map((email: any) => email.email);
      CreateItem.mutate({ name: values.name, emails: email_items.join(',') });
    },
  });
  return (
    <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}  closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <Formiz autoForm connect={form}>
          <ModalHeader>Add Department</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4} direction={{ base: 'column' }}>
              <FieldInput
                name="name"
                placeholder="Enter Department Name"
                required={'Department Name required'}
                size={'sm'}
              />
            </Stack>

            <Stack spacing={4} direction={{ base: 'column' }}>
              <HStack justify={'space-between'} mt={3}>
                <Text fontSize="lg" fontWeight="600">
                  Emails
                </Text>
                <HStack ml="auto">
                  <Button
                    leftIcon={<LuPlus />}
                    colorScheme="green"
                    size={'xs'}
                    onClick={addNewEmail}
                  >
                    Add
                  </Button>
                </HStack>
              </HStack>
              {emails.map((item: any, index: number) => (
                <FieldInput
                  key={`email_${index + 1}`}
                  type="email"
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  name={`email_${index + 1}`}
                  placeholder="example@gmail.com"
                  defaultValue={item.email}
                  required={item.email !== '' ? 'Email is required':''}
                  size={'sm'}
                  onValueChange={(value) => handleInputChange(value, index)}
                  validations={[
                    {
                      handler: isEmail(),
                      message: 'Invalid email',
                    },
                  ]}
                  maxLength={100}
                  rightElement={
                    <IconButton
                      aria-label="Delete"
                      color={'red'}
                      icon={<DeleteIcon />}
                      size={'sm'}
                      onClick={() => deleteEmail(index)}
                      isDisabled={emails.length <= 1}
                    />
                  }
                />
              ))}
            </Stack>
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

export default DepartmentCreateModal;
