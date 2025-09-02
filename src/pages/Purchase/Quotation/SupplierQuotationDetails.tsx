import { useEffect, useMemo, useState } from 'react';

import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Heading,
  IconButton,
  Spinner,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
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
import useCustomerName from '@/hooks/useCustomerName';
import {
  useQuotationDetails,
  useQuotationItemsByRFQ,
} from '@/services/purchase/quotation/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

import PartDescription from './PartDescription';
import PartDetailText from './PartDetailText';

const SupplierQuotationDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [rfqId, setRfqId] = useState<number | null>(null);
  const [activeItem, setActiveItem] = useState<number | null>(0);

  const { data: details, isLoading } = useQuotationDetails(Number(id));
  const conditionList = useConditionList();
  const uomList = useUnitOfMeasureList();
  const currencyList = useCurrencyList();

  const { data: quotationItems, isLoading: quotationItemsLoading } =
    useQuotationItemsByRFQ({
      rfq_id: rfqId ?? 0, // Set a default value of 0 if rfqId is null
      requested_part_number_id: activeItem ?? undefined, // Set a default value of undefined if activeItem is null
    });

  const handleTabChange = (index: number) => {
    if (details?.quotation.items[index]) {
      setActiveItem(details?.quotation.items[index].part_number_id);
    }
  };

  const totalAvailableQty = useMemo(() => {
    return quotationItems?.items
      .filter((item) => item.quotation_id == Number(id))
      .reduce((acc, item) => acc + item.qty, 0);
  }, [quotationItems]);

  useEffect(() => {
    if (details !== undefined) {
      handleTabChange(0);
      setRfqId(details.quotation.rfq_id);
    }
  }, [details]);

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
                <BreadcrumbLink as={Link} to="/purchase/quotation">
                  Quotation List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Quotation Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Quotation Details
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
          <LoadingOverlay isLoading={isLoading}>
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
                    label={'RFQ No'}
                    value={details?.quotation.rfq_id || 'N/A'}
                  />
                  <FieldDisplay
                    label={'Vendor Name'}
                    value={useCustomerName(details?.quotation.customer_id || 0)}
                  />

                  <FieldDisplay
                    label={'Currency'}
                    value={
                      currencyList.data?.items[
                        details?.quotation?.currency_id || 0
                      ] || 'N/A'
                    }
                  />

                  <FieldDisplay
                    label={'Quotation No'}
                    value={details?.quotation.vendor_quotation_no || 'N/A'}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label={'Quotation Date'}
                    value={
                      details?.quotation?.vendor_quotation_date
                        ? dayjs(
                            details?.quotation?.vendor_quotation_date
                          ).format('DD-MMM-YYYY')
                        : ' - '
                    }
                  />
                  <FieldDisplay
                    label={'Expiry Date'}
                    value={
                      details?.quotation?.expiry_date
                        ? dayjs(details?.quotation?.expiry_date).format(
                            'DD-MMM-YYYY'
                          )
                        : ' - '
                    }
                  />
                  <Box w={'100%'} mt={0}>
                    <Text fontSize={'md'} fontWeight={'bold'} mb={2}>
                      Quotation File
                    </Text>
                    <DocumentDownloadButton
                      url={details?.quotation?.quotation_file || ''}
                    />
                  </Box>
                  <FieldDisplay
                    label={'Remarks'}
                    value={details?.quotation.remarks || '-'}
                  />
                </Stack>

                <Stack>
                  <HStack justify={'space-between'}>
                    <Text fontSize="md" fontWeight="700">
                      Items
                    </Text>
                  </HStack>

                  <Tabs
                    variant="enclosed-colored"
                    colorScheme="green"
                    mt={4}
                    onChange={handleTabChange}
                  >
                    <TabList>
                      {details?.quotation.items.map((item, index) => (
                        <Tab key={index}>
                          <>
                            <PartDetailText partNumber={item.part_number_id} />
                            <Text ml={2}>
                              ({index + 1} of {details?.quotation.items.length})
                            </Text>
                          </>
                        </Tab>
                      ))}
                    </TabList>
                    <TabPanels>
                      {quotationItems &&
                        quotationItems.items.map((item: any, index: number) => (
                          <TabPanel p={4} key={index} border="1px"
                          borderColor="inherit"
                          borderRadius="md"
                          boxShadow="md">
                            <Stack
                              direction={{ base: 'column', md: 'row' }}
                              bg={'white'}
                              borderRadius={4}
                              spacing={4}
                              align={'flex-start'}
                              justify={'flex-start'}
                            >
                              <PartDescription
                                partNumber={item.part_number_id}
                              />
                              <FieldDisplay
                                label="Requested CN"
                                value={
                                  conditionList.data?.items[
                                    item.condition_id
                                  ] || 'N/A'
                                }
                              />
                              <FieldDisplay
                                label="Requested Qty"
                                value={item.qty}
                              />
                              <FieldDisplay
                                label="Available Total Qty"
                                value={totalAvailableQty ?? 0}
                              />
                            </Stack>

                            <TableContainer
                              bg={'white'}
                              borderRadius={'md'}
                              boxShadow={'md'}
                              borderWidth={1}
                              borderColor={'gray.200'}
                              mt={4}
                            >
                              <Table
                                variant="striped"
                                colorScheme="green"
                                size="sm"
                              >
                                <Thead>
                                  <Tr>
                                    <Th></Th>
                                    <Th>Vendor</Th>
                                    <Th>Quoted P/N</Th>
                                    <Th>Available CN</Th>
                                    <Th>Available UOM</Th>
                                    <Th>Available Qty</Th>
                                    <Th>Price</Th>
                                    <Th>MOQ</Th>
                                    <Th>MOV</Th>
                                    <Th>Delivery Details</Th>
                                    <Th>Remarks</Th>
                                  </Tr>
                                </Thead>
                                {quotationItemsLoading ? (
                                  <Tbody>
                                    <Tr>
                                      <Td colSpan={10} textAlign="center">
                                        <Spinner color="green.500" />
                                      </Td>
                                    </Tr>
                                  </Tbody>
                                ) : (
                                  <Tbody>
                                    {quotationItems &&
                                    quotationItems?.items.length > 0 ? (
                                      quotationItems?.items.map(
                                        (item, index) => (
                                          <Tr key={index}>
                                            <Td>1. {index + 1}</Td>
                                            <Td>
                                              {
                                                item.quotation.customer
                                                  .business_name
                                              }
                                            </Td>
                                            <Td>
                                              <PartDetailText
                                                partNumber={item.part_number_id}
                                              />
                                            </Td>
                                            <Td>
                                              {
                                                conditionList.data?.items[
                                                  item.condition_id
                                                ]
                                              }
                                            </Td>
                                            <Td>
                                              {' '}
                                              {uomList.data?.items[
                                                item.unit_of_measure_id
                                              ] || 'N/A'}{' '}
                                            </Td>
                                            <Td>{item.qty}</Td>
                                            <Td>{item.price}</Td>
                                            <Td>{item.moq}</Td>
                                            <Td>{item.mov}</Td>
                                            <Td>{item.delivery_options}</Td>
                                            <Td>{item.remark}</Td>
                                          </Tr>
                                        )
                                      )
                                    ) : (
                                      <Tr>
                                        <Td colSpan={10} textAlign="center">
                                          No data available
                                        </Td>
                                      </Tr>
                                    )}
                                  </Tbody>
                                )}
                              </Table>
                            </TableContainer>
                          </TabPanel>
                        ))}
                    </TabPanels>
                  </Tabs>
                </Stack>

                <FieldDisplay
                  label="Remarks"
                  value={details?.quotation.remarks || 'N/A'}
                />
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default SupplierQuotationDetails;
