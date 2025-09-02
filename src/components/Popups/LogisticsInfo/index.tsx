import React from 'react';

import {
  Box,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { useCustomEntryList } from '@/services/submaster/customentry/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import DocumentDownloadButton from '@/components/DocumentDownloadButton';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  logisticsInfo: TODO;
  partInfo: any;
};

export const LogisticsInfoPopup = ({
  isOpen,
  onClose,
  logisticsInfo,
  partInfo,
}: ModalPopupProps) => {
  const closeModal = () => {
    onClose();
  };
  const customEntryList = useCustomEntryList();
  const shipType = useShipTypesList();

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      size="md"
      id="modal_logistics_Info"
      closeOnOverlayClick={false} 
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent maxWidth="60vw">
        <ModalHeader textAlign="center">
          <Text fontSize="lg" fontWeight="bold">
            Logistics Info
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box backgroundColor="gray.200" p={4} borderRadius="md">
            <Stack
              justify="space-between"
              align="center"
              spacing={8}
              direction={{ base: 'column', md: 'row' }}
              mb={2}
            >
              <Stack direction={{ base: 'column', md: 'row' }} width={'60%'}>
                <Text width="120px" fontSize={'md'}>
                  LO No
                </Text>
                <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                  {logisticsInfo?.id || 'N/A'}
                </Text>
              </Stack>
              <Stack direction={{ base: 'column', md: 'row' }} width={'40%'}>
                <Text width="120px" fontSize={'md'}>
                  STF No
                </Text>
                <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                  {logisticsInfo?.stf?.id || 'N/A'}
                </Text>
              </Stack>
            </Stack>

            <Stack
              justify="space-between"
              align="center"
              spacing={8}
              direction={{ base: 'column', md: 'row' }}
              mb={2}
            >
              <Stack direction={{ base: 'column', md: 'row' }} width={'60%'}>
                <Text width="120px" fontSize={'md'}>
                  Ship Type
                </Text>
                <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                  {shipType.data?.items[(logisticsInfo?.stf?.ship_type_id || 0)] || 'N/A'}
                </Text>
              </Stack>
              <Stack direction={{ base: 'column', md: 'row' }} width={'40%'}>
                <Text width="120px" fontSize={'md'}>
                  AWB/BL
                </Text>
                <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                  {logisticsInfo?.stf?.awb_number || 'N/A'}
                </Text>
              </Stack>
            </Stack>

            <Stack
              justify="space-between"
              align="center"
              spacing={8}
              direction={{ base: 'column', md: 'row' }}
              mb={2}
            >
              <Stack direction={{ base: 'column', md: 'row' }} width={'60%'}>
                <Text width="120px" fontSize={'md'}>
                  CI Value
                </Text>
                <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                  {logisticsInfo?.stf?.total_ci_value || 'N/A'}
                </Text>
              </Stack>
              <Stack direction={{ base: 'column', md: 'row' }} width={'40%'}>
                <Text width="120px" fontSize={'md'}>
                  PS No
                </Text>
                <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                  {logisticsInfo?.stf?.packing_slip_no || 'N/A'}
                </Text>
              </Stack>
            </Stack>

            <Stack
              justify="space-between"
              align="center"
              spacing={8}
              direction={{ base: 'column', md: 'row' }}
              mb={2}
            >
              <Stack direction={{ base: 'column', md: 'row' }} width={'60%'}>
                <Text width="120px" fontSize={'md'}>
                  CI No
                </Text>
                <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                  {logisticsInfo?.stf?.ci_number || 'N/A'}
                </Text>
              </Stack>
              <Stack direction={{ base: 'column', md: 'row' }} width={'40%'}>
                <Text width="120px" fontSize={'md'}>
                  PS Date
                </Text>
                <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                  {dayjs(logisticsInfo?.stf?.packing_slip_date).format(
                    'DD-MMM-YYYY'
                  ) || 'N/A'}
                </Text>
              </Stack>
            </Stack>

            <Stack
              justify="space-between"
              align="center"
              spacing={8}
              direction={{ base: 'column', md: 'row' }}
              mb={2}
            >
              <Stack direction={{ base: 'column', md: 'row' }} width={'60%'}>
                <Text width="120px" fontSize={'md'}>
                  DG
                </Text>
                <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                  {partInfo?.spare
                    ? partInfo?.spare?.is_dg === true
                      ? 'Yes'
                      : 'No'
                    : ' - '}
                </Text>
              </Stack>
            </Stack>

            {partInfo?.spare?.is_dg === true && (
              <Stack
                justify="space-between"
                align="center"
                spacing={8}
                direction={{ base: 'column', md: 'row' }}
                mb={2}
              >
                <Stack direction={{ base: 'column', md: 'row' }} width={'60%'}>
                  <Text width="120px" fontSize={'md'}>
                    Class
                  </Text>
                  <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                    {partInfo?.spare?.spare_class?.name || 'N/A'}
                  </Text>
                </Stack>
                <Stack direction={{ base: 'column', md: 'row' }} width={'40%'}>
                  <Text width="120px" fontSize={'md'}>
                    UN
                  </Text>
                  <Text as="span" fontSize={'md'} fontWeight="bold" flex={1}>
                    {partInfo?.spare?.un || 'N/A'}
                  </Text>
                </Stack>
              </Stack>
            )}

            <Stack
              justify="space-between"
              align="center"
              spacing={8}
              direction={{ base: 'column', md: 'row' }}
              mb={4}
            >
              <Stack direction={{ base: 'column', md: 'row' }} width={'60%'}>
                <Text width="120px" fontSize={'md'}>
                  MSDS
                </Text>
                <DocumentDownloadButton
                  url={partInfo?.spare?.msds || ''}
                  size="xs"
                />
              </Stack>
            </Stack>
            {logisticsInfo?.stf?.stf_customs &&
              logisticsInfo?.stf?.stf_customs.length > 0 && (
                <React.Fragment>
                  {logisticsInfo?.stf?.stf_customs.map(
                    (item: any, index: number) => (
                      <React.Fragment key={index}>
                        <Stack
                          justify="space-between"
                          align="center"
                          spacing={8}
                          direction={{ base: 'column', md: 'row' }}
                          mb={1}
                        >
                          <Stack
                            direction={{ base: 'column', md: 'row' }}
                            width={'60%'}
                          >
                            <Text width="120px" fontSize={'md'}>
                              Custom Entry {index + 1}
                            </Text>
                          </Stack>
                        </Stack>

                        <Stack
                          justify="space-between"
                          align="center"
                          spacing={8}
                          direction={{ base: 'column', md: 'row' }}
                          mb={2}
                        >
                          <Stack
                            direction={{ base: 'column', md: 'row' }}
                            width={'25%'}
                          >
                            <Text fontSize={'md'}>Custom Entry</Text>
                            <Text
                              as="span"
                              fontSize={'md'}
                              fontWeight="bold"
                              flex={1}
                            >
                               {customEntryList.data?.items[item?.custom_entry_id|| 0] || 'N/A'}
                            </Text>
                          </Stack>
                          <Stack
                            direction={{ base: 'column', md: 'row' }}
                            width={'20%'}
                          >
                            <Text fontSize={'md'}>BoE</Text>
                            <Text
                              as="span"
                              fontSize={'md'}
                              fontWeight="bold"
                              flex={1}
                            >
                              {item?.bill_of_entry || 'N/A'}
                            </Text>
                          </Stack>
                          <Stack
                            direction={{ base: 'column', md: 'row' }}
                            width={'25%'}
                          >
                            <Text fontSize={'md'}>BOE Date</Text>
                            <Text
                              as="span"
                              fontSize={'md'}
                              fontWeight="bold"
                              flex={1}
                            >
                              {dayjs(item?.bill_of_entry_date).format(
                                'DD-MMM-YYYY'
                              ) || 'N/A'}
                            </Text>
                          </Stack>
                          <Stack
                            direction={{ base: 'column', md: 'row' }}
                            width={'30%'}
                          >
                            <Text fontSize={'md'}>BOE</Text>
                            <DocumentDownloadButton
                              url={item?.bill_of_entry_file || ''}
                              size="xs"
                            />
                          </Stack>
                        </Stack>
                      </React.Fragment>
                    )
                  )}
                </React.Fragment>
              )}
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LogisticsInfoPopup;
