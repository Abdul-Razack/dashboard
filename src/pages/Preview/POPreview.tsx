import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Center,
  Container,
  Flex,
  Grid,
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

import { CurrencyToWords } from '@/components/CurrencyToWords';
import PDFHeader from '@/components/PreviewContents/Blocks/PDFHeader';
import { PDFPreviewFooter } from '@/components/PreviewContents/Blocks/PDFPreviewFooter';
import {
  downloadPDF,
  formatContactAddress,
  formatShippingAddress,
  triggerPrint,
} from '@/helpers/commonHelper';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

export const POPreview: React.FC = () => {
  const minH = 1123;
  const navigate = useNavigate();
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [printLoading, setPrintLoading] = useState<boolean>(false);
  const [downloading, setDownLoading] = useState<boolean>(false);
  const [contactAddress, setContactAddress] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [pages, setPages] = useState<any>([]);
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [vendorQuoteNos, setVendorQuoteNos] = useState<TODO>([]);
  const [vendorQuoteDates, setVendorQuoteDates] = useState<TODO>([]);

  const exportToPDF = () => {
    setDownLoading(true);
    const input = document.getElementById('table-to-export')!; // Get the print content
    downloadPDF(input, 'purchase-order');
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
      }, 3000);
    }, 1000);
  };

  const splitDataIntoPages = (items: any[]) => {
    const pages: any[][] = [];
    const totalItems = items.length;

    if (totalItems <= 8) {
      pages.push(items);
    } else {
      // Page 1: first 6 items
      pages.push(items.slice(0, 8));

      let i = 8;
      while (i + 12 <= totalItems) {
        pages.push(items.slice(i, i + 12));
        i += 12;
      }

      const remainingItems = items.slice(i);
      if (remainingItems.length > 0) {
        if (remainingItems.length > 8) {
          pages.push(remainingItems);
          pages.push([]);
        } else {
          pages.push(remainingItems);
        }
      }
    }

    // Add a dummy empty page

    setPages(pages);
  };

  let { token } = useParams();
  const [poDetails, setPODetails] = useState<any | null>(null);
  const fetchPODetails = async () => {
    try {
      const response = await Axios.get(
        endPoints.others.purchase_order_by_token.replace(':token', token)
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      setPODetails(response.data?.data); // Assuming the API returns the data directly
    } catch (error) {
      console.error('Failed to fetch quotation details:', error);
      throw error; // Rethrowing the error so it can be caught by react-query or similar
    }
  };

  useEffect(() => {
    fetchPODetails();
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
    if (poDetails) {
      setContactAddress(
        formatContactAddress(poDetails?.customer_contact_manager)
      );
      setShippingAddress(
        formatShippingAddress(poDetails?.ship_customer_shipping_address)
      );

      const vendorQuoteNos = poDetails?.quotations.map(
        (quotation: any) => quotation.vendor_quotation_no
      );
      const vendorQuoteDates = poDetails?.quotations.map((quotation: any) =>
        format(new Date(quotation.vendor_quotation_date), 'dd-MM-yyyy')
      );
      setVendorQuoteNos(vendorQuoteNos);
      setVendorQuoteDates(vendorQuoteDates);
      splitDataIntoPages(poDetails.items);

      setTimeout(() => {
        setLoading(false);
      }, 3000);
    }
  }, [poDetails]);

  useEffect(() => {
    if (!token && isLoaded) {
      navigate('/login');
    }
  }, [token, isLoaded]);

  return (
    <React.Fragment>
      <Center width="100%" minH="100vh">
        <Box maxW="container.md" width="100%">
          {!loading && (
            <React.Fragment>
              <Box maxW="container.md" p={4}>
                <HStack justifyContent="space-between" width="100%">
                  <Heading as="h4" textAlign={'left'} size="md">
                    Purchase Order - #{poDetails?.id}
                  </Heading>

                  {/* Buttons aligned to the right with spacing */}
                  <HStack spacing={4}>
                    <Button
                      colorScheme="blue"
                      variant="outline"
                      isDisabled={printLoading || downloading}
                      leftIcon={<HiPrinter />}
                      onClick={handlePrint}
                      isLoading={printLoading}
                    >
                      Print
                    </Button>

                    <Button
                      rightIcon={<FaRegFilePdf />}
                      colorScheme="blue"
                      variant="outline"
                      onClick={exportToPDF}
                      isLoading={downloading}
                      isDisabled={printLoading || downloading}
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
                        minH={
                          minH -
                          (headerHeight + pageIndex > 0
                            ? 180
                            : pages.length > 1
                              ? 190
                              : 200) +
                          'px'
                        }
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
                                <Text fontSize="20px" fontWeight="bold">
                                  PURCHASE&nbsp;&nbsp;ORDER - {poDetails?.id}
                                  {poDetails?.version && poDetails?.version > 0
                                    ? 'R' + poDetails?.version
                                    : ''}
                                </Text>
                              </Box>
                            </Flex>
                            <Box borderBottom="1px solid black" mt={2} mb={2} />
                            <Flex
                              justify="space-between"
                              bg="white"
                              p={4}
                              borderRadius="md"
                              boxShadow="sm"
                            >
                              {/* First Box */}
                              <Box flex="1" mr={4}>
                                <Text
                                  fontSize="10px"
                                  fontWeight="bold"
                                  minWidth="100px"
                                >
                                  TO:
                                </Text>
                                <Text
                                  fontSize="10px"
                                  dangerouslySetInnerHTML={{
                                    __html: contactAddress,
                                  }}
                                ></Text>
                              </Box>

                              {/* Second Box */}
                              <Box flex="1" mr={4}>
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
                                    __html: shippingAddress,
                                  }}
                                ></Text>
                              </Box>

                              {/* Third Box */}
                              <Box flex="1">
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    PO No
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
                                    {poDetails?.id}
                                    {poDetails?.version &&
                                    poDetails?.version > 0
                                      ? 'R' + poDetails?.version
                                      : ''}
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    Created On
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
                                    {poDetails?.created_at
                                      ? format(
                                          new Date(poDetails?.created_at),
                                          ' dd-MM-yyyy hh:mm'
                                        )
                                      : ''}
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    Modified On
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
                                    {poDetails?.modified_at
                                      ? format(
                                          new Date(poDetails?.modified_at),
                                          ' dd-MM-yyyy hh:mm'
                                        )
                                      : ''}
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    No of Items
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
                                    {poDetails?.items
                                      ? poDetails?.items.length
                                      : ''}
                                  </Text>
                                </Flex>
                                {/* <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    &nbsp;&nbsp;Prepared By
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
                                    {poDetails?.user
                                      ? poDetails?.user?.first_name +
                                        ' ' +
                                        poDetails?.user?.last_name
                                      : ''}
                                  </Text>
                                </Flex> */}
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
                                    {poDetails?.priority?.name ?? ' - '}
                                  </Text>
                                </Flex>
                              </Box>
                            </Flex>

                            {/* Second Flex Container */}
                            <Flex
                              justify="space-between"
                              bg="white"
                              p={4}
                              borderRadius="md"
                              boxShadow="sm"
                              mb={4}
                              paddingTop={0}
                            >
                              {/* First Box */}
                              <Box flex="1" mr={4}>
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    minWidth="120px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    Vendor Code
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
                                    {poDetails?.customer?.code ?? ' - '}
                                  </Text>
                                </Flex>
                                {poDetails?.quotations &&
                                  poDetails?.quotations.length > 0 && (
                                    <Flex alignItems="baseline" lineHeight="1">
                                      <Text
                                        fontSize="10px"
                                        minWidth="120px"
                                        textAlign="left"
                                        fontWeight="bold"
                                      >
                                        Vendor Ref
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
                                        {vendorQuoteNos.length > 0
                                          ? vendorQuoteNos.join(', ')
                                          : 'NA'}
                                      </Text>
                                    </Flex>
                                  )}
                                {poDetails?.quotations &&
                                  poDetails?.quotations.length > 0 && (
                                    <Flex alignItems="baseline" lineHeight="1">
                                      <Text
                                        fontSize="10px"
                                        minWidth="120px"
                                        textAlign="left"
                                        fontWeight="bold"
                                      >
                                        Ref Date
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
                                        {vendorQuoteDates.length > 0
                                          ? vendorQuoteDates.join(', ')
                                          : 'NA'}
                                      </Text>
                                    </Flex>
                                  )}
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    minWidth="120px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    Email
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
                                    {poDetails?.customer?.email ?? ' - '}
                                  </Text>
                                </Flex>
                              </Box>

                              {/* Second Box */}
                              <Box flex="1">
                                {poDetails?.quotations &&
                                  poDetails?.quotations.length > 0 && (
                                    <Flex alignItems="baseline" lineHeight="1">
                                      <Text
                                        fontSize="10px"
                                        minWidth="70px"
                                        textAlign="left"
                                        fontWeight="bold"
                                      >
                                        Our Ref
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
                                        {poDetails?.rfq_ids &&
                                        poDetails?.rfq_ids.length > 0
                                          ? poDetails?.rfq_ids.join(', ')
                                          : ' - '}
                                      </Text>
                                    </Flex>
                                  )}
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    minWidth="70px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    Payment
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
                                    {poDetails?.payment_mode?.name ?? ' - '}
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    minWidth="70px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    Terms
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
                                    {poDetails?.payment_term?.name ?? ' - '}
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
                                    {poDetails?.currency?.code ?? ' - '}
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
                                    &nbsp;&nbsp;FOB
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
                                    {poDetails?.fob?.name ?? ' - '}
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    minWidth="70px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    &nbsp;&nbsp;Ship A/C
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
                                    {poDetails?.ship_account?.account_number ??
                                      ' - '}
                                  </Text>
                                </Flex>
                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    minWidth="70px"
                                    textAlign="left"
                                    fontWeight="bold"
                                  >
                                    &nbsp;&nbsp;Ship Mode
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
                                    {poDetails?.ship_mode?.name ?? ' - '}
                                  </Text>
                                </Flex>
                              </Box>
                            </Flex>
                          </Box>
                        )}
                        {pageIndex !== 0 && (
                          <Flex justify="space-between">
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              width="100%"
                              mb={3}
                            >
                              <Text fontSize="20px" fontWeight="bold">
                                PURCHASE&nbsp;&nbsp;ORDER - {poDetails?.id}
                                {poDetails?.version && poDetails?.version > 0
                                  ? 'R' + poDetails?.version
                                  : ''}
                              </Text>
                            </Box>
                          </Flex>
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
                                  Part.Num & Desc
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                  }}
                                >
                                  CD
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
                                    textAlign: 'right',
                                  }}
                                >
                                  Price
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                    textAlign: 'right',
                                  }}
                                >
                                  Tot.Pri
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
                                    {item?.part_number?.part_number} <br />
                                    {item?.part_number?.spare?.description}
                                    {item?.note && (
                                      <Text whiteSpace="pre-line">
                                        <Text as="span" fontWeight={'bold'}>
                                          Note:{' '}
                                        </Text>
                                        {item?.note}
                                      </Text>
                                    )}
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
                                      textAlign: 'right',
                                    }}
                                  >
                                    {poDetails?.currency?.symbol}
                                    {item.price.toFixed(2)}
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '10px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                      textAlign: 'right',
                                    }}
                                  >
                                    {poDetails?.currency?.symbol}
                                    {(item.qty * item.price).toFixed(2)}
                                  </Td>
                                </Tr>
                              ))}
                            </Tbody>
                          </Table>
                        </Box>

                        {pageIndex === pages.length - 1 && (
                          <Box
                            bg="white"
                            p={4}
                            borderRadius="md"
                            boxShadow="sm"
                            mt={4}
                          >
                            <Flex
                              justify="space-between"
                              align="flex-start"
                              flexWrap="wrap"
                            >
                              {/* Amount in Words Section */}
                              <Box flex="1" maxWidth="300px" pr={4}>
                                <CurrencyToWords
                                  amount={poDetails?.total_price}
                                  currency={poDetails?.currency?.code}
                                />

                                <Box
                                  mt={2}
                                  display={poDetails?.remark ? 'block' : 'none'}
                                >
                                  <Text fontSize="10px" fontWeight="bold">
                                    Remarks:
                                  </Text>
                                  <Text
                                    fontSize="10px"
                                    dangerouslySetInnerHTML={{
                                      __html: poDetails?.remark
                                        ? poDetails?.remark
                                        : ' - ',
                                    }}
                                  ></Text>
                                </Box>
                              </Box>

                              {/* Pricing Section */}
                              <Box flex="1" maxWidth="180px">
                                <Grid
                                  templateColumns="auto 6px 1fr"
                                  gap={2}
                                  lineHeight={1}
                                >
                                  {/* Subtotal */}
                                  <Text fontSize="10px">Subtotal</Text>
                                  <Text fontSize="10px">:</Text>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    textAlign="right"
                                  >
                                    {`${poDetails?.currency?.symbol} `}
                                    {poDetails?.subtotal
                                      ? poDetails?.subtotal.toFixed(2)
                                      : '0.00'}
                                  </Text>

                                  {/* Discount */}
                                  <Text fontSize="10px">Discount</Text>
                                  <Text fontSize="10px">:</Text>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    textAlign="right"
                                  >
                                    {`${poDetails?.currency?.symbol} `}
                                    {poDetails?.discount
                                      ? poDetails?.discount.toFixed(2)
                                      : '0.00'}
                                  </Text>

                                  {/* VAT */}
                                  <Text fontSize="10px">VAT</Text>
                                  <Text fontSize="10px">:</Text>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    textAlign="right"
                                  >
                                    {`${poDetails?.currency?.symbol} `}
                                    {poDetails?.vat
                                      ? poDetails?.vat.toFixed(2)
                                      : '0.00'}
                                  </Text>

                                  {/* Bank Charge */}
                                  <Text fontSize="10px">Bank Charge</Text>
                                  <Text fontSize="10px">:</Text>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    textAlign="right"
                                  >
                                    {`${poDetails?.currency?.symbol} `}
                                    {poDetails?.bank_charge
                                      ? poDetails?.bank_charge.toFixed(2)
                                      : '0.00'}
                                  </Text>

                                  {/* Misc Charge */}
                                  <Text fontSize="10px">Misc Charge</Text>
                                  <Text fontSize="10px">:</Text>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    textAlign="right"
                                  >
                                    {`${poDetails?.currency?.symbol} `}
                                    {poDetails?.miscellaneous_charges
                                      ? poDetails?.miscellaneous_charges.toFixed(
                                          2
                                        )
                                      : '0.00'}
                                  </Text>

                                  {/* Freight */}
                                  <Text fontSize="10px">Freight</Text>
                                  <Text fontSize="10px">:</Text>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    textAlign="right"
                                  >
                                    {`${poDetails?.currency?.symbol} `}
                                    {poDetails?.freight
                                      ? poDetails?.freight.toFixed(2)
                                      : '0.00'}
                                  </Text>

                                  {/* Total */}
                                  <Text fontSize="10px" fontWeight="bold">
                                    Total
                                  </Text>
                                  <Text fontSize="10px" fontWeight="bold">
                                    :
                                  </Text>
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    textAlign="right"
                                  >
                                    {`${poDetails?.currency?.symbol} `}
                                    {poDetails?.total_price.toFixed(2)}
                                  </Text>
                                </Grid>
                              </Box>
                            </Flex>
                          </Box>
                        )}
                      </Box>
                      <Box p={0} m={0} border="none" bg="transparent">
                        <PDFPreviewFooter
                          style={{ fontSize: '10px' }}
                          createdAt={poDetails?.created_at ?? ''}
                          createdBy={
                            poDetails?.user ? poDetails?.user?.username : ''
                          }
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
export default POPreview;
