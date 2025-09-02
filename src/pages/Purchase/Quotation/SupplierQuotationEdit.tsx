import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';
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
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiOutlinePencilAlt, HiX } from 'react-icons/hi';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldUpload } from '@/components/FieldUpload';
import LoadingOverlay from '@/components/LoadingOverlay';
import SearchPopup from '@/components/Popups/Search/PRFQ';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  convertToOptions,
  filterUOMoptions,
  getDisplayLabel,
  formatDate,
  transformToSelectOptions
} from '@/helpers/commonHelper';
import ConditionCreateModal from '@/pages/Submaster/Condition/ConditionCreateModal';
import { getAPICall } from '@/services/apiService';
import { CustomerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import {
  QuotationItemsByRFQPayload,
  SpareDetailsPayload,
} from '@/services/apiService/Schema/SpareSchema';
import { useCustomerList } from '@/services/master/services';
import { usePRFQDetails, usePRFQList } from '@/services/purchase/prfq/services';
import {
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
  rowId?: number;
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

const SupplierrQuotationUpdate = () => {
  let { id } = useParams();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();
  const [showSearchPopup, toggleSearchPopup] = useState<boolean>(false);
  const [popupData, setPopupData] = useState<TODO>({});
  const initialconfirmTitle = 'Edit Item!!';
  const initialconfirmContet = 'Are you sure you want to edit this item?';
  const [confirmationTitle, setConfirmationTitle] =
    useState<string>(initialconfirmTitle);
  const [confirmationContent, setConfirmationContent] =
    useState<string>(initialconfirmContet);
  const [rfqId, setRfqId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [quotationId, setQuotationId] = useState<number | null>(null);
  const [quotationOptions, setQuotationOptions] = useState<SelectOption[]>([]);
  const [rfqItems, setRfqItems] = useState<RFQItems[]>([]);
  const [tabItems, setTabItems] = useState<TODO>([]);
  const [activeItem, setActiveItem] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const counter = useRef(0);
  const [unit_of_measure_id, setUnitOfMeasureId] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [quotationItemsLoading, setQuotationItemsLoading] =
    useState<boolean>(false);
  const [quotationItems, setQuotationItems] = useState<any>([]);
  const [newItemId, setNewItemId] = useState<number | null>(null);
  const [isDuplicate, setIsDuplicate] = useState<boolean>(false);
  const [quoteItemPayload, setQuoteItemPayload] = useState<TODO>({});
  const [formTabValues, setFormTabValues] = useState<TODO>({});
  const [sortDirection, setSortDirection] = useState('desc'); // 'asc' or 'desc'
  const [sortField, setSortField] = useState('created');
  const [isOpen, setIsOpen] = useState(false);
  const [isEditClicked, setisEditClicked] = useState(false);
  const [isUpdateClicked, setisUpdateClicked] = useState(false);
  const [updateItemId, setUpdateItemId] = useState<string | null>(null);
  const [sortedItems, setSortedItems] = useState<any>([]);
  const [maxExpiryDate, setMaxExpiryDate] = useState<string>(
    format(new Date(), 'yyyy-MM-dd')
  );
  const [uomOptions, setUOMOptions] = useState<any>([]);
  const [uomDisabled, setUOMDisabled] = useState<boolean>(true);
  const [formattedUOMOptions, setFormattedUOMOptions] = useState<any>([]);
  const RFQIDRef = useRef<number>(0);
  const setRfqIdDebounced = useRef(
    debounce((value: number) => {
      setRfqId(value), 500;
    })
  ).current;
  const [modalResetKey, setModalResetKey] = useState(0);
  const setCustomerIdDebounced = useRef(
    debounce((value: number) => {
      setCustomerId(value), 500;
    })
  ).current;

  const setQuotationIdDebounced = useRef(
    debounce((value: number | null) => {
      setQuotationId(value), 500;
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
  const [partNumber, setPartNumber] = useState<number>(0);
  const currencyList: UseQueryResult<QueryData, unknown> = useCurrencyList();
  const currencyOptions = transformToSelectOptions(currencyList.data);
  const conditionList = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const uomList = useUnitOfMeasureIndex();
  const { data: customerList } = useCustomerList();
  const { data: rfqDetails } = usePRFQDetails(rfqId ? rfqId : '');
  const rfqCustomerList = rfqDetails?.data.customers ?? [];
  const rfqCustomerOptions = rfqCustomerList.map((customer) => ({
    value: customer.customer_id,
    label: customerList?.items[customer.customer_id] || 'Unknown Customer',
  }));
  const [customerDetails, setCustomerDetails] = useState<TODO>({});
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

  const setExpiryDate = (date: any) => {
    let dateString = new Date(date);
    setMaxExpiryDate(format(dateString, 'yyyy-MM-dd'));
  };

  const closeSearchPopup = (selectedPRFQ: number) => {
    setRfqIdDebounced(Number(selectedPRFQ));
    setRfqId(Number(selectedPRFQ));
    form.setValues({ [`rfq_id`]: selectedPRFQ.toString() });
    toggleSearchPopup(false);
  };

  const getPartOptions = async (partNumberID: Number) => {
    try {
      const respData = await getAPICall(
        endPoints.find.spare_by_partnumber.replace(':id', partNumberID),
        SpareDetailsPayload
      );
      const partNumberList = respData?.part_number?.alternates.map((item: any) => ({
        value: item.alternate_part_number_id,
        label: item.alternate_part_number?.part_number,
      }));
      setPartNumberList(partNumberList);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };
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
      setQuotationItems(respData?.items);
      setQuotationItemsLoading(false);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

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

    form.setValues({ quotation_id: newQuotationOptions[0]?.value });
    if (existingQuotationsOptions.length > 0) {
      form.setValues({ quotation_id: newQuotationOptions[0]?.value });
      setQuotationId(Number(newQuotationOptions[0]?.value));
    } else {
      let obj: any = { quotation_id: newQuotationOptions[0]?.value };
      if (customerId !== null) {
        obj.currency_id = '1';
      }
      form.setValues(obj);
      setQuotationId(null);
    }
  }, [listByRFQCustomer, isError]);

  const quotationDetails = listByRFQCustomer?.quotations.find(
    (item) => item.id === quotationId
  );

  const getCustomerInfo = async () => {
    try {
      const response = await getAPICall(
        endPoints.info.customer.replace(':id', customerId),
        CustomerInfoSchema
      );
      setCustomerDetails(response);
      //setLoading(false);
    } catch (err) {
      //setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    if (partNumberDetails?.part_number) {
      setUnitOfMeasureId(partNumberDetails?.part_number?.unit_of_measure_id);
    }
  }, [partNumberDetails?.part_number]);

  useEffect(() => {
    if (customerId) {
      getCustomerInfo();
    }
  }, [customerId]);

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
    console.log(quotationId, quotationItems);
  }, [quotationId]);

  useEffect(() => {
    setTimeout(() => {
      // Get the current tab values from the form
      const currentTabValues = formTabValues || {};

      // Update only the unit_of_measure for the active tab
      const updatedTabValues = {
        ...currentTabValues,
        [activeTab + 1]: {
          ...currentTabValues[activeTab + 1], // Preserve existing values
          unit_of_measure: unit_of_measure_id.toString(),
        },
      };

      itemForm.setValues({ tabs: updatedTabValues }, { keepPristine: true });
    }, 2000);
  }, [formattedUOMOptions]);

  useEffect(() => {
    if (quotationDetails !== undefined) {
      form.setValues({
        vendor_quotation_no: quotationDetails?.vendor_quotation_no,
        vendor_quotation_date: dayjs(quotationDetails?.vendor_quotation_date),
        expiry_date: dayjs(quotationDetails?.expiry_date),
        remarks: quotationDetails?.remarks,
      });
    } else {
      form.setValues({
        currency_id: '1',
        vendor_quotation_no: '',
        vendor_quotation_date: '',
        expiry_date: '',
        remarks: '',
      });
    }
  }, [quotationDetails]);

  useEffect(() => {
    if (rfqId) {
      RFQIDRef.current = rfqId;
    }
  }, [rfqId]);

  useEffect(() => {
    if (customerDetails?.data) {
      form.setValues({
        currency_id: customerDetails?.data?.data?.currency_id.toString(),
      });
    }
  }, [customerDetails]);

  useEffect(() => {
    if (uomList.data?.items) {
      setUOMOptions(uomList.data?.items);
      setFormattedUOMOptions(convertToOptions(uomList.data?.items));
    }
  }, [uomList.data?.items]);

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

  const handleTabChange = (index: number) => {
    setLoading(true);
    setQuotationItemsLoading(true);
    setActiveTab(index);
    setSortedItems([]);
    if (Object.keys(formTabValues).length > 0) {
      getPartOptions(rfqItems[index].part_number_id);
      setActiveItem(rfqItems[index].part_number_id);
      setPartNumber(rfqItems[index].part_number_id);
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
    if (quotationItems && quotationItems.length > 0) {
      let sortedData = sortData(quotationItems);
      setSortedItems(sortedData);
    }
  }, [quotationItems]);

  const [partNumberList, setPartNumberList] = useState<any>([]);
  

  const updateQuotation = useUpdateQuotation({
    onSuccess: (data) => {
      toastSuccess({
        title: `Quotation Updated ${data.id}`,
      });
      setQuotationId(data.id ?? null);
      handleTabChange(0);
      setQuotationIdDebounced(data.id ?? null);
      refetchListByRFQCustomer();
    },
    onError: (error) => {
      toastError({
        title: 'Quotation Updation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      let payload = {
        id: quotationId ?? 0,
        rfq_id: Number(values.rfq_id),
        customer_id: Number(values.customer_id),
        currency_id: Number(values.currency_id),
        vendor_quotation_no: String(values.vendor_quotation_no),
        vendor_quotation_date: formatDate(values.vendor_quotation_date),
        expiry_date: formatDate(values.expiry_date),
        quotation_file: values.quotation_file,
        remarks: values.remarks,
        items: quotationItems
          .filter(
            (item: any) => Number(quotationId) === Number(item.quotation_id)
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
          })),
      };

      //remove any value which is null
      Object.keys(payload).forEach(
        (key) =>
          payload[key as keyof typeof payload] === null &&
          delete payload[key as keyof typeof payload]
      );

      updateQuotation.mutate(payload);
    },
  });

  const fields = useFormFields({
    connect: form,
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
      console.log(payload);

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
        }
      }
    },
  });

  const openSearchPopup = () => {
    let popupVariables: any = {};
    popupVariables.existingPRFQ = fields[`rfq_id`]?.value;
    setPopupData(popupVariables);
    toggleSearchPopup(true);
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

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, [activeTab]);

  useEffect(() => {
    console.log(formTabValues);
  }, [formTabValues]);

  useEffect(() => {
    if (newItemId) {
      const timer = setTimeout(() => {
        setNewItemId(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [newItemId]);

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
    setConfirmationTitle(initialconfirmTitle);
    setConfirmationContent(initialconfirmContet);
    setIsDuplicate(false);
    setQuoteItemPayload({});
    setIsOpen(false); // Close the modal on cancel or outside click
  };

  const handleOpen = () => {
    setIsOpen(true); // Open the modal
  };

  const handleDeleteItem = (itemId: number) => {
    const updatedItems = sortedItems.filter((item: any) => item.id !== itemId);
    quotationItems?.items.filter((item: any) => item.id !== itemId);
    setSortedItems(updatedItems);
  };

  const handleEditItem = (item: any) => {
    if (updateItemId !== item.id) {
      setUpdateItemId(item.id);
      setisUpdateClicked(true);
      const currentItem = tabItems[activeTab];
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
    }
  };

  const handleChange = (id: number, key: string, value: any) => {
    setFormTabValues((prevData: any) => ({
      ...prevData,
      [id]: {
        ...prevData[id],
        [key]: value,
      },
    }));
  };

  const { data: details } = useQuotationDetails(Number(id));

  useEffect(() => {
    if (details !== undefined) {
      console.log(details?.quotation);
      form.setValues({ [`rfq_id`]: details?.quotation.rfq_id.toString() });
      setRfqId(details?.quotation.rfq_id);
      setCustomerId(Number(details?.quotation.customer_id));
    }
  }, [details]);

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
                  Supplier Pricing
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Supplier Pricing Update</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Supplier Pricing Update
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
          <Flex align="center">
            <Text fontSize={'md'} fontWeight={'700'} width={'100%'}>
              Supplier Pricing Update
              {quotationOptions.length > 1 && (
                <ResponsiveIconButton
                  variant={isEditClicked ? '@primary' : '@primary'}
                  icon={!isEditClicked ? <HiOutlinePencilAlt /> : <HiX />}
                  size={'sm'}
                  fontWeight={'thin'}
                  sx={{ float: 'right' }}
                  onClick={() => {
                    !isEditClicked ? handleOpen() : setisEditClicked(false);
                  }}
                >
                  {isEditClicked ? 'Cancel' : 'Edit'}
                </ResponsiveIconButton>
              )}
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
                <FieldSelect
                  name={'rfq_id'}
                  label={'PRFQ No'}
                  required={'RFQ is required'}
                  options={rfqOptions}
                  placeholder="Select RFQ"
                  size={'sm'}
                  onValueChange={(value) => {
                    setRfqIdDebounced(Number(value));
                    setRfqId(Number(value));
                  }}
                  isDisabled={isEditClicked === true}
                />
                <Stack alignItems="center" display={'flex'}>
                  <Text>&nbsp;</Text>

                  <IconButton
                    aria-label="Open Search"
                    colorScheme="brand"
                    size={'xs'}
                    icon={<SearchIcon />}
                    onClick={openSearchPopup}
                  />
                </Stack>
              </Stack>
              <Stack w={'full'}>
                <FieldSelect
                  key={`${modalResetKey}-${customerId}`}
                  label={'Vendor'}
                  name={'customer_id'}
                  required={'Vendor is required'}
                  options={[
                    ...(rfqCustomerOptions ?? []),
                    {
                      value: 'add_new',
                      label: (
                        <Text color={'brand.500'} textDecoration={'underline'}>
                          + Add New Vendor
                        </Text>
                      ),
                    },
                  ]}
                  defaultValue={customerId}
                  isDisabled={rfqId == null || isEditClicked === true}
                  placeholder="Select Vendor"
                  size={'sm'}
                  onValueChange={(value) => {
                    if (value === 'add_new') {
                      // Open the modal to add a new vendor
                      onVendorAddOpen();
                      setModalResetKey((prevKey) => prevKey + 1);
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
                  style={{ backgroundColor: '#fff' }}
                />
              </Stack>
              <Stack w={'full'}>
                <FieldSelect
                  label={'Quotation'}
                  name={'quotation_id'}
                  options={quotationOptions}
                  defaultValue={quotationOptions[0]?.value}
                  placeholder="Select Quotation"
                  size={'sm'}
                  onValueChange={(value) => {
                    setQuotationIdDebounced(
                      value === 'add_new' ? null : Number(value)
                    );
                    setQuotationId(value === 'add_new' ? null : Number(value));
                  }}
                  isDisabled={
                    quotationOptions[0]?.value === 'add_new' ||
                    isEditClicked === true
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
                  isDisabled={rfqId === null || customerId === null}
                />
              </Stack>
              <Stack w={'full'}>
                <Tooltip
                  label={
                    fields && fields[`remarks`] ? fields[`remarks`].value : ''
                  }
                  aria-label="Username tooltip"
                  placement="top"
                  hasArrow
                  color="white"
                  isDisabled={
                    fields &&
                    fields[`remarks`] &&
                    fields[`remarks`].value &&
                    fields[`remarks`].value.length > 20
                      ? false
                      : true
                  }
                >
                  <FieldInput
                    label="Remarks"
                    name="remarks"
                    placeholder="Remarks"
                    size="sm"
                    isDisabled={isFieldDisabled && isEditClicked === false}
                    maxLength={50}
                  />
                </Tooltip>
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
                  placeholder="Enter Quotation No"
                  size={'sm'}
                  isDisabled={isFieldDisabled && isEditClicked === false}
                  maxLength={20}
                  type='alpha-numeric-with-special'
                  allowedSpecialChars={["-","/"]}
                />
              </Stack>
              <Stack w={'full'}>
                <FieldDayPicker
                  label={'Vendor Quotation Date'}
                  name={'vendor_quotation_date'}
                  placeholder="Select Quotation Date"
                  size={'sm'}
                  onValueChange={(value) => {
                    setExpiryDate(value);
                  }}
                  dayPickerProps={{
                    inputProps: {
                      isDisabled: isFieldDisabled && isEditClicked === false,
                    },
                  }}
                  disabledDays={{ after: new Date(maxExpiryDate) }}
                />
              </Stack>
              <Stack w={'full'}>
                <FieldDayPicker
                  label={'Quotation Expiry Date'}
                  name={'expiry_date'}
                  placeholder="Select Expiry Date"
                  size={'sm'}
                  dayPickerProps={{
                    inputProps: {
                      isDisabled: isFieldDisabled && isEditClicked === false,
                    },
                  }}
                  disabledDays={{ before: new Date(maxExpiryDate) }}
                />
              </Stack>
              <Stack w={'full'} direction={{ base: 'column', md: 'row' }}>
                {quotationId == null && (
                  <FieldUpload
                    label={'Upload'}
                    name="quotation_file"
                    size={'sm'}
                  />
                )}

                {quotationId !== null && (
                  <Box
                    margin={0}
                    padding={0}
                    w={'100%'}
                    justifyContent={'flex-start'}
                  >
                    <Text fontWeight={'500'} fontSize={'sm'}>
                      Quotation File
                    </Text>
                    <DocumentDownloadButton
                      style={{ justifyContent: 'flex-start' }}
                      size={'sm'}
                      mt={2}
                      url={quotationDetails?.quotation_file || ''}
                    />
                  </Box>
                )}
              </Stack>
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
                  isLoading={updateQuotation.isLoading}
                  isDisabled={!form.isValid}
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
              isLazy={false}
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
                        <LoadingOverlay isLoading={loading}>
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
                        </LoadingOverlay>
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
                                  sortField === 'qty' && sortDirection === 'asc'
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
                                  sortField === 'moq' && sortDirection === 'asc'
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
                                  sortField === 'mov' && sortDirection === 'asc'
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
                                      {innerItem.quotation.vendor_quotation_no}
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
                                          onClick={() => handleEditItem(item)}
                                        />
                                        <IconButton
                                          aria-label="Delete Row"
                                          colorScheme="red"
                                          size="sm"
                                          icon={<DeleteIcon />}
                                          onClick={() =>
                                            handleDeleteItem(item?.id)
                                          }
                                          isDisabled={isUpdateClicked}
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
                onClick={() => form.submit()}
                display={'none'}
              >
                Update Quotation
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
            // onClose={() => {
            //   onCNAddClose();
            //   conditionList.refetch();
            // }}
            onClose={handleCloseConditionModal}
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

      <SearchPopup
        isOpen={showSearchPopup}
        onClose={closeSearchPopup}
        data={popupData}
      />
    </SlideIn>
  );
};

export default SupplierrQuotationUpdate;
