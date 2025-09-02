import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import { DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Spinner,
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
  Tooltip,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiOutlinePencilAlt, HiX } from 'react-icons/hi';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldUpload } from '@/components/FieldUpload';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  convertToOptions,
  filterUOMoptions,
  getDisplayLabel,
  formatDate,
  removeHtmlTags,
  transformToSelectOptions
} from '@/helpers/commonHelper';
import ConditionCreateModal from '@/pages/Submaster/Condition/ConditionCreateModal';
import { getAPICall } from '@/services/apiService';
import {
  QuotationItemsByRFQPayload,
  SpareDetailsPayload,
} from '@/services/apiService/Schema/SpareSchema';
import { useCustomerList } from '@/services/master/services';
import { useCustomerDetails } from '@/services/master/services';
import { usePRFQDetails, usePRFQList } from '@/services/purchase/prfq/services';
import {
  useCreateQuotation,
  useCreateQuotationItem,
  useQuotationDetails,
  useQuotationListByRFQCustomer,
  useUpdateQuotation,
} from '@/services/purchase/quotation/services';
import { useFindByPartNumberId } from '@/services/spare/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

import AddCustomerToRFQModal from './AddCustomerToRFQModal';
import AddQuotedPNModal from './AddQuotedPNModal';
import PartDescription from './PartDescription';
import PartDetailText from './PartDetailText';

interface RFQItems {
  condition_id: number;
  id: number;
  part_number_id: number;
  qty: number;
  remark?: string | null;
  rfq_id: number;
  unit_of_measure_id: number;
  items?: any;
}

type QueryData = {
  status: boolean;
  items?: Record<string, string | number>;
};

