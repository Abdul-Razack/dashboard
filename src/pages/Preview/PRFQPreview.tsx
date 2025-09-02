import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  HStack,
  Heading,
  Spinner,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
} from '@chakra-ui/react';
import Axios from 'axios';
import { format } from 'date-fns';
import debounce from 'lodash/debounce';
import { FaRegFilePdf } from 'react-icons/fa';
import { HiPrinter } from 'react-icons/hi';
import { useNavigate, useParams } from 'react-router-dom';

import PDFHeader from '@/components/PreviewContents/Blocks/PDFHeader';
import PDFPreviewFooter from '@/components/PreviewContents/Blocks/PDFPreviewFooter';
import {
  downloadPDF,
  formatFullAddress,
  triggerPrint,
} from '@/helpers/commonHelper';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

export const PRFQPreview: React.FC = () => {
  const minH = 980;
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [printLoading, setPrintLoading] = useState<boolean>(false);
  const [downloading, setDownLoading] = useState<boolean>(false);
  const [pages, setPages] = useState<any>([]);
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  const exportToPDF = () => {
    setDownLoading(true);
    const input = document.getElementById('table-to-export')!; // Get the print content
    downloadPDF(input, 'prfq');
    setTimeout(() => {
      setDownLoading(false);
    }, 1000);
  };

  const handlePrint = (): void => {
    setPrintLoading(true);
    const input = document.getElementById('table-to-export')!;
    setTimeout(() => {
      triggerPrint(input);
      setTimeout(() => {
        setPrintLoading(false);
      }, 2000);
    }, 1000);
  };
  const splitDataIntoPages = (items: any[]) => {
    const pages = [];
    const totalItems = items.length;

    if (totalItems <= 8) {
      pages.push(items);
    } else {
      pages.push(items.slice(0, 8));
      let i = 8;

      while (i + 12 <= totalItems) {
        pages.push(items.slice(i, i + 12));
        i += 12;
      }

      if (i < totalItems) {
        const remainingItems = items.slice(i);
        if (remainingItems.length > 6) {
          pages.push(remainingItems.slice(0, 6));
          pages.push(remainingItems.slice(6));
        } else {
          pages.push(remainingItems);
        }
      }
    }

    setPages(pages);
  };

  let { token } = useParams();
  const [prfqDetails, setPRFQDetails] = useState<any | null>(null);

  const fetchPRFQDetails = async () => {
    try {
      const response = await Axios.get(
        endPoints.others.prfq_by_token.replace(':token', token)
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      console.log(response);
      setPRFQDetails(response.data); // Assuming the API returns the data directly
    } catch (error) {
      console.error('Failed to fetch quotation details:', error);
      throw error; // Rethrowing the error so it can be caught by react-query or similar
    }
  };

  useEffect(() => {
    fetchPRFQDetails();
    setIsLoaded(true);

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
  }, []);

  useEffect(() => {
    if (prfqDetails) {
      splitDataIntoPages(prfqDetails?.rfq?.items);
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  }, [prfqDetails]);

  useEffect(() => {
    if (!token && isLoaded) {
      navigate('/login');
    }
  }, [token, isLoaded]);

  return (
    <React.Fragment>
      <Center width="100vw" minH="100vh">
        <Box maxW="container.md" width="100%">
          {!loading && (
            <React.Fragment>
              <Box maxW="container.md" p={4}>
                <HStack justifyContent="space-between" width="100%">
                  <Heading as="h4" textAlign={'left'} size="md">
                    Purchase RFQ - #{prfqDetails?.rfq?.id}
                  </Heading>

                  {/* Buttons aligned to the right with spacing */}
                  <HStack spacing={4}>
                    <Button
                      colorScheme="blue"
                      variant="outline"
                      isDisabled={printLoading}
                      leftIcon={<HiPrinter />}
                      onClick={handlePrint}
                    >
                      Print
                    </Button>

                    <Button
                      rightIcon={<FaRegFilePdf />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={exportToPDF}
                      isLoading={downloading}
                    >
                      Download PDF
                    </Button>
                  </HStack>
                </HStack>
              </Box>

              <Box id="table-to-export">
                {pages.map((pageData: TODO, pageIndex: number) => (
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
                  >
                    <Box
                      bg="#ffffff"
                      p={6}
                      maxW="900px"
                      mx="auto"
                      boxShadow="lg"
                      borderRadius="md"
                    >
                      <Box>
                        <PDFHeader style={{ fontSize: '10px' }} />
                      </Box>
                      <Box
                        minH={`${minH - (Number(headerHeight) + (Number(pageIndex) > 0 ? 140 : 90))}px`}
                      >
                        {pageIndex === 0 && (
                          <Box className="po-head">
                            <Flex justify="space-between">
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                width="100%"
                              >
                                <Text
                                  fontSize="2xl"
                                  fontWeight="bold"
                                  textTransform={'capitalize'}
                                  mb={1}
                                >
                                  Purchase&nbsp;&nbsp;RFQ
                                </Text>
                              </Box>
                            </Flex>
                            <Box borderBottom="1px solid black" mb={1} mt={1} />
                            <Flex
                              justify="space-between"
                              bg="white"
                              p={4}
                              borderRadius="none"
                              boxShadow="sm"
                              mb={4}
                              mt={1}
                              borderBottom="1px solid black"
                              borderTop="0px solid black"
                              borderLeft="0px solid black"
                              borderRight="0px solid black"
                            >
                              {/* First Box - Vendor Info */}
                              <Box flex="1">
                                <Flex alignItems="baseline">
                                  <Text
                                    fontSize="md"
                                    fontWeight="bold"
                                    minWidth="100px"
                                    textAlign="left"
                                  >
                                    Vendor Info
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight={1}>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    Name
                                  </Text>
                                  <Text
                                    mr={1}
                                    fontWeight="bold"
                                    as="span"
                                    textAlign="right"
                                  >
                                    :&nbsp;&nbsp;
                                  </Text>
                                  <Text
                                    fontSize="10px"
                                    alignSelf="baseline"
                                    textTransform={'capitalize'}
                                  >
                                    {prfqDetails?.customer?.customer.business_name.toLowerCase()}
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight={1}>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    Code
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
                                    {prfqDetails?.customer?.customer.code}
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight={1}>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    Contact
                                  </Text>
                                  <Text
                                    mr={1}
                                    fontWeight="bold"
                                    as="span"
                                    textAlign="right"
                                  >
                                    :&nbsp;&nbsp;
                                  </Text>
                                  <Text
                                    fontSize="10px"
                                    alignSelf="baseline"
                                    textTransform={'capitalize'}
                                  >
                                    {prfqDetails?.customer?.customer_contact_manager?.attention.toLowerCase()}
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight={1}>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    Phone
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
                                    {prfqDetails?.customer
                                      ?.customer_contact_manager?.phone ?? '-'}
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight={1}>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    Email
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
                                    {prfqDetails?.customer
                                      ?.customer_contact_manager?.email ?? '-'}
                                  </Text>
                                </Flex>
                              </Box>

                              {/* Third Box - Address aligned to the right */}
                              <Box>
                                <Flex alignItems="baseline">
                                  <Text
                                    fontSize="md"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    Address
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline">
                                  <Text
                                    fontSize="10px"
                                    alignSelf="baseline"
                                    textTransform={'capitalize'}
                                    dangerouslySetInnerHTML={{
                                      __html: prfqDetails?.customer
                                        ?.customer_contact_manager
                                        ? formatFullAddress(
                                            prfqDetails?.customer
                                              ?.customer_contact_manager
                                          )
                                        : ' - ',
                                    }}
                                  ></Text>
                                </Flex>
                              </Box>
                            </Flex>

                            {/* Second Flex Container */}
                            <Flex
                              justify="space-between"
                              bg="white"
                              p={4}
                              borderRadius="none"
                              boxShadow="sm"
                              mb={4}
                              paddingTop={0}
                              borderBottom="1px solid black"
                              borderTop="0px solid black"
                              borderLeft="0px solid black"
                              borderRight="0px solid black"
                            >
                              {/* First Box - PRFQ ID */}
                              <Box flex="1">
                                <Flex alignItems="baseline">
                                  <Text
                                    fontSize="10px"
                                    minWidth="80px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    PRFQ ID
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
                                    {prfqDetails?.rfq?.id ?? ' - '}
                                  </Text>
                                </Flex>
                              </Box>

                              {/* Second Box - Priority */}
                              <Box flex="1">
                                <Flex alignItems="baseline">
                                  <Text
                                    fontSize="10px"
                                    minWidth="80px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    Priority
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
                                    {prfqDetails?.rfq?.priority?.name ?? ' - '}
                                  </Text>
                                </Flex>
                              </Box>

                              {/* Third Box - Need By Date (aligned to the right) */}
                              <Box ml="auto">
                                <Flex alignItems="baseline">
                                  <Text
                                    fontSize="10px"
                                    minWidth="100px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    Need By Date
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
                                    {prfqDetails?.rfq?.need_by_date
                                      ? format(
                                          new Date(
                                            prfqDetails?.rfq?.need_by_date
                                          ),
                                          'dd-MM-yyyy'
                                        )
                                      : ''}
                                  </Text>
                                </Flex>
                              </Box>
                            </Flex>
                          </Box>
                        )}
                        <Box>
                          <Table
                            variant="simple"
                            bg="white"
                            borderRadius="md"
                            boxShadow="sm"
                            size={'sm'}
                          >
                            <Thead bg="#d9d9d9">
                              <Tr>
                                <Th
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                  }}
                                >
                                  #
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                  }}
                                >
                                  MR.No
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                  }}
                                >
                                  Part.Num & Desc
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                  }}
                                >
                                  Cond
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                  }}
                                >
                                  Qty
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                  }}
                                >
                                  UOM
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                  }}
                                >
                                  Remarks
                                </Th>
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
                                    width={'20px'}
                                  >
                                    {pages
                                      .slice(0, pageIndex)
                                      .reduce(
                                        (sum: any, page: any) =>
                                          sum + page.length,
                                        0
                                      ) +
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
                                    {item?.purchase_request_id}
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '10px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {item?.part_number?.part_number} <br />
                                    {item?.part_number?.spare?.description.toLowerCase()}
                                    {item?.part_number?.spare?.hsc_code && (
                                      <Text whiteSpace="pre-line">
                                        <Text as="span" fontWeight={'bold'}>
                                          HSC Code:{' '}
                                        </Text>
                                        {
                                          item?.part_number?.spare?.hsc_code
                                            ?.name
                                        }
                                      </Text>
                                    )}
                                    <Text whiteSpace="pre-line">
                                      {item?.note}
                                    </Text>
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '10px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                  >
                                    {item?.condition?.name}
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '10px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                    width={'20px'}
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
                                    {item?.unit_of_measure?.name}
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '10px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                  >
                                    {item?.remark ? item?.remark : ' - '}
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>

                          {prfqDetails?.rfq.remarks && (
                            <Flex
                              justify="space-between"
                              mb={6}
                              style={{ fontSize: '10px' }}
                            >
                              <Box width="100%" p={2}>
                                <Text marginEnd={10} fontWeight="bold">
                                  Remarks:
                                </Text>
                                <Text
                                  dangerouslySetInnerHTML={{
                                    __html: prfqDetails?.rfq.remarks
                                      ? prfqDetails?.rfq.remarks
                                      : ' - ',
                                  }}
                                ></Text>
                              </Box>
                            </Flex>
                          )}
                        </Box>
                      </Box>
                      <Box p={0} m={0} border="none" bg="transparent">
                        <PDFPreviewFooter
                          style={{ fontSize: '10px' }}
                          createdAt={prfqDetails?.rfq?.created_at ?? ''}
                          createdBy={prfqDetails?.rfq?.user?.username ?? ''}
                          totalPages={pages.length}
                          currentPage={pageIndex + 1}
                        />
                      </Box>
                    </Box>
                  </Container>
                ))}
              </Box>
            </React.Fragment>
          )}
          {loading && (
            <Center h="100vh">
              <VStack spacing={4}>
                <Spinner size="xl" color="blue.500" />
                <Text fontSize="lg" fontWeight="bold" color="gray.600">
                  Please wait...
                </Text>
              </VStack>
            </Center>
          )}
        </Box>
      </Center>
    </React.Fragment>
  );
};
export default PRFQPreview;
