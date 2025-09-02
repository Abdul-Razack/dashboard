import React, { useEffect, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
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
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiOutlinePlus } from 'react-icons/hi';
import { useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import { FieldUpload } from '@/components/FieldUpload';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { getPropertyList, formatDate , calculateVolumetricWeight,
  filterUOMoptions,
  getDisplayLabel,
  transformToSelectOptions
} from '@/helpers/commonHelper';
import CustomerCreateModal from '@/pages/Master/Customer/CustomerCreateModal';
import ShippingAddressCreateModal from '@/pages/Master/ShippingAddress/ShippingAddressCreateModal';
import { getAPICall } from '@/services/apiService';
import { StockQtytDetailsPayload } from '@/services/apiService/Schema/LRSchema';
import {
  InfoPayload,
  ListPayload,
} from '@/services/apiService/Schema/LRSchema';
import { useContactManagerIndex } from '@/services/master/contactmanager/services';
import {
  useCustomerDetails,
  useCustomerList,
} from '@/services/master/services';
import { usePurchaseOrderDetails } from '@/services/purchase/purchase-orders/services';
import { useCreateSTF } from '@/services/purchase/stf/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useCustomEntryList } from '@/services/submaster/customentry/services';
import { useFOBList } from '@/services/submaster/fob/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useShipAccountList } from '@/services/submaster/ship-account/services';
import { useShipModesList } from '@/services/submaster/ship-modes/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

import PartDetails from '../Quotation/PartDetails';
import PartNumberDetails from './PartNumberDetails';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

const STFLatestCreate = () => {
  const navigate = useNavigate();
  let { id } = useParams();
  const [details, setDetails] = useState<TODO>({});
  const [custom, setCustom] = useState<string>('');
  const [rows, setRows] = useState([{ id: 1 }]);
  const rowIdCounter = useRef(1);
  const [poId, setPoId] = useState<number | null>(null);
  const actionRef = useRef<'save' | 'saveAndNew'>('save');
  // const [poItems, setPoItems] = useState<poItem[]>([]);
  const [tableItems, setTableItems] = useState<any>([]);
  // const [priorityId, setPriorityId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [packageOptions, setPackageOptions] = useState<any>([]);
  const [packageValues, setPackageValues] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uomOptions, setUOMOptions] = useState<any>([]);
  const [prOptions, setPROptions] = useState<any>([]);
  const [lrid, setLRID] = useState<number | null>(null);
  const [customerCode, setCustomerCode] = useState<string>('Loading...');

  const {
    isOpen: isVendorAddOpen,
    onOpen: onVendorAddOpen,
    onClose: onVendorAddClose,
  } = useDisclosure();

  const {
    isOpen: isShipAddrAddOpen,
    // onOpen: onShipAddrAddOpen,
    onClose: onShipAddrAddClose,
  } = useDisclosure();

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const queryClient = useQueryClient();

  const setPoIdDebounced = useRef(
    debounce((value: number) => {
      setPoId(value), 500;
    })
  ).current;

  const setCustomerIdDebounced = useRef(
    debounce((value: number) => {
      setCustomerId(value), 500;
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

  const handleRemarksChange = (newValue: string) => {
    form.setValues({ [`remarks`]: newValue });
  };

  const calculateValue = (item: any, value: any, index: number) => {
    let existingValues = packageValues;
    let newValues: any = [];
    existingValues.forEach((itemValue: any, num: number) => {
      if (num === index) {
        itemValue[item] = Number(value);
      }
      itemValue.volumetric_weight = calculateVolumetricWeight(
        parseFloat(itemValue.length) || 0,
        parseFloat(itemValue.width) || 0,
        parseFloat(itemValue.height) || 0,
        itemValue.unit_of_measurement_id,
        uomOptions
      );
      newValues.push(itemValue);
    });
    setPackageValues([...newValues]);
  };

  const getPackageInfo = (item: any) => {
    let packageInfo = packageOptions.find(
      (packagedetail: any) =>
        packagedetail.logistic_request_package_id === item.id
    );
    if (packageInfo) {
      return packageInfo.label;
    } else {
      return ' - ';
    }
  };

  const displayPurchaseIDs = (items: any) => {
    let returnText = '';
    if (items.length > 0) {
      returnText = items.map((item: any) => item.purchase_order_id).join(', ');
    }
    return returnText;
  };

  // useEffect(() => {
  //   if (quotationDetails?.quotation.customer_id) {
  //     //setCustomerId(quotationDetails.quotation.customer_id);
  //   }
  // }, [quotationDetails]);

  useEffect(() => {
    let overallVol_Weight = 0;
    if (packageValues.length > 0) {
      packageValues.forEach((item: any, index: number) => {
        item.volumetric_weight = calculateVolumetricWeight(
          parseFloat(item.length) || 0,
          parseFloat(item.width) || 0,
          parseFloat(item.height) || 0,
          item.unit_of_measurement_id,
          uomOptions
        );
        form.setValues({
          [`volumetric_weight_${index}`]: item.volumetric_weight,
        });

        overallVol_Weight =
          Number(overallVol_Weight) + Number(item.volumetric_weight);
      });
    }

    form.setValues({ [`volumetric_weight`]: overallVol_Weight });
  }, [packageValues]);

  const { data: poDetails } = usePurchaseOrderDetails(poId ? poId : '');

  useEffect(() => {
    if (poDetails?.data) {
      console.log(poDetails?.data);
      setCustomerId(poDetails?.data?.customer_id);
      form.setValues({
        [`customer_contact_manager_id`]:
          poDetails?.data?.customer_contact_manager_id,
        ['ship_mode_id']: poDetails?.data?.ship_mode_id.toString(),
        ['ship_account_id']: poDetails?.data?.ship_account_id.toString(),
        ['fob_id']: poDetails?.data.fob_id.toString(),
      });
    }
  }, [poDetails]);

  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);

  const customerList = useCustomerList();
  const customerOptions = transformToSelectOptions(customerList.data);

  const { data: customerDetails } = useCustomerDetails(
    customerId ? customerId : ''
  );
  const contactManagerList = useContactManagerIndex({
    search: {
      customer_id: Number(customerId),
    },
  });
  const vendorAttentionOptions = contactManagerList.data?.data.map((item) => ({
    value: item.id,
    label: item.attention,
  }));


  // const shippingIndex = useShippingAddressIndex({
  //   search: { customer_id: Number(customerId) ?? '' },
  // });

  // const shippingOptions = shippingIndex.data?.data.map((item) => ({
  //   value: item.id,
  //   label: item.address,
  // }));

  // const consigneeShippingIndex = useShippingAddressIndex({
  //   search: {
  //     customer_id: Number(poDetails?.data.ship_customer_id),
  //   },
  // });

  // const consigneeShippingOptions = consigneeShippingIndex.data?.data.map(
  //   (item) => ({
  //     value: item.id,
  //     label: item.address,
  //   })
  // );

  //const customerBlockLoading = poDetailsLoading || customerDetailsLoading;

  const shipTypeList = useShipTypesList();
  const shipTypeOptions = transformToSelectOptions(shipTypeList.data);

  const shipModeList = useShipModesList();
  const shipModeOptions = transformToSelectOptions(shipModeList.data);

  const shipAccountList = useShipAccountList();
  const shipAccountOptions = transformToSelectOptions(shipAccountList.data);

  const shipViaList = useShipViaList();
  const shipViaOptions = transformToSelectOptions(shipViaList.data);

  // const paymentModeList = usePaymentModeList();
  // const paymentModeOptions = transformToSelectOptions(paymentModeList.data);

  // const paymentTermList = usePaymentTermsList();
  // const paymentTermOptions = transformToSelectOptions(paymentTermList.data);

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

  const createSTF = useCreateSTF({
    onSuccess: (data) => {
      setLoading(false);
      toastSuccess({
        title: `STF Created - ${data.id}`,
        description: data.message,
        duration: 5000,
      });
      if (actionRef.current === 'saveAndNew') {
        form.reset();
        setCustomerId(0);
        form.setValues({ purchase_order_id: poId });
        queryClient.refetchQueries();
      } else {
        navigate('/purchase/stf');
      }
      queryClient.invalidateQueries('stfIndex');
    },
    onError: (error) => {
      setLoading(false);
      toastError({
        title: 'STF Creation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });

  

  const form = useForm({
    onValidSubmit: async (values) => {
      setLoading(true);
      let packages: any = [];
      let customs_entries: any = [];
      let volumetric_weight = 0;
      if (values.customs === 'with') {
        rows.forEach((item: any) => {
          let obj: any = {};
          obj.custom_entry_id = Number(values[`custom_entry_id_${item.id}`]);
          obj.bill_of_entry = values[`bill_of_entry_${item.id}`];
          obj.bill_of_entry_date =
            formatDate(values[`bill_of_entry_date_${item.id}`]) ?? '';
          obj.bill_of_entry_file = values[`bill_of_entry_file_${item.id}`];
          customs_entries.push(obj);
        });
      }

      details?.packages.forEach((item: any, ino: number) => {
        let newOBJ: any = {};
        newOBJ.logistic_request_package_id = item.id;
        newOBJ.package_type_id = Number(item.package_type_id);
        newOBJ.package_number = item.package_number;
        newOBJ.weight = Number(values[`weight_${ino}`]);
        newOBJ.weight_unit_of_measurement_id = Number(
          values[`weight_uom_id_${ino}`]
        );
        newOBJ.length = Number(values[`length_${ino}`]);
        newOBJ.width = Number(values[`width_${ino}`]);
        newOBJ.height = Number(values[`height_${ino}`]);
        newOBJ.unit_of_measurement_id = Number(
          values[`unit_of_measurement_id_${ino}`]
        );
        newOBJ.volumetric_weight = Number(values[`volumetric_weight_${ino}`]);
        packages.push(newOBJ);
      });

      const payload = {
        awb_number: values.awb_number,
        type: values.type,
        logistic_request_id: Number(lrid),
        sft_number: customerDetails?.data?.code + '-' + lrid,
        stf_date: formatDate(values.stf_date) ?? '',
        ci_date: formatDate(values.ci_date) ?? '',
        ci_number: values.ci_number,
        packing_slip_no: values.packing_slip_no,
        total_ci_value: values.total_ci_value,
        packing_slip_date: formatDate(values.packing_slip_date) ?? '',
        volumetric_weight: volumetric_weight,
        customs: values.customs,
        packages: [],
        customs_entries: [],
      };

      payload.packages = packages;
      payload.customs_entries = customs_entries;

      Object.keys(payload).forEach(
        (key) =>
          payload[key as keyof typeof payload] === null &&
          delete payload[key as keyof typeof payload]
      );

      createSTF.mutate(payload);
    },
  });

  const handleSave = () => {
    actionRef.current = 'save';
    form.submit();
  };

  // const handleSaveAndNew = () => {
  //   actionRef.current = 'saveAndNew';
  //   form.submit();
  // };

  useEffect(() => {
    if (Object.keys(details).length > 0) {
      setCustomerId(details?.customer_id);
      if (details?.purchase_orders.length > 0) {
        setPoIdDebounced(Number(details?.purchase_orders[0].purchase_order_id));
        setPoId(details?.purchase_orders[0].id);
      } else {
        setPoId(null);
      }

      console.log(details?.items);

      setTableItems(details?.items);
      if (details?.packages.length > 0) {
        let packages = details?.packages.map((pkg: any) => ({
          value: pkg.id,
          label: pkg.package_number,
        }));
        let overallVol_Weight = 0;
        let package_Values = details?.packages.map((pkg: any) => ({
          weight: pkg.weight,
          weight_unit_of_measurement_id: pkg.weight_unit_of_measurement_id,
          length: pkg.length,
          width: pkg.width,
          height: pkg.height,
          unit_of_measurement_id: pkg.unit_of_measurement_id,
          volumetric_weight: pkg.volumetric_weight,
        }));

        package_Values.forEach((item: any) => {
          overallVol_Weight =
            Number(overallVol_Weight) + Number(item.volumetric_weight);
        });

        setPackageOptions(packages);
        setPackageValues(package_Values);
        setTimeout(() => {
          form.setValues({ [`volumetric_weight`]: overallVol_Weight });
        }, 2000);
      }

      let goods_type: string = 'non_dg';
      if (details?.is_dg) {
        goods_type = 'dg';
      }
      form.setValues({
        [`lr_no`]: details.id,
        [`goods_type`]: goods_type,
        ['ci_date']: dayjs(details.ref_date),
        ['stf_date']: dayjs(details.created_at),
        ['due_date']: dayjs(details.due_date),
        ['lo_date']: dayjs(details.due_date),
        ['ref_no']: displayPurchaseIDs(details?.purchase_orders),
        ['ship_customer_id']: details.receiver_customer_id.toString(),
        ['consignor_address']: details?.receiver_shipping_address?.address,
        ['consignee_address']: details?.customer_shipping_address?.address,
        ['no_of_package']: details?.no_of_package,
        ['awb_number']: details?.awb_number,
        ['volumetric_weight_awb']: details?.volumetric_weight,
        ['volumetric_weight']: details?.volumetric_weight,
        ['priority_id']: details?.priority_id.toString(),
        ['customer_id']: details?.customer_id.toString(),
        ['ship_type_id']: details?.ship_type_id.toString(),
        ['ship_via_id']: details?.ship_via_id.toString(),
      });

      console.log(details);
    }
  }, [details]);

  const getLRInfo = async (id: any) => {
    try {
      const data = await getAPICall(
        endPoints.info.logistic_request.replace(':id', id),
        InfoPayload
      );
      setDetails(data.data);
      console.log(data?.data?.stf_type)
      form.setValues({ [`type`]: data?.data?.stf_type ?? 'import'});
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const getQTYDetails = async (logistic_request_item_id: number) => {
    if(logistic_request_item_id > 0){
      try {
        const response = await getAPICall(
          endPoints.others.get_stock_qty_details,
          StockQtytDetailsPayload,
          { logistic_request_item_id: logistic_request_item_id }
        );
        console.log(response)
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    }
    
  };

  getQTYDetails(0);


  const getLRList = async () => {
    try {
      const data = await getAPICall(
        endPoints.list.logistic_request,
        ListPayload
      );
      if (data.items) {
        setPROptions(transformToSelectOptions(data));
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    if (uomList.data?.items) {
      setUOMOptions(uomList.data?.items);
    }
  }, [uomList]);

  useEffect(() => {
    if (id) {
      setLRID(Number(id));
    } else {
      getLRList();
    }
  }, [id]);

  useEffect(() => {
    if (lrid) {
      getLRInfo(lrid);
    }
  }, [lrid]);

  useEffect(() => {
    if (customerDetails) {
      setCustomerCode(`${customerDetails?.data?.code}-${lrid}`);
    }
  }, [customerDetails]);

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
        <LoadingOverlay isLoading={loading}>
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
                  backgroundColor={'teal.100'}
                >
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    {!id && (
                      <FieldSelect
                        size={'sm'}
                        label={'LR'}
                        name={'logistic_request_id'}
                        required={'Logistic Request is required'}
                        options={prOptions ?? []}
                        selectProps={{
                          noOptionsMessage: () => 'No LR found',
                        }}
                        onValueChange={(value) => {
                          setLoading(true);
                          setLRID(Number(value));
                        }}
                      />
                    )}

                    {id && (
                      <FieldInput
                        size={'sm'}
                        label="LR No"
                        name="lr_no"
                        required="LR No is required"
                        placeholder="Enter LR No"
                        isDisabled={true}
                      />
                    )}

                    <FieldSelect
                      size={'sm'}
                      label={'STF Type'}
                      name={'type'}
                      required={'STF Type is required'}
                      options={stfOptions}
                      isDisabled={true}
                      className="disabled-input"
                    />

                    <FieldDisplay
                      size={'sm'}
                      key={customerDetails?.data?.code}
                      label="STF No"
                      value={customerCode}
                      style={{
                        backgroundColor: 'rgb(245 245 235 / 87%)',
                        cursor: 'not-allowed',
                      }}
                    />

                    <FieldDayPicker
                      size={'sm'}
                      label="STF Date"
                      name="stf_date"
                      required="STF Date is required"
                      placeholder="Select STF Date"
                      dayPickerProps={{
                        inputProps: {
                          isDisabled: true,
                        },
                      }}
                    />

                    {/* <FieldDayPicker
                      size={'sm'}
                      label="Ref Date"
                      name="ci_date"
                      required="STF Date is required"
                      placeholder="DD-MM-YYYY"
                    /> */}
                  </Stack>

                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    {/* <FieldInput
                      size={'sm'}
                      label={'Ref No'}
                      name={'ref_no'}
                      required={'Ref is required'}
                      placeholder="Enter Ref"
                      inputProps={{
                        maxLength: 15,
                      }}
                      isDisabled={true}
                    /> */}

                    <FieldDisplay
                      size={'sm'}
                      label="PO No"
                      value={poDetails?.data.id}
                      style={{
                        backgroundColor: 'rgb(245 245 235 / 87%)',
                        cursor: 'not-allowed',
                      }}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="PO Date"
                      value={
                        dayjs(poDetails?.data?.created_at).format(
                          'DD/MM/YYYY'
                        ) || 'N/A'
                      }
                      style={{
                        backgroundColor: 'rgb(245 245 235 / 87%)',
                        cursor: 'not-allowed',
                      }}
                    />

                    <FieldDisplay
                      size={'sm'}
                      label="LO No"
                      value={getPropertyList(
                        details?.logistic_orders
                          ? details?.logistic_orders
                          : [],
                        'id'
                      )}
                      style={{
                        backgroundColor: 'rgb(245 245 235 / 87%)',
                        cursor: 'not-allowed',
                      }}
                    />
                    <FieldDayPicker
                      size={'sm'}
                      label="LO Date"
                      name="lo_date"
                      required="LO Date is required"
                      placeholder="DD-MM-YYYY"
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
                  backgroundColor={'teal.100'}
                >
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <Box flex="1" rounded={'md'}>
                      <Stack
                        spacing={4}
                        direction={{ base: 'column', md: 'row' }}
                        mb={2}
                      >
                        <FieldSelect
                          size={'sm'}
                          label="Vendor (Consignor)"
                          name="customer_id"
                          required="Vendor (consignor) is required"
                          placeholder="Select Vendor"
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
                          onValueChange={(value) => {
                            if (value === 'add_new') {
                              // Open the modal to add a new vendor
                              onVendorAddOpen();
                            } else {
                              setCustomerIdDebounced(Number(value));
                              setCustomerId(Number(value));
                            }
                          }}
                          isDisabled={true}
                          className="disabled-input"
                        />

                        <FieldDisplay
                          size={'sm'}
                          key={customerDetails?.data?.code}
                          label="Vendor Code"
                          value={customerDetails?.data?.code || 'N/A'}
                          style={{
                            backgroundColor: 'rgb(245 245 235 / 87%)',
                            cursor: 'not-allowed',
                          }}
                        />
                      </Stack>
                      <Stack spacing={4} mb={2}>
                        <FieldSelect
                          size={'sm'}
                          label="Vendor Attention"
                          name="customer_contact_manager_id"
                          options={vendorAttentionOptions || []}
                          required="Vendor Attention is required"
                          placeholder="Enter Vendor Attention"
                          // onValueChange={(value) => {
                          //   setContactManagerIdDebounced(Number(value));
                          //   setContactManagerId(Number(value));
                          // }}
                          isDisabled={true}
                          className="disabled-input"
                        />
                      </Stack>
                      <Stack spacing={4} mb={2}>
                        <FieldTextarea
                          size={'sm'}
                          label={'Consignor Address'}
                          name={'consignor_address'}
                          placeholder="Enter Consignor Address"
                          maxLength={100}
                          isDisabled={true}
                          className="disabled-input"
                        />
                      </Stack>
                    </Box>

                    <Box flex="1" rounded={'md'}>
                      <Stack spacing={4} mb={2}>
                        <FieldSelect
                          size={'sm'}
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
                          onValueChange={(value) => {
                            if (value === 'add_new') {
                              // Open the modal to add a new vendor
                              onVendorAddOpen();
                            }
                          }}
                          isDisabled={true}
                          className="disabled-input"
                        />
                      </Stack>
                      <Stack spacing={4} mb={2}>
                        <FieldTextarea
                          size={'sm'}
                          label={'Consignee Address'}
                          name={'consignee_address'}
                          placeholder="Enter Consignee Address"
                          maxLength={100}
                          isDisabled={true}
                        />
                      </Stack>
                    </Box>
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
                  backgroundColor={'teal.100'}
                >
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldInput
                      size={'sm'}
                      label="No of Package"
                      name="no_of_package"
                      required="No of Package is required"
                      placeholder="Enter No of Package"
                      type="number"
                      isDisabled={true}
                      inputProps={{
                        maxLength: 4,
                      }}
                    />

                    <FieldSelect
                      size={'sm'}
                      key={`goods_type`}
                      label="Goods Type"
                      name="goods_type"
                      options={[
                        { value: 'dg', label: 'DG' },
                        { value: 'non_dg', label: 'Non-DG' },
                      ]}
                      isDisabled={true}
                      className="disabled-input"
                    />

                    <FieldInput
                      size={'sm'}
                      label="Vol.Weigt(AWB)"
                      name="volumetric_weight_awb"
                      isDisabled={true}
                      rightElement={<Text>KG</Text>}
                    />

                    <FieldInput
                      size={'sm'}
                      label="Vol.Weigt(Actual)"
                      name="volumetric_weight"
                      type="number"
                      isDisabled={true}
                      rightElement={<Text>KG</Text>}
                    />

                    <FieldSelect
                      size={'sm'}
                      label="Priority"
                      name="priority_id"
                      options={priorityOptions}
                      required="Priority is required"
                      placeholder="Select Priority"
                      isDisabled={true}
                      className="disabled-input"
                      // onValueChange={(value) => {
                      //   setPriorityIdDebounced(Number(value));
                      //   setPriorityId(Number(value));
                      // }}
                    />
                    <FieldSelect
                      size={'sm'}
                      key={`ship_type`}
                      label="Ship Type"
                      name="ship_type_id"
                      options={shipTypeOptions}
                      required="Ship Type is required"
                      placeholder="Select Ship Type"
                      isDisabled={true}
                      className="disabled-input"
                    />
                  </Stack>

                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldSelect
                      size={'sm'}
                      label="Ship Mode"
                      name="ship_mode_id"
                      options={shipModeOptions}
                      required="Ship Mode is required"
                      placeholder="Select Ship Mode"
                      isDisabled={true}
                      className="disabled-input"
                    />
                    <FieldSelect
                      size={'sm'}
                      label="Ship Via"
                      name="ship_via_id"
                      options={shipViaOptions}
                      required="Ship Via is required"
                      placeholder="Select Ship Via"
                      isDisabled={true}
                      className="disabled-input"
                    />
                    <FieldSelect
                      size={'sm'}
                      label="Ship A/C"
                      name="ship_account_id"
                      options={shipAccountOptions}
                      required="Ship A/C is required"
                      placeholder="Select Ship A/C"
                      isDisabled={true}
                      className="disabled-input"
                    />

                    <FieldSelect
                      size={'sm'}
                      label="FOB"
                      name="fob_id"
                      options={fobOptions}
                      required="FOB is required"
                      placeholder="Select FOB"
                      isDisabled={true}
                      className="disabled-input"
                    />

                    <FieldInput
                      size={'sm'}
                      label="AWB/BL"
                      name="awb_number"
                      required="AWB/BL is required"
                      placeholder="Enter AWB/BL"
                      inputProps={{
                        maxLength: 10,
                      }}
                    />
                  </Stack>
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldInput
                      size={'sm'}
                      label="Total CI Value"
                      name="total_ci_value"
                      required="Total CI Value is required"
                      placeholder="Enter Total CI Value"
                      type="number"
                      inputProps={{
                        maxLength: 10,
                      }}
                    />

                    <FieldInput
                      size={'sm'}
                      label="CI No (Vendor)"
                      name="ci_number"
                      required="CI No (Vendor) is required"
                      placeholder="Enter CI No (Vendor)"
                      type="number"
                      inputProps={{
                        maxLength: 10,
                      }}
                    />

                    <FieldDayPicker
                      size={'sm'}
                      label="CI Date"
                      name={`ci_date`}
                      required="CI Date is required"
                      placeholder="Select CI Date"
                    />

                    <FieldInput
                      size={'sm'}
                      label="Packing Slip No (Vendor) "
                      name="packing_slip_no"
                      required="Packing Slip No (Vendor)  is required"
                      placeholder="Enter Packing Slip No (Vendor)"
                      inputProps={{
                        maxLength: 10,
                      }}
                    />

                    <FieldDayPicker
                      size={'sm'}
                      label="PS Date"
                      name={`packing_slip_date`}
                      required="PS Date is required"
                      placeholder="Select PS Date"
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
                  backgroundColor={'teal.100'}
                >
                  <FieldSelect
                    size={'sm'}
                    marginBottom={2}
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
                          <HStack
                            bg={'brand.900'}
                            p={2}
                            borderRadius={'md'}
                            color={'#fff'}
                          >
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
                            <FieldUpload
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
                  {custom === 'without' && (
                    <Stack
                      spacing={4}
                      p={4}
                      bg={'white'}
                      borderRadius={'md'}
                      boxShadow={'md'}
                      borderWidth={1}
                      borderColor={'gray.200'}
                      textAlign={'center'}
                      width={'100%'}
                    >
                      <Text fontSize={'medium'}>Not Applicable</Text>
                    </Stack>
                  )}
                </Stack>

                {tableItems.filter(
                  (innerItem: any) =>
                    innerItem.logistic_request_package_id === null
                ).length > 0 && (
                  <Stack
                    spacing={4}
                    p={4}
                    bg={'white'}
                    borderRadius={'md'}
                    boxShadow={'md'}
                    borderWidth={1}
                    borderColor={'gray.200'}
                    backgroundColor={'teal.100'}
                  >
                    {lrid && (
                      <Stack className="tableRadius-0">
                        <HStack justify={'space-between'}>
                          <Text fontSize="md" fontWeight="700">
                            Not Obtained Items
                          </Text>
                        </HStack>

                        {tableItems && tableItems.length > 0 && (
                          <TableContainer rounded={'md'} overflow={'auto'}>
                            <Table size={'sm'}>
                              <Thead bg={'gray'}>
                                <Tr
                                  sx={{
                                    th: {
                                      borderColor: 'gray',
                                      borderWidth: '1px',
                                      borderStyle: 'solid',
                                    },
                                  }}
                                >
                                  <Th color={'white'}>ID </Th>
                                  <Th color={'white'}>Part No#</Th>
                                  <Th color={'white'}>Desc</Th>
                                  <Th color={'white'}>Condition</Th>
                                  <Th color={'white'}>Goods Type</Th>
                                  <Th color={'white'}>PO Num</Th>
                                  <Th color={'white'}>PO Tot.Qty</Th>
                                  <Th color={'white'}>Tot Rec.Qty</Th>
                                  <Th color={'white'}>Add.Qty</Th>
                                  <Th color={'white'}>LR Qty</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {tableItems.filter(
                                  (innerItem: any) =>
                                    innerItem.logistic_request_package_id ===
                                    null
                                ).length === 0 && (
                                  <Tr>
                                    <Td colSpan={11} textAlign="center">
                                      No data available
                                    </Td>
                                  </Tr>
                                )}
                                {tableItems.map(
                                  (item: any, index: number) =>
                                    item.logistic_request_package_id ===
                                      null && (
                                      <Tr
                                        key={item.id}
                                        sx={{
                                          td: {
                                            borderColor: 'gray',
                                            borderWidth: '1px',
                                            borderStyle: 'solid',
                                          },
                                        }}
                                      >
                                        <Td>{index + 1} </Td>
                                        <PartDetails
                                          partNumber={item.part_number_id}
                                        />
                                        <Td>
                                          {conditionList.data?.items?.[
                                            item.condition_id
                                          ] || 'N/A'}
                                        </Td>
                                        <PartNumberDetails
                                          part_number={item.part_number_id}
                                          type="goods_type"
                                        />
                                        <Td>{item.purchase_order_id}</Td>
                                        <Td>{item.qty}</Td>
                                        <Td>0</Td>
                                        <Td>0</Td>
                                        <Td>0</Td>
                                      </Tr>
                                    )
                                )}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        )}
                      </Stack>
                    )}
                  </Stack>
                )}
                {lrid && (
                  <Stack
                    spacing={4}
                    p={4}
                    bg={'white'}
                    borderRadius={'md'}
                    boxShadow={'md'}
                    borderWidth={1}
                    borderColor={'gray.200'}
                    backgroundColor={'teal.100'}
                    className="tableRadius-0"
                  >
                    <Stack>
                      <HStack justify={'space-between'}>
                        <Text fontSize="md" fontWeight="700">
                          Obtained Items
                        </Text>
                      </HStack>

                      {tableItems && tableItems.length > 0 && (
                        <TableContainer rounded={'md'} overflow={'auto'}>
                          <Table size={'sm'}>
                            <Thead bg={'gray'}>
                              <Tr
                                sx={{
                                  th: {
                                    borderColor: 'gray',
                                    borderWidth: '1px',
                                    borderStyle: 'solid',
                                  },
                                }}
                              >
                                <Th color={'white'}>S.no</Th>
                                <Th color={'white'}>Package</Th>
                                <Th color={'white'}>Part No</Th>
                                <Th color={'white'}>Desc</Th>
                                <Th color={'white'}>Condition</Th>
                                <Th color={'white'}>Goods Type</Th>
                                <Th color={'white'}>PO Num</Th>
                                <Th color={'white'}>PO Tot.Qty</Th>
                                <Th color={'white'}>Tot Rec.Qty</Th>
                                <Th color={'white'}>Add.Qty</Th>
                                <Th color={'white'}>LR Qty</Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              {tableItems.filter(
                                (innerItem: any) =>
                                  innerItem.logistic_request_package_id !== null
                              ).length === 0 && (
                                <Tr>
                                  <Td colSpan={14} textAlign="center">
                                    No data available
                                  </Td>
                                </Tr>
                              )}
                              {tableItems.map(
                                (item: any, index: number) =>
                                  item.logistic_request_package_id !== null && (
                                    <Tr
                                      key={item.id}
                                      sx={{
                                        td: {
                                          borderColor: 'gray',
                                          borderWidth: '1px',
                                          borderStyle: 'solid',
                                        },
                                      }}
                                    >
                                      <Td>
                                        {index +
                                          1 -
                                          tableItems.filter(
                                            (innerItem: any) =>
                                              innerItem.logistic_request_package_id ===
                                              null
                                          ).length}
                                      </Td>
                                      <Td>
                                        {getPackageInfo(
                                          item.logistic_request_package_id
                                        )}
                                      </Td>
                                      <PartDetails
                                        partNumber={item.part_number_id}
                                      />
                                      <Td>
                                        {conditionList.data?.items?.[
                                          item.condition_id
                                        ] || 'N/A'}
                                      </Td>
                                      <PartNumberDetails
                                        part_number={item.part_number_id}
                                        type="goods_type"
                                      />
                                      <Td>{item.purchase_order_id}</Td>
                                      <Td>{item.qty}</Td>
                                      <Td>0</Td>
                                      <Td>0</Td>
                                      <Td>0</Td>
                                    </Tr>
                                  )
                              )}
                            </Tbody>
                          </Table>
                        </TableContainer>
                      )}
                    </Stack>
                  </Stack>
                )}
                {lrid && (
                  <Stack
                    spacing={4}
                    p={4}
                    bg={'white'}
                    borderRadius={'md'}
                    boxShadow={'md'}
                    borderWidth={1}
                    borderColor={'gray.200'}
                    backgroundColor={'teal.100'}
                    className="tableRadius-0"
                  >
                    <Stack>
                      <TableContainer rounded={'md'} overflow={'auto'}>
                        <Table size={'sm'}>
                          <Thead bg={'gray'}>
                            <Tr
                              sx={{
                                th: {
                                  borderColor: 'gray',
                                  borderWidth: '1px',
                                  borderStyle: 'solid',
                                },
                              }}
                            >
                              <Th rowSpan={2} color={'white'}>
                                Package
                              </Th>
                              <Th color={'white'}></Th>
                              <Th color={'white'}>Weight</Th>
                              <Th color={'white'} sx={{ minWidth: '120px' }}>
                                UOM
                              </Th>
                              <Th color={'white'}>Length</Th>
                              <Th color={'white'}>Width</Th>
                              <Th color={'white'}>Height</Th>
                              <Th color={'white'} sx={{ minWidth: '120px' }}>
                                UOM
                              </Th>
                              <Th color={'white'} sx={{ minWidth: '160px' }}>
                                Package Type
                              </Th>
                              <Th color={'white'}>Volumet. Weig</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {details &&
                              details?.packages &&
                              details?.packages.map(
                                (item: any, ino: number) => (
                                  <React.Fragment key={item.id}>
                                    <Tr
                                      sx={{
                                        td: {
                                          borderColor: 'gray',
                                          borderWidth: '1px',
                                          borderStyle: 'solid',
                                        },
                                      }}
                                    >
                                      <Td rowSpan={2} fontWeight={'bold'}>
                                        {item.package_number}
                                      </Td>
                                      <Td>As per AWB</Td>
                                      <Td>{item.weight}</Td>
                                      <Td>KG</Td>
                                      <Td>{item.length}</Td>
                                      <Td>{item.width}</Td>
                                      <Td>{item.height}</Td>
                                      <Td>CM</Td>
                                      <Td>
                                        {getDisplayLabel(
                                          packageTypeOptions,
                                          item.package_type_id
                                            ? item.package_type_id.toString()
                                            : 0,
                                          'Package Type'
                                        ) || 'N/A'}
                                        -{item.package_number}
                                      </Td>
                                      <Td>
                                        {item.volumetric_weight.toString()} KG
                                      </Td>
                                    </Tr>
                                    <Tr
                                      sx={{
                                        td: {
                                          borderColor: 'gray',
                                          borderWidth: '1px',
                                          borderStyle: 'solid',
                                        },
                                      }}
                                    >
                                      <Td>Actual</Td>
                                      <Td>
                                        <FieldInput
                                          size={'sm'}
                                          name={`weight_${ino}`}
                                          required="Weight is required"
                                          placeholder="Enter Weight"
                                          defaultValue={item.weight}
                                          onValueChange={(value) => {
                                            calculateValue(
                                              `weight`,
                                              value,
                                              ino
                                            );
                                          }}
                                        />
                                      </Td>
                                      <Td>
                                        <FieldSelect
                                          size={'sm'}
                                          name={`weight_uom_id_${ino}`}
                                          options={filterUOMoptions(
                                            uomOptions,
                                            1
                                          )}
                                          required="UOM Weight is required"
                                          defaultValue={item.weight_unit_of_measurement_id.toString()}
                                          onValueChange={(value) => {
                                            calculateValue(
                                              `weight_uom_id`,
                                              value,
                                              ino
                                            );
                                          }}
                                          menuPortalTarget={document.body}
                                        />
                                      </Td>
                                      <Td>
                                        <FieldInput
                                          size={'sm'}
                                          name={`length_${ino}`}
                                          required="Length is required"
                                          placeholder="Enter Length"
                                          defaultValue={item.length}
                                          onValueChange={(value) => {
                                            calculateValue(
                                              `length`,
                                              value,
                                              ino
                                            );
                                          }}
                                        />
                                      </Td>
                                      <Td>
                                        <FieldInput
                                          size={'sm'}
                                          name={`width_${ino}`}
                                          required="Width is required"
                                          placeholder="Enter Width"
                                          defaultValue={item.width}
                                          onValueChange={(value) => {
                                            calculateValue(`width`, value, ino);
                                          }}
                                        />
                                      </Td>
                                      <Td>
                                        <FieldInput
                                          size={'sm'}
                                          name={`height_${ino}`}
                                          required="Height is required"
                                          placeholder="Enter Height"
                                          defaultValue={item.height}
                                          onValueChange={(value) => {
                                            calculateValue(
                                              `height`,
                                              value,
                                              ino
                                            );
                                          }}
                                        />
                                      </Td>
                                      <Td>
                                        <FieldSelect
                                          size={'sm'}
                                          name={`unit_of_measurement_id_${ino}`}
                                          options={filterUOMoptions(
                                            uomOptions,
                                            2
                                          )}
                                          required="Dimension UOM is required"
                                          defaultValue={item.unit_of_measurement_id.toString()}
                                          onValueChange={(value) => {
                                            calculateValue(
                                              `unit_of_measurement_id`,
                                              value,
                                              ino
                                            );
                                          }}
                                          menuPortalTarget={document.body}
                                        />
                                      </Td>

                                      <Td>
                                        <FieldSelect
                                          size={'sm'}
                                          name={`package_type_id_${ino}`}
                                          required="Package type is required"
                                          options={packageTypeOptions}
                                          menuPortalTarget={document.body}
                                          defaultValue={item.package_type_id.toString()}
                                          onValueChange={(value) => {
                                            calculateValue(
                                              `package_type_id`,
                                              value,
                                              ino
                                            );
                                          }}
                                        />
                                      </Td>
                                      <Td>
                                        <FieldInput
                                          size={'sm'}
                                          name={`volumetric_weight_${ino}`}
                                          type="number"
                                          defaultValue={item.volumetric_weight.toString()}
                                          isDisabled={true}
                                          rightElement={<Text>KG</Text>}
                                        />
                                      </Td>
                                    </Tr>
                                  </React.Fragment>
                                )
                              )}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    </Stack>
                  </Stack>
                )}
                <Stack>
                  <FormControl>
                    <FormLabel>Remarks</FormLabel>
                    <FieldInput
                      size={'sm'}
                      name={`remarks`}
                      sx={{ display: 'none' }}
                    />
                    <FieldHTMLEditor
                      onValueChange={handleRemarksChange}
                      maxLength={import.meta.env.VITE_ELABORATE_REMARKS_LENGTH}
                      placeHolder={'Enter Remarks Here'}
                    />
                  </FormControl>
                </Stack>

                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  justify={'center'}
                  mt={4}
                >
                  <Button
                    onClick={handleSave}
                    colorScheme="brand"
                    isLoading={loading}
                  >
                    Save
                  </Button>
                  <Button
                    onClick={() => navigate(-1)}
                    colorScheme="red"
                    isDisabled={loading}
                  >
                    Cancel
                  </Button>
                  {/* <Button onClick={handleSaveAndNew} colorScheme="red">
                     Save & New
                    </Button> */}
                </Stack>
              </Stack>
            </Formiz>

            <CustomerCreateModal
              isOpen={isVendorAddOpen}
              onClose={handleCloseCustomerModal}
            />

            <ShippingAddressCreateModal
              isOpen={isShipAddrAddOpen}
              onClose={onShipAddrAddClose}
            />
          </Stack>
        </LoadingOverlay>
      </Stack>
    </SlideIn>
  );
};

export default STFLatestCreate;
