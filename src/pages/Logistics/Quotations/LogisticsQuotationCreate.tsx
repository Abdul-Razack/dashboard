import React, { useEffect, useState } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Center,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
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
import { Formiz, useForm } from '@formiz/core';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { HiEye } from 'react-icons/hi';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';

import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { transformToSelectOptions, formatDate } from '@/helpers/commonHelper';
import {
  useLRFQDetails,
  useLRFQList,
} from '@/services/logistics/lrfq/services';
import {
  useCreateLogisticOrder,
  useLRQuotationItem,
  useListByLREFQ,
} from '@/services/logistics/quotation/services';
import {
  useCustomerDetails,
  useCustomerList,
} from '@/services/master/services';
import { useFindByPartNumberBulkId } from '@/services/spare/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';

import CustomerDetails from './CustomerDetails';

interface FormData {
  lvq_no: string;
  lvq_date: string;
  vendor: number;
  code: string;
  ship_type: string;
  ship_via: string;
  goods_type: string;
  transit_days: number;
  carrier_name: string;
  currency: number;
  price: number;
  min_weight: number;
  max_weight: number;
  expiry_date: string;
  remarks: string;
}

type useCreateLRFQBody = {
  lrfq_id: number;
  quotation_number: string;
  quotation_date: string;
  customer_id: number;
  ship_type_id: number;
  ship_via_id: number;
  is_dg: boolean;
  transit_day: number;
  carrier_name: string;
  price: number;
  currency_id: number;
  min_weight: number;
  max_weight: number;
  expiry_date: string;
  remark: string;
};

