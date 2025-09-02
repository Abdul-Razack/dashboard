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
import { FaFilePdf } from 'react-icons/fa';
import { HiPrinter } from 'react-icons/hi';

import PDFHeader from '@/components/PreviewContents/Blocks/PDFHeader';
import { PDFPreviewFooter } from '@/components/PreviewContents/Blocks/PDFPreviewFooter';
import {
  downloadPDF,
  formatFullAddress,
  getDisplayLabel,
  triggerPrint,
} from '@/helpers/commonHelper';

import PartDetails from '../../POPartDetails';

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

  // Function to split table data into pages (A4 size)
  const splitDataIntoPages = (items: any[], itemsPerPage: number) => {
    const pages = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      pages.push(items.slice(i, i + itemsPerPage));
    }
    return pages;
  };

  const itemsPerPage = 10; // Adjust this based on the row height
  const pages = data?.items ? splitDataIntoPages(data.items, itemsPerPage) : [];

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!; // Get the print content
    downloadPDF(input, 'prfq');
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  const handlePrint = (): void => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!;
    setTimeout(() => {
      triggerPrint(input);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      blockScrollOnMount={false}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent maxWidth="50vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Preview PRFQ
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <React.Fragment>
            <Box width="100%">
              <Box maxW="container.md" width="100%">
                <Box borderRadius={4} id="table-to-export">
                  <Stack spacing={2} bg={'white'} borderRadius={'md'}>
                    {pages.map((pageData, pageIndex) => (
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
                            minH={`calc(${minH}px - ${Number(headerHeight)}px - ${Number(pageIndex) > 0 ? 120 : pages.length > 1 ? 120 : 100}px)`}
                          >
                            {pageIndex === 0 && (
                              <React.Fragment>
                                <Flex justify="space-between">
                                  <Box
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                    width="100%"
                                    p={2}
                                  >
                                    <Text
                                      fontSize="lg"
                                      fontWeight="bold"
                                      textTransform="capitalize"
                                    >
                                      Purchase&nbsp;&nbsp;RFQ
                                    </Text>
                                  </Box>
                                </Flex>

                                <Box borderBottom="1px solid black" mb={4} />

                                {data &&
                                  data.forVendor === true &&
                                  pageIndex === 0 && (
                                    <Box
                                      p={0}
                                      m={0}
                                      border="none"
                                      bg="transparent"
                                      mb={4}
                                    >
                                      <Flex
                                        justify="space-between"
                                        bg="white"
                                        p={4}
                                        borderRadius="md"
                                        boxShadow="sm"
                                        mb={4}
                                      >
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
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight={1}
                                          >
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
                                              textTransform="capitalize"
                                            >
                                              {data?.rows &&
                                              data?.rows.length > 0
                                                ? data?.rows[data.rowId]
                                                    ?.selectedContact?.customer
                                                    ?.business_name
                                                : ''}
                                            </Text>
                                          </Flex>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight={1}
                                          >
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
                                            <Text
                                              fontSize="10px"
                                              alignSelf="baseline"
                                              textTransform="capitalize"
                                            >
                                              {data?.rows &&
                                              data?.rows.length > 0
                                                ? data?.rows[data.rowId]
                                                    ?.selectedContact?.customer
                                                    ?.code
                                                : ''}
                                            </Text>
                                          </Flex>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight={1}
                                          >
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
                                              textTransform="capitalize"
                                            >
                                              {data?.rows &&
                                              data?.rows.length > 0
                                                ? data?.rows[data.rowId]
                                                    ?.selectedContact?.attention
                                                : ' - '}
                                            </Text>
                                          </Flex>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight={1}
                                          >
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
                                            <Text
                                              fontSize="10px"
                                              alignSelf="baseline"
                                            >
                                              {data?.rows &&
                                              data?.rows.length > 0
                                                ? data?.rows[data.rowId]
                                                    ?.selectedContact?.phone
                                                  ? data?.rows[data.rowId]
                                                      ?.selectedContact?.phone
                                                  : ' - '
                                                : ' - '}
                                            </Text>
                                          </Flex>
                                          <Flex
                                            alignItems="baseline"
                                            lineHeight={1}
                                          >
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
                                            <Text
                                              fontSize="10px"
                                              alignSelf="baseline"
                                            >
                                              {data?.rows &&
                                              data?.rows.length > 0
                                                ? data?.rows[data.rowId]
                                                    ?.selectedContact?.email
                                                  ? data?.rows[data.rowId]
                                                      ?.selectedContact?.email
                                                  : ' - '
                                                : ' - '}
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
                                              sx={{ fontSize: '10px' }}
                                              dangerouslySetInnerHTML={{
                                                __html:
                                                  data?.rows &&
                                                  data?.rows.length > 0
                                                    ? data?.rows[data.rowId]
                                                        ?.selectedContact
                                                      ? formatFullAddress(
                                                          data?.rows[data.rowId]
                                                            ?.selectedContact
                                                        )
                                                      : ' - '
                                                    : 'N/A',
                                              }}
                                            ></Text>
                                          </Flex>
                                        </Box>
                                      </Flex>
                                    </Box>
                                  )}
                                <React.Fragment>
                                  <Flex
                                    justify="space-between"
                                    bg="white"
                                    p={4}
                                    borderRadius="md"
                                    boxShadow="none"
                                    mb={4}
                                    paddingTop={0}
                                  >
                                    {/* First Box - PRFQ ID */}
                                    {data?.prfq_id && (
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
                                          <Text
                                            fontSize="10px"
                                            alignSelf="baseline"
                                          >
                                            {data?.prfq_id}
                                          </Text>
                                        </Flex>
                                      </Box>
                                    )}
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
                                        <Text
                                          fontSize="10px"
                                          alignSelf="baseline"
                                        >
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
                                        <Text
                                          fontSize="10px"
                                          alignSelf="baseline"
                                        >
                                          {data.need_by_date
                                            ? format(
                                                new Date(data.need_by_date),
                                                'dd-MM-yyyy'
                                              )
                                            : ' - '}
                                        </Text>
                                      </Flex>
                                    </Box>
                                  </Flex>
                                  <Box borderBottom="1px solid black" mb={4} />
                                </React.Fragment>
                              </React.Fragment>
                            )}

                            <Box
                              p={0}
                              m={0}
                              border="none"
                              bg="transparent"
                              mb={4}
                            >
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
                                      Cond.
                                    </Th>
                                    <Th
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
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
                                      UOM
                                    </Th>
                                    <Th
                                      sx={{
                                        fontSize: '10px',
                                        paddingTop: 1,
                                        paddingBottom: 2,
                                      }}
                                    >
                                      Rem.
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
                                      >
                                        {pageIndex * itemsPerPage + index + 1}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '10px',
                                          paddingTop: 1,
                                          paddingBottom: 2,
                                        }}
                                      >
                                        {item.purchase_request_ids
                                          ? item.purchase_request_ids.join(',')
                                          : ''}

                                        {item.purchase_request_id
                                          ? item.purchase_request_id
                                          : ''}
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
                                            0,
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
                                        {item.remark ? item.remark : ' - '}
                                      </Td>
                                    </Tr>
                                  ))}
                                </Tbody>
                              </Table>
                            </Box>

                            {data &&
                              data.forVendor === false &&
                              pageIndex + 1 === pages.length && (
                                <Box
                                  p={0}
                                  m={0}
                                  border="none"
                                  bg="transparent"
                                  mb={4}
                                >
                                  <Box borderBottom="1px solid black" mb={4} />
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
                                          S.No
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          Ven.Name
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          Ven.Code
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          Contact & Email
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '10px',
                                            paddingTop: 1,
                                            paddingBottom: 2,
                                          }}
                                        >
                                          Address
                                        </Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody className="previewTableBody">
                                      {data &&
                                        data?.rows &&
                                        data?.rows.map(
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
                                                {
                                                  item?.selectedContact
                                                    ?.customer?.business_name
                                                }
                                              </Td>
                                              <Td
                                                sx={{
                                                  fontSize: '10px',
                                                  paddingTop: 1,
                                                  paddingBottom: 2,
                                                }}
                                              >
                                                {`${
                                                  item?.selectedContact
                                                    ?.customer?.code
                                                }`}
                                              </Td>
                                              <Td
                                                sx={{
                                                  fontSize: '10px',
                                                  paddingTop: 1,
                                                  paddingBottom: 2,
                                                }}
                                              >
                                                <Text>
                                                  {
                                                    item?.selectedContact
                                                      ?.attention
                                                  }
                                                </Text>
                                                {item?.selectedContact?.customer
                                                  ?.email && (
                                                  <Text color={'blue.500'}>
                                                    {
                                                      item?.selectedContact
                                                        ?.customer?.email
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
                                                dangerouslySetInnerHTML={{
                                                  __html: item?.selectedContact
                                                    ? formatFullAddress(
                                                        item.selectedContact
                                                      )
                                                    : ' - ',
                                                }}
                                              ></Td>
                                            </Tr>
                                          )
                                        )}
                                    </Tbody>
                                  </Table>

                                  {data?.remarks && (
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
                                            __html: data?.remarks
                                              ? data?.remarks
                                              : ' - ',
                                          }}
                                        ></Text>
                                      </Box>
                                    </Flex>
                                  )}
                                </Box>
                              )}
                          </Box>
                          <Box mt={4}>
                            <PDFPreviewFooter
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
              </Box>
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
                leftIcon={<Icon as={FaFilePdf} />}
                isLoading={loading}
              >
                Export PDF
              </Button>

              <Button
                colorScheme="blue"
                size={'sm'}
                isDisabled={loading}
                leftIcon={<Icon as={HiPrinter} />}
                onClick={handlePrint}
              >
                Print
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
          </React.Fragment>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PreviewPopup;
