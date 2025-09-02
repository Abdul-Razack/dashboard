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

import PDFHeader from '@/components/PreviewContents/Blocks/PDFHeader';
import PDFFooter from '@/components/PreviewContents/Blocks/PDFPreviewFooter';
import PartDetails from '@/components/PreviewContents/POPartDetails';
import PartNumberDetails from '@/components/PreviewContents/PartNumberDetails';
import {
  calculateVolumetricWeight,
  downloadPDF,
  getDisplayLabel,
  getTableItems,
} from '@/helpers/commonHelper';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};

export const PreviewPopup = ({ isOpen, onClose, data }: ModalPopupProps) => {
  const minH = 1122;
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const footerElementRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [pages, setPages] = useState<any>([]);

  useEffect(() => {
    if (isOpen) {
      console.log(data);
      const updateHeight = debounce(() => {
        if (headerElementRef.current) {
          setHeaderHeight(headerElementRef.current.offsetHeight);
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

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!;
    downloadPDF(input, 'logistic-request');
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Function to split table data into pages (A4 size)
  const splitDataIntoPages = (items: any[]) => {
    const pages = [];
    const totalItems = items.length;

    if (totalItems <= 6) {
      pages.push(items);
    } else {
      pages.push(items.slice(0, 6));
      let i = 6;

      while (i + 10 <= totalItems) {
        pages.push(items.slice(i, i + 10));
        i += 10;
      }

      if (i < totalItems) {
        const remainingItems = items.slice(i);
        if (remainingItems.length > 8) {
          pages.push(remainingItems.slice(0, 8));
          pages.push(remainingItems.slice(8));
        } else {
          pages.push(remainingItems);
        }
      }
    }

    setPages(pages);
  };

  useEffect(() => {
    if (isOpen && data.allPoItems && data.allPoItems.length > 0) {
      splitDataIntoPages(data.allPoItems);
    }
  }, [isOpen, data]);

  useEffect(() => {
    if (isOpen) {
      console.log(pages);
    }
  }, [pages]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxW="container.md" width="100%" className="no-print">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="md" fontWeight="bold">
            Preview Logistic Request
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
                          borderRadius="lg"
                          p={4}
                          boxShadow="0 -4px 15px -3px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                        >
                          <Box
                            p={0}
                            m={0}
                            border="none"
                            bg="transparent"
                            ref={headerElementRef}
                          >
                            <PDFHeader style={{ fontSize: '10px' }} />
                          </Box>
                          <Box
                            p={0}
                            m={0}
                            border="none"
                            bg="transparent"
                            minH={`calc(${minH}px - ${Number(headerHeight)}px - ${Number(pageIndex) > 0 ? 80 : pages.length > 1 ? 60 : 70}px)`}
                          >
                            <Flex justify="flex-start" mb={2}>
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                width="100%"
                              >
                                <Text fontSize="lg" fontWeight="bold">
                                  LOGISTICS REQUEST
                                </Text>
                              </Box>
                            </Flex>

                            <Box borderBottom="1px solid black" mb={4} />
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
                                  SHIPPER ADDRESS:
                                </Text>
                                <Text
                                  fontSize="10px"
                                  dangerouslySetInnerHTML={{
                                    __html: data?.shipperContactAddress
                                      ? data?.shipperContactAddress
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
                                  RECEIVER ADDRESS:
                                </Text>
                                <Text
                                  fontSize="10px"
                                  dangerouslySetInnerHTML={{
                                    __html: data?.receiverContactAddress
                                      ? data?.receiverContactAddress
                                      : ' - ',
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
                                    LR Type
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
                                    {data?.type
                                      ? data?.type.toUpperCase()
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
                                    REF No
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
                                    {data.ref_no ? data.ref_no : ''}
                                  </Text>
                                </Flex>

                                <Flex alignItems="baseline" lineHeight="1">
                                  <Text
                                    fontSize="10px"
                                    fontWeight="bold"
                                    minWidth="80px"
                                    textAlign="left"
                                  >
                                    REF Date
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
                                    {data?.refDateValues &&
                                    data.refDateValues.length > 0
                                      ? data.refDateValues.map(
                                          (date: string, index: number) => (
                                            <React.Fragment key={index}>
                                              {format(
                                                new Date(date),
                                                'dd/MM/yyyy'
                                              )}
                                              <br />
                                            </React.Fragment>
                                          )
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
                                    Rel.Ref.No's
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
                                    {data.related_ref_no
                                      ? data.related_ref_no.join(', ')
                                      : ' - '}
                                  </Text>
                                </Flex>

                                {data?.id && (
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      fontWeight="bold"
                                      minWidth="80px"
                                      textAlign="left"
                                    >
                                      LR Type
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
                                      {data?.type
                                        ? data?.type.toUpperCase()
                                        : ' - '}
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
                                    {data?.allPoItems
                                      ? data?.allPoItems.length
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

                            <Box borderBottom="1px solid black" mb={4} />
                            {pageIndex === 0 && (
                              <Box p={0} m={0} border="none" bg="transparent">
                                {data?.rows &&
                                  data?.rows.length > 0 &&
                                  data.rows.map((item: any, index: number) => (
                                    <Box
                                      p={0}
                                      m={0}
                                      border="none"
                                      bg="transparent"
                                      key={index}
                                    >
                                      <Box
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                        width="100%"
                                        border="none"
                                      >
                                        <Text
                                          fontSize="md"
                                          fontWeight="bold"
                                          mb={1}
                                        >
                                          {item.package_no} Items
                                        </Text>
                                      </Box>
                                      <Flex
                                        justify="space-between"
                                        bg="white"
                                        p={4}
                                        borderRadius="md"
                                        boxShadow="sm"
                                        paddingTop={0}
                                      >
                                        {/* First Box */}
                                        <Box flex="1" mr={4}>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="120px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            >
                                              Package Type
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
                                              {item.package_type_id
                                                ? getDisplayLabel(
                                                    data.packageTypeOptions,
                                                    item.package_type_id
                                                      ? item.package_type_id
                                                      : 0,
                                                    'Package Type'
                                                  )
                                                : ' - '}
                                            </Text>
                                          </Flex>

                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="120px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            >
                                              PKG NO
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
                                              {item.package_number
                                                ? item.package_number
                                                : item.package_no
                                                  ? item.package_no
                                                  : ''}
                                            </Text>
                                          </Flex>

                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="120px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            >
                                              Description
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
                                              {item.description
                                                ? item.description
                                                : ''}
                                            </Text>
                                          </Flex>

                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="120px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            >
                                              Goods Type
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
                                              {getDisplayLabel(
                                                data.goodsTypes,
                                                item.is_dg
                                                  ? item.is_dg.toString()
                                                  : 'false',
                                                'Goods Type'
                                              )}
                                            </Text>
                                          </Flex>

                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="120px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            >
                                              PCs
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
                                              {item.pcs ? item.pcs : 0}
                                            </Text>
                                          </Flex>
                                        </Box>

                                        {/* Second Box */}
                                        <Box flex="1">
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="70px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            ></Text>
                                            <Text
                                              mr={2}
                                              fontWeight="bold"
                                              as="span"
                                              textAlign="right"
                                            >
                                              &nbsp;&nbsp;
                                            </Text>
                                            <Text
                                              fontSize="10px"
                                              alignSelf="baseline"
                                            ></Text>
                                          </Flex>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="70px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            ></Text>
                                            <Text
                                              mr={2}
                                              fontWeight="bold"
                                              as="span"
                                              textAlign="right"
                                            ></Text>
                                            <Text
                                              fontSize="10px"
                                              alignSelf="baseline"
                                            ></Text>
                                          </Flex>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="70px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            ></Text>
                                            <Text
                                              mr={2}
                                              fontWeight="bold"
                                              as="span"
                                              textAlign="right"
                                            ></Text>
                                            <Text
                                              fontSize="10px"
                                              alignSelf="baseline"
                                            ></Text>
                                          </Flex>
                                        </Box>

                                        {/* Third Box */}
                                        <Box flex="1">
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="80px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            >
                                              &nbsp;&nbsp;Weight
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
                                              {item.weight ? item.weight : 0}
                                              {getDisplayLabel(
                                                data.uomOptions,
                                                item.weight_unit_of_measurement_id
                                                  ? item.weight_unit_of_measurement_id.toString()
                                                  : 0,
                                                ' Unit'
                                              ) || 'N/A'}
                                            </Text>
                                          </Flex>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="80px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            >
                                              &nbsp;&nbsp;Length
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
                                              {item.length ? item.length : 0}
                                              {getDisplayLabel(
                                                data.uomOptions,
                                                item.unit_of_measurement_id
                                                  ? item.unit_of_measurement_id.toString()
                                                  : 0,
                                                ' Unit'
                                              ) || 'N/A'}
                                            </Text>
                                          </Flex>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="80px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            >
                                              &nbsp;&nbsp;Width
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
                                              {item.width ? item.width : 0}
                                              {getDisplayLabel(
                                                data.uomOptions,
                                                item.unit_of_measurement_id
                                                  ? item.unit_of_measurement_id.toString()
                                                  : 0,
                                                ' Unit'
                                              ) || 'N/A'}
                                            </Text>
                                          </Flex>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="80px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            >
                                              &nbsp;&nbsp;Height
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
                                              {item.height ? item.height : 0}
                                              {getDisplayLabel(
                                                data.uomOptions,
                                                item.unit_of_measurement_id
                                                  ? item.unit_of_measurement_id.toString()
                                                  : 0,
                                                ' Unit'
                                              ) || 'N/A'}
                                            </Text>
                                          </Flex>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight="1"
                                          >
                                            <Text
                                              fontSize="10px"
                                              minWidth="80px"
                                              textAlign="left"
                                              fontWeight="bold"
                                            >
                                              &nbsp;&nbsp;Volumetric Wt
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
                                              {calculateVolumetricWeight(
                                                parseFloat(item.length) || 0,
                                                parseFloat(item.width) || 0,
                                                parseFloat(item.height) || 0,
                                                item.unit_of_measurement_id ||
                                                  0,
                                                data.uomItems
                                              )}
                                              KG
                                            </Text>
                                          </Flex>
                                        </Box>
                                      </Flex>
                                      {data &&
                                        data.organizedItems &&
                                        getTableItems(
                                          data.organizedItems,
                                          item.package_no,
                                          'packageNumber'
                                        ).length > 0 && (
                                          <Table
                                            variant="simple"
                                            size={'sm'}
                                            mb={4}
                                          >
                                            <Thead bg="#d9d9d9">
                                              <Tr>
                                                <Th
                                                  sx={{
                                                    fontSize: '10px',
                                                    paddingTop: 2,
                                                    paddingBottom: 1,
                                                  }}
                                                >
                                                  S.No
                                                </Th>
                                                <Th
                                                  sx={{
                                                    fontSize: '10px',
                                                    paddingTop: 2,
                                                    paddingBottom: 1,
                                                  }}
                                                >
                                                  Part Num
                                                </Th>
                                                <Th
                                                  sx={{
                                                    fontSize: '10px',
                                                    paddingTop: 2,
                                                    paddingBottom: 1,
                                                  }}
                                                >
                                                  Condition
                                                </Th>
                                                <Th
                                                  sx={{
                                                    fontSize: '10px',
                                                    paddingTop: 2,
                                                    paddingBottom: 1,
                                                  }}
                                                >
                                                  QTY
                                                </Th>
                                                <Th
                                                  sx={{
                                                    fontSize: '10px',
                                                    paddingTop: 1,
                                                    paddingBottom: 2,
                                                  }}
                                                >
                                                  Good.Tp
                                                </Th>
                                                <Th
                                                  sx={{
                                                    fontSize: '10px',
                                                    paddingTop: 2,
                                                    paddingBottom: 1,
                                                  }}
                                                >
                                                  UN#
                                                </Th>
                                                <Th
                                                  sx={{
                                                    fontSize: '10px',
                                                    paddingTop: 2,
                                                    paddingBottom: 1,
                                                  }}
                                                >
                                                  Class
                                                </Th>

                                                <Th
                                                  sx={{
                                                    fontSize: '10px',
                                                    paddingTop: 2,
                                                    paddingBottom: 1,
                                                  }}
                                                >
                                                  LR.Qty
                                                </Th>
                                              </Tr>
                                            </Thead>
                                            <Tbody mt={2}>
                                              {data &&
                                                data.organizedItems &&
                                                getTableItems(
                                                  data.organizedItems,
                                                  item.package_no,
                                                  'packageNumber'
                                                ).map(
                                                  (
                                                    item: any,
                                                    index: number
                                                  ) => (
                                                    <Tr key={index}>
                                                      <Td
                                                        sx={{
                                                          fontSize: '10px',
                                                          paddingTop: 2,
                                                          paddingBottom: 0,
                                                        }}
                                                      >
                                                        {index + 1}
                                                      </Td>
                                                      <Td
                                                        sx={{
                                                          fontSize: '10px',
                                                          paddingTop: 2,
                                                          paddingBottom: 0,
                                                        }}
                                                      >
                                                        <PartDetails
                                                          partNumber={
                                                            item.part_number_id
                                                          }
                                                          note={
                                                            item?.note ?? ''
                                                          }
                                                        />
                                                      </Td>
                                                      <Td
                                                        sx={{
                                                          fontSize: '10px',
                                                          paddingTop: 2,
                                                          paddingBottom: 0,
                                                        }}
                                                      >
                                                        {getDisplayLabel(
                                                          data.conditionOptions,
                                                          item.condition_id.toString() ??
                                                            0,
                                                          'Condition'
                                                        ) || 'N/A'}
                                                      </Td>
                                                      <Td
                                                        sx={{
                                                          fontSize: '10px',
                                                          paddingTop: 2,
                                                          paddingBottom: 0,
                                                        }}
                                                      >
                                                        {item.qty}
                                                      </Td>
                                                      <Td
                                                        sx={{
                                                          fontSize: '10px',
                                                          paddingTop: 2,
                                                          paddingBottom: 0,
                                                        }}
                                                      >
                                                        <PartNumberDetails
                                                          part_number={
                                                            item.part_number_id
                                                          }
                                                          type="goods_type"
                                                        />
                                                      </Td>
                                                      <Td
                                                        sx={{
                                                          fontSize: '10px',
                                                          paddingTop: 2,
                                                          paddingBottom: 0,
                                                        }}
                                                      >
                                                        <PartNumberDetails
                                                          part_number={
                                                            item.part_number_id
                                                          }
                                                          type="un_number"
                                                        />
                                                      </Td>
                                                      <Td
                                                        sx={{
                                                          fontSize: '10px',
                                                          paddingTop: 2,
                                                          paddingBottom: 0,
                                                        }}
                                                      >
                                                        <PartNumberDetails
                                                          part_number={
                                                            item.part_number_id
                                                          }
                                                          type="class"
                                                        />
                                                      </Td>

                                                      <Td
                                                        sx={{
                                                          fontSize: '10px',
                                                          paddingTop: 2,
                                                          paddingBottom: 0,
                                                        }}
                                                      >
                                                        {item.lrQuantity}
                                                      </Td>
                                                    </Tr>
                                                  )
                                                )}
                                            </Tbody>
                                          </Table>
                                        )}
                                      <Box
                                        borderBottom="1px solid black"
                                        mb={4}
                                      />
                                    </Box>
                                  ))}
                              </Box>
                            )}
                            {data &&
                              data.allPoItems &&
                              data.allPoItems.length > 0 && (
                                <Box
                                  p={0}
                                  m={0}
                                  border="none"
                                  bg="transparent"
                                  textAlign={'center'}
                                  mb={4}
                                >
                                  <Text fontSize="md" fontWeight="700" mb={4}>
                                    PO Items
                                  </Text>
                                  <Table variant="simple" size="sm">
                                    <Thead bg="#d9d9d9">
                                      <Tr>
                                        <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          S.No
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
                                          Cond.
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          Good.Tp
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          PO.Id
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          Tot.Qty
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          Rec.Qty
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          Add.Qty
                                        </Th>
                                        {/* <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          LR.Qty
                                        </Th> */}
                                      </Tr>
                                    </Thead>
                                    <Tbody className="previewTableBody">
                                      {pageData.map(
                                        (item: any, index: number) => (
                                          <Tr key={index}>
                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 1,
                                                paddingBottom: 2,
                                              }}
                                            >
                                              {index + 1}
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
                                                note={item?.note ?? ''}
                                              />
                                              {item?.part_number?.spare
                                                ?.hsc_code && (
                                                <Text whiteSpace="pre-line">
                                                  <Text
                                                    as="span"
                                                    fontWeight={'bold'}
                                                  >
                                                    HSC Code:{' '}
                                                  </Text>
                                                  {
                                                    item?.part_number?.spare
                                                      ?.hsc_code?.name
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
                                              {getDisplayLabel(
                                                data.conditionOptions,
                                                item.condition_id.toString() ??
                                                  0,
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
                                              <PartNumberDetails
                                                part_number={
                                                  item.part_number_id
                                                }
                                                type="goods_type"
                                              />
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 1,
                                                paddingBottom: 2,
                                              }}
                                            >
                                              {item.purchase_order_id}
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
                                              {/* {item.qty} */} 0
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 1,
                                                paddingBottom: 2,
                                              }}
                                            >
                                              <Td
                                                sx={{
                                                  fontSize: '10px',
                                                  paddingTop: 1,
                                                  paddingBottom: 2,
                                                }}
                                              >
                                                {data?.addedQuantities[
                                                  item.id
                                                ] || 0}
                                              </Td>
                                            </Td>
                                            {/* <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 1,
                                                paddingBottom: 2,
                                              }}
                                            >
                                              {item.lrQuantity || 0}
                                            </Td> */}
                                          </Tr>
                                        )
                                      )}
                                    </Tbody>
                                  </Table>
                                </Box>
                              )}

                            {data &&
                              data.organizedItems &&
                              getTableItems(
                                data.organizedItems,
                                'not_obtained',
                                'packageNumber'
                              ).length > 0 && (
                                <Box
                                  p={0}
                                  m={0}
                                  border="none"
                                  bg="transparent"
                                  mt={2}
                                  mb={4}
                                >
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    width="100%"
                                  >
                                    <Text
                                      fontSize="md"
                                      fontWeight="bold"
                                      mb={1}
                                    >
                                      Not Obtained Items
                                    </Text>
                                  </Box>
                                  <Table variant="simple" size={'sm'}>
                                    <Thead>
                                        <Tr>
                                          <Th
                                            sx={{
                                              fontSize: '10px',
                                              paddingTop: 2,
                                              paddingBottom: 1,
                                            }}
                                          >
                                            S.No
                                          </Th>
                                          <Th
                                            sx={{
                                              fontSize: '10px',
                                              paddingTop: 2,
                                              paddingBottom: 1,
                                            }}
                                          >
                                            Part Num
                                          </Th>
                                          <Th
                                            sx={{
                                              fontSize: '10px',
                                              paddingTop: 2,
                                              paddingBottom: 1,
                                            }}
                                          >
                                            Condition
                                          </Th>
                                          <Th
                                            sx={{
                                              fontSize: '10px',
                                              paddingTop: 2,
                                              paddingBottom: 1,
                                            }}
                                          >
                                            QTY
                                          </Th>
                                          <Th
                                            sx={{
                                              fontSize: '10px',
                                              paddingTop: 2,
                                              paddingBottom: 1,
                                            }}
                                          >
                                            Good.Tp
                                          </Th>
                                          {/* <Th
                                  sx={{
                                    fontSize: '10px',
                                    paddingTop: 1,
                                    paddingBottom: 0,
                                  }}
                                >
                                  PO Num
                                </Th> */}
                                          <Th
                                            sx={{
                                              fontSize: '10px',
                                              paddingTop: 2,
                                              paddingBottom: 1,
                                            }}
                                          >
                                            UN#
                                          </Th>
                                          <Th
                                            sx={{
                                              fontSize: '10px',
                                              paddingTop: 2,
                                              paddingBottom: 1,
                                            }}
                                          >
                                            Class
                                          </Th>
                                          <Th
                                            sx={{
                                              fontSize: '10px',
                                              paddingTop: 2,
                                              paddingBottom: 1,
                                            }}
                                          >
                                            LR Qty
                                          </Th>
                                        </Tr>
                                    </Thead>
                                    <Tbody mt={2}>
                                      {data &&
                                        data.organizedItems &&
                                        getTableItems(
                                          data.organizedItems,
                                          'not_obtained',
                                          'packageNumber'
                                        ).map((item: any, index: number) => (
                                          <Tr key={index}>
                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              {index + 1}
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              <PartDetails
                                                partNumber={item.part_number_id}
                                                note={item?.note ?? ''}
                                              />
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              {getDisplayLabel(
                                                data.conditionOptions,
                                                item.condition_id.toString() ??
                                                  0,
                                                'Condition'
                                              ) || 'N/A'}
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              {item.qty}
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              <PartNumberDetails
                                                part_number={
                                                  item.part_number_id
                                                }
                                                type="goods_type"
                                              />
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              <PartNumberDetails
                                                part_number={
                                                  item.part_number_id
                                                }
                                                type="un_number"
                                              />
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              <PartNumberDetails
                                                part_number={
                                                  item.part_number_id
                                                }
                                                type="class"
                                              />
                                            </Td>

                                            <Td
                                              sx={{
                                                fontSize: '10px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              {item.lrQuantity}
                                            </Td>
                                          </Tr>
                                        ))}
                                    </Tbody>
                                  </Table>
                                </Box>
                              )}
                            {data?.remarks && (
                              <Flex
                                justify="flex-start"
                                mb={6}
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
                          <Box
                            p={0}
                            m={0}
                            border="none"
                            bg="transparent"
                            ref={footerElementRef}
                          >
                            <PDFFooter style={{ fontSize: '10px' }} />
                          </Box>
                        </Box>
                      </Container>
                    ))}
                  </Stack>
                </Box>
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
              </Box>
            </Box>
          </React.Fragment>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PreviewPopup;
