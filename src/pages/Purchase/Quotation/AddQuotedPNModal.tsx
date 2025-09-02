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
import { useCreatePartNumber } from '@/services/submaster/partnumber/services';
import { useToastSuccess } from '@/components/Toast';

type AddQuotedPNModalProps = {
  isOpen: boolean;
  onClose: () => void;
  id?: number;
};

const AddQuotedPNModal = ({ isOpen, onClose, id }: AddQuotedPNModalProps) => {
  const queryClient = useQueryClient();
  const toastSuccess = useToastSuccess();
  const addPartNumber = useCreatePartNumber({
    onSuccess: () => {
      queryClient.invalidateQueries(['partNumberBySpareId']);
      toastSuccess({
        title: `Alternate Part number added successfully`,
      });
      onClose();
    },
    onError: () => {
      onClose();
    },
  });

  const form = useForm({
    onValidSubmit: async (values) => {
      const payload = {
        id: Number(id),
        part_number: values.part_number,
      };

      addPartNumber.mutate(payload);
    },
  });
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}  closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <Formiz autoForm connect={form}>
          <ModalHeader>Add Part Number</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldInput
                  label="Part Number"
                  name="part_number"
                  required="Required"
                  placeholder="Enter part number"
                />
              </Stack>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={addPartNumber.isLoading}
              disabled={!form.isValid || addPartNumber.isLoading}
            >
              Add Part Number
            </Button>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
};

export default AddQuotedPNModal;
