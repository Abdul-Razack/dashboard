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
import debounce from 'lodash/debounce';
import { HiPrinter } from 'react-icons/hi';

import CurrencyDisplay from '@/components/CurrencyDisplay';
import PDFFooter from '@/components/PreviewContents/Blocks/PDFFooter';
import PDFHeader from '@/components/PreviewContents/Blocks/PDFHeader';
import { downloadPDF, getDisplayLabel, extractAfterHyphen } from '@/helpers/commonHelper';

import PartDetails from '@/components/PreviewContents/PartDetails';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};
export const DirectPOPreviewPopup = ({ isOpen, onClose, data }: ModalPopupProps) => {
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const footerElementRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [footerHeight, setFooterHeight] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!; // Get the print content
    downloadPDF(input, 'purchase-order');
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
      updateHeight();
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="50vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Preview Purchase Order
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
                minH="1122px"
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
                    minH={1122 - (headerHeight + footerHeight) + 'px'}
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
                          PURCHASE ORDER {data?.id ? `- #${data?.id}` : ''}
                        </Text>
                      </Box>
                    </Flex>

                    <Divider borderColor="black" borderWidth={1} mb={4} />
                    <Flex mb={6} justify="space-between" p={2}>
                      <Box width="30%">
                        <Flex direction="column" gap={1}>
                          {[
                            {
                              label: 'Priority:',
                              value:
                                getDisplayLabel(
                                  data.priorityOptions,
                                  data.priority_id
                                    ? data.priority_id.toString()
                                    : 0,
                                  'Priority'
                                ) || 'N/A',
                                isHTML: false
                            },
                            {
                              label: 'FOB:',
                              value:
                                getDisplayLabel(
                                  data.fobOptions,
                                  data.fob_id ? data.fob_id.toString() : 0,
                                  'FOB'
                                ) || 'N/A',
                                isHTML: false
                            },
                            {
                              label: 'Ship Type:',
                              value:
                                getDisplayLabel(
                                  data.shipTypeOptions,
                                  data.ship_type_id
                                    ? data.ship_type_id.toString()
                                    : 0,
                                  'Ship Type'
                                ) || 'N/A',
                                isHTML: false
                            },
                            {
                              label: 'Ship Mode:',
                              value:
                                getDisplayLabel(
                                  data.shipModeOptions,
                                  data.ship_mode_id
                                    ? data.ship_mode_id.toString()
                                    : 0,
                                  'Ship Mode'
                                ) || 'N/A',
                                isHTML: false
                            },
                          ].map(({ label, value }) => (
                            <Flex key={label} justify="space-between">
                              <Text width="40%" sx={{ fontSize: '13px' }}>
                                {label}
                              </Text>
                              <Text
                                fontWeight="bold"
                                flex={1}
                                textAlign="left"
                                sx={{ fontSize: '13px' }}
                              >
                                {value}
                              </Text>
                            </Flex>
                          ))}
                        </Flex>
                      </Box>

                      <Box width="30%">
                        <Flex direction="column" gap={1}>
                          {[
                            {
                              label: 'Ship A/C:',
                              value:
                                extractAfterHyphen(getDisplayLabel(
                                  data.shipAccountOptions,
                                  data.ship_account_id
                                    ? data.ship_account_id.toString()
                                    : 0,
                                  'Ship Account'
                                )) || 'N/A',
                                isHtml: false
                            },
                            {
                              label: 'Ship To:',
                              value:
                                getDisplayLabel(
                                  data.shippingOptions,
                                  data.ship_customer_shipping_address_id
                                    ? data.ship_customer_shipping_address_id.toString()
                                    : 0,
                                  'Ship To'
                                ) || 'N/A',
                                isHtml: false
                            },
                            {
                              label: 'Ship.Addr:',
                              value: data.vendorAddress ? data.vendorAddress : 'N/A',
                              isHtml: true
                            },
                            {
                              label: 'Pay.Mode:',
                              value:
                                getDisplayLabel(
                                  data.paymentModeOptions,
                                  data.payment_mode_id
                                    ? data.payment_mode_id.toString()
                                    : 0,
                                  'Payment Mode'
                                ) || 'N/A',
                                isHtml: false
                            },
                            {
                              label: 'Pay.Term:',
                              value:
                                getDisplayLabel(
                                  data.paymentTermOptions,
                                  data.payment_term_id
                                    ? data.payment_term_id.toString()
                                    : 0,
                                  'Payment Term'
                                ) || 'N/A',
                                isHtml: false
                            },
                          ].map(({ label, value, isHtml }) => (
                            <Flex key={label} justify="space-between">
                              <Text width="40%" sx={{ fontSize: '13px' }}>
                                {label}
                              </Text>
                              {isHtml === true && (
                              <Text
                              sx={{ fontSize: '13px' }}
                              fontWeight="bold"
                              flex={1}
                              textAlign="left"
                              dangerouslySetInnerHTML={{
                                __html: value
                                  ? value
                                  : 'N/A',
                              }}
                            />)}
                            {isHtml === false && (
                              <Text
                                fontWeight="bold"
                                flex={1}
                                textAlign="left"
                                sx={{ fontSize: '13px' }}
                              >
                                {value}
                              </Text>
                            )}
                            </Flex>
                          ))}
                        </Flex>
                      </Box>

                      <Box width="40%">
                        <Flex direction="column" gap={1} ms={2}>
                          {[
                            {
                              label: 'Currency:',
                              value:
                                getDisplayLabel(
                                  data.currencyOptions,
                                  data.currency_id
                                    ? data.currency_id.toString()
                                    : 0,
                                  'Currency'
                                ) || 'N/A',
                            },
                            {
                              label: 'Ven.Name:',
                              value: data.vendor_name
                                ? data.vendor_name.toString()
                                : 'N/A',
                            },
                            {
                              label: 'Ven.Code:',
                              value: data.vendor_code
                                ? data.vendor_code.toString()
                                : 'N/A',
                            },
                            {
                              label: 'Con.Person:',
                              value:
                                getDisplayLabel(
                                  data.contactOptions,
                                  data.customer_contact_manager_id
                                    ? data.customer_contact_manager_id.toString()
                                    : 0,
                                  ''
                                ) || 'N/A',
                            },
                          ].map(({ label, value }) => (
                            <Flex key={label} justify="space-between">
                              <Text width="40%" sx={{ fontSize: '13px' }}>
                                {label}
                              </Text>
                              <Text
                                fontWeight="bold"
                                flex={1}
                                textAlign="left"
                                sx={{ fontSize: '13px' }}
                              >
                                {value}
                              </Text>
                            </Flex>
                          ))}
                          <Flex justify="space-between">
                            <Text width="40%" sx={{ fontSize: '13px' }}>
                              Ven.Addr:
                            </Text>
                            <Text
                              sx={{ fontSize: '13px' }}
                              fontWeight="bold"
                              flex={1}
                              textAlign="left"
                              dangerouslySetInnerHTML={{
                                __html: data.contactAddress
                                  ? data.contactAddress
                                  : 'N/A',
                              }}
                            />
                          </Flex>
                        </Flex>
                      </Box>
                    </Flex>

                    <Divider borderColor="black" borderWidth={1} />
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
                            #
                          </Th>
                          {/* <Th
                            sx={{
                              fontSize: '13px',
                              paddingTop: 1,
                              paddingBottom: 2,
                            }}
                          >
                            Q.Id
                          </Th> */}
                          <Th
                            sx={{
                              fontSize: '13px',
                              paddingTop: 1,
                              paddingBottom: 2,
                            }}
                          >
                            Part Num
                          </Th>
                          <Th
                            sx={{
                              fontSize: '13px',
                              paddingTop: 1,
                              paddingBottom: 2,
                            }}
                          >
                            Desc.
                          </Th>
                          <Th
                            sx={{
                              fontSize: '13px',
                              paddingTop: 1,
                              paddingBottom: 2,
                            }}
                          >
                            Condition
                          </Th>
                          <Th
                            sx={{
                              fontSize: '13px',
                              paddingTop: 1,
                              paddingBottom: 2,
                            }}
                          >
                            QTY
                          </Th>
                          <Th
                            sx={{
                              fontSize: '13px',
                              paddingTop: 1,
                              paddingBottom: 2,
                            }}
                          >
                            Price
                          </Th>
                          <Th
                            sx={{
                              fontSize: '13px',
                              paddingTop: 1,
                              paddingBottom: 2,
                            }}
                          >
                            UOM
                          </Th>
                          <Th
                            sx={{
                              fontSize: '13px',
                              paddingTop: 1,
                              paddingBottom: 2,
                            }}
                          >
                            Notes
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {data &&
                          data.items &&
                          data.items.map((item: any, index: number) => (
                            <Tr key={index}>
                              <Td
                                sx={{
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                {index + 1}
                              </Td>
                              {/* <Td
                                sx={{
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                {item.quotation_id}
                              </Td> */}
                              <Td
                                sx={{
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                <PartDetails
                                  partNumber={item.part_number_id}
                                  field={'part_number'}
                                />
                              </Td>
                              <Td
                                sx={{
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                <PartDetails
                                  partNumber={item.part_number_id}
                                  field={'description'}
                                />
                              </Td>
                              <Td
                                sx={{
                                  fontSize: '13px',
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
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                {item.qty}
                              </Td>
                              <Td
                                sx={{
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                {item.price}
                              </Td>
                              <Td
                                sx={{
                                  fontSize: '13px',
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
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                {item.note}
                              </Td>
                            </Tr>
                          ))}
                      </Tbody>
                    </Table>
                    <Box p={0} m={0} border="none" bg="transparent" mt={3}>
                      {data?.remarks && (
                        <Flex
                          justify="space-between"
                          mb={6}
                          style={{ fontSize: '13px' }}
                        >
                          <Box width="100%" p={2}>
                            <Text marginEnd={10} fontWeight="bold">
                              Remarks:
                            </Text>
                            <Text
                              dangerouslySetInnerHTML={{
                                __html: data?.remarks ? data?.remarks : ' - ',
                              }}
                            ></Text>
                          </Box>
                        </Flex>
                      )}
                    </Box>
                    <Box p={0} m={0} border="none" bg="transparent" mt={36}>
                      <Divider borderColor="black" borderWidth={1} mb={4} />
                      <Flex mb={6} justify="space-between" p={2}>
                        <Box></Box>
                        <Box></Box>
                        <Box>
                          <Flex direction="column" gap={1}>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                                Sub Total:
                              </Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                <CurrencyDisplay
                                  currencyId={
                                    data.currency_id
                                      ? data.currency_id.toString()
                                      : ''
                                  }
                                />
                                {data.subTotal
                                  ? Number(data.subTotal).toFixed(2)
                                  : '0.00'}
                              </Text>
                            </Flex>

                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                                Bank Charge:
                              </Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                <CurrencyDisplay
                                  currencyId={
                                    data.currency_id
                                      ? data.currency_id.toString()
                                      : ''
                                  }
                                />
                                {data.bank_charge
                                  ? Number(data.bank_charge).toFixed(2)
                                  : '0.00'}
                              </Text>
                            </Flex>

                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                                Freight Charge:
                              </Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                <CurrencyDisplay
                                  currencyId={
                                    data.currency_id
                                      ? data.currency_id.toString()
                                      : ''
                                  }
                                />
                                {data.freight
                                  ? Number(data.freight).toFixed(2)
                                  : '0.00'}
                              </Text>
                            </Flex>

                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                                MISC Charge:
                              </Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                <CurrencyDisplay
                                  currencyId={
                                    data.currency_id
                                      ? data.currency_id.toString()
                                      : ''
                                  }
                                />
                                {data.misc
                                  ? Number(data.misc).toFixed(2)
                                  : '0.00'}
                              </Text>
                            </Flex>

                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                                Discount:
                              </Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                <CurrencyDisplay
                                  currencyId={
                                    data.currency_id
                                      ? data.currency_id.toString()
                                      : ''
                                  }
                                />
                                {data.discount
                                  ? Number(data.discount).toFixed(2)
                                  : '0.00'}
                              </Text>
                            </Flex>

                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                                VAT:
                              </Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.vat ? data.vat : '0.00'} %
                              </Text>
                            </Flex>

                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                                Total Payable:
                              </Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                <CurrencyDisplay
                                  currencyId={
                                    data.currency_id
                                      ? data.currency_id.toString()
                                      : ''
                                  }
                                />
                                {data.totalPayableAmount
                                  ? data.totalPayableAmount.toFixed(2)
                                  : '0.00'}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                      </Flex>
                    </Box>
                  </Box>
                  <Box
                    p={0}
                    m={0}
                    border="none"
                    bg="transparent"
                    ref={footerElementRef}
                  >
                    <PDFFooter style={{ fontSize: '13px' }} createdAt={data?.created_at ? data?.created_at : ''} createdBy={data?.user ? data?.user?.username : ''}/>
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

export default DirectPOPreviewPopup;
