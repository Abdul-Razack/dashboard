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
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isEmail } from '@formiz/validations';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { countryOptions } from '@/constants';
import { useCustomerDetails } from '@/services/master/services';
import {
  useCreateShipping,
  useUpdateShipping,
} from '@/services/master/shipping/services';
import { isFormFieldsChanged } from '@/helpers/FormChangeDetector';

type CustomerShippingAddressModalProps = {
  isOpen: boolean;
  onClose: (status: boolean, id: any) => void;
  customerId: number;
  isEdit?: boolean;
  isView?: boolean;
  existValues?: any;
};

export function CustomerShippingAddressModal({
  isOpen,
  onClose,
  customerId,
  isEdit,
  isView,
  existValues,
}: CustomerShippingAddressModalProps) {
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const { data } = useCustomerDetails(customerId);

  const addDetails = useCreateShipping({
    onSuccess: ({id}) => {
      toastSuccess({
        title: 'Shipping Address Added successfully',
        description: 'Shipping Address added successfully under the customer',
      });
      onClose(true, id);
    },
    onError: ({response}) => {
      toastError({
        title: 'Failed to create Shipping address',
        description: response?.data?.message
      });
    },
  });

  const updateDetails = useUpdateShipping({
    onSuccess: ({id}) => {
      toastSuccess({
        title: 'Shipping address updated successfully',
        description: 'Shipping address updated successfully under the customer',
      });
      onClose(true, id);
    },
    onError: ({response}) => {
      toastError({
        title: 'Failed to update shipping address',
        description: response?.data?.message
      });
    },
  });

  const form = useForm({
    onValidSubmit: async (values) => {
      const {
        attention,
        consignee_name,
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
        consignee_name,
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
      "attention",
      "consignee_name",
      "address",
      "address_line2",
      "city",
      "state",
      "zip_code",
      "country",
      "phone",
      "fax",
      "email",
      "remarks"
    ],
  });
   
  useEffect(() => {
    if (existValues !== null) {
      const init = {
        attention: existValues?.attention ?? '',
        consignee_name: existValues?.consignee_name ?? '',
        address: existValues?.address ?? '',
        address_line2: existValues?.address_line2 ?? '',
        city: existValues?.city ?? '',
        state: existValues?.state ?? '',
        zip_code: existValues?.zip_code ?? '',
        country: existValues?.country ?? '',
        phone: existValues?.phone ?? '',
        fax: existValues?.fax ?? '',
        email: existValues?.email ?? '',
        remarks: existValues?.remarks ?? ''
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
          <ModalHeader>
            Customer Shipping Address Modal (
            {`${data?.data?.business_name} - ${data?.data?.code}`})
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Stack spacing={2}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Attention'}
                    name={'attention'}
                    required={'Attention is required'}
                    placeholder="Enter Attention"
                    type={'alpha-with-space'}
                    maxLength={40}
                    isDisabled={isView}
                    defaultValue={existValues?.attention ?? ''}
                  />

                  <FieldInput
                    label={'Consignee Name'}
                    name={'consignee_name'}
                    required={'Consignee Name is required'}
                    placeholder="Enter Consignee Name"
                    type={'alpha-with-space'}
                    maxLength={40}
                    isDisabled={isView}
                    defaultValue={existValues?.consignee_name ?? ''}
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
                    defaultValue={
                      existValues?.email ? existValues?.email.toLowerCase() : ''
                    }
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label="Address Line 1"
                    name="address"
                    placeholder="Enter Address Line 1"
                    required={'Address Line 1 is required'}
                    maxLength={50}
                    isDisabled={isView}
                    defaultValue={existValues?.address ?? ''}
                  />

                  <FieldInput
                    label="Address Line 2"
                    name="address_line2"
                    placeholder="Enter Address Line 2"
                    maxLength={50}
                    isDisabled={isView}
                    defaultValue={existValues?.address_line2 ?? ''}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Phone Number'}
                    name={'phone'}
                    required={'Phone Number is required'}
                    placeholder="Enter Phone Number"
                    type="phone-number"
                    maxLength={15}
                    isDisabled={isView}
                    defaultValue={existValues?.phone ?? ''}
                  />

                  <FieldInput
                    label={'Fax No'}
                    name={'fax'}
                    placeholder="Enter Fax No"
                    type="phone-number"
                    maxLength={15}
                    isDisabled={isView}
                    defaultValue={existValues?.fax ?? ''}
                  />

                  <FieldInput
                    label={'City'}
                    name={'city'}
                    placeholder="Enter city"
                    type={'alpha-numeric-with-space'}
                    maxLength={40}
                    isDisabled={isView}
                    defaultValue={existValues?.city ?? ''}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'State'}
                    name={'state'}
                    placeholder="Enter State"
                    type={'alpha-with-space'}
                    maxLength={40}
                    isDisabled={isView}
                    defaultValue={existValues?.state ?? ''}
                  />
                  <FieldInput
                    label={'Zipcode'}
                    name={'zip_code'}
                    placeholder="Enter Zipcode"
                    type={'integer'}
                    maxLength={8}
                    isDisabled={isView}
                    defaultValue={existValues?.zip_code ?? ''}
                  />
                  <FieldSelect
                    label={'Country'}
                    name={'country'}
                    placeholder="Enter Country"
                    required={'Country is required'}
                    options={countryOptions}
                    isDisabled={isView}
                    defaultValue={existValues?.country ?? ''}
                    className={isView ? 'disabled-input' : ''}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
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
                  {isEdit === true ? 'Update' : 'Create '} Address
                </Button>
              )}
            </Stack>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
}

export default CustomerShippingAddressModal;
