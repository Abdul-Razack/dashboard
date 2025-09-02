import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Checkbox,
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
  useDisclosure,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import Axios from 'axios';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiEye } from 'react-icons/hi';
import { useQueries, useQueryClient } from 'react-query';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import ConfirmationPopup from '@/components/ConfirmationPopup';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { ModalPopup } from '@/components/Popups/PurchaseOrder';
import SearchPopup from '@/components/Popups/Search/Quotation';
import PreviewPopup from '@/components/PreviewContents/Purchase/PurchaseOrder';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { convertToOptions, formatShippingAddress, formatContactAddress,transformToSelectOptions } from '@/helpers/commonHelper';
import ContactManagerCreateModal from '@/pages/Master/ContactManager/ContactManagerCreateModal';
import ShippingAddressCreateModal from '@/pages/Master/ShippingAddress/ShippingAddressCreateModal';
import { getAPICall } from '@/services/apiService';
import { CustomerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import {
  useContactManagerDetails,
  useContactManagerListById,
} from '@/services/master/contactmanager/services';
import { useCustomerSupplierList } from '@/services/master/services';
import { usePRFQDetails } from '@/services/purchase/prfq/services';
import {
  useCreatePurchaseOrder,
  useCreatePurchaseOrderBody,
} from '@/services/purchase/purchase-orders/services';
import {
  useQuotationDetails,
  useQuotationList,
  useQuotationRelatedList,
} from '@/services/purchase/quotation/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { useFOBList } from '@/services/submaster/fob/services';
import { usePaymentModeList } from '@/services/submaster/paymentmode/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useShipAccountIndex } from '@/services/submaster/ship-account/services';
import { useShipModesList } from '@/services/submaster/ship-modes/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

import PartDetailText from '../Quotation/PartDetailText';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type QuotationItems = {
  condition_id: number;
  delivery_options: string | null;
  id: number;
  moq: number;
  mov: string | null;
  part_number_id: number;
  price: string;
  qty: number;
  quotation_id: number;
  remark: string | null;
  unit_of_measure_id: number;
  is_group?: boolean;
  is_checked?: boolean;
  is_disabled?: boolean;
  grouped_id?: number;
};

const PurchaseOrderCreate = () => {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<TODO>([]);
  const [quotationId, setQuotationId] = useState<number>(0);
  const [relatedQuotationIds, setRelatedQuotationIds] = useState<number[]>([]);
  const [allQuotationPRFQIds, setAllQuotationPRFQIds] = useState<number[]>([]);
  const [allPRFQMRIds, setAllPRFQMRIds] = useState<number[]>([]);
  const [allPRFQMRRefs, setAllPRFQMRRefs] = useState<string[]>([]);
  const [contactManager, setContactManager] = useState<number>(0);
  const lastSetQuotationId = useRef<number | null>(null);
  const [priority, setPriority] = useState<number>(0);
  const [shippingAddress, setShippingAddress] = useState<number>(0);
  const [customerId, setCustomerId] = useState<number>(0);
  const [currencyId, setCurrencyId] = useState<number>(0);
  const [editableItems, setEditableItems] = useState<QuotationItems[]>([]);
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [itemsToFilter, setFilterItems] = useState<TODO>([]);
  const [isFilterApplied, setFilterApplied] = useState<Boolean>(false);
  const actionRef = useRef<'save' | 'saveAndNew'>('save');
  const [activeInput, setactiveInput] = useState('');
  const [fullContactAddress, setFullContactAddress] = useState('');
  const [fullVendorAddress, setFullVendorAddress] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>([]);
  const [partNumberId, setPartNumberId] = useState<any>(null);
  const [popupOptions, setPopupOptions] = useState<TODO>({});
  const [buttonEnabled, setButtonEnable] = useState<boolean>(false);
  const [groupedIDs, setGroupedIDs] = useState<any>([]);
  const [vendorQuoteNos, setVendorQuoteNos] = useState<TODO>([]);
  const [vendorQuoteDates, setVendorQuoteDates] = useState<TODO>([]);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [poPaylod, setPOPaylod] = useState<TODO>({});
  const [showSearchPopup, toggleSearchPopup] = useState<boolean>(false);

  const {
    isOpen: isShipAddrAddOpen,
    onOpen: onShipAddrAddOpen,
    onClose: onShipAddrAddClose,
  } = useDisclosure();

  const {
    isOpen: isCMAddOpen,
    onOpen: onCMAddOpen,
    onClose: onCMAddClose,
  } = useDisclosure();

  const [contactSelectKey, setContactSelectKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popupData, setPopupData] = useState<any>({});
  const [customerDetails, setCustomerDetails] = useState<TODO>({});
  const [shippingOptions, setShippingOptions] = useState<TODO>([]);
  const [resetKey, setResetKey] = useState(0);
  const handleOpenModal = (item_id: number) => {
    let popupVariables: any = {};
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    popupVariables.conditionOptions = conditionOptions;
    let obj: any = {};
    obj.condition_id = Number(fields[`condition_id_${item_id}`]?.value);
    obj.qty = fields[`quantity_${item_id}`]?.value;
    obj.unit_of_measure_id = Number(fields[`uom_${item_id}`]?.value);
    obj.remark = fields[`remark_${item_id}`]?.value;
    popupVariables.formData = obj;
    setPopupData(popupVariables);
    setIsModalOpen(true);
  };

  const openSearchPopup = () => {
    let popupVariables: any = {};
    popupVariables.existingQuotation = quotationId;
    setPopupData(popupVariables);
    toggleSearchPopup(true);
  };

  const closeSearchPopup = (selectedQuotation: number) => {
    setVendorQuoteNos([]);
    setVendorQuoteDates([]);
    setQuotationId(Number(selectedQuotation));
    form.setValues({ [`quotation_id`]: selectedQuotation.toString() });
    toggleSearchPopup(false);
    console.log(selectedQuotation);
  };

  const setContactManagerDebounced = useRef(
    debounce((value: number) => {
      setContactManager(value), 500;
    })
  ).current;

  const handleRemarksChange = (newValue: string) => {
    form.setValues({ [`remark`]: newValue });
  };

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const queryClient = useQueryClient();

  const quotationList = useQuotationList();
  const quotationOptions = transformToSelectOptions(quotationList.data);

  const quotationRelatedList = useQuotationRelatedList({
    quotation_id: quotationId,
  });
  const relatedQuotationOptions = transformToSelectOptions(
    quotationRelatedList.data
  );

  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);

  const customerListSupplier = useCustomerSupplierList({
    type: 'customers',
  });

  const shipToOptions =
    customerListSupplier.data?.data.map((customer) => ({
      value: customer.id,
      label: `${customer.business_name} - ${customer.code}`,
    })) || [];

  const [searchParams] = useSearchParams();
  const hasQueryParams = searchParams.toString() !== '';

  const paymentModeList = usePaymentModeList();
  const paymentModeOptions = transformToSelectOptions(paymentModeList.data);

  const paymentTermList = usePaymentTermsList();
  const paymentTermOptions = transformToSelectOptions(paymentTermList.data);

  const fobList = useFOBList();
  const fobOptions = transformToSelectOptions(fobList.data);

  const currencyList = useCurrencyList();
  const currencyOptions = transformToSelectOptions(currencyList.data);

  const shipTypeList = useShipTypesList();
  const shipTypeOptions = transformToSelectOptions(shipTypeList.data);

  const shipModeList = useShipModesList();
  const shipModeOptions = transformToSelectOptions(shipModeList.data);

  const shipAccountList = useShipAccountIndex();
  const shipAccountOptions = shipAccountList?.data?.items.map((item) => ({
    value: item.id,
    label: `${item.name}${item.account_number ? ' - '+item.account_number : ''}`,
  })) || [];

  const conditionList = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const unitOfMeasureList = useUnitOfMeasureIndex();
  const { data: quotationDetails } = useQuotationDetails(quotationId!); // Add '!' to assert that quotationId is not null

  const fetchQuotationDetails = async (id: number) => {
    if (id > 0) {
      try {
        const response = await Axios.get(`/quotation/${id}`);
        if (response.status !== 200) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        return response.data; // Assuming the API returns the data directly
      } catch (error) {
        console.error('Failed to fetch quotation details:', error);
        throw error; // Rethrowing the error so it can be caught by react-query or similar
      }
    }
  };
  
  const handleAddItems = () => {
    const updatedItems = editableItems.map((item) =>
      item.is_checked === true
        ? { ...item, is_group: item.is_checked }
        : { ...item }
    );

    const sortedItems = [...updatedItems].sort((a, b) => {
      const aIsGroup = a.is_group ? (a.is_group === true ? 1 : 0) : 0;
      const bIsGroup = b.is_group ? (b.is_group === true ? 1 : 0) : 0;
      return bIsGroup - aIsGroup;
    });

    const finalItems = sortedItems.map(
      ({ is_checked, is_disabled, ...rest }) => rest
    );

    const uniqueGroups = Array.from(
      new Set(finalItems.map((item) => item.grouped_id))
    );
    const filteredGroups = uniqueGroups.filter((num) => num != null);
    setGroupedIDs(filteredGroups);
    setEditableItems(finalItems);
    setButtonEnable(false);
  };

  const getBackgroundColor = (groupId: any) => {
    if (groupId) {
      const index = groupedIDs.findIndex((num: any) => num === groupId);
      let color = `yellow.${(index + 1) * 100} !important`;
      return color;
    }
  };

  const checkGroup = (itemToCheck: TODO, isChecked: boolean) => {
    setButtonEnable(isChecked);
    if (isChecked) {
      const updatedItems = editableItems;
      const newItems = updatedItems.map((item) =>
        item.part_number_id === itemToCheck.part_number_id &&
        item.condition_id === itemToCheck.condition_id &&
        Number(item.price) === Number(itemToCheck.price)
          ? { ...item, is_disabled: false, grouped_id: itemToCheck.id }
          : { ...item, is_disabled: true }
      );

      const finalItems = newItems.map((item) =>
        item.id === itemToCheck.id
          ? { ...item, is_checked: true, grouped_id: item.id }
          : { ...item }
      );

      setEditableItems(finalItems);
    } else {
      setEditableItems((prevItems) => [
        ...prevItems.map(({ is_checked, is_disabled, ...item }) => item),
      ]);
    }
  };

  const clearGroup = (itemToCheck: TODO) => {
    const updatedItems = editableItems;
    const newItems = updatedItems.map((item) => {
      if (item.grouped_id === itemToCheck.grouped_id) {
        const newItem = { ...item, is_disabled: false };
        delete newItem.grouped_id; // Delete the grouped_id property
        delete newItem.is_group; // Delete the grouped_id property
        return newItem;
      }
      return { ...item, is_disabled: true };
    });

    const sortedItems = [...newItems].sort((a, b) => {
      const aIsGroup = a.is_group ? (a.is_group === true ? 1 : 0) : 0;
      const bIsGroup = b.is_group ? (b.is_group === true ? 1 : 0) : 0;
      return bIsGroup - aIsGroup;
    });

    const finalItems = sortedItems.map(
      ({ is_checked, is_disabled, ...rest }) => rest
    );

    setEditableItems(finalItems);
  };

  useEffect(() => {
    const queryParams = Object.fromEntries(searchParams.entries());
    if (queryParams.hasOwnProperty('quotation_id')) {
      const quotationIds = searchParams.get('quotation_id')?.split(',') ?? [];
      if (quotationIds.length > 0) {
        setQuotationId(Number(quotationIds[0]));
        setTimeout(() => {
          form.setValues({ quotation_id: quotationIds[0] });
        }, 500);
      }
      if (quotationIds.length > 1) {
        setRelatedQuotationIds(quotationIds.slice(1).map(Number));
        setTimeout(() => {
          form.setValues({ related_quotation_id: quotationIds.slice(1) });
        }, 500);
      }
    }
    if (queryParams.hasOwnProperty('item_id')) {
      let routeritems = JSON.parse('[' + queryParams.item_id + ']');
      setFilterItems(routeritems);
    }
  }, [hasQueryParams]);


  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  useEffect(() => {
    if (!quotationId) return;
  
    Promise.all(relatedQuotationIds.map(fetchQuotationDetails)).then((results) => {
      let allQuotations: any = [
        quotationDetails?.quotation,
        ...results.flatMap((result) => result?.quotation || [])
      ].filter(Boolean);
  
      setQuotations(allQuotations);
    });
  
  }, [relatedQuotationIds, quotationId, quotationDetails]);
  

  useEffect(() => {
    if (partNumberId !== null) {
      let obj: TODO = {};
      obj.conditions = conditionOptions;
      obj.uoms = convertToOptions(unitOfMeasureOptions);
      setPopupOptions(obj);
    }
  }, [partNumberId]);

  useEffect(() => {
    if (quotations.length > 0) {
      const items = quotations.flatMap(
        (quotation: any) => quotation?.items || []
      );
      setEditableItems(items);
      const vendorQuoteNos = quotations.map((quotation: any) => quotation.vendor_quotation_no);
      const vendorQuoteDates = quotations.map(
        (quotation: any) => format(new Date(quotation.vendor_quotation_date),' dd-MM-yyyy')
      );
      setVendorQuoteNos(vendorQuoteNos);
      setVendorQuoteDates(vendorQuoteDates);
      const prfqIds = quotations.map((quotation: any) => quotation.rfq_id);
      const uniquePRFQIds: any[] = [...new Set(prfqIds)];
      setAllQuotationPRFQIds(uniquePRFQIds.sort((a, b) => a - b));
      
    } else {
      setVendorQuoteNos([]);
      setVendorQuoteDates([]);
      setAllQuotationPRFQIds([]);
      setEditableItems([]);
    }
  }, [quotations]);

  const prfqDetails = usePRFQDetails(quotationDetails?.quotation.rfq_id);

  const fetchPRFQDetails = async (id: number) => {
    try {
      const response = await Axios.get(endPoints.info.rfq.replace(':id', id));
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return response.data; // Assuming the API returns the data directly
    } catch (error) {
      console.error('Failed to fetch quotation details:', error);
      throw error; // Rethrowing the error so it can be caught by react-query
    }
  };

  const fetchMRDetails = async (id: number) => {
    try {
      const response = await Axios.get(
        endPoints.info.purchase_request.replace(':id', id)
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return response.data; // Assuming the API returns the data directly
    } catch (error) {
      console.error('Failed to fetch quotation details:', error);
      throw error; // Rethrowing the error so it can be caught by react-query
    }
  };

  const prfqDetailsResults = useQueries(
    allQuotationPRFQIds.map((id) => {
      return {
        queryKey: ['prfqDetails', id],
        queryFn: () => fetchPRFQDetails(Number(id)),
      };
    })
  );

  const mrDetailsResults = useQueries(
    allPRFQMRIds.map((id) => {
      return {
        queryKey: ['prDetails', id],
        queryFn: () => fetchMRDetails(Number(id)),
      };
    })
  );

  useEffect(() => {
    const allSuccessful = prfqDetailsResults.every(
      (result) => result.isSuccess
    );
    if (allSuccessful) {
      const prfqs = prfqDetailsResults.map((result) => result.data.data);
      const mrIds = prfqs
        .map((mr) => mr.purchase_requests)
        .flat(Infinity)
        .map((request) => request.id);
      const uniqueMRIds = [...new Set(mrIds)];
      setAllPRFQMRIds(uniqueMRIds.sort((a, b) => a - b));
    }
  }, [prfqDetailsResults.map((result) => result.isSuccess).join(',')]);

  useEffect(() => {
    const allSuccessful = mrDetailsResults.every((result) => result.isSuccess);
    if (allSuccessful) {
      const mrs = mrDetailsResults.map((result) => result.data.data);
      const mrRefNos = mrs.map((mr) => mr.ref).flat(Infinity);
      const uniqueMRRefNos = [...new Set(mrRefNos)];
      setAllPRFQMRRefs(uniqueMRRefNos);
    }
  }, [mrDetailsResults.map((result) => result.isSuccess).join(',')]);

  const getCustomerInfo = async (customerId: any) => {
    try {
      const response = await getAPICall(
        endPoints.info.customer.replace(':id', customerId),
        CustomerInfoSchema,
        {include_default_shipping: true}
      );
        setCustomerDetails(response);
        console.log(response)
        setCurrencyId(response?.data?.currency_id ?? 0);

        form.setValues({ [`currency_id`]: response?.data?.currency_id.toString(), [`payment_mode_id`]: response?.data?.payment_mode_id.toString(), [`payment_term_id`]: response?.data?.payment_term_id.toString() });
       
        setShippingOptions(response?.data?.customer_shipping_addresses?.map((address: any) => ({
          value: address.id,
          label: address.attention,
        })) || []);
      //setLoading(false);
    } catch (err) {
      //setLoading(false);
      console.log(err);
    }
  };

  const contactList = useContactManagerListById(customerDetails?.data?.id || 0);
  const contactOptions = transformToSelectOptions(contactList.data);

  const handleOpenPreview = () => {
    let popupVariables: any = {};
    popupVariables.subTotal = subTotal;
    popupVariables.show_quote_remarks = true;
    popupVariables.totalPayableAmount = totalPayableAmount;
    popupVariables.contactAddress = fullContactAddress;
    popupVariables.vendorAddress = fullVendorAddress;
    popupVariables.vendor_name = customerDetails?.data?.business_name;
    popupVariables.vendor_code = customerDetails?.data?.code;
    popupVariables.vendor_email = customerDetails?.data?.email;
    popupVariables.vendorQuoteNos = vendorQuoteNos;
    popupVariables.vendorQuoteDates = vendorQuoteDates;
    popupVariables.conditionOptions = conditionOptions;
    popupVariables.priorityOptions = priorityOptions;
    popupVariables.shipToOptions = shipToOptions;
    popupVariables.shippingOptions = shippingOptions;
    popupVariables.currencyOptions = currencyOptions;
    popupVariables.paymentModeOptions = paymentModeOptions;
    popupVariables.paymentTermOptions = paymentTermOptions;
    popupVariables.fobOptions = fobOptions;
    popupVariables.shipTypeOptions = shipTypeOptions;
    popupVariables.shipModeOptions = shipModeOptions;
    popupVariables.shipAccountOptions = shipAccountOptions;
    popupVariables.contactOptions = contactOptions;
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    popupVariables.items = editableItems;
    popupVariables.prfq_nos = allQuotationPRFQIds;
    popupVariables.mr_nos = allPRFQMRIds;
    Object.keys(fields).forEach(function (key, index) {
      console.log(fields[key].value, key, index);
      popupVariables[key] = fields[key].value;
    });
    console.log('popupVariables', popupVariables);
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
    setIsModalOpen(false);
  };

  // useEffect(() => {
  //   setContactManager(Number(contactOptions?.[0]?.value));
  // }, [contactOptions]);

  useEffect(() => {
    if (contactOptions && contactOptions.length > 0) {
      // Check if the current contactManager is in the new options
      const isCurrentManagerValid = contactOptions.some(
        (option) => Number(option.value) === contactManager
      );

      // If the quotation has changed or the current manager is not in the new options
      if (
        quotationId !== lastSetQuotationId.current ||
        !isCurrentManagerValid
      ) {
        const newContactManager = Number(contactOptions[0].value);
        setContactManager(newContactManager);
        lastSetQuotationId.current = quotationId;
      }
    }
  }, [contactOptions, quotationId, contactManager]);
  
  useEffect(() => {
    if (shippingOptions.length > 0) {
      console.log(shippingOptions);
      if (quotationId && customerId) {
        form.setValues({
          [`ship_customer_shipping_address_id`]: shippingOptions[0].value,
        });
        setShippingAddress(Number(shippingOptions[0].value));
      }
    } else {
      form.setValues({ [`ship_customer_shipping_address_id`]: '' });
      setShippingAddress(0);
      setFullVendorAddress('NA');
    }
  }, [shippingOptions, customerId]);

  const contactDetails = useContactManagerDetails(contactManager);

  useEffect(() => {
    if (contactDetails.data) {
      setFullContactAddress(formatContactAddress(contactDetails.data));
    } else {
      setFullContactAddress('NA');
    }
  }, [contactDetails.data]);

  useEffect(() => {
    if (shippingAddress > 0 && quotationId > 0 && customerId) {
      const shippingAddressInfo =
        customerDetails?.data?.customer_shipping_addresses?.find(
          (item: any) => item.id === shippingAddress
        );
      if (shippingAddressInfo) {
        setFullVendorAddress(formatShippingAddress(shippingAddressInfo));      
      } else {
        setFullVendorAddress('NA');
      }
    } else {
      setFullVendorAddress('NA');
    }
  }, [shippingAddress]);

  useEffect(() => {
    if (quotationDetails?.quotation) {
      setQuotations([quotationDetails?.quotation]);
    }if (quotationDetails?.quotation.customer_id) {
      setCustomerId(quotationDetails?.quotation.customer_id);
      getCustomerInfo(quotationDetails?.quotation.customer_id);
    }
  }, [quotationDetails]);


  useEffect(() => {
    if (quotationDetails?.quotation.rfq_id) {
      setPriority(prfqDetails.data?.data.priority_id || 0);
    }
  }, [prfqDetails.data?.data.priority_id, quotationDetails?.quotation.rfq_id]);

  const handleDeleteItem = (index: number) => {
    const filteredItems = editableItems.filter((_, i) => i !== index);
    setEditableItems(filteredItems);
  };

  const handleDoubleClick = (activeInputElement: string) => {
    setactiveInput(activeInputElement);
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    setEditableItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, qty: newQuantity } : item
      )
    );
  };

  const handlePriceChange = (itemId: number, newPrice: number) => {
    setEditableItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, price: newPrice.toString() } : item
      )
    );
  };

  const handleNoteChange = (itemId: number, newNote: any) => {
    setEditableItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId ? { ...item, note: newNote } : item
      )
    );
  };

  const subTotal = useMemo(() => {
    return Math.round((
      Number(editableItems.reduce(
      (acc, item) => acc + item.qty * parseFloat(item.price),
      0
    )) * 100) / 100);
  }, [editableItems]);

  const overallQTY = useMemo(() => {
    return editableItems.reduce((acc, item) => acc + item.qty, 0);
  }, [editableItems]);

  const groupedCount = useMemo(() => {
    return editableItems.reduce(
      (acc, item) => acc + (item.is_checked ? 1 : 0),
      0
    );
  }, [editableItems]);

  useEffect(() => {
    if (itemsToFilter.length > 0 && editableItems.length > 0 && !isFilterApplied) {
      console.log(editableItems, itemsToFilter)
      const newFilteredItems = editableItems.filter((item) =>
        itemsToFilter.includes(item.id)
      );
      setEditableItems(newFilteredItems);
      setFilterApplied(true);
    }
  }, [editableItems, itemsToFilter, isFilterApplied]);

  // const refreshData = () => {
  //   refetch();
  // };

  const createPurchaseOrder = useCreatePurchaseOrder({
    onSuccess: (data) => {
      toastSuccess({
        title: `Purchase Order Created - ${data.id}`,
        description: data.message,
        duration: 5000,
      });
      if (actionRef.current === 'saveAndNew') {
        form.reset();
        setCustomerId(0);
        form.setValues({ quotation_id: quotationId });
        queryClient.refetchQueries();
        //refreshData();
      } else {
        navigate('/purchase/purchase-order');
      }
      queryClient.invalidateQueries('purchaseOrderIndex');
    },
    onError: (error) => {
      toastError({
        title: 'Purchase Order Creation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });

  type combineQuotations = (
    quotationId: number,
    relatedQuotationIds: number[]
  ) => number[];

  const combineQuotations: combineQuotations = (
    quotationId,
    relatedQuotationIds
  ) => {
    // Start with an array containing just the main quotationId
    const combinedArray = [quotationId];

    // Check if relatedQuotationIds is not null and is an array with elements
    if (Array.isArray(relatedQuotationIds) && relatedQuotationIds.length > 0) {
      // Concatenate the main quotation ID with all related quotation IDs
      combinedArray.push(...relatedQuotationIds);
    }

    // Return the combined array which includes the main ID and any related IDs, if available
    return combinedArray;
  };

  const safeNumber = (
    value: string | number | null | undefined
  ): number | undefined => {
    if (value === null || value === undefined || value === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  };

  const form = useForm({
    onValidSubmit: async (values) => {
      const relatedQuotationIds = values.related_quotation_id
        ? values.related_quotation_id.map((id: string) => Number(id))
        : [];

      const quotationArr = combineQuotations(
        Number(values.quotation_id),
        relatedQuotationIds
      );

      const payload: useCreatePurchaseOrderBody = {
        quotation_ids: quotationArr,
        customer_id: Number(customerDetails?.data?.id),
        customer_contact_manager_id: safeNumber(
          values.customer_contact_manager_id
        )!,
        priority_id: safeNumber(values.priority_id)!,
        payment_mode_id: safeNumber(values.payment_mode_id)!,
        payment_term_id: safeNumber(values.payment_term_id)!,
        fob_id: safeNumber(values.fob_id)!,
        currency_id: safeNumber(values.currency_id)!,
        ship_type_id: safeNumber(values.ship_type_id)!,
        ship_mode_id: safeNumber(values.ship_mode_id)!,
        ship_account_id: safeNumber(values.ship_account_id)!,
        items: editableItems.map((item) => ({
          part_number_id: item.part_number_id,
          condition_id: safeNumber(item.condition_id)!,
          unit_of_measure_id: safeNumber(item.unit_of_measure_id)!,
          qty: safeNumber(item.qty)!,
          price: safeNumber(item.price)!,
          note: values[`note_${item.id}`] || undefined,
          quotation_item_id: item?.id,
          is_group: item?.is_group,
        })),
      };

      // Add optional fields only if they have a value
      if (values.ship_customer_id) {
        payload.ship_customer_id = safeNumber(values.ship_customer_id);
      }
      if (values.ship_customer_shipping_address_id) {
        payload.ship_customer_shipping_address_id = safeNumber(
          values.ship_customer_shipping_address_id
        );
      }
      if (values.remark) {
        payload.remark = values.remark;
      }
      if (values.bank_charge) {
        payload.bank_charge = safeNumber(values.bank_charge);
      }
      if (values.freight) {
        payload.freight = safeNumber(values.freight);
      }
      if (values.discount) {
        payload.discount = safeNumber(values.discount);
      }
      if (values.vat) {
        payload.vat = safeNumber(values.vat);
      }
      if (values.misc) {
        payload.miscellaneous_charges = values.misc.toString();
      }

      // Remove any undefined values from the payload
      Object.keys(payload).forEach(
        (key) =>
          payload[key as keyof typeof payload] === undefined &&
          delete payload[key as keyof typeof payload]
      );

      if (
        values.payment_term_id === 1 &&
        Number(customerDetails?.data?.available_credit_limit) <=
          Number(totalPayableAmount)
      ) {
        showConfirmationPopup(payload);
      } else {
        createPurchaseOrder.mutate(payload);
      }
    },
  });

  const showConfirmationPopup = (payload: any) => {
    setOpenConfirmation(true);
    setPOPaylod(payload);
  };

  const handleInputChange = (
    property: keyof QuotationItems,
    value: any,
    index: number
  ) => {
    setEditableItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, [property]: value } : item
      )
    );
  };

  const handleConfirm = () => {
    setOpenConfirmation(false); // Close the modal after confirmation
    createPurchaseOrder.mutate(poPaylod);
  };

  const handleClose = () => {
    setOpenConfirmation(false); // Close the modal on cancel or outside click
  };

  const fields = useFormFields({ connect: form });

  const vatAmount = Math.round((
    Number(editableItems.reduce(
    (acc, item) =>
      acc +
      (Number(item.qty) * Number(item.price) * Number(fields.vat?.value)) / 100,
    0
  )) * 100) / 100);
  
  const totalPayableAmount = 
  Math.round((
    Number(
      editableItems.reduce(
        (acc, item) => acc + Number(item.qty) * Number(item.price),
        0
      )
    ) +
    Number(fields.bank_charge?.value) +
    Number(fields.freight?.value) +
    Number(fields.misc?.value) -
    Number(fields.discount?.value) +
    vatAmount
  ) * 100) / 100;

  const handleCloseCMModal = (status: boolean, id: any) => {
    console.log(id, status);
    if (status) {
      contactList.refetch();
      if (id) {
        setContactManagerDebounced(Number(id));
        setContactManager(Number(id));
        setTimeout(() => {
          form.setValues({
            [`customer_contact_manager_id`]: id.toString(),
          });
        }, 2000);
      }
    }
  };

  const handleCloseShippingAddressModal = (status?: boolean, id?: any) => {
    if (status) {
      if (id) {
        getCustomerInfo(id);
        setTimeout(() => {
          form.setValues({
            [`ship_customer_shipping_address_id`]: id.toString(),
          });
        }, 2000);
      }
    }
    setResetKey((prevKey) => prevKey + 1);
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
                <BreadcrumbLink as={Link} to={'/purchase/purchase-order'}>
                  Purchase Order
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Purchase Order Create</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Purchase Order
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
            Purchase Order Create
          </Text>

          <Formiz autoForm connect={form}>
            <Stack spacing={2}>
              <Stack
                spacing={8}
                direction={{ base: 'column', md: 'row' }}
                bg={'gray.100'}
                p={4}
                rounded={'md'}
                border={'1px solid'}
                borderColor={'gray.300'}
              >
                <Tooltip
                  hasArrow
                  label="Supplier Entry Quotation No"
                  placement="top"
                >
                  <Box flex="2" alignItems="center" display={'flex'}>
                    <FieldSelect
                      label={'Quo.No'}
                      name={'quotation_id'}
                      required={'Quotation is required'}
                      options={quotationOptions}
                      size={'sm'}
                      onValueChange={(value) => {
                        setVendorQuoteNos([]);
                        setVendorQuoteDates([]);
                        if(hasQueryParams){
                          setFilterApplied(false);
                        }
                        setQuotationId(Number(value));
                      }}
                    />
                    <Stack alignItems="center" display={'flex'}>
                      <Text>&nbsp;</Text>

                      <IconButton
                        aria-label="Open Search"
                        colorScheme="brand"
                        size={'xs'}
                        icon={<SearchIcon />}
                        ml={1}
                        onClick={openSearchPopup}
                        type="button"
                      />
                    </Stack>
                  </Box>
                </Tooltip>

                <Box flex="1.5">
                  <FieldSelect
                    label={'Related Quotation'}
                    name={'related_quotation_id'}
                    size={'sm'}
                    options={relatedQuotationOptions}
                    isDisabled={!relatedQuotationOptions.length}
                    isClearable={true}
                    isMulti={true}
                    selectProps={{
                      noOptionsMessage: () => 'No related quotations found',
                      isLoading: quotationRelatedList.isLoading,
                    }}
                    onValueChange={(value) => {
                      if(hasQueryParams){
                        setFilterApplied(false);
                      }
                      setRelatedQuotationIds(
                        value ? (value as unknown as number[]) : []
                      );
                    }}
                  />
                </Box>
                <Box flex="1">
                  <FieldDisplay
                    label="Ven.Quo.No"
                    value={
                      vendorQuoteNos.length > 0
                        ? vendorQuoteNos.join(', ')
                        : 'NA'
                    }
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                  />
                </Box>
                <Box flex="1">
                  <FieldDisplay
                    label="PRFQ No"
                    value={allQuotationPRFQIds.join(', ') || 'NA'}
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                  />
                </Box>
                <Box flex="1">
                  <FieldDisplay
                    label="MR NO"
                    value={allPRFQMRIds.join(', ') || 'NA'}
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                  />
                </Box>
                <Box flex="1.5">
                  <FieldDisplay
                    label="MR Ref"
                    value={allPRFQMRRefs.join(', ') || 'NA'}
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                  />
                </Box>
                <Box flex="2">
                  <FieldSelect
                    key={`priority_${priority}`}
                    label={'Priority'}
                    name={'priority_id'}
                    size={'sm'}
                    required={'Priority is required'}
                    options={priorityOptions}
                    defaultValue={priority.toString()}
                    isDisabled={quotationId === 0}
                    className={quotationId === 0 ? 'disabled-input' : ''}
                  />
                </Box>
              </Stack>

              <Stack
                spacing={8}
                direction={{ base: 'column', md: 'row' }}
                bg={'gray.100'}
                p={4}
                rounded={'md'}
                border={'1px solid'}
                borderColor={'gray.300'}
              >
                <Box flex="2">
                  <FieldDisplay
                    label="Vendor Name"
                    value={customerDetails?.data?.business_name || 'NA'}
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                  />
                </Box>
                <Box flex="1">
                  <FieldDisplay
                    label="Vendor Code"
                    value={customerDetails?.data?.code || 'NA'}
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                  />
                </Box>
                {/* <FieldSelect
                  key={`contact_${contactOptions}`}
                  label={'Contact'}
                  name={'customer_contact_manager_id'}
                  size="sm"
                  required={'Contact is required'}
                  options={contactOptions}
                  defaultValue={contactOptions?.[0]?.value}
                  onValueChange={(value) => {
                    setContactManagerDebounced(Number(value));
                    setContactManager(Number(value));
                  }}
                /> */}
                <Box flex="1.5">
                  <FieldSelect
                    key={`contact_${contactManager}_${contactOptions.length}_${contactSelectKey}`}
                    label={'Contact'}
                    name={'customer_contact_manager_id'}
                    size="sm"
                    required={'Contact is required'}
                    options={[
                      ...(contactOptions ?? []),
                      {
                        value: 'add_new',
                        label: (
                          <Text
                            color={'brand.500'}
                            textDecoration={'underline'}
                          >
                            + Add New Contact
                          </Text>
                        ),
                      },
                    ]}
                    defaultValue={contactManager.toString()}
                    onValueChange={(value) => {
                      if (value === 'add_new') {
                        onCMAddOpen();
                      } else {
                        setContactManagerDebounced(Number(value));
                        setContactManager(Number(value));
                      }
                    }}
                    isDisabled={quotationId === 0}
                    className={quotationId === 0 ? 'disabled-input' : ''}
                  />
                </Box>
                <Box flex="3">
                  <FieldDisplay
                    key={`contact_address_${contactManager}`}
                    label="Vendor Address"
                    value={fullContactAddress}
                    size="sm"
                    isHtml={true}
                    style={{ backgroundColor: '#fff' }}
                  />
                </Box>
              </Stack>

              <Stack
                spacing={8}
                direction={{ base: 'column', md: 'row' }}
                bg={'gray.100'}
                p={4}
                rounded={'md'}
                border={'1px solid'}
                borderColor={'gray.300'}
              >
                {/* <FieldSelect
                  key={`customer_${customerId}_${vendorSelectKey}`}
                  label={'Ship To'}
                  name={'ship_customer_id'}
                  size="sm"
                  required={'Vendor is required'}
                  options={[
                    ...(shipToOptions ?? []),
                    {
                      value: 'add_new',
                      label: (
                        <Text color={'brand.500'} textDecoration={'underline'}>
                          + Add New Customer
                        </Text>
                      ),
                    },
                  ]}
                  defaultValue={shipToOptions?.[0]?.value}
                  selectProps={{
                    isLoading: shipToCustomerDetails.isLoading,
                  }}
                  onValueChange={(value) => {
                    if (value === 'add_new') {
                      onVendorAddOpen();
                    } else {
                      setResetKey((prevKey) => prevKey + 1);
                      setShipToCustomerDebounced(Number(value));
                      setShipToCustomer(Number(value));
                    }
                  }}
                  isDisabled={quotationId === 0}
                  className={quotationId === 0 ? 'disabled-input' : ''}
                /> */}

                <FieldSelect
                  key={`ship_address_${customerId}_${resetKey}`}
                  label={'Ship To'}
                  name={'ship_customer_shipping_address_id'}
                  size="sm"
                  required={'Shipping Address is required'}
                  options={[
                    ...(shippingOptions || []),
                    {
                      value: 'add_new_ship_address',
                      label: (
                        <Text color={'brand.500'} textDecoration={'underline'}>
                          + Add New Address
                        </Text>
                      ),
                    },
                  ]}
                  onValueChange={(value) => {
                    if (value === 'add_new_ship_address') {
                      // Open the modal to add a new vendor
                      onShipAddrAddOpen();
                    } else {
                      setShippingAddress(Number(value) ?? 0);
                    }
                  }}
                  isDisabled={quotationId === 0}
                  className={quotationId === 0 ? 'disabled-input' : ''}
                />

                <FieldDisplay
                  key={`shipping_address_${contactManager}`}
                  label="Shipping Address"
                  value={fullVendorAddress}
                  size="sm"
                  isHtml={true}
                  style={{ backgroundColor: '#fff' }}
                />

                <FieldSelect
                  label={'Ship Type'}
                  name={'ship_type_id'}
                  size="sm"
                  options={shipTypeOptions}
                  required={'Ship Type is required'}
                  isDisabled={quotationId === 0}
                  className={quotationId === 0 ? 'disabled-input' : ''}
                />
                <FieldSelect
                  label={'Ship Mode'}
                  name={'ship_mode_id'}
                  size="sm"
                  options={shipModeOptions}
                  required={'Ship Mode is required'}
                  isDisabled={quotationId === 0}
                  className={quotationId === 0 ? 'disabled-input' : ''}
                />
                <FieldSelect
                  label={'Ship Account'}
                  name={'ship_account_id'}
                  size="sm"
                  options={shipAccountOptions}
                  required={'Ship Account is required'}
                  isDisabled={quotationId === 0}
                  className={quotationId === 0 ? 'disabled-input' : ''}
                />
              </Stack>

              <Stack
                spacing={8}
                direction={{ base: 'column', md: 'row' }}
                bg={'gray.100'}
                p={4}
                rounded={'md'}
                border={'1px solid'}
                borderColor={'gray.300'}
              >
                <FieldSelect
                  key={`currency_${currencyId}`}
                  label={'Currency'}
                  name={'currency_id'}
                  size="sm"
                  required={'Currency is required'}
                  options={currencyOptions}
                  defaultValue={currencyId.toString()}
                  isDisabled={true}
                  className="disabled-input"
                />
                <FieldSelect
                  label={'Payment Mode'}
                  name={'payment_mode_id'}
                  size="sm"
                  options={paymentModeOptions}
                  required={'Payment Mode is required'}
                  isDisabled={quotationId === 0}
                  className={quotationId === 0 ? 'disabled-input' : ''}
                />

                <FieldSelect
                  label={'Payment Terms'}
                  name={'payment_term_id'}
                  options={paymentTermOptions}
                  size="sm"
                  required={'Payment Terms is required'}
                  isDisabled={quotationId === 0}
                  className={quotationId === 0 ? 'disabled-input' : ''}
                />
                <FieldSelect
                  label={'FOB'}
                  name={'fob_id'}
                  size="sm"
                  options={fobOptions}
                  required={'FOB is required'}
                  isDisabled={quotationId === 0}
                  className={quotationId === 0 ? 'disabled-input' : ''}
                />
              </Stack>

              {editableItems.length > 0 && (
                <TableContainer rounded={'md'} overflow={'scroll'} my={4}>
                  <Table variant="striped" size={'sm'}>
                    <Thead bg={'gray'}>
                      <Tr>
                        <Th color={'white'}>#</Th>
                        <Th color={'white'}>Q.ID</Th>
                        <Th color={'white'}>Part.Num</Th>
                        <Th color={'white'}>Desc.</Th>
                        <Th color={'white'}>Cond.</Th>
                        <Th color={'white'}>Qty</Th>
                        <Th color={'white'}>UOM</Th>
                        <Th color={'white'}>Unit Price</Th>
                        <Th color={'white'}>Total Value</Th>
                        <Th color={'white'}>Quo.Rems</Th>
                        <Th color={'white'}>Remark</Th>
                        <Th color={'white'} isNumeric>
                          Action
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {editableItems.map((item, index) => (
                        <Tr
                          key={`item_${index}_${item.id}`}
                          bg={
                            item.grouped_id && item.is_group === true
                              ? getBackgroundColor(item.grouped_id)
                              : ''
                          }
                        >
                          <Td
                            bg={
                              item.grouped_id && item.is_group === true
                                ? getBackgroundColor(item.grouped_id)
                                : ''
                            }
                          >
                            {item.is_group === true && (
                              <IconButton
                                aria-label="Delete"
                                icon={<DeleteIcon />}
                                colorScheme="red"
                                isRound
                                size="xs"
                                marginRight={2}
                                onClick={() => {
                                  clearGroup(item);
                                }}
                              />
                            )}
                            {!item.is_group && (
                              <Checkbox
                                variant="subtle"
                                colorScheme="red"
                                isChecked={item.is_checked === true}
                                onChange={(e) =>
                                  checkGroup(item, e.target.checked)
                                }
                                isDisabled={item.is_disabled === true}
                                marginRight={2}
                                sx={{
                                  backgroundColor: 'red.100', // Default background color
                                  borderColor: 'red.200', // Default border color
                                }}
                                size={'lg'}
                              />
                            )}
                            {index + 1}
                          </Td>
                          <Td
                            bg={
                              item.grouped_id && item.is_group === true
                                ? getBackgroundColor(item.grouped_id)
                                : ''
                            }
                          >
                            {item.quotation_id}
                          </Td>
                          <Td
                            bg={
                              item.grouped_id && item.is_group === true
                                ? getBackgroundColor(item.grouped_id)
                                : ''
                            }
                          >
                            <PartDetailText partNumber={item.part_number_id} />
                          </Td>
                          <Td
                            bg={
                              item.grouped_id && item.is_group === true
                                ? getBackgroundColor(item.grouped_id)
                                : ''
                            }
                          >
                            <PartDetailText
                              partNumber={item.part_number_id}
                              field={'description'}
                            />
                          </Td>
                          <Td
                            bg={
                              item.grouped_id && item.is_group === true
                                ? getBackgroundColor(item.grouped_id)
                                : ''
                            }
                          >
                            <FieldSelect
                              name={`condition_id_${item.id}`}
                              defaultValue={String(item.condition_id)}
                              size={'sm'}
                              menuPortalTarget={document.body}
                              options={conditionOptions}
                              placeholder="Select Condition"
                              width={'100px'}
                              onValueChange={(value) => {
                                handleInputChange('condition_id', value, index);
                              }}
                            />
                          </Td>
                          <Tooltip
                            hasArrow
                            label="Double-click to change"
                            placement="top"
                            bg="green.600"
                          >
                            <Td
                              bg={
                                item.grouped_id && item.is_group === true
                                  ? getBackgroundColor(item.grouped_id)
                                  : ''
                              }
                            >
                              <FieldInput
                                name={`quantity_${item.id}`}
                                defaultValue={item.qty}
                                size={'sm'}
                                type={
                                  item.unit_of_measure_id === 6
                                    ? 'integer'
                                    : 'decimal'
                                }
                                onValueChange={(value) => {
                                  handleQuantityChange(item.id, Number(value));
                                  handleInputChange('qty', value, index);
                                }}
                                onDoubleClick={() =>
                                  handleDoubleClick(`quantity_${item.id}`)
                                }
                                onBlur={() => setactiveInput('')}
                                isReadOnly={
                                  activeInput === `quantity_${item.id}`
                                    ? false
                                    : true
                                }
                                maxLength={9}
                                width={'60px'}
                              />
                            </Td>
                          </Tooltip>
                          <Td
                            bg={
                              item.grouped_id && item.is_group === true
                                ? getBackgroundColor(item.grouped_id)
                                : ''
                            }
                          >
                            <FieldSelect
                              name={`uom_${item.id}`}
                              size={'sm'}
                              menuPortalTarget={document.body}
                              options={convertToOptions(unitOfMeasureOptions)}
                              defaultValue={String(item.unit_of_measure_id)}
                              placeholder="Select UOM"
                              width={'80px'}
                              isReadOnly={true}
                              className="disabled-input"
                              onValueChange={(value) => {
                                handleInputChange(
                                  'unit_of_measure_id',
                                  value,
                                  index
                                );
                              }}
                            />
                          </Td>
                          <Tooltip
                            hasArrow
                            label="Double-click to change"
                            placement="top"
                            bg="green.600"
                          >
                            <Td
                              bg={
                                item.grouped_id && item.is_group === true
                                  ? getBackgroundColor(item.grouped_id)
                                  : ''
                              }
                            >
                              <FieldInput
                                name={`price_${item.id}`}
                                defaultValue={item.price}
                                size={'sm'}
                                type={'decimal'}
                                onValueChange={(value) => {
                                  handlePriceChange(item.id, Number(value));
                                  handleInputChange('price', value, index);
                                }}
                                onDoubleClick={() =>
                                  handleDoubleClick(`price_${item.id}`)
                                }
                                onBlur={() => setactiveInput('')}
                                isReadOnly={
                                  activeInput === `price_${item.id}`
                                    ? false
                                    : true
                                }
                                leftElement={
                                  <CurrencyDisplay
                                    currencyId={
                                      quotationDetails?.quotation.currency_id.toString() ??
                                      ''
                                    }
                                  />
                                }
                                maxLength={10}
                                width={'120px'}
                              />
                            </Td>
                          </Tooltip>
                          <Td
                            bg={
                              item.grouped_id && item.is_group === true
                                ? getBackgroundColor(item.grouped_id)
                                : ''
                            }
                          >
                            <Text>
                              <CurrencyDisplay
                                currencyId={
                                  quotationDetails?.quotation.currency_id.toString() ??
                                  ''
                                }
                              />
                              {(Number(item.price) * Number(item.qty)).toFixed(2)}
                            </Text>
                          </Td>

                          <Td
                            bg={
                              item.grouped_id && item.is_group === true
                                ? getBackgroundColor(item.grouped_id)
                                : ''
                            }
                          >
                            {item.remark}
                          </Td>
                          <Tooltip
                            hasArrow
                            label="Double-click to change"
                            placement="top"
                            bg="green.600"
                          >
                            <Td
                              bg={
                                item.grouped_id && item.is_group === true
                                  ? getBackgroundColor(item.grouped_id)
                                  : ''
                              }
                            >
                              <FieldInput
                                name={`note_${item.id}`}
                                size={'sm'}
                                placeholder="Enter Notes"
                                onDoubleClick={() =>
                                  handleDoubleClick(`note_${item.id}`)
                                }
                                onValueChange={(value) =>
                                  handleNoteChange(item.id, value)
                                }
                                onBlur={() => setactiveInput('')}
                                isReadOnly={
                                  activeInput === `note_${item.id}`
                                    ? false
                                    : true
                                }
                                maxLength={25}
                                width={'200px'}
                              />
                            </Td>
                          </Tooltip>
                          <Td
                            isNumeric
                            bg={
                              item.grouped_id && item.is_group === true
                                ? getBackgroundColor(item.grouped_id)
                                : ''
                            }
                          >
                            <IconButton
                              aria-label="Delete Row"
                              colorScheme="red"
                              size={'sm'}
                              icon={<DeleteIcon />}
                              onClick={() => handleDeleteItem(index)}
                              mr={2}
                            />
                            <IconButton
                              aria-label="View Popup"
                              colorScheme="green"
                              size={'sm'}
                              display={'none'}
                              icon={<HiEye />}
                              onClick={() => {
                                setPartNumberId(item.part_number_id);
                                handleOpenModal(item.id);
                              }}
                            />
                          </Td>
                        </Tr>
                      ))}
                      <Tr>
                        <Td
                          colSpan={3}
                          textAlign={'left'}
                          paddingInlineStart={0}
                        >
                          {buttonEnabled && groupedCount > 1 && (
                            <Button
                              colorScheme="brand"
                              size={'sm'}
                              minW={0}
                              onClick={handleAddItems}
                              title={'Group selected items'}
                            >
                              Group Items
                            </Button>
                          )}
                        </Td>
                        <Td colSpan={2}>
                          Total Line Items:
                          <Text
                            as={'span'}
                            style={{ fontWeight: 'bold' }}
                            ml={2}
                          >
                            {editableItems.length}
                          </Text>
                        </Td>

                        <Td colSpan={2}>
                          Total Qty:
                          <Text
                            as={'span'}
                            style={{ fontWeight: 'bold' }}
                            ml={2}
                          >
                            {overallQTY}
                          </Text>
                        </Td>
                        <Td colSpan={5}></Td>
                      </Tr>
                    </Tbody>
                  </Table>
                </TableContainer>
              )}
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldDisplay
                  label="Sub Total"
                  value={subTotal}
                  size="sm"
                  style={{ backgroundColor: '#fff' }}
                  leftElement={
                    <CurrencyDisplay
                      currencyId={
                        quotationDetails?.quotation.currency_id.toString() ?? ''
                      }
                    />
                  }
                />
                <FieldInput
                  label={'Bank Charges'}
                  name={'bank_charge'}
                  size="sm"
                  type="decimal"
                  maxLength={9}
                  leftElement={
                    <CurrencyDisplay
                      currencyId={
                        quotationDetails?.quotation.currency_id.toString() ?? ''
                      }
                    />
                  }
                  isDisabled={quotationId === 0}
                />
                <FieldInput
                  label={'Freight Charges'}
                  size="sm"
                  name={'freight'}
                  type="decimal"
                  maxLength={9}
                  leftElement={
                    <CurrencyDisplay
                      currencyId={
                        quotationDetails?.quotation.currency_id.toString() ?? ''
                      }
                    />
                  }
                  isDisabled={quotationId === 0}
                />
                <FieldInput
                  label={'Misc Charges'}
                  size="sm"
                  name={'misc'}
                  type="decimal"
                  maxLength={9}
                  leftElement={
                    <CurrencyDisplay
                      currencyId={
                        quotationDetails?.quotation.currency_id.toString() ?? ''
                      }
                    />
                  }
                  isDisabled={quotationId === 0}
                />
                <FieldInput
                  label={'VAT'}
                  name={'vat'}
                  size="sm"
                  rightElement={'%'}
                  type={'decimal'}
                  maxLength={6}
                  maxValue={999}
                  isDisabled={quotationId === 0}
                />

                <FieldDisplay
                  label="VAT Amount"
                  value={vatAmount}
                  size="sm"
                  style={{ backgroundColor: '#fff' }}
                  leftElement={
                    <CurrencyDisplay
                      currencyId={
                        quotationDetails?.quotation.currency_id.toString() ?? ''
                      }
                    />
                  }
                />
                <FieldInput
                  label={'Discount'}
                  name={'discount'}
                  size="sm"
                  type="decimal"
                  leftElement={
                    <CurrencyDisplay
                      currencyId={
                        quotationDetails?.quotation.currency_id.toString() ?? ''
                      }
                    />
                  }
                  maxLength={9}
                  isDisabled={quotationId === 0}
                />
                <FieldDisplay
                  label="Total Amount"
                  value={totalPayableAmount}
                  size="sm"
                  style={{ backgroundColor: '#fff' }}
                  leftElement={
                    <CurrencyDisplay
                      currencyId={
                        quotationDetails?.quotation.currency_id.toString() ?? ''
                      }
                    />
                  }
                />
              </Stack>

              <Stack>
                <FormControl>
                  <FormLabel>Remarks</FormLabel>
                  <FieldInput
                    name={`remark`}
                    size={'sm'}
                    sx={{ display: 'none' }}
                  />
                  <FieldHTMLEditor
                    onValueChange={handleRemarksChange}
                    maxLength={250}
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
                  type="submit"
                  colorScheme="brand"
                  isLoading={createPurchaseOrder.isLoading}
                >
                  Save
                </Button>

                <Tooltip
                  label="Please fill form to preview"
                  hasArrow
                  isDisabled={form.isValid}
                >
                  <Button
                    onClick={() => handleOpenPreview()}
                    colorScheme="green"
                    isDisabled={!form.isValid}
                  >
                    Preview
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>
          </Formiz>

          <ShippingAddressCreateModal
            isOpen={isShipAddrAddOpen}
            // onClose={() => {
              
            // }}
            onClose={handleCloseShippingAddressModal}
            customer_id={customerId}
          />

          <ModalPopup
            isOpen={isModalOpen}
            data={popupData}
            onClose={() => {
              setPartNumberId(null);
              handleCloseModal();
            }}
            partNumber={partNumberId}
            options={popupOptions}
          ></ModalPopup>

          <PreviewPopup
            isOpen={isPreviewModalOpen}
            onClose={handleCloseModal}
            data={previewData}
          />

          <ConfirmationPopup
            isOpen={openConfirmation}
            onClose={handleClose}
            onConfirm={handleConfirm}
            headerText="Credit Limit Exceeds"
            bodyText="Vendors credit limit is exceeded. Do you want to continue?"
          />

          <ContactManagerCreateModal
            isOpen={isCMAddOpen}
            onClose={() => {
              onCMAddClose();
              setContactSelectKey((prevKey) => prevKey + 1);
            }}
            onModalClosed={handleCloseCMModal}
            // onModalClosed={() => {
            //   contactList.refetch();
            // }}
            customer_id={customerId.toString() ?? ''}
          />

          <SearchPopup
            isOpen={showSearchPopup}
            onClose={closeSearchPopup}
            data={popupData}
          />
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default PurchaseOrderCreate;
