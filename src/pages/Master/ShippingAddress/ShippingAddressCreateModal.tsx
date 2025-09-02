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
import { isEmail } from '@formiz/validations';
import { UseQueryResult, useQueryClient } from 'react-query';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { countryOptions } from '@/constants';
import { useCustomerList } from '@/services/master/services';
import { useCreateShipping } from '@/services/master/shipping/services';
import { transformToSelectOptions } from '@/helpers/commonHelper';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

type ShippingCreateModalProps = {
  customer_id?: number;
  isOpen: boolean;
  onClose: () => void;
  onModalClosed?: (status: boolean, data: any) => void;
};

const ShippingAddressCreateModal = ({
  customer_id,
  isOpen,
  onClose,
  onModalClosed
}: ShippingCreateModalProps) => {
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const queryClient = useQueryClient();

  const customerList: UseQueryResult<QueryData, unknown> = useCustomerList();
  const customerOptions = transformToSelectOptions(customerList.data);

  const allApiDataLoaded = customerList.isSuccess;

  const createShippingAddress = useCreateShipping({
    onSuccess: ({ id, message }) => {
      toastSuccess({
        title: 'Shipping address created - ' + id,
        description: message,
      });
      queryClient.invalidateQueries(['shippingAddressIndex']);
      handleClose(true, id);
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create shipping address',
        description: error.response?.data.message,
      });
    },
  });

  const handleClose = (status: boolean, id: any) => {
    if (onModalClosed) {
      onModalClosed(status, id);
    }
    onClose();
  };

  const form = useForm({
    onValidSubmit: (values) => {
      // Destructure mandatory fields directly
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

      // Construct the final payload, excluding null or undefined optional fields and empty quality_certificates
      const payload: any = {
        customer_id: customer_id,
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
      // console.log(payload);
      // Assuming you have a function to make the API call
      createShippingAddress.mutate(payload);
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={() => handleClose(false, null)} size={'6xl'} closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <Formiz autoForm connect={form}>
          <ModalHeader>Add New shipping address</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <LoadingOverlay isLoading={!allApiDataLoaded}>
              <Stack spacing={2}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'Customer Name'}
                    name={'customer_id'}
                    required={'customer_id required'}
                    placeholder="Select customer"
                    options={customerOptions}
                    defaultValue={(customer_id && customer_id.toString()) || ''}
                    isDisabled={!!customer_id}
                  />

                  <FieldInput
                    label={'Attention'}
                    name={'attention'}
                    required={'Attention is required'}
                    placeholder="Enter Attention"
                    maxLength={40}
                    type={'alpha-numeric-with-space'}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Consignee Name'}
                    name={'consignee_name'}
                    required={'Consignee Name is required'}
                    placeholder="Enter Consignee Name"
                    maxLength={40}
                    type={'alpha-numeric-with-space'}
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
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label="Address Line 1"
                    name="address"
                    placeholder="Enter Address Line 1"
                    required={'Address  Line 1 is required'}
                    maxLength={50}
                  />

                  <FieldInput
                    label="Address Line 2"
                    name="address_line2"
                    placeholder="Enter Address Line 2"
                    maxLength={50}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'City'}
                    name={'city'}
                    placeholder="Enter city"
                    maxLength={40}
                    type={'alpha-numeric-with-space'}
                  />
                  <FieldInput
                    label={'State'}
                    name={'state'}
                    placeholder="Enter State"
                    maxLength={40}
                    type={'alpha-with-space'}
                  />
                  <FieldInput
                    label={'Zipcode'}
                    name={'zip_code'}
                    placeholder="Enter Zipcode"
                    maxLength={8}
                    type='integer'
                  />
                  <FieldSelect
                    label={'Country'}
                    name={'country'}
                    placeholder="Enter Country"
                    required={'Country is required'}
                    options={countryOptions}
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
                  />

                  <FieldInput
                    label={'Fax No'}
                    name={'fax'}
                    placeholder="Enter Fax No"
                    type="phone-number"
                    maxLength={15}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldTextarea
                    label="Remarks"
                    name="remarks"
                    placeholder="Enter Remarks"
                    maxLength={100}
                  />
                </Stack>
              </Stack>
            </LoadingOverlay>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={() => handleClose(false, null)}>
              Close
            </Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={createShippingAddress.isLoading}
              disabled={createShippingAddress.isLoading}
            >
              Add New Shipping Address
            </Button>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
};

export default ShippingAddressCreateModal;
