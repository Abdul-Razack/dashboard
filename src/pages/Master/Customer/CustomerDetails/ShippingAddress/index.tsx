import { useState } from 'react';

import { DeleteIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  HStack,
  IconButton,
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
import { HiEye, HiPlus } from 'react-icons/hi';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { CustomerShippingAddressModal } from '@/components/Modals/CustomerMaster/ShippingAddress';
import { fetchShippingAddressInfo } from '@/services/master/shipping/services';

type ShippingAddressProps = {
  shippingData: any;
  refreshFunction: () => void;
  customerId: any;
  customerInfo: any;
};

export function ShippingAddress({
  shippingData,
  refreshFunction,
  customerId,
  customerInfo,
}: ShippingAddressProps) {
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();
  const getShippingAddressInfo = fetchShippingAddressInfo();
  const [confirmStatus, toggleConfirmation] = useState<boolean>(false);
  const [isEdit, setisEditClicked] = useState<boolean>(false);
  const [isView, setisViewClicked] = useState<boolean>(false);
  const [existValues, setExistValues] = useState<TODO>(null);
  const [isCancel, toggleCancelStatus] = useState(localStorage.getItem('skip_default') || null);  
  const editItem = (item: any) => {
    setExistValues(item);
    setisEditClicked(true);
    onModalOpen();
  };

  const handleConfirm = async () => {
    try {
      const shippingAddressInfo = await getShippingAddressInfo(2);
      setExistValues(shippingAddressInfo);
      onModalOpen();
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      toggleConfirmation(false);
    }
  };

  const viewItem = (item: any) => {
    setExistValues(item);
    setisViewClicked(true);
    onModalOpen();
  };

  const handleClose = () => {
    onModalClose();
    setExistValues(null);
    setisEditClicked(false);
    setisViewClicked(false);
  };

   const closeConfirmation = () => {
    toggleConfirmation(false);
    toggleCancelStatus('yes');
    localStorage.setItem('skip_default', 'yes');
    onModalOpen();
  };

  return (
    <Box
      bg={'white'}
      borderRadius={'md'}
      borderTopRightRadius={0}
      borderTopLeftRadius={0}
      boxShadow={'md'}
      borderWidth={1}
      borderColor={'gray.200'}
      p={4}
      minHeight={'73vh'}
    >
      <HStack justify={'space-between'} mb={2}>
        <Text fontSize="md" fontWeight="700">
          Customer Shipping Details
        </Text>
        <HStack spacing={2} align="center">
          <Button
            leftIcon={<HiPlus />}
            colorScheme="brand"
            size={'sm'}
            minW={0}
            onClick={() => {
              if (
                customerInfo?.contact_type?.name === 'PURCHASE VENDOR' &&
                shippingData.length === 0 && isCancel === null
              ) {
                toggleConfirmation(true);
              } else {
                setisEditClicked(false);
                onModalOpen();
              }
            }}
            type={'button'}
          >
            Add New
          </Button>
        </HStack>
      </HStack>
      <TableContainer
        overflow={'auto'}
        border="1px"
        borderColor="#0C2556"
        boxShadow="md"
      >
        <Table variant="striped" size={'sm'}>
          <Thead bg={'#0C2556'}>
            <Tr>
              <Th color={'white'}>S.NO</Th>
              <Th color={'white'}>Consignee Name</Th>
              <Th color={'white'}>Attention</Th>
              <Th color={'white'}>Address</Th>
              {/* <Th color={'white'}>City</Th> */}
              <Th color={'white'}>Country.</Th>
              <Th color={'white'}>Email</Th>
              {/* <Th color={'white'}>Fax No</Th> */}
              <Th color={'white'}>Phone No</Th>
              {/* <Th color={'white'}>State</Th>
                          <Th color={'white'}>Zip Code</Th> */}
              <Th color={'white'} textAlign={'center'}>
                Action
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {shippingData &&
              shippingData.map((item: any, index: number) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td> {item?.consignee_name ?? '-'}</Td>
                  <Td> {item?.attention ?? '-'}</Td>
                  <Td>
                    <Text>{item?.address ?? '-'}</Text>
                    {item?.address_line2 && (
                      <Text>{item?.address_line2 ?? '-'}</Text>
                    )}
                  </Td>
                  <Td> {item?.country ?? '-'}</Td>
                  <Td> {item?.email ?? '-'}</Td>
                  <Td> {item?.phone ?? '-'}</Td>
                  <Td textAlign={'center'}>
                    <IconButton
                      aria-label="View Popup"
                      colorScheme="green"
                      size={'sm'}
                      icon={<HiEye />}
                      onClick={() => viewItem(item)}
                      mr={2}
                    />

                    <IconButton
                      aria-label="Edit"
                      icon={<EditIcon />}
                      size="sm"
                      variant="@primary"
                      onClick={() => editItem(item)}
                      mr={2}
                    />

                    <IconButton
                      aria-label="Delete Row"
                      colorScheme="red"
                      size={'sm'}
                      icon={<DeleteIcon />}
                      display={'none'}
                      onClick={() => console.log('Delete Clicked')}
                      mr={2}
                    />
                  </Td>
                </Tr>
              ))}
            {shippingData && shippingData.length === 0 && (
              <Tr>
                <Td colSpan={8} textAlign={'center'}>
                  No Records Found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <ConfirmationPopup
        isOpen={confirmStatus}
        onClose={closeConfirmation}
        onConfirm={handleConfirm}
        headerText="Shipping Address!!!"
        bodyText="Are you sure you want to use Yestechnic Address as default shipping address?"
      />

      <CustomerShippingAddressModal
        isOpen={isModalOpen}
        onClose={() => {
          refreshFunction();
          handleClose();
        }}
        isEdit={isEdit}
        isView={isView}
        customerId={customerId ?? 0}
        existValues={existValues}
      />
    </Box>
  );
}
export default ShippingAddress;
