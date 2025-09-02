import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
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
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { formatDate } from '@/helpers/commonHelper';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiOutlinePlus } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useCustomerDetails } from '@/services/master/services';
import { useUpdateProformaInvoice } from '@/services/finance/proforma-invoice/services';
import { useProformaInvoiceDetails } from '@/services/finance/proforma-invoice/services';
import {
  usePurchaseOrderDetails,
  usePurchaseOrderList,
} from '@/services/purchase/purchase-orders/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';
import { transformToSelectOptions } from '@/helpers/commonHelper';

export const ProformaInvoiceUpdate = () => {
  let { id } = useParams();
  const [rows, setRows] = useState([{ id: 1, po_value: 0 }]);
  const rowIdCounter = useRef(1);
  const purchaseList = usePurchaseOrderList();

  const purchaseOrderOptions = transformToSelectOptions(purchaseList.data);
  const paymentTermsList = usePaymentTermsList();
  const paymentTermsOptions = transformToSelectOptions(paymentTermsList.data);

  const currencyList = useCurrencyList();
  const currencyOptions = transformToSelectOptions(currencyList.data);

  const { data: details, isSuccess } = useProformaInvoiceDetails(Number(id));

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();

  const addNewRow = () => {
    rowIdCounter.current += 1;
    const newRow = { id: rowIdCounter.current, po_value: 0 };
    setRows((prevRows) => [...prevRows, newRow]);
  };

  const handleRemarksChange = (newValue: string) => {
    form.setValues({ [`remarks`]: newValue });
  };

  const deleteRow = (rowId: number) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };
  const invoiceTypes = [{ value: 'po', label: 'PO' }];

  const [poId, setPoId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const { data: poDetails } = usePurchaseOrderDetails(poId ? poId : '');

  const { data: customerDetails } = useCustomerDetails(
    customerId ? customerId : ''
  );

  const setPoIdDebounced = useRef(
    debounce((value: number) => {
      setPoId(value), 500;
    })
  ).current;

  const handlePoValueChange = (id: number, newPoValue: number) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, po_value: newPoValue } : row
      )
    );
  };

  const poValue = useMemo(() => {
    return rows.reduce((acc, item) => acc + item.po_value, 0);
  }, [rows]);
  // Helper function for date formatting
  

  const updateProformaInvoice = useUpdateProformaInvoice({
    onSuccess: ({ id, message }) => {
      toastSuccess({
        title: 'Proforma Invoice Entry updated successfully - ' + id,
        description: message,
      });
      navigate('/finance/proforma-invoice');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to update Proforma Invoice Entry',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      const payload = {
        id: Number(id),
        due_date: formatDate(values.due_date) as string,
        narration: values.narration ?? '',
        payment_term_id: Number(values.payment_term_id),
        purchase_order_id: Number(poId),
        invoice_date: formatDate(values.invoice_date) as string,
        file: values.file ?? '',
        invoice_amount: values.invoice_amount,
        customer_bank_id: Number(values.customer_bank_id),
        invoice_number: values.invoice_number,
        // items: rows.map((row) => ({
        //   id: row.id,
        //   invoice_number: values[`invoice_number_${row.id}`],
        //   invoice_date: formatDate(values[`invoice_date_${row.id}`]) as string,
        //   invoice_value: Number(values[`invoice_value_${row.id}`]),
        //   due_date: formatDate(values[`due_date_${row.id}`]) as string,
        //   payment_term_id: Number(values[`payment_term_id_${row.id}`]),
        //   narration: values[`narration_${row.id}`],
        // })),
      };
      updateProformaInvoice.mutate(payload);
    },
  });

  const fields = useFormFields({
    connect: form,
  });

  useEffect(() => {
    if (poDetails?.data) {
      setCustomerId(poDetails.data.customer_id);
      rows.forEach((item: any) => {
        form.setValues({
          [`currency_id_${item.id}`]: poDetails?.data?.currency_id.toString(),
        });
      });
    }
  }, [poDetails]);

  useEffect(() => {
    if (isSuccess && details?.data?.items) {
      setPoId(details?.data?.purchase_order_id);
      form.setValues({
        [`type`]: details?.data?.type,
        [`date`]: dayjs(details?.data?.date),
        [`purchase_order_id`]: details?.data?.purchase_order_id.toString(),
        [`remarks`]: details?.data?.remarks,
      });
      const initialRows = details?.data?.items.map((item) => ({
        ...item,
        po_value: item.invoice_value ?? '',
        id: item.id, // Assuming `id` is unique and provided by your API
      }));
      setRows(initialRows);

      details?.data?.items.forEach((item: any) => {
        form.setValues({
          [`invoice_number_${item.id}`]: item.invoice_number,
          [`invoice_date_${item.id}`]: dayjs(item.invoice_date),
          [`currency_id_${item.id}`]: poDetails?.data?.currency_id.toString(),
          [`due_date_${item.id}`]: dayjs(item.due_date),
          [`invoice_value_${item.id}`]: item.invoice_value.toString(),
          [`payment_term_id_${item.id}`]: item.payment_term_id.toString(),
          [`narration_${item.id}`]: item.narration,
        });
      });

      const highestId = Math.max(0, ...initialRows.map((row) => row.id));
      rowIdCounter.current = highestId + 1;
    }
  }, [isSuccess, details]);

  useEffect(() => {
    if (poDetails?.data) {
      rows.forEach((item: any) => {
        form.setValues({
          [`currency_id_${item.id}`]: poDetails?.data?.currency_id.toString(),
        });
      });
    }
  }, [rows]);

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
                <BreadcrumbLink>Update Proforma Invoice Entry</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Update Proforma Invoice Entry
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
          <Formiz autoForm connect={form}>
            <FieldInput name={`remarks`} size={'sm'} sx={{ display: 'none' }} />
            <Stack spacing={2}>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldSelect
                  label={'PRINV Type'}
                  name={'type'}
                  required={'PRINV Type is required'}
                  placeholder="Select PRINV Type"
                  options={invoiceTypes}
                />

                <FieldSelect
                  label={'Purchase Order'}
                  name={'purchase_order_id'}
                  required={'Purchase Order is required'}
                  options={purchaseOrderOptions}
                  placeholder="Select Purchase Order"
                  onValueChange={(value) => {
                    console.log(value);
                    setPoIdDebounced(Number(value));
                  }}
                />

                <FieldDayPicker
                  label={'PIE Date'}
                  name={'date'}
                  placeholder="Select PIE Date"
                  required={'PIE Date is required'}
                />
              </Stack>

              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldDisplay
                  label={'PO Date'}
                  value={
                    poDetails?.data?.created_at
                      ? dayjs(poDetails?.data?.created_at).format('DD-MMM-YYYY')
                      : ' - '
                  }
                  // style={{ backgroundColor: '#fff' }}
                />

                <FieldDisplay
                  label={'PO Value'}
                  value={poValue}
                  // style={{ backgroundColor: '#fff' }}
                />

                <FieldDisplay
                  label={'Vendor Name'}
                  value={
                    customerDetails?.data?.business_name
                      ? customerDetails?.data?.business_name
                      : ' - '
                  }
                  // style={{ backgroundColor: '#fff' }}
                />

                <FieldDisplay
                  label={'Vendor Code'}
                  value={customerDetails?.data?.code ? customerDetails?.data?.code : ' - '}
                  // style={{ backgroundColor: '#fff' }}
                />
              </Stack>

              <TableContainer rounded={'md'} overflow={'auto'} my={4}>
                <Table variant="simple" size={'sm'}>
                  <Thead bg={'gray'}>
                    <Tr>
                      <Th color={'white'}>S.No.</Th>
                      <Th color={'white'}>Invoice No</Th>
                      <Th color={'white'}>Invoice Date</Th>
                      <Th color={'white'}>Invoice Amt</Th>
                      <Th color={'white'}>Currency</Th>
                      <Th color={'white'}>Due Date</Th>
                      <Th color={'white'}>Payment Term</Th>
                      <Th color={'white'}>Narration</Th>
                      <Th color={'white'} isNumeric>
                        Action
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rows.map((row, index) => (
                      <Tr key={row.id}>
                        <Td>
                          <Text fontSize={'medium'}>{index + 1}.</Text>
                        </Td>
                        <Td>
                          <FieldInput
                            size={'sm'}
                            key={`invoice_number_${row.id}`}
                            name={`invoice_number_${row.id}`}
                            placeholder="Inv. No"
                            required={'Invoice No is required'}
                            id={`invoice_number_${row.id}`}
                          />
                        </Td>
                        <Td>
                          <FieldDayPicker
                            size={'sm'}
                            key={`invoice_date_${row.id}`}
                            name={`invoice_date_${row.id}`}
                            placeholder="Inv. Dt"
                            required={'Invoice Date is required'}
                            id={`invoice_date_${row.id}`}
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            size={'sm'}
                            key={`invoice_value_${row.id}`}
                            name={`invoice_value_${row.id}`}
                            placeholder="Inv. Amt"
                            type="decimal"
                            required={'Invoice Amt is required'}
                            id={`invoice_value_${row.id}`}
                            onValueChange={(value) =>
                              handlePoValueChange(row.id, Number(value))
                            }
                          />
                        </Td>
                        <Td>
                          <FieldSelect
                            size={'sm'}
                            key={`currency_id_${row.id}`}
                            name={`currency_id_${row.id}`}
                            required="Currency is required"
                            placeholder="Select"
                            options={currencyOptions}
                            menuPortalTarget={document.body}
                            isDisabled={true}
                            className={'disabled-input'}
                          />
                        </Td>
                        <Td>
                          <FieldDayPicker
                            size={'sm'}
                            key={`due_date_${row.id}`}
                            name={`due_date_${row.id}`}
                            placeholder="Due Date"
                            required={'Due Date is required'}
                            id={`due_date_${row.id}`}
                          />
                        </Td>
                        <Td>
                          <FieldSelect
                            size={'sm'}
                            key={`payment_term_id_${row.id}`}
                            name={`payment_term_id_${row.id}`}
                            required={'Payment Term is required'}
                            placeholder="Select"
                            options={paymentTermsOptions}
                            menuPortalTarget={document.body}
                          />
                        </Td>
                        <Tooltip
                          label={
                            fields && fields[`narration_${row.id}`]
                              ? fields[`narration_${row.id}`].value
                              : ''
                          }
                          aria-label="Username tooltip"
                          placement="top"
                          hasArrow
                          color="white"
                          isDisabled={
                            fields &&
                            fields[`narration_${row.id}`] &&
                            fields[`narration_${row.id}`].value &&
                            fields[`narration_${row.id}`].value.length > 20
                              ? false
                              : true
                          }
                        >
                          <Td>
                            <FieldInput
                              size={'sm'}
                              key={`narration_${row.id}`}
                              id={`narration_${row.id}`}
                              name={`narration_${row.id}`}
                              maxLength={100}
                            />
                          </Td>
                        </Tooltip>
                        <Td isNumeric>
                          {index === rows.length - 1  && (
                            <IconButton
                              aria-label="Add Row"
                              variant="@primary"
                              size={'sm'}
                              icon={<HiOutlinePlus />}
                              onClick={addNewRow}
                              mr={2}
                            />
                          )}

                          <IconButton
                            aria-label="Delete Row"
                            colorScheme="red"
                            size={'sm'}
                            icon={<DeleteIcon />}
                            onClick={() => deleteRow(row.id)}
                            isDisabled={rows.length <= 1}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              <Stack>
                <FormControl>
                  <FormLabel>Remarks</FormLabel>
                  <FieldHTMLEditor
                    defaultValue={
                      details?.data?.remarks ? details?.data?.remarks : ''
                    }
                    onValueChange={handleRemarksChange}
                    maxLength={import.meta.env.VITE_ELABORATE_REMARKS_LENGTH}
                    placeHolder={'Enter Remarks Here'}
                  />
                </FormControl>
              </Stack>
            </Stack>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify={'center'}
              alignItems={'center'}
              display={'flex'}
              mt={4}
            >
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={updateProformaInvoice.isLoading}
              >
                Submit
              </Button>

              <Button onClick={() => navigate(-1)} colorScheme="red">
                Cancel
              </Button>
            </Stack>
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};
