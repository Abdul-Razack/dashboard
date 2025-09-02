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

import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import { PrincipleOfOwnerModal } from '@/components/Modals/CustomerMaster/PrincipleOfOwner';

type PrincipleOfOwnerProps = {
  principleData: any;
  refreshFunction: () => void;
  customerId: any;
};

export function PrincipleOfOwner({
  principleData,
  refreshFunction,
  customerId,
}: PrincipleOfOwnerProps) {
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
          Principle Of Owner Details
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
              <Th color={'white'}>Owner</Th>
              <Th color={'white'}>Phone</Th>
              <Th color={'white'}>Email</Th>
              <Th color={'white'}>ID/Passport Copy.</Th>
              <Th color={'white'}>Remarks</Th>
              <Th color={'white'} textAlign={'center'}>
                Action
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {principleData &&
              principleData.map((item: any, index: number) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td> {item?.owner ?? '-'}</Td>
                  <Td> {item?.phone ?? '-'}</Td>
                  <Td> {item?.email ?? '-'}</Td>
                  <Td>
                    <DocumentDownloadButton
                      size={'sm'}
                      url={item?.id_passport_copy || ''}
                    />
                  </Td>
                  <Td> {item?.remarks ?? '-'}</Td>
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
              {principleData && principleData.length === 0 && (
              <Tr>
                <Td colSpan={7} textAlign={'center'}>
                  No Records Found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </TableContainer>

      <PrincipleOfOwnerModal
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
export default PrincipleOfOwner;
