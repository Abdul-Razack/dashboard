import React, { useEffect, useState } from 'react';

import {
  Button,
  Center,
  HStack,
  Heading,
  Stack,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { format } from 'date-fns';

import CurrencyDisplay from '@/components/CurrencyDisplay';
import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldUpload } from '@/components/FieldUpload';
import LoadingOverlay from '@/components/LoadingOverlay';
import { BankModal } from '@/components/Modals/CustomerMaster/Bank';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { formatDate, transformToSelectOptions } from '@/helpers/commonHelper';
import { useGetInvoiceListByOrderID } from '@/services/finance/invoice/services';
import { useGetProformaInvoiceListByOrderID } from '@/services/finance/proforma-invoice/services';
import {
  useCreateReceiptEntry,
  useGetTotalAmount,
} from '@/services/finance/receipt-entry/services';
import {
  useLogisticOrderDetails,
  useLogisticOrderList,
} from '@/services/logistics/order/services';
import { useBankDetails } from '@/services/master/bank/services';
import {
  useCustomerDetails,
  useCustomerList,
} from '@/services/master/services';
import {
  usePurchaseOrderDetails,
  usePurchaseOrderList,
} from '@/services/purchase/purchase-orders/services';
import { useBankList } from '@/services/submaster/bank/services';
import { usePaymentModeList } from '@/services/submaster/paymentmode/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';

interface FormData {
  customer_bank_id: number;
  payment_mode_id: number;
  invoice_id: number | null;
  performa_invoice_id: number | null;
}

type useCreateReceiptEntryBody = {
  type: string;
  refer_type: string;
  customer_bank_id: number;
  payment_mode_id: number;
  invoice_id: number | null;
  performa_invoice_id: number | null;
  bank_receipt_number: string;
  payment_value: number;
  payment_receipt_file: string;
  payment_date: string;
  bank_id: number;
};

