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

import { BankModal } from '@/components/Modals/CustomerMaster/Bank';

type BankProps = {
  bankData: any;
  refreshFunction: () => void;
  customerId: any;
};

export function Bank({ bankData, refreshFunction, customerId }: BankProps) {
  const {
    isOpen: isModalOpen,
    onOpen: onModalOpen,
    onClose: onModalClose,
  } = useDisclosure();

  const [isEdit, setisEditClicked] = useState<boolean>(false);
  const [isView, setisViewClicked] = useState<boolean>(false);
  const [existValues, setExistValues] = useState<TODO>(null);

  const editItem = (item: any) => {
    setExistValues(item);
    setisEditClicked(true);
    onModalOpen();
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
          Customer Banking Details
        </Text>
        <HStack spacing={2} align="center">
          <Button
            leftIcon={<HiPlus />}
            colorScheme="brand"
            size={'sm'}
            minW={0}
            onClick={() => {
              setisEditClicked(false);
              onModalOpen();
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
              <Th color={'white'}>Beneficiary Name</Th>
              <Th color={'white'}>Bank Name</Th>
              <Th color={'white'}>Address</Th>
              <Th color={'white'}>Branch</Th>
              <Th color={'white'}>AC/IBAN No.</Th>
              <Th color={'white'}>Type of AC</Th>
              {/* <Th color={'white'}>Swift</Th>
        <Th color={'white'}>ABA Routing No.</Th>
        <Th color={'white'}>Contact Name</Th>
        <Th color={'white'}>Phone</Th>
        <Th color={'white'}>Fax</Th>
        <Th color={'white'}>Mobile</Th>
        <Th color={'white'}>Email</Th>
        <Th color={'white'}>Mode of Payment</Th>
        <Th color={'white'}>Payment Terms</Th>
        <Th color={'white'}>Total Credit Amount</Th>
        <Th color={'white'}>Total Credit Period</Th> */}
              <Th color={'white'} textAlign={'center'}>
                Action
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {bankData &&
              bankData.map((item: any, index: number) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td> {item?.beneficiary_name ?? '-'}</Td>
                  <Td> {item?.bank_name ?? '-'}</Td>
                  <Td>
                    <Text>{item?.bank_address ?? '-'} <br/> {item?.bank_address_line2 ?? '-'}</Text>
                  </Td>
                  <Td> {item?.bank_branch ?? '-'}</Td>
                  <Td> {item?.bank_ac_iban_no ?? '-'}</Td>
                  <Td> {item?.type_of_ac ?? '-'}</Td>
                  {/* <Td> {item?.bank_swift ?? '-'}</Td>
            <Td> {item?.aba_routing_no ?? '-'}</Td>
            <Td> {item?.contact_name ?? '-'}</Td>
            <Td> {item?.bank_phone ?? '-'}</Td>
            <Td> {item?.bank_fax ?? '-'}</Td>
            <Td> {item?.bank_mobile ?? '-'}</Td>
            <Td> {item?.bank_email ?? '-'}</Td>
            <Td> {item?.payment_mode?.name ?? '-'}</Td>
            <Td> {item?.payment_term?.name ?? '-'}</Td>
            <Td> {item?.total_credit_amount ?? '-'}</Td>
            <Td> {item?.total_credit_period ?? '-'}</Td> */}
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
            {bankData && bankData.length === 0 && (
              <Tr>
                <Td colSpan={8} textAlign={'center'}>
                  No Records Found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <BankModal
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
export default Bank;
