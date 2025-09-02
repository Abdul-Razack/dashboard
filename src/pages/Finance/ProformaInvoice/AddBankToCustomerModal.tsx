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

import { FieldInput } from '@/components/FieldInput';
import { useCreateMasterBank } from '@/services/master/bank/services';

type AddBankToCustomerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  customerId: number;
};

function AddBankToCustomerModal({
  isOpen,
  onClose,
  customerId,
}: AddBankToCustomerModalProps) {
  const addBankToCustomer = useCreateMasterBank({
    onSuccess: () => {
      //queryClient.invalidateQueries(['prfqDetails']);
      onClose();
    },
    onError: () => {
      onClose();
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

      addBankToCustomer.mutate(payload);
    },
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="60vw">
        <Formiz autoForm connect={form}>
          <ModalHeader>Add Bank To Customer</ModalHeader>
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
                    maxLength={15}
                    type="alpha-numeric-with-space"
                  />

                  <FieldInput
                    label={'Beneficiary Name'}
                    name={'beneficiary_name'}
                    required={'Beneficiary Name is required'}
                    placeholder="Enter beneficiary name"
                    maxLength={70}
                    type="alpha-numeric-with-space"
                  />

                  <FieldInput
                    label={'Bank Name'}
                    name={'bank_name'}
                    required={'Name is required'}
                    placeholder="Enter bank name"
                    maxLength={70}
                    type="alpha-numeric-with-space"
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label="Address Line 1"
                    name="bank_address"
                    placeholder="Enter Address Line 1"
                    required={'Address is required'}
                    maxLength={50}
                    type="text"
                  />

                  <FieldInput
                    label="Address Line 2"
                    name="bank_address_line2"
                    placeholder="Enter Address Line 2"
                    maxLength={50}
                    type="text"
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Branch'}
                    name={'bank_branch'}
                    required={'Branch is required'}
                    placeholder="Enter bank branch"
                    maxLength={35}
                    type="alpha-numeric-with-space"
                  />
                  <FieldInput
                    label={'Contact Name'}
                    name={'contact_name'}
                    required={'Contact Name is required'}
                    placeholder="Enter Contact Name"
                    maxLength={70}
                   type="alpha-numeric-with-space"
                  />
                  <FieldInput
                    label={'IBAN Number'}
                    name={'bank_ac_iban_no'}
                    required={'IBAN Number is required'}
                    placeholder="Enter IBAN Number"
                    maxLength={34}
                    type="alpha-numeric"
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Swift Code'}
                    name={'bank_swift'}
                    required={'Swift code is required'}
                    placeholder="Enter Bank Swift code"
                    maxLength={11}
                    type="alpha-numeric"
                  />
                  <FieldInput
                    label={'ABA Routing Number'}
                    name={'aba_routing_no'}
                    placeholder="Enter ABA Routing Number"
                    type="alpha-numeric"
                    maxLength={11}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Phone Number'}
                    name={'bank_phone'}
                    placeholder="Enter Bank Phone Number"
                    type="number"
                    maxLength={15}
                  />
                  <FieldInput
                    label={'Fax No'}
                    name={'bank_fax'}
                    placeholder="Enter Bank Fax No"
                    type="number"
                    maxLength={15}
                  />
                  <FieldInput
                    label={'Mobile Number'}
                    name={'bank_mobile'}
                    placeholder="Enter Bank Mobile Number"
                    type="number"
                    maxLength={15}
                  />
                  <FieldInput
                    label={'Email'}
                    name={'bank_email'}
                    placeholder="Enter Bank Email"
                    validations={[
                      {
                        handler: isEmail(),
                        message: 'Invalid email',
                      },
                    ]}
                    maxLength={40}
                  />
                </Stack>
              </Stack>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button type="button" colorScheme="red" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={addBankToCustomer.isLoading}
              disabled={!form.isValid || addBankToCustomer.isLoading}
            >
              Add New Bank
            </Button>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
}

export default AddBankToCustomerModal;
