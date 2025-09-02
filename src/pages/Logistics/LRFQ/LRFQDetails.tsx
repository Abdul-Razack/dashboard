import { useEffect, useState } from 'react';

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
import { CustomerInfo } from '@/components/CustomerInfo';
import { CustomerContactInfo } from '@/components/CustomerContactInfo';
import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import {
  calculateVolumetricWeight,
  filterUOMoptions,
  getDisplayLabel,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { getAPICall } from '@/services/apiService';
import { InfoPayload } from '@/services/apiService/Schema/LRSchema';
import { useLRFQDetails } from '@/services/logistics/lrfq/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

export const LRFQDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const { data: details, isLoading } = useLRFQDetails(Number(id));
  const [uniqueLRIds, setuniqueLRIds] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeLRInfo, setActiveLRInfo] = useState<any | null>(null);
  const [items, setItems] = useState<any>({});
  const [lrid, setLRID] = useState<number | null>(null);
  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList?.data);
  const shipTypeList = useShipTypesList();
  const shipTypeOptions = transformToSelectOptions(shipTypeList.data);
  const packageTypeList = usePackageTypeList();
  const packageTypeOptions = transformToSelectOptions(packageTypeList.data);
  const shipViaList = useShipViaList();
  const shipViaOptions = transformToSelectOptions(shipViaList.data);
  const unitOfMeasureList = useUnitOfMeasureIndex();
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [packageItems, setPackageItems] = useState<any>([]);

  useEffect(() => {
    if (details?.data?.lr_customers) {
      setuniqueLRIds([
        ...new Set(
          details?.data?.lr_customers.map(
            (customer) => customer.logistic_request_id
          )
        ),
      ]);
    }
  }, [details]);

  const getLRInfo = async (lrID: any) => {
    try {
      const data = await getAPICall(
        endPoints.info.logistic_request.replace(':id', lrID),
        InfoPayload
      );
      setActiveLRInfo(data.data);
      const key: any = id;
      setItems((prevItems: any) => ({
        ...prevItems,
        [key]: data.data,
      }));
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uniqueLRIds.length > 0) {
      setLRID(uniqueLRIds[0]);
    }
  }, [uniqueLRIds]);

  useEffect(() => {
    if (lrid) {
      getLRInfo(lrid);
    }
  }, [lrid]);

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  useEffect(() => {
    let packages: any = [];
    Object.keys(items).forEach(function (key) {
      items[key].packages.forEach((pItem: any) => {
        packages.push(pItem);
      });
    });
    setPackageItems(packages);
  }, [items]);

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
                <BreadcrumbLink as={Link} to="/logistics/lrfq">
                  Logistics RFQ List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Logistics RFQ Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Logistics RFQ Details
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/purchase/quotation/${id}/edit`)}
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
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    size={'sm'}
                    label={'Logistic Request'}
                    value={uniqueLRIds.join(',')}
                  />

                  <FieldDisplay
                    size={'sm'}
                    label={'LR Date'}
                    value={
                      activeLRInfo?.ref_date
                        ? dayjs(activeLRInfo?.ref_date).format('DD-MMM-YYYY')
                        : ' - '
                    }
                  />

                  <FieldDisplay
                    size={'sm'}
                    label={'Priority'}
                    value={
                      getDisplayLabel(
                        priorityOptions,
                        details?.data.priority_id
                          ? details?.data.priority_id.toString()
                          : 0,
                        'Priority'
                      ) || 'N/A'
                    }
                  />

                  <FieldDisplay
                    size={'sm'}
                    label={'LR Type'}
                    value={activeLRInfo?.type.toUpperCase()}
                  />

                  <FieldDisplay
                    size={'sm'}
                    label={'Need By Date'}
                    value={
                      details?.data?.due_date
                        ? dayjs(details?.data?.due_date).format('DD-MMM-YYYY')
                        : ' - '
                    }
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    size={'sm'}
                    label={'No of Packages'}
                    value={packageItems.length}
                  />

                  <FieldDisplay
                    size={'sm'}
                    label={'No of PCs'}
                    value={activeLRInfo?.pcs}
                  />

                  <FieldDisplay
                    size={'sm'}
                    label={'Ship Type'}
                    value={
                      getDisplayLabel(
                        shipTypeOptions,
                        activeLRInfo?.ship_type_id
                          ? activeLRInfo?.ship_type_id.toString()
                          : 0,
                        'Ship Type'
                      ) || 'N/A'
                    }
                  />
                  <FieldDisplay
                    size={'sm'}
                    label={'Ship Via'}
                    value={
                      getDisplayLabel(
                        shipViaOptions,
                        activeLRInfo?.ship_via_id
                          ? activeLRInfo?.ship_via_id.toString()
                          : 0,
                        'Ship Via'
                      ) || 'N/A'
                    }
                  />

                  <FieldDisplay
                    size={'sm'}
                    label={'Goods Type'}
                    value={activeLRInfo?.is_dg === true ? 'DG' : 'Non-DG'}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    size={'sm'}
                    label={'Volumetric Wt'}
                    value={details?.data.volumetric_weight + ' KG'}
                  />

                  <FieldDisplay
                    size={'sm'}
                    label={'Consignor/Shipper'}
                    value={
                      activeLRInfo
                        ? activeLRInfo?.customer?.business_name
                        : 'N/A'
                    }
                  />
                  <FieldDisplay
                    size={'sm'}
                    label={'Consignor/Shipper Address'}
                    value={
                      activeLRInfo
                        ? activeLRInfo?.customer_shipping_address?.address
                        : 'N/A'
                    }
                  />

                  <FieldDisplay
                    size={'sm'}
                    label={'Consignee/Receiver'}
                    value={
                      activeLRInfo
                        ? activeLRInfo?.receiver_customer?.business_name
                        : 'N/A'
                    }
                  />

                  <FieldDisplay
                    size={'sm'}
                    label={'Consignor/Receiver Address'}
                    value={
                      activeLRInfo
                        ? activeLRInfo?.receiver_shipping_address?.address
                        : 'N/A'
                    }
                  />
                </Stack>

                <Stack spacing={2}>
                <HStack justify={'space-between'}>
                    <Text fontSize="md" fontWeight="700">
                      Package Items
                    </Text>
                  </HStack>

                  {packageItems.length > 0 && (
                    <TableContainer rounded={'md'} overflow={'auto'} mt={2}>
                      <Table colorScheme="cyan" variant="striped" size={'sm'}>
                        <Thead bg={'gray'}>
                          <Tr>
                            <Th color={'white'}>Line Item</Th>
                            <Th color={'white'}>Package Type</Th>
                            <Th color={'white'}>PKG NO</Th>
                            <Th color={'white'}>Description</Th>
                            <Th color={'white'}>Goods Type</Th>
                            <Th color={'white'}>Weight</Th>
                            <Th color={'white'} sx={{ minWidth: '130px' }}>
                              UOM
                            </Th>
                            <Th color={'white'}>Length</Th>
                            <Th color={'white'}>Width</Th>
                            <Th color={'white'}>Height</Th>
                            <Th color={'white'} sx={{ minWidth: '130px' }}>
                              UOM
                            </Th>
                            <Th color={'white'} sx={{ minWidth: '10`0px' }}>
                              Pcs
                            </Th>
                            <Th color={'white'}>Volumetric Wt</Th>
                            <Th color={'white'}>Add Part Details</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {packageItems.map((row: any, index: number) => (
                            <Tr key={index}>
                              <Td>{index + 1}</Td>
                              <Td>
                                {getDisplayLabel(
                                  packageTypeOptions,
                                  row.package_type_id
                                    ? row.package_type_id.toString()
                                    : 0,
                                  'Package Type'
                                ) || 'N/A'}
                              </Td>
                              <Td>
                                <Text>{row ? row?.package_number : ''}</Text>
                              </Td>
                              <Td>
                                <Text>{row ? row?.description : ''}</Text>
                              </Td>
                              <Td>{row?.is_dg === true ? 'DG' : 'Non-DG'}</Td>
                              <Td> {row ? row?.weight : ''}</Td>
                              <Td>
                                {getDisplayLabel(
                                  filterUOMoptions(unitOfMeasureOptions, 1),
                                  row.weight_unit_of_measurement_id
                                    ? row.weight_unit_of_measurement_id.toString()
                                    : 0,
                                  'UOM'
                                ) || 'N/A'}
                              </Td>
                              <Td> {row ? row?.length : ''}</Td>
                              <Td> {row ? row?.width : ''}</Td>
                              <Td> {row ? row?.height : ''}</Td>
                              <Td>
                                {getDisplayLabel(
                                  filterUOMoptions(unitOfMeasureOptions, 2),
                                  row.weight_unit_of_measurement_id
                                    ? row.unit_of_measurement_id.toString()
                                    : 0,
                                  'UOM'
                                ) || 'N/A'}
                              </Td>
                              <Td> {row ? (row.pcs ? row.pcs : 0) : ''}</Td>
                              <Td>
                                {calculateVolumetricWeight(
                                  parseFloat(row.length),
                                  parseFloat(row.width),
                                  parseFloat(row.height),
                                  row.unit_of_measurement_id,
                                  unitOfMeasureOptions
                                )}{' '}
                                KG
                              </Td>
                              <Td>
                                <Text>
                                  {row
                                    ? row.is_obtained === true
                                      ? 'Obtained'
                                      : 'Not Obtained'
                                    : ''}
                                </Text>
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </Stack>

                <Stack spacing={2}>
                <HStack justify={'space-between'}>
                    <Text fontSize="md" fontWeight="700">
                      Vendor Info
                    </Text>
                  </HStack>

                  {details?.data?.lr_customers && details?.data?.lr_customers.length > 0 && (
                    <TableContainer rounded={'md'} overflow={'auto'} mt={2}>
                      <Table colorScheme="cyan" variant="striped" size={'sm'}>
                      <Thead bg={'gray'}>
                      <Tr>
                        <Th color={'white'}>S.No.</Th>
                        <Th color={'white'} sx={{ maxW: '150px' }}>
                          Vendor Name
                        </Th>
                        <Th color={'white'} sx={{ maxW: '150px' }}>
                          Vendor Code
                        </Th>
                        <Th color={'white'} sx={{ maxW: '150px' }}>
                          Contact
                        </Th>
                        <Th color={'white'} sx={{ minWidth: '150px' }}>
                          Address
                        </Th>
                      </Tr>
                    </Thead>
                        <Tbody>
                          {details?.data?.lr_customers.map((item: any, index: number) => (
                            <Tr key={index}>
                              <Td>{index + 1}</Td>
                              <CustomerInfo customerId={item.customer_id} />
                              <CustomerContactInfo contactId={item.customer_contact_manager_id} />
                            
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </Stack>
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default LRFQDetails;
