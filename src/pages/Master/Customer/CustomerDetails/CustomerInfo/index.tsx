import { useEffect, useState } from 'react';

import {
  Box,
  HStack,
  Heading,
  Icon,
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
import { AiOutlineStock } from 'react-icons/ai';
import { BiSupport } from 'react-icons/bi';
import { FaUsersRays } from 'react-icons/fa6';
import {
  HiOutlineInformationCircle,
  HiOutlineLibrary,
  HiOutlineLocationMarker,
} from 'react-icons/hi';
import dayjs from 'dayjs';
import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { SlideIn } from '@/components/SlideIn';
import { useCustomerDetails } from '@/services/master/services';

import { Bank } from '../Bank';
import { ContactManager } from '../ContactManager';
import { PrincipleOfOwner } from '../PrincipleOfOwner';
import { ShippingAddress } from '../ShippingAddress';
import { TraderReference } from '../TraderReference';

type CustomerInfoProps = {
  customerId: any;
};

export const CustomerInfo = ({ customerId }: CustomerInfoProps) => {
  const {
    data: details,
    isLoading,
    refetch: refreshDetails,
  } = useCustomerDetails(Number(customerId));
  const [selectedTab, setSelectedTab] = useState<string>('tab1');

  const refreshCustomerDetails = () => {
    refreshDetails();
  };

  useEffect(() => {
    console.log(selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    console.log(details);
  }, [details]);

  return (
    <SlideIn>
      <Stack spacing={2}>
        <LoadingOverlay isLoading={isLoading}>
          {details?.data && (
            <Heading as="h3" size={'lg'}>
              {`${details?.data?.business_name} - ${details?.data?.code}`}{' '}
            </Heading>
          )}
          <Tabs
            position="relative"
            onChange={(index) => setSelectedTab(`tab${index + 1}`)} // Update the active tab
            variant="unstyled"
            mt={3}
          >
            <TabList display="flex" width="100%">
              {[
                {
                  id: 'tab1',
                  icon: HiOutlineInformationCircle,
                  label: 'Customer Details',
                },
                { id: 'tab2', icon: HiOutlineLibrary, label: 'Banking' },
                {
                  id: 'tab3',
                  icon: HiOutlineLocationMarker,
                  label: 'Shipping',
                },
                { id: 'tab4', icon: FaUsersRays, label: 'Principle of Owner' },
                { id: 'tab5', icon: BiSupport, label: 'Contact Manager' },
                { id: 'tab6', icon: AiOutlineStock, label: 'Trader Reference' },
              ].map(({ id, icon, label }) => (
                <Tab
                  key={id}
                  flex="1" // Each tab takes equal width
                  bg={selectedTab === id ? '#0C2556' : 'gray.200'}
                  color={selectedTab === id ? 'white' : 'black'}
                  _hover={{ bg: selectedTab === id ? '#0A1F45' : 'gray.300' }}
                  padding={4} // Adjust padding for better spacing
                >
                  <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                  >
                    <Icon as={icon} fontSize="xl" />
                    <Text fontSize="sm" fontWeight="bold" textAlign="center">
                      {label}
                    </Text>
                  </Box>
                </Tab>
              ))}
            </TabList>
            <TabPanels>
              <TabPanel p={0}>
                <Box
                  bg={'white'}
                  borderRadius={'md'}
                  borderTopRightRadius={0}
                  borderTopLeftRadius={0}
                  boxShadow={'md'}
                  borderWidth={1}
                  borderColor={'gray.200'}
                  p={4}
                  minHeight={'73vh'}
                >
                  <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    mb={2}
                  >
                    <FieldDisplay
                      size={'sm'}
                      label={'Business Name'}
                      value={details?.data?.business_name || 'N/A'}
                    />
                    <FieldDisplay
                      size={'sm'}
                      label={'Business Type'}
                      value={details?.data?.business_type.name || 'N/A'}
                    />
                    <FieldDisplay
                      size={'sm'}
                      label={'Years of Business'}
                      value={details?.data?.year_of_business || 'N/A'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label={'Contact Type'}
                      value={details?.data?.contact_type.name || 'N/A'}
                    />
                  </Stack>
                  <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    mb={2}
                  >
                    <FieldDisplay
                      size={'sm'}
                      label={'Foreign Entity'}
                      value={details?.data?.is_foreign_entity ? 'Yes' : 'No'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label={'Currency'}
                      value={details?.data?.currency?.code || 'N/A'}
                    />
                    <FieldDisplay
                      size={'sm'}
                      label={'Nature of Business'}
                      value={details?.data?.nature_of_business || 'N/A'}
                    />
                    <FieldDisplay
                      size={'sm'}
                      label={'Email'}
                      value={details?.data?.email || 'N/A'}
                    />
                  </Stack>
                  <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    mb={2}
                  >
                    <FieldDisplay
                      size={'sm'}
                      label={'License Trade No.'}
                      value={details?.data?.license_trade_no || 'N/A'}
                    />
                    <FieldDisplay
                      size={'sm'}
                      label={'License Trade Expiry Date'}
                      value={details?.data?.license_trade_exp_date || 'N/A'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label={'VAT Tax ID'}
                      value={details?.data?.vat_tax_id || 'N/A'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="Remarks"
                      value={details?.data?.remarks || 'N/A'}
                      isHtml={true}
                    />
                  </Stack>
                  <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    mb={2}
                  >
                    <FieldDisplay
                      size={'sm'}
                      label={'Mode of Payment'}
                      value={details?.data?.payment_mode?.name ? 'Yes' : 'No'}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label={'Payment Terms'}
                      value={details?.data?.payment_term?.name || 'N/A'}
                    />
                    <FieldDisplay
                      size={'sm'}
                      label={'Total Credit Amount'}
                      value={details?.data?.total_credit_amount || '0'}
                    />
                    <FieldDisplay
                      size={'sm'}
                      label={'Total Credit Period (Days)'}
                      value={details?.data?.total_credit_period || '0'}
                    />
                  </Stack>
                  <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    mb={2}
                  >
                    <Box w={'100%'} mt={0}>
                      <Text fontSize={'sm'} fontWeight={'600'} mb={2}>
                        VAT Tax URL
                      </Text>
                      <DocumentDownloadButton
                      size={'sm'}
                        url={details?.data?.vat_tax_url || ''}
                      />
                    </Box>
                    <Box w={'100%'}>
                      <Text fontSize={'sm'} fontWeight={'600'} mb={2}>
                        License Trade URL
                      </Text>
                      <DocumentDownloadButton
                        style={{ justifyContent: 'flex-start' }}
                        size={'sm'}
                        url={details?.data?.license_trade_url || ''}
                      />
                    </Box>
                    <Box w={'100%'} mt={0}></Box>
                    <Box w={'100%'} mt={0}></Box>
                  </Stack>
                  <Box p={0} m={0}>
                    <HStack justify={'space-between'} mb={2}>
                      <Text fontSize="sm" fontWeight="600">
                        Quality Certificates
                      </Text>
                    </HStack>
                    <TableContainer
                      overflow={'auto'}
                      border="1px"
                      borderColor="#0C2556"
                      boxShadow="md"
                    >
                      <Table variant="striped" size={'sm'}>
                        <Thead bg={'#0C2556'}>
                          <Tr>
                            <Th color={'white'}>S.NO</Th>
                            <Th color={'white'}>Certificate Type</Th>
                            <Th color={'white'}>Document No</Th>
                            <Th color={'white'}>Issue Date</Th>
                            <Th color={'white'}>Validity Date</Th>
                            <Th color={'white'}>Document URL.</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {details?.data?.quality_certificates &&
                            details?.data?.quality_certificates.map(
                              (item, index) => (
                                <Tr key={index}>
                                  <Td>{index + 1}</Td>
                                  <Td> {item?.certificate_type ?? '-'}</Td>
                                  <Td> {item?.doc_no ?? '-'}</Td>
                                  <Td> {item?.issue_date ? dayjs(item?.issue_date).format('DD-MMM-YYYY') : ' - '}</Td>
                                  <Td> {item?.validity_date ? dayjs(item?.validity_date).format('DD-MMM-YYYY') : ' - '}</Td>
                                  <Td>
                                    <DocumentDownloadButton
                                      size={'sm'}
                                      url={item?.doc_url || ''}
                                    />
                                  </Td>
                                </Tr>
                              )
                            )}
                          {details?.data?.quality_certificates &&
                            details?.data?.quality_certificates.length ===
                              0 && (
                              <Tr>
                                <Td colSpan={6} textAlign={'center'}>
                                  No Records Found.
                                </Td>
                              </Tr>
                            )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Box>
                </Box>
              </TabPanel>

              <TabPanel p={0}>
                <Bank
                  customerId={customerId}
                  bankData={details?.data?.customer_banks}
                  refreshFunction={refreshCustomerDetails}
                />
              </TabPanel>

              <TabPanel p={0}>
                <ShippingAddress
                  customerId={customerId}
                  shippingData={details?.data?.customer_shipping_addresses}
                  refreshFunction={refreshCustomerDetails}
                  customerInfo={details?.data}
                />
              </TabPanel>

              <TabPanel p={0}>
                <PrincipleOfOwner
                  customerId={customerId}
                  principleData={details?.data?.customer_principle_owners}
                  refreshFunction={refreshCustomerDetails}
                />
              </TabPanel>

              <TabPanel p={0}>
                <ContactManager
                  customerId={customerId}
                  contactManagerData={details?.data?.customer_contact_managers}
                  refreshFunction={refreshCustomerDetails}
                />
              </TabPanel>

              <TabPanel p={0}>
                <TraderReference
                  customerId={customerId}
                  traderReferenceData={
                    details?.data?.customer_trader_references
                  }
                  refreshFunction={refreshCustomerDetails}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </LoadingOverlay>
      </Stack>
    </SlideIn>
  );
};

export default CustomerInfo;
