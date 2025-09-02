import { useEffect, useState } from 'react';

import { ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Checkbox,
  HStack,
  IconButton,
  Link,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { HiEye, HiPrinter } from 'react-icons/hi';
import { LuPlus } from 'react-icons/lu';
import { TbMailForward } from 'react-icons/tb';

import LoadingOverlay from '@/components/LoadingOverlay';
import { useToastError, useToastSuccess } from '@/components/Toast';
import AddCustomerToRFQModal from '@/pages/Purchase/Quotation/AddCustomerToRFQModal';
import { getAPICall } from '@/services/apiService';
import { BulkCustomerListSchema } from '@/services/apiService/Schema/CustomerSchema';
import { useResendEmailAlert } from '@/services/email-alert/services';
import { usePRFQDetails } from '@/services/purchase/prfq/services';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  prfqInfo: any;
  triggerView?: (data: any, forVendor: boolean, rowId: number) => void;
};
const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};
export const PRFQCustomersPopup = ({
  isOpen,
  onClose,
  prfqInfo,
  triggerView,
}: ModalPopupProps) => {
  const [clickedIndex, setClickedIndex] = useState<Number>(0);
  const [showViewLoader, setViewLoader] = useState<boolean>(false);
  const [showLoader, setLoading] = useState<boolean>(true);
  const [refreshPRFQ, reloadPRFQ] = useState<boolean>(false);
  const [isAllChecked, setAllChecked] = useState<boolean>(false);
  const [customersList, setCustomersList] = useState<TODO>([]);
  const [selectedContacts, setSelectedContacts] = useState<TODO>([]);
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const {
    data: prfqDetails,
    isLoading,
    refetch: refreshPRFQInfo,
  } = usePRFQDetails(Number(prfqInfo?.id), { enabled: refreshPRFQ });
  const {
    isOpen: isVendorAddOpen,
    onOpen: onVendorAddOpen,
    onClose: onVendorAddClose,
  } = useDisclosure();

  const triggerMail = useResendEmailAlert({
    onSuccess: () => {
      toastSuccess({
        title: 'Email alert send successfully',
      });
      resetParams();
    },
    onError: (error) => {
      toastError({
        title: 'Error while sending Email alert',
        description: error.response?.data.message,
      });
    },
  });

  const closeModal = () => {
    onClose();
  };

  const clickViewButton = (rowId: number, item: any) => {
    if (triggerView) {
      console.log(item);
      setViewLoader(true);
      setClickedIndex(rowId);
      triggerView(prfqDetails?.data, true, item.id);
      setTimeout(() => {
        setViewLoader(false);
      }, 2000);
    }
  };

  const getCustomerList = async (customerIds: any, prfqCustomers: any) => {
    try {
      const response = await getAPICall(
        endPoints.bulk.customer_by_customer_id_bulk,
        BulkCustomerListSchema,
        { customer_ids: customerIds }
      );
      const customers = response?.data;

      const updatedCustomers = customers.map((customer: TODO) => {
        const match = prfqCustomers.find(
          (cm: TODO) => cm.customer_id === customer.id
        );
        return {
          ...customer,
          contact_manager_id: match?.customer_contact_manager_id,
          quotation_fulfillment: match?.quotation_fulfillment,
          token: match?.token,
        };
      });

      const updatedData = updatedCustomers.map((item: any) => {
        return {
          ...item,
          contact_person: item.customer_contact_managers.find(
            (contact: any) =>
              Number(contact.id) === Number(item.contact_manager_id)
          ),
        };
      });

      setCustomersList(updatedData);
      setLoading(false);
      reloadPRFQ(false);
    } catch (err) {
      setLoading(false);
      reloadPRFQ(false);
      console.log(err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      reloadPRFQ(true);
      const customerIds = prfqInfo?.customers.map(
        (item: any) => item.customer_id
      );
      setCustomersList([]);
      getCustomerList(customerIds, prfqInfo?.customers);
      setLoading(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (refreshPRFQ === true) {
      if (prfqDetails?.data) {
        const customerIds = prfqDetails?.data?.customers.map(
          (item: any) => item.customer_id
        );
        setCustomersList([]);
        getCustomerList(customerIds, prfqDetails?.data?.customers);
      }
    }
  }, [refreshPRFQ, prfqDetails?.data]);

  useEffect(() => {
    if (refreshPRFQ === true) {
      setLoading(true);
      refreshPRFQInfo();
    }
  }, [refreshPRFQ]);

  const resetParams = () => {
    setSelectedContacts([]);
    setAllChecked(false);
  };

  useEffect(() => {
    console.log(customersList);
  }, [customersList]);

  const checkAll = (status: boolean) => {
    let vendorIds: any = [];
    setAllChecked(status);
    if (status) {
      vendorIds = customersList
        .filter((obj: any) => obj?.contact_person?.email)
        .map((obj: any) => obj?.contact_person?.id);
      console.log(vendorIds);
    }
    setCustomersList((prevState: any) =>
      prevState.map((item: any) => ({
        ...item,
        is_checked: item?.contact_person?.email ? status : false,
      }))
    );

    setSelectedContacts(vendorIds);
  };

  const toggleCustomer = (status: boolean, id: number, index: number) => {
    console.log(status, id);
    setAllChecked(false);
    if (status) {
      setSelectedContacts((prevState: any) => [...prevState, id]);
    } else {
      setSelectedContacts((prevState: any) =>
        prevState.filter((item: any) => item !== id)
      );
    }

    setCustomersList((prevState: any) =>
      prevState.map((item: any, key: number) =>
        key === index ? { ...item, is_checked: status } : item
      )
    );
  };

  const sendMailNotification = (contacts: any) => {
    let obj: any = {};
    obj.email_type = 'prfq_created';
    obj.rfq_id = prfqInfo?.id;
    obj.customer_contact_manager_ids = contacts;
    triggerMail.mutate(obj);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      size="md"
      blockScrollOnMount={false}
      closeOnOverlayClick={false} 
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent maxWidth="75vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            PRFQ #{prfqInfo?.id} - Vendors
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody minHeight={'70vh'}>
          <LoadingOverlay
            isLoading={showLoader || showViewLoader || isLoading}
            style={{ minHeight: '20vh' }}
          >
            <HStack justify={'space-between'} mb={2}>
              <Text fontSize="md" fontWeight="700">
                List of Vendors
              </Text>
              <HStack spacing={2} align="center">
                <Button
                  colorScheme="green"
                  size={'sm'}
                  minW={0}
                  title={'send Email to Selected Vendor'}
                  onClick={() => onVendorAddOpen()}
                  leftIcon={<LuPlus />}
                >
                  New Vendor
                </Button>

                <Button
                  colorScheme="brand"
                  size={'sm'}
                  minW={0}
                  title={'send Email to Selected Vendor'}
                  isDisabled={selectedContacts.length === 0}
                  onClick={() => sendMailNotification(selectedContacts)}
                  isLoading={triggerMail.isLoading}
                >
                  Email to Selected Vendor
                </Button>
              </HStack>
            </HStack>
            <TableContainer border="1px" borderColor="#0C2556" boxShadow="md">
              <Table variant="striped" size={'sm'}>
                <Thead bg={'#0C2556'}>
                  <Tr>
                    <Th color={'white'}>
                      <Checkbox
                        variant="subtle"
                        colorScheme="red"
                        onChange={(e) => checkAll(e.target.checked)}
                        isChecked={isAllChecked}
                        marginRight={2}
                        sx={{
                          backgroundColor: 'primary.200', // Default background color
                          borderColor: 'primary.400', // Default border color
                        }}
                        size={'lg'}
                      />
                    </Th>
                    <Th color={'white'}>S.No</Th>
                    <Th color={'white'}>PRFQ No</Th>
                    <Th color={'white'}>Ful.Per</Th>
                    <Th color={'white'}>Ven.Name</Th>
                    <Th color={'white'}>Ven.Code</Th>
                    <Th color={'white'}>Contact</Th>
                    <Th color={'white'}>Address</Th>
                    <Th color={'white'}>Email</Th>
                    <Th color={'white'} textAlign={'center'}>
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {customersList.map((item: any, index: number) => (
                    <Tr key={index}>
                      <Td>
                        <Checkbox
                          variant="subtle"
                          colorScheme="red"
                          isChecked={item.is_checked === true}
                          onChange={(e) =>
                            toggleCustomer(
                              e.target.checked,
                              item?.contact_person?.id,
                              index
                            )
                          }
                          marginRight={2}
                          sx={{
                            backgroundColor: 'primary.200', // Default background color
                            borderColor: 'primary.400', // Default border color
                          }}
                          size={'lg'}
                          isDisabled={!item?.contact_person?.email}
                        />
                      </Td>
                      <Td>{index + 1} </Td>
                      <Td>{prfqInfo?.id ?? ' - '}</Td>
                      <Td>{item?.quotation_fulfillment ?? '0'} %</Td>
                      <Td>{item.business_name ?? ' - '}</Td>
                      <Td>{item.code ?? ' - '}</Td>
                      <Td>{item?.contact_person?.attention ?? ' - '}</Td>
                      <Td>
                        <Text>{item?.contact_person?.address}</Text>
                        <Text>{item?.contact_person?.address_line2}</Text>
                      </Td>
                      <Td>{item?.contact_person?.email ?? ' - '}</Td>

                      <Td textAlign={'center'}>
                        <IconButton
                          aria-label="View Popup"
                          colorScheme="green"
                          size={'sm'}
                          icon={<TbMailForward />}
                          isDisabled={!item?.contact_person?.email}
                          onClick={() => {
                            sendMailNotification([item?.contact_person?.id]);
                          }}
                          mr={2}
                        />

                        <IconButton
                          aria-label="view"
                          icon={<HiEye />}
                          size="sm"
                          variant="@primary"
                          onClick={() => clickViewButton(index, item)}
                          isLoading={clickedIndex === index && showViewLoader}
                          mr={2}
                        />

                        <Link href={`/preview/prfq/${item.token}`} isExternal>
                          <IconButton
                            aria-label="Preview"
                            icon={<HiPrinter />}
                            colorScheme="orange"
                            size={'sm'}
                            mr={2}
                          />
                        </Link>

                        {Number(item?.quotation_fulfillment) !== 0 ? (
                          <Link
                            href={`/purchase/quotation?rfq=${prfqInfo?.id}&customer=${item?.id}`}
                            isExternal
                          >
                            <IconButton
                              aria-label="Open Quotation"
                              icon={<ExternalLinkIcon />}
                              size="sm"
                              variant="solid"
                              colorScheme="teal"
                            />
                          </Link>
                        ) : (
                          <IconButton
                            aria-label="Disabled Link"
                            icon={<ExternalLinkIcon />}
                            size="sm"
                            variant="solid"
                            colorScheme="gray"
                            isDisabled
                          />
                        )}
                      </Td>
                    </Tr>
                  ))}
                  {customersList.length === 0 && !showLoader && (
                    <Tr>
                      <Td textAlign={'center'} colSpan={9}>
                        No Records Found
                      </Td>
                    </Tr>
                  )}
                  {customersList.length === 0 && showLoader && (
                    <Tr>
                      <Td textAlign={'center'} colSpan={9}>
                        Loading ....
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>
            <Box p={4} mt={4}>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify={'center'}
                alignItems={'center'}
                display={'flex'}
              >
                <Button
                  colorScheme="red"
                  size={'sm'}
                  isDisabled={showLoader}
                  onClick={onClose}
                >
                  Close
                </Button>
              </Stack>
            </Box>
          </LoadingOverlay>
        </ModalBody>
      </ModalContent>
      <AddCustomerToRFQModal
        isOpen={isVendorAddOpen}
        onClose={() => {
          reloadPRFQ(true);
          setTimeout(() => {
            refreshPRFQInfo();
            onVendorAddClose();
          }, 800);
        }}
        rfqId={prfqInfo?.id ?? 0}
      />
    </Modal>
  );
};

export default PRFQCustomersPopup;
