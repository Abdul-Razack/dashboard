import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import debounce from 'lodash/debounce';
import { HiPrinter } from 'react-icons/hi';

import PDFFooter from '@/components/PreviewContents/Blocks/PDFFooter';
import PDFHeader from '@/components/PreviewContents/Blocks/PDFHeader';
import { downloadPDF } from '@/helpers/commonHelper';

import { useCustomerDetails } from '@/services/master/services';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  customerData: any;
};

export const PreviewPopup = ({ isOpen, onClose, customerData }: ModalPopupProps) => {
  const { data } = useCustomerDetails(customerData, {enabled: isOpen === true});
  const customerDetails = data?.data;
  const qualityData = customerDetails?.quality_certificates  || [];
  const banksData = customerDetails?.customer_banks  || [];
  const contactManagersData = customerDetails?.customer_contact_managers  || [];
  const principleOwnersData = customerDetails?.customer_principle_owners  || [];
  const shippingAddressesData = customerDetails?.customer_shipping_addresses  || [];
  const traderReferencesData = customerDetails?.customer_trader_references  || [];

  const minH = 980;
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!;
    downloadPDF(input, 'customer-master');
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (isOpen) {
      const updateHeight = debounce(() => {
        if (headerElementRef.current) {
          setHeaderHeight(headerElementRef.current.offsetHeight);
        }
      }, 300);

      const resizeObserver = new ResizeObserver(updateHeight);
      if (headerElementRef.current)
        resizeObserver.observe(headerElementRef.current);
      updateHeight();

      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isOpen]);

  const allItems = [
    ...qualityData,
    ...banksData,
    ...contactManagersData,
    ...principleOwnersData,
    ...shippingAddressesData,
    ...traderReferencesData,
  ];

  // Function to split table data into pages (A4 size)
  const splitDataIntoPages = (items: any[], itemsPerPage: number) => {
    const pages = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      pages.push(items.slice(i, i + itemsPerPage));
    }
    return pages;
  };

  const itemsPerPage = 6;
  const pages = allItems ? splitDataIntoPages(allItems, itemsPerPage) : [];
  console.log("pages", pages)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="60vw">
        <ModalHeader textAlign="center">
          <Text fontSize="lg" fontWeight="bold">
            Preview Customer Master
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box borderRadius={4} id="table-to-export">
            <Stack spacing={2} bg="white" borderRadius="md">
              {/* {pages.map((pageItems, pageIndex) => ( */}
                <Container
                  // key={pageIndex}
                  maxW="container.md"
                  p={4}
                  minH={minH}
                  style={{ pageBreakAfter: 'always' }}
                >
                  <Box borderWidth="1px" borderRadius="lg" p={6} boxShadow="md">
                    <Box ref={headerElementRef}>
                      <PDFHeader style={{ fontSize: '10px' }} />
                    </Box>

                    <Box minH={minH - (headerHeight + 100) + 'px'}>
                      <Flex justify="space-between">
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                          width="100%"
                          p={2}
                        >
                          <Text fontSize="lg" fontWeight="bold">
                               CUSTOMER MASTER {customerData ? `- #${customerData}` : ''}
                          </Text>
                        </Box>
                      </Flex>
                      <Divider borderColor="black" borderWidth={1} />
                      <Flex mb={2} mt={2} justify="space-between" p={2}>
                        <Box>
                          <Flex direction="column" gap={1} pt={0} alignItems="baseline" lineHeight="1">
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Business Name:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.business_name}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Business Type:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.business_type?.name}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Years of Business:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.year_of_business}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Contact Type:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.contact_type?.name}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Foreign Entity:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.is_foreign_entity ? 'Yes' : 'No'}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Currency:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.currency?.code}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                                <Text sx={{ fontSize: '10px' }}>Nature of Business:</Text>
                                <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                  {customerDetails?.nature_of_business}
                                </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Email:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.email}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                        <Box>
                          <Flex direction="column" pt={0} alignItems="baseline" lineHeight="1">
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>License Trade No:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.license_trade_no}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>License Trade (Ex Date):</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.license_trade_exp_date}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>VAT Tax ID:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.vat_tax_id}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Remarks:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.remarks || ' - '}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Mode of Payment:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.payment_mode?.name}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Payment Terms:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.payment_term?.name}
                              </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                                <Text sx={{ fontSize: '10px' }}>Total Credit Amount:</Text>
                                <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                  {customerDetails?.total_credit_amount}
                                </Text>
                            </Flex>
                            <Flex justify="space-between" gap={2}>
                              <Text sx={{ fontSize: '10px' }}>Total Credit Period (Days):</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '10px' }}>
                                {customerDetails?.total_credit_period}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                      </Flex>
                      <Box mb={2}>
                        <Text fontSize="md" fontWeight="bold">
                          Quality Certificates
                        </Text>
                        <Table variant='striped' size="sm">
                          <Thead>
                            <Tr>
                              {['#', 'Certificates Type', 'Document No', 'Validity Date'].map((header, index) => (
                                <Th
                                  key={index}
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                  }}
                                >
                                  {header}
                                </Th>
                              ))}
                            </Tr>
                          </Thead>
                          <Tbody>
                            {qualityData.length > 0 ? (
                              qualityData.map((item: any, index: number) => (
                                <Tr key={index}>
                                  <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                    {index + 1}
                                  </Td>
                                  <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                    {item.certificate_type}
                                  </Td>
                                  <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                    {item.doc_no}
                                  </Td>
                                  <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                    {item?.validity_date
                                      ? format(new Date(item.validity_date), 'dd-MM-yyyy')
                                      : 'N/A'}
                                  </Td>
                                </Tr>
                              ))
                            ) : (
                              <Tr>
                                <Td colSpan={4} textAlign="center" fontSize="13px" py={3} color="gray.500">
                                  No data found
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </Box>
                      <Divider borderColor="black" borderWidth={1} mb={4} />
                        <Box mb={2}>
                           <Text fontSize="md" fontWeight="bold">Banking</Text>
                            <Table variant='striped' size="sm">
                              <Thead>
                                <Tr>
                                  {['#', 'Beneficiary Name', 'Name', 'Address', 'Branch', 'AC/IBAN No'].map((header, index) => (
                                    <Th
                                      key={index}
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      {header}
                                    </Th>
                                  ))}
                                </Tr>
                              </Thead>
                              <Tbody>
                                {banksData.length > 0 ? (
                                  banksData.map((item: any, index: number) => (
                                    <Tr key={index}>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {index + 1}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.beneficiary_name}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.bank_name}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.bank_address}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.bank_branch}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.bank_ac_iban_no}
                                      </Td>
                                    </Tr>
                                  ))
                                ) : (
                                  <Tr>
                                    <Td colSpan={6} textAlign="center" fontSize="13px" py={3} color="gray.500">
                                      No data found
                                    </Td>
                                  </Tr>
                                )}
                              </Tbody>
                            </Table>
                        </Box>
                      <Divider borderColor="black" borderWidth={1} mb={4} />
                        <Box mb={2}>
                          <Text fontSize="md" fontWeight="bold">Shipping</Text>
                          <Table variant='striped' size="sm">
                              <Thead>
                                <Tr>
                                  {['#', 'Consignee Name', 'Attention', 'Address', 'Country', 'Email', 'Phone'].map((header, index) => (
                                    <Th
                                      key={index}
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      {header}
                                    </Th>
                                  ))}
                                </Tr>
                              </Thead>
                              <Tbody>
                                {shippingAddressesData.length > 0 ? (
                                  shippingAddressesData.map((item: any, index: number) => (
                                    <Tr key={index}>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {index + 1}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.consignee_name}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.attention}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2, maxWidth: '135px' }} >
                                        {item.address} {item.address_line2}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.country}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2, maxWidth: '135px'}}>
                                        {item.email}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.phone}
                                      </Td>
                                    </Tr>
                                  ))
                                ) : (
                                  <Tr>
                                    <Td colSpan={7} textAlign="center" fontSize="13px" py={3} color="gray.500">
                                      No data found
                                    </Td>
                                  </Tr>
                                )}
                              </Tbody>
                          </Table>
                        </Box>  
                      <Divider borderColor="black" borderWidth={1} mb={4} />
                        <Box mb={2}>
                          <Text fontSize="md" fontWeight="bold">Principle of Owner</Text>
                          <Table variant='striped' size="sm">
                              <Thead>
                                <Tr>
                                  {['#', 'Owner', 'Phone', 'Email', 'Remarks'].map((header, index) => (
                                    <Th
                                      key={index}
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      {header}
                                    </Th>
                                  ))}
                                </Tr>
                              </Thead>
                              <Tbody>
                                {principleOwnersData.length > 0 ? (
                                  principleOwnersData.map((item: any, index: number) => (
                                    <Tr key={index}>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {index + 1}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.owner}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.phone}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2, maxWidth: '135px'}}>
                                        {item.email}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.remarks || '-'}
                                      </Td>
                                    </Tr>
                                  ))
                                ) : (
                                  <Tr>
                                    <Td colSpan={5} textAlign="center" fontSize="13px" py={3} color="gray.500">
                                      No data found
                                    </Td>
                                  </Tr>
                                )}
                              </Tbody>
                            </Table>
                        </Box>  
                      <Divider borderColor="black" borderWidth={1} mb={4} />
                        <Box mb={2}>
                          <Text fontSize="md" fontWeight="bold">Contact Manager</Text>
                          <Table variant='striped' size="sm">
                              <Thead>
                                <Tr>
                                  {['#', 'Attention', 'Address', 'City', 'Country', 'Email', 'Phone'].map((header, index) => (
                                    <Th
                                      key={index}
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      {header}
                                    </Th>
                                  ))}
                                </Tr>
                              </Thead>
                              <Tbody>
                                {contactManagersData.length > 0 ? (
                                  contactManagersData.map((item: any, index: number) => (
                                    <Tr key={index}>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {index + 1}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.attention}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2, maxWidth: '135px' }}>
                                        {item.address} {item.address_line2}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.city}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.country}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2, maxWidth: '135px' }}>
                                        {item.email}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.phone}
                                      </Td>
                                    </Tr>
                                  ))
                                ) : (
                                  <Tr>
                                    <Td colSpan={7} textAlign="center" fontSize="13px" py={3} color="gray.500">
                                      No data found
                                    </Td>
                                  </Tr>
                                )}
                              </Tbody>
                          </Table>
                        </Box>  
                      <Divider borderColor="black" borderWidth={1} mb={4} />
                        <Box mb={2}>
                          <Text fontSize="md" fontWeight="bold">Trader Reference</Text>
                          <Table variant='striped' size="sm">
                              <Thead>
                                <Tr>
                                  {['#', 'Attention', 'Address', 'City', 'Country', 'Email', 'Phone'].map((header, index) => (
                                    <Th
                                      key={index}
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      {header}
                                    </Th>
                                  ))}
                                </Tr>
                              </Thead>
                              <Tbody>
                                {traderReferencesData.length > 0 ? (
                                  traderReferencesData.map((item: any, index: number) => (
                                    <Tr key={index}>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {index + 1}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.attention}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2, maxWidth: '135px' }}>
                                        {item.address} {item.address_line2}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.city}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.country}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2, maxWidth: '135px'}}>
                                        {item.email}
                                      </Td>
                                      <Td sx={{ fontSize: '10px', paddingTop: 1, paddingBottom: 2 }}>
                                        {item.phone}
                                      </Td>
                                    </Tr>
                                  ))
                                ) : (
                                  <Tr>
                                    <Td colSpan={7} textAlign="center" fontSize="13px" py={3} color="gray.500">
                                      No data found
                                    </Td>
                                  </Tr>
                                )}
                              </Tbody>
                          </Table>
                        </Box>  
                    </Box>

                    {/* Footer on every page */}
                    <Box mt={4}>
                      <PDFFooter
                        style={{ fontSize: '10px' }}
                        createdAt={customerDetails?.created_at ?? ''}
                      />
                    </Box>
                  </Box>
                </Container>
              {/* ))}   */}
            </Stack>
          </Box>
          <Stack
            direction={{ base: 'column', md: 'row' }}
            justify="center"
            alignItems="center"
            mt={4}
          >
            <Button
              size="sm"
              onClick={exportToPDF}
              colorScheme="green"
              leftIcon={<Icon as={HiPrinter} />}
              isLoading={loading}
            >
              Export PDF
            </Button>
            <Button
              colorScheme="red"
              size="sm"
              isDisabled={loading}
              onClick={onClose}
            >
              Close
            </Button>
          </Stack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PreviewPopup;