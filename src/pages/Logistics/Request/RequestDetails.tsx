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

import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { getDisplayLabel } from '@/helpers/commonHelper';
import { useLogisticsRequestDetails } from '@/services/logistics/request/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';
import PartDetails from '../../Purchase/Quotation/PartDetails';
import PartNumberDetails from './PartNumberDetails';

export const LogisticsRequestDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [itemInfo, setItemInfo] = useState<any>({});
  const {
    data: details,
    isLoading,
    isSuccess,
  } = useLogisticsRequestDetails(Number(id));
  const priorityList = usePriorityList();
  const conditionList = useConditionList();
  const uomList = useUnitOfMeasureList();
  const shipTypeList = useShipTypesList();
  const shipViaList = useShipViaList();
  const packageTypeList = usePackageTypeList();
  const [obtainedItems, setObtainedItems] = useState<any>([]);
  const [notObtainedItems, setNotObtainedItems] = useState<any>([]);
  const [packageOptions, setPackageOptions] = useState<any>([]);

  const getPackageInfo = (item: any) => {``
    let packageInfo = packageOptions.find(
      (packagedetail: any) =>
        packagedetail.id === item
    );
    console.log(packageInfo)
    if (packageInfo) {
      return packageInfo.package_number;
    } else {
      return ' - ';
    }
  };

  const displayReferenceIDs = (items: any) => {
    let returnText = '0';
    if (items.length > 0) {
      returnText = items.map((item: any) => item.purchase_order_id).join(', ');
    }
    return returnText;
  };

  const types: any = [
    { value: 'so', label: 'SO' },
    { value: 'po', label: 'PO' },
    { value: 'wo', label: 'WO' },
    { value: 'open', label: 'Open' },
  ];
  useEffect(() => {
    if (isSuccess && details && details.data) {
      setItemInfo(details.data);
    }
  }, [isSuccess, details]);

  useEffect(() => {
    if (Object.keys(itemInfo).length > 0) {
      setPackageOptions(itemInfo?.packages);
      let obtained: any = [];
      let notobtained: any = [];
      itemInfo.items?.forEach((item: any) => {
        if (item.logistic_request_package_id === null) {
          notobtained.push(item);
        } else {
          obtained.push(item);
        }
      });
      setObtainedItems(obtained);
      setNotObtainedItems(notobtained);
    }
  }, [itemInfo]);

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
                <BreadcrumbLink as={Link} to="/purchase/prfq">
                  Logistics Request List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Logistics Request Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Logistics Request Details
            </Heading>
          </Stack>

          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/logistics/request/${id}/edit`)}
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
          <LoadingOverlay isLoading={isLoading}>
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
                      label="LR Type"
                      value={
                        itemInfo && itemInfo?.type
                          ? getDisplayLabel(
                              types,
                              itemInfo.type.toString() ?? '',
                              'Type'
                            )
                          : 'N/A'
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Ref No"
                      value={
                        itemInfo && itemInfo?.purchase_orders
                          ? displayReferenceIDs(itemInfo?.purchase_orders)
                          : ' - '
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Ref Date"
                      value={
                        dayjs(itemInfo?.ref_date).format('DD/MM/YYYY') || 'N/A'
                      }
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="Ref Date"
                      value={
                        dayjs(itemInfo?.ref_date).format('DD/MM/YYYY') || 'N/A'
                      }
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="Due Date"
                      value={
                        dayjs(itemInfo?.due_date).format('DD/MM/YYYY') || 'N/A'
                      }
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="Priority"
                      value={
                        priorityList.data?.items[itemInfo?.priority_id ?? 0] ||
                        'N/A'
                      }
                    />
                  </Stack>
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldDisplay
                      size={'sm'}
                      label="Ship Type"
                      value={
                        shipTypeList.data?.items[itemInfo.ship_type_id ?? 0] ||
                        'N/A'
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Ship Via"
                      value={
                        shipViaList.data?.items[itemInfo.ship_via_id ?? 0] ||
                        'N/A'
                      }
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="Goods Type"
                      value={itemInfo.is_dg === true ? 'DG' : 'Non-DG'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="No of Pkgs"
                      value={
                        itemInfo && itemInfo?.purchase_orders
                          ? itemInfo?.packages.length
                          : 'N/A'
                      }
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="No of PCs"
                      value={itemInfo?.pcs || 'N/A'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="Volumetric Weight(AWB)"
                      value={itemInfo?.volumetric_weight + ' KG' || 'N/A'}
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
                      label="Consignor/Shipper"
                      value={
                        itemInfo && itemInfo?.customer
                          ? itemInfo?.customer?.business_name
                          : ' - '
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Consignor/Shipper Address"
                      value={
                        itemInfo && itemInfo?.customer_shipping_address
                          ? itemInfo?.customer_shipping_address?.address
                          : ' - '
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Consignee/Receiver"
                      value={
                        itemInfo && itemInfo?.receiver_customer
                          ? itemInfo?.receiver_customer?.business_name
                          : ' - '
                      }
                    />
                    <FieldDisplay
                      size={'sm'}
                      label="Consignee/Receiver Address"
                      value={
                        itemInfo && itemInfo?.receiver_shipping_address
                          ? itemInfo?.receiver_shipping_address?.address
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
                          <Th color={'white'}>
                            Package
                          </Th>
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
                              <Td fontWeight={'bold'}>
                                {item.package_number}
                              </Td>
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

                    {obtainedItems &&
                      obtainedItems.length > 0 && (
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
                              {obtainedItems.map(
                                (item: any, index: number) => (
                                    <Tr key={item.id}>
                                      <Td> {index + 1} </Td>
                                      <Td>
                                        {getPackageInfo(
                                          item.logistic_request_package_id
                                        )}
                                      </Td>
                                      <PartDetails
                                        partNumber={item.part_number_id}
                                      />
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
                                      <Td>{item.qty}</Td>
                                      <Td>{item.qty}</Td>
                                      <Td>{item.qty}</Td>
                                    </Tr>
                                  )
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      )}
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
                        Not Obtained Items
                      </Text>
                    </HStack>

                    {itemInfo?.items &&
                      itemInfo?.items.length > 0 && (
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
                              {notObtainedItems.map(
                                (item: any, index: number) => (
                                    <Tr
                                      key={item.id}>
                                      <Td>{index + 1} </Td>
                                      <PartDetails
                                        partNumber={item.part_number_id}
                                      />
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
                                      <Td>{item.qty}</Td>
                                      <Td>{item.qty}</Td>
                                      <Td>{item.qty}</Td>
                                    </Tr>
                                  )
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      )}
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
                      label="Remarks"
                      value={itemInfo?.remark || 'N/A'}
                      isHtml={true}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default LogisticsRequestDetails;
