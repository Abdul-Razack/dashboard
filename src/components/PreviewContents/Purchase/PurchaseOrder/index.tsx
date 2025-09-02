import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Grid,
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
import { FaFilePdf } from 'react-icons/fa';
import { HiPrinter } from 'react-icons/hi';

import CurrencyDisplay from '@/components/CurrencyDisplay';
import { CurrencyToWords } from '@/components/CurrencyToWords';
import PDFHeader from '@/components/PreviewContents/Blocks/PDFHeader';
import { PDFPreviewFooter } from '@/components/PreviewContents/Blocks/PDFPreviewFooter';
import {
  downloadPDF,
  extractAfterHyphen,
  getDisplayLabel,
  triggerPrint,
} from '@/helpers/commonHelper';

import PartDetails from '@/components/PreviewContents/POPartDetails';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};
export const PreviewPopup = ({ isOpen, onClose, data }: ModalPopupProps) => {
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [printLoading, setPrintLoading] = useState<boolean>(false);
  const [pages, setPages] = useState<any>([]);
  const minH = 980;
  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!; // Get the print content
    downloadPDF(input, 'purchase-order');
    setTimeout(() => {
      setLoading(false);
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

  useEffect(() => {
    if (isOpen && data.items && data.items.length > 0) {
      splitDataIntoPages(data.items);
    }
  }, [isOpen, data]);

  const splitDataIntoPages = (items: any[]) => {
    const pages = [];
    const totalItems = items.length;

    if (totalItems <= 4) {
      pages.push(items);
    } else {
      pages.push(items.slice(0, 4));
      let i = 4;

      while (i + 10 <= totalItems) {
        pages.push(items.slice(i, i + 10));
        i += 10;
      }

      if (i < totalItems) {
        const remainingItems = items.slice(i);
        if (remainingItems.length > 4) {
          pages.push(remainingItems.slice(0, 4));
          pages.push(remainingItems.slice(4));
        } else {
          pages.push(remainingItems);
        }
      }
    }

    setPages(pages);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false} closeOnEsc={false}> 
    {/* scrollBehavior="inside" */}
      <ModalOverlay />
      <ModalContent maxW="container.md" width="100%" className="no-print">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Preview Purchase Order
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <React.Fragment>
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
                        (headerHeight + pageIndex === 0 ? 290 : 350) +
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
                                PURCHASE&nbsp;&nbsp;ORDER{data?.id ? `- ${data?.id}` : ''}
                                {data?.version && data?.version > 0
                                  ? 'R' + data?.version
                                  : ''}
                              </Text>
                            </Box>
                          </Flex>
                          <Divider borderColor="black" borderWidth={1} mt={1} />
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
                                  __html: data?.contactAddress
                                    ? data?.contactAddress
                                    : ' - ',
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
                                  __html: data?.vendorAddress
                                    ? data?.vendorAddress
                                    : ' - ',
                                }}
                              ></Text>
                            </Box>

                            {/* Third Box */}
                            <Box flex="1">
                              {data?.id && (
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
                                    {data?.id}
                                    {data?.version && data?.version > 0
                                      ? 'R' + data?.version
                                      : ''}
                                  </Text>
                                </Flex>
                              )}
                              {data?.created_at && (
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
                                    {data?.created_at
                                      ? format(
                                          new Date(data?.created_at),
                                          ' dd-MM-yyyy hh:mm'
                                        )
                                      : ''}
                                  </Text>
                                </Flex>
                              )}
                              {data?.modified_at && (
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
                                    {data?.modified_at
                                      ? format(
                                          new Date(data?.modified_at),
                                          ' dd-MM-yyyy hh:mm'
                                        )
                                      : ''}
                                  </Text>
                                </Flex>
                              )}
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
                                  {data?.items ? data?.items.length : ''}
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
                                    {data?.user
                                      ? data?.user?.first_name +
                                        ' ' +
                                        data?.user?.last_name
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
                                  {getDisplayLabel(
                                    data.priorityOptions,
                                    data.priority_id
                                      ? data.priority_id.toString()
                                      : 0,
                                    'Priority'
                                  ) || 'N/A'}
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
                                  {data.vendor_code
                                    ? data.vendor_code.toString()
                                    : 'N/A'}
                                </Text>
                              </Flex>
                              {data?.quotations &&
                                data?.quotations.length > 0 && (
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
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {data?.quotations.map(
                                        (quotation: any) =>
                                          quotation.vendor_quotation_no
                                      )}
                                    </Text>
                                  </Flex>
                                )}

                              {data?.vendorQuoteNos &&
                                data?.vendorQuoteNos.length > 0 && (
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
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {data?.vendorQuoteNos &&
                                      data?.vendorQuoteNos.length > 0
                                        ? data?.vendorQuoteNos.join(', ')
                                        : ' - '}
                                    </Text>
                                  </Flex>
                                )}
                              {data?.quotations &&
                                data?.quotations.length > 0 && (
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
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {data?.quotations.map((quotation: any) =>
                                        format(
                                          new Date(
                                            quotation.vendor_quotation_date
                                          ),
                                          'dd-MM-yyyy'
                                        )
                                      )}
                                      {/* {vendorQuoteDates.length > 0
                                          ? vendorQuoteDates.join(', ')
                                          : 'NA'} */}
                                    </Text>
                                  </Flex>
                                )}

{data?.vendorQuoteDates &&
                                data?.vendorQuoteDates.length > 0 && (
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
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {data?.vendorQuoteDates &&
                                      data?.vendorQuoteDates.length > 0
                                        ? data?.vendorQuoteDates.join(', ')
                                        : ' - '}
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
                                  {data?.vendor_email ?? ' - '}
                                </Text>
                              </Flex>
                            </Box>

                            {/* Second Box */}
                            <Box flex="1">
                              {data?.rfq_ids && data?.rfq_ids.length > 0 && (
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
                                  <Text fontSize="10px" alignSelf="baseline">
                                    {data?.rfq_ids && data?.rfq_ids.length > 0
                                      ? data?.rfq_ids.join(', ')
                                      : ' - '}
                                  </Text>
                                </Flex>
                              )}
                              {data?.prfq_nos && data?.prfq_nos.length > 0 && (
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
                                  <Text fontSize="10px" alignSelf="baseline">
                                    {data?.prfq_nos && data?.prfq_nos.length > 0
                                      ? data?.prfq_nos.join(', ')
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
                                  {getDisplayLabel(
                                    data.paymentModeOptions,
                                    data.payment_mode_id
                                      ? data.payment_mode_id.toString()
                                      : 0,
                                    'Payment Mode'
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
                                  {getDisplayLabel(
                                    data.paymentTermOptions,
                                    data.payment_term_id
                                      ? data.payment_term_id.toString()
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
                                  {getDisplayLabel(
                                    data.fobOptions,
                                    data.fob_id ? data.fob_id.toString() : 0,
                                    'FOB'
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
                                  {extractAfterHyphen(
                                    getDisplayLabel(
                                      data.shipAccountOptions,
                                      data.ship_account_id
                                        ? data.ship_account_id.toString()
                                        : 0,
                                      'Ship Account'
                                    )
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
                                  {getDisplayLabel(
                                    data.shipModeOptions,
                                    data.ship_mode_id
                                      ? data.ship_mode_id.toString()
                                      : 0,
                                    'Ship Mode'
                                  ) || 'N/A'}
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
                              PURCHASE&nbsp;&nbsp;ORDER - {data?.id}
                              {data?.version && data?.version > 0
                                ? 'R' + data?.version
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
                          <Tbody>
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
                                  <PartDetails
                                    partNumber={item.part_number_id} note={item?.note ?? ''}
                                  />
                                  {item?.part_number?.spare?.hsc_code && (
                                    <Text whiteSpace="pre-line">
                                      <Text as="span" fontWeight={'bold'}>
                                        HSC Code:{' '}
                                      </Text>
                                      {item?.part_number?.spare?.hsc_code?.name}
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
                                  {getDisplayLabel(
                                    data.conditionOptions,
                                    item.condition_id.toString() ?? 0,
                                    'Condition'
                                  ) || 'N/A'}
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
                                  {getDisplayLabel(
                                  data.uomOptions,
                                  item.unit_of_measure_id.toString() ?? 0,
                                  'UOM'
                                ) || 'N/A'}
                                </Td>
                                <Td
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                    textAlign: 'right',
                                  }}
                                >
                                  <CurrencyDisplay
                                    currencyId={
                                      data.currency_id
                                        ? data.currency_id.toString()
                                        : ''
                                    }
                                  />{' '}
                                  {item.price
                                    ? Number(item.price).toFixed(2)
                                    : ''}
                                </Td>
                                <Td
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 2,
                                    textAlign: 'right',
                                  }}
                                >
                                  <CurrencyDisplay
                                    currencyId={
                                      data.currency_id
                                        ? data.currency_id.toString()
                                        : ''
                                    }
                                  />{' '}
                                  {item.qty *
                                    (item.price ? Number(item.price) : 0)}
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
                                amount={
                                  data?.total_price
                                    ? data?.total_price
                                    : data?.totalPayableAmount
                                      ? data?.totalPayableAmount
                                      : 0
                                }
                                currency={data?.currency?.code}
                              />

                              <Box
                                mt={2}
                                display={data?.remark ? 'block' : 'none'}
                              >
                                <Text fontSize="10px" fontWeight="bold">
                                  Remarks:
                                </Text>
                                <Text
                                  fontSize="10px"
                                  dangerouslySetInnerHTML={{
                                    __html: data?.remark ? data?.remark : ' - ',
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
                                  <CurrencyDisplay
                                    currencyId={
                                      data.currency_id
                                        ? data.currency_id.toString()
                                        : ''
                                    }
                                  />
                                  {' '}{data?.subtotal
                                    ? data?.subtotal.toFixed(2)
                                    : data?.subTotal
                                      ? data?.subTotal.toFixed(2)
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
                                  <CurrencyDisplay
                                    currencyId={
                                      data.currency_id
                                        ? data.currency_id.toString()
                                        : ''
                                    }
                                  />
                                  {' '}{data?.discount
                                    ? data?.discount.toFixed(2)
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
                                  <CurrencyDisplay
                                    currencyId={
                                      data.currency_id
                                        ? data.currency_id.toString()
                                        : ''
                                    }
                                  />
                                  {' '}{data?.vat ? Number(data?.vat).toFixed(2) : '0.00'}
                                </Text>

                                {/* Bank Charge */}
                                <Text fontSize="10px">Bank Charge</Text>
                                <Text fontSize="10px">:</Text>
                                <Text
                                  fontSize="10px"
                                  fontWeight="bold"
                                  textAlign="right"
                                >
                                  <CurrencyDisplay
                                    currencyId={
                                      data.currency_id
                                        ? data.currency_id.toString()
                                        : ''
                                    }
                                  />
                                  {' '}{data?.bank_charge
                                    ? Number(data?.bank_charge).toFixed(2)
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
                                  <CurrencyDisplay
                                    currencyId={
                                      data.currency_id
                                        ? data.currency_id.toString()
                                        : ''
                                    }
                                  />
                                  {' '}{data?.miscellaneous_charges
                                    ? Number(data?.miscellaneous_charges).toFixed(2)
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
                                  <CurrencyDisplay
                                    currencyId={
                                      data.currency_id
                                        ? data.currency_id.toString()
                                        : ''
                                    }
                                  />
                                  {' '}{data?.freight
                                    ? Number(data?.freight).toFixed(2)
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
                                  <CurrencyDisplay
                                    currencyId={
                                      data.currency_id
                                        ? data.currency_id.toString()
                                        : ''
                                    }
                                  />
                                  {data?.total_price
                                    ? data?.total_price.toFixed(2)
                                    : (data?.totalPayableAmount
                                        ? data?.totalPayableAmount
                                        : 0
                                      ).toFixed(2)}
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
                        createdAt={data?.created_at ?? ''}
                        createdBy={data?.user ? data?.user?.username : ''}
                        totalPages={pages.length}
                        currentPage={pageIndex + 1}
                      />
                    </Box>
                  </Box>
                </Container>
              ))}
            </Box>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify={'center'}
              alignItems={'center'}
              display={'flex'}
            >
              <Button
                size={'sm'}
                onClick={exportToPDF}
                colorScheme="green"
                leftIcon={<Icon as={FaFilePdf} />}
                isLoading={loading}
                isDisabled={printLoading || loading}
              >
                Export PDF
              </Button>

              <Button
                size={'sm'}
                colorScheme="blue"
                isDisabled={printLoading || loading}
                leftIcon={<HiPrinter />}
                onClick={handlePrint}
                isLoading={printLoading}
              >
                Print
              </Button>

              <Button
                colorScheme="red"
                size={'sm'}
                onClick={onClose}
                isDisabled={printLoading || loading}
              >
                Close
              </Button>
            </Stack>
          </React.Fragment>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PreviewPopup;
