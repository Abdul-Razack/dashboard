import React, { useEffect, useRef, useState } from 'react';

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
} from '@chakra-ui/react';
import { format } from 'date-fns';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import debounce from 'lodash/debounce';
import { HiPrinter } from 'react-icons/hi';

import PDFFooter from '@/components/PreviewContents/Blocks/PDFFooter';
import PDFHeader from '@/components/PreviewContents/Blocks/PDFHeader';
import { getDisplayLabel } from '@/helpers/commonHelper';

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

  const waitForImagesToLoad = (container: HTMLElement): Promise<void> => {
    const images = container.querySelectorAll('img');
    return new Promise((resolve) => {
      let loadedCount = 0;
      const total = images.length;

      if (total === 0) return resolve();

      images.forEach((img) => {
        const done = () => {
          loadedCount++;
          if (loadedCount === total) resolve();
        };

        if (img.complete && img.naturalHeight !== 0) {
          done();
        } else {
          img.onload = done;
          img.onerror = done;
        }
      });
    });
  };

  const downloadImagePDF = async (input: HTMLElement, fileName: string) => {
    setLoading(true);
    await waitForImagesToLoad(input); // ✅ wait for all <img> to load

    html2canvas(input, { scale: 2, useCORS: true, allowTaint: false }).then(
      (canvas) => {
        const imgData = canvas.toDataURL('image/png');

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pageHeight = 297;

        let heightLeft = imgHeight;
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        let position = 0;
        let pageCount = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        pageCount++;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
          pageCount++;
        }

        for (let i = 1; i <= pageCount; i++) {
          pdf.setPage(i);
        }

        pdf.save(
          `${fileName}-preview-${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`
        );
        setLoading(false);
      }
    );
  };

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!;
    downloadImagePDF(
      input,
      `spare-info-${data?.part_number?.part_number}-report`
    );
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
  const createPagesFromSparePart = (data: any) => {
    const pages = [];

    // Create a copy of the spare part without the file references
    const { ipc_ref, msds, picture, xref, ...mainData } = data;

    mainData.msds = msds;
    mainData.ipc_ref = ipc_ref;
    mainData.picture = picture;
    mainData.xref = xref;

    // Add main data as first page
    pages.push({
      type: 'main',
      data: mainData,
    });

    // Add each file reference as separate pages if they exist

    if (msds) {
      pages.push({
        title: 'MSDS',
        type: 'image',
        data: { url: msds },
      });
    }

    if (ipc_ref) {
      pages.push({
        title: 'IPC Ref',
        type: 'image',
        data: { url: ipc_ref },
      });
    }

    if (picture) {
      pages.push({
        title: 'Picture',
        type: 'image',
        data: { url: picture },
      });
    }

    if (xref) {
      pages.push({
        title: 'X-Ref',
        type: 'image',
        data: { url: xref },
      });
    }

    setPages(pages);
  };

  useEffect(() => {
    if (isOpen && data) {
      createPagesFromSparePart(data);
    }
  }, [isOpen, data]);

  useEffect(() => {
    console.log(pages);
  }, [pages]);

  pages;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent maxWidth="50vw">
        <ModalHeader textAlign="center">
          <Text fontSize="lg" fontWeight="bold">
            Preview Spare
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box borderRadius={4} id="table-to-export">
            <Stack spacing={2} borderRadius="md">
              {pages.map((pageData: any, pageIndex: number) => (
                <Container
                  key={pageIndex}
                  maxW="container.md"
                  minH={minH}
                  style={{ pageBreakAfter: 'always' }}
                  p={4}
                  id={`Page${pageIndex}-${headerHeight}`}
                >
                  <Box borderWidth="1px" borderRadius="lg" p={6} boxShadow="md">
                    <Box ref={headerElementRef}>
                      <PDFHeader style={{ fontSize: '10px' }} />
                    </Box>
                    <Box
                      minH={`${minH - (Number(headerHeight) + (Number(pageIndex) > 0 ? 90 : 80))}px`}
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
                            Spare&nbsp;&nbsp;Info - {data?.part_number}
                          </Text>
                        </Box>
                      </Flex>

                      <Divider
                        borderColor="black"
                        borderWidth={1}
                        mb={pageIndex > 0 ? 4 : 4}
                      />
                      <React.Fragment>
                        {pageIndex === 0 && (
                          <React.Fragment>
                            <Flex
                              justify="space-between"
                              bg="white"
                              p={4}
                              borderRadius="md"
                              boxShadow="sm"
                              paddingTop={0}
                              border={'none'}
                              flexDirection="column" // Added to stack title and content vertically
                            >
                              {/* Title at top center */}
                              <Text
                                fontSize="md"
                                fontWeight="bold"
                                textAlign="center"
                                mb={2} // Margin bottom to separate from content
                              >
                                Part Details
                              </Text>

                              {/* Content */}
                              <Flex justify="space-between">
                                {/* First Box */}
                                <Box>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Part Number
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
                                      {pageData?.data?.part_number ?? 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Alt.Part Numbers
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
                                      {pageData?.data?.alternates
                                        .map(
                                          (item: any) =>
                                            item?.alternate_part_number?.part_number
                                        )
                                        .filter(Boolean)
                                        .join(', ')}
                                    </Text>
                                  </Flex>

                                  <Flex alignItems="baseline" lineHeight="1">
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
                                    <Text fontSize="10px" alignSelf="baseline">
                                      {pageData?.data?.description ?? 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      ATA
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
                                      {pageData?.data?.ata ?? 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Spare Type
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
                                        data?.spareTypeOptions,
                                        pageData?.data?.spare_type_id,
                                        'type'
                                      ) ?? ''}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Spare Model
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
                                        data?.spareModelOptions,
                                        pageData?.data?.spare_model_id,
                                        'model'
                                      ) ?? ''}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      HSC Code
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
                                        data?.hscCodeOptions,
                                        pageData?.data?.hsc_code_id,
                                        'hsc'
                                      ) ?? ''}
                                    </Text>
                                  </Flex>
                                </Box>

                                {/* Third Box */}
                                <Box>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Manufacturer
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
                                      {pageData?.data?.manufacturer_name ?? ' - '}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Cage Code
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
                                      {pageData?.data?.cage_code ?? ' - '}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Shelf Life
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
                                      {pageData?.data?.is_shelf_life
                                        ? 'Yes'
                                        : 'No'}
                                    </Text>
                                  </Flex>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Total Shelf Life
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
                                      {pageData?.data?.total_shelf_life ??
                                        'N/A'}
                                    </Text>
                                  </Flex>

                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Is LLP
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
                                      {pageData?.data?.is_llp ? 'Yes' : 'No'}
                                    </Text>
                                  </Flex>

                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Is DG
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
                                      {pageData?.data?.is_dg ? 'Yes' : 'No'}
                                    </Text>
                                  </Flex>

                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Serialized Item
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
                                      {pageData?.data?.is_serialized
                                        ? 'Yes'
                                        : 'No'}
                                    </Text>
                                  </Flex>
                                  {pageData?.data?.un && (
                                    <Flex alignItems="baseline" lineHeight="1">
                                      <Text
                                        fontSize="10px"
                                        minWidth="120px"
                                        textAlign="left"
                                        fontWeight="bold"
                                      >
                                        UN
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
                                        maxW={'120px'}
                                        lineHeight="1"
                                      >
                                        {pageData?.data?.un
                                          ? `${pageData?.data?.un.name} `
                                          : 'N/A'}
                                        {pageData?.data?.un && (
                                          <React.Fragment>
                                            <br />
                                            <Text as={'span'}>
                                              {pageData?.data?.un
                                                ? `${pageData?.data?.un.description}`
                                                : ''}
                                            </Text>
                                          </React.Fragment>
                                        )}
                                      </Text>
                                    </Flex>
                                  )}

                                  {pageData?.data?.un && (
                                    <Flex alignItems="baseline" lineHeight="1">
                                      <Text
                                        fontSize="10px"
                                        minWidth="120px"
                                        textAlign="left"
                                        fontWeight="bold"
                                      >
                                        Class
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
                                        maxW={'120px'}
                                        lineHeight="1"
                                      >
                                        {pageData?.data?.un.classs ?? 'N/A'}
                                      </Text>
                                    </Flex>
                                  )}
                                </Box>
                              </Flex>
                            </Flex>

                            <Flex
                              justify="space-between"
                              bg="white"
                              p={4}
                              borderRadius="md"
                              boxShadow="sm"
                              paddingTop={0}
                              border={'none'}
                              flexDirection="column" // Added to stack title and content vertically
                            >
                              {/* Title at top center */}
                              <Text
                                fontSize="md"
                                fontWeight="bold"
                                textAlign="center"
                                mb={2} // Margin bottom to separate from content
                              >
                                Part Document Details
                              </Text>

                              {/* Content */}
                              <Flex justify="space-between">
                                {/* First Box */}
                                <Box>
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      MSDS
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
                                      {pageData?.data?.msds ?? 'No'}
                                    </Text>
                                  </Flex>

                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      IPC Reference
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
                                      {pageData?.data?.ipc_ref ?? 'No'}
                                    </Text>
                                  </Flex>
                                  
                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      Picture
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
                                      {pageData?.data?.picture ?? 'No'}
                                    </Text>
                                  </Flex>

                                  <Flex alignItems="baseline" lineHeight="1">
                                    <Text
                                      fontSize="10px"
                                      minWidth="120px"
                                      textAlign="left"
                                      fontWeight="bold"
                                    >
                                      X-Ref
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
                                      {pageData?.data?.xref ?? 'No'}
                                    </Text>
                                  </Flex>
                                </Box>
                              </Flex>
                            </Flex>

                            <Divider
                              borderColor="black"
                              borderWidth={1}
                              mb={4}
                            />
                            <Flex
                              justify="space-between"
                              bg="white"
                              p={4}
                              borderRadius="md"
                              boxShadow="none"
                              paddingTop={0}
                              border={'none'}
                              flexDirection="column"
                            >
                              <Box mt={2}>
                                <Text fontSize="10px" fontWeight="bold">
                                  Remarks:
                                </Text>
                                <Text fontSize="10px">
                                  {pageData?.data?.remarks
                                    ? pageData?.data?.remarks
                                    : 'N/A'}
                                </Text>
                              </Box>
                            </Flex>
                          </React.Fragment>
                        )}
                        {pageIndex > 0 && (
                          <Box>
                            <Text
                              fontSize="md"
                              fontWeight="bold"
                              textAlign="center"
                              mb={4}
                            >
                              {pageData.title}
                            </Text>
                            <Flex
                              justify="center"
                              align="center"
                              height="500px"
                            >
                              <img
                                src={`${import.meta.env.VITE_PUBLIC_DOC_URL}${pageData.data.url}`}
                                alt={pageData.title}
                                style={{
                                  maxWidth: '100%',
                                  maxHeight: '100%',
                                  objectFit: 'contain',
                                }}
                              />
                            </Flex>
                          </Box>
                        )}
                      </React.Fragment>
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
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PreviewPopup;
