import { useState, useEffect, useRef } from 'react';

import {
  Button,
  Input,
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
import { useQueryClient } from 'react-query';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { FieldSelect } from '@/components/FieldSelect';
import { useContactManagerListById, useContactManagerDetails } from '@/services/master/contactmanager/services';
import {
  // useCustomerIndex,
  useCustomerSupplierList,
} from '@/services/master/services';
import { useAddCustomerToPRFQ } from '@/services/purchase/prfq/services';
import { useToastError } from '@/components/Toast';
import { getAPICall } from '@/services/apiService';
import { OptionsListPayload } from '@/services/apiService/Schema/OptionsSchema';

type AddCustomerToRFQModalProps = {
  isOpen: boolean;
  onClose: () => void;
  rfqId: number;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

function AddCustomerToRFQModal({
  isOpen,
  onClose,
  rfqId,
}: AddCustomerToRFQModalProps) {
  const queryClient = useQueryClient();
  const customerId = useRef(0);
  const contactID = useRef(0);
  const [resetKey, setResetKey] = useState(0);
  const toastError = useToastError();
  const customerListSupplier = useCustomerSupplierList({
    type: 'suppliers',
  });
  const customerOptions = customerListSupplier.data?.data.map((customer) => ({
    value: customer.id,
    label: customer.business_name,
  }));

  const contactManagerList = useContactManagerListById(customerId.current, {enabled: customerId.current !== 0});
  const [contactManagerOptions, setContactManagerOptions] = useState<TODO>([]);
  const { data: contactData } = useContactManagerDetails(contactID.current, {enabled: contactID.current !== 0});
  const [contactsLoading, setContactsLoading] = useState<boolean>(false);
  const addCustomerToRFQ = useAddCustomerToPRFQ({
    onSuccess: () => {
      queryClient.invalidateQueries(['prfqDetails']);
      onClose();
    },
    onError: (error) => {
      toastError({
        title: 'Failed to Add customer',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: async (values) => {
      const payload = {
        rfq_id: rfqId.toString(),
        customer_id: values.vendor_name,
        customer_contact_manager_id: values.contact,
      };

      addCustomerToRFQ.mutate(payload);
    },
  });

  const fields = useFormFields({
    connect: form,
  });

    const getContactList = async () => {
      try {
        const response = await getAPICall(
          `${endPoints.list.customer_contact_manager}/${customerId.current}`,
          OptionsListPayload
        );
        const options = transformToSelectOptions(response);
        setContactManagerOptions(options);
        setContactsLoading(false);
      } catch (err) {
        //setModuleLoading(false);
        console.log(err);
      }
    };

  useEffect(() => {
    console.log(customerId.current)
    if(customerId.current && contactManagerOptions && contactManagerOptions.length > 0){
      form.setValues({ ['contact'] : contactManagerOptions[0].value});
      contactID.current = Number(contactManagerOptions[0].value);
    }else{
      contactID.current = 0;
    }
  }, [contactManagerOptions, customerId.current]);

  useEffect(() => {
    if(customerId === null){
      form.setValues({ ['contact'] : ''});
      setResetKey((prevKey) => prevKey + 1);
    }
  }, [customerId]);


  useEffect(() => {
    if(isOpen){
      customerId.current = 0;
      contactID.current = 0;
      setResetKey((prevKey) => prevKey + 1);
    }
  }, [isOpen]);


  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}  closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <Formiz autoForm connect={form}>
          <ModalHeader>Add Vendor To RFQ</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={4}>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldSelect
                  name="vendor_name"
                  options={customerOptions ?? []}
                  size={'sm'}
                  isClearable={true}
                  placeholder="Select Vendor"
                  required={'Vendor is required'}
                  menuPortalTarget={document.body}
                  onValueChange={(value) => {
                    queryClient.removeQueries(['customerDetails', customerId.current]);
                    queryClient.removeQueries(['ContactDetails', contactID.current]);
                    contactID.current = 0;
                    customerId.current = Number(value);
                    setResetKey((prevKey) => prevKey + 1);
                    if(value){
                      setContactsLoading(true);
                      getContactList();
                    }else{
                      setContactManagerOptions([]);
                    }
                  }}
                  selectProps={{
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                />
                <Input
                  key={`vendor_${resetKey}`}
                  type="text"
                  size={'sm'}
                  placeholder="Vendor Code"
                  disabled
                  defaultValue={
                    customerListSupplier.data?.data?.find(
                      (customer) =>
                        customer.id === Number(fields[`vendor_name`]?.value)
                    )?.code
                  }
                />
              </Stack>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldSelect
                  key={`contact_${resetKey}`}
                  name={`contact`}
                  required={'Contact is required'}
                  options={contactManagerOptions ?? []}
                  size={'sm'}
                  isClearable={false}
                  placeholder="Select Contact"
                  onValueChange={(value) => {
                    queryClient.removeQueries(['ContactDetails', contactID.current]);
                    contactID.current = Number(value);
                    if(!value){
                      setResetKey((prevKey) => prevKey + 1);
                    }
                  }}
                  isDisabled={contactID.current === 0}
                  selectProps={{
                    isLoading: contactsLoading
                  }}
                />
                <Input
                  type="text"
                  key={`address_${resetKey}`}
                  size={'sm'}
                  placeholder="Address"
                  disabled
                  defaultValue={
                    contactData ? contactData?.address : ''
                  }
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
              isLoading={addCustomerToRFQ.isLoading}
              disabled={
                !form.isValid ||
                addCustomerToRFQ.isLoading ||
                // customerList.isLoading ||
                contactManagerList.isLoading
              }
            >
              Add Vendor
            </Button>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
}

export default AddCustomerToRFQModal;