export const ReceiptEntryCreate = () => {
  const {
    isOpen: isCustBankAddOpen,
    onOpen: onCustBankAddOpen,
    onClose: onCustBankAddClose,
  } = useDisclosure();

  const createSelectOptions = (data: any) => {
    if (!Array.isArray(data) || data.length === 0) {
      //console.warn("Invalid or empty data");
      return [];
    }

    return data.map((item) => ({
      label: item?.invoice_number,
      value: item?.id,
    }));
  };

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const [formKey, setFormKey] = useState(0);

  const form = useForm({});
  // Initial form data
  const initialFormData: FormData = {
    customer_bank_id: 0,
    payment_mode_id: 0,
    invoice_id: 0,
    performa_invoice_id: null,
  };

  const [resetKey, setResetKey] = useState(0);
  const [entryType, setEntryType] = useState<String>('');
  const [invoiceType, setInvoiceType] = useState<String>('');
  const [invoiceNo, setInvoiceNo] = useState<Number>(0);

  const [referType, setReferType] = useState<String>('');

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [poId, setPOId] = useState<number>(0);
  const [loId, setLOId] = useState<number>(0);

  const itemForm = useForm({
    onValidSubmit: (values) => {
      const payload: useCreateReceiptEntryBody = {
        type: String(entryType),
        refer_type: String(referType),

        customer_bank_id: Number(formData?.customer_bank_id),
        payment_mode_id: Number(formData?.payment_mode_id),
        invoice_id: Number(formData?.invoice_id),
        performa_invoice_id: Number(formData?.performa_invoice_id),

        bank_receipt_number: String(values?.bank_receipt_number),
        payment_value: Number(values?.payment_value),
        payment_receipt_file: String(values?.payment_receipt_file),
        payment_date: formatDate(String(values?.payment_date)) ?? '',
        bank_id: Number(values?.payment_bank_name),
      };
      createReceiptEntry.mutate(payload);
    },
  });

  const createReceiptEntry = useCreateReceiptEntry({
    onSuccess: () => {
      handleRemarksChange('');
      setFormData(initialFormData);
      setFormKey((prevKey) => prevKey + 1);
      itemForm.reset();
      toastSuccess({
        title: `Receipt Entry Created`,
      });
    },
    onError: (error) => {
      toastError({
        title: 'Receipt Entry Creation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });

  let customOptions = {
    items: {
      debit: 'Account Payable',
      credit: 'Account Receivable',
    },
    status: true,
  };

  let customOptions1 = {
    items: {
      po: 'Purchase',
      rpo: 'Repair',
      lo: 'Logistics',
    },
    status: true,
  };

  let customOptions2 = {
    items: {
      so: 'Sales',
      ro: 'Return Order',
    },
    status: true,
  };

  let customOptions3 = {
    items: {
      proforma: 'Proforma',
      tax: 'Tax Invoice',
    },
    status: true,
  };

  const [customerId, setCustomerId] = useState<number | null>(null);

  const purchaseOrderListData = usePurchaseOrderList({
    customer_id: customerId || 0,
  });
  const logesticOrderListData = useLogisticOrderList({
    customer_id: customerId || 0,
  }); //, {enabled: customerId !== null}

  const { data: poDetails } = usePurchaseOrderDetails(Number(poId));
  const { data: loDetails } = useLogisticOrderDetails(Number(loId));

  const ProformaInvoiceData = useGetProformaInvoiceListByOrderID({
    purchase_order_id: poId,
  });
  const proformaInvoiceInfo = ProformaInvoiceData?.data?.data;

  const taxInvoiceData = useGetInvoiceListByOrderID({
    purchase_order_id: poId,
  });
  const taxInvoiceInfo = taxInvoiceData?.data?.data;

  const { data: bankDetails } =
    invoiceType === 'tax'
      ? useBankDetails(
          Number(
            taxInvoiceInfo?.find((invoice) => invoice.id == invoiceNo)
              ?.customer_bank_id || 0
          )
        )
      : useBankDetails(
          Number(
            proformaInvoiceInfo?.find((invoice) => invoice.id == invoiceNo)
              ?.customer_bank_id || 0
          )
        );

  const proformaInvoiceNoOptions = createSelectOptions(proformaInvoiceInfo);
  const invoiceNoOptions = createSelectOptions(taxInvoiceInfo);

  const totalAmountData =
    invoiceType === 'tax'
      ? useGetTotalAmount({
          invoice_id: taxInvoiceInfo?.find((invoice) => invoice.id == invoiceNo)
            ?.id,
        })
      : useGetTotalAmount({
          proforma_invoice_id: proformaInvoiceInfo?.find(
            (invoice) => invoice.id == invoiceNo
          )?.id,
        });

  const totalAmountInfo = totalAmountData?.data;
  const bankCustomerInfo = bankDetails?.customer;

  const customerData =
    invoiceType === 'proforma'
      ? useCustomerDetails(
          Number(
            proformaInvoiceInfo?.find((invoice) => invoice.id == invoiceNo)
              ?.customer_bank_id || 0
          )
        )
      : useCustomerDetails(
          Number(
            taxInvoiceInfo?.find((invoice) => invoice.id == invoiceNo)
              ?.customer_bank_id || 0
          )
        );

  const customerInfo = customerData?.data;

  const customerList = useCustomerList({
    type: referType === 'lo' ? 'freight' : 'suppliers',
  });
  const bankList = useBankList();

  const entryTypeOptions = transformToSelectOptions(customOptions);
  const payableOptions = transformToSelectOptions(customOptions1);
  const receivableOptions = transformToSelectOptions(customOptions2);
  const invoiceTypeOptions = transformToSelectOptions(customOptions3);
  const poListOptions = transformToSelectOptions(purchaseOrderListData?.data);
  const loListOptions = transformToSelectOptions(logesticOrderListData?.data);
  const vendorOptions = transformToSelectOptions(customerList?.data);
  const bankListOptions = transformToSelectOptions(bankList?.data);

  const paymentTermList = usePaymentTermsList();
  const paymentModeList = usePaymentModeList();

  // Data handleing
  const handleRemarksChange = (newValue: string) => {
    itemForm.setValues({ [`remarks`]: newValue });
  };

  useEffect(() => {
    if (bankCustomerInfo && (proformaInvoiceInfo || taxInvoiceInfo)) {
      const commonInvoiceType =
        invoiceType === 'proforma'
          ? proformaInvoiceInfo?.find((invoice) => invoice.id === invoiceNo)
          : taxInvoiceInfo?.find((invoice) => invoice.id === invoiceNo);

      setFormData({
        customer_bank_id: commonInvoiceType?.customer_bank_id ?? 0,
        payment_mode_id: bankCustomerInfo?.payment_mode_id ?? 0,
        invoice_id: invoiceType === 'proforma' ? 0 : commonInvoiceType?.id ?? 0,
        performa_invoice_id:
          invoiceType === 'proforma' ? commonInvoiceType?.id ?? 0 : 0,
      });
    }
  }, [
    bankCustomerInfo,
    proformaInvoiceInfo,
    taxInvoiceInfo,
    invoiceType,
    invoiceNo,
  ]);

  const [bankAddDetails, setBankAddDetails] = useState(
    'Bank Name: -</br>Account Name: -</br>IBAN No: -</br>SWIFT CODE: -'
  );

  useEffect(() => {
    if (bankDetails) {
      const formattedDetails = `
        Bank Name: ${bankDetails?.bank_name || '-'}</br>
        Account Name: ${bankDetails?.beneficiary_name || '-'}</br>
        IBAN No: ${bankDetails?.bank_ac_iban_no || '-'}</br>
        SWIFT CODE: ${bankDetails?.bank_swift || '-'}</br>
        `;
      setBankAddDetails(formattedDetails);
    }
  }, [bankDetails]);

  useEffect(() => {
    if (poDetails?.data) {
      setCustomerId(poDetails.data.customer_id);
    }
  }, [poDetails]);

  useEffect(() => {
    if (!isCustBankAddOpen && customerId !== 0 && customerId !== null) {
      customerDetailsRefetch();
    }
  }, [isCustBankAddOpen]);

  const {
    data: customerDetails,
    isLoading: customerDetailsLoading,
    refetch: customerDetailsRefetch,
  } = useCustomerDetails(customerId ? customerId : '', {
    enabled: customerId !== null && customerId !== 0,
  });

  const [cutsomerBankOptions, setBanks] = useState<TODO>([]);
  const [bankId, setBankId] = useState('');

  useEffect(() => {
    if (customerDetails) {
      let bankOptions: any = [];
      customerDetails?.data?.customer_banks?.forEach((item: any) => {
        let object: any = {};
        object.value = item.id.toString();
        object.label = item.bank_name;
        bankOptions.push(object);
      });
      setBankId(bankOptions[0].value);
      setBanks(bankOptions);
    }
  }, [customerDetails]);

  useEffect(() => {
    if (!customerDetails?.data?.customer_banks || !bankId) return;

    const selectedBank = customerDetails.data.customer_banks.find(
      (bank) => bank?.id === Number(bankId)
    );

    const formattedDetails = `
        Bank Name: ${selectedBank?.bank_name || '-'} </br>
        Account Name: ${selectedBank?.beneficiary_name || '-'} </br>
        IBAN No: ${selectedBank?.bank_ac_iban_no || '-'} </br>
        SWIFT CODE: ${selectedBank?.bank_swift || '-'} </br>
    `;

    setBankAddDetails(formattedDetails);
  }, [bankId, customerDetails?.data?.customer_banks]);

  const handleCloseBankModal = (status: boolean, id: any) => {
    
    setResetKey((prevKey) => prevKey + 1);
    if (status === true) {
      setTimeout(() => {
        form.setValues({ 'customer_bank_id' : id.toString() });
        if (id) {
          customerData.refetch();
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
      <Stack pl={2} spacing={2}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Heading as="h4" size={'md'}>
              Payment receipt Entry
            </Heading>
          </Stack>
        </HStack>
        <Stack spacing={2} borderRadius={'md'} boxShadow={'md'} mt={'1rem'}>
          <Formiz autoForm connect={form}>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              display={{ base: 'inherit', md: 'flex' }}
              bg={'white'}
              p={6}
              borderRadius={4}
              spacing={4}
              align={'flex-start'}
              justify={'flex-start'}
            >
              <FieldSelect
                label="Type Of Entry"
                name={'entry_type'}
                placeholder="Select..."
                options={entryTypeOptions}
                required={'Type is required'}
                onValueChange={(value) => {
                  setEntryType(String(value));
                }}
                size={'sm'}
              />
              <FieldSelect
                key={entryType === 'debit' ? 'Payable' : 'Receivable'}
                label={entryType === 'debit' ? 'Payable' : 'Receivable'}
                name={entryType === 'debit' ? 'payable' : 'receivable'}
                placeholder="Select..."
                options={
                  entryType === 'debit' ? payableOptions : receivableOptions
                }
                required={`${entryType === 'debit' ? 'payable' : 'receivable'} is required`}
                onValueChange={(value) => {
                  setReferType(String(value));
                }}
                size={'sm'}
                isDisabled={entryType === '' ? true : false}
              />
            </Stack>
          </Formiz>
        </Stack>
        {entryType && referType && (
          <Stack
            spacing={2}
            p={4}
            bg={'white'}
            borderRadius={'md'}
            boxShadow={'md'}
            mt="2rem"
          >
            {/* Form Start */}
            <Stack>
              <Formiz autoForm connect={itemForm}>
                <LoadingOverlay
                  isLoading={
                    !(
                      (entryType && referType && referType === 'po') ||
                      referType === 'lo'
                    )
                  }
                >
                  {referType === 'po' || referType === 'lo' ? (
                    <React.Fragment>
                      {referType === 'po' ? (
                        <Stack
                          spacing={4}
                          direction={{ base: 'column', md: 'row' }}
                          mt={'1rem'}
                          alignItems={'start'}
                        >
                          <FieldSelect
                            label="PO List"
                            name={'po_id'}
                            placeholder="Select..."
                            options={poListOptions}
                            required={'PO Id is required'}
                            onValueChange={(value) => {
                              setPOId(Number(value));
                            }}
                            isClearable={true}
                            size="sm"
                          />
                          <FieldSelect
                            key={`${poDetails?.data?.customer_id}_vendor_name`}
                            label="Vendor Name"
                            name="vendor_name"
                            placeholder="Select..."
                            options={vendorOptions}
                            required="Vendor Name is required"
                            onValueChange={(value) =>
                              setCustomerId(Number(value))
                            }
                            defaultValue={
                              vendorOptions.find(
                                (vendor) =>
                                  vendor.value == poDetails?.data?.customer_id
                              )?.value
                            }
                            isClearable={true}
                            size="sm"
                          />
                          {/* {
                                                        poDetails?.data?.customer_id && poDetails?.data?.customer_id !== 0 ? (
                                                            <FieldDisplay
                                                                label="Vendor Name"
                                                                value={vendorOptions.find(vendor => vendor.value == poDetails?.data?.customer_id)?.label || 'N/A'}
                                                            />
                                                        ) : (
                                                            <FieldSelect
                                                                label="Vendor Name"
                                                                name="vendor_name"
                                                                placeholder="Select..."
                                                                options={vendorOptions}
                                                                required="Vendor Name is required"
                                                                onValueChange={(value) => setVendorId(Number(value))}
                                                                defaultValue={poDetails?.data?.customer_id}
                                                            />
                                                        )
                                                    } */}
                        </Stack>
                      ) : (
                        <Stack
                          spacing={4}
                          direction={{ base: 'column', md: 'row' }}
                          mt={'1rem'}
                          alignItems={'start'}
                        >
                          <FieldSelect
                            label="LO List"
                            name={'lo_id'}
                            placeholder="Select..."
                            options={loListOptions}
                            required={'LO Id is required'}
                            onValueChange={(value) => {
                              setLOId(Number(value));
                            }}
                            defaultValue={loId}
                            isClearable={true}
                            size="sm"
                          />
                          <FieldSelect
                            key={`${loDetails?.data?.logistic_order?.logistic_quotation?.customer_id}_vendor_name`}
                            label="Vendor Name"
                            name="vendor_name"
                            placeholder="Select..."
                            options={vendorOptions}
                            required="Vendor Name is required"
                            onValueChange={(value) =>
                              setCustomerId(Number(value))
                            }
                            defaultValue={
                              vendorOptions.find(
                                (vendor) =>
                                  vendor.value ==
                                  loDetails?.data?.logistic_order
                                    ?.logistic_quotation?.customer_id
                              )?.value
                            }
                            isClearable={true}
                            size="sm"
                          />
                        </Stack>
                      )}
                      <Stack
                        spacing={4}
                        direction={{ base: 'column', md: 'row' }}
                        mt={'1rem'}
                        alignItems={'start'}
                      >
                        <FieldSelect
                          label="Invoice Type"
                          name={'invoice_type'}
                          placeholder="Select..."
                          options={invoiceTypeOptions}
                          required={'Invoice Type is required'}
                          onValueChange={(value) => {
                            setInvoiceType(String(value));
                          }}
                          isClearable={true}
                          size="sm"
                        />
                        <FieldSelect
                          label={`${invoiceType === 'proforma' ? 'Proforma' : 'Tax'} Invoice No`}
                          name={'invoice_no'}
                          placeholder="Select..."
                          options={
                            invoiceType === 'proforma'
                              ? proformaInvoiceNoOptions
                              : invoiceNoOptions
                          }
                          required={'Invoice No is required'}
                          defaultValue={invoiceNo}
                          onValueChange={(value) => {
                            setInvoiceNo(Number(value));
                          }}
                          isClearable={true}
                          size="sm"
                        />
                      </Stack>
                      <Stack
                        spacing={4}
                        direction={{ base: 'column', md: 'row' }}
                        mt={'1rem'}
                        alignItems={'start'}
                      >
                        <FieldInput
                          key={`${poDetails?.data?.total_price}_po_value`}
                          label={'PO value'}
                          name={'po_value'}
                          leftElement={
                            <CurrencyDisplay
                              currencyId={
                                poDetails?.data?.currency_id.toString() ?? ''
                              }
                            />
                          }
                          type="number"
                          defaultValue={poDetails?.data?.total_price || 0}
                          isDisabled={true}
                          size="sm"
                        />
                        <FieldInput
                          key={`${poDetails?.data?.created_at}_po_date`}
                          label={'PO Date'}
                          name={'po_date'}
                          type="text"
                          defaultValue={
                            poDetails?.data?.created_at
                              ? format(
                                  new Date(poDetails?.data?.created_at),
                                  'yyyy-MM-dd'
                                )
                              : ''
                          }
                          isDisabled={true}
                          size="sm"
                        />

                        <FieldInput
                          key={`${invoiceNo}_profor_value`}
                          label={`${invoiceType === 'proforma' ? 'Proforma' : 'Tax'} Invoice Amount`}
                          name={'po_value'}
                          leftElement={
                            <CurrencyDisplay
                              currencyId={
                                poDetails?.data?.currency_id.toString() ?? ''
                              }
                            />
                          }
                          type="number"
                          defaultValue={
                            invoiceType === 'proforma'
                              ? proformaInvoiceInfo?.find(
                                  (invoice) => invoice.id == invoiceNo
                                )?.invoice_amount || 'N/A'
                              : taxInvoiceInfo?.find(
                                  (invoice) => invoice.id == invoiceNo
                                )?.invoice_amount || 'N/A'
                          }
                          isDisabled={true}
                          size="sm"
                        />
                        <FieldInput
                          key={`${formKey}_payment_done_against_po`}
                          label={`Tot Pay. done against the ${referType === 'po' ? 'PO' : 'LO'}`}
                          name={'payment_done_against_po'}
                          leftElement={
                            <CurrencyDisplay
                              currencyId={
                                poDetails?.data?.currency_id.toString() ?? ''
                              }
                            />
                          }
                          type="number"
                          defaultValue={totalAmountInfo?.total_amount ?? 0}
                          isDisabled={true}
                          size="sm"
                        />
                        <FieldDisplay
                          label="Payment Terms"
                          value={
                            paymentTermList.data?.items[
                              poDetails?.data?.payment_term_id || 0
                            ] || 'N/A'
                          }
                          size="sm"
                        />
                      </Stack>
                      <Stack
                        spacing={4}
                        direction={{ base: 'column', md: 'row' }}
                        mt={'1rem'}
                        alignItems={'start'}
                      >
                        <FieldSelect
                          key={`customer_Bank_${bankId}_${resetKey}`}
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
                            if (value === 'add_new') {
                              onCustBankAddOpen();
                            }
                            setBankId(value);
                          }}
                          isDisabled={poId === null}
                          size={'sm'}
                          className={poId === null ? 'disabled-input' : ''}
                          defaultValue={bankId}
                        />
                        <FieldDisplay
                          key={`bankdetails_${resetKey}`}
                          label={'Vendor Bank Details'}
                          value={bankAddDetails}
                          size="sm"
                          isHtml={true}
                          // display={'none'}
                        />
                        <FieldDisplay
                          label="Mode of payment"
                          value={
                            bankCustomerInfo
                              ? paymentModeList?.data?.items?.[
                                  bankCustomerInfo?.payment_mode_id ?? 0
                                ] ?? 'N/A'
                              : 'N/A'
                          }
                          size="sm"
                        />
                        <FieldDisplay
                          label="Total Credit Limit"
                          value={customerInfo?.available_credit_limit || 'N/A'}
                          size="sm"
                        />
                        <FieldDisplay
                          label="Available Credit Limit"
                          value={customerInfo?.total_used_credit || 'N/A'}
                          size="sm"
                        />
                      </Stack>
                      <Stack
                        spacing={4}
                        direction={{ base: 'column', md: 'row' }}
                        marginTop={'2rem'}
                        alignItems={'start'}
                        bg={'blue.100'}
                        padding={'1rem'}
                        borderRadius={'0.5rem'}
                      >
                        <FieldInput
                          key={`bank_receipt_no_${formKey}`}
                          label="Bank Receipt No"
                          name="bank_receipt_number"
                          defaultValue={''}
                          placeholder="Fresh entry 7 numeric value"
                          required="Bank Receipt No is required"
                          type="integer"
                          size="sm"
                          maxLength={7}
                        />
                        <FieldInput
                          key={`payment_value_${formKey}`}
                          label="Payment Value"
                          name="payment_value"
                          defaultValue={''}
                          required="Payment Value is required"
                          type="integer"
                          size="sm"
                        />
                        <FieldSelect
                          key={`payment_bank_name_${formKey}`}
                          label="Payment Bank Name"
                          name={'payment_bank_name'}
                          placeholder="Select..."
                          options={bankListOptions}
                          required={'Payment Bank Name is required'}
                          size="sm"
                        />
                        <FieldDayPicker
                          key={`payment_date_${formKey}`}
                          name="payment_date"
                          label="Payment Date"
                          placeholder="Select Payment Date"
                          borderColor={'gray.200'}
                          size={'sm'}
                          required={'Payment Date is required'}
                        />
                        <FieldUpload
                          key={`payment_receipt_file_${formKey}`}
                          label={'Upload payment receipt'}
                          name={'payment_receipt_file'}
                          placeholder="Upload"
                          required={'Upload payment receipt is required'}
                          size="sm"
                        />
                      </Stack>
                      {/* Button action */}
                      <HStack justifyContent={'center'} mt={2}>
                        <HStack spacing={2} align="center" marginTop={'1rem'}>
                          <Button colorScheme="brand" type="submit">
                            Save
                          </Button>
                          <Button
                            colorScheme="green"
                            onClick={() => {
                              itemForm.reset(), setFormData(initialFormData);
                            }}
                          >
                            Preview
                          </Button>
                        </HStack>
                      </HStack>
                    </React.Fragment>
                  ) : (
                    <Center>
                      <Text>This options page is coming soon. Stay tuned!</Text>
                    </Center>
                  )}
                </LoadingOverlay>
              </Formiz>
            </Stack>
            {/* End */}
          </Stack>
        )}
      </Stack>

      <BankModal
        isOpen={isCustBankAddOpen}
        // onClose={() => {
        //   onCustBankAddClose();
        //   setResetKey((prevKey) => prevKey + 1);
        // }}
        onClose={handleCloseBankModal}
        customerId={customerId ?? 0}
        isView={false}
      />
    </SlideIn>
  );
};

export default ReceiptEntryCreate;
