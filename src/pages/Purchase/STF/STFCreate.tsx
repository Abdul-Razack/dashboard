import { useEffect, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
import {
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
  useDisclosure,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiOutlinePlus, HiTrash } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';

import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import { FieldUpload } from '@/components/FieldUpload';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { convertToOptions, filterUOMoptions, formatDate, transformToSelectOptions } from '@/helpers/commonHelper';
import CustomerCreateModal from '@/pages/Master/Customer/CustomerCreateModal';
import ShippingAddressCreateModal from '@/pages/Master/ShippingAddress/ShippingAddressCreateModal';
import { useContactManagerIndex } from '@/services/master/contactmanager/services';
import {
  useCustomerDetails,
  useCustomerList,
} from '@/services/master/services';
import { useShippingAddressIndex } from '@/services/master/shipping/services';
import {
  usePurchaseOrderDetails,
  usePurchaseOrderList,
} from '@/services/purchase/purchase-orders/services';
import { useQuotationDetails } from '@/services/purchase/quotation/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useCustomEntryList } from '@/services/submaster/customentry/services';
import { useFOBList } from '@/services/submaster/fob/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { usePaymentModeList } from '@/services/submaster/paymentmode/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useShipAccountList } from '@/services/submaster/ship-account/services';
import { useShipModesList } from '@/services/submaster/ship-modes/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

import PartDetails from '../Quotation/PartDetails';

interface poItem {
  id: number;
  part_number_id: number;
  condition_id: number;
  unit_of_measure_id?: number | null;
  qty: number;
  price: number;
  note?: string | null;
}

