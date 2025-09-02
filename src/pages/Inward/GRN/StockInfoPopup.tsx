import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
  Icon,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { FaFile } from 'react-icons/fa';

import FieldDisplay from '@/components/FieldDisplay';
import useConditionName from '@/hooks/useConditionName';
import useTagTypeName from '@/hooks/useTagTypeName';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  stockInfo: any;
};

export const StockInfoPopup = ({
  isOpen,
  onClose,
  stockInfo,
}: ModalPopupProps) => {
  const closeModal = () => {
    onClose();
  };

  const handleFileDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="50vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Stock Info
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack mb={2}>
            <FieldDisplay
              label="Serial No"
              value={stockInfo?.serial_lot_number ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="CTRL ID"
              value={stockInfo?.control_id}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="Rec. Condition"
              value={useConditionName(stockInfo?.condition_id)}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="Quantity"
              value={stockInfo?.qty ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
          </HStack>
          <HStack mb={2}>
            <FieldDisplay
              label="UOM"
              value={stockInfo?.serial_lot_number ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="Qua.Status"
              value={stockInfo?.is_quarantine ? 'Quarantine' : 'Not Quarantine'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="PKG Info"
              value={stockInfo?.logistic_request_package?.package_number}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="Tag Type"
              value={useTagTypeName(stockInfo?.type_of_tag_id) ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
          </HStack>
          <HStack mb={2}>
            <FieldDisplay
              label="Tag Date"
              value={dayjs(stockInfo?.tag_date).format('DD-MM-YYYY') ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="Tag By"
              value={stockInfo?.tag_by}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="Trace"
              value={stockInfo?.trace}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="LLP"
              value={stockInfo?.llp}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="Shelf Life"
              value={dayjs(stockInfo?.shelf_life).format('DD-MM-YYYY')}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
          </HStack>
          <HStack mb={2}>
            <FieldDisplay
              label="Inspection Remarks"
              value={stockInfo?.remark ? stockInfo?.remark : ' - '}
              size="sm"
              isHtml={true}
              style={{ backgroundColor: '#fff' }}
            />
          </HStack>
          <HStack mb={2}>
            {stockInfo?.files && stockInfo?.files.length > 0 && (
              <Box p={0} m={0} border="none" bg="transparent">
                <Flex direction="column" gap={1}>
                  <Flex justify="space-between" align="center">
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        size="sm"
                        bg={'orange.300'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                        _hover={{
                          bg: 'orange.400',
                          color: 'white',
                        }}
                        _active={{
                          bg: 'orange.400',
                          color: 'white',
                        }}
                      >
                        <HStack spacing={2}>
                          <Icon as={FaFile} />
                          <Text>View Files</Text>
                        </HStack>
                      </MenuButton>
                      <MenuList>
                        {stockInfo?.files.map(
                          (file: any, fileIndex: number) => (
                            <MenuItem
                              key={fileIndex}
                              onClick={() =>
                                handleFileDownload(file.url, file.file_name)
                              }
                            >
                              {file.file_name}
                            </MenuItem>
                          )
                        )}
                      </MenuList>
                    </Menu>
                  </Flex>
                </Flex>
              </Box>
            )}
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default StockInfoPopup;
