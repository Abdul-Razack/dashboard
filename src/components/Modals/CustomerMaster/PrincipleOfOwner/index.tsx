import { useEffect, useState } from 'react';
import {
  Box,
  Button,
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
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isEmail } from '@formiz/validations';

import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import { FieldInput } from '@/components/FieldInput';
import { FieldTextarea } from '@/components/FieldTextarea';
import { FieldUpload } from '@/components/FieldUpload';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  useCreateOwner,
  useUpdateOwner,
} from '@/services/master/principleowner/services';
import { useCustomerDetails } from '@/services/master/services';
import { isFormFieldsChanged } from '@/helpers/FormChangeDetector';

type PrincipleOfOwnerModalProps = {
  isOpen: boolean;
  onClose: (status: boolean, id: any) => void;
  customerId: number;
  isEdit?: boolean;
  isView?: boolean;
  existValues?: any;
};

export function PrincipleOfOwnerModal({
  isOpen,
  onClose,
  customerId,
  isEdit,
  isView,
  existValues,
}: PrincipleOfOwnerModalProps) {
  const { data } = useCustomerDetails(customerId);
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const addDetails = useCreateOwner({
      onSuccess: ({ id }) => {
      toastSuccess({
        title: 'Principle Of Owner Added successfully',
        description:
          'Principle Of Owner details added successfully under the customer',
      });
      onClose(true, id);
    },
    onError: ({response}) => {
      toastError({
        title: 'Failed to create Trader Reference',
        description: response?.data?.message
      });
    },
  });

  const updateDetails = useUpdateOwner({
    onSuccess: ({ id }) => {
      toastSuccess({
        title: 'Principle Of Owner updated successfully',
        description:
          'Principle Of Owner updated successfully under the customer',
      });
      onClose(true, id);
    },
    onError: ({response}) => {
      toastError({
        title: 'Failed to update Principle Of Owner',
        description: response?.data?.message
      });
    },
  });

  const form = useForm({
    onValidSubmit: async (values) => {
      const {
        attention,
        address,
        city,
        state,
        zip_code,
        country,
        phone,
        fax,
        email,
        remarks,
        ...optionalValues
      } = values;

      const payload: any = {
        customer_id: customerId,
        attention,
        address,
        city,
        state,
        zip_code,
        country,
        phone,
        fax,
        email,
        remarks,
        ...Object.fromEntries(
          Object.entries(optionalValues).filter(
            ([_, value]) => value !== null && value !== ''
          )
        ),
      };

      if (isEdit === true) {
        payload.id = existValues.id;
        updateDetails.mutate(payload);
      } else {
        addDetails.mutate(payload);
      }
    },
  });

  const fields = useFormFields({
    connect: form,
  });
  const [initialValues, setInitialValues] = useState<any>(null);

  const isFormValuesChanged = isFormFieldsChanged({
    fields,
    initialValues,
    keys: [
      "owner",
      "phone",
      "email",
      "id_passport_copy",
      "remarks"
    ],
  });
   
  useEffect(() => {
    if (existValues !== null) {
      const init = {
        owner: existValues?.owner ?? '',
        phone: existValues?.phone ?? '',
        email: existValues?.email ?? '',
        id_passport_copy: existValues?.id_passport_copy ?? '',
        remarks: existValues?.remarks ?? ''
      };    

      console.log('initial values', init)
      setInitialValues(init);
      form.setValues(init); 
    }
  }, [existValues]);

  const handleClose = () => {
    onClose(false, 0);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="md" closeOnOverlayClick={false}  closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="60vw">
        <Formiz autoForm connect={form}>
          <ModalHeader>Principle of Owner Modal ({`${data?.data?.business_name} - ${data?.data?.code}`})</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Stack spacing={2}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Owner'}
                    name={'owner'}
                    type={'alpha-with-space'}
                    placeholder="Enter Owner Name"
                    maxLength={40}
                    isDisabled={isView}
                    defaultValue={existValues?.owner ?? ''}
                    required="Owner Name is required"
                  />
                  <FieldInput
                    label={'Phone Number'}
                    name={'phone'}
                    placeholder="Enter Phone Number"
                    type="phone-number"
                    maxLength={15}
                    isDisabled={isView}
                    defaultValue={existValues?.phone ?? ''}
                  />

                  <FieldInput
                    label={'Email'}
                    name={'email'}
                    placeholder="Enter Email"
                    type="email"
                    onKeyDown={(e) => {
                      if (e.key === ' ') {
                        e.preventDefault();
                      }
                    }}
                    validations={[
                      {
                        handler: isEmail(),
                        message: 'Invalid email',
                      },
                    ]}
                    maxLength={100}
                    isDisabled={isView}
                    defaultValue={existValues?.email ? existValues?.email.toLowerCase() : ''}
                    required={
                      existValues?.email ? 'Email is required' : ''
                    }
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  {isView !== true && (
                    <FieldUpload
                      label="ID/Passport Copy"
                      name="id_passport_copy"
                      placeholder="Passport Copy"
                      existingFileUrl={existValues?.id_passport_copy || ''}
                      defaultValue={isEdit ? (existValues?.id_passport_copy || '') : ''}
                    />
                  )}
                  {isView === true && (
                    <Box w={'100%'} mt={0}>
                      <Text fontSize={'md'} mb={2}>
                        Passport Copy
                      </Text>
                      <DocumentDownloadButton
                        size={'sm'}
                        url={existValues?.id_passport_copy || ''}
                      />
                    </Box>
                  )}

                  <FieldTextarea
                    label="Remarks"
                    name="remarks"
                    placeholder="Enter Remarks"
                    maxLength={100}
                    isDisabled={isView}
                    defaultValue={existValues?.remarks ?? ''}
                  />
                </Stack>
              </Stack>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Stack
              direction="row"
              spacing={4}
              justify="center"
              width="100%"
              mt={4}
            >
              <Button type="button" colorScheme="red" onClick={handleClose}>
                Close
              </Button>
              {isView === false && (
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={addDetails.isLoading || updateDetails.isLoading}
                  isDisabled={
                    !form.isValid ||
                    addDetails.isLoading ||
                    updateDetails.isLoading ||
                    (isEdit ? !isFormValuesChanged : false)
                  }
                >
                  {isEdit === true ? 'Update' : 'Create '} Principle of Owner
                </Button>
              )}
            </Stack>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
}

export default PrincipleOfOwnerModal;
