import React, {useEffect, useState} from 'react';

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
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isFormFieldsChanged } from '@/helpers/FormChangeDetector';
import { useQueryClient } from 'react-query';

import { FieldInput } from '@/components/FieldInput';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useCreatePaymentTerms, useUpdatePaymentTerms } from '@/services/submaster/paymentterms/services';

type ModalFormProps = {
  isOpen: boolean;
  isEdit?: boolean;
  existInfo?: any;
  onClose: () => void;
};

const ModalForm = ({
  isOpen,
  isEdit = false,
  existInfo,
  onClose,
}: ModalFormProps) => {
  const initialRef = React.useRef(null);
  const queryClient = useQueryClient();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const createItem = useCreatePaymentTerms({
    onSuccess: () => {
      onClose();
      toastSuccess({
        title: 'Payment Terms created',
      });
      queryClient.invalidateQueries(['paymentTermsIndex']);
    },
    onError: (error) => {
      toastError({
        title: 'Error creating Payment Terms',
        description: error.response?.data.message,
      });
    },
  });
  
  const updateItem = useUpdatePaymentTerms({
    onSuccess: () => {
      onClose();
      toastSuccess({
        title: 'Payment Terms updated',
      });
      queryClient.invalidateQueries(['paymentTermsIndex']);
    },
    onError: (error) => {
      toastError({
        title: 'Error creating Payment Terms',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit(values) {
      if (isEdit) {
        const formValues: TODO = values;
        formValues.id = existInfo?.id;
        updateItem.mutate(formValues);
      } else {
        createItem.mutate(values);
      }
    },
  });
  const [initialValues, setInitialValues] = useState<any>(null);
  const fields = useFormFields({ connect: form });
  const isFormValuesChanged = isFormFieldsChanged({
    fields,
    initialValues,
    keys: ['name']
  });

  useEffect(() => {
    if(isEdit){
      setInitialValues(existInfo);
    }
  }, [isEdit]);

  return (
    <Modal initialFocusRef={initialRef} isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}  closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <Formiz autoForm connect={form}>
          <ModalHeader>{isEdit ? 'Update ' : 'Add '} Payment Terms</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FieldInput
              name="name"
              placeholder="Enter Payment Terms" 
              required={'Payment Terms required'}
              defaultValue={existInfo?.name || ''}
              type="all-capital"
              maxLength={15}
            />
            <FieldInput
              name="days"
              placeholder="Enter Number of Days"
              required={'Days required'}
              defaultValue={existInfo?.days || ''}
              type="integer"
            />
          </ModalBody>
           

          <ModalFooter>
            <Button
              type="submit"
              colorScheme="brand"
              mr={3}
              isLoading={createItem.isLoading || updateItem.isLoading}
              isDisabled={ 
                createItem.isLoading || 
                updateItem.isLoading || 
                (isEdit ? !isFormValuesChanged : false)
              }
            >
              {isEdit ? 'Update ' : 'Create'}
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
};

export default ModalForm;
