import { useEffect, useState, useMemo } from 'react';

import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  HStack,
  Heading,
  IconButton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import dayjs from 'dayjs';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';

import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useCustomerDetails } from '@/services/master/services';
import { useProformaInvoiceDetails } from '@/services/finance/proforma-invoice/services';
import { usePurchaseOrderDetails } from '@/services/purchase/purchase-orders/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';

export const ProformaInvoiceDetails = () => {
  let { id } = useParams();
  const [poId, setPoId] = useState<number | null>(null);
  const navigate = useNavigate();
  const currencyList = useCurrencyList();
  const paymentTermsList = usePaymentTermsList();
  const [customerId, setCustomerId] = useState<number | null>(null);
  const { data: poDetails } = usePurchaseOrderDetails(poId ? poId : '');
  const { data: details, isLoading } = useProformaInvoiceDetails(Number(id));

  const { data: customerDetails } = useCustomerDetails(
    customerId ? customerId : ''
  );
  useEffect(() => {
    if (details?.data) {
      setPoId(details.data.purchase_order_id);
    }
  }, [details]);

  useEffect(() => {
    if (poDetails?.data) {
      setCustomerId(poDetails.data.customer_id);
    }
  }, [poDetails]);

  const poValue = useMemo(() => {
    return details?.data?.items.reduce(
      (acc, item) => acc + item.invoice_value ,
      0
    );
  }, [details?.data?.items]);

  return (
    <SlideIn>
      <Stack pl={2} spacing={2}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Breadcrumb
              fontWeight="medium"
              fontSize="sm"
              separator={<ChevronRightIcon boxSize={6} color="gray.500" />}
            >
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink as={Link} to="/purchase/purchase-request">
                  Proforma Invoice Entry List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Proforma Invoice Entry Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Proforma Invoice Entry Details
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/finance/proforma-invoice/${id}/edit`)}
            />

            <ResponsiveIconButton
              variant={'@primary'}
              icon={<HiArrowNarrowLeft />}
              size={'sm'}
              fontWeight={'thin'}
              onClick={() => navigate(-1)}
            >
              Back
            </ResponsiveIconButton>
          </HStack>
        </HStack>

        <Box borderRadius={4}>
          <LoadingOverlay isLoading={isLoading}>
            <Stack
              spacing={2}
              p={4}
              bg={'white'}
              borderRadius={'md'}
              boxShadow={'lg'}
            >
              <Stack spacing={4}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="PIE NO"
                    value={details?.data?.id || 'N/A'}
                  />
                  <FieldDisplay
                    label="PIE Date"
                    value={
                      details?.data?.date
                        ? dayjs(details?.data?.date).format('DD-MMM-YYYY')
                        : ' - '
                    }
                  />
                  <FieldDisplay
                    label="PRINV Type"
                    value={details?.data?.type.toUpperCase() || 'N/A'}
                  />
                  {/* <FieldDisplay
                    label="Type"
                    value={getPRTypeLabel(details?.data?.type || '')}
                  /> */}

                  <FieldDisplay
                    label="PO Number"
                    value={details?.data?.purchase_order_id || 'N/A'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label={'PO Date'}
                    value={
                      poDetails?.data?.created_at
                        ? dayjs(poDetails?.data?.created_at).format(
                            'DD-MMM-YYYY'
                          )
                        : ' - '
                    }
                  />

                  <FieldDisplay
                    label={'PO Value'}
                    value={poValue}
                  />

                  <FieldDisplay
                    label={'Vendor Name'}
                    value={
                      customerDetails?.data?.business_name
                        ? customerDetails?.data?.business_name
                        : ' - '
                    }
                  />

                  <FieldDisplay
                    label={'Vendor Code'}
                    value={
                      customerDetails?.data?.code ? customerDetails?.data?.code : ' - '
                    }
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Remarks"
                    value={details?.data?.remarks || 'N/A'}
                    isHtml={true}
                  />
                </Stack>
                <Stack>
                  <HStack justify={'space-between'}>
                    <Text fontSize="md" fontWeight="700">
                      Items
                    </Text>
                  </HStack>
                  {details?.data?.items && details?.data?.items.length > 0 && (
                    <TableContainer
                      rounded={'md'}
                      overflow={'auto'}
                      border="1px"
                      borderColor="gray.500"
                      borderRadius="md"
                      boxShadow="md"
                    >
                      <Table variant="striped" size={'sm'}>
                        <Thead bg={'gray.500'}>
                          <Tr>
                            <Th color={'white'}>S.No.</Th>
                            <Th color={'white'}>Invoice No</Th>
                            <Th color={'white'}>Invoice Date</Th>
                            <Th color={'white'}>Currency</Th>
                            <Th color={'white'}>Invoice Amt</Th>
                            <Th color={'white'}>Due Date</Th>
                            <Th color={'white'}>Payment Term</Th>
                            <Th color={'white'}>Narration</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {details?.data?.items.map((item, index) => (
                            <Tr key={item.id}>
                              <Td>{index + 1}</Td>
                              <Td> {item.invoice_number || ' - '}</Td>
                              <Td>
                                {' '}
                                {item?.invoice_date
                                  ? dayjs(item?.invoice_date).format(
                                      'DD-MMM-YYYY'
                                    )
                                  : ' - '}{' '}
                              </Td>
                              <Td>
                                {currencyList.data?.items[
                                  poDetails?.data.currency_id || 0
                                ] || 'N/A'}
                              </Td>
                              <Td>{item.invoice_value || ' 0 '}</Td>
                              <Td>
                                {' '}
                                {item?.due_date
                                  ? dayjs(item?.due_date).format('DD-MMM-YYYY')
                                  : ' - '}{' '}
                              </Td>
                              <Td>{item.narration || ' - '}</Td>
                              <Td>
                                {' '}
                                {paymentTermsList.data?.items[
                                  item.payment_term_id
                                ] || 'N/A'}{' '}
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </Stack>
              </Stack>

              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify={'center'}
                alignItems={'center'}
                display={'flex'}
                mt={4}
              >
                <Button colorScheme="brand" onClick={() => navigate(-1)}>
                  Back
                </Button>
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default ProformaInvoiceDetails;
