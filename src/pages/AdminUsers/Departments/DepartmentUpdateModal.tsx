import React, { useEffect, useState } from 'react';

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
import { useUpdateDepartment } from '@/services/adminuser/department/services';

type DepartmentUpdateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  itemId: number;
  itemName: string;
  itemEmails: Array<TODO>;
};

const DepartmentUpdateModal = ({
  isOpen,
  onClose,
  itemId,
  itemName,
  itemEmails,
}: DepartmentUpdateModalProps) => {
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

  const updateDepartment = useUpdateDepartment({
    onSuccess: () => {
      onClose();
      toastSuccess({
        title: 'Department updated',
      });
      queryClient.invalidateQueries(['departmentIndex']);
    },
    onError: (error) => {
      toastError({
        title: 'Error updating Department',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit(values) {
      const email_items = emails.map((email: any) => email.email);
      updateDepartment.mutate({
        id: itemId,
        name: values.name,
        emails: email_items.join(','),
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      setEmails(itemEmails);
    }
  }, [isOpen]);

  useEffect(() => {
    emails.forEach((item: any, index: number) => {
      form.setValues({ [`email_${index}`]: item.email });
    });
  }, [emails]);

  return (
    <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}  closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <Formiz autoForm connect={form}>
          <ModalHeader>Update Department</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Stack spacing={4} direction={{ base: 'column' }}>
              <FieldInput
                name="name"
                placeholder="Enter Department"
                defaultValue={itemName}
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
                  key={`email_${index}`}
                  type="email"
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  name={`email_${index}`}
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
              isLoading={updateDepartment.isLoading}
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

export default DepartmentUpdateModal;
