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

import PartDetails from '../POPartDetails';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};

export const PreviewPopup = ({ isOpen, onClose, data }: ModalPopupProps) => {
  const minH = 980;
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pages, setPages] = useState<any>([]);

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!;
    downloadPDF(input, 'repair-logs-request');
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
      pages.push(items);
    } else {
      pages.push(items.slice(0, 10));
      let i = 10;

      while (i < totalItems) {
        const end = Math.min(i + 12, totalItems);
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="50vw">
        <ModalHeader textAlign="center">
          <Text fontSize="lg" fontWeight="bold">
            Preview Repair Log
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <React.Fragment>
            <Box width="100%">
              <Box maxW="container.md" width="100%"></Box>
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
                          minH={`calc(${minH}px - ${Number(headerHeight)}px - ${Number(pageIndex) > 0 ? 60 : pages.length > 1 ? 40 : 50}px)`}
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
                                Repair&nbsp;Logs&nbsp;Request&nbsp;
                                {data?.id ? `- #${data?.id}` : ''}
                              </Text>
                            </Box>
                          </Flex>
                          <Box borderBottom="1px solid black" mb={4} />

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
                              <Box flex="1">
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    minWidth="120px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    RR Type
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
                                      data.typeOptions,
                                      data.type ? data.type : 0,
                                      ''
                                    ) || 'Type'}
                                  </Text>
                                </Flex>
                                {(data.type && data.type !== 'sel' &&
                                  data.type !== 'so') && (
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    minWidth="120px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    Ref Name
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
                                    {data?.ref_name
                                        ? data?.ref_name.toString():''}
                                  </Text>
                                </Flex>)}


                                {(data.type === 'sel' ||
                                  data.type === 'so') && (
                                  <React.Fragment>
                                    <Flex alignItems="baseline" lineHeight="1">
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
                                      <Text
                                        fontSize="10px"
                                        alignSelf="baseline"
                                      >
                                        {data.customerInfo
                                          ? data.customerInfo?.business_name
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
                                      <Text
                                        fontSize="10px"
                                        alignSelf="baseline"
                                      >
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
                                        {`${data.type === 'sel' ? 'SEL' : data.type === 'so' ? 'SO' : ''} No`}
                                      </Text>
                                      <Text
                                        mr={2}
                                        fontWeight="bold"
                                        as="span"
                                        textAlign="right"
                                      >
                                        :&nbsp;&nbsp;
                                      </Text>
                                      <Text
                                        fontSize="10px"
                                        alignSelf="baseline"
                                      >
                                        {data?.itemDetails?.id ?? ' - '}
                                      </Text>
                                    </Flex>
                                    <Flex alignItems="baseline" lineHeight="1">
                                      <Text
                                        fontSize="10px"
                                        minWidth="120px"
                                        textAlign="left"
                                        fontWeight="bold"
                                      >
                                        {`${data.type === 'sel' ? 'SEL' : data.type === 'so' ? 'SO' : ''} Date`}
                                      </Text>
                                      <Text
                                        mr={2}
                                        fontWeight="bold"
                                        as="span"
                                        textAlign="right"
                                      >
                                        :&nbsp;&nbsp;
                                      </Text>
                                      <Text
                                        fontSize="10px"
                                        alignSelf="baseline"
                                      >
                                        {data?.itemDetails?.created_at
                                          ? format(
                                              new Date(
                                                data?.itemDetails?.created_at
                                              ),
                                              'dd-MM-yyyy'
                                            )
                                          : ' - '}
                                      </Text>
                                    </Flex>
                                  </React.Fragment>
                                )}
                              </Box>

                              {/* Third Box */}
                              <Box>
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

                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    Enquiry Date
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
                                    {data.enquiry_date
                                      ? format(
                                          new Date(data.enquiry_date),
                                          'dd-MM-yyyy'
                                        )
                                      : ' - '}
                                  </Text>
                                </Flex>
                              </Box>
                            </Flex>

                            <Box borderBottom="1px solid black" mb={4} />
                          </React.Fragment>
                          <Table variant="simple" size="sm">
                            <Thead bg="#d9d9d9">
                              <Tr>
                                {[
                                  '#',
                                  'Part.Num & Desc',
                                  'Cond',
                                  'QTY',
                                  'UOM',
                                  'Defect',
                                  'BC',
                                  'RP',
                                  'OH',
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
                                        ? (pageIndex - 1) * 12
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
                                      showHSC={false}
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
                                      item.unit_of_measure_id.toString() ?? '0',
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
                                    {item.defect || ' - '}
                                  </Td>

                                  <Td
                                    sx={{
                                      fontSize: '10px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                  >
                                    {item.is_bc ? 'Yes' : 'No'}
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '10px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                  >
                                    {item.is_rp ? 'Yes' : 'No'}
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '10px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                  >
                                    {item.is_oh ? 'Yes' : 'No'}
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

                          {data?.remarks && pageIndex === pages.length - 1 && (
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
          </React.Fragment>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PreviewPopup;