type SelectOption = {
  value: string | number;
  label: string | number;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

const SupplierPricingUpdate = () => {
  const { quotationId } = useParams();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();
  const { data: quotationData } = useQuotationDetails(Number(quotationId));
  const [rfqId, setRfqId] = useState<number>(0);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [quotationOptions, setQuotationOptions] = useState<SelectOption[]>([]);
  const [rfqItems, setRfqItems] = useState<RFQItems[]>([]);
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const counter = useRef(0);
  const [unit_of_measure_id, setUnitOfMeasureId] = useState<number>(0);
  const [formTabValues, setFormTabValues] = useState<TODO>({});
  // const [totalAvailableQty, setTotalAvailableQty] = useState<number>(0);
  const [newItemId, setNewItemId] = useState<number | null>(null);
  const customerDetails = useCustomerDetails(customerId ?? 0);
  const [loading, setLoading] = useState<boolean>(true);
  const [sortedItems, setSortedItems] = useState<any>([]);
  const [quotationItemsLoading, setQuotationItemsLoading] =
    useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [sortField, setSortField] = useState('created');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditClicked, setisEditClicked] = useState(true);
  const [isUpdateClicked, setisUpdateClicked] = useState(false);
  const [updateItemId, setUpdateItemId] = useState<string | null>(null);
  const [quoteItemPayload, setQuoteItemPayload] = useState<TODO>({});
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const initialconfirmTitle = 'Edit Item!!';
  const initialconfirmContet = 'Are you sure you want to edit this item?';
  const [confirmationTitle, setConfirmationTitle] =
    useState<string>(initialconfirmTitle);
  const [confirmationContent, setConfirmationContent] =
    useState<string>(initialconfirmContet);
  const [isquotationUpdateClicked, setIsquotationUpdateClicked] =
    useState(false);
  const [quotationDetails, setQuotationDetails] = useState<any>({});
  const [uomOptions, setUOMOptions] = useState<any>([]);
  const setRfqIdDebounced = useRef(
    debounce((value: number) => {
      setRfqId(value), 500;
    })
  ).current;

  const setCustomerIdDebounced = useRef(
    debounce((value: number) => {
      setCustomerId(value), 500;
    })
  ).current;

  const {
    isOpen: isVendorAddOpen,
    onOpen: onVendorAddOpen,
    onClose: onVendorAddClose,
  } = useDisclosure();
  const {
    isOpen: isPNAddOpen,
    onOpen: onPNAddOpen,
    onClose: onPNAddClose,
  } = useDisclosure();
  const {
    isOpen: isCNAddOpen,
    onOpen: onCNAddOpen,
    onClose: onCNAddClose,
  } = useDisclosure();

  const rfqList: UseQueryResult<QueryData, unknown> = usePRFQList();
  const rfqOptions = transformToSelectOptions(rfqList.data);

  const currencyList: UseQueryResult<QueryData, unknown> = useCurrencyList();
  const currencyOptions = transformToSelectOptions(currencyList.data);
  const conditionList = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const uomList = useUnitOfMeasureIndex();
  const [quotationItems, setQuotationItems] = useState<any>([]);
  const [partNumber, setPartNumber] = useState<number>(0);
  const [formattedUOMOptions, setFormattedUOMOptions] = useState<any>([]);
  const [uomDisabled, setUOMDisabled] = useState<boolean>(true);
  const { data: customerList } = useCustomerList();
  const { data: rfqDetails } = usePRFQDetails(rfqId ? rfqId : '');
  const rfqCustomerList = rfqDetails?.data.customers ?? [];
  const [tabItems, setTabItems] = useState<TODO>([]);
  const rfqCustomerOptions = rfqCustomerList.map((customer: any) => ({
    value: customer.customer_id,
    label: customerList?.items[customer.customer_id] || 'Unknown Customer',
  }));
  const [partNumberList, setPartNumberList] = useState<any>([]);

  const {
    data: listByRFQCustomer,
    refetch: refetchListByRFQCustomer,
    isError,
  } = useQuotationListByRFQCustomer({
    rfq_id: rfqId ?? undefined,
    customer_id: customerId ?? undefined,
  });

  const { data: partNumberDetails } = useFindByPartNumberId(partNumber, {
    enabled: partNumber !== null && partNumber !== 0,
  });

  useEffect(() => {
    if (partNumberDetails?.part_number) {
      setUnitOfMeasureId(partNumberDetails?.part_number?.unit_of_measure_id);
    }
  }, [partNumberDetails?.part_number]);

  useEffect(() => {
    setisEditClicked(true);
  }, []);

  useEffect(() => {
    if (unit_of_measure_id !== 6) {
      setUOMDisabled(false);
      setFormattedUOMOptions(filterUOMoptions(uomOptions, 2));
    } else {
      setUOMDisabled(true);
      setFormattedUOMOptions(convertToOptions(uomOptions));
    }
  }, [unit_of_measure_id]);

  useEffect(() => {
    console.log(quotationData);
    setRfqId(quotationData ? quotationData?.quotation?.rfq_id : 0);
    setQuotationDetails(quotationData?.quotation);
  }, [quotationData]);

  useEffect(() => {
    if (uomList.data?.items) {
      setUOMOptions(uomList.data?.items);
    }
  }, [uomList]);

  useEffect(() => {
    const existingQuotationsOptions =
      (!isError &&
        listByRFQCustomer?.quotations.map((item) => ({
          value: item.id,
          label: customerId
            ? `${customerList?.items[customerId]} - ${rfqId} - ${item.id}`
            : '',
        }))) ||
      [];

    const newQuotationOptions = [
      ...existingQuotationsOptions,
      {
        value: 'add_new',
        label: 'Add New',
      },
    ];

    setQuotationOptions(newQuotationOptions);
    if (existingQuotationsOptions.length > 0) {
      form.setValues({ quotation_id: newQuotationOptions[0]?.value });
      //setQuotationId(Number(newQuotationOptions[0]?.value));
    } else {
      form.setValues({ quotation_id: newQuotationOptions[0]?.value });
      //setQuotationId(null);
    }
  }, [listByRFQCustomer, isError]);

  useEffect(() => {
    if (quotationDetails && Object.keys(quotationDetails).length > 0) {
      setCustomerId(Number(quotationDetails.customer_id));
      form.setValues({
        rfq_id: quotationDetails?.rfq_id.toString(),
        customer_id: quotationDetails?.customer_id.toString(),
        currency_id: quotationDetails?.currency_id.toString(),
        vendor_quotation_no: quotationDetails?.vendor_quotation_no,
        vendor_quotation_date: dayjs(quotationDetails?.vendor_quotation_date),
        expiry_date: quotationDetails?.expiry_date
          ? dayjs(quotationDetails?.expiry_date)
          : '',
        remarks: quotationDetails?.remarks,
      });
    } else {
      form.setValues({
        rfq_id: '',
        customer_id: '',
        currency_id: '',
        vendor_quotation_no: '',
        vendor_quotation_date: '',
        expiry_date: '',
        remarks: '',
      });
    }
  }, [quotationDetails]);

  useEffect(() => {
    if (rfqDetails?.data.items) {
      setRfqItems(rfqDetails.data.items);
    }if (rfqDetails?.data) {
      if (quotationDetails && Object.keys(quotationDetails).length > 0) {
        if(quotationDetails.remarks === null || quotationDetails.remarks === ''){
          form.setValues({ remarks: removeHtmlTags(rfqDetails?.data?.remarks ?? '') });
        }
      }
      
    }
  }, [rfqDetails]);

  const handleChange = (id: number, key: string, value: any) => {
    setFormTabValues((prevData: any) => ({
      ...prevData,
      [id]: {
        ...prevData[id],
        [key]: value,
      },
    }));
  };

  useEffect(() => {
    if (tabItems && tabItems.length > 0) {
      const newTabValues = tabItems.reduce(
        (acc: any, item: any, index: number) => {
          acc[index + 1] = {
            rowId: item.rowId,
            quoted_pn: item.quoted_pn || '',
            condition: item.condition_id ? item.condition_id.toString() : '',
            available_qty: item.qty || '',
            unit_of_measure: item.unit_of_measure_id
              ? item.unit_of_measure_id.toString()
              : '',
            price: item.price ? item.price.toString() : '',
            moq: item.moq ? item.moq.toString() : '',
            mov: item.mov ? item.mov.toString() : '',
            delivery_options: item.delivery_options
              ? item.delivery_options.toString()
              : '',
            remark: '',
          };
          return acc;
        },
        {}
      );
      console.log(newTabValues);
      setFormTabValues(newTabValues);
      itemForm.setValues({ tabs: newTabValues }, { keepPristine: true });
    }
  }, [tabItems]);

  const handleEditItem = (item: any) => {
    console.log('Before update:', updateItemId, item.id);
    setUpdateItemId(item.id);

    // Use updateItemId directly instead of currentUpdateItem.current
    if (updateItemId !== item.id) {
      setisUpdateClicked(true);
      const currentItem = tabItems[activeTab];

      console.log(currentItem);
      setActiveItem(currentItem.quoted_pn);
      setPartNumber(Number(currentItem.quoted_pn));

      const newTabValues = {
        [activeTab + 1]: {
          quoted_pn: item.part_number_id || '',
          condition: item.condition_id ? item.condition_id.toString() : '',
          available_qty: item.qty || '',
          unit_of_measure: item.unit_of_measure_id
            ? item.unit_of_measure_id.toString()
            : '',
          price: item.price ? item.price.toString() : '',
          moq: item.moq ? item.moq.toString() : '',
          mov: item.mov ? item.mov.toString() : '',
          delivery_options: item.delivery_options
            ? item.delivery_options.toString()
            : '',
          remark: '',
        },
      };
      itemForm.setValues({ tabs: newTabValues }, { keepPristine: true });
      setFormTabValues(newTabValues);
    } else {
      setUpdateItemId(null);
      setisUpdateClicked(false);

      const newTabValues = {
        [activeTab + 1]: {
          quoted_pn: rfqDetails?.data.items[activeTab].part_number_id || '',
          condition: rfqDetails?.data.items[activeTab].condition_id.toString(),
          available_qty: rfqDetails?.data.items[activeTab].qty,
          unit_of_measure: '',
          price: '',
          moq: '',
          mov: '',
          delivery_options: '',
          remark: '',
        },
      };

      itemForm.setValues({ tabs: newTabValues }, { keepPristine: true });
      setFormTabValues(newTabValues);
    }
  };

  const handleTabChange = (index: number) => {
    setLoading(true);
    setActiveTab(index);
    setSortedItems([]);
    if (Object.keys(formTabValues).length > 0) {
      getPartOptions(rfqItems[index].part_number_id);
      setActiveItem(rfqItems[index].part_number_id);
      setPartNumber(rfqItems[index].part_number_id);
    }
  };

  useEffect(() => {
    if (rfqDetails?.data.items) {
      setUnitOfMeasureId(rfqDetails.data.items[0].unit_of_measure_id);
      const rfqItems: any[] = [];
      const items: any[] = [];

      rfqDetails?.data?.items.forEach((item: any) => {
        counter.current += 1;
        const rowId = counter.current;
        rfqItems.push({
          rowId,
          ...item,
        });
        items.push({
          rowId, // Same rowId used in rfqItems
          quoted_pn: item?.part_number_id,
          condition_id: item?.condition_id,
          unit_of_measure_id: item?.unit_of_measure_id,
          qty: item?.qty,
          price: '',
          moq: '',
          mov: '',
          delivery_options: '',
          remark: item?.remark || '',
          is_editable: item?.is_editable ?? true,
        });
      });

      getPartOptions(rfqItems[0].part_number_id);
      setActiveItem(rfqItems[0].part_number_id);
      setPartNumber(rfqItems[0].part_number_id);

      setRfqItems(rfqItems);
      setTabItems(items);
      getPartOptions(rfqDetails.data.items[0]?.part_number_id);
      handleTabChange(0);
    }
  }, [rfqDetails]);

  const getPartOptions = async (partNumberID: Number) => {
    try {
      const respData = await getAPICall(
        endPoints.find.spare_by_partnumber.replace(':id', partNumberID),
        SpareDetailsPayload
      );
      const partNumberList = respData?.part_number?.alternates.map(
        (item: any) => ({
          value: item.alternate_part_number_id,
          label: item.alternate_part_number?.part_number,
        })
      );
      setPartNumberList(partNumberList);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    if (activeItem) {
      setQuotationItemsLoading(true);
      getQuotationitems(activeItem);
      console.log('activeItem', activeItem)
    }
  }, [activeItem]);

  const getQuotationitems = async (partNumberID: Number) => {
    try {
      const respData = await getAPICall(
        endPoints.others.items_by_rfq,
        QuotationItemsByRFQPayload,
        {
          rfq_id: rfqId,
          requested_part_number_id: partNumberID,
        }
      );

      const respItems = respData?.items;
      const filteredItems = respItems.filter(
        (item: any) => item.quotation_id == quotationId
      );
      setQuotationItems(filteredItems);
      setQuotationItemsLoading(false);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const sortData = (items: any[] | undefined) => {
    if (!items) return [];

    return items.sort((a, b) => {
      let valueA, valueB;
      switch (sortField) {
        case 'vendor':
          valueA = a.quotation.customer.business_name.toUpperCase();
          valueB = b.quotation.customer.business_name.toUpperCase();
          break;
        case 'created':
          valueA = new Date(a.created_at);
          valueB = new Date(b.created_at);
          break;
        case 'qty':
          valueA = a.qty; // Numeric comparison for quantity
          valueB = b.qty;
          break;
        case 'price':
          valueA = parseFloat(a.price); // Numeric comparison for price
          valueB = parseFloat(b.price);
          break;
        case 'moq':
          valueA = parseFloat(a.moq); // Numeric comparison for MOQ
          valueB = parseFloat(b.moq);
          break;
        case 'mov':
          valueA = parseFloat(a.mov); // Numeric comparison for MOV
          valueB = parseFloat(b.mov);
          break;
        case 'vendorQuoteNo':
          valueA = a.quotation.vendor_quotation_no.toUpperCase(); // Handle case-insensitivity
          valueB = b.quotation.vendor_quotation_no.toUpperCase();
          break;
        case 'expiryDate':
          valueA = new Date(a.quotation.expiry_date); // Date comparison for expiry date
          valueB = new Date(b.quotation.expiry_date);
          break;
        case 'deliveryOptions':
          valueA = a.delivery_options.toUpperCase(); // Handle case-insensitivity
          valueB = b.delivery_options.toUpperCase();
          break;
        case 'remark':
          valueA = a.remark.toUpperCase(); // Handle case-insensitivity
          valueB = b.remark.toUpperCase();
          break;
        default:
          return 0;
      }

      if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const totalAvailableQty = useMemo(() => {
    return quotationItems
      .filter((item: any) => item.quotation_id == quotationId)
      .reduce((acc: any, item: any) => acc + item.qty, 0);
  }, [quotationItems, quotationId]);

  useEffect(() => {
    console.log(quotationItems);
    let sortedData = sortData(quotationItems);
    setSortedItems(sortedData);
  }, [quotationItems]);

  

  const createQuotation = useCreateQuotation({
    onSuccess: (data) => {
      toastSuccess({
        title: `Quotation Created ${data.id}`,
      });
      refetchListByRFQCustomer();
    },
    onError: (error) => {
      toastError({
        title: 'Quotation Creation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });

  const updateQuotation = useUpdateQuotation({
    onSuccess: (data) => {
      toastSuccess({
        title: `Quotation updated ${data.id}`,
      });
      navigate(`/purchase/quotation`);
    },
    onError: (error) => {
      setIsquotationUpdateClicked(false);
      toastError({
        title: 'Quotation updation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });

  const updateQuotationData = () => {
    setIsquotationUpdateClicked(true);
  };

  const form = useForm({
    onValidSubmit: (values) => {
      let payload: any = {
        rfq_id: Number(values.rfq_id),
        customer_id: Number(values.customer_id),
        currency_id: Number(values.currency_id),
        vendor_quotation_no: String(values.vendor_quotation_no),
        vendor_quotation_date: formatDate(values.vendor_quotation_date),
        expiry_date: formatDate(values.expiry_date),
        quotation_file: values.quotation_file,
        remarks: values.remarks,
      };

      if (isquotationUpdateClicked) {
        payload.id = quotationId;

        payload.items = quotationItems
          .filter(
            (item: any) =>
              Number(quotationId) === Number(item.quotation_id) &&
              item.is_editable === true
          )
          .map((item: any) => ({
            condition_id: item.condition_id,
            delivery_options: item.delivery_options,
            moq: item.moq,
            mov: item.mov,
            part_number_id: item.part_number_id,
            price: item.price,
            qty: item.qty,
            remark: item.remark,
            requested_part_number_id: item.requested_part_number_id,
            unit_of_measure_id: item.unit_of_measure_id,
            ...(item.id && { id: item.id }),
          }));
      }

      Object.keys(payload).forEach(
        (key) =>
          payload[key as keyof typeof payload] === null &&
          delete payload[key as keyof typeof payload]
      );
      if (!isquotationUpdateClicked) {
        updateQuotation.mutate(payload);
      } else {
        updateQuotation.mutate(payload);
      }
    },
  });

  const createQuoteItem = useCreateQuotationItem({
    onSuccess: ({ id }) => {
      getQuotationitems(activeItem ?? 0);
      setNewItemId(id ?? null);
      const updatedTabItems = tabItems.map((item: any, idx: number) =>
        idx === activeTab
          ? {
              ...item,
              ...{
                quoted_pn: rfqItems[activeTab]?.part_number_id,
                condition_id: rfqItems[activeTab]?.condition_id,
                unit_of_measure_id: rfqItems[activeTab]?.unit_of_measure_id,
                qty: rfqItems[activeTab]?.qty,
                price: '',
                moq: '',
                mov: '',
                delivery_options: '',
                remark: rfqItems[activeTab].remark,
              },
            }
          : item
      );

      const newTabValues = {
        [activeTab + 1]: {
          quoted_pn: rfqItems ? rfqItems[activeTab].part_number_id : '',
          condition: rfqItems
            ? rfqItems[activeTab].condition_id.toString()
            : '',
          available_qty: rfqItems ? rfqItems[activeTab].qty : '',
          unit_of_measure: rfqItems
            ? rfqItems[activeTab].unit_of_measure_id.toString()
            : '',
          price: '',
          moq: '',
          mov: '',
          delivery_options: '',
          remark: '',
        },
      };

      setFormTabValues((prevData: any) => ({
        ...prevData,
        [activeTab + 1]: {
          ...prevData[activeTab + 1],
          quoted_pn: rfqItems ? rfqItems[activeTab].part_number_id : '',
          condition: rfqItems
            ? rfqItems[activeTab].condition_id.toString()
            : '',
          available_qty: rfqItems ? rfqItems[activeTab].qty : '',
          unit_of_measure: rfqItems
            ? rfqItems[activeTab].unit_of_measure_id.toString()
            : '',
          price: '',
          moq: '',
          mov: '',
          delivery_options: '',
          remark: '',
        },
      }));

      itemForm.setValues({ tabs: newTabValues }, { keepPristine: true });

      setTabItems(updatedTabItems);
    },
    onError: (error) => {
      toastError({
        title: 'Quotation Item Creation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });

  const handleOpen = () => {
    setIsOpen(true); // Open the modal
  };

  const itemForm = useForm({
    onSubmit: () => {
      const activeTabData = formTabValues[activeTab + 1];
      const payload = {
        quotation_id: Number(quotationId),
        part_number_id: Number(activeTabData?.quoted_pn),
        requested_part_number_id: Number(rfqItems[activeTab].part_number_id),
        condition_id: Number(activeTabData?.condition),
        unit_of_measure_id: Number(activeTabData?.unit_of_measure),
        qty: Number(activeTabData?.available_qty),
        price: Number(activeTabData?.price),
        moq: Number(activeTabData?.moq),
        mov: Number(activeTabData?.mov),
        delivery_options: activeTabData?.delivery_options ?? '',
        remark: activeTabData?.remark ?? '',
        rfq_item_id: Number(rfqDetails?.data?.items[activeTab]?.id),
      };

      const isValueExist = sortedItems.some(
        (item: TODO) =>
          Number(item.condition_id) === Number(activeTabData?.condition) &&
          Number(item.part_number_id) === Number(activeTabData?.quoted_pn) &&
          Number(customerId) === item.quotation.customer.id &&
          Number(activeTabData?.mov) === Number(item.mov) &&
          Number(activeTabData?.moq) === Number(item.moq) &&
          Number(activeTabData?.price) === Number(item.price)
      );
      if (isValueExist) {
        setQuoteItemPayload(payload);
        setIsDuplicate(true);
        setConfirmationTitle('Duplicate Entry!!');
        setConfirmationContent(
          'This condition has already been added for this part number. Do you want to continue?'
        );
        handleOpen();
      } else {
        if (!isUpdateClicked) {
          createQuoteItem.mutate(payload);
        } else {
          const newData = quotationItems.map((item: any) =>
            item.id === updateItemId ? { ...item, ...payload } : item
          );
          setQuotationItems(newData);
          setUpdateItemId(null);
          setisUpdateClicked(false);
          const newTabValues = {
            [activeTab + 1]: {
              quoted_pn: rfqDetails?.data.items[activeTab].part_number_id || '',
              condition:
                rfqDetails?.data.items[activeTab].condition_id.toString(),
              available_qty: rfqDetails?.data.items[activeTab].qty,
              unit_of_measure: '',
              price: '',
              moq: '',
              mov: '',
              delivery_options: '',
              remark: '',
            },
          };

          itemForm.setValues({ tabs: newTabValues }, { keepPristine: true });
        }
      }
    },
  });

  useEffect(() => {
    if (newItemId) {
      const timer = setTimeout(() => {
        setNewItemId(null);
      }, 5000); // Clear highlight after 5 seconds

      return () => clearTimeout(timer); // Clear timeout if the component unmounts
    }
  }, [newItemId]);

  useEffect(() => {
    if (isquotationUpdateClicked) {
      form.submit();
    }
  }, [isquotationUpdateClicked]);

  const isFieldDisabled =
    quotationId !== null || rfqId == null || customerId == null;

  const handleConfirm = () => {
    if (isDuplicate) {
      createQuoteItem.mutate(quoteItemPayload);
      handleClose();
    } else {
      navigate(`/purchase/quotation/pricing/${quotationId}/update`);
    }
  };

  const handleClose = () => {
    setIsOpen(false); // Close the modal on cancel or outside click
  };

  const handleDeleteItem = (itemId: number) => {
    const updatedItems = quotationItems.filter(
      (item: any) => item.id !== itemId
    );
    setQuotationItems(updatedItems);
  };

  const [idxIndex, setIdxIndex] = useState(0);
    const handleCloseConditionModal = (status?: boolean, id?: any) => {
      console.log(status);
      if (status) {
        conditionList.refetch();
        form.setValues({ [`tabs.${idxIndex}.condition`]: id.toString() });
      }
      form.setValues({ [`tabs.${idxIndex}.condition`]: '' });
      onCNAddClose();
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
                <BreadcrumbLink as={Link} to={'/purchase/quotation'}>
                  Supplier Pricing Update
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Edit Supplier Pricing Update</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Edit Supplier Pricing Update
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
          <LoadingOverlay isLoading={loading}>
            <Flex align="center">
              <Text fontSize={'md'} fontWeight={'700'} width={'100%'}>
                Supplier Pricing Update
              </Text>
            </Flex>

            <Formiz autoForm connect={form}>
              <Stack
                spacing={2}
                padding={2}
                direction={{ base: 'column', md: 'row' }}
                mb={2}
              >
                <Stack
                  w={'full'}
                  direction={{ base: 'column', md: 'row' }}
                  alignItems="center"
                  display={'flex'}
                >
                  <Stack w={'full'}>
                    <FieldSelect
                      label={'PRFQ No'}
                      name={'rfq_id'}
                      required={'RFQ is required'}
                      options={rfqOptions}
                      placeholder="Select RFQ"
                      size={'sm'}
                      onValueChange={(value) => {
                        setRfqIdDebounced(Number(value));
                        setRfqId(Number(value));
                      }}
                      isDisabled={isEditClicked === true}
                      className={isEditClicked === true ? 'disabled-input' : ''}
                    />
                  </Stack>
                  <Stack w={'full'}>
                    <FieldSelect
                      key={customerId}
                      label={'Vendor'}
                      name={'customer_id'}
                      required={'Vendor is required'}
                      options={[
                        ...(rfqCustomerOptions ?? []),
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
                      defaultValue={customerId}
                      isDisabled={rfqId == null || isEditClicked === true}
                      className={
                        rfqId == null || isEditClicked === true
                          ? 'disabled-input'
                          : ''
                      }
                      placeholder="Select Vendor"
                      size={'sm'}
                      onValueChange={(value) => {
                        if (value === 'add_new') {
                          // Open the modal to add a new vendor
                          onVendorAddOpen();
                        }
                        setCustomerIdDebounced(Number(value));
                        setCustomerId(Number(value));
                      }}
                    />
                  </Stack>
                  <Stack w={'full'}>
                    <FieldDisplay
                      label="Vendor Code"
                      value={customerDetails?.data?.data?.code || 'NA'}
                      size="sm"
                      style={{ backgroundColor: 'rgb(245 245 235 / 87%)' }}
                    />
                  </Stack>
                  <Stack w={'full'}>
                    <FieldSelect
                      label={'Quotation'}
                      key={quotationId}
                      name={'quotation_id'}
                      options={quotationOptions}
                      defaultValue={quotationOptions[0]?.value}
                      placeholder="Select Quotation"
                      size={'sm'}
                      onValueChange={(value) => {
                        console.log(value);
                        // setQuotationIdDebounced(
                        //   value === 'add_new' ? null : Number(value)
                        // );
                        // setQuotationId(value === 'add_new' ? null : Number(value));
                      }}
                      isDisabled={
                        quotationOptions[0]?.value === 'add_new' ||
                        isEditClicked === true
                      }
                      className={
                        quotationOptions[0]?.value === 'add_new' ||
                        isEditClicked === true
                          ? 'disabled-input'
                          : ''
                      }
                    />
                  </Stack>
                  <Stack w={'full'}>
                    <FieldSelect
                      label={'Currency'}
                      name={'currency_id'}
                      required={'Currency is required'}
                      options={currencyOptions}
                      placeholder="Select Currency"
                      size={'sm'}
                      isDisabled={isFieldDisabled && isEditClicked === false}
                      className={
                        isFieldDisabled && isEditClicked === false
                          ? 'disabled-input'
                          : ''
                      }
                    />
                  </Stack>

                  <Stack w={'full'}>
                    <FieldInput
                      label={'Remarks'}
                      name="remarks"
                      placeholder="Remarks"
                      size={'sm'}
                      isDisabled={isFieldDisabled && isEditClicked === false}
                    />
                  </Stack>
                </Stack>
              </Stack>
              <Stack
                padding={2}
                paddingTop={4}
                paddingBottom={4}
                direction={{ base: 'column', md: 'row' }}
                mb={2}
                borderRadius={'md'}
                boxShadow={'md'}
                borderWidth={1}
                borderColor={'gray.200'}
                backgroundColor="gray.100"
              >
                <Stack w={'full'}>
                  <FieldInput
                    label={'Vendor Quotation No'}
                    name={'vendor_quotation_no'}
                    required={'Quotation No is required'}
                    placeholder="Enter Quotation No"
                    size={'sm'}
                    isDisabled={isFieldDisabled && isEditClicked === false}
                    className={
                      isFieldDisabled && isEditClicked === false
                        ? 'disabled-input'
                        : ''
                    }
                  />
                </Stack>
                <Stack w={'full'}>
                  <FieldDayPicker
                    label={'Vendor Quotation Date'}
                    name={'vendor_quotation_date'}
                    required={'Quotation Date is required'}
                    placeholder="Select Quotation Date"
                    size={'sm'}
                    dayPickerProps={{
                      inputProps: {
                        isDisabled: isFieldDisabled && isEditClicked === false,
                      },
                    }}
                    className={
                      isFieldDisabled && isEditClicked === false
                        ? 'disabled-input'
                        : ''
                    }
                  />
                </Stack>
                <Stack w={'full'}>
                  <FieldDayPicker
                    label={'Quotation Expiry Date'}
                    name={'expiry_date'}
                    required={'Expiry Date is required'}
                    placeholder="Select Expiry Date"
                    size={'sm'}
                    dayPickerProps={{
                      inputProps: {
                        isDisabled: isFieldDisabled && isEditClicked === false,
                      },
                    }}
                  />
                </Stack>
                <FieldUpload
                  label={'Upload'}
                  name="quotation_file"
                  size={'sm'}
                  isDisabled={isFieldDisabled && isEditClicked === false}
                  existingFileUrl={quotationDetails?.quotation_file || ''}
                />
              </Stack>
              {quotationId == null && (
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  justify={'center'}
                  mt={4}
                >
                  <Button
                    mt={4}
                    type="submit"
                    colorScheme="orange"
                    isLoading={createQuotation.isLoading}
                  >
                    Save & Continue
                  </Button>
                </Stack>
              )}
            </Formiz>

            {rfqItems.length > 0 && (
              <Tabs
                variant="enclosed-colored"
                colorScheme="green"
                mt={4}
                onChange={handleTabChange}
                index={activeTab}
                isLazy={false} // Ensure all panels remain mounted.
              >
                <Box overflowX="auto" maxWidth="100%" whiteSpace="nowrap">
                  <TabList display="inline-flex" minWidth="max-content">
                    {rfqItems.map((item, num) => (
                      <Tab key={`tab-${num}`} minWidth="120px">
                        <PartDetailText
                          partNumber={item.part_number_id}
                          hidePopupButtons={true}
                        />
                        <Text as="span" fontSize="xs" ml={2}>
                          ({num + 1} of {rfqItems.length})
                        </Text>
                      </Tab>
                    ))}
                  </TabList>
                </Box>

                <TabPanels>
                  {rfqItems.map((item, index) => (
                    <TabPanel p={4} key={`panel-${index}`}>
                      {/* Top display section */}
                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        bg="white"
                        borderRadius={4}
                        spacing={6}
                        align="flex-start"
                        justify="flex-start"
                      >
                        <Box flex="3">
                          <PartDescription
                            partNumber={item.part_number_id}
                            size="sm"
                          />
                        </Box>
                        <Box flex="1.5">
                          <FieldDisplay
                            label="Requested CN"
                            value={
                              conditionList.data?.items[item.condition_id] ||
                              'N/A'
                            }
                            size="sm"
                          />
                        </Box>
                        <Box flex="1.5">
                          <FieldDisplay
                            label="Requested Qty"
                            value={`${item.qty} ${getDisplayLabel(
                              convertToOptions(uomOptions),
                              item.unit_of_measure_id ?? 0,
                              'uom'
                            )}`}
                            size="sm"
                          />
                        </Box>
                        <Box flex="1.5">
                          <FieldDisplay
                            label="Quoted Total Qty"
                            value={totalAvailableQty ?? 0}
                            size="sm"
                          />
                        </Box>
                        <Box flex="1.5">
                          <FieldDisplay
                            label="UOM"
                            value={getDisplayLabel(
                              convertToOptions(uomOptions),
                              item.unit_of_measure_id ?? 0,
                              'UOM'
                            )}
                            size="sm"
                          />
                        </Box>
                      </Stack>

                      <Formiz connect={itemForm}>
                        <form noValidate onSubmit={itemForm.submit}>
                          <Stack
                            bg="white"
                            borderRadius="md"
                            boxShadow="md"
                            borderWidth={1}
                            borderColor="gray.200"
                            p={4}
                            mt={4}
                            spacing={4}
                            direction={{ base: 'column', md: 'row' }}
                            opacity={quotationId == null ? 0.5 : 1}
                          >
                            <Box flex="2.5">
                              <FieldSelect
                                key={`quoted_pn_${activeTab + 1}_${activeTab}`}
                                defaultValue={
                                  formTabValues[activeTab + 1]
                                    ? formTabValues[activeTab + 1].quoted_pn
                                    : ''
                                }
                                name={`tabs.${activeTab + 1}.quoted_pn`}
                                label="Quoted P/N"
                                options={[
                                  ...(partNumberList ?? []),
                                  {
                                    value: 'add_new',
                                    label: (
                                      <Text
                                        color="brand.500"
                                        textDecoration="underline"
                                      >
                                        + Add New Alt PN
                                      </Text>
                                    ),
                                  },
                                ]}
                                placeholder="Select PN"
                                required="PN is required"
                                size="sm"
                                onValueChange={(value) => {
                                  if (value === 'add_new') {
                                    onPNAddOpen();
                                  } else {
                                    setPartNumber(Number(value));
                                    handleChange(
                                      activeTab + 1,
                                      'quoted_pn',
                                      value
                                    );
                                  }
                                }}
                                isDisabled={quotationId == null}
                              />
                            </Box>
                            <Box flex="1.5">
                              <FieldSelect
                                key={`condition_${activeTab + 1}_${activeTab}`}
                                defaultValue={
                                  formTabValues[activeTab + 1]
                                    ? formTabValues[activeTab + 1].condition
                                    : ''
                                }
                                name={`tabs.${activeTab + 1}.condition`}
                                label="Quo . CN"
                                options={[
                                  ...(conditionOptions ?? []),
                                  {
                                    value: 'add_new',
                                    label: (
                                      <Text
                                        color="brand.500"
                                        textDecoration="underline"
                                      >
                                        + Add New CN
                                      </Text>
                                    ),
                                  },
                                ]}
                                placeholder="Select CN"
                                required="Condition is required"
                                size="sm"
                                onValueChange={(value) => {
                                  if (value === 'add_new') {
                                    onCNAddOpen();
                                    setIdxIndex(activeTab + 1);
                                  } else {
                                    handleChange(
                                      activeTab + 1,
                                      'condition',
                                      value ?? ''
                                    );
                                  }
                                }}
                                isDisabled={quotationId == null}
                              />
                            </Box>
                            <Box flex="1.5">
                              <FieldInput
                                defaultValue={
                                  formTabValues[activeTab + 1]
                                    ? formTabValues[activeTab + 1].available_qty
                                    : ''
                                }
                                key={`available_qty_${activeTab + 1}_${activeTab}`}
                                name={`tabs.${activeTab + 1}.available_qty`}
                                label="Quo.Qty"
                                type={'integer'}
                                placeholder="Quo.Qty"
                                required="Quoted Qty is required"
                                size="sm"
                                isDisabled={quotationId == null}
                                maxLength={9}
                                onValueChange={(value) => {
                                  handleChange(
                                    activeTab + 1,
                                    'available_qty',
                                    value ?? ''
                                  );
                                }}
                              />
                            </Box>
                            <Box flex="1.5">
                              <FieldSelect
                                defaultValue={
                                  formTabValues[activeTab + 1]
                                    ? formTabValues[activeTab + 1]
                                        .unit_of_measure
                                    : ''
                                }
                                key={`unit_of_measure_${activeTab + 1}_${activeTab}`}
                                name={`tabs.${activeTab + 1}.unit_of_measure`}
                                label="UOM"
                                options={formattedUOMOptions}
                                placeholder="Select"
                                size="sm"
                                onValueChange={(value) => {
                                  setUnitOfMeasureId(Number(value));
                                  handleChange(
                                    activeTab + 1,
                                    'unit_of_measure',
                                    value ?? ''
                                  );
                                }}
                                isDisabled={uomDisabled}
                                className="disabled-input"
                              />
                            </Box>
                            <Box flex="2">
                              <FieldInput
                                defaultValue={
                                  formTabValues[activeTab + 1]
                                    ? formTabValues[activeTab + 1].price
                                    : ''
                                }
                                key={`price_${activeTab + 1}_${activeTab}`}
                                name={`tabs.${activeTab + 1}.price`}
                                label="Quoted Price"
                                type={'decimal'}
                                leftElement={
                                  <CurrencyDisplay
                                    currencyId={
                                      quotationDetails?.currency_id?.toString() ??
                                      ''
                                    }
                                  />
                                }
                                placeholder="Price"
                                size="sm"
                                isDisabled={quotationId == null}
                                maxLength={9}
                                onValueChange={(value) => {
                                  handleChange(
                                    activeTab + 1,
                                    'price',
                                    value ?? ''
                                  );
                                }}
                              />
                            </Box>
                            <Box flex="1.5">
                              <FieldInput
                                defaultValue={
                                  formTabValues[activeTab + 1]
                                    ? formTabValues[activeTab + 1].moq
                                    : ''
                                }
                                key={`moq_${activeTab + 1}_${activeTab}`}
                                name={`tabs.${activeTab + 1}.moq`}
                                label="MOQ"
                                type="integer"
                                placeholder="MOQ"
                                size="sm"
                                isDisabled={quotationId == null}
                                maxLength={9}
                                onValueChange={(value) => {
                                  handleChange(
                                    activeTab + 1,
                                    'moq',
                                    value ?? ''
                                  );
                                }}
                              />
                            </Box>
                            <Box flex="1.5">
                              <FieldInput
                                defaultValue={
                                  formTabValues[activeTab + 1]
                                    ? formTabValues[activeTab + 1].mov
                                    : ''
                                }
                                key={`mov_${activeTab + 1}_${activeTab}`}
                                name={`tabs.${activeTab + 1}.mov`}
                                label="MOV"
                                placeholder="MOV"
                                size="sm"
                                isDisabled={quotationId == null}
                                type={'decimal'}
                                leftElement={
                                  <CurrencyDisplay
                                    currencyId={
                                      quotationDetails?.currency_id?.toString() ??
                                      ''
                                    }
                                  />
                                }
                                maxLength={9}
                                onValueChange={(value) => {
                                  handleChange(
                                    activeTab + 1,
                                    'mov',
                                    value ?? ''
                                  );
                                }}
                              />
                            </Box>
                            <Tooltip
                              aria-label="Delivery detail tooltip"
                              placement="top"
                              hasArrow
                              color="white"
                            >
                              <Box flex="3">
                                <FieldInput
                                  // defaultValue={
                                  //   formTabValues[activeTab + 1]
                                  //     ? formTabValues[activeTab + 1]
                                  //         .delivery_options
                                  //     : ''
                                  // }
                                  key={`delivery_options_${activeTab + 1}_${activeTab}`}
                                  label="Delivery detail"
                                  name={`tabs.${activeTab + 1}.delivery_options`}
                                  placeholder="Delivery details"
                                  size="sm"
                                  isDisabled={quotationId == null}
                                  maxLength={25}
                                  onValueChange={(value) => {
                                    handleChange(
                                      activeTab + 1,
                                      'delivery_options',
                                      value ?? ''
                                    );
                                  }}
                                />
                              </Box>
                            </Tooltip>
                            <Tooltip
                              aria-label="Remark tooltip"
                              placement="top"
                              hasArrow
                              color="white"
                            >
                              <Box flex="3">
                                <FieldInput
                                  // defaultValue={
                                  //   formTabValues[activeTab + 1]
                                  //     ? formTabValues[activeTab + 1].remark
                                  //     : ''
                                  // }
                                  key={`remark_${activeTab + 1}_${activeTab}`}
                                  label="Remarks"
                                  name={`tabs.${activeTab + 1}.remark`}
                                  placeholder="Remarks"
                                  size="sm"
                                  isDisabled={quotationId == null}
                                  maxLength={25}
                                  onValueChange={(value) => {
                                    handleChange(
                                      activeTab + 1,
                                      'remark',
                                      value ?? ''
                                    );
                                  }}
                                />
                              </Box>
                            </Tooltip>
                            <Button
                              colorScheme="brand"
                              type="submit"
                              size="sm"
                              px={4}
                              mt={7}
                              isDisabled={
                                createQuoteItem.isLoading || quotationId == null
                              }
                              isLoading={createQuoteItem.isLoading}
                            >
                              {isUpdateClicked ? 'Update' : 'Add'}
                            </Button>
                          </Stack>
                        </form>
                      </Formiz>

                      {/* Table Section */}
                      <TableContainer
                        bg="white"
                        borderRadius="md"
                        boxShadow="md"
                        borderWidth={1}
                        borderColor="gray.200"
                        mt={4}
                      >
                        <Table variant="unstyled" size="sm">
                          <Thead bg="gray.200">
                            <Tr>
                              <Th></Th>
                              <Th
                                cursor="pointer"
                                onClick={() => {
                                  setSortField('vendor');
                                  setSortDirection(
                                    sortDirection === 'asc' ? 'desc' : 'asc'
                                  );
                                }}
                              >
                                Vendor
                                {sortField === 'vendor'
                                  ? sortDirection === 'asc'
                                    ? '↑'
                                    : '↓'
                                  : '↕'}
                              </Th>
                              <Th>Quo.P/N</Th>
                              <Th>Quo.CN</Th>
                              <Th
                                cursor="pointer"
                                onClick={() => {
                                  setSortField('qty');
                                  setSortDirection(
                                    sortField === 'qty' &&
                                      sortDirection === 'asc'
                                      ? 'desc'
                                      : 'asc'
                                  );
                                }}
                              >
                                Quo.Qty
                                {sortField === 'qty'
                                  ? sortDirection === 'asc'
                                    ? '↑'
                                    : '↓'
                                  : '↕'}
                              </Th>
                              <Th>UOM</Th>
                              <Th
                                cursor="pointer"
                                onClick={() => {
                                  setSortField('price');
                                  setSortDirection(
                                    sortField === 'price' &&
                                      sortDirection === 'asc'
                                      ? 'desc'
                                      : 'asc'
                                  );
                                }}
                              >
                                Quo.Pri
                                {sortField === 'price'
                                  ? sortDirection === 'asc'
                                    ? '↑'
                                    : '↓'
                                  : '↕'}
                              </Th>
                              <Th
                                cursor="pointer"
                                onClick={() => {
                                  setSortField('moq');
                                  setSortDirection(
                                    sortField === 'moq' &&
                                      sortDirection === 'asc'
                                      ? 'desc'
                                      : 'asc'
                                  );
                                }}
                              >
                                MOQ
                                {sortField === 'moq'
                                  ? sortDirection === 'asc'
                                    ? '↑'
                                    : '↓'
                                  : '↕'}
                              </Th>
                              <Th
                                cursor="pointer"
                                onClick={() => {
                                  setSortField('mov');
                                  setSortDirection(
                                    sortField === 'mov' &&
                                      sortDirection === 'asc'
                                      ? 'desc'
                                      : 'asc'
                                  );
                                }}
                              >
                                MOV
                                {sortField === 'mov'
                                  ? sortDirection === 'asc'
                                    ? '↑'
                                    : '↓'
                                  : '↕'}
                              </Th>
                              <Th
                                cursor="pointer"
                                onClick={() => {
                                  setSortField('vendorQuoteNo');
                                  setSortDirection(
                                    sortField === 'vendorQuoteNo' &&
                                      sortDirection === 'asc'
                                      ? 'desc'
                                      : 'asc'
                                  );
                                }}
                              >
                                Ven.Quo.No
                                {sortField === 'vendorQuoteNo'
                                  ? sortDirection === 'asc'
                                    ? '↑'
                                    : '↓'
                                  : '↕'}
                              </Th>
                              <Th
                                cursor="pointer"
                                onClick={() => {
                                  setSortField('expiryDate');
                                  setSortDirection(
                                    sortField === 'expiryDate' &&
                                      sortDirection === 'asc'
                                      ? 'desc'
                                      : 'asc'
                                  );
                                }}
                              >
                                Exp.Date
                                {sortField === 'expiryDate'
                                  ? sortDirection === 'asc'
                                    ? '↑'
                                    : '↓'
                                  : '↕'}
                              </Th>
                              <Th
                                cursor="pointer"
                                onClick={() => {
                                  setSortField('deliveryOptions');
                                  setSortDirection(
                                    sortField === 'deliveryOptions' &&
                                      sortDirection === 'asc'
                                      ? 'desc'
                                      : 'asc'
                                  );
                                }}
                              >
                                Del. Dets
                                {sortField === 'deliveryOptions'
                                  ? sortDirection === 'asc'
                                    ? '↑'
                                    : '↓'
                                  : '↕'}
                              </Th>
                              <Th
                                cursor="pointer"
                                onClick={() => {
                                  setSortField('remark');
                                  setSortDirection(
                                    sortField === 'remark' &&
                                      sortDirection === 'asc'
                                      ? 'desc'
                                      : 'asc'
                                  );
                                }}
                              >
                                Remarks
                                {sortField === 'remark'
                                  ? sortDirection === 'asc'
                                    ? '↑'
                                    : '↓'
                                  : '↕'}
                              </Th>
                              <Th
                                cursor="pointer"
                                onClick={() => {
                                  setSortField('created');
                                  setSortDirection(
                                    sortField === 'created' &&
                                      sortDirection === 'asc'
                                      ? 'desc'
                                      : 'asc'
                                  );
                                }}
                              >
                                Created
                                {sortField === 'created'
                                  ? sortDirection === 'asc'
                                    ? '↑'
                                    : '↓'
                                  : '↕'}
                              </Th>
                              {isEditClicked && <Th>Action</Th>}
                            </Tr>
                          </Thead>
                          {quotationItemsLoading ? (
                            <Tbody>
                              <Tr>
                                <Td colSpan={14} textAlign="center">
                                  <Spinner color="green.500" />
                                </Td>
                              </Tr>
                            </Tbody>
                          ) : (
                            <Tbody>
                              {sortedItems && sortedItems.length > 0 ? (
                                sortedItems.map(
                                  (innerItem: TODO, innerIndex: number) => (
                                    <Tr
                                      key={innerItem?.id}
                                      sx={{
                                        backgroundColor:
                                          newItemId === innerItem.id
                                            ? 'yellow'
                                            : innerIndex % 2 === 0
                                              ? !isUpdateClicked
                                                ? 'white'
                                                : updateItemId === innerItem.id
                                                  ? 'gray.300'
                                                  : '#fff'
                                              : !isUpdateClicked
                                                ? 'green.200'
                                                : updateItemId === innerItem.id
                                                  ? 'gray.300'
                                                  : '#fff',
                                        transition: 'background-color 2s ease',
                                      }}
                                    >
                                      <Td>1. {innerIndex + 1}</Td>
                                      <Td>
                                        {
                                          innerItem.quotation.customer
                                            .business_name
                                        }
                                      </Td>
                                      <Td>
                                        <PartDetailText
                                          partNumber={innerItem.part_number_id}
                                        />
                                      </Td>
                                      <Td>
                                        {
                                          conditionList.data?.items[
                                            innerItem.condition_id
                                          ]
                                        }
                                      </Td>
                                      <Td>{innerItem.qty}</Td>
                                      <Td>
                                        {getDisplayLabel(
                                          convertToOptions(uomOptions),
                                          innerItem.unit_of_measure_id.toString(),
                                          'UOM'
                                        )}
                                      </Td>
                                      <Td>
                                        <CurrencyDisplay
                                          currencyId={innerItem.quotation.currency_id.toString()}
                                        />
                                        {innerItem.price}
                                      </Td>
                                      <Td>{innerItem.moq}</Td>
                                      <Td>{innerItem.mov}</Td>
                                      <Td>
                                        {
                                          innerItem.quotation
                                            .vendor_quotation_no
                                        }
                                      </Td>
                                      <Td>
                                        {innerItem.quotation.expiry_date || ''}
                                      </Td>
                                      <Td>{innerItem.delivery_options}</Td>
                                      <Td>{innerItem.remark}</Td>
                                      <Td>
                                        {dayjs(innerItem.created_at).format(
                                          'YYYY-MM-DD'
                                        )}
                                      </Td>
                                      {isEditClicked && (
                                        <Td>
                                          <IconButton
                                            aria-label="Edit Row"
                                            type="button"
                                            colorScheme={
                                              isUpdateClicked &&
                                              updateItemId === innerItem.id
                                                ? 'red'
                                                : 'green'
                                            }
                                            size="sm"
                                            icon={
                                              isUpdateClicked &&
                                              updateItemId === innerItem.id ? (
                                                <HiX />
                                              ) : (
                                                <HiOutlinePencilAlt />
                                              )
                                            }
                                            isDisabled={
                                              innerItem.is_editable === false
                                            }
                                            onClick={() =>
                                              handleEditItem(innerItem)
                                            }
                                          />
                                          <IconButton
                                            aria-label="Delete Row"
                                            colorScheme="red"
                                            size="sm"
                                            icon={<DeleteIcon />}
                                            onClick={() =>
                                              handleDeleteItem(innerItem?.id)
                                            }
                                            isDisabled={
                                              isUpdateClicked ||
                                              innerItem.is_editable === false
                                            }
                                            ml={2}
                                          />
                                        </Td>
                                      )}
                                    </Tr>
                                  )
                                )
                              ) : (
                                <Tr>
                                  <Td colSpan={14} textAlign="center">
                                    No data available
                                  </Td>
                                </Tr>
                              )}
                            </Tbody>
                          )}
                        </Table>
                      </TableContainer>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            )}
          </LoadingOverlay>

          {quotationId !== null && (
            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify={'center'}
              mt={1}
            >
              <Button
                mt={1}
                type="submit"
                colorScheme="orange"
                isLoading={updateQuotation.isLoading}
                onClick={updateQuotationData}
              >
                Update Revision
              </Button>
            </Stack>
          )}

          <AddCustomerToRFQModal
            isOpen={isVendorAddOpen}
            onClose={() => {
              onVendorAddClose();
            }}
            rfqId={rfqId ?? 0}
          />

          <AddQuotedPNModal
            isOpen={isPNAddOpen}
            onClose={() => {
              onPNAddClose();
            }}
            id={activeItem ?? 0}
          />
          <ConditionCreateModal
            isOpen={isCNAddOpen}
            onClose={handleCloseConditionModal}
            // onClose={() => {
            //   onCNAddClose();
            //   conditionList.refetch();
            // }}
          />
        </Stack>
      </Stack>
      <ConfirmationPopup
        isOpen={isOpen}
        onClose={handleClose}
        onConfirm={handleConfirm}
        headerText={confirmationTitle}
        bodyText={confirmationContent}
      />
    </SlideIn>
  );
};

export default SupplierPricingUpdate;
