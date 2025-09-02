import { useEffect, useRef, useState } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiEye } from 'react-icons/hi';
import { LuPlus } from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';

import CurrencyDisplay from '@/components/CurrencyDisplay';
import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldUpload } from '@/components/FieldUpload';
import LoadingOverlay from '@/components/LoadingOverlay';
import { InvoicePreview } from '@/components/PreviewContents/Finance/Invoice';
import { ProformaInvoicePreview } from '@/components/PreviewContents/Finance/ProformaInvoice';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  useCreateInvoice,
  useGetInvoiceListByOrderID
} from '@/services/finance/invoice/services';
import {
  useCreateProformaInvoice,
  useGetProformaInvoiceListByOrderID,
} from '@/services/finance/proforma-invoice/services';
import { useCustomerDetails } from '@/services/master/services';
import {
  usePurchaseOrderDetails,
  usePurchaseOrderList,
} from '@/services/purchase/purchase-orders/services';
import { useLogisticOrderDetails, useLogisticOrderList } from '@/services/logistics/order/services';
import {
  useCurrencyIndex,
  useCurrencyList,
} from '@/services/submaster/currency/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';
import { transformToSelectOptions, formatDate } from '@/helpers/commonHelper';
import { BankModal } from '@/components/Modals/CustomerMaster/Bank';

