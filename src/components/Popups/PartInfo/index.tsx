import React, { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { HiOutlineInformationCircle } from 'react-icons/hi';

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
import { useUNDetails } from '@/services/submaster/un/services';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  partNumber: any;
};

export const PartInfoPopup = ({
  isOpen,
  onClose,
  partNumber,
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
  const [showAllAlternates, setShowAllAlternates] = useState<boolean>(false);
  const [unId, setUNId] = useState<number | null>(null);
  const { data: UNDetails } = useUNDetails(unId ? unId : '', {
    enabled: unId !== null && unId !== 0,
  });

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
      <ModalContent maxWidth="60vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Part Number Info
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
              {/* Part Number and Description - First Row */}
              <Flex justify="space-between" p={2}>
                <Box width="48%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      Part Number:
                    </Text>
                    <Text fontWeight={'bold'} flex={1}>
                      {partNumberDetails?.part_number?.part_number}
                    </Text>
                  </Flex>
                </Box>
                <Box width="48%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      Description:
                    </Text>
                    <Text fontWeight={'bold'} flex={1}>
                      {partNumberDetails?.part_number?.description}
                    </Text>
                  </Flex>
                </Box>
              </Flex>

              <Flex justify="space-between" p={2}>
                <Box width="48%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      Manufac.Name:
                    </Text>
                    <Text fontWeight={'bold'} flex={1}>
                      {partNumberDetails?.part_number?.manufacturer_name ??
                        ' - '}
                    </Text>
                  </Flex>
                </Box>
                <Box width="48%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      Cage Code:
                    </Text>
                    <Text fontWeight={'bold'} flex={1}>
                      {partNumberDetails?.part_number?.cage_code ?? ' - '}
                    </Text>
                  </Flex>
                </Box>
              </Flex>

              {/* Alt. Part Numbers - Full Width */}
           <Flex p={2}>
  <Box width="100%" p={0} m={0} border="none" bg="transparent">
    <Flex align="flex-start">
      <Text width="140px" flexShrink={0}>
        Alt.Parts:
      </Text>
      <Box flex={1}>
        {partNumberDetails?.part_number?.alternates &&
        partNumberDetails?.part_number?.alternates?.length > 0 ? (
          <Box>
            {/* First line with 3 items + Show More button */}
            <Flex wrap="wrap" alignItems="center" gap={1}>
              {partNumberDetails.part_number.alternates
                .slice(0, showAllAlternates ? partNumberDetails.part_number.alternates.length : 5)
                .map((item: any, index: number) => (
                  item?.alternate_part_number?.part_number && (
                    <React.Fragment key={index}>
                      <Text fontWeight="bold">
                        {item.alternate_part_number.part_number}
                      </Text>
                      {index < (showAllAlternates 
                        ? partNumberDetails.part_number.alternates.length - 1 
                        : Math.min(4, partNumberDetails.part_number.alternates.length - 1)
                      ) && <Text>,</Text>}
                    </React.Fragment>
                  )
                ))}
              
              {partNumberDetails.part_number.alternates.length > 5 && !showAllAlternates && (
                <Button
                  variant="link"
                  size="sm"
                  colorScheme="blue"
                  onClick={() => setShowAllAlternates(true)}
                  ml={1}
                >
                  Show More
                </Button>
              )}
            </Flex>

            {/* Additional lines when expanded */}
            {showAllAlternates && partNumberDetails.part_number.alternates.length > 5 && (
              <Flex wrap="wrap" alignItems="center" gap={1} mt={1}>
                <Button
                  variant="link"
                  size="sm"
                  colorScheme="blue"
                  onClick={() => setShowAllAlternates(false)}
                >
                  Show Less
                </Button>
              </Flex>
            )}
          </Box>
        ) : (
          <Text fontWeight="bold">None</Text>
        )}
      </Box>
    </Flex>
  </Box>
</Flex>
              {/* Shelf Life, DG, LLP - Second Row */}
              <Flex justify="space-between" p={2}>
                <Box width="30%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      Shelf Life:
                    </Text>
                    <Text fontWeight={'bold'} flex={1}>
                      {partNumberDetails?.part_number
                        ? partNumberDetails?.part_number?.is_shelf_life === true
                          ? `Yes (${partNumberDetails?.part_number?.total_shelf_life} Days)`
                          : 'No'
                        : ' - '}
                    </Text>
                  </Flex>
                </Box>
                <Box width="40%" p={0} m={0} border="none" bg="transparent">
                  {partNumberDetails?.part_number?.is_dg === false && (
                    <Flex align="center">
                      <Text width="100px" flexShrink={0}>
                        DG:
                      </Text>
                      <Text fontWeight={'bold'} flex={1}>
                        No
                      </Text>
                    </Flex>
                  )}
                  {partNumberDetails?.part_number?.is_dg === true && (
                    <Flex align="center">
                      <Text flexShrink={0} mr={2}>
                        DG:
                      </Text>
                      <Flex
                        flex={1}
                        align="center"
                        gap={2}
                        wrap="nowrap"
                        overflow="hidden"
                      >
                        <Text fontWeight="bold" mr={2}>
                          Yes
                        </Text>
                        {UNDetails?.item && (
                          <>
                            <Text whiteSpace="nowrap">
                              UN:{' '}
                              <Text as="span" fontWeight="bold">
                                {UNDetails?.item?.name}
                              </Text>
                            </Text>
                            <Tooltip
                              hasArrow
                              label={UNDetails?.item?.description}
                              placement="top"
                            >
                              <IconButton
                                aria-label="UN Info"
                                icon={<HiOutlineInformationCircle />}
                                variant="ghost"
                                size="xs"
                                minW="auto"
                                mr={2}
                              />
                            </Tooltip>
                            <Text whiteSpace="nowrap">
                              Class:{' '}
                              <Text as="span" fontWeight="bold">
                                {UNDetails?.item?.classs}
                              </Text>
                            </Text>
                          </>
                        )}
                      </Flex>
                    </Flex>
                  )}
                </Box>
                <Box width="20%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      LLP:
                    </Text>
                    <Text fontWeight={'bold'} flex={1}>
                      {partNumberDetails?.part_number
                        ? partNumberDetails?.part_number?.is_llp === true
                          ? 'Yes'
                          : 'No'
                        : ' - '}
                    </Text>
                  </Flex>
                </Box>
              </Flex>

              {/* HSC Code, Spare Model, ATA, Type - Third Row */}
              <Flex justify="space-between" p={2}>
                <Box width="23%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      HSC Code:
                    </Text>
                    <Text fontWeight={'bold'} flex={1}>
                      {getDisplayLabel(
                        hscCodeOptions,
                        partNumberDetails?.part_number?.hsc_code_id ?? 0,
                        'code'
                      ) || 'N/A'}
                    </Text>
                  </Flex>
                </Box>
                <Box width="23%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      Spare Model:
                    </Text>
                    <Text fontWeight={'bold'} flex={1}>
                      {getDisplayLabel(
                        spareModelOptions,
                        partNumberDetails?.part_number?.spare_model_id ?? 0,
                        'model'
                      ) || 'N/A'}
                    </Text>
                  </Flex>
                </Box>
                <Box width="23%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      ATA:
                    </Text>
                    <Text fontWeight={'bold'} flex={1}>
                      {partNumberDetails?.part_number?.ata
                        ? partNumberDetails?.part_number?.ata
                        : 'N/A'}
                    </Text>
                  </Flex>
                </Box>
                <Box width="23%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      Type:
                    </Text>
                    <Text fontWeight={'bold'} flex={1}>
                      {getDisplayLabel(
                        spareTypeOptions,
                        partNumberDetails?.part_number?.spare_type_id ?? 0,
                        'model'
                      ) || 'N/A'}
                    </Text>
                  </Flex>
                </Box>
              </Flex>

              {/* MSDS and IPC Ref - Fourth Row */}
              <Flex justify="space-between" p={2}>
                <Box width="48%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      MSDS:
                    </Text>
                    <Box flex={1}>
                      <DocumentDownloadButton
                        url={partNumberDetails?.part_number?.msds || ''}
                        size={'sm'}
                      />
                    </Box>
                  </Flex>
                </Box>
                <Box width="48%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      IPC Ref:
                    </Text>
                    <Box flex={1}>
                      <DocumentDownloadButton
                        url={partNumberDetails?.part_number?.ipc_ref || ''}
                        size={'sm'}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>

              {/* Picture and XREF - Fifth Row */}
              <Flex justify="space-between" p={2}>
                <Box width="48%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      Picture:
                    </Text>
                    <Box flex={1}>
                      <DocumentDownloadButton
                        url={partNumberDetails?.part_number?.picture || ''}
                        size={'sm'}
                      />
                    </Box>
                  </Flex>
                </Box>
                <Box width="48%" p={0} m={0} border="none" bg="transparent">
                  <Flex align="center">
                    <Text width="140px" flexShrink={0}>
                      XREF:
                    </Text>
                    <Box flex={1}>
                      <DocumentDownloadButton
                        url={partNumberDetails?.part_number?.xref || ''}
                        size={'sm'}
                      />
                    </Box>
                  </Flex>
                </Box>
              </Flex>
            </Box>
          </LoadingOverlay>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PartInfoPopup;
