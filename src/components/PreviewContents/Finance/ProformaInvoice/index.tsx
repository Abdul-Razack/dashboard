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
  Table,
  Tbody,
  Td,
  Text,
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

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};
export const ProformaInvoicePreview = ({
  isOpen,
  onClose,
  data,
}: ModalPopupProps) => {
  const minH = 1122;
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const footerElementRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [footerHeight, setFooterHeight] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!;
    downloadPDF(input, 'proforma-invoice');
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  useEffect(() => {
    if (isOpen) {
      console.log(data);
      const updateHeight = debounce(() => {
        if (headerElementRef.current) {
          setHeaderHeight(headerElementRef.current.offsetHeight);
        }
        if (footerElementRef.current) {
          setFooterHeight(footerElementRef.current.offsetHeight);
        }
      }, 300);

      // Create and observe the content
      const resizeObserver = new ResizeObserver(updateHeight);
      if (headerElementRef.current) {
        resizeObserver.observe(headerElementRef.current);
      }
      if (footerElementRef.current) {
        resizeObserver.observe(footerElementRef.current);
      }

      // Initial height update
      updateHeight();

      // Cleanup on unmount or when `isOpen` changes
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="60vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Preview Proforma Invoice
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box borderRadius={4}>
            <Stack spacing={2} bg={'white'} borderRadius={'md'}>
              <Container
                maxW="container.lg"
                p={4}
                id="table-to-export"
                minH={minH}
              >
                <Box borderWidth="1px" borderRadius="lg" p={6} boxShadow="md">
                  <Box
                    p={0}
                    m={0}
                    border="none"
                    bg="transparent"
                    ref={headerElementRef}
                  >
                    <PDFHeader style={{ fontSize: '13px' }} />
                  </Box>
                  <Box
                    p={0}
                    m={0}
                    border="none"
                    bg="transparent"
                    minH={minH - (headerHeight + footerHeight) + 'px'}
                  >
                    <Flex justify="space-between">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="100%"
                        p={2}
                      >
                        <Text fontSize="lg" fontWeight="bold">
                          Proforma Invoice
                        </Text>
                      </Box>
                    </Flex>

                    <Divider borderColor="black" borderWidth={1} />
                    <Flex justify="space-between" p={2}>
                      <Box
                        p={0}
                        m={0}
                        border="none"
                        bg="transparent"
                        width="33%"
                      >
                        <Flex direction="column" gap={1}>
                          <Flex alignItems="baseline">
                            <Text sx={{ fontSize: '13px', minWidth: '90px' }}>
                              Ref Type:
                            </Text>
                            <Text fontWeight={'bold'} sx={{ fontSize: '13px' }}>
                              {data?.invoiceType
                                ? data?.invoiceType.toUpperCase()
                                : ' - '}
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                      <Box
                        p={0}
                        m={0}
                        border="none"
                        bg="transparent"
                        width="33%"
                      >
                        <Flex direction="column" gap={1}>
                          <Flex alignItems="baseline">
                            <Text sx={{ fontSize: '13px', minWidth: '90px' }}>
                              Ref No:
                            </Text>
                            <Text fontWeight={'bold'} sx={{ fontSize: '13px' }}>
                              {data?.poId ? data?.poId : ' - '}
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                      <Box
                        p={0}
                        m={0}
                        border="none"
                        bg="transparent"
                        width="33%"
                      >
                        <Flex direction="column" gap={1}>
                          <Flex alignItems="baseline">
                            <Text sx={{ fontSize: '13px', minWidth: '90px' }}>
                              PO Date:
                            </Text>
                            <Text fontWeight={'bold'} sx={{ fontSize: '13px' }}>
                              {data?.po_date ? data?.po_date : ' - '}
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                    </Flex>

                    <Flex justify="space-between" p={2}>
                      <Box
                        p={0}
                        m={0}
                        border="none"
                        bg="transparent"
                        width="33%"
                      >
                        <Flex direction="column" gap={1}>
                          <Flex alignItems="baseline">
                            <Text sx={{ fontSize: '13px', minWidth: '90px' }}>
                              PO Value:
                            </Text>
                            <Text fontWeight={'bold'} sx={{ fontSize: '13px' }}>
                              {data?.poValue ? data?.poValue : ' - '}
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                      <Box
                        p={0}
                        m={0}
                        border="none"
                        bg="transparent"
                        width="33%"
                      >
                        <Flex direction="column" gap={1}>
                          <Flex alignItems="baseline">
                            <Text sx={{ fontSize: '13px', minWidth: '90px' }}>
                              Vendor Name:
                            </Text>
                            <Text fontWeight={'bold'} sx={{ fontSize: '13px' }}>
                              {data?.vendor_name ? data?.vendor_name : ' - '}
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                      <Box
                        p={0}
                        m={0}
                        border="none"
                        bg="transparent"
                        width="33%"
                      >
                        <Flex direction="column" gap={1}>
                          <Flex alignItems="baseline">
                            <Text sx={{ fontSize: '13px', minWidth: '90px' }}>
                              Vendor Code:
                            </Text>
                            <Text fontWeight={'bold'} sx={{ fontSize: '13px' }}>
                              {data?.vendor_code ? data?.vendor_code : ' - '}
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                    </Flex>
                    <Divider borderColor="black" borderWidth={1} mb={1} />
                    <Box p={0} m={0} border="none" bg="transparent" mb={4} mt={2}>
                      <Table variant="unstyled" size={'sm'}>
                        <Thead>
                          <Tr>
                            <Th
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              INV.No
                            </Th>
                            <Th
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              INV.DT
                            </Th>
                            <Th
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              INV.AMT
                            </Th>
                            <Th
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              DUE.DATE
                            </Th>
                            <Th
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              PAY.TERM
                            </Th>
                            <Th
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              NARRATION
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          <Tr>
                            <Td
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              {data?.invoice_number
                                ? data?.invoice_number
                                : ' - '}
                            </Td>
                            <Td
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              {data?.invoice_date
                                ? format(
                                    new Date(data.invoice_date),
                                    'dd-MM-yyyy'
                                  )
                                : ' - '}
                            </Td>
                            <Td
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              {data?.invoice_amount
                                ? data?.invoice_amount
                                : ' - '}
                            </Td>
                            <Td
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              {data?.due_date
                                ? format(new Date(data.due_date), 'dd-MM-yyyy')
                                : ' - '}
                            </Td>
                            <Td
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              {data?.payment_term ? data?.payment_term : ' - '}
                            </Td>
                            <Td
                              sx={{
                                fontSize: '13px',
                                paddingTop: 1,
                                paddingBottom: 2,
                              }}
                            >
                              {data?.narration ? data?.narration : ' - '}
                            </Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </Box>
                  </Box>
                  <Box
                    p={0}
                    m={0}
                    border="none"
                    bg="transparent"
                    ref={footerElementRef}
                  >
                    <PDFFooter style={{ fontSize: '13px' }} />
                  </Box>
                </Box>
              </Container>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify={'center'}
                alignItems={'center'}
                display={'flex'}
                mt={4}
              >
                <Button
                  size={'sm'}
                  onClick={exportToPDF}
                  colorScheme="green"
                  leftIcon={<Icon as={HiPrinter} />}
                  isLoading={loading}
                >
                  Export PDF
                </Button>

                <Button
                  colorScheme="red"
                  size={'sm'}
                  isDisabled={loading}
                  onClick={onClose}
                >
                  Close
                </Button>
              </Stack>
            </Stack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ProformaInvoicePreview;