export const ProformaInvoiceCreate = () => {
  const purchaseOrderList = usePurchaseOrderList();
  const logisticOrderList = useLogisticOrderList();
  const purchaseOrderOptions = transformToSelectOptions(purchaseOrderList.data);
  const logisticOrderOptions = transformToSelectOptions(logisticOrderList.data);
  const paymentTermsList = usePaymentTermsList();
  const paymentTermsOptions = transformToSelectOptions(paymentTermsList.data);
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();
  const [resetKey, setResetKey] = useState(0);
  const invoiceTypes = [{ value: 'po', label: 'PO' }, { value: 'lo', label: 'LO' }];
  const [invoiceType, setInvoiceType] = useState<string>('');
  const currencyData = useCurrencyIndex();
  const currencyItems = currencyData.data?.items ?? [];

  const [cutsomerBankOptions, setBanks] = useState<TODO>([]);
  const [poValue, setPOValue] = useState<any | null>(null);
  const [poId, setPoId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const { data: poDetails } = usePurchaseOrderDetails(poId ? poId : '', {
    enabled: poId !== null && poId !== 0 && invoiceType === 'po',
  });

  const { data: loDetails } = useLogisticOrderDetails(poId ? poId : 0, {
    enabled: poId !== null && poId !== 0 && invoiceType === 'lo',
  });
  const [selectedTab, setSelectedTab] = useState<string>('tab1');
  const [resetField, setResetField] = useState(false);
  const [poCurrency, setPOCurrency] = useState<any | null>(null);
  const currencyList = useCurrencyList();
  const currencyOptions = transformToSelectOptions(currencyList.data);
  const [isPreviewProforma, setIsPreviewProforma] = useState(false);
  const [isPreviewInvoice, setIsPreviewInvoice] = useState(false);
  const [previewData, setPreviewData] = useState<any>({});
  const handleReset = () => {
    setResetField(true);
  };

  const handleCloseModal = () => {
    setPreviewData({});
    setIsPreviewProforma(false);
    setIsPreviewInvoice(false);
  };

  const showProformaPreview = (itemInfo: any) => {
    let popupVariables: any = {};
    popupVariables.poId = poId;
    popupVariables.poValue = poValue;
    popupVariables.invoiceType = invoiceType;
    popupVariables.po_date = poDetails?.data?.created_at
      ? dayjs(poDetails?.data?.created_at).format('DD-MMM-YYYY')
      : ' - ';
    popupVariables.vendor_name = customerDetails?.data?.business_name
      ? customerDetails?.data?.business_name
      : ' - ';
    popupVariables.vendor_code = customerDetails?.data?.code
      ? customerDetails?.data?.code
      : ' - ';
    Object.keys(itemInfo).forEach(function (key) {
      popupVariables[key] = itemInfo[key];
    });
    popupVariables.invoice_amount = `${poCurrency?.code} ${itemInfo.invoice_amount}`;
    popupVariables.payment_term =
      paymentTermsList.data?.items[itemInfo.payment_term_id ?? 0] || 'N/A';
    console.log(popupVariables);
    setPreviewData(popupVariables);
    setIsPreviewProforma(true);
  };

  const showInvoicePreview = (itemInfo: any) => {
    let popupVariables: any = {};
    popupVariables.poId = poId;
    popupVariables.poValue = poValue;
    popupVariables.invoiceType = invoiceType;
    popupVariables.po_date = poDetails?.data?.created_at
      ? dayjs(poDetails?.data?.created_at).format('DD-MMM-YYYY')
      : ' - ';
    popupVariables.vendor_name = customerDetails?.data?.business_name
      ? customerDetails?.data?.business_name
      : ' - ';
    popupVariables.vendor_code = customerDetails?.data?.code
      ? customerDetails?.data?.code
      : ' - ';
    Object.keys(itemInfo).forEach(function (key) {
      popupVariables[key] = itemInfo[key];
    });
    popupVariables.invoice_amount = `${poCurrency?.code} ${itemInfo.invoice_amount}`;
    popupVariables.payment_term =
      paymentTermsList.data?.items[itemInfo.payment_term_id ?? 0] || 'N/A';
    console.log(popupVariables);
    setPreviewData(popupVariables);
    setIsPreviewInvoice(true);
  };

  const {
    data: customerDetails,
    isLoading: customerDetailsLoading,
    refetch: customerDetailsRefetch,
  } = useCustomerDetails(customerId ? customerId : '', {
    enabled: customerId !== null && customerId !== 0,
  });

  const setPoIdDebounced = useRef(
    debounce((value: number) => {
      setPoId(value), 500;
    })
  ).current;

  const {
    isOpen: isCustBankAddOpen,
    onOpen: onCustBankAddOpen,
    onClose: onCustBankAddClose,
  } = useDisclosure();

  const {
    data: proformaInvocesbyOrderId,
    isLoading: proformaInvocesbyOrderIdLoading,
    refetch: proformaInvocesbyOrderIdRefetch,
  } = useGetProformaInvoiceListByOrderID(
    {  [invoiceType === 'lo' ? 'logistic_order_id' : 'purchase_order_id']: poId ?? 0 },
    {
      enabled: poId !== null && selectedTab === 'tab1',
    }
  );

  const {
    data: invocesbyOrderId,
    isLoading: invocesbyOrderIdLoading,
    refetch: invocesbyOrderIdRefetch,
  } = useGetInvoiceListByOrderID(
    {
      [invoiceType === 'lo' ? 'logistic_order_id' : 'purchase_order_id']: poId ?? 0,
    },
    {
      enabled: poId !== null && selectedTab === 'tab2',
    }
  );

  // Helper function for date formatting
  

  const createProformaInvoice = useCreateProformaInvoice({
    onSuccess: ({ id, message }) => {
      toastSuccess({
        title: 'Proforma Invoice Entry created successfully - ' + id,
        description: message,
      });
      proformaInvoiceForm.reset();
      proformaInvocesbyOrderIdRefetch();
      setResetKey((prevKey) => prevKey + 1);
      handleReset();
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create Proforma Invoice Entry',
        description: error.response?.data.message,
      });
    },
  });

  const createInvoice = useCreateInvoice({
    onSuccess: ({ message }) => {
      toastSuccess({
        title: 'Invoice Entry created successfully',
        description: message,
      });
      invoiceForm.reset();
      invocesbyOrderIdRefetch();
      setResetKey((prevKey) => prevKey + 1);
      handleReset();
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create Invoice Entry',
        description: error.response?.data.message,
      });
    },
  });

  useEffect(() => {
    if (!isCustBankAddOpen && customerId !== 0 && customerId !== null) {
      customerDetailsRefetch();
    }
  }, [isCustBankAddOpen]);

  const form = useForm({});
  const proformaInvoiceForm = useForm({
    onValidSubmit: (values) => {
      const payload = {
        due_date: formatDate(values.due_date) as string,
        narration: values.narration ?? '',
        payment_term_id: Number(values.payment_term_id),
        [invoiceType === 'lo' ? 'logistic_order_id' : 'purchase_order_id']: Number(poId),
        invoice_date: formatDate(values.invoice_date) as string,
        file: values.file ?? '',
        invoice_amount: values.invoice_amount,
        customer_bank_id: Number(values.customer_bank_id),
        invoice_number: values.invoice_number,
      };
      createProformaInvoice.mutate(payload);
    },
  });

  const invoiceForm = useForm({
    onValidSubmit: (values) => {
      const payload = {
        currency_id: Number(values.currency_id),
        customer_bank_id: Number(values.customer_bank_id),
        file: values.file ?? '',
        invoice_amount: values.invoice_amount,
        invoice_type: invoiceType,
        remarks: values.remarks ?? '',
        payment_done_by: values.payment_done_by ?? '',
        payment_done_date: formatDate(values.payment_done_date) as string,
        payment_term_id: Number(values.payment_term_id),
        [invoiceType === 'lo' ? 'logistic_order_id' : 'purchase_order_id']: Number(poId),
        tax_invoice_date: formatDate(values.tax_invoice_date) as string,
        tax_invoice_no: values.tax_invoice_no,
      };
      createInvoice.mutate(payload);
    },
  });

  useEffect(() => {
    if (poDetails?.data) {
      setCustomerId(poDetails.data.customer_id);
      const selectedCurrency = currencyItems.find(
        (item) => item.id === (poDetails.data.currency_id ?? 1)
      );
      setPOCurrency(selectedCurrency);
      setPOValue(
        selectedCurrency
          ? `${selectedCurrency?.code} ${poDetails.data.total_price}`
          : poDetails.data.total_price
      );
    }
  }, [poDetails]);

  useEffect(() => {
    if (loDetails?.data) {
      setCustomerId(loDetails?.data?.logistic_order?.logistic_quotation?.customer_id);
      const selectedCurrency = currencyItems.find(
        (item) => item.id === (loDetails?.data?.logistic_order?.logistic_quotation?.currency_id ?? 1)
      );
      setPOCurrency(selectedCurrency);
      setPOValue(
        selectedCurrency
          ? `${selectedCurrency?.code} ${loDetails?.data?.logistic_order?.logistic_quotation?.price}`
          : loDetails?.data?.logistic_order?.logistic_quotation?.price
      );
    }
  }, [loDetails]);

  useEffect(() => {
    console.log(selectedTab);
  }, [selectedTab]);

  useEffect(() => {
    console.log(proformaInvocesbyOrderId);
  }, [proformaInvocesbyOrderId]);

  useEffect(() => {
    if (customerDetails) {
      let bankOptions: any = [];
      customerDetails?.data?.customer_banks?.forEach((item: any) => {
        let object: any = {};
        object.value = item.id.toString();
        object.label = item.bank_name;
        bankOptions.push(object);
      });
      setBanks(bankOptions);
    }
  }, [customerDetails]);

  const handleCloseBankModal = (status: boolean, id: any) => {
    setResetKey((prevKey) => prevKey + 1);
    if (status === true) {
      setTimeout(() => {
        form.setValues({ 'customer_bank_id' : id.toString() });
        if (id) {
          customerDetailsRefetch();
        }
      }, 1000);
    } else {
      setTimeout(() => {
        form.setValues({ 'customer_bank_id': '' });
      }, 1000);
    }
    onCustBankAddClose();
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Breadcrumb
              fontWeight="medium"
              fontSize="sm"
              separator={<ChevronRightIcon boxSize={6} color="gray.500" />}
            >
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink as={Link} to={'/finance/proforma-invoice'}>
                  Proforma Invoice Entry List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Create Proforma Invoice Entry</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Create Proforma Invoice Entry
            </Heading>
          </Stack>
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

        <Stack
          spacing={2}
          p={4}
          bg={'white'}
          borderRadius={'md'}
          boxShadow={'md'}
        >
          <Stack spacing={2}>
            <Formiz autoForm connect={form}>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldSelect
                  key={`invoice_type_${resetKey}`}
                  label={'Ref Type'}
                  name={'invoice_type'}
                  placeholder="Select Ref Type"
                  options={invoiceTypes}
                  size={'sm'}
                  defaultValue={invoiceType}
                  onValueChange={(value) => {
                    setPoId(null);
                    setResetKey((prevKey) => prevKey + 1);
                    form.setValues({ purchase_order_id: '' });
                    setInvoiceType(value ?? '');
                  }}
                />
                <FieldSelect
                  key={`po_lo_id_${resetKey}`}
                  label={'Ref No'}
                  name={'purchase_order_id'}
                  options={invoiceType ===  'po' ? purchaseOrderOptions : logisticOrderOptions}
                  placeholder="Select Ref No"
                  onValueChange={(value) => {
                    console.log(value);
                    setPoIdDebounced(Number(value));
                  }}
                  isDisabled={invoiceType === ''}
                  size={'sm'}
                />
                <FieldDisplay
                  label={invoiceType ===  'po' ? 'PO Date' : (invoiceType ===  'lo' ? 'LO Date' : 'PO/LO Date')}
                  value={
                    invoiceType === 'po' 
                      ? (poDetails?.data?.created_at
                          ? dayjs(poDetails?.data?.created_at).format('DD-MMM-YYYY')
                          : ' - ') 
                      : (invoiceType === 'lo' 
                          ? (loDetails?.data?.logistic_order?.created_at 
                              ? dayjs(loDetails?.data?.logistic_order?.created_at).format('DD-MMM-YYYY') 
                              : ' - ') 
                          : ' - ') 
                  }
                  
                  size={'sm'}
                  // style={{ backgroundColor: '#fff' }}
                />
                <FieldDisplay
                  label={invoiceType ===  'po' ? 'PO Value' : (invoiceType ===  'lo' ? 'LO Value' : 'PO/LO Value')}
                  value={poValue ?? 0}
                  size={'sm'}
                  // style={{ backgroundColor: '#fff' }}
                />

                <FieldDisplay
                  label={'Vendor Name'}
                  value={
                    customerDetails?.data?.business_name
                      ? customerDetails?.data?.business_name
                      : ' - '
                  }
                  size={'sm'}
                  // style={{ backgroundColor: '#fff' }}
                />

                <FieldDisplay
                  label={'Vendor Code'}
                  value={customerDetails?.data?.code ? customerDetails?.data?.code : ' - '}
                  size={'sm'}
                  // style={{ backgroundColor: '#fff' }}
                />
              </Stack>
            </Formiz>
            <Tabs
              position="relative"
              onChange={(index) => setSelectedTab(`tab${index + 1}`)} 
              variant='unstyled'
              mt={3}
            >
              <TabList>
                <Tab bg={selectedTab === 'tab1' ? '#0C2556' : 'gray.200'} color={selectedTab === 'tab1' ? 'white' : 'black'} >Proforma Invoice</Tab>
                <Tab bg={selectedTab === 'tab2' ? '#0C2556' : 'gray.200'} color={selectedTab === 'tab2' ? 'white' : 'black'} >Invoice</Tab>
              </TabList>
              <TabPanels>
                <TabPanel p={0}>
                  <Box
                    bg={'white'}
                    borderRadius={'md'}
                    borderTopRightRadius={0}
                    borderTopLeftRadius={0}
                    boxShadow={'md'}
                    borderWidth={1}
                    borderColor={'gray.200'}
                    p={4}
                  >
                    <Formiz autoForm connect={proformaInvoiceForm}>
                      <Box
                        bg={'white'}
                        borderRadius={'md'}
                        boxShadow={'md'}
                        borderWidth={1}
                        borderColor={'gray.200'}
                        p={4}
                      >
                        <Stack
                          spacing={4}
                          direction={{ base: 'column', md: 'row' }}
                          mb={4}
                        >
                          <FieldInput
                            label="Invoice No"
                            name="invoice_number"
                            placeholder="Inv. No"
                            size={'sm'}
                            type="text"
                            required={'Invoice Number is required'}
                            isDisabled={poId === null}
                            className={poId === null ? 'disabled-input' : ''}
                          />

                          <FieldDayPicker
                            label={'Inv. Date'}
                            name={'invoice_date'}
                            placeholder="Select Invoice Date"
                            required={'Invoice Date is required'}
                            size={'sm'}
                            dayPickerProps={{
                              inputProps: {
                                isDisabled: poId === null,
                              },
                            }}
                          />

                          <FieldInput
                            label="Invoice Amt"
                            name="invoice_amount"
                            placeholder="Inv. Amount"
                            size={'sm'}
                            type="decimal"
                            required={'Invoice Amount is required'}
                            isDisabled={poId === null}
                          />

                          <FieldSelect
                            key={`payment_term_id_${resetKey}`}
                            label={'Pay. Term'}
                            name={'payment_term_id'}
                            required={'Payment Term is required'}
                            placeholder="Select Term"
                            options={paymentTermsOptions}
                            defaultValue={'2'}
                            isDisabled={poId === null}
                            size={'sm'}
                            className={poId === null ? 'disabled-input' : ''}
                          />

                          <FieldSelect
                            key={`customer_Bank_${resetKey}`}
                            label={'Customer Bank'}
                            name={'customer_bank_id'}
                            required={'Customer Bank is required'}
                            placeholder="Select Bank"
                            selectProps={{
                              isLoading: customerDetailsLoading,
                            }}
                            options={[
                              ...(cutsomerBankOptions ?? []),
                              {
                                value: 'add_new',
                                label: (
                                  <Text
                                    color={'brand.500'}
                                    textDecoration={'underline'}
                                  >
                                    + Add New
                                  </Text>
                                ),
                              },
                            ]}
                            onValueChange={(value) => {
                              console.log(value);
                              if (value === 'add_new') {
                                onCustBankAddOpen();
                              }
                            }}
                            isDisabled={poId === null}
                            size={'sm'}
                            className={poId === null ? 'disabled-input' : ''}
                          />
                        </Stack>
                        <Stack
                          spacing={4}
                          direction={{ base: 'column', md: 'row' }}
                          mb={4}
                        >
                          <FieldDayPicker
                            label={'Due Date'}
                            name={'due_date'}
                            placeholder="Select Due Date"
                            required={'Due Date is required'}
                            dayPickerProps={{
                              inputProps: {
                                isDisabled: poId === null,
                              },
                            }}
                            size={'sm'}
                          />

                          <FieldUpload
                            label="Invoice File"
                            name="file"
                            placeholder="Upload Invoice File"
                            isDisabled={poId === null}
                            size={'sm'}
                            required={'Invoice file is required'}
                            inputProps={{
                              id: 'fileUpload',
                            }}
                            reset={resetField}
                          />

                          <FieldInput
                            label={'Remarks'}
                            name={`remarks`}
                            type="text"
                            placeholder={'Remarks'}
                            isDisabled={poId === null}
                            size={'sm'}
                          />
                        </Stack>
                        <Stack
                          direction={{ base: 'column', md: 'row' }}
                          justify={'center'}
                          alignItems={'center'}
                          display={'flex'}
                        >
                          <Button
                            leftIcon={<LuPlus />}
                            type="submit"
                            colorScheme="brand"
                            isDisabled={
                              poId === null || createProformaInvoice.isLoading
                            }
                            isLoading={createProformaInvoice.isLoading}
                            size={'sm'}
                          >
                            Add Proforma Invoice
                          </Button>
                        </Stack>
                      </Box>
                    </Formiz>

                    <TableContainer
                      rounded={'md'}
                      overflow={'auto'}
                      border="1px"
                      borderColor="gray.500"
                      borderRadius="md"
                      boxShadow="md"
                      mt={3}
                    >
                      <LoadingOverlay isLoading={proformaInvocesbyOrderIdLoading}>
                        <Table variant="striped" size={'sm'}>
                          <Thead bg={'#0C2556'}>
                            <Tr>
                              <Th color={'white'}>S.No.</Th>
                              <Th color={'white'}>Invoice No</Th>
                              <Th color={'white'}>Invoice Date</Th>
                              <Th color={'white'}>Invoice Amt</Th>
                              <Th color={'white'}>Due Date</Th>
                              <Th color={'white'}>Payment Term</Th>
                              <Th color={'white'}>Narration</Th>
                              <Th color={'white'}> Inv File</Th>
                              <Th color={'white'} isNumeric>
                                Action
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {/* || proformaInvocesbyOrderId?.data?.length === 0 */}
                            {(proformaInvocesbyOrderId === undefined || (proformaInvocesbyOrderId?.data && proformaInvocesbyOrderId?.data.length === 0) ||
                              proformaInvocesbyOrderId?.data === undefined ||
                              proformaInvocesbyOrderId?.data === null) && (
                              <Tr>
                                <Td colSpan={9} textAlign={'center'}>
                                  No Invoices Added
                                </Td>
                              </Tr>
                            )}
                            {proformaInvocesbyOrderId?.data &&
                              proformaInvocesbyOrderId?.data.length > 0 &&
                              proformaInvocesbyOrderId?.data.map((item, index) => (
                                <Tr key={index}>
                                  <Td> {index + 1} </Td>
                                  <Td> {item.invoice_number} </Td>
                                  <Td>
                                    {dayjs(item.invoice_date).format(
                                      'DD-MMM-YYYY'
                                    )}
                                  </Td>
                                  <Td>
                                    {poCurrency?.code} {item.invoice_amount}{' '}
                                  </Td>
                                  <Td>
                                    {dayjs(item.due_date).format('DD-MMM-YYYY')}
                                  </Td>
                                  <Td>
                                    {paymentTermsList.data?.items[
                                      item.payment_term_id ?? 0
                                    ] || 'N/A'}
                                  </Td>
                                  <Td> {item?.narration ?? ' - '} </Td>
                                  <Td>
                                    <DocumentDownloadButton
                                      size={'sm'}
                                      url={item.file || ''}
                                    />
                                  </Td>
                                  <Td isNumeric>
                                    <IconButton
                                      aria-label="View Popup"
                                      colorScheme="green"
                                      size={'sm'}
                                      icon={<HiEye />}
                                      onClick={() => showProformaPreview(item)}
                                      mr={2}
                                    />
                                  </Td>
                                </Tr>
                              ))}
                          </Tbody>
                        </Table>
                      </LoadingOverlay>
                    </TableContainer>
                  </Box>
                </TabPanel>

                <TabPanel p={0}>
                  <Box
                    bg={'white'}
                    borderRadius={'md'}
                    boxShadow={'md'}
                    borderWidth={1}
                    borderColor={'gray.200'}
                    borderTopRightRadius={0}
                    borderTopLeftRadius={0}
                    p={4}
                  >
                    <Formiz autoForm connect={invoiceForm}>
                      <Box
                        bg={'white'}
                        borderRadius={'md'}
                        boxShadow={'md'}
                        borderWidth={1}
                        borderColor={'gray.200'}
                        p={4}
                      >
                        <Stack
                          spacing={4}
                          direction={{ base: 'column', md: 'row' }}
                          mb={4}
                        >
                          <FieldDayPicker
                            label={'Pay. Date'}
                            name={'payment_done_date'}
                            placeholder="Select Payment Date"
                            required={'Payment Date is required'}
                            size={'sm'}
                            dayPickerProps={{
                              inputProps: {
                                isDisabled: poId === null,
                              },
                            }}
                          />

                          <FieldInput
                            label="Payment By"
                            name="payment_done_by"
                            placeholder="Payment By"
                            size={'sm'}
                            type="text"
                            required={'Payment By is required'}
                            isDisabled={poId === null}
                            className={poId === null ? 'disabled-input' : ''}
                          />

                          <FieldSelect
                            key={`payment_term_id_${resetKey}`}
                            label={'Pay. Term'}
                            name={'payment_term_id'}
                            required={'Payment Term is required'}
                            placeholder="Select Term"
                            options={paymentTermsOptions}
                            isDisabled={poId === null}
                            defaultValue={'2'}
                            size={'sm'}
                            className={poId === null ? 'disabled-input' : ''}
                          />

                          <FieldInput
                            label="Invoice Amt"
                            name="invoice_amount"
                            placeholder="Inv. Amount"
                            size={'sm'}
                            type="decimal"
                            required={'Invoice Amount is required'}
                            isDisabled={poId === null}
                          />

                          <FieldSelect
                            key={`currency_${resetKey}`}
                            label={'Currency'}
                            name={'currency_id'}
                            size="sm"
                            required={'Currency is required'}
                            options={currencyOptions}
                            isDisabled={poId === null}
                            defaultValue={
                              poCurrency ? poCurrency?.id.toString() : '1'
                            }
                            className={poId === null ? 'disabled-input' : ''}
                          />
                        </Stack>
                        <Stack
                          spacing={4}
                          direction={{ base: 'column', md: 'row' }}
                          mb={4}
                        >
                          <FieldSelect
                            key={`customer_Bank_${resetKey}`}
                            label={'Customer Bank'}
                            name={'customer_bank_id'}
                            required={'Customer Bank is required'}
                            placeholder="Select Bank"
                            selectProps={{
                              isLoading: customerDetailsLoading,
                            }}
                            options={[
                              ...(cutsomerBankOptions ?? []),
                              {
                                value: 'add_new',
                                label: (
                                  <Text
                                    color={'brand.500'}
                                    textDecoration={'underline'}
                                  >
                                    + Add New
                                  </Text>
                                ),
                              },
                            ]}
                            onValueChange={(value) => {
                              console.log(value);
                              if (value === 'add_new') {
                                onCustBankAddOpen();
                              }
                            }}
                            isDisabled={poId === null}
                            size={'sm'}
                            className={poId === null ? 'disabled-input' : ''}
                          />

                          <FieldInput
                            label="Tax Inv No"
                            name="tax_invoice_no"
                            placeholder="Tax Inv No"
                            size={'sm'}
                            type="text"
                            required={'Tax Inv No is required'}
                            isDisabled={poId === null}
                            className={poId === null ? 'disabled-input' : ''}
                          />

                          <FieldDayPicker
                            label={'Tax Inv Date'}
                            name={'tax_invoice_date'}
                            placeholder="Select Tax Inv Date"
                            required={'Tax Inv Date is required'}
                            dayPickerProps={{
                              inputProps: {
                                isDisabled: poId === null,
                              },
                            }}
                            size={'sm'}
                          />

                          <FieldUpload
                            label="Invoice File"
                            name="file"
                            placeholder="Upload Invoice File"
                            isDisabled={poId === null}
                            size={'sm'}
                            required={'Invoice file is required'}
                            inputProps={{
                              id: 'fileUpload',
                            }}
                            reset={resetField}
                          />

                          <FieldInput
                            label={
                              selectedTab === 'tab2' ? 'Remarks' : 'Narration'
                            }
                            name={`narration`}
                            type="text"
                            placeholder={
                              selectedTab === 'tab2' ? 'Remarks' : 'Narration'
                            }
                            isDisabled={poId === null}
                            size={'sm'}
                          />
                        </Stack>
                        <Stack
                          direction={{ base: 'column', md: 'row' }}
                          justify={'center'}
                          alignItems={'center'}
                          display={'flex'}
                        >
                          <Button
                            leftIcon={<LuPlus />}
                            type="submit"
                            colorScheme="brand"
                            isDisabled={
                              poId === null || createInvoice.isLoading
                            }
                            isLoading={createInvoice.isLoading}
                            size={'sm'}
                          >
                            Add Invoice
                          </Button>
                        </Stack>
                      </Box>
                    </Formiz>

                    <TableContainer
                      rounded={'md'}
                      overflow={'auto'}
                      border="1px"
                      borderColor="gray.500"
                      borderRadius="md"
                      boxShadow="md"
                      mt={3}
                    >
                      <LoadingOverlay isLoading={invocesbyOrderIdLoading}>
                        <Table variant="striped" size={'sm'}>
                          <Thead bg={'#0C2556'}>
                            <Tr>
                              <Th color={'white'}>S.No.</Th>
                              <Th color={'white'}>Inv. No</Th>
                              <Th color={'white'}>Pay. Date</Th>
                              <Th color={'white'}>Pay. By</Th>
                              <Th color={'white'}>Tax.Inv.No</Th>
                              <Th color={'white'}>Invoice Amt</Th>
                              <Th color={'white'}>Tax Inv Date</Th>
                              <Th color={'white'}>Payment Term</Th>
                              <Th color={'white'}>Remarks</Th>
                              <Th color={'white'}>Inv File</Th>
                              <Th color={'white'} isNumeric>
                                Action
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {/* || proformaInvocesbyOrderId?.data?.length === 0 */}
                            {(invocesbyOrderId === undefined || (invocesbyOrderId?.data && invocesbyOrderId?.data.length === 0) ||
                              invocesbyOrderId?.data === undefined ||
                              invocesbyOrderId?.data === null) && (
                              <Tr>
                                <Td colSpan={11} textAlign={'center'}>
                                  No Invoices Added
                                </Td>
                              </Tr>
                            )}
                            {invocesbyOrderId?.data &&
                              invocesbyOrderId?.data.length > 0 &&
                              invocesbyOrderId?.data.map((item, index) => (
                                <Tr key={index}>
                                  <Td> {index + 1} </Td>
                                  <Td> {item.inv_entry_no} </Td>
                                  <Td>
                                    {dayjs(item.payment_done_date).format(
                                      'DD-MMM-YYYY'
                                    )}
                                  </Td>
                                  <Td> {item.payment_done_by} </Td>
                                  <Td> {item.tax_invoice_no} </Td>
                                  <Td>
                                    <CurrencyDisplay
                                      currencyId={
                                        item.currency_id.toString() ?? ''
                                      }
                                    />
                                    {item.invoice_amount}
                                  </Td>
                                  <Td>
                                    {dayjs(item.tax_invoice_date).format(
                                      'DD-MMM-YYYY'
                                    )}
                                  </Td>

                                  <Td>
                                    {paymentTermsList.data?.items[
                                      item.payment_term_id ?? 0
                                    ] || 'N/A'}
                                  </Td>
                                  <Td> {item?.remarks ?? ' - '} </Td>
                                  <Td>
                                    <DocumentDownloadButton
                                      size={'sm'}
                                      url={item.file || ''}
                                    />
                                  </Td>

                                  <Td isNumeric>
                                    <IconButton
                                      aria-label="View Popup"
                                      colorScheme="green"
                                      size={'sm'}
                                      icon={<HiEye />}
                                      onClick={() => showInvoicePreview(item)}
                                      mr={2}
                                    />
                                  </Td>
                                </Tr>
                              ))}
                          </Tbody>
                        </Table>
                      </LoadingOverlay>
                    </TableContainer>
                  </Box>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Stack>

          <BankModal
            isOpen={isCustBankAddOpen}
            // onClose={() => {
            //   onCustBankAddClose();
            //   setResetKey((prevKey) => prevKey + 1);
            // }}
            onClose={handleCloseBankModal}
            customerId={customerId ?? 0}
          />

          <ProformaInvoicePreview
            isOpen={isPreviewProforma}
            onClose={handleCloseModal}
            data={previewData}
          ></ProformaInvoicePreview>

          <InvoicePreview
            isOpen={isPreviewInvoice}
            onClose={handleCloseModal}
            data={previewData}
          ></InvoicePreview>
        </Stack>
      </Stack>
    </SlideIn>
  );
};
