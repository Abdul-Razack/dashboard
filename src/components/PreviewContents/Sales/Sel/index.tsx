import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Container,
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
import { downloadPDF, getDisplayLabel } from '@/helpers/commonHelper';

import PartDetails from '../../PartDetails';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};

export const PreviewPopup = ({ isOpen, onClose, data }: ModalPopupProps) => {
  const minH = 1123;
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pages, setPages] = useState<any>([]);

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!;
    downloadPDF(input, `sel-${data?.id ? '(#'+ data?.id+')': ''}`);
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

  // Function to split table data into pages (A4 size)
  const splitDataIntoPages = (items: any[]) => {
    const pages = [];
    const totalItems = items.length;

    if (totalItems <= 10) {
      // If 10 or fewer items, just one page
      pages.push(items);
    } else {
      // First page always gets exactly 10 items
      pages.push(items.slice(0, 10));
      let i = 10;

      // Subsequent pages get up to 20 items each
      while (i < totalItems) {
        const end = Math.min(i + 20, totalItems);
        pages.push(items.slice(i, end));
        i = end;
      }
    }

    setPages(pages);
  };

  useEffect(() => {
    if (isOpen && data.items && data.items.length > 0) {
      splitDataIntoPages(data.items);
    }
  }, [isOpen, data]);

  console.log("data", data)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="50vw">
        <ModalHeader textAlign="center">
          <Text fontSize="lg" fontWeight="bold">
            Preview Sales SEL
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <React.Fragment>
            <Box width="100%">
              <Box maxW="container.md" width="100%">
                <Box borderRadius={4} id="table-to-export">
                  <Stack spacing={2} borderRadius="md">
                    {pages.map((pageData: any, pageIndex: number) => (
                      <Container
                        maxW="container.md"
                        key={pageIndex}
                        p={4}
                        minH={minH}
                        className="page-container no-split"
                        style={{
                          pageBreakAfter:
                            pageIndex < pages.length - 1 ? 'always' : 'auto',
                        }}
                        id={`Page${pageIndex}-${headerHeight}`}
                      >
                        <Box
                          bg="#ffffff"
                          p={6}
                          maxW="900px"
                          mx="auto"
                          boxShadow="0 -4px 15px -3px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                          borderRadius="md"
                        >
                          <Box ref={headerElementRef}>
                            <PDFHeader style={{ fontSize: '10px' }} />
                          </Box>
                          <Box
                            minH={`calc(${minH}px - ${Number(headerHeight)}px - ${Number(pageIndex) > 0 ? (50 + (pageIndex * 5)) : pages.length > 1 ? 70 : 80}px)`}
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
                                Sales Enquiry Log
                                </Text>
                              </Box>
                            </Flex>
                            <Flex justify="space-between">
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                width="100%"
                              >
                                <Text fontSize="lg" fontWeight="normal">
                                  SEL&nbsp;&nbsp;
                                  {data?.id ? `- #${data?.id}` : ''}
                                </Text>
                              </Box>
                            </Flex>

                            <Box borderBottom="1px solid black" mb={4} />
                            {pageIndex === 0 && (
                              <React.Fragment>
                                <Flex
                                  justify="space-between"
                                  bg="white"
                                  p={4}
                                  borderRadius="md"
                                  boxShadow="sm"
                                >
                                  {/* First Box */}
                                  <Box flex="1">
                                    <Text
                                      fontSize="10px"
                                      fontWeight="bold"
                                      minWidth="100px"
                                    >
                                      Bill To:
                                    </Text>
                                    {data.customerInfo && (
                                    <Text fontSize="10px" fontWeight={'bold'} alignSelf="baseline">
                                      {data.customerInfo
                                        ? data.customerInfo?.business_name
                                        : ' - '}
                                    </Text>
                                    )}
                                    <Text
                                      fontSize="10px"
                                      dangerouslySetInnerHTML={{
                                        __html: data?.contactAddress
                                          ? data?.contactAddress
                                          : ' - ',
                                      }}
                                    ></Text>
                                  </Box>

                                  <Box>
                                    <Text
                                      fontSize="10px"
                                      fontWeight="bold"
                                      minWidth="100px"
                                    >
                                      SHIP TO:
                                    </Text>
                                    <Text
                                      fontSize="10px"
                                      dangerouslySetInnerHTML={{
                                        __html: data?.vendorAddress
                                          ? data?.vendorAddress
                                          : ' - ',
                                      }}
                                    ></Text>
                                  </Box>
                                </Flex>
                                <Box borderBottom="1px solid black" mb={4} />
                              </React.Fragment>
                            )}
                            <React.Fragment>
                              <Flex
                                justify="space-between"
                                bg="white"
                                p={4}
                                borderRadius="md"
                                boxShadow="none"
                                paddingTop={0}
                                border={'none'}
                                mb={4}
                              >
                                {/* First Box */}
                                <Box flex="1.5">
                                  
                                  {/* <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Customer Name
                                    </Text>
                                    <Text
                                      mr={2}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {data.customerInfo
                                        ? data.customerInfo?.business_name
                                        : ' - '}
                                    </Text>
                                  </Flex> */}

                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Customer Code
                                    </Text>
                                    <Text
                                      mr={2}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {data.customerInfo
                                        ? data.customerInfo?.code
                                        : ' - '}
                                    </Text>
                                  </Flex>

                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Mode of Receipt
                                    </Text>
                                    <Text
                                      mr={2}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {getDisplayLabel(
                                        data.receiptOptions,
                                        data.mode_of_receipt_id
                                          ? data.mode_of_receipt_id.toString()
                                          : 0,
                                        ''
                                      ) || 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Cust RFQ NO
                                    </Text>
                                    <Text
                                      mr={2}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {data?.cust_rfq_no ?? ' - '}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Cust RFQ Date
                                    </Text>
                                    <Text
                                      mr={2}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {data.cust_rfq_date
                                        ? format(
                                            new Date(data.cust_rfq_date),
                                            'dd-MM-yyyy'
                                          )
                                        : ' - '}
                                    </Text>
                                  </Flex>
                                </Box>

                                {/* Second Box */}
                                <Box flex="1">
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      fontWeight="bold"
                                      minWidth="80px"
                                      textAlign="left"
                                    >
                                      Pmt Mode
                                    </Text>
                                    <Text
                                      mr={1}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {getDisplayLabel(
                                        data.paymentModeOptions,
                                        data?.payment_mode_id
                                          ? data?.payment_mode_id.toString()
                                          : 0,
                                        'Payment Mode'
                                      ) || 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      fontWeight="bold"
                                      minWidth="80px"
                                      textAlign="left"
                                    >
                                      Priority
                                    </Text>
                                    <Text
                                      mr={1}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {getDisplayLabel(
                                        data.priorityOptions,
                                        data?.priority_id
                                          ? data?.priority_id.toString()
                                          : 0,
                                        'Priority'
                                      ) || 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      fontWeight="bold"
                                      minWidth="80px"
                                      textAlign="left"
                                    >
                                      Due Date
                                    </Text>
                                    <Text
                                      mr={1}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {data.due_date
                                        ? format(
                                            new Date(data.due_date),
                                            'dd-MM-yyyy'
                                          )
                                        : ' - '}
                                    </Text>
                                  </Flex>
                                </Box>

                                {/* Third Box */}
                                <Box flex="1">
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="70px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Pmt Terms
                                    </Text>
                                    <Text
                                      mr={2}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {getDisplayLabel(
                                        data.paymentTermsOptions,
                                        data.payment_terms_id
                                          ? data.payment_terms_id.toString()
                                          : 0,
                                        'Payment Term'
                                      ) || 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="70px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Currency
                                    </Text>
                                    <Text
                                      mr={2}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {getDisplayLabel(
                                        data.currencyOptions,
                                        data.currency_id
                                          ? data.currency_id.toString()
                                          : 0,
                                        'Currency'
                                      ) || 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="70px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      FOB
                                    </Text>
                                    <Text
                                      mr={2}
                                      fontWeight="bold"
                                      as="span"
                                      textAlign="right"
                                    >
                                      :&nbsp;&nbsp;
                                    </Text>
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {getDisplayLabel(
                                        data.fobOptions,
                                        data.fob_id
                                          ? data.fob_id.toString()
                                          : 0,
                                        'FOB'
                                      ) || 'N/A'}
                                    </Text>
                                  </Flex>
                                </Box>
                              </Flex>
                            </React.Fragment>
                            <Box borderBottom="1px solid black" mb={4} />
                            <Table variant="simple" size="sm">
                              <Thead bg="#d9d9d9">
                                <Tr>
                                  {[
                                    '#',
                                    'Part Num.',
                                    'Desc',
                                    'Cond',
                                    'QTY',
                                    'UOM',
                                    'Remarks',
                                  ].map((header, index) => (
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
                              <Tbody className="previewTableBody">
                                {pageData.map((item: any, index: number) => (
                                  <Tr key={index}>
                                    <Td
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      {(pageIndex === 0 ? 0 : 10) +
                                        (pageIndex > 1
                                          ? (pageIndex - 1) * 20
                                          : 0) +
                                        index +
                                        1}
                                    </Td>
                                    <Td
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      <PartDetails
                                        partNumber={item.part_number_id}
                                        field="part_number"
                                      />
                                    </Td>
                                    <Td
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                        textTransform: 'capitalize',
                                      }}
                                    >
                                      <PartDetails
                                        partNumber={item.part_number_id}
                                        field="description"
                                      />
                                    </Td>
                                    <Td
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      {getDisplayLabel(
                                        data.conditionOptions,
                                        item.condition_id.toString() ?? '0',
                                        'Condition'
                                      ) || 'N/A'}
                                    </Td>
                                    <Td
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      {item.qty}
                                    </Td>
                                    <Td
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      {getDisplayLabel(
                                        data.uomOptions,
                                        item.unit_of_measure_id.toString() ??
                                          '0',
                                        'UOM'
                                      ) || 'N/A'}
                                    </Td>
                                    <Td
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      {item.remark || ' - '}
                                    </Td>
                                  </Tr>
                                ))}
                              </Tbody>
                            </Table>

                            {data?.remarks &&
                              pageIndex === pages.length - 1 && (
                                <Flex
                                  justify="space-between"
                                  mt={3}
                                  style={{ fontSize: '10px' }}
                                >
                                  <Box width="100%" p={2}>
                                    <Text marginEnd={10} fontWeight="bold">
                                      Remarks:
                                    </Text>
                                    <Text
                                      dangerouslySetInnerHTML={{
                                        __html: data?.remarks
                                          ? data?.remarks
                                          : ' - ',
                                      }}
                                    ></Text>
                                  </Box>
                                </Flex>
                              )}
                          </Box>

                          {/* Footer on every page */}
                          <Box mt={4}>
                            <PDFFooter
                              style={{ fontSize: '10px' }}
                              createdAt={data?.created_at ?? ''}
                              createdBy={data?.user?.username ?? ''}
                              totalPages={pages.length}
                              currentPage={pageIndex + 1}
                            />
                          </Box>
                        </Box>
                      </Container>
                    ))}
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
              </Box>
            </Box>
          </React.Fragment>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PreviewPopup;
