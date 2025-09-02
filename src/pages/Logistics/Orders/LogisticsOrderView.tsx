import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Center,
  HStack,
  Heading,
  SimpleGrid,
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
import { Formiz, useForm } from '@formiz/core';
import { format } from 'date-fns';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PreviewPopup } from '@/components/PreviewContents/Logistics/LogisticOrder';
import { SlideIn } from '@/components/SlideIn';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { convertToOptions, getDisplayLabel } from '@/helpers/commonHelper';
import { useLogisticOrderDetails } from '@/services/logistics/order/services';
import { useCustomerDetails } from '@/services/master/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

type VendorField = 'code' | 'business_name' | 'id';
export const LogisticsOrderView = () => {
  const navigate = useNavigate();
  const form = useForm({});
  let { id } = useParams();

  const [lo_Id, setLOId] = useState<number | undefined>(() =>
    id ? Number(id) : 0
  );

  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>([]);

  const shipViaList = useShipViaList();
  const currencyList = useCurrencyList();
  const shipTypeList = useShipTypesList();
  const packageTypeList = usePackageTypeList();
  const unitOfMeasureData = useUnitOfMeasureIndex({});

  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);

  const { data: logisticOrderDetails, isLoading } = useLogisticOrderDetails(
    Number(lo_Id)
  );
  const logisticIpData = logisticOrderDetails?.data;
  const logisticOrder = logisticIpData?.logistic_order;
  const logisticQuotation = logisticOrder?.logistic_quotation;
  const logisticRequest = logisticIpData?.logistic_requests;
  const logisticPackage = logisticRequest?.[0]?.packages || [];

  const customerDetailsList = useCustomerDetails(
    Number(logisticQuotation?.customer_id ?? 0)
  );
  const getVendordetails = (id: number, type: VendorField) => {
    if (!id || !customerDetailsList.data) return 'N/A';
    const shipper = customerDetailsList?.data?.data;
    return shipper ? shipper[type] : 'Loading...';
  };

  const addressGenerate = (type: string) => {
    const key =
      type === 'to' ? 'receiver_shipping_address' : 'customer_shipping_address';
    const getObject = logisticRequest?.[0]?.[key];
    if (!getObject) return 'Address not available';
    return `Add: ${getObject?.address || ''}, ${getObject?.city || ''}, ${getObject?.state || ''}, ${getObject?.country || ''}. </br> Tel: ${getObject?.phone || 'N/A'}, </br> Fax: ${getObject?.fax || 'N/A'}, </br> Email: ${getObject?.email || 'N/A'}`;
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  useEffect(() => {
    if (unitOfMeasureData.data?.items) {
      setUOMOptions(unitOfMeasureData.data?.items);
    }
  }, [unitOfMeasureData]);

  const handleOpenPreview = () => {
    let popupVariables: any = {};
    popupVariables = {
      logistic_order_id: lo_Id,
      lpo_no: 'N/A',
      lpo_date: 'N/A',
      goods_type: logisticQuotation?.is_dg === true ? 'DG' : 'Non DG',
      lr_no: logisticRequest?.[0]?.id || 'N/A',
      lr_date: logisticRequest?.[0]?.created_at
        ? format(new Date(logisticRequest[0]?.created_at), 'yyyy-MM-dd')
        : 'N/A',
      logistic_vendor:
        getVendordetails(
          logisticQuotation?.customer_id ?? 0,
          'business_name'
        ) || 'N/A',
      log_vendor_code:
        getVendordetails(logisticQuotation?.customer_id ?? 0, 'code') || 'N/A',
      transit_days: logisticQuotation
        ? logisticQuotation?.transit_day + ' days'
        : '',
      ship_type:
        shipTypeList.data?.items[logisticQuotation?.ship_type_id ?? 0] || 'N/A',
      ship_via:
        shipViaList?.data?.items[logisticQuotation?.ship_via_id ?? 0] || 'N/A',
      carrier_name: logisticQuotation?.carrier_name || 'N/A',
      price: logisticQuotation ? logisticQuotation?.price : 'N/A',
      currency:
        currencyList?.data?.items[logisticQuotation?.currency_id ?? 0] || 'N/A',
      contact: 'N/A',
      consignor:
        logisticRequest?.[0]?.customer_shipping_address?.consignee_name ||
        'N/A',
      consignee:
        logisticRequest?.[0]?.receiver_shipping_address?.consignee_name ||
        'N/A',
      consignor_address: addressGenerate('from') || 'N/A',
      consignee_address: addressGenerate('to') || 'N/A',
      remarks:  logisticQuotation
      ? logisticQuotation?.remark
        ? logisticQuotation?.remark === 'null'
          ? ' - '
          : logisticQuotation?.remark
        : ' - '
      : ' - '
    };
    popupVariables.packageTypeList = packageTypeList;
    popupVariables.packages = logisticPackage;

    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    console.log(popupVariables)
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
  };

  useEffect(() => {
    if (logisticIpData) {
      console.log('logisticOrderDetails', logisticIpData);
    }
  }, [logisticIpData]);

  useEffect(() => {
    setLOId(Number(id));
  }, [id]);

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Heading as="h4" size={'md'}>
              Logistic Order
            </Heading>
          </Stack>
        </HStack>
        <LoadingOverlay isLoading={isLoading}>
          <Stack
            spacing={2}
            p={4}
            bg={'white'}
            borderRadius={'md'}
            boxShadow={'md'}
          >
            <Formiz autoForm connect={form}>
              <Stack
                borderRadius={4}
                spacing={4}
                bg={'gray.100'}
                p={4}
                rounded={'md'}
                border={'1px solid'}
                borderColor={'gray.300'}
              >
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  display={{ base: 'inherit', md: 'flex' }}
                  align={'flex-start'}
                  justify={'flex-start'}
                >
                  <FieldDisplay
                    label="Logistic order"
                    value={lo_Id || 'N/A'}
                    size={'sm'}
                  />
                  <FieldDisplay label="LPO No" value={'N/A'} size={'sm'} />
                  <FieldDisplay
                    label="LPO Date"
                    // value={
                    //    lrfqDetails?.created_at
                    //    ? format(new Date(lrfqDetails?.created_at), 'yyyy-MM-dd')
                    //    : 'N/A'
                    // }
                    value={'N/A'}
                    size={'sm'}
                  />
                  <FieldDisplay label="LPO Type" value={'N/A'} size={'sm'} />
                  <FieldDisplay label="Priority" value={'N/A'} size={'sm'} />
                  <FieldDisplay
                    label="Goods Type"
                    value={logisticQuotation?.is_dg === true ? 'DG' : 'Non DG'}
                    size={'sm'}
                  />
                </Stack>
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  display={{ base: 'inherit', md: 'flex' }}
                  align={'flex-start'}
                  justify={'flex-start'}
                >
                  <FieldDisplay
                    label="LR NO"
                    value={logisticRequest?.[0]?.id || 'N/A'}
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="LR Date"
                    value={
                      logisticRequest?.[0]?.created_at
                        ? format(
                            new Date(logisticRequest[0]?.created_at),
                            'yyyy-MM-dd'
                          )
                        : 'N/A'
                    }
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Logistic Vendor"
                    value={
                      getVendordetails(
                        logisticQuotation?.customer_id ?? 0,
                        'business_name'
                      ) || 'N/A'
                    }
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Log Vendor Code"
                    value={
                      getVendordetails(
                        logisticQuotation?.customer_id ?? 0,
                        'code'
                      ) || 'N/A'
                    }
                    size={'sm'}
                  />

                  <FieldDisplay
                    label="Transit Days"
                    value={
                      logisticQuotation
                        ? logisticQuotation?.transit_day + ' days'
                        : ''
                    }
                    size={'sm'}
                  />
                </Stack>
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  display={{ base: 'inherit', md: 'flex' }}
                  align={'flex-start'}
                  justify={'flex-start'}
                >
                  <FieldDisplay
                    label="Ship Type"
                    value={
                      shipTypeList.data?.items[
                        logisticQuotation?.ship_type_id ?? 0
                      ] || 'N/A'
                    }
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Ship Via"
                    value={
                      shipViaList?.data?.items[
                        logisticQuotation?.ship_via_id ?? 0
                      ] || 'N/A'
                    }
                    size={'sm'}
                  />
                  <FieldDisplay label="FOB" value={'N/A'} size={'sm'} />

                  <FieldDisplay
                    label="Carrier Name"
                    value={logisticQuotation?.carrier_name || 'N/A'}
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Price"
                    value={logisticQuotation ? logisticQuotation?.price : 'N/A'}
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Currency"
                    value={
                      currencyList?.data?.items[
                        logisticQuotation?.currency_id ?? 0
                      ] || 'N/A'
                    }
                    size={'sm'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Remarks"
                    value={
                      logisticQuotation
                        ? logisticQuotation?.remark
                          ? logisticQuotation?.remark === 'null'
                            ? ' - '
                            : logisticQuotation?.remark
                          : ' - '
                        : ' - '
                    }
                    isHtml={true}
                  />
                </Stack>

                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  display={{ base: 'inherit', md: 'flex' }}
                  align={'flex-start'}
                  justify={'flex-start'}
                >
                  <FieldDisplay
                    label="Contact"
                    value={
                      logisticRequest?.[0]?.customer?.contact_type?.name ||
                      'N/A'
                    }
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Consignor"
                    value={
                      logisticRequest?.[0]?.customer_shipping_address?.customer
                        ?.business_name || 'N/A'
                    }
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Consignee"
                    value={
                      logisticRequest?.[0]?.receiver_shipping_address?.customer
                        ?.business_name || 'N/A'
                    }
                    size={'sm'}
                  />
                </Stack>
                <SimpleGrid columns={2} spacing={0} pb={'1rem'}>
                  {/* <div>
                  <Text fontSize={'.875rem'} fontWeight={'700'}>
                    Address
                  </Text>
                  <Box
                    bg="pink.200"
                    height="100%"
                    p={4}
                    display="flex"
                    flexDirection="column"
                    border={'pink'}
                  >
                    <Text
                      p="1"
                      dangerouslySetInnerHTML={{
                        __html: ' - ',
                      }}
                    ></Text>
                  </Box>
                </div> */}
                  <div>
                    <Text fontSize={'.875rem'} fontWeight={'700'}>
                      Consignor Address
                    </Text>
                    <Box
                      bg="teal.200"
                      height="100%"
                      p={4}
                      display="flex"
                      flexDirection="column"
                      border={'teal'}
                    >
                      <Text
                        p="1"
                        dangerouslySetInnerHTML={{
                          __html: addressGenerate('from')
                            ? addressGenerate('from')
                            : ' - ',
                        }}
                      ></Text>
                    </Box>
                  </div>
                  <div>
                    <Text fontSize={'.875rem'} fontWeight={'700'}>
                      Consignee Address
                    </Text>
                    <Box
                      bg="yellow.200"
                      height="100%"
                      p={4}
                      display="flex"
                      flexDirection="column"
                    >
                      <Text
                        p="1"
                        dangerouslySetInnerHTML={{
                          __html: addressGenerate('to')
                            ? addressGenerate('to')
                            : ' - ',
                        }}
                      ></Text>
                    </Box>
                  </div>
                </SimpleGrid>
              </Stack>
            </Formiz>
            <Stack
              borderRadius={4}
              spacing={4}
              bg={'gray.100'}
              p={4}
              rounded={'md'}
              border={'1px solid'}
              borderColor={'gray.300'}
            >
              <HStack>
                <Text fontSize={'md'} fontWeight={'700'}>
                  Log Quotation Info
                </Text>
              </HStack>
              <TableContainer
                boxShadow={'md'}
                borderColor={'gray.200'}
                overflow={'auto'}
                mt={1}
              >
                <Table variant="striped" colorScheme="teal" size={'sm'}>
                  <Thead bg={'gray'}>
                    <Tr>
                      <Th color={'white'}>Line Item</Th>
                      <Th color={'white'}>LVQ NO</Th>
                      <Th color={'white'}>LRFQ NO</Th>
                      <Th color={'white'}>LREF NO</Th>
                      <Th color={'white'}>Description</Th>
                      <Th color={'white'}>Package Type</Th>
                      <Th color={'white'}>PKG NO</Th>
                      <Th color={'white'}>Goods type</Th>
                      <Th color={'white'}>Weight</Th>
                      <Th color={'white'}>UOM</Th>
                      <Th color={'white'}>Length</Th>
                      <Th color={'white'}>Width</Th>
                      <Th color={'white'}>Height</Th>
                      <Th color={'white'}>UOM</Th>
                      <Th color={'white'}>Volumetric Weight</Th>
                      {/* <Th color={'white'}>Part details</Th> */}
                    </Tr>
                  </Thead>
                  <Tbody>
                    {logisticPackage.length > 0 &&
                      logisticPackage.map((item, index) => {
                        return (
                          <Tr key={`Log_quotation_info_${index + 1}`}>
                            <Td textAlign={'center'}>{index + 1}</Td>
                            <Td>{'LVQ123'}</Td>
                            <Td>{logisticQuotation?.lrfq?.id}</Td>
                            <Td>{'LVQ123'}</Td>
                            <Td>{item?.description || 'Loading...'}</Td>
                            <Td>
                            {getDisplayLabel(
                                transformToSelectOptions(packageTypeList?.data),
                                item.package_type_id.toString() ??
                                  0,
                                'Package Type'
                              ) || 'N/A'}
                              {/* {getPackageNumber(
                                item?.package_type_id,
                                logisticPackage,
                                packageTypeList
                              ) || 'Loading...'} */}
                            </Td>
                            <Td>{item?.package_number || 'Loading...'}</Td>
                            <Td>{item?.is_dg ? 'DG' : 'NON DG'}</Td>
                            <Td textAlign={'center'}>
                              {item?.weight || 'Loading...'}
                            </Td>
                            <Td textAlign={'center'}>
                              {getDisplayLabel(
                                convertToOptions(unitOfMeasureOptions),
                                item.weight_unit_of_measurement_id.toString() ??
                                  0,
                                'UOM'
                              ) || 'N/A'}
                            </Td>
                            <Td textAlign={'center'}>
                              {item?.length || 'Loading...'}
                            </Td>
                            <Td textAlign={'center'}>
                              {item?.width || 'Loading...'}
                            </Td>
                            <Td textAlign={'center'}>
                              {item?.height || 'Loading...'}
                            </Td>
                            <Td textAlign={'center'}>
                              {getDisplayLabel(
                                convertToOptions(unitOfMeasureOptions),
                                item.unit_of_measurement_id.toString() ?? 0,
                                'UOM'
                              ) || 'N/A'}
                            </Td>
                            <Td textAlign={'center'}>
                              {item?.volumetric_weight || 'Loading...'}
                            </Td>
                            {/* <Td textAlign={'center'}>{'View'}</Td> */}
                          </Tr>
                        );
                      })}
                  </Tbody>
                </Table>
                {logisticPackage.length === 0 && (
                  <>
                    {!isLoading ? (
                      <Center p="4">
                        <Text>No items to display</Text>
                      </Center>
                    ) : (
                      <Stack m={'3rem'}>
                        <LoadingOverlay isLoading={true} />
                      </Stack>
                    )}
                  </>
                )}
              </TableContainer>
              {/* End */}
            </Stack>
            <HStack justifyContent={'center'} mt="1rem">
              <Button
                onClick={() => handleOpenPreview()}
                colorScheme="green"
                isDisabled={lo_Id === 0}
                size={'sm'}
              >
                Preview
              </Button>
              <Button
                onClick={() => navigate(-1)}
                colorScheme="red"
                size={'sm'}
              >
                Cancel
              </Button>
            </HStack>

            <PreviewPopup
              isOpen={isPreviewModalOpen}
              onClose={handleCloseModal}
              data={previewData}
            />
          </Stack>
        </LoadingOverlay>
      </Stack>
    </SlideIn>
  );
};

export default LogisticsOrderView;
