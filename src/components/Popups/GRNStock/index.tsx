import React, { useEffect, useState } from 'react';

import {
  HStack,
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

import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import FieldDisplay from '@/components/FieldDisplay';
import {
  getDisplayLabel,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import useConditionName from '@/hooks/useConditionName';
import useTagTypeName from '@/hooks/useTagTypeName';
import { useFindByPartNumberId } from '@/services/spare/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};

export const GRNStockInfo = ({ isOpen, onClose, data }: ModalPopupProps) => {
  const closeModal = () => {
    onClose();
  };
  const [part_number_id, setPartNumberID] = useState<number>(0);
  const { data: partNumberDetails } = useFindByPartNumberId(part_number_id, {enabled: isOpen});
  const uomList = useUnitOfMeasureList();
  const uomOptions = transformToSelectOptions(uomList.data);
  
  useEffect(() => {
    if (Object.keys(data).length > 0) {
      if (!data.isExist) {
        setPartNumberID(data?.part_number_id);
      } else {
        setPartNumberID(data?.stock_data?.part_number_id);
      }
    }
  }, [data]);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} size="xl" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="60vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Stock Info
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={2} p={4}>
            <HStack mb={2}>
              <FieldDisplay
                label="Ctrl ID"
                value={
                  !data.isExist
                    ? data?.control_id
                    : data?.stock_data?.control_id
                }
                size={'sm'}
              />
              <FieldDisplay
                label="Rec CN"
                value={
                  !data.isExist
                    ? useConditionName(data?.condition_id)
                    : useConditionName(data?.stock_data?.condition_id)
                }
                size={'sm'}
              />
              <FieldDisplay
                label="S/N"
                value={
                  !data.isExist
                    ? data?.serial_lot_number
                    : data?.stock_data?.serial_lot_number
                }
                size={'sm'}
              />
              <FieldDisplay
                label="Qty"
                value={!data.isExist ? data?.qty : data?.stock_data?.qty}
                size={'sm'}
              />
            </HStack>
            <HStack mb={2}>
              <FieldDisplay
                label="UOM"
                value={
                  getDisplayLabel(
                    uomOptions,
                    partNumberDetails?.part_number?.unit_of_measure_id ?? 0,
                    'uom'
                  ) || 'N/A'
                }
                size={'sm'}
              />
              <FieldDisplay
                label="QT Status"
                value={
                  !data.isExist
                    ? data?.is_quarantine
                      ? 'Quarantine'
                      : 'Not Quarantine'
                    : data?.stock_data?.is_quarantine
                      ? 'Quarantine'
                      : 'Not Quarantine'
                }
                size={'sm'}
              />

              <FieldDisplay
                label="PKG Info"
                value={
                  !data.isExist
                    ? data?.logistic_request_package?.package_number
                    : data?.stock_data?.logistic_request_package?.package_number
                }
                size={'sm'}
              />

              <FieldDisplay
                label="Tag Type"
                value={
                  useTagTypeName(
                    !data.isExist
                      ? data?.type_of_tag_id
                      : data?.stock_data?.type_of_tag_id
                  ) ?? 'N/A'
                }
                size={'sm'}
              />
            </HStack>
            <HStack mb={2}>
              <FieldDisplay
                label="Tag Date"
                value={
                  dayjs(
                    !data.isExist ? data?.tag_date : data?.stock_data?.tag_date
                  ).format('DD-MM-YYYY') ?? 'N/A'
                }
                size={'sm'}
              />
              <FieldDisplay
                label="Tag By"
                value={
                  !data.isExist
                    ? data?.tag_by
                    : data?.stock_data?.tag_by ?? 'N/A'
                }
                size={'sm'}
              />
              <FieldDisplay
                label="Trace"
                value={
                  !data.isExist ? data?.trace : data?.stock_data?.trace ?? 'N/A'
                }
                size={'sm'}
              />

              <FieldDisplay
                label="LLP"
                value={
                  !data.isExist ? data?.llp : data?.stock_data?.llp ?? 'N/A'
                }
                size={'sm'}
              />
            </HStack>
            <HStack mb={2}>
              <FieldDisplay
                label="Shelf Life"
                value={
                  dayjs(
                    !data.isExist
                      ? data?.shelf_life
                      : data?.stock_data?.shelf_life
                  ).format('DD-MM-YYYY') ?? 'N/A'
                }
                size={'sm'}
              />
              <FieldDisplay
                label="Warehouse"
                value={getDisplayLabel(
                  data.warehouseOptions,
                  data?.warehouse_id?.toString() ?? 0,
                  'Ware House'
                )}
                size={'sm'}
              />
              <FieldDisplay
                label="Rack"
                value={getDisplayLabel(
                  (
                    !data.isExist
                      ? data?.is_quarantine
                      : data?.stock_data?.is_quarantine
                  )
                    ? data?.quarantineRacks
                    : data?.nonQuarantineRacks,
                  data?.rack_id?.toString() ?? 0,
                  'Rack'
                )}
                size={'sm'}
              />

              <FieldDisplay
                label="Bin Location"
                value={getDisplayLabel(
                  data.binLocationOptions,
                  data?.bin_location_id?.toString() ?? 0,
                  'Bin Location'
                )}
                size={'sm'}
              />
            </HStack>
            <HStack mb={2}>
              <FieldDisplay
                label="Remarks"
                value={
                  !data.isExist
                    ? data?.remarks && data?.remarks.length > 0
                      ? data?.remarks
                      : ' - '
                    : data?.remark && data?.remark.length > 0
                      ? data?.remark
                      : ' - '
                }
                size={'sm'}
              />
              <FieldDisplay
                label="Insp Remarks"
                value={
                  !data.isExist
                    ? data?.remark && data?.remark.length > 0
                      ? data?.remark
                      : ' - '
                    : data?.stock_data?.remark &&
                        data?.stock_data?.remark.length > 0
                      ? data?.stock_data?.remark
                      : ' - '
                }
                isHtml={
                  !data.isExist
                    ? data?.remark && data?.remark.length > 0
                      ? true
                      : false
                    : data?.stock_data?.remark &&
                        data?.stock_data?.remark.length > 0
                      ? true
                      : false
                }
                size={'sm'}
              />
            </HStack>
          </Stack>
          {data?.files && data?.files.length > 0 && (
            <Stack spacing={2} padding={4} paddingTop={0}>
              <Text fontSize={'sm'} fontWeight={'medium'}>
                Files
              </Text>
              {data?.files &&
                data?.files.map((file: any, fileIndex: number) => (
                  <React.Fragment key={fileIndex}>
                    <HStack mb={2}>
                      <Text fontSize="md" fontWeight="bold">
                        {file?.file_name}
                      </Text>
                    </HStack>
                    <HStack>
                      <DocumentDownloadButton
                        size={'sm'}
                        url={file?.url || ''}
                      />
                    </HStack>
                  </React.Fragment>
                ))}
            </Stack>
          )}
          {data?.stock_data?.files && data?.stock_data?.files.length > 0 && (
            <Stack spacing={2} padding={4} paddingTop={0}>
              <Text fontSize={'sm'} fontWeight={'medium'}>
                Files
              </Text>
              {data?.stock_data?.files &&
                data?.stock_data?.files.map((file: any, fileIndex: number) => (
                  <React.Fragment key={fileIndex}>
                    <HStack mb={2}>
                      <Text fontSize="md" fontWeight="bold">
                        {file?.file_name}
                      </Text>
                    </HStack>
                    <HStack>
                      <DocumentDownloadButton
                        size={'sm'}
                        url={file?.url || ''}
                      />
                    </HStack>
                  </React.Fragment>
                ))}
            </Stack>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default GRNStockInfo;
