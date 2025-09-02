import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

import { useBinLocationList } from '@/services/submaster/bin-location/services';
import { useRackList } from '@/services/submaster/rack/services';
import { useWarehouseList } from '@/services/submaster/warehouse/services';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  logisticsInfo?: TODO;
};

export const StoreInfoPopup = ({
  isOpen,
  onClose,
  logisticsInfo,
}: ModalPopupProps) => {
  const closeModal = () => {
    onClose();
  };

  const warehouseList = useWarehouseList();
  const binLocationList = useBinLocationList();
  const rackList = useRackList();

  console.log(logisticsInfo);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="60vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Store Info
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody minHeight={'50vh'}>
          <Box
            borderColor={'black'}
            padding={'1'}
            backgroundColor="gray.200"
            whiteSpace="white-space"
          >
            <Flex alignItems={'center'} justify="center" p={2}>
              <Box p={0} m={0} border="none" bg="transparent">
                <Flex direction="column" gap={1}>
                  <Flex justify="space-between" align="center">
                    <Text marginEnd={10}>Control Id:</Text>
                    <Text fontWeight={'bold'}>{logisticsInfo?.control_id}</Text>
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          </Box>
          <TableContainer
            border="1px"
            borderColor="gray.500"
            boxShadow="md"
            borderTopWidth={'0'}
          >
            <Table variant="striped" size={'sm'}>
              <Thead bg={'#0C2556'}>
                <Tr>
                  <Th color={'white'}>S.No</Th>
                  <Th color={'white'}>BIN LOC</Th>
                  <Th color={'white'}>Rack</Th>
                  <Th color={'white'}>Warehouse</Th>
                  <Th color={'white'}>Quantity</Th>
                  <Th color={'white'}>Remarks</Th>
                </Tr>
              </Thead>
              <Tbody>
                {logisticsInfo?.grns &&
                  logisticsInfo?.grns.length > 0 &&
                  logisticsInfo?.grns.map((item: any, index: number) => (
                    <Tr key={index}>
                      <Td>{index + 1} </Td>
                      <Td>
                        {binLocationList.data?.items[
                          item?.bin_location_id || 0
                        ] || 'N/A'}{' '}
                      </Td>
                      <Td>
                        {rackList.data?.items[item?.rack_id || 0] || 'N/A'}{' '}
                      </Td>
                      <Td>
                        {warehouseList.data?.items[item?.warehouse_id || 0] ||
                          'N/A'}{' '}
                      </Td>
                      <Td>{item?.qty} </Td>
                      <Td>{item?.remark || 'N/A'} </Td>
                    </Tr>
                  ))}
                {logisticsInfo?.grns && logisticsInfo?.grns.length === 0 && (
                  <Tr>
                    <Td textAlign={'center'} colSpan={6}>
                      No Records Found
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default StoreInfoPopup;
