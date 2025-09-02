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

import PartDetails from '@/components/PreviewContents/PartDetails';

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

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!;
    downloadPDF(input, 'material-request');
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
  const splitDataIntoPages = (items: any[], itemsPerPage: number) => {
    const pages = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      pages.push(items.slice(i, i + itemsPerPage));
    }
    return pages;
  };

  const itemsPerPage = 20; // Adjust this based on the row height
  const pages = data?.items ? splitDataIntoPages(data.items, itemsPerPage) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="50vw">
        <ModalHeader textAlign="center">
          <Text fontSize="lg" fontWeight="bold">
            Preview Material Request
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <React.Fragment>
            <Box width="100%">
              <Box maxW="container.md" width="100%">
                <Box borderRadius={4} id="table-to-export">
                  <Stack spacing={2} bg="white" borderRadius="md">
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
                                  MATERIAL REQUEST{' '}
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
                                  boxShadow="none"
                                  mb={4}
                                  paddingTop={0}
                                >
                                  {/* First Box */}
                                  <Box flex="1" mr={4}>
                                    <Flex alignItems="baseline" lineHeight="1">
                                      <Text
                                        fontSize="10px"
                                        minWidth="80px"
                                        textAlign="left"
                                        fontWeight="bold"
                                      >
                                        MR Type
                                      </Text>
                                      <Text
                                        mr={2}
                                        fontWeight="bold"
                                        as="span"
                                        textAlign="right"
                                      >
                                        :&nbsp;&nbsp;
                                      </Text>
                                      {data?.id && data.type && (
                                        <Text
                                          fontSize="10px"
                                          alignSelf="baseline"
                                        >
                                          {data?.id && data.type
                                            ? data.type.toUpperCase()
                                            : 'N/A'}
                                        </Text>
                                      )}

                                      {data.pr_type_id && (
                                        <Text
                                          fontSize="10px"
                                          alignSelf="baseline"
                                        >
                                          {data.pr_type_id
                                            ? data.pr_type_id.toUpperCase()
                                            : 'N/A'}
                                        </Text>
                                      )}
                                    </Flex>
                                    {data?.ref && (
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
                                          Ref.No
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
                                          {data?.ref ?? ' - '}
                                        </Text>
                                      </Flex>
                                    )}
                                    {data?.selDetails && (
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
                                          Ref.No
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
                                          {data?.selDetails?.code ?? ' - '}
                                        </Text>
                                      </Flex>
                                    )}
                                    {data?.priorityOptions && (
                                      <Flex alignItems="baseline" lineHeight="1">
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
                                    )}
                                    {data?.priority && (
                                      <Flex alignItems="baseline" lineHeight="1">
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
                                          {data.priority ? data.priority.name : 'N/A'}
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
                                        Due Date
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
                                        {data.due_date
                                          ? format(
                                              new Date(data.due_date),
                                              'dd-MM-yyyy'
                                            )
                                          : ' - '}
                                      </Text>
                                    </Flex>
                                  </Box>

                                  <Box>
                                    {data?.customerDetails && (
                                      <Flex
                                        alignItems="baseline"
                                        lineHeight="1"
                                      >
                                        <Text
                                          fontSize="10px"
                                          minWidth="100px"
                                          textAlign="left"
                                          fontWeight="bold"
                                        >
                                          &nbsp;&nbsp;Customer Name
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
                                          {data?.customerDetails
                                            ? data?.customerDetails
                                                ?.business_name
                                            : ''}
                                        </Text>
                                      </Flex>
                                    )}

                                    {data?.customerDetails && (
                                      <Flex
                                        alignItems="baseline"
                                        lineHeight="1"
                                      >
                                        <Text
                                          fontSize="10px"
                                          minWidth="100px"
                                          textAlign="left"
                                          fontWeight="bold"
                                        >
                                          &nbsp;&nbsp;Customer Code
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
                                          {data?.customerDetails
                                            ? data?.customerDetails?.code
                                            : ''}
                                        </Text>
                                      </Flex>
                                    )}
                                    {data?.created_at && (
                                      <Flex
                                        alignItems="baseline"
                                        lineHeight="1"
                                      >
                                        <Text
                                          fontSize="10px"
                                          minWidth="100px"
                                          textAlign="left"
                                          fontWeight="bold"
                                        >
                                          &nbsp;&nbsp;Request Date
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
                                          {data?.created_at
                                            ? format(
                                                new Date(data?.created_at),
                                                ' dd-MM-yyyy hh:mm'
                                              )
                                            : ''}
                                        </Text>
                                      </Flex>
                                    )}
                                    {data?.user && (
                                      <Flex
                                        alignItems="baseline"
                                        lineHeight="1"
                                      >
                                        <Text
                                          fontSize="10px"
                                          minWidth="100px"
                                          textAlign="left"
                                          fontWeight="bold"
                                        >
                                          &nbsp;&nbsp;Request By
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
                                          {data?.user?.username ?? ''}
                                        </Text>
                                      </Flex>
                                    )}
                                  </Box>
                                </Flex>
                                <Box borderBottom="1px solid black" mb={4} />
                              </React.Fragment>
                            )}
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
                                      {pageIndex * itemsPerPage + index + 1}
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
                                  style={{ fontSize: '10px' }}
                                  mt={3}
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
              </Box>
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
          </React.Fragment>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PreviewPopup;
