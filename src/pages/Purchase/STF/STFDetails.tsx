import React, { useEffect, useState } from 'react';

import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Heading,
  IconButton,
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
import dayjs from 'dayjs';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';

import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import {
  getDisplayLabel,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { useLogisticsRequestDetails } from '@/services/logistics/request/services';
import { usePurchaseOrderDetails } from '@/services/purchase/purchase-orders/services';
import { useSTFDetails } from '@/services/purchase/stf/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useCustomEntryList } from '@/services/submaster/customentry/services';
import { useFOBList } from '@/services/submaster/fob/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useShipAccountList } from '@/services/submaster/ship-account/services';
import { useShipModesList } from '@/services/submaster/ship-modes/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

import PartDetails from '../Quotation/PartDetails';
import PartNumberDetails from './PartNumberDetails';

const STFDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [LRId, setLRId] = useState<any>(0);
  const [poId, setPOId] = useState<any>(0);
  const [packageOptions, setPackageOptions] = useState<any>([]);
  const [obtainedItems, setObtainedItems] = useState<any>([]);
  const [notObtainedItems, setNotObtainedItems] = useState<any>([]);
  const { data: details, isLoading, isSuccess } = useSTFDetails(Number(id));
  const { data: LRdetails } = useLogisticsRequestDetails(LRId);
  const { data: poDetails } = usePurchaseOrderDetails(poId);
  const packageTypeList = usePackageTypeList();
  const packageTypeOptions = transformToSelectOptions(packageTypeList.data);

  const [loading, setLoading] = useState(true);

  const displayPurchaseIDs = (items: any) => {
    let returnText = '0';
    if (items.length > 0) {
      returnText = items.map((item: any) => item.purchase_order_id).join(', ');
    }
    return returnText;
  };

  const getPackageInfo = (item: any) => {
    let packageInfo = packageOptions.find(
      (packagedetail: any) => packagedetail.logistic_request_package_id === item
    );
    if (packageInfo) {
      return packageInfo.package_number;
    } else {
      return ' - ';
    }
  };

  useEffect(() => {
    if (isSuccess && details && details.data) {
      setPackageOptions(details?.data?.packages);
      setLRId(details?.data?.logistic_request_id);
    }
  }, [isSuccess, details]);

  useEffect(() => {
    if (poDetails && poDetails.data) {
      setLoading(false);
    }
  }, [poDetails]);

  useEffect(() => {
    if (LRdetails && LRdetails.data) {
      let obtained: any = [];
      let notobtained: any = [];
      LRdetails.data.items?.forEach((item: any) => {
        if (item.logistic_request_package_id === null) {
          notobtained.push(item);
        } else {
          obtained.push(item);
        }
      });
      setObtainedItems(obtained);
      setNotObtainedItems(notobtained);
      setPOId(LRdetails.data.purchase_orders[0].id);
    }
  }, [LRdetails]);

  const shipModeList = useShipModesList();
  const conditionList = useConditionList();
  const uomList = useUnitOfMeasureList();
  const shipTypeList = useShipTypesList();
  const shipViaList = useShipViaList();
  const shipAccList = useShipAccountList();
  const fobList = useFOBList();
  const priorityList = usePriorityList();
  const customEntryList = useCustomEntryList();

  return (
    <SlideIn>
      <Stack pl={2} spacing={2}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Breadcrumb
              fontWeight="medium"
              fontSize="sm"
              separator={<ChevronRightIcon boxSize={6} color="gray.500" />}
            >
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink as={Link} to="/purchase/stf">
                  STF List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>STF Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              STF Details
            </Heading>
          </Stack>

          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/purchase/stf/${id}/edit`)}
            />
            <ResponsiveIconButton
              variant={'@primary'}
              icon={<HiArrowNarrowLeft />}
              size={'sm'}
              fontWeight={'thin'}
              onClick={() => navigate(-1)}
            >
              Back
            </ResponsiveIconButton>
          </HStack>
        </HStack>

        <Box borderRadius={4}>
          <LoadingOverlay isLoading={isLoading || loading}>
            <Stack
              spacing={2}
              p={4}
              bg={'white'}
              borderRadius={'md'}
              boxShadow={'lg'}
            >
              <Stack spacing={4}>
                <Stack
                  spacing={4}
                  p={4}
                  bg={'white'}
                  borderRadius={'md'}
                  boxShadow={'md'}
                  borderWidth={1}
                  borderColor={'gray.200'}
                >
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldDisplay
                      size={'sm'}
                      label="STF Type"
                      value={details?.data.type || 'N/A'}
                    />
                    <FieldDisplay
                      size={'sm'}
                      label={'STF No'}
                      value={
                        LRdetails?.data
                          ? LRdetails?.data?.customer?.code +
                            '-' +
                            details?.data?.id
                          : ' Loading ...'
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="STF Date"
                      value={
                        dayjs(LRdetails?.data?.created_at).format(
                          'DD/MM/YYYY'
                        ) || 'N/A'
                      }
                    />
                    <FieldDisplay size={'sm'} label="Ref" value={'N/A'} />

                    <FieldDisplay
                      size={'sm'}
                      label="LR No"
                      value={details?.data?.logistic_request_id || 'N/A'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="Ref Date"
                      value={
                        dayjs(LRdetails?.data?.created_at).format('DD/MM/YYYY') ||
                        'N/A'
                      }
                    />
                  </Stack>
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldDisplay
                      size={'sm'}
                      label="Ref No"
                      value={
                        LRdetails?.data
                          ? displayPurchaseIDs(LRdetails.data.purchase_orders)
                          : ' - '
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="LR Date"
                      value={
                        dayjs(LRdetails?.data?.created_at).format('DD/MM/YYYY') ||
                        'N/A'
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Vendor (consignor)"
                      value={
                        LRdetails?.data?.customer
                          ? LRdetails?.data?.customer.business_name
                          : ' - '
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label={'Vendor Code'}
                      value={
                        LRdetails?.data
                          ? LRdetails?.data?.customer?.code
                          : ' - '
                      }
                    />
                    <FieldDisplay size={'sm'} label="LO No" value={'N/A'} />
                    <FieldDisplay
                      size={'sm'}
                      label="LO Date"
                      value={
                        dayjs(details?.data?.ci_date).format('DD/MM/YYYY') ||
                        'N/A'
                      }
                    />
                  </Stack>
                </Stack>

                <Stack
                  spacing={4}
                  p={4}
                  bg={'white'}
                  borderRadius={'md'}
                  boxShadow={'md'}
                  borderWidth={1}
                  borderColor={'gray.200'}
                >
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldDisplay
                      size={'sm'}
                      label="Vendor Attention"
                      value={
                        LRdetails?.data
                          ? LRdetails?.data?.receiver_shipping_address
                              ?.attention
                          : ' - '
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Consignee"
                      value={
                        LRdetails?.data
                          ? LRdetails?.data?.customer_shipping_address
                              ?.attention
                          : ' - '
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Consignor Address"
                      value={
                        LRdetails?.data
                          ? LRdetails?.data?.receiver_shipping_address?.address
                          : ' - '
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Consignee Address"
                      value={
                        LRdetails?.data
                          ? LRdetails?.data?.customer_shipping_address?.address
                          : ' - '
                      }
                    />
                  </Stack>
                </Stack>

                <Stack
                  spacing={4}
                  p={4}
                  bg={'white'}
                  borderRadius={'md'}
                  boxShadow={'md'}
                  borderWidth={1}
                  borderColor={'gray.200'}
                >
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldDisplay
                      size={'sm'}
                      label="No of Package"
                      value={details?.data.packages.length || 'N/A'}
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Goods Type"
                      value={LRdetails?.data.is_dg === true ? 'DG' : 'Non-DG'}
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Volumetric Weight(AWB)"
                      value={LRdetails?.data.volumetric_weight + 'KG' || 'N/A'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="Volumetric Weight(AWB)"
                      value={details?.data.volumetric_weight + 'KG' || 'N/A'}
                    />
                  </Stack>
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldDisplay
                      size={'sm'}
                      label="Priority"
                      value={
                        priorityList.data?.items[
                          LRdetails?.data.priority_id ?? 0
                        ] || 'N/A'
                      }
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="Ship Type"
                      value={
                        shipTypeList.data?.items[
                          LRdetails?.data.ship_type_id ?? 0
                        ] || 'N/A'
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Ship Mode"
                      value={
                        shipModeList.data?.items[
                          poDetails?.data.ship_mode_id ?? 0
                        ] || 'N/A'
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Ship Via"
                      value={
                        shipViaList.data?.items[
                          LRdetails?.data.ship_via_id ?? 0
                        ] || 'N/A'
                      }
                    />
                  </Stack>
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldDisplay
                      size={'sm'}
                      label="Ship A/C"
                      value={
                        shipAccList.data?.items[
                          poDetails?.data.ship_account_id ?? 0
                        ] || 'N/A'
                      }
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="FOB"
                      value={
                        fobList.data?.items[poDetails?.data.fob_id ?? 0] ||
                        'N/A'
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="AWB/BL"
                      value={details?.data?.awb_number || 'N/A'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="Total CI Value"
                      value={details?.data?.total_ci_value || 'N/A'}
                    />
                  </Stack>

                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldDisplay
                      size={'sm'}
                      label="CI No"
                      value={details?.data?.ci_number || 'N/A'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="CI Date"
                      value={
                        dayjs(details?.data?.ci_date).format('DD/MM/YYYY') ||
                        'N/A'
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Packing Slip No (Vendor)"
                      value={details?.data?.packing_slip_no || 'N/A'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="PS Date"
                      value={
                        dayjs(details?.data?.packing_slip_date).format(
                          'DD/MM/YYYY'
                        ) || 'N/A'
                      }
                    />
                  </Stack>

                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldDisplay
                      label="Remarks"
                      value={LRdetails?.data?.remark || 'N/A'}
                      isHtml={true}
                    />
                  </Stack>
                </Stack>
                {details?.data?.customs_entries &&
                  details?.data?.customs_entries.length > 0 && (
                    <Stack
                      spacing={4}
                      p={4}
                      bg={'white'}
                      borderRadius={'md'}
                      boxShadow={'md'}
                      borderWidth={1}
                      borderColor={'gray.200'}
                    >
                      <Stack>
                        <HStack justify={'space-between'}>
                          <Text fontSize="md" fontWeight="700">
                            Custom Entries
                          </Text>
                        </HStack>

                        <TableContainer
                          rounded={'md'}
                          overflow={'auto'}
                          border="1px"
                          borderColor="gray.500"
                          borderRadius="md"
                          boxShadow="md"
                        >
                          <Table variant="striped" size={'sm'}>
                            <Thead bg={'gray.500'}>
                              <Tr>
                                <Th color={'white'}>S.NO</Th>
                                <Th color={'white'}>Custom Entry</Th>
                                <Th color={'white'}>Bill of Entry</Th>
                                <Th color={'white'}>BOE Date</Th>
                                <Th color={'white'}>BOE Document</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {details?.data?.customs_entries.map(
                                (item, index) => (
                                  <Tr key={item.id}>
                                    <Td>{index + 1}</Td>
                                    <Td>
                                      {customEntryList.data?.items[
                                        item.custom_entry_id ?? 0
                                      ] || 'N/A'}
                                    </Td>
                                    <Td>{item.bill_of_entry}</Td>
                                    <Td>
                                      {dayjs(item.bill_of_entry_date).format(
                                        'DD/MM/YYYY'
                                      )}
                                    </Td>
                                    <Td>
                                      <DocumentDownloadButton
                                        url={item.bill_of_entry_file || ''}
                                        style={{ width: '200px' }}
                                      />
                                    </Td>
                                  </Tr>
                                )
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </Stack>
                    </Stack>
                  )}

                <Stack
                  spacing={4}
                  p={4}
                  bg={'white'}
                  borderRadius={'md'}
                  boxShadow={'md'}
                  borderWidth={1}
                  borderColor={'gray.200'}
                >
                  <Stack>
                    <HStack justify={'space-between'}>
                      <Text fontSize="md" fontWeight="700">
                        Not Obtained Items
                      </Text>
                    </HStack>

                    <TableContainer
                      rounded={'md'}
                      overflow={'auto'}
                      border="1px"
                      borderColor="gray.500"
                      borderRadius="md"
                      boxShadow="md"
                    >
                      <Table variant="striped" size={'sm'}>
                        <Thead bg={'gray.500'}>
                          <Tr
                            sx={{
                              th: {
                                borderColor: 'gray.500',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                              },
                            }}
                          >
                            <Th color={'white'}>S.No </Th>
                            <Th color={'white'}>Part No#</Th>
                            <Th color={'white'}>Desc</Th>
                            <Th color={'white'}>Condition</Th>
                            <Th color={'white'}>Goods Type</Th>
                            <Th color={'white'}>PO Num</Th>
                            <Th color={'white'}>PO Tot.Qty</Th>
                            <Th color={'white'}>Tot Rec.Qty</Th>
                            <Th color={'white'}>Add.Qty</Th>
                            <Th color={'white'}>LR Qty</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {notObtainedItems.length === 0 && (
                            <Tr>
                              <Td colSpan={11} textAlign="center">
                                No data available
                              </Td>
                            </Tr>
                          )}
                          {notObtainedItems.map((item: any, index: number) => (
                            <Tr key={item.id}>
                              <Td>{index + 1} </Td>
                              <PartDetails partNumber={item.part_number_id} />
                              <Td>
                                {conditionList.data?.items?.[
                                  item.condition_id
                                ] || 'N/A'}
                              </Td>
                              <PartNumberDetails
                                part_number={item.part_number_id}
                                type="goods_type"
                              />
                              <Td>{item.purchase_order_id}</Td>
                              <Td>{item.qty}</Td>
                              <Td>0</Td>
                              <Td>0</Td>
                              <Td>0</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Stack>
                </Stack>

                <Stack
                  spacing={4}
                  p={4}
                  bg={'white'}
                  borderRadius={'md'}
                  boxShadow={'md'}
                  borderWidth={1}
                  borderColor={'gray.200'}
                >
                  <Stack>
                    <HStack justify={'space-between'}>
                      <Text fontSize="md" fontWeight="700">
                        Obtained Items
                      </Text>
                    </HStack>

                    <TableContainer
                      rounded={'md'}
                      overflow={'auto'}
                      border="1px"
                      borderColor="gray.500"
                      borderRadius="md"
                      boxShadow="md"
                    >
                      <Table variant="striped" size={'sm'}>
                        <Thead bg={'gray.500'}>
                          <Tr>
                            <Th color={'white'}>S.no</Th>
                            <Th color={'white'}>Package</Th>
                            <Th color={'white'}>Part No</Th>
                            <Th color={'white'}>Desc</Th>
                            <Th color={'white'}>Condition</Th>
                            <Th color={'white'}>Goods Type</Th>
                            <Th color={'white'}>PO Num</Th>
                            <Th color={'white'}>PO Tot.Qty</Th>
                            <Th color={'white'}>Tot Rec.Qty</Th>
                            <Th color={'white'}>Add.Qty</Th>
                            <Th color={'white'}>LR Qty</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {obtainedItems.length === 0 && (
                            <Tr>
                              <Td colSpan={14} textAlign="center">
                                No data available
                              </Td>
                            </Tr>
                          )}
                          {obtainedItems.map((item: any, index: number) => (
                            <Tr key={item.id}>
                              <Td> {index + 1} </Td>
                              <Td>
                                {getPackageInfo(
                                  item.logistic_request_package_id
                                )}
                              </Td>
                              <PartDetails partNumber={item.part_number_id} />
                              <Td>
                                {conditionList.data?.items?.[
                                  item.condition_id
                                ] || 'N/A'}
                              </Td>
                              <PartNumberDetails
                                part_number={item.part_number_id}
                                type="goods_type"
                              />
                              <Td>{item.purchase_order_id}</Td>
                              <Td>{item.qty}</Td>
                              <Td>0</Td>
                              <Td>0</Td>
                              <Td>0</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Stack>
                </Stack>

                <Stack
                  spacing={4}
                  p={4}
                  bg={'white'}
                  borderRadius={'md'}
                  boxShadow={'md'}
                  borderWidth={1}
                  borderColor={'gray.200'}
                >
                  <HStack justify={'space-between'}>
                    <Text fontSize="md" fontWeight="700">
                      Packages
                    </Text>
                  </HStack>

                  <TableContainer
                    rounded={'md'}
                    overflow={'auto'}
                    border="1px"
                    borderColor="gray.500"
                    borderRadius="md"
                    boxShadow="md"
                  >
                    <Table variant="simple" size={'sm'}>
                      <Thead bg={'gray.500'}>
                        <Tr
                          sx={{
                            th: {
                              borderColor: 'gray.500',
                              borderWidth: '1px',
                              borderStyle: 'solid',
                            },
                          }}
                        >
                          <Th rowSpan={2} color={'white'}>
                            Package
                          </Th>
                          <Th color={'white'}></Th>
                          <Th color={'white'}>Weight</Th>
                          <Th color={'white'} sx={{ minWidth: '120px' }}>
                            UOM
                          </Th>
                          <Th color={'white'}>Length</Th>
                          <Th color={'white'}>Width</Th>
                          <Th color={'white'}>Height</Th>
                          <Th color={'white'} sx={{ minWidth: '120px' }}>
                            UOM
                          </Th>
                          <Th color={'white'} sx={{ minWidth: '160px' }}>
                            Package Type
                          </Th>
                          <Th color={'white'}>Volumet. Weig</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {details?.data?.packages.map((item: any) => (
                          <React.Fragment key={item.id}>
                            <Tr
                              sx={{
                                td: {
                                  borderColor: 'gray.500',
                                  borderWidth: '1px',
                                  borderStyle: 'solid',
                                },
                              }}
                            >
                              <Td rowSpan={2} fontWeight={'bold'}>
                                {item.package_number}
                              </Td>
                              <Td>As per AWB</Td>
                              <Td>25</Td>
                              <Td>KG</Td>
                              <Td>120</Td>
                              <Td>60</Td>
                              <Td>60</Td>
                              <Td>CM</Td>
                              <Td>
                                {getDisplayLabel(
                                  packageTypeOptions,
                                  item.package_type_id
                                    ? item.package_type_id.toString()
                                    : 0,
                                  'Package Type'
                                ) || 'N/A'}
                                -{item.package_number}
                              </Td>
                              <Td>72 KG</Td>
                            </Tr>
                            <Tr
                              sx={{
                                td: {
                                  borderColor: 'gray.500',
                                  borderWidth: '1px',
                                  borderStyle: 'solid',
                                },
                              }}
                            >
                              <Td>Actual</Td>
                              <Td>
                                <FieldDisplay size={'sm'} value={item.weight} />
                              </Td>
                              <Td>
                                <FieldDisplay
                                  size={'sm'}
                                  value={
                                    uomList.data?.items[
                                      item.weight_unit_of_measurement_id
                                    ] || 'N/A'
                                  }
                                />
                              </Td>
                              <Td>
                                <FieldDisplay size={'sm'} value={item.length} />
                              </Td>
                              <Td>
                                <FieldDisplay
                                  size={'sm'}
                                  value={
                                    uomList.data?.items[
                                      item.unit_of_measurement_id
                                    ] || 'N/A'
                                  }
                                />
                              </Td>
                              <Td>
                                <FieldDisplay size={'sm'} value={item.height} />
                              </Td>
                              <Td>
                                <FieldDisplay
                                  size={'sm'}
                                  value={
                                    uomList.data?.items[
                                      item.unit_of_measurement_id
                                    ] || 'N/A'
                                  }
                                />
                              </Td>

                              <Td>
                                <FieldDisplay
                                  size={'sm'}
                                  value={
                                    packageTypeList.data?.items[
                                      item.package_type_id
                                    ] || 'N/A'
                                  }
                                />
                              </Td>
                              <Td>
                                <FieldDisplay
                                  size={'sm'}
                                  value={
                                    item.volumetric_weight
                                      ? item.volumetric_weight + 'KG'
                                      : '0KG'
                                  }
                                />
                              </Td>
                            </Tr>
                          </React.Fragment>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Stack>
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default STFDetails;