export const LogisticsQuotationCreate = () => {
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const [formKey, setFormKey] = useState(0);

  
  const [lrfqID, setLRFQId] = useState<Number>(0);
  const [customerId, setCustomerId] = useState<Number>(0);
  const [queryParams, setQueryParams] = useState<any>({ lrfq: 0 });
  const listByLREFQ = useListByLREFQ(queryParams);
  const lvqItems = listByLREFQ?.data?.data || [];

  console.log("lvqItems", listByLREFQ)

  let customOptions = {
    items: {
      0: 'DG',
      1: 'Non-DG',
    },
    status: true,
  };
  const initialRef = React.useRef(null);
  // Initial form data
  const initialFormData: FormData = {
    lvq_no: '',
    lvq_date: '',
    vendor: 0,
    code: '',
    ship_type: '',
    ship_via: '',
    goods_type: '',
    transit_days: 0,
    carrier_name: '',
    currency: 0,
    price: 0,
    min_weight: 0,
    max_weight: 0,
    expiry_date: '',
    remarks: '',
  };

  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoading2, setIsLoading2] = useState<boolean>(false);
  const [isPopup, setIsPopup] = useState<boolean>(false);
  const [isPopup2, setIsPopup2] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const handleFormValueChange = <K extends keyof FormData>(
    key: K,
    value: FormData[K]
  ) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [key]: value,
    }));
  };

  const itemForm = useForm({
    onValidSubmit: (values) => {
      setIsLoading(true);
      const payload: useCreateLRFQBody = {
        lrfq_id: Number(lrfqID),
        quotation_number: String(values?.lvq_no),
        quotation_date: formatDate(values?.lvq_date) ?? '',
        customer_id: Number(values?.vendor),
        ship_type_id: Number(values?.ship_type),
        ship_via_id: Number(values?.ship_via),
        is_dg: values?.goods_type === 0 ? true : false,
        transit_day: Number(values?.transit_days),
        carrier_name: String(values?.carrier_name),
        price: Number(values?.price),
        currency_id: Number(values?.currency),
        min_weight: Number(values?.min_weight),
        max_weight: Number(values?.max_weight),
        expiry_date: String(values?.expiry_date) ?? '',
        remark: String(values?.remarks),
      };
      if (lrfqID !== 0) {
        createLrQuotation.mutate(payload);
      }
    },
  });

  const createLrQuotation = useLRQuotationItem({
    onSuccess: () => {
      handleRemarksChange('');
      setFormData(initialFormData);
      setIsLoading(false);
      setFormKey((prevKey) => prevKey + 1);
      itemForm.reset();
      if (lrfqID) {
        setQueryParams({ lrfq: lrfqID });
        listByLREFQ.refetch();
      }
      toastSuccess({
        title: `LR Quotation Created`,
      });
    },
    onError: (error) => {
      setIsLoading(false);
      toastError({
        title: 'LR Quotation Creation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });
  const shipTypeList = useShipTypesList();
  const currencyList = useCurrencyList();
  const shipViaList = useShipViaList();
  const lrfqList = useLRFQList();
  const customerList = useCustomerList({ type: 'freight' });
  const goodsTypeOptions = transformToSelectOptions(customOptions);
  const shipTypeOptions = transformToSelectOptions(shipTypeList?.data);
  const shipViaOptions = transformToSelectOptions(shipViaList?.data);
  const currencyOptions = transformToSelectOptions(currencyList?.data);
  const lrfqOptions = transformToSelectOptions(lrfqList?.data);
  const [lrDetails, setLRDetails] = useState<TODO>({});
  const [lrfqDetails, setLRFQDetails] = useState<TODO>({});
  const [lrPackages, setLRPackages] = useState<TODO>([]);
  const [lrItems, setLRItems] = useState<TODO>([]);
  // Data handleing
  const { data: lrfqData, isLoading: lrfqLoader } = useLRFQDetails(
    Number(lrfqID),
    {
      enabled: lrfqID !== 0,
    }
  );

  const handleRemarksChange = (newValue: string) => {
    itemForm.setValues({ [`remarks`]: newValue });
  };

  const handleItemCheckboxChange = (itemId: number) => {
    setSelectedItems((prevItems) => {
      if (prevItems.includes(itemId)) {
        const filteredItems = prevItems.filter((id) => id !== itemId);
        return filteredItems;
      } else {
        const newItems = [...prevItems, itemId];
        return newItems;
      }
    });
  };

  const handleCreateLogisticOrder = () => {
    setIsLoading2(true);
    const payload = {
      logistic_quotation_ids: selectedItems,
    };
    createLogisticOrder.mutate(payload);
  };

  const createLogisticOrder = useCreateLogisticOrder({
    onSuccess: () => {
      setIsLoading2(false);
      if (lrfqID) {
        setSelectedItems([]);
        listByLREFQ.refetch();
      }
      toastSuccess({
        title: 'LO Created',
      });
    },
    onError: (error) => {
      setIsLoading2(false);
      toastError({
        title: 'LO Creation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });
  const [freightOptions, setFreightOptions] = useState<TODO>([]);
  const [vendorOptions, setVendorOptions] = useState<TODO>([]);

  //reArrangeOptions(customerList?.data?.items || {}, lrfqDetails?.lr_customers || []);

  const { data: customerInfo } = useCustomerDetails(Number(customerId), {
    enabled: customerId !== 0,
  });

  useEffect(() => {
    if (customerList?.data) {
      const options = transformToSelectOptions(customerList.data);
      setFreightOptions(options);
      setVendorOptions(options);
    }
  }, [customerList?.data]);

  useEffect(() => {
    if (!lrfqData?.data || !lrfqData.data.logistic_request) return;
  
    const { logistic_request, ...restData } = lrfqData.data;
    setLRFQDetails(restData);
  
    const { packages = [], items = [], ...restLRDetails } = logistic_request;
  
    console.log('items', items);
  
    setLRDetails(restLRDetails);
    setLRPackages(packages);
    setLRItems(items);
  }, [lrfqData?.data?.logistic_request]);

  useEffect(() => {
    if (lrDetails?.customer_id) {
      setCustomerId(lrDetails?.customer_id);
    }
  }, [lrDetails]);

  useEffect(() => {
    if (lrfqDetails) {
      console.log(lrfqDetails);
      const uniqIds =
        lrfqDetails?.lr_customers?.map((customer: any) =>
          String(customer.customer_id)
        ) ?? [];

      const options = freightOptions.filter((item: any) =>
        uniqIds.includes(item.value)
      );
      setVendorOptions(options);
    }
  }, [lrfqDetails]);

  useEffect(() => {
    if (vendorOptions.length > 0) {
      setTimeout(() => {
        itemForm.setValues({
          [`vendor`]: vendorOptions[0].value,
        });
      }, 500);
    }
  }, [vendorOptions]);

  useEffect(() => {
    if (customerInfo?.data) {
      itemForm.setValues({
        [`code`]: customerInfo?.data?.code,
      });
    }
  }, [customerInfo]);

  const handlePopup2 = () => {
    setIsPopup2(true);
    setIsPopup(false);
  };

  const partNumberFinalIds: number[] =
    Array.isArray(lrItems) && lrItems.length > 0
      ? [...new Set(lrItems.map((item) => item.part_number_id))]
      : [0];

  const partNumderDetails = useFindByPartNumberBulkId(partNumberFinalIds);

  const getPartNumberById = (part_id: number): string => {
    const partNumberData = partNumderDetails?.data;
    const partNumberIpData = partNumberData?.[part_id || 0];

    if (typeof partNumberIpData === 'object' && part_id !== null) {
      return partNumberIpData?.part_number?.part_number ?? '';
    }

    return 'N/A';
  };

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
                <BreadcrumbLink as={Link} to="/logistics/quotation">
                  Logistics Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Add Logistic Vendor Quotation</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Add Logistic Vendor Quotation
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
            Logistics Vendor Quotation
          </Text>
          <LoadingOverlay isLoading={lrfqLoader}>
          <Formiz autoForm connect={itemForm}>
            <Stack spacing={2} borderRadius={'md'} boxShadow={'md'} mb={2}>
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  display={{ base: 'inherit', md: 'flex' }}
                  bg={'gray.100'}
                  p={6}
                  borderRadius={4}
                  spacing={4}
                  align={'flex-start'}
                  justify={'flex-start'}
                >
                  <FieldSelect
                    label="Lrfq No"
                    name={'lrfq_id'}
                    placeholder="Select..."
                    options={lrfqOptions}
                    required={'LRFQ is required'}
                    onValueChange={(value) => {
                      setLRFQId(Number(value)), setQueryParams({ lrfq: value });
                    }}
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Lrfq Date"
                    value={
                      lrfqDetails?.created_at
                        ? format(
                            new Date(lrfqDetails?.created_at),
                            'yyyy-MM-dd'
                          )
                        : 'N/A'
                    }
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Consignor/Shipper"
                    value={
                      lrDetails?.customer_shipping_address?.customer
                        ?.business_name || 'N/A'
                    }
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Consignee/Receiver"
                    value={
                      lrDetails?.receiver_shipping_address?.customer
                        ?.business_name || 'N/A'
                    }
                    size={'sm'}
                  />
                </Stack>
            </Stack>
            <Stack
              spacing={2}
              p={4}
              bg={'white'}
              borderRadius={'md'}
              boxShadow={'md'}
              mt="2"
            >
              {/*  Start */}
              <Stack>
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  display={{ base: 'inherit', md: 'flex' }}
                  align={'flex-start'}
                  justify={'flex-start'}
                >
                  <FieldDisplay
                    label="No of pkgs"
                    value={lrfqDetails?.no_of_package || '0'}
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="No of pcs"
                    value={lrDetails?.pcs || 'N/A'}
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="Volumetric Wt"
                    value={
                      lrfqDetails?.volumetric_weight
                        ? `${Number(lrfqDetails.volumetric_weight).toFixed(3)} KG`
                        : '0 KG'
                    }
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="LR No"
                    value={
                      lrfqDetails?.lr_customers?.[0]?.logistic_request_id ||
                      'N/A'
                    }
                    size={'sm'}
                  />
                  <FieldDisplay
                    label="LR Date"
                    value={
                      lrDetails?.created_at
                        ? format(new Date(lrDetails?.created_at), 'yyyy-MM-dd')
                        : 'N/A'
                    }
                    size={'sm'}
                  />
                  <FormControl>
                    <FormLabel>
                      <p>Package Details :</p>
                    </FormLabel>
                    <ResponsiveIconButton
                      variant={'@primary'}
                      icon={<HiEye />}
                      size={'sm'}
                      top={'-5px'}
                      isDisabled={lrPackages.length === 0}
                      onClick={() => {
                        setIsPopup(!isPopup);
                      }}
                    >
                      View Package
                    </ResponsiveIconButton>
                  </FormControl>
                </Stack>
              </Stack>
              {/* Form Start */}
              <Stack>
                  <Stack spacing={2}>
                    <Stack
                      spacing={8}
                      direction={{ base: 'column', md: 'row' }}
                      py={4}
                      px={0}
                      mb={2}
                    >
                      <FieldSelect
                        key={`vendor_${formKey}`}
                        label="Vendor"
                        name={'vendor'}
                        placeholder="Select..."
                        options={vendorOptions}
                        required={'Vendor is required'}
                        size={'sm'}
                        onValueChange={(value) => {
                          handleFormValueChange('vendor', Number(value));
                        }}
                      />
                      <FieldInput
                        key={`code_${formKey}`}
                        label="Vendor Code"
                        name="code"
                        placeholder="Vendor Code"
                        size={'sm'}
                        isReadOnly={true}
                      />
                      <FieldInput
                        type="text"
                        key={`lvq_no_${formKey}`}
                        label="LVQ No"
                        name="lvq_no"
                        placeholder="Type Lvq no"
                        size={'sm'}
                        defaultValue={formData?.lvq_no ?? 'N/A'}
                        required={'Lvq no is required'}
                      />
                      <FieldDayPicker
                        key={`lvq_date_${formKey}`}
                        name="lvq_date"
                        label="LVQ Date"
                        placeholder="Select Lvq date"
                        borderColor={'gray.200'}
                        size={'sm'}
                        required={'Lvq date is required'}
                        defaultValue={
                          formData?.lvq_date
                            ? dayjs(formData?.lvq_date)
                            : undefined
                        }
                        onValueChange={(value) => {
                          handleFormValueChange('lvq_date', String(value));
                          handleFormValueChange('expiry_date', '');
                        }}
                      />

                      <FieldDayPicker
                        key={`expiry_date_${formKey}`}
                        name="expiry_date"
                        label="LVQ Expiry Date"
                        placeholder="Select Expiry date"
                        borderColor={'gray.200'}
                        size={'sm'}
                        disabledDays={{ before: (formData?.lvq_date
                            ? new Date(formData?.lvq_date) : new Date()) }}
                        required={'Expiry date is required'}
                        defaultValue={
                          formData?.expiry_date
                            ? dayjs(formData?.expiry_date)
                            : undefined
                        }
                        dayPickerProps={{
                              inputProps: {
                                isDisabled: !formData?.lvq_date,
                              },
                            }}
                        onValueChange={(value) => {
                          handleFormValueChange('expiry_date', String(value || ''));
                        }}
                      />
                    </Stack>
                    <Stack
                      spacing={8}
                      direction={{ base: 'column', md: 'row' }}
                      py={4}
                      px={0}
                      mb={2}
                    >
                      <FieldSelect
                        key={`ship_type_${formKey}`}
                        label="Ship Type"
                        name="ship_type"
                        placeholder="Select..."
                        options={shipTypeOptions}
                        size={'sm'}
                        defaultValue={formData?.ship_type ?? ''}
                        required={'Ship type is required'}
                      />
                      <FieldSelect
                        key={`ship_via_${formKey}`}
                        name="ship_via"
                        label="Ship Via"
                        placeholder="Select..."
                        options={shipViaOptions}
                        size={'sm'}
                        defaultValue={formData?.ship_via ?? ''}
                        required={'Ship via is required'}
                      />
                      <FieldSelect
                        key={`goods_type_${formKey}`}
                        name="goods_type"
                        label="Goods Type"
                        placeholder="Select..."
                        options={goodsTypeOptions}
                        size={'sm'}
                        defaultValue={formData?.goods_type ?? ''}
                      />
                      <FieldInput
                        key={`transit_days_${formKey}`}
                        label="Transit Days"
                        name="transit_days"
                        placeholder="Type transit days"
                        size={'sm'}
                        type="integer"
                        required={'Transit days is required'}
                        defaultValue={formData?.transit_days ?? ''}
                      />
                      <FieldInput
                        key={`carrier_name_${formKey}`}
                        label="Carrier Name"
                        name="carrier_name"
                        placeholder="Type carrier name"
                        size={'sm'}
                        defaultValue={formData?.carrier_name ?? 'N/A'}
                        required={'Carrier name is required'}
                      />
                      <FieldInput
                        key={`price_${formKey}`}
                        label="Price"
                        name="price"
                        placeholder="Type price"
                        size={'sm'}
                        type="integer"
                        required={'Price is required'}
                        defaultValue={formData?.price ?? ''}
                        maxLength={10}
                      />
                      <FieldSelect
                        key={`currency_${formKey}`}
                        label="Currency"
                        name={'currency'}
                        placeholder="Select..."
                        options={currencyOptions}
                        defaultValue={formData?.currency ?? ''}
                        required={'Currency is required'}
                        size={'sm'}
                      />
                    </Stack>
                    {/* <Stack
                      spacing={8}
                      direction={{ base: 'column', md: 'row' }}
                      py={8}
                      px={0}
                      mb={2}
                    >
                      <FieldInput
                        key={`min_weight_${formKey}`}
                        label="Min Weight"
                        name="min_weight"
                        placeholder="Type min weight"
                        size={'sm'}
                        type="integer"
                        defaultValue={formData?.min_weight ?? ''}
                        onValueChange={(value) => {
                          handleFormValueChange('min_weight', Number(value));
                          handleFormValueChange('max_weight', 0);
                          itemForm.setValues({ [`max_weight`]: 0 });
                        }}
                        required={'Min weight is required'}
                        maxLength={9}
                      />
                      <FieldInput
                        type="integer"
                        key={`max_weight_${formKey}`}
                        label="Max Weight"
                        name="max_weight"
                        placeholder="Type max weight"
                        size={'sm'}
                        defaultValue={formData?.max_weight ?? ''}
                        required={'Max weight is required'}
                        isDisabled={formData.min_weight === 0}
                        onValueChange={(value) => {
                          handleFormValueChange('max_weight', Number(value));
                        }}
                        maxLength={9}
                        validations={[
                          {
                            handler: (value: any) => {
                              if (!value || value === '') return true;
                              const numValue = Number(value);
                              return numValue >= (formData?.min_weight || 0);
                            },
                            message: `Max weight must be ≥ Min weight`,
                          },
                        ]}
                      />
                      
                    </Stack> */}
                    <Stack
                      spacing={8}
                      direction={{ base: 'column', md: 'row' }}
                      py={4}
                      px={0}
                      mb={2}
                    >
                      <FormControl>
                        <FormLabel>Remarks</FormLabel>
                        <FieldInput
                          name={`remarks`}
                          size={'sm'}
                          sx={{ display: 'none' }}
                        />
                        <FieldHTMLEditor
                          key={`remarks_${formKey}`}
                          onValueChange={handleRemarksChange}
                          maxLength={250}
                          placeHolder={'Enter Remarks Here'}
                        />
                      </FormControl>
                    </Stack>
                    <HStack justifyContent={'center'} mt={2}>
                      <HStack spacing={2} align="center" marginTop={'1rem'}>
                        <Button
                          colorScheme="brand"
                          type="submit"
                          isLoading={isLoading}
                        >
                          Save
                        </Button>
                        <Button
                          colorScheme="red"
                          onClick={() => navigate(-1)}
                          // onClick={() => {
                          //   itemForm.reset(),
                          //     setIsLoading(false),
                          //     setFormData(initialFormData);
                          // }}
                        >
                          Cancel
                        </Button>
                      </HStack>
                    </HStack>
                  </Stack>
              </Stack>
              {/* End */}
              <HStack justify={'space-between'}>
                <Text fontSize={'md'} fontWeight={'700'}>
                  Log Quotation Info
                </Text>
                <Button
                  colorScheme="brand"
                  mr={3}
                  size={'sm'}
                  onClick={() => {
                    handleCreateLogisticOrder();
                  }}
                  isDisabled={!(selectedItems?.length !== 0)}
                  isLoading={isLoading2}
                >
                  Create Lo
                </Button>
              </HStack>
              <TableContainer
                boxShadow={'md'}
                borderColor={'gray.200'}
                overflow={'auto'}
                mt={2}
              >
                <Table variant="striped" colorScheme="teal" size={'sm'}>
                  <Thead bg={'gray'}>
                    <Tr>
                      <Th color={'white'}>Select</Th>
                      <Th color={'white'}>Line Item</Th>
                      <Th color={'white'}>LVQ NO</Th>
                      <Th color={'white'}>Log Vendor Ref</Th>
                      <Th color={'white'}>Log Vendor</Th>
                      <Th color={'white'}>Ship type</Th>
                      <Th color={'white'}>ship via</Th>
                      <Th color={'white'}>Transit days</Th>
                      <Th color={'white'}>Carrier Name</Th>
                      <Th color={'white'}>Total Price</Th>
                      <Th color={'white'}>Currency</Th>
                      <Th color={'white'}>Remarks</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {lvqItems.length > 0 &&
                      lvqItems.map((item, index) => {
                        return (
                          <Tr key={`item-lrfq-list_${index + 1}`}>
                            <Td>
                              <Checkbox
                                isChecked={selectedItems.includes(item.id)}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleItemCheckboxChange(item.id);
                                }}
                                borderColor={'black'}
                              />
                            </Td>
                            <Td>{index + 1}</Td>
                            <Td>{item?.quotation_number}</Td>
                            <Td>
                              <CustomerDetails
                                id={item?.customer_id}
                                field="code"
                              />
                            </Td>
                            <Td>
                              <CustomerDetails
                                id={item?.customer_id}
                                field="business_name"
                              />
                            </Td>
                            <Td>
                              {shipTypeList?.data?.items[item?.ship_type_id]}
                            </Td>
                            <Td>
                              {shipViaList?.data?.items[item?.ship_via_id]}
                            </Td>
                            <Td>{item?.transit_day} days</Td>
                            <Td>{item?.carrier_name}</Td>
                            <Td isNumeric>{item?.price}</Td>
                            <Td>
                              {currencyList?.data?.items[item?.currency_id]}
                            </Td>
                            <Td>
                              <Text
                                dangerouslySetInnerHTML={{
                                  __html: item?.remark ? item?.remark : ' - ',
                                }}
                              ></Text>
                            </Td>
                          </Tr>
                        );
                      })}
                  </Tbody>
                </Table>
                {lvqItems.length === 0 && (
                  <>
                    {!isLoading ? (
                      <Center p="4">
                        <Text>No items to display</Text>
                      </Center>
                    ) : (
                      <Stack m={'3rem'}>
                        <LoadingOverlay isLoading={true} />
                      </Stack>
                    )}
                  </>
                )}
              </TableContainer>
            </Stack>
            </Formiz>
          </LoadingOverlay>
        </Stack>
        <Modal
          initialFocusRef={initialRef}
          isOpen={isPopup}
          size={'5xl'}
          onClose={() => setIsPopup(!isPopup)}
          closeOnOverlayClick={false} 
          closeOnEsc={false}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Package Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={12}>
              {lrPackages.length > 0 ? (
                <Box
                  borderColor={'gray.200'}
                  flexGrow={'1'}
                  backgroundColor="white"
                  whiteSpace="white-space"
                >
                  <TableContainer>
                    <Table variant="unStyled">
                      <Thead bg={'gray'}>
                        <Tr>
                          <Th color={'white'}>S.No</Th>
                          <Th color={'white'}>Package</Th>
                          <Th color={'white'}>Description</Th>
                          <Th color={'white'}>Length, Width, Height</Th>
                          <Th color={'white'}>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody border="1px solid #fecdd3">
                        {lrPackages.map((item: any, index: number) => (
                          <Tr
                            sx={{
                              backgroundColor:
                                index % 2 === 0 ? '#ffffff' : 'red.200',
                              transition: 'background-color 2s ease',
                            }}
                            key={`item-package_${index + 1}`}
                          >
                            <Td>{index + 1}</Td>
                            <Td>{item?.package_number}</Td>
                            <Td>{item?.description}</Td>
                            <Td>{`L: ${item?.length || 'N/A'} |  W : ${item?.width || 'N/A'} |  H : ${item?.height || 'N/A'}`}</Td>
                            <Td textAlign={'center'}>
                              <IconButton
                                aria-label="View Items"
                                colorScheme="cyan"
                                size={'sm'}
                                icon={<HiEye />}
                                onClick={() => {
                                  handlePopup2();
                                }}
                                minWidth={'1.5rem'}
                                h={'1.5rem'}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Center>No package details found!</Center>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
        <Modal
          initialFocusRef={initialRef}
          isOpen={isPopup2}
          size={'5xl'}
          onClose={() => setIsPopup2(!isPopup2)}
        >
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Items Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={12}>
              {lrItems.length > 0 ? (
                <Box
                  borderColor={'gray.200'}
                  flexGrow={'1'}
                  backgroundColor="white"
                  whiteSpace="white-space"
                >
                  <TableContainer>
                    <Table variant="unStyled">
                      <Thead bg={'gray'}>
                        <Tr>
                          <Th color={'white'}>S.No</Th>
                          <Th color={'white'}>Condition Id</Th>
                          <Th color={'white'}>LR Id</Th>
                          <Th color={'white'}>Part No</Th>
                          <Th color={'white'}>PO Id</Th>
                          <Th color={'white'}>Qty</Th>
                        </Tr>
                      </Thead>
                      <Tbody border="1px solid #fecdd3">
                        {lrItems.map((item: any, index: number) => (
                          <Tr
                            sx={{
                              backgroundColor:
                                index % 2 === 0 ? '#ffffff' : 'red.200',
                              transition: 'background-color 2s ease',
                            }}
                            key={`item-package_${index + 1}`}
                          >
                            <Td>{index + 1}</Td>
                            <Td>{item?.condition_id}</Td>
                            <Td>{item?.logistic_request_id}</Td>
                            <Td>{getPartNumberById(item?.part_number_id)}</Td>
                            <Td>{item?.purchase_order_id}</Td>
                            <Td>{item?.qty}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Box>
              ) : (
                <Center>No Items found!</Center>
              )}
            </ModalBody>
          </ModalContent>
        </Modal>
      </Stack>
    </SlideIn>
  );
};

export default LogisticsQuotationCreate;
