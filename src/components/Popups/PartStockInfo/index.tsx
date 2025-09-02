import React, { useEffect, useState } from 'react';

import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import dayjs from 'dayjs';

import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import LoadingOverlay from '@/components/LoadingOverlay';
import {
  getDisplayLabel,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { useFindByPartNumberId } from '@/services/spare/services';
import { useHscCodeList } from '@/services/submaster/hsc-code/services';
import { useSpareModelList } from '@/services/submaster/sparemodel/services';
import { useSpareTypeList } from '@/services/submaster/sparetype/services';
import { useTypeOfTagList } from '@/services/submaster/type-of-tag/services';
import { useUNDetails } from '@/services/submaster/un/services';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  partNumber: any;
  logisticsInfo: TODO;
};

export const PartStockInfoPopup = ({
  isOpen,
  onClose,
  partNumber,
  logisticsInfo,
}: ModalPopupProps) => {
  const closeModal = () => {
    onClose();
  };
  const spareModelList = useSpareModelList({enabled: isOpen});
  const spareTypeList = useSpareTypeList({enabled: isOpen});
  const hscCodeList = useHscCodeList({enabled: isOpen});
  const spareModelOptions = transformToSelectOptions(spareModelList.data);
  const spareTypeOptions = transformToSelectOptions(spareTypeList.data);
  const hscCodeOptions = transformToSelectOptions(hscCodeList.data);

  const [unId, setUNId] = useState<number | null>(null);
  const { data: UNDetails } = useUNDetails(unId ? unId : '', {
    enabled: unId !== null && unId !== 0,
  });

  const tagType = useTypeOfTagList();
  const { data: partNumberDetails, isLoading: isLoading } =
    useFindByPartNumberId(partNumber, { enabled: isOpen === true });

  useEffect(() => {
    if (partNumberDetails) {
      setUNId(partNumberDetails?.part_number?.un_id);
    }
  }, [partNumberDetails]);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="75vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Part Number Stock Info
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <LoadingOverlay isLoading={isLoading} style={{ minHeight: '20vh' }}>
            <Box
              borderColor={'black'}
              padding={'1'}
              backgroundColor="gray.200"
              whiteSpace="white-space"
              mb={4}
            >
              <Flex justify="space-between" p={2}>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Part Number:</Text>
                      <Text fontWeight={'bold'}>
                        {partNumberDetails?.part_number?.part_number}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Description:</Text>
                      <Text fontWeight={'bold'}>
                        {partNumberDetails?.part_number?.description}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
              <Flex justify="space-between" p={2}>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Alt. Partnumbers:</Text>
                      <Text fontWeight={'bold'}>
                        {partNumberDetails?.part_number?.alternates
                          .map((item: any) => item?.part_number?.part_number)
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
              <Flex justify="space-between" p={2}>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Shelf Life:</Text>
                      <Text fontWeight={'bold'}>
                        {partNumberDetails?.part_number
                          ? partNumberDetails?.part_number?.is_shelf_life ===
                            true
                            ? 'Yes'
                            : 'No'
                          : ' - '}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>DG:</Text>
                      <Text fontWeight={'bold'}>
                        {partNumberDetails?.part_number
                          ? partNumberDetails?.part_number?.is_dg === true
                            ? 'Yes'
                            : 'No'
                          : ' - '}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
                {partNumberDetails?.part_number?.is_shelf_life === true && (
                  <Box p={0} m={0} border="none" bg="transparent">
                    <Flex direction="column" gap={1}>
                      <Flex justify="space-between" align="center">
                        <Text marginEnd={10}>LLP:</Text>
                        <Text fontWeight={'bold'}>
                          {partNumberDetails?.part_number
                            ? partNumberDetails?.part_number?.is_llp === true
                              ? 'Yes'
                              : 'No'
                            : ' - '}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                )}
              </Flex>

              <Flex justify="space-between" p={2}>
                {partNumberDetails?.part_number?.is_shelf_life === true && (
                  <Box p={0} m={0} border="none" bg="transparent">
                    <Flex direction="column" gap={1}>
                      <Flex justify="space-between" align="center">
                        <Text marginEnd={10}>Total Shelf Life:</Text>
                        <Text fontWeight={'bold'}>
                          {partNumberDetails?.part_number?.total_shelf_life ||
                            'N/A'}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                )}
                {partNumberDetails?.part_number?.is_dg === true && (
                  <React.Fragment>
                    {UNDetails?.item && (
                      <React.Fragment>
                        <Box p={0} m={0} border="none" bg="transparent">
                          <Flex direction="column" gap={1}>
                            <Flex justify="space-between" align="center">
                              <Text marginEnd={10} fontSize={'md'}>
                                Class:
                              </Text>
                              <Text
                                as="span"
                                fontSize={'md'}
                                fontWeight="bold"
                                flex={1}
                              >
                                {UNDetails?.item?.name}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                        <Box p={0} m={0} border="none" bg="transparent">
                          <Flex direction="column" gap={1}>
                            <Flex justify="space-between" align="center">
                              <Text marginEnd={10} fontSize={'md'}>
                                UN:
                              </Text>
                              <Text
                                as="span"
                                fontSize={'md'}
                                fontWeight="bold"
                                flex={1}
                              >
                               {UNDetails?.item?.classs}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                      </React.Fragment>
                    )}
                  </React.Fragment>
                )}
              </Flex>

              <Flex justify="space-between" p={2}>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>HSC Code:</Text>
                      <Text fontWeight={'bold'}>
                        {getDisplayLabel(
                          hscCodeOptions,
                          partNumberDetails?.part_number?.hsc_code_id ?? 0,
                          'code'
                        ) || 'N/A'}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>

                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Spare Model:</Text>
                      <Text fontWeight={'bold'}>
                        {getDisplayLabel(
                          spareModelOptions,
                          partNumberDetails?.part_number?.spare_model_id ?? 0,
                          'model'
                        ) || 'N/A'}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>ATA:</Text>
                      <Text fontWeight={'bold'}>
                        {partNumberDetails?.part_number?.ata
                          ? partNumberDetails?.part_number?.ata
                          : 'N/A'}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>

              <Flex justify="space-between" p={2}>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Type:</Text>
                      <Text fontWeight={'bold'}>
                        {getDisplayLabel(
                          spareTypeOptions,
                          partNumberDetails?.part_number?.spare_type_id ?? 0,
                          'model'
                        ) || 'N/A'}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>

                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Tag Date:</Text>
                      <Text fontWeight={'bold'}>
                        {dayjs(logisticsInfo?.tag_date).format('DD-MMM-YYYY') ||
                          'N/A'}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>

                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Tag By:</Text>
                      <Text fontWeight={'bold'}>
                        {logisticsInfo?.tag_by || 'N/A'}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>

              <Flex justify="space-between" p={2}>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Trace:</Text>
                      <Text fontWeight={'bold'}>
                        {logisticsInfo?.trace || 'N/A'}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>

                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Type of Tag:</Text>
                      <Text fontWeight={'bold'}>
                        {tagType.data?.items[
                          logisticsInfo?.type_of_tag_id || 0
                        ] || 'N/A'}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
              <Flex justify="space-between" p={2}>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>MSDS:</Text>
                      <Text fontWeight={'bold'}>
                        <DocumentDownloadButton
                          url={partNumberDetails?.part_number?.msds || ''}
                          size={'sm'}
                        />
                      </Text>
                    </Flex>
                  </Flex>
                </Box>

                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>IPC Ref:</Text>
                      <Text fontWeight={'bold'}>
                        <DocumentDownloadButton
                          url={partNumberDetails?.part_number?.ipc_ref || ''}
                          size={'sm'}
                        />
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>

              <Flex justify="space-between" p={2}>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Picture:</Text>
                      <Text fontWeight={'bold'}>
                        <DocumentDownloadButton
                          url={partNumberDetails?.part_number?.picture || ''}
                          size={'sm'}
                        />
                      </Text>
                    </Flex>
                  </Flex>
                </Box>

                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>XRE:</Text>
                      <Text fontWeight={'bold'}>
                        <DocumentDownloadButton
                          url={partNumberDetails?.part_number?.xref || ''}
                          size={'sm'}
                        />
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>

              <Flex justify="space-between" p={2}>
                <Box p={0} m={0} border="none" bg="transparent">
                  <Flex direction="column" gap={1}>
                    <Flex justify="space-between" align="center">
                      <Text marginEnd={10}>Serial/Lot Number:</Text>
                      <Text fontWeight={'bold'}>
                        {logisticsInfo?.serial_lot_number || 'N/A'}
                      </Text>
                    </Flex>
                  </Flex>
                </Box>
                {partNumberDetails?.part_number?.is_shelf_life === true && (
                  <Box p={0} m={0} border="none" bg="transparent">
                    <Flex direction="column" gap={1}>
                      <Flex justify="space-between" align="center">
                        <Text marginEnd={10}>Shelf Life of Part:</Text>
                        <Text fontWeight={'bold'}>
                          {dayjs(logisticsInfo?.shelf_life).format(
                            'DD-MMM-YYYY'
                          ) || 'N/A'}
                        </Text>
                      </Flex>
                    </Flex>
                  </Box>
                )}
              </Flex>

              {logisticsInfo?.files &&
                logisticsInfo?.files.length > 0 &&
                logisticsInfo?.files.map((item: any, index: number) => (
                  <Flex justify="space-between" p={2} key={index}>
                    <Box p={0} m={0} border="none" bg="transparent">
                      <Flex direction="column" gap={1}>
                        <Flex justify="space-between" align="center">
                          <Text marginEnd={10}>{item?.file_name}:</Text>
                          <Text fontWeight={'bold'}>
                            <DocumentDownloadButton
                              url={item?.url || ''}
                              size={'sm'}
                            />
                          </Text>
                        </Flex>
                      </Flex>
                    </Box>
                  </Flex>
                ))}
            </Box>
          </LoadingOverlay>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PartStockInfoPopup;
