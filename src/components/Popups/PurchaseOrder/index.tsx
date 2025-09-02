import React from 'react';
import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { format } from 'date-fns';

import CurrencyDisplay from '@/components/CurrencyDisplay';
import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { LogisticsInfoPopup } from '@/components/Popups/LogisticsInfo';
import { PartInfoPopup } from '@/components/Popups/PartInfo';
import { StoreInfoPopup } from '@/components/Popups/StoreInfo';
import { getDisplayLabel, transformToSelectOptions } from '@/helpers/commonHelper';
import { postAPICall } from '@/services/apiService';
import {
  POStockResponsePayload,
  PayloadSchema,
} from '@/services/apiService/Schema/POStockSchema';
import { useFindByPartNumberId } from '@/services/spare/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  partNumber: any;
  options: TODO;
};

export const ModalPopup = ({
  isOpen,
  onClose,
  data,
  partNumber,
  options,
}: ModalPopupProps) => {
  const endPoints = import.meta.env.VITE_API_ENDPOINTS
    ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
    : {};
  const [showLoader, setLoading] = useState<boolean>(true);
  const [popupData, setPopupData] = useState<TODO>({});
  const [showPartInfo, setPartInfoModalOpen] = useState(false);
  const [showStoreInfo, setStoreInfoModalOpen] = useState(false);
  const [showLogisticsInfo, setLogisticsInfoModalOpen] = useState(false);
  const [logisticsInfo, setLogisticsInfo] = useState<TODO>({});
  const uomList = useUnitOfMeasureList();
  const uomOptions = transformToSelectOptions(uomList.data);
  const showLogisticsInfoPopup = (info: any) => {
    setLogisticsInfo(info);
    setLogisticsInfoModalOpen(true);
  };

  const showStoreInfoPopup = (info: any) => {
    setLogisticsInfo(info);
    setStoreInfoModalOpen(true);
  };

  const handleCloseModal = () => {
    setPartInfoModalOpen(false);
    setStoreInfoModalOpen(false);
    setLogisticsInfoModalOpen(false);
  };

  const closeModal = () => {
    setLoading(false);
    setPopupData({});
    onClose();
  };

  const getPartNumberInfo = async (part_number_id: number) => {
    try {
      const data = await postAPICall(
        endPoints.info.stock_part_info,
        { part_number_id: part_number_id },
        PayloadSchema,
        POStockResponsePayload
      );
      console.log(data);
      setPopupData(data.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const { data: partNumberDetails } = useFindByPartNumberId(partNumber);

  useEffect(() => {
    if (partNumber !== null) {
      getPartNumberInfo(partNumber);
    }
  }, [partNumber]);

  useEffect(() => {
    console.log(data);
  }, [partNumberDetails]);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={closeModal} size="xl">
      <ModalOverlay />
      <ModalContent maxWidth="80vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Part Number Info
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box borderRadius={4}>
            <Stack spacing={2} p={4} bg={'white'} borderRadius={'md'}>
              <Stack spacing={4}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label={'Part Number'}
                    value={
                      partNumberDetails?.part_number
                        ? partNumberDetails?.part_number?.part_number
                        : 'N/A'
                    }
                  />
                  <FieldDisplay
                    label={'Condition'}
                    value={
                      data?.formData?.condition_id
                        ? getDisplayLabel(
                            data.conditionOptions,
                            data?.formData.condition_id.toString() ?? 0,
                            'Condition'
                          )
                        : 'N/A'
                    }
                  />

                  <FieldDisplay
                    label={'Quantity'}
                    value={data?.formData?.qty || '0'}
                  />
                  <FieldDisplay
                    label={'UOM'}
                    value={
                      data?.formData?.unit_of_measure_id
                        ? getDisplayLabel(
                            data.uomOptions,
                            data?.formData.unit_of_measure_id.toString() ?? 0,
                            'UOM'
                          )
                        : 'N/A'
                    }
                  />
                  <FieldDisplay
                    label={'Remarks'}
                    value={data?.formData?.remarks || ' --- '}
                  />
                </Stack>
              </Stack>
            </Stack>
          </Box>

          <LoadingOverlay isLoading={showLoader} style={{ minHeight: '20vh' }}>
            {popupData?.stocks && (
              // && popupData?.stocks.length > 0
              <React.Fragment>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  mb={6}
                  textAlign={'center'}
                >
                  Stock Inventory Info
                </Text>
                <TableContainer
                  rounded={'md'}
                  overflow={'auto'}
                  my={4}
                  marginTop={5}
                  marginBottom={6}
                  border="1px solid black"
                  borderRadius="md"
                >
                  <Table variant="striped" size={'sm'}>
                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Part Number</Th>
                        <Th>Description</Th>
                        <Th>Condition</Th>
                        <Th>Available Qty</Th>
                        <Th>UOM</Th>
                        <Th>PO Price</Th>
                        <Th>Ctrl Id</Th>
                        <Th>Part info</Th>
                        <Th>Store info</Th>
                        <Th>Logistics info</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {popupData?.stocks.map((item: any, index: number) => (
                        <Tr key={index}>
                          <Td>{index + 1}</Td>
                          <Td>
                            {partNumberDetails?.part_number
                              ? partNumberDetails?.part_number?.part_number
                              : 'N/A'}
                          </Td>
                          <Td>
                            {partNumberDetails?.part_number
                              ? partNumberDetails?.part_number?.description
                              : 'N/A'}
                          </Td>
                          <Td>
                            {getDisplayLabel(
                              options.conditions,
                              item.condition_id.toString() ?? 0,
                              'Condition'
                            ) || 'N/A'}
                          </Td>
                          <Td>{item?.qty}</Td>
                          <Td>
                            {partNumberDetails?.part_number
                              ? getDisplayLabel(
                                                  uomOptions,
                                                  partNumberDetails?.part_number?.unit_of_measure_id ?? 0,
                                                  'uom'
                                                )
                              : 'N/A'}
                          </Td>
                          <Td>
                            <CurrencyDisplay
                              currencyId={
                                item.currency_id
                                  ? item.currency_id.toString()
                                  : ''
                              }
                            />
                            {item?.purchase_order_price}
                          </Td>
                          <Td>{item?.control_id}</Td>
                          <Td>
                            <Button
                              colorScheme="teal"
                              variant="link"
                              onClick={() => {
                                setPartInfoModalOpen(true);
                              }}
                            >
                              Click Button
                            </Button>
                          </Td>
                          <Td>
                            <Button
                              colorScheme="teal"
                              variant="link"
                              onClick={() => {
                                showStoreInfoPopup(item);
                              }}
                            >
                              Click Button
                            </Button>
                          </Td>
                          <Td>
                            <Button
                              colorScheme="teal"
                              variant="link"
                              onClick={() => {
                                showLogisticsInfoPopup(item);
                              }}
                            >
                              Click Button
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                      {popupData?.stocks.length === 0 && (
                        <Tr>
                          <Td textAlign={'center'} colSpan={11}>
                            No Records Found
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </React.Fragment>
            )}
            {popupData?.quotations && (
              // popupData?.quotations.length > 0 &&
              <React.Fragment>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  mb={3}
                  textAlign={'center'}
                >
                  Supplier Quotation Info
                </Text>

                <TableContainer
                  rounded={'md'}
                  overflow={'auto'}
                  my={4}
                  marginBottom={6}
                  border="1px solid black"
                  borderRadius="md"
                >
                  <Table variant="striped" size={'sm'}>
                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Part Number</Th>
                        <Th>Description</Th>
                        <Th>Condition</Th>
                        <Th>Quoted Qty</Th>
                        <Th>UOM</Th>
                        <Th>Quoted Price</Th>
                        <Th>Quotation Number</Th>
                        <Th>Quotation Validity</Th>
                        <Th>Part info</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {popupData?.quotations.map((item: any, index: number) => (
                        <Tr key={index}>
                          <Td>{index + 1}</Td>
                          <Td>
                            {partNumberDetails?.part_number
                              ? partNumberDetails?.part_number?.part_number
                              : 'N/A'}
                          </Td>
                          <Td>
                            {partNumberDetails?.part_number
                              ? partNumberDetails?.part_number?.description
                              : 'N/A'}
                          </Td>
                          <Td>
                            {getDisplayLabel(
                              options.conditions,
                              item.condition_id.toString() ?? 0,
                              'Condition'
                            ) || 'N/A'}
                          </Td>
                          <Td>{item.qty}</Td>
                          <Td>
                            {partNumberDetails?.part_number
                              ? getDisplayLabel(
                                                  uomOptions,
                                                  partNumberDetails?.part_number?.unit_of_measure_id ?? 0,
                                                  'uom'
                                                )
                              : 'N/A'}
                          </Td>
                          <Td>
                            <CurrencyDisplay
                              currencyId={
                                item?.quotation?.currency_id
                                  ? item?.quotation?.currency_id.toString()
                                  : ''
                              }
                            />
                            {item?.price}
                          </Td>
                          <Td>{item?.quotation?.vendor_quotation_no}</Td>
                          <Td>
                            {item?.quotation?.vendor_quotation_date
                              ? format(
                                  new Date(
                                    item?.quotation?.vendor_quotation_date
                                  ),
                                  'dd-MMM-yyyy'
                                ) + ' to '
                              : ' - ' + ' to '}
                            {item?.quotation?.expiry_date
                              ? format(
                                  new Date(item?.quotation?.expiry_date),
                                  'dd-MMM-yyyy'
                                )
                              : ' - '}
                          </Td>
                          <Td>
                            <Button
                              colorScheme="teal"
                              variant="link"
                              onClick={() => {
                                setPartInfoModalOpen(true);
                              }}
                            >
                              Click Button
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                      {popupData?.quotations.length === 0 && (
                        <Tr>
                          <Td textAlign={'center'} colSpan={10}>
                            No Records Found
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </React.Fragment>
            )}
            {popupData?.purchase_orders && (
              // && popupData?.purchase_orders.length > 0
              <React.Fragment>
                <Text
                  fontSize="md"
                  fontWeight="bold"
                  mb={4}
                  textAlign={'center'}
                >
                  Ongoing Purchase
                </Text>

                <TableContainer
                  rounded={'md'}
                  overflow={'auto'}
                  my={4}
                  marginTop={5}
                  marginBottom={6}
                  border="1px solid black"
                  borderRadius="md"
                >
                  <Table variant="striped" size={'sm'}>
                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Part Number</Th>
                        <Th>Description</Th>
                        <Th>Condition</Th>
                        <Th>Ordered Qty</Th>
                        <Th>UOM</Th>
                        <Th>PO Unit Price</Th>
                        <Th>PO Number</Th>
                        <Th>Delivery Details</Th>
                        <Th>Part info</Th>
                        {/* <Th>Logistics info</Th>
                          <Th>Store info</Th> */}
                        {/* <Th>Status</Th> */}
                      </Tr>
                    </Thead>
                    <Tbody>
                      {popupData?.purchase_orders.map(
                        (item: any, index: number) => (
                          <Tr key={index}>
                            <Td>{index + 1}</Td>
                            <Td>
                              {partNumberDetails?.part_number
                                ? partNumberDetails?.part_number?.part_number
                                : 'N/A'}
                            </Td>
                            <Td>
                              {partNumberDetails?.part_number
                                ? partNumberDetails?.part_number?.description
                                : 'N/A'}
                            </Td>
                            <Td>
                              {' '}
                              {getDisplayLabel(
                                options.conditions,
                                item.condition_id.toString() ?? 0,
                                'Condition'
                              ) || 'N/A'}
                            </Td>
                            <Td>{item?.qty}</Td>
                            <Td>
                              {partNumberDetails?.part_number
                                ? getDisplayLabel(
                                                    uomOptions,
                                                    partNumberDetails?.part_number?.unit_of_measure_id ?? 0,
                                                    'uom'
                                                  )
                                    ?.name
                                : 'N/A'}
                            </Td>
                            <Td>
                              <CurrencyDisplay
                                currencyId={
                                  item?.purchase_order?.currency_id
                                    ? item?.purchase_order?.currency_id.toString()
                                    : ''
                                }
                              />
                              {item?.price}
                            </Td>
                            <Td>PO-{item?.purchase_order_id}</Td>
                            <Td>{item?.note ?? ' - '}</Td>
                            <Td>
                              <Button
                                colorScheme="teal"
                                variant="link"
                                onClick={() => {
                                  setPartInfoModalOpen(true);
                                }}
                              >
                                Click Button
                              </Button>
                            </Td>
                            <Td display={'none'}>
                              <Button
                                colorScheme="teal"
                                variant="link"
                                onClick={() => {
                                  setLogisticsInfoModalOpen(true);
                                }}
                              >
                                Click Button
                              </Button>
                            </Td>
                            <Td display={'none'}>
                              <Button
                                colorScheme="teal"
                                variant="link"
                                onClick={() => {
                                  setStoreInfoModalOpen(true);
                                }}
                              >
                                Click Button
                              </Button>
                            </Td>
                            {/* <Td>Reserved-SEL15-1Qty</Td> */}
                          </Tr>
                        )
                      )}
                      {popupData?.purchase_orders.length === 0 && (
                        <Tr>
                          <Td textAlign={'center'} colSpan={10}>
                            No Records Found
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </React.Fragment>
            )}
          </LoadingOverlay>
          <PartInfoPopup
            isOpen={showPartInfo}
            onClose={() => {
              handleCloseModal();
            }}
            partNumber={partNumber}
          ></PartInfoPopup>

          <StoreInfoPopup
            isOpen={showStoreInfo}
            onClose={() => {
              handleCloseModal();
            }}
            logisticsInfo={logisticsInfo}
          ></StoreInfoPopup>

          <LogisticsInfoPopup
            isOpen={showLogisticsInfo}
            onClose={() => {
              handleCloseModal();
            }}
            logisticsInfo={logisticsInfo}
            partInfo={partNumberDetails}
          ></LogisticsInfoPopup>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ModalPopup;