const STFCreate = () => {
  const navigate = useNavigate();
  const [custom, setCustom] = useState<string>('');
  const [rows, setRows] = useState([{ id: 1 }]);
  const rowIdCounter = useRef(1);
  const [poId, setPoId] = useState<number | null>(null);
  const actionRef = useRef<'save' | 'saveAndNew'>('save');
  const [poItems, setPoItems] = useState<poItem[]>([]);
  const [priorityId, setPriorityId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [contactManagerId, setContactManagerId] = useState<number | null>(null);
  const [uomOptions, setUOMOptions] = useState<any>([]);
  const {
    isOpen: isVendorAddOpen,
    onOpen: onVendorAddOpen,
    onClose: onVendorAddClose,
  } = useDisclosure();

  const {
    isOpen: isShipAddrAddOpen,
    onOpen: onShipAddrAddOpen,
    onClose: onShipAddrAddClose,
  } = useDisclosure();

  // const toastSuccess = useToastSuccess();
  // const toastError = useToastError();
  // const queryClient = useQueryClient();

  const setPoIdDebounced = useRef(
    debounce((value: number) => {
      setPoId(value), 500;
    })
  ).current;

  const setPriorityIdDebounced = useRef(
    debounce((value: number) => {
      setPriorityId(value), 500;
    })
  ).current;

  const setCustomerIdDebounced = useRef(
    debounce((value: number) => {
      setCustomerId(value), 500;
    })
  ).current;

  const setContactManagerIdDebounced = useRef(
    debounce((value: number) => {
      setContactManagerId(value), 500;
    })
  ).current;

  const addNewRow = () => {
    rowIdCounter.current += 1; // Increment the counter to get a new unique ID
    const newRow = { id: rowIdCounter.current };
    setRows([...rows, newRow]);
  };

  const deleteRow = (rowId: number) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const stfOptions = [
    { value: 'import', label: 'Import' },
    { value: 'transit', label: 'Transit' },
  ];

  const purchaseList = usePurchaseOrderList();
  const purchaseOrderOptions = transformToSelectOptions(purchaseList.data);

  const { data: poDetails, isLoading: poDetailsLoading } =
    usePurchaseOrderDetails(poId ? poId : '');

  const { data: quotationDetails } = useQuotationDetails(
    // poDetails?.data.quotation_id ?? 0
    1
  );

  useEffect(() => {
    if (quotationDetails?.quotation.customer_id) {
      setCustomerId(quotationDetails.quotation.customer_id);
    }
  }, [quotationDetails]);

  useEffect(() => {
    if (poDetails?.data.items) {
      setPoItems(poDetails.data.items);
    }
    if (poDetails?.data.priority_id) {
      setPriorityId(poDetails.data.priority_id);
    }
    if (poDetails?.data.customer_contact_manager_id) {
      setContactManagerId(poDetails.data.customer_contact_manager_id);
    }
  }, [poDetails]);

  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);

  const customerList = useCustomerList();
  const customerOptions = transformToSelectOptions(customerList.data);

  const { data: customerDetails, isLoading: customerDetailsLoading } =
    useCustomerDetails(customerId ? customerId : '');

  const contactManagerList = useContactManagerIndex({
    search: {
      customer_id: Number(customerId),
    },
  });
  const vendorAttentionOptions = contactManagerList.data?.data.map((item) => ({
    value: item.id,
    label: item.attention,
  }));

  const shippingIndex = useShippingAddressIndex({
    search: { customer_id: Number(customerId) ?? '' },
  });

  const shippingOptions = shippingIndex.data?.data.map((item) => ({
    value: item.id,
    label: item.address,
  }));

  const consigneeShippingIndex = useShippingAddressIndex({
    search: {
      customer_id: Number(poDetails?.data.ship_customer_id),
    },
  });

  const consigneeShippingOptions = consigneeShippingIndex.data?.data.map(
    (item) => ({
      value: item.id,
      label: item.address,
    })
  );

  const customerBlockLoading = poDetailsLoading || customerDetailsLoading;

  const shipTypeList = useShipTypesList();
  const shipTypeOptions = transformToSelectOptions(shipTypeList.data);

  const shipModeList = useShipModesList();
  const shipModeOptions = transformToSelectOptions(shipModeList.data);

  const shipAccountList = useShipAccountList();
  const shipAccountOptions = transformToSelectOptions(shipAccountList.data);

  const shipViaList = useShipViaList();
  const shipViaOptions = transformToSelectOptions(shipViaList.data);

  const paymentModeList = usePaymentModeList();
  const paymentModeOptions = transformToSelectOptions(paymentModeList.data);

  const paymentTermList = usePaymentTermsList();
  const paymentTermOptions = transformToSelectOptions(paymentTermList.data);

  const fobList = useFOBList();
  const fobOptions = transformToSelectOptions(fobList.data);

  const customOptions = [
    { value: 'with', label: 'With Custom' },
    { value: 'without', label: 'Without Custom' },
  ];

  const customEntryList = useCustomEntryList();
  const customEntryOptions = transformToSelectOptions(customEntryList.data);

  const packageTypeList = usePackageTypeList();
  const packageTypeOptions = transformToSelectOptions(packageTypeList.data);

  const uomList = useUnitOfMeasureIndex();
  const conditionList = useConditionList();
  const getConditionName = (conditionId: number) => {
    const condition = conditionList.data?.items?.[conditionId];
    return condition || 'N/A';
  };

  const handleDeleteItem = (itemId: number) => {
    const filteredItems = poItems.filter((item) => item.id !== itemId);
    setPoItems(filteredItems);
  };

  useEffect(() => {
    if (uomList.data?.items) {
      setUOMOptions(uomList.data?.items);
    }
  }, [uomList]);

  // const createSTF = useCreateSTF({
  //   onSuccess: (data) => {
  //     toastSuccess({
  //       title: `STF Created - ${data.id}`,
  //       description: data.message,
  //       duration: 5000,
  //     });
  //     if (actionRef.current === 'saveAndNew') {
  //       form.reset();
  //       setCustomerId(0);
  //       form.setValues({ purchase_order_id: poId });
  //       queryClient.refetchQueries();
  //     } else {
  //       navigate('/purchase/stf');
  //     }
  //     queryClient.invalidateQueries('stfIndex');
  //   },
  //   onError: (error) => {
  //     toastError({
  //       title: 'STF Creation Failed',
  //       description: error.response?.data.message || 'Unknown Error',
  //     });
  //   },
  // });

  

  const form = useForm({
    onValidSubmit: async (values) => {
      const payload = {
        type: values.type,
        purchase_order_id: Number(values.purchase_order_id),
        ci_no: values.ci_no,
        ci_date: formatDate(values.ci_date) ?? '',
        packing_slip_no: values.packing_slip_no,
        packing_slip_date: formatDate(values.packing_slip_date) ?? '',
        lo_no: values.lo_no,
        lo_date: formatDate(values.lo_date) ?? '',
        customer_id: Number(values.customer_id),
        customer_contact_manager_id: Number(values.customer_contact_manager_id),
        customer_shipping_address_id: Number(values.consignor_address),
        ship_customer_id: Number(values.ship_customer_id),
        ship_customer_shipping_address_id: Number(values.consignee_address),
        priority_id: Number(values.priority_id),
        ship_type_id: Number(values.ship_type_id),
        ship_mode_id: Number(values.ship_mode_id),
        payment_mode_id: Number(values.payment_mode_id),
        ship_account_id: Number(values.ship_account_id),
        ship_via_id: Number(values.ship_via_id),
        awb: values.awb,
        fob_id: Number(values.fob_id),
        payment_term_id: Number(values.payment_term_id),
        total_freight_value: Number(values.total_freight_value),
        total_ci_value: Number(values.total_ci_value),
        no_of_package: Number(values.no_of_package),
        dimension: values.dimension,
        dimension_uom_id: Number(values.dimension_uom_id),
        weight: Number(values.weight),
        weight_uom_id: Number(values.weight_uom_id),
        package_type_id: Number(values.package_type_id),
        customs: values.customs,
        ci_document_file: values.ci_document_file,
        ps_document_file: values.ps_document_file,
        awb_file: values.awb_file,
        dg_declaration_file: values.dg_declaration_file,
        other_document_file: values.other_document_file,
        remark: values.remarks,
        items: poItems.map((item) => ({
          part_number_id: item.part_number_id,
          condition_id: item.condition_id,
          ship_qty: item.qty,
          ship_unit_of_measure_id: Number(item.unit_of_measure_id),
          qty: Number(values[`shipped_rec_qty_${item.id}`]),
          unit_of_measure_id: Number(values[`uom_rec_${item.id}`]),
          rate: values[`rate_${item.id}`],
          rate_unit_of_measure_id: Number(values[`uom_rate_${item.id}`]),
          back_qty: values[`back_ord_qty_${item.id}`],
          back_unit_of_measure_id: Number(values[`uom_back_ord_${item.id}`]),
          package_number: values[`package_number_${item.id}`],
          remark: values[`remark_${item.id}`],
          upload_file: values[`upload_${item.id}`],
        })),
        customs_entries: rows.map((row) => ({
          custom_entry_id: Number(values[`custom_entry_id_${row.id}`]),
          bill_of_entry: values[`bill_of_entry_${row.id}`],
          bill_of_entry_date:
            formatDate(values[`bill_of_entry_date_${row.id}`]) ?? '',
          bill_of_entry_file: values[`bill_of_entry_file_${row.id}`],
        })),
      };

      Object.keys(payload).forEach(
        (key) =>
          payload[key as keyof typeof payload] === null &&
          delete payload[key as keyof typeof payload]
      );

      console.log(payload);

      // createSTF.mutate(payload);
    },
  });

  const handleSave = () => {
    actionRef.current = 'save';
    form.submit();
  };

  const handleSaveAndNew = () => {
    actionRef.current = 'saveAndNew';
    form.submit();
  };

  const fields = useFormFields({
    connect: form,
  });

  const handleCloseCustomerModal = (status?: boolean, id?: any) => {
    if (status) {
      customerList.refetch();
      setTimeout(() => {
        setCustomerIdDebounced(Number(id));
        setCustomerId(Number(id));
        form.setValues({ [`customer_id`]: id.toString() });
      }, 2000);
    } else {
      setTimeout(() => {
        form.setValues({ [`customer_id`]: id.toString() });
      }, 1000);
    }

    onVendorAddClose();
  };

  const handleCloseShippingAddressModal = (status?: boolean, id?: any) => {
    if (status) {
      shippingIndex.refetch()
      if (id) {
        setTimeout(() => {
          form.setValues({
            [`consignor_address`]: id.toString(),
          });
        }, 2000);
      }
    }
    onShipAddrAddClose();
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
                <BreadcrumbLink as={Link} to={'/purchase/stf'}>
                  STF
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>STF Create</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              STF
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
          <Text fontSize={'md'} fontWeight={'700'}>
            STF Create
          </Text>

          <Formiz autoForm connect={form}>
            <Stack spacing={4}>
              <Stack
                spacing={4}
                p={4}
                bg={'white'}
                borderRadius={'md'}
                boxShadow={'md'}
                borderWidth={1}
                borderColor={'gray.200'}
              >
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    size={'sm'}
                    label={'STF Type'}
                    name={'type'}
                    required={'STF Type is required'}
                    options={stfOptions}
                    placeholder="Select STF Type"
                  />
                  <FieldSelect
                    size={'sm'}
                    label={'Purchase Order'}
                    name={'purchase_order_id'}
                    required={'Purchase Order is required'}
                    options={purchaseOrderOptions}
                    placeholder="Select PO"
                    onValueChange={(value) => {
                      setPoIdDebounced(Number(value));
                      setPoId(Number(value));
                    }}
                  />
                  <FieldInput
                    size={'sm'}
                    label={'CI No Vendor'}
                    name={'ci_no'}
                    required={'CI No Vendor is required'}
                    placeholder="Enter CI No Vendor"
                    maxLength={15}
                  />
                  <FieldDayPicker
                    size={'sm'}
                    label="CI Date"
                    name="ci_date"
                    required="CI Date is required"
                    placeholder="Select CI Date"
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    size={'sm'}
                    label="Packing Slip No"
                    name="packing_slip_no"
                    required="Packing Slip No is required"
                    placeholder="Enter Packing Slip No"
                    maxLength={15}
                  />
                  <FieldDayPicker
                    size={'sm'}
                    label="PS Date"
                    name="packing_slip_date"
                    required="PS Date is required"
                    placeholder="Select PS Date"
                  />
                  <FieldInput
                    size={'sm'}
                    label="LO No"
                    name="lo_no"
                    required="LO No is required"
                    placeholder="Enter LO No"
                    maxLength={15}
                  />
                  <FieldDayPicker
                    size={'sm'}
                    label="LO Date"
                    name="lo_date"
                    required="LO Date is required"
                    placeholder="Select LO Date"
                  />
                </Stack>
              </Stack>

              <Stack
                spacing={4}
                p={4}
                bg={'white'}
                borderRadius={'md'}
                boxShadow={'md'}
                borderWidth={1}
                borderColor={'gray.200'}
              >
                <LoadingOverlay
                  isLoading={poId !== null && customerBlockLoading}
                >
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldSelect
                      size={'sm'}
                      key={`priority_${priorityId}`}
                      label="Priority"
                      name="priority_id"
                      options={priorityOptions}
                      required="Priority is required"
                      placeholder="Select Priority"
                      defaultValue={
                        poDetails?.data.priority_id
                          ? poDetails.data.priority_id.toString()
                          : ''
                      }
                      onValueChange={(value) => {
                        setPriorityIdDebounced(Number(value));
                        setPriorityId(Number(value));
                      }}
                    />
                    <FieldSelect
                      size={'sm'}
                      key={`vendor_${customerId}`}
                      label="Vendor (consignor)"
                      name="customer_id"
                      required="Vendor (consignor) is required"
                      placeholder="Enter Vendor (consignor)"
                      options={[
                        ...(customerOptions ?? []),
                        {
                          value: 'add_new',
                          label: (
                            <Text
                              color={'brand.500'}
                              textDecoration={'underline'}
                            >
                              + Add New Vendor
                            </Text>
                          ),
                        },
                      ]}
                      defaultValue={customerId?.toString()}
                      onValueChange={(value) => {
                        if (value === 'add_new') {
                          // Open the modal to add a new vendor
                          onVendorAddOpen();
                        } else {
                          setCustomerIdDebounced(Number(value));
                          setCustomerId(Number(value));
                        }
                      }}
                    />
                    <FieldDisplay size={'sm'}
                      key={customerDetails?.data?.code}
                      label="Vendor Code"
                      value={customerDetails?.data?.code || 'N/A'}
                    />
                    <FieldSelect
                      size={'sm'}
                      key={`customer_contact_manager_id_${contactManagerId}`}
                      label="Vendor Attention"
                      name="customer_contact_manager_id"
                      options={vendorAttentionOptions || []}
                      defaultValue={poDetails?.data.customer_contact_manager_id}
                      required="Vendor Attention is required"
                      placeholder="Enter Vendor Attention"
                      onValueChange={(value) => {
                        setContactManagerIdDebounced(Number(value));
                        setContactManagerId(Number(value));
                      }}
                    />
                    <FieldSelect
                      size={'sm'}
                      key={`ship_customer_${poDetails?.data.ship_customer_id}`}
                      label="Consignee"
                      name="ship_customer_id"
                      options={[
                        ...(customerOptions ?? []),
                        {
                          value: 'add_new',
                          label: (
                            <Text
                              color={'brand.500'}
                              textDecoration={'underline'}
                            >
                              + Add New Vendor
                            </Text>
                          ),
                        },
                      ]}
                      required="Consignee is required"
                      placeholder="Enter Consignee"
                      defaultValue={'1'}
                      onValueChange={(value) => {
                        if (value === 'add_new') {
                          // Open the modal to add a new vendor
                          onVendorAddOpen();
                        }
                      }}
                    />
                  </Stack>

                  <Stack
                    spacing={8}
                    mt={4}
                    direction={{ base: 'column', md: 'row' }}
                  >
                    <FieldSelect
                      size={'sm'}
                      label="Consignor Address"
                      name="consignor_address"
                      required="Consignor Address is required"
                      placeholder="Enter Consignor Address"
                      options={[
                        ...(shippingOptions || []),
                        {
                          value: 'add_new_ship_address',
                          label: (
                            <Text
                              color={'brand.500'}
                              textDecoration={'underline'}
                            >
                              + Add New Address
                            </Text>
                          ),
                        },
                      ]}
                      onValueChange={(value) => {
                        if (value === 'add_new_ship_address') {
                          // Open the modal to add a new vendor
                          onShipAddrAddOpen();
                        }
                      }}
                    />
                    <FieldSelect
                      size={'sm'}
                      label="Consignee Address"
                      name="consignee_address"
                      required="Consignee Address is required"
                      placeholder="Enter Consignee Address"
                      options={[
                        ...(consigneeShippingOptions || []),
                        {
                          value: 'add_new_consignee_address',
                          label: (
                            <Text
                              color={'brand.500'}
                              textDecoration={'underline'}
                            >
                              + Add New Address
                            </Text>
                          ),
                        },
                      ]}
                      defaultValue={1}
                      onValueChange={(value) => {
                        if (value === 'add_new_consignee_address') {
                          // Open the modal to add a new vendor
                          onShipAddrAddOpen();
                        }
                      }}
                    />
                  </Stack>
                </LoadingOverlay>
              </Stack>

              <Stack
                spacing={4}
                p={4}
                bg={'white'}
                borderRadius={'md'}
                boxShadow={'md'}
                borderWidth={1}
                borderColor={'gray.200'}
              >
                <LoadingOverlay isLoading={poId !== null && poDetailsLoading}>
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldSelect
                      size={'sm'}
                      key={`ship_type_${poDetails?.data.ship_type_id}`}
                      label="Ship Type"
                      name="ship_type_id"
                      options={shipTypeOptions}
                      required="Ship Type is required"
                      placeholder="Select Ship Type"
                      defaultValue={poDetails?.data.ship_type_id.toString()}
                    />
                    <FieldSelect
                      size={'sm'}
                      key={`ship_mode_${poDetails?.data.ship_mode_id}`}
                      label="Ship Mode"
                      name="ship_mode_id"
                      options={shipModeOptions}
                      required="Ship Mode is required"
                      placeholder="Select Ship Mode"
                      defaultValue={poDetails?.data.ship_mode_id.toString()}
                    />
                    <FieldSelect
                      size={'sm'}
                      label="Ship Via"
                      name="ship_via_id"
                      options={shipViaOptions}
                      required="Ship Via is required"
                      placeholder="Select Ship Via"
                    />
                    <FieldSelect
                      size={'sm'}
                      key={`payment_mode_${poDetails?.data.payment_mode_id}`}
                      label="Payment Mode"
                      name="payment_mode_id"
                      options={paymentModeOptions}
                      required="Payment Mode is required"
                      placeholder="Select Payment Mode"
                      defaultValue={poDetails?.data.payment_mode_id.toString()}
                    />
                    <FieldSelect
                      size={'sm'}
                      key={`ship_account_${poDetails?.data.ship_account_id}`}
                      label="Ship A/C"
                      name="ship_account_id"
                      options={shipAccountOptions}
                      required="Ship A/C is required"
                      placeholder="Select Ship A/C"
                      defaultValue={poDetails?.data.ship_account_id.toString()}
                    />
                  </Stack>

                  <Stack
                    spacing={8}
                    mt={4}
                    direction={{ base: 'column', md: 'row' }}
                  >
                    <FieldInput
                      size={'sm'}
                      label="AWB/BL"
                      name="awb"
                      required="AWB/BL is required"
                      placeholder="Enter AWB/BL"
                      inputProps={{
                        maxLength: 10,
                      }}
                    />
                    <FieldSelect
                      size={'sm'}
                      key={`fob_${poDetails?.data.fob_id}`}
                      label="FOB"
                      name="fob_id"
                      options={fobOptions}
                      required="FOB is required"
                      placeholder="Select FOB"
                      defaultValue={poDetails?.data.fob_id.toString()}
                    />
                    <FieldSelect
                      size={'sm'}
                      key={`payment_term_${poDetails?.data.payment_term_id}`}
                      label="Payment Term"
                      name="payment_term_id"
                      options={paymentTermOptions}
                      required="Term is required"
                      placeholder="Select Term"
                      defaultValue={poDetails?.data.payment_term_id.toString()}
                    />
                    <FieldInput
                      size={'sm'}
                      label="Total Freight Value"
                      name="total_freight_value"
                      required="Total Freight Value is required"
                      placeholder="Enter Total Freight Value"
                    />
                    <FieldInput
                      size={'sm'}
                      label="Total CI Value"
                      name="total_ci_value"
                      required="Total CI Value is required"
                      placeholder="Enter Total CI Value"
                      type="decimal"
                      inputProps={{
                        maxLength: 10,
                      }}
                    />
                    <FieldDisplay size={'sm'}
                      key={`total_${fields.total_freight_value?.value + fields.total_ci_value?.value}`}
                      label="Total"
                      value={
                        Number(fields.total_freight_value?.value) +
                          Number(fields.total_ci_value?.value) || 'N/A'
                      }
                    />
                  </Stack>
                </LoadingOverlay>
              </Stack>

              <Stack spacing={8}>
                <FieldSelect
                  size={'sm'}
                  label="Custom"
                  name="customs"
                  options={customOptions}
                  required="Custom is required"
                  placeholder="Select Custom"
                  onValueChange={(value) => setCustom(value as string)}
                />
                {custom === 'with' && (
                  <>
                    {rows.map((row, index) => (
                      <Stack
                        key={row.id}
                        spacing={4}
                        p={4}
                        bg={'white'}
                        borderRadius={'md'}
                        boxShadow={'md'}
                        borderWidth={1}
                        borderColor={'gray.200'}
                      >
                        <HStack bg={'gray.100'} p={2} borderRadius={'md'}>
                          <Text fontSize={'medium'}>
                            Custom Entry {index + 1}.
                          </Text>
                          {rows.length > 1 && (
                            <IconButton
                              aria-label="Delete Row"
                              colorScheme="red"
                              size={'sm'}
                              variant={'ghost'}
                              icon={<DeleteIcon />}
                              onClick={() => deleteRow(row.id)}
                            />
                          )}
                        </HStack>

                        <Stack
                          spacing={8}
                          direction={{ base: 'column', md: 'row' }}
                        >
                          <FieldSelect
                            size={'sm'}
                            label="Custom Entry"
                            name={`custom_entry_id_${row.id}`}
                            options={customEntryOptions}
                            required="Custom Entry is required"
                            placeholder="Select Custom Entry"
                          />
                          <FieldInput
                            size={'sm'}
                            label="Bill of Entry"
                            name={`bill_of_entry_${row.id}`}
                            required="Bill of Entry is required"
                            placeholder="Enter Bill of Entry"
                          />
                          <FieldDayPicker
                            size={'sm'}
                            label="Date BOE"
                            name={`bill_of_entry_date_${row.id}`}
                            required="Date BOE is required"
                            placeholder="Select Date BOE"
                          />
                          <FieldUpload size={'sm'}
                            label="Upload BOE"
                            name={`bill_of_entry_file_${row.id}`}
                            required="Upload BOE is required"
                          />
                        </Stack>
                      </Stack>
                    ))}
                    <Stack
                      justify={'center'}
                      spacing={8}
                      direction={{ base: 'column', md: 'row' }}
                    >
                      <Button
                        colorScheme="brand"
                        size={'sm'}
                        onClick={addNewRow}
                        leftIcon={<HiOutlinePlus />}
                      >
                        Add Row
                      </Button>
                    </Stack>
                  </>
                )}
              </Stack>

              <Stack
                spacing={4}
                p={4}
                bg={'white'}
                borderRadius={'md'}
                boxShadow={'md'}
                borderWidth={1}
                borderColor={'gray.200'}
              >
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    size={'sm'}
                    label="No of Package"
                    name="no_of_package"
                    required="No of Package is required"
                    placeholder="Enter No of Package"
                    type="integer"
                    maxLength={4}
                  />
                  <FieldSelect
                    size={'sm'}
                    label="Package Type"
                    name="package_type_id"
                    options={packageTypeOptions}
                    required="Package Type is required"
                    placeholder="Select PKG Type"
                  />
                  
                  <FieldInput
                    size={'sm'}
                    label="Dimension (LxWxH)"
                    name="dimension"
                    required="Dimension is required"
                    placeholder="Enter Dimension"
                  />
                  <FieldSelect
                    size={'sm'}
                    label="UOM Dimension"
                    name="dimension_uom_id"
                    options={filterUOMoptions(uomOptions, 2)}
                    required="UOM Dimension is required"
                    placeholder="Select UOM Dim."
                  />
                  <FieldInput
                    size={'sm'}
                    label="Weight"
                    name="weight"
                    required="Weight is required"
                    placeholder="Enter Weight"
                    type="decimal"
                    maxLength={4}
                  />
                  <FieldSelect
                    size={'sm'}
                    label="UOM Weight"
                    name="weight_uom_id"
                    options={filterUOMoptions(uomOptions, 1)}
                    required="UOM Weight is required"
                    placeholder="Select UOM Wei"
                  />
                </Stack>
              </Stack>

              <Stack
                spacing={4}
                p={4}
                bg={'white'}
                borderRadius={'md'}
                boxShadow={'md'}
                borderWidth={1}
                borderColor={'gray.200'}
              >
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <Button
                    as={Link}
                    to={'#'}
                    bg="brand.900"
                    color={'white'}
                    _hover={{
                      bg: 'brand.800',
                    }}
                    size={'sm'}
                  >
                    Delivery Note document Link
                  </Button>
                  <Button
                    as={Link}
                    to={'#'}
                    bg="brand.900"
                    color={'white'}
                    _hover={{
                      bg: 'brand.800',
                    }}
                    size={'sm'}
                  >
                    GRA Link
                  </Button>
                  <Button
                    as={Link}
                    to={'#'}
                    bg="brand.900"
                    color={'white'}
                    _hover={{
                      bg: 'brand.800',
                    }}
                    size={'sm'}
                  >
                    Trace documents Link
                  </Button>
                  <Button
                    as={Link}
                    to={'#'}
                    bg="brand.900"
                    color={'white'}
                    _hover={{
                      bg: 'brand.800',
                    }}
                    size={'sm'}
                  >
                    Parts Picture Link
                  </Button>
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldUpload size={'sm'}
                    label="Upload-CI Document"
                    name="ci_document_file"
                    required="CI Document is required"
                  />
                  <FieldUpload size={'sm'}
                    label="Upload-PS Document"
                    name="ps_document_file"
                    required="PS Document is required"
                  />
                  <FieldUpload size={'sm'}
                    label="Upload-AWBL/BL"
                    name="awb_file"
                    required="AWBL/BL Document is required"
                  />
                  <FieldUpload size={'sm'}
                    label="Upload -DG Declaration"
                    name="dg_declaration_file"
                    required="DG Declaration is required"
                  />
                  <FieldUpload size={'sm'}
                    label="Other Document-upload"
                    name="other_document_file"
                    required="Other Document is required"
                  />
                </Stack>
              </Stack>

              {poItems.length > 0 && (
                <TableContainer rounded={'md'} overflow={'auto'} my={4}>
                  <Table variant="striped" size={'sm'}>
                    <Thead bg={'gray'}>
                      <Tr>
                        <Th color={'white'}>ID</Th>
                        <Th color={'white'}>Part Number</Th>
                        <Th color={'white'}>Description</Th>
                        <Th color={'white'}>Condition</Th>
                        <Th color={'white'}>Quantity</Th>
                        <Th color={'white'}>Price</Th>
                        <Th color={'white'}>Shipped Recd Qty</Th>
                        <Th color={'white'} sx={{ minWidth: '150px' }}>
                          UOM
                        </Th>
                        <Th color={'white'}>Back Ord Qty</Th>
                        <Th color={'white'} sx={{ minWidth: '150px' }}>
                          UOM
                        </Th>
                        <Th color={'white'} sx={{ minWidth: '150px' }}>
                          Rate
                        </Th>
                        <Th color={'white'} sx={{ minWidth: '150px' }}>
                          UOM
                        </Th>
                        <Th color={'white'} sx={{ minWidth: '150px' }}>
                          Total
                        </Th>
                        <Th color={'white'}>Package No#</Th>
                        <Th color={'white'} sx={{ minWidth: '200px' }}>
                          Upload
                        </Th>
                        <Th color={'white'} sx={{ minWidth: '150px' }}>
                          Remark
                        </Th>
                        <Th color={'white'} isNumeric>
                          Action
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {poItems.map((item) => (
                        <Tr key={item.id}>
                          <Td>{item.id}</Td>
                          <PartDetails partNumber={item.part_number_id} />
                          <Td>{getConditionName(item.condition_id)}</Td>
                          <Td>{item.qty}</Td>
                          <Td>{item.price}</Td>
                          <Td>
                            <FieldInput
                              size={'sm'}
                              name={`shipped_rec_qty_${item.id}`}
                              required="Shipped Recd Qty is required"
                              placeholder="Enter Shipped Recd Qty"
                              type="integer"
                              maxLength={5}
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              size={'sm'}
                              name={`uom_rec_${item.id}`}
                              options={convertToOptions(uomOptions)}
                              menuPortalTarget={document.body}
                              required="UOM is required"
                              placeholder="Select UOM"
                            />
                          </Td>
                          <Td>
                            <FieldInput
                              size={'sm'}
                              name={`back_ord_qty_${item.id}`}
                              required="Back Ord Qty is required"
                              placeholder="Enter Back Ord Qty"
                              type="integer"
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              size={'sm'}
                              name={`uom_back_ord_${item.id}`}
                              options={convertToOptions(uomOptions)}
                              menuPortalTarget={document.body}
                              required="UOM is required"
                              placeholder="Select UOM"
                            />
                          </Td>
                          <Td>
                            <FieldInput
                              size={'sm'}
                              name={`rate_${item.id}`}
                              required="Rate is required"
                              placeholder="Enter Rate"
                              type="decimal"
                              maxLength={10}
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              size={'sm'}
                              name={`uom_rate_${item.id}`}
                              options={convertToOptions(uomOptions)}
                              menuPortalTarget={document.body}
                              required="UOM is required"
                              placeholder="Select UOM"
                            />
                          </Td>
                          <Td>
                            <FieldDisplay size={'sm'}
                              key={`total_${fields[`shipped_rec_qty_${item.id}`]?.value * fields[`rate_${item.id}`]?.value}`}
                              value={
                                Number(item.qty) *
                                  Number(fields[`rate_${item.id}`]?.value) ||
                                'N/A'
                              }
                            />
                          </Td>
                          <Td>
                            <FieldInput
                              size={'sm'}
                              name={`package_number_${item.id}`}
                              required="Package No is required"
                              placeholder="Enter Package No"
                              type="number"
                            />
                          </Td>
                          <Td>
                            <FieldUpload size={'sm'}
                              name={`upload_${item.id}`}
                              required="Upload is required"
                            />
                          </Td>
                          <Td>
                            <FieldInput
                              size={'sm'}
                              name={`remark_${item.id}`}
                              placeholder="Enter Remark"
                              maxLength={50}
                            />
                          </Td>
                          <Td>
                            <IconButton
                              aria-label="Delete Row"
                              variant={'@danger'}
                              size={'sm'}
                              icon={<HiTrash />}
                              onClick={() => handleDeleteItem(item.id)}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}

              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldTextarea
                  size={'sm'}
                  label={'Remarks'}
                  name={'remarks'}
                  placeholder="Enter Remarks"
                  maxLength={100}
                />
              </Stack>

              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify={'center'}
                mt={4}
              >
                <Button onClick={handleSave} colorScheme="brand">
                  Save
                </Button>
                <Button onClick={handleSaveAndNew} colorScheme="brand">
                  Save & New
                </Button>
              </Stack>
            </Stack>
          </Formiz>

          <CustomerCreateModal
            isOpen={isVendorAddOpen}
            onClose={handleCloseCustomerModal}
          />

          <ShippingAddressCreateModal
            isOpen={isShipAddrAddOpen}
            onClose={handleCloseShippingAddressModal}
          />
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default STFCreate;
