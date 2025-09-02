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

import { ContactManagerModal } from '@/components/Modals/CustomerMaster/ContactManager';

type ContactManagerProps = {
  contactManagerData: any;
  refreshFunction: () => void;
  customerId: any;
};

export function ContactManager({
  contactManagerData,
  refreshFunction,
  customerId,
}: ContactManagerProps) {
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
          Contact Manager Details
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
              <Th color={'white'}>Attention</Th>
              <Th color={'white'}>Address</Th>
              <Th color={'white'}>City</Th>
              <Th color={'white'}>Country</Th>
              <Th color={'white'}>Email.</Th>
              {/* <Th color={'white'}>Fax No</Th> */}
              <Th color={'white'}>Phone No</Th>
              {/* <Th color={'white'}>State/Province</Th>
                          <Th color={'white'}>Zip Code</Th> */}
              <Th color={'white'} textAlign={'center'}>
                Action
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {contactManagerData &&
              contactManagerData.map((item: any, index: number) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td> {item?.attention ?? '-'}</Td>
                  <Td>
                    <Text>{item?.address ?? ' - '}</Text>
                    {item?.address_line2 && (
                      <Text>{item?.address_line2 ?? ' - '}</Text>
                    )}
                  </Td>
                  <Td> {item?.city ?? '-'}</Td>
                  <Td> {item?.country ?? '-'}</Td>
                  <Td> {item?.email ?? '-'}</Td>
                  {/* <Td> {item?.fax ?? '-'}</Td> */}
                  <Td> {item?.phone ?? '-'}</Td>
                  {/* <Td> {item?.state ?? '-'}</Td>
                                <Td> {item?.zip_code ?? '-'}</Td> */}
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
            {contactManagerData && contactManagerData.length === 0 && (
              <Tr>
                <Td colSpan={8} textAlign={'center'}>
                  No Records Found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <ContactManagerModal
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
export default ContactManager;
