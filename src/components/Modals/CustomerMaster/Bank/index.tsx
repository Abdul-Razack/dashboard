import { useEffect, useState } from 'react';
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
import { isEmail } from '@formiz/validations';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { FieldInput } from '@/components/FieldInput';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useCreateMasterBank, useUpdateMasterBank } from '@/services/master/bank/services';
import { useCustomerDetails } from '@/services/master/services';
import { isFormFieldsChanged } from '@/helpers/FormChangeDetector';

type BankModalProps = {
  isOpen: boolean;
  onClose: (status: boolean, id: any) => void;
  customerId: number;
  isEdit?: boolean;
  isView?: boolean;
  existValues?: any;
};

export function BankModal({
  isOpen,
  onClose,
  customerId,
  isEdit,
  isView,
  existValues,
}: BankModalProps) {
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const { data } = useCustomerDetails(customerId);

  const addItem = useCreateMasterBank({
    onSuccess: ({ id }) => {
      toastSuccess({
        title: 'Bank Added successfully',
        description: 'Bank details added successfully under the customer',
      });
      onClose(true, id);
    },
    onError: ({response}) => {
      toastError({
        title: 'Failed to create Bank',
        description: response?.data?.message
      });
      onClose(false, 0);
    },
  });

  const updateItem = useUpdateMasterBank({
    onSuccess: ({ id }) => {
      toastSuccess({
        title: 'Bank Details updated successfully',
        description: 'Bank Details updated successfully under the customer',
      });
      onClose(true, id);
    },
    onError: ({response}) => {
      toastError({
        title: 'Failed to update Bank Details',
        description: response?.data?.message
      });
      onClose(false, 0);
    },
  });

  const form = useForm({
    onValidSubmit: async (values) => {
      const {
        beneficiary_name,
        bank_name,
        bank_address,
        bank_branch,
        bank_ac_iban_no,
        type_of_ac,
        bank_swift,
        contact_name,
        ...optionalValues
      } = values;

      const payload: any = {
        customer_id: customerId,
        beneficiary_name,
        bank_name,
        bank_address,
        bank_branch,
        bank_ac_iban_no,
        type_of_ac,
        bank_swift,
        contact_name,
        ...Object.fromEntries(
          Object.entries(optionalValues).filter(
            ([_, value]) => value !== null && value !== ''
          )
        ),
      };

      if (isEdit === true) {
        payload.id = existValues.id;
        updateItem.mutate(payload);
      } else {
        addItem.mutate(payload);
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
      "beneficiary_name",
      "bank_name",
      "bank_address",
      "bank_address_line2",
      "bank_branch",
      "bank_ac_iban_no",
      "type_of_ac",
      "bank_swift",
      "aba_routing_no",
      "contact_name",
      "bank_phone",
      "bank_fax",
      "bank_mobile",
      "bank_email",
    ],
  });

  useEffect(() => {
    if (existValues !== null) {
      const init = {
        beneficiary_name: existValues?.beneficiary_name ?? '',
        bank_name: existValues?.bank_name ?? '',
        bank_address: existValues?.bank_address ?? '',
        bank_address_line2: existValues?.bank_address_line2 ?? '',
        bank_branch: existValues?.bank_branch ?? '',
        bank_ac_iban_no: existValues?.bank_ac_iban_no ?? '',
        type_of_ac: existValues?.type_of_ac ?? '',
        bank_swift: existValues?.bank_swift ?? '',
        aba_routing_no: existValues?.aba_routing_no ?? '',
        contact_name: existValues?.contact_name ?? '',
        bank_phone: existValues?.bank_phone ?? '',
        bank_fax: existValues?.bank_fax ?? '',
        bank_mobile: existValues?.bank_mobile ?? '',
        bank_email: existValues?.bank_email ?? '',
      };    
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
          <ModalHeader>Customer Bank Modal ({`${data?.data?.business_name} - ${data?.data?.code}`})</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Stack spacing={2}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Type of Account'}
                    name={'type_of_ac'}
                    required={'Account Type is required'}
                    placeholder="Enter account type"
                    defaultValue={existValues?.type_of_ac ?? ''}
                    type="alpha-with-space"
                    maxLength={30}
                    isDisabled={isView}
                  />

                  <FieldInput
                    label={'Beneficiary Name'}
                    name={'beneficiary_name'}
                    required={'Beneficiary Name is required'}
                    defaultValue={existValues?.beneficiary_name ?? ''}
                    placeholder="Enter beneficiary name"
                    type="alpha-with-space"
                    maxLength={70}
                    isDisabled={isView}
                  />

                  <FieldInput
                    label={'Bank Name'}
                    name={'bank_name'}
                    defaultValue={existValues?.bank_name ?? ''}
                    required={'Name is required'}
                    placeholder="Enter bank name"
                    type="alpha-with-space"
                    maxLength={70}
                    isDisabled={isView}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label="Address Line 1"
                    name="bank_address"
                    defaultValue={existValues?.bank_address ?? ''}
                    placeholder="Enter Address Line 1"
                    required={'Address is required'}
                    maxLength={50}
                    isDisabled={isView}
                    type="text"
                  />

                  <FieldInput
                    label="Address Line 2"
                    name="bank_address_line2"
                    defaultValue={existValues?.bank_address_line2 ?? ''}
                    maxLength={50}
                    isDisabled={isView}
                    type="text"
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Branch'}
                    name={'bank_branch'}
                    defaultValue={existValues?.bank_branch ?? ''}
                    required={'Branch is required'}
                    placeholder="Enter bank branch"
                    type="alpha-with-space"
                    maxLength={35}
                    isDisabled={isView}
                  />
                  <FieldInput
                    label={'Contact Name'}
                    name={'contact_name'}
                    required={'Contact Name is required'}
                    placeholder="Enter Contact Name"
                    defaultValue={existValues?.contact_name ?? ''}
                    type="alpha-with-space"
                    maxLength={70}
                    isDisabled={isView}
                  />
                  <FieldInput
                    label={'IBAN Number'}
                    name={'bank_ac_iban_no'}
                    required={'IBAN Number is required'}
                    defaultValue={existValues?.bank_ac_iban_no ?? ''}
                    placeholder="Enter IBAN Number"
                    type="alpha-numeric"
                    maxLength={34}
                    isDisabled={isView}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Swift code'}
                    name={'bank_swift'}
                    defaultValue={existValues?.bank_swift ?? ''}
                    required={'Swift code is required'}
                    placeholder="Enter Bank Swift code"
                    type="alpha-numeric"
                    maxLength={11}
                    isDisabled={isView}
                  />
                  <FieldInput
                    label={'ABA Routing Number'}
                    name={'aba_routing_no'}
                    defaultValue={existValues?.aba_routing_no ?? ''}
                    placeholder="Enter ABA Routing Number"
                    type="alpha-numeric"
                    maxLength={11}
                    isDisabled={isView}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Phone Number'}
                    name={'bank_phone'}
                    defaultValue={existValues?.bank_phone ?? ''}
                    placeholder="Enter Bank Phone Number"
                    type="phone-number"
                    maxLength={15}
                    isDisabled={isView}
                  />
                  <FieldInput
                    label={'Fax No'}
                    name={'bank_fax'}
                    defaultValue={existValues?.bank_fax ?? ''}
                    placeholder="Enter Bank Fax No"
                    type="phone-number"
                    maxLength={15}
                    isDisabled={isView}
                  />
                  <FieldInput
                    label={'Mobile Number'}
                    name={'bank_mobile'}
                    defaultValue={existValues?.bank_mobile ?? ''}
                    placeholder="Enter Bank Mobile Number"
                    type="phone-number"
                    maxLength={15}
                    isDisabled={isView}
                  />
                  <FieldInput
                    label={'Email'}
                    name={'bank_email'}
                    defaultValue={existValues?.bank_email ?? ''}
                    placeholder="Enter Bank Email"
                    type="email"
                    onKeyDown={(e) => {
                      if (e.key === " ") {
                        e.preventDefault();
                      }
                    }}
                    validations={[
                      {
                        handler: isEmail(),
                        message: 'Invalid email',
                      }
                    ]}
                    maxLength={100}
                    isDisabled={isView}
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
                  isLoading={addItem.isLoading || updateItem.isLoading}
                  isDisabled={
                    !form.isValid || 
                    addItem.isLoading || 
                    updateItem.isLoading || 
                    (isEdit ? !isFormValuesChanged : false)
                  }
                >
                  {isEdit === true ? 'Update' : 'Create '} Bank
                </Button>
              )}
            </Stack>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
}

export default BankModal;
