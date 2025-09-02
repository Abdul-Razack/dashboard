import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';
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
  Tooltip,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import Axios from 'axios';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiEye } from 'react-icons/hi';
import { useQueries, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format } from 'date-fns';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
// import { FroalaTextEditor } from '@/components/FroalaTextEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ModalPopup } from '@/components/Popups/PurchaseOrder';
import SearchPopup from '@/components/Popups/Search/Quotation';
import PreviewPopup from '@/components/PreviewContents/Purchase/PurchaseOrder';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { convertToOptions, formatShippingAddress, formatContactAddress, transformToSelectOptions } from '@/helpers/commonHelper';
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
  usePurchaseOrderDetails,
  useUpdatePurchaseOrder,
  useUpdatePurchaseOrderBody,
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

type QuotationItems = {
  condition_id: number;
  delivery_options?: string | null;
  id: number;
  moq: number | null;
  mov: string | null;
  part_number_id: number;
  price: string;
  qty: number;
  quotation_id?: number| null;
  remark: string | null;
  unit_of_measure_id: number;
  note?: string | null;
  quotation_item_id?: number| null;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

const PurchaseOrderUpdate = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [quotationId, setQuotationId] = useState<number>(0);
  const [relatedQuotationIds, setRelatedQuotationIds] = useState<number[]>([]);
  const [allQuotationPRFQIds, setAllQuotationPRFQIds] = useState<number[]>([]);
  const [allPRFQMRRefs, setAllPRFQMRRefs] = useState<string[]>([]);
  const [allPRFQMRIds, setAllPRFQMRIds] = useState<number[]>([]);
  const [contactManager, setContactManager] = useState<number>(0);
  const lastSetQuotationId = useRef<number | null>(null);
  const [priority, setPriority] = useState<number>(0);
  const [shippingAddress, setShippingAddress] = useState<number>(0);
  const [customerId, setCustomerId] = useState<number>(0);
  const [currencyId, setCurrencyId] = useState<number>(0);
  const [editableItems, setEditableItems] = useState<QuotationItems[]>([]);
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popupData, setPopupData] = useState<any>({});
  const [activeInput, setactiveInput] = useState('');
  const [fullContactAddress, setFullContactAddress] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [showSearchPopup, toggleSearchPopup] = useState<boolean>(false);
  const [isQuotationChanged, setQuotationChanged] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<any>([]);
  const [fullVendorAddress, setFullVendorAddress] = useState('');
  const { data: poDetails } = usePurchaseOrderDetails(Number(id));

  const {
    isOpen: isShipAddrAddOpen,
    onOpen: onShipAddrAddOpen,
    onClose: onShipAddrAddClose,
  } = useDisclosure();

  const handleOpenModal = (item_id: number) => {
    let popupVariables: any = {};
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    popupVariables.conditionOptions = conditionOptions;
    let obj: any = {};
    obj.condition_id = Number(fields[`condition_id_${item_id}`]?.value);
    obj.qty = fields[`quantity_${item_id}`]?.value;
    obj.unit_of_measure_id = Number(fields[`uom_${item_id}`]?.value);
    obj.remarks = fields[`remarks_${item_id}`]?.value;
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
  const [loading, setLoading] = useState<boolean>(true);
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
      label: customer.business_name,
    })) || [];

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
  const shipAccountOptions =
    shipAccountList?.data?.items.map((item) => ({
      value: item.id,
      label: `${item.name}${item.account_number ? ' - ' + item.account_number : ''}`,
    })) || [];

  const conditionList = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const unitOfMeasureList = useUnitOfMeasureIndex();
  const { data: quotationDetails } = useQuotationDetails(quotationId!); // Add '!' to assert that quotationId is not null
  const [partNumberId, setPartNumberId] = useState<any>(null);
  const [popupOptions, setPopupOptions] = useState<TODO>({});
  const [vendorQuoteNos, setVendorQuoteNos] = useState<TODO>([]);
  const [vendorQuoteDates, setVendorQuoteDates] = useState<TODO>([]);
  const [quotations, setQuotations] = useState<TODO>([]);
  const [customerDetails, setCustomerDetails] = useState<TODO>({});
  const [shippingOptions, setShippingOptions] = useState<TODO>([]);

  const closeSearchPopup = (selectedQuotation: number) => {
    setVendorQuoteNos([]);
    setVendorQuoteDates([]);
    setQuotationId(Number(selectedQuotation));
    form.setValues({ [`quotation_id`]: selectedQuotation.toString() });
    toggleSearchPopup(false);
    console.log(selectedQuotation);
  };

  const fetchQuotationDetails = async (id: number) => {
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
  };

  useEffect(() => {
    if (!quotationId && !isQuotationChanged) return;

    Promise.all(relatedQuotationIds.map(fetchQuotationDetails)).then(
      (results) => {
        let allQuotations: any = [
          quotationDetails?.quotation,
          ...results.flatMap((result) => result?.quotation || []),
        ].filter(Boolean);

        setQuotations(allQuotations);
      }
    );
  }, [relatedQuotationIds, isQuotationChanged]);

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

  const mrDetailsResults = useQueries(
    allPRFQMRIds.map((id) => {
      return {
        queryKey: ['prDetails', id],
        queryFn: () => fetchMRDetails(Number(id)),
      };
    })
  );

  useEffect(() => {
    const allSuccessful = mrDetailsResults.every((result) => result.isSuccess);
    if (allSuccessful) {
      const mrs = mrDetailsResults.map((result) => result.data.data);
      const mrRefNos = mrs.map((mr) => mr.ref).flat(Infinity);
      const uniqueMRRefNos = [...new Set(mrRefNos)];
      setAllPRFQMRRefs(uniqueMRRefNos);
    }
  }, [
    mrDetailsResults.map((result) => result.isSuccess).join(','),
    isQuotationChanged,
  ]);

  useEffect(() => {
    if (quotations.length > 0 && isQuotationChanged === true) {
      const items = quotations.flatMap(
        (quotation: any) => quotation?.items || []
      );
      setEditableItems(items);
      const vendorQuoteNos = quotations.map(
        (quotation: any) => quotation.vendor_quotation_no
      );

      const vendorQuoteDates = quotations.map(
        (quotation: any) => format(new Date(quotation.vendor_quotation_date),' dd-MM-yyyy')
      );
      setVendorQuoteNos(vendorQuoteNos);
      setVendorQuoteDates(vendorQuoteDates);
      const prfqIds = quotations.map((quotation: any) => quotation.rfq_id);
      const uniquePRFQIds: any[] = [...new Set(prfqIds)];
      setAllQuotationPRFQIds(uniquePRFQIds.sort((a, b) => a - b));
    }
  }, [quotations, isQuotationChanged]);

  useEffect(() => {
    console.log(allQuotationPRFQIds);
  }, [allQuotationPRFQIds]);

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

  const filteredQuotationPRFQIds = useMemo(
    () =>
      allQuotationPRFQIds.filter(
        (id) => id !== null && id !== undefined && !isNaN(Number(id))
      ),
    [allQuotationPRFQIds]
  );

  const prfqDetailsResults = useQueries(
    useMemo(
      () =>
        filteredQuotationPRFQIds.map((id) => ({
          queryKey: ['prfqDetails', id],
          queryFn: () => fetchPRFQDetails(Number(id)),
        })),
      [filteredQuotationPRFQIds]
    )
  );

  useEffect(() => {
    if (partNumberId !== null) {
      let obj: TODO = {};
      obj.conditions = conditionOptions;
      obj.uoms = convertToOptions(unitOfMeasureOptions);
      setPopupOptions(obj);
    }
  }, [partNumberId]);

  useEffect(() => {
    if (isQuotationChanged === true) {
      const allSuccessful = prfqDetailsResults.every(
        (result) => result.isSuccess
      );
      if (allSuccessful) {
        const prfqs = prfqDetailsResults.map((result) => result.data.data);
        console.log(prfqs);
        const mrIds = prfqs
          .map((mr) => mr.purchase_requests)
          .flat(Infinity)
          .map((request) => request.id);
        const uniqueMRIds = [...new Set(mrIds)];
        setAllPRFQMRIds(uniqueMRIds.sort((a, b) => a - b));
      }
    }
  }, [
    prfqDetailsResults.map((result) => result.isSuccess).join(','),
    isQuotationChanged,
  ]);

  const contactList = useContactManagerListById(customerDetails?.data?.id || 0);
  const contactOptions = transformToSelectOptions(contactList.data);

  const getCustomerInfo = async (customerId: any) => {
    try {
      const response = await getAPICall(
        endPoints.info.customer.replace(':id', customerId),
        CustomerInfoSchema,
        { include_default_shipping: true }
      );
      setCustomerDetails(response);
      setShippingOptions(
        response?.data?.customer_shipping_addresses?.map((address: any) => ({
          value: address.id,
          label: address.attention,
        })) || []
      );
      //setLoading(false);
    } catch (err) {
      //setLoading(false);
      console.log(err);
    }
  };

  const handleOpenPreview = () => {
    let popupVariables: any = {};
    popupVariables.id = id;
    popupVariables.subTotal = subTotal;
    popupVariables.show_quote_remarks = false;
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
    popupVariables.version = poDetails?.data?.version;
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
    setPartNumberId(null);
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
    if (shippingAddress > 0 && customerId > 0) {
      console.log(customerDetails?.data?.customer_shipping_addresses);
      const shippingAddressInfo =
        customerDetails?.data?.customer_shipping_addresses?.find(
          (item: any) => item.id === shippingAddress
        );
      console.log(shippingAddressInfo);
      if (shippingAddressInfo) {
        setFullVendorAddress(
          formatShippingAddress(shippingAddressInfo)
        );
      } else {
        setFullVendorAddress('NA');
      }
    }
  }, [
    customerId,
    shippingAddress,
    customerDetails?.data?.customer_shipping_addresses,
  ]);

  useEffect(() => {
    if (shippingOptions.length > 0 && isQuotationChanged) {
      if (quotationId && customerId) {
        form.setValues({
          [`ship_customer_shipping_address_id`]: shippingOptions[0].value,
        });
        setShippingAddress(Number(shippingOptions[0].value));
      } else {
        form.setValues({ [`ship_customer_shipping_address_id`]: '' });
        setShippingAddress(0);
        setFullVendorAddress('NA');
      }
    }
  }, [shippingOptions, customerId, isQuotationChanged]);

  const contactDetails = useContactManagerDetails(contactManager);

  useEffect(() => {
    if (contactDetails.data) {
      setFullContactAddress(formatContactAddress(contactDetails.data));
    } else {
      setFullContactAddress('NA');
    }
  }, [contactDetails.data]);

  useEffect(() => {
    if (quotationDetails?.quotation.rfq_id) {
      setPriority(prfqDetails.data?.data.priority_id || 0);
    }
  }, [prfqDetails.data?.data.priority_id, quotationDetails?.quotation.rfq_id]);

  useEffect(() => {
    if (quotationDetails?.quotation.currency_id) {
      setCurrencyId(quotationDetails?.quotation.currency_id);
    }
  }, [quotationDetails?.quotation?.currency_id]);

  useEffect(() => {
    if (poDetails) {
      console.log(poDetails.data);
      if (poDetails.data) {
        if(poDetails.data.is_editable !== true){
          navigate(-1);
        }
        setCustomerId(Number(poDetails?.data.customer_id));
        getCustomerInfo(Number(poDetails?.data.customer_id));
        setShippingAddress(
          Number(poDetails?.data.ship_customer_shipping_address_id)
        );
        setQuotations(poDetails.data.quotations);
        let mrRefNos: any = poDetails.data.purchase_requests?.map(
          (item: any) => item.ref
        );

        let allQuotations: any = poDetails.data.quotations?.map(
          (item: any) => item.id
        );

        let allMRIds: any = poDetails.data.purchase_requests?.map(
          (item: any) => item.id
        );
        let remainingElements: any = [];
        setAllPRFQMRIds(allMRIds);
        setAllPRFQMRRefs(mrRefNos);
        if (allQuotations.length > 0) {
          setQuotationId(allQuotations[0]);
          remainingElements = allQuotations.slice(1);
          setRelatedQuotationIds(remainingElements);
        }

        console.log(remainingElements);

        setAllQuotationPRFQIds(poDetails.data.rfq_ids);
        const vendorQuoteNos = poDetails.data.quotations.map(
          (quotation: any) => quotation.vendor_quotation_no
        );
        const vendorQuoteDates = poDetails.data.quotations.map(
          (quotation: any) => format(new Date(quotation.vendor_quotation_date),' dd-MM-yyyy')
        );
        const existingPOItems = poDetails.data.items.map((item) => ({
          ...item,
          price: String(item.price),
          moq: null,
          mov: null,
          remark: '',
        }));

        console.log(existingPOItems);

        setEditableItems(existingPOItems);
        setVendorQuoteNos(vendorQuoteNos);
        setVendorQuoteDates(vendorQuoteDates);


        setTimeout(() => {
          form.setValues({
            quotation_id:
              allQuotations && allQuotations.length > 0
                ? allQuotations[0].toString()
                : '',
            ship_mode_id: poDetails.data.ship_mode_id.toString(),
            currency_id: poDetails.data.currency_id.toString(),
            priority_id: poDetails.data.priority_id.toString(),
            ship_customer_id: poDetails.data.ship_customer_id,
            ship_customer_shipping_address_id:
              poDetails.data.ship_customer_shipping_address_id,
            customer_contact_manager_id:
              poDetails.data.customer_contact_manager_id,
            ship_type_id: poDetails.data.ship_type_id.toString(),
            ship_account_id: poDetails.data.ship_account_id,
            payment_mode_id: poDetails.data.payment_mode_id.toString(),
            payment_term_id: poDetails.data.payment_term_id.toString(),
            fob_id: poDetails.data.fob_id.toString(),
            bank_charge: poDetails.data.bank_charge
              ? poDetails.data.bank_charge.toString()
              : '',
            freight: poDetails.data.freight
              ? poDetails.data.freight.toString()
              : '',
            misc: poDetails.data.miscellaneous_charges
              ? poDetails.data.miscellaneous_charges.toString()
              : '',
            vat: poDetails.data.vat ? poDetails.data.vat.toString() : '',
            discount: poDetails.data.discount
              ? poDetails.data.discount.toString()
              : '',
            related_quotation_id: remainingElements.map(String),
          });
        }, 1000);
      }
      setLoading(false);
    }
  }, [poDetails]);

  useEffect(() => {
    if (quotationId && isQuotationChanged) {
      fetchQuotationDetails(quotationId).then((data) => {
        setRelatedQuotationIds(data.items || []);
      });
    }
  }, [quotationId, isQuotationChanged]);

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

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
    return Math.round(
      (Number(
        editableItems.reduce(
          (acc, item) => acc + item.qty * parseFloat(item.price),
          0
        )
      ) *
        100) /
        100
    );
  }, [editableItems]);

  const overallQTY = useMemo(() => {
    return editableItems.reduce((acc, item) => acc + item.qty, 0);
  }, [editableItems]);

  const updatePurchaseOrder = useUpdatePurchaseOrder({
    onSuccess: (data) => {
      toastSuccess({
        title: `Purchase Order Updated - ${data.id}`,
        description: data.message,
        duration: 5000,
      });
      navigate('/purchase/purchase-order');
      queryClient.invalidateQueries('purchaseOrderIndex');
    },
    onError: (error) => {
      toastError({
        title: 'Purchase Order Updation Failed',
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

      const payload: useUpdatePurchaseOrderBody = {
        id: Number(id),
        quotation_ids: quotationArr,
        customer_id: customerId,
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
          condition_id: safeNumber(values[`condition_id_${item.id}`])!,
          unit_of_measure_id: safeNumber(values[`uom_${item.id}`])!,
          qty: safeNumber(values[`quantity_${item.id}`])!,
          price: safeNumber(values[`price_${item.id}`])!,
          note: values[`note_${item.id}`] || undefined,
          quotation_item_id: item.quotation_item_id,
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

      // console.log('Payload:', payload); // For debugging

      updatePurchaseOrder.mutate(payload);
    },
  });

  const fields = useFormFields({ connect: form });

  const vatAmount = Math.round(
    (Number(
      editableItems.reduce(
        (acc, item) =>
          acc +
          (Number(item.qty) * Number(item.price) * Number(fields.vat?.value)) /
            100,
        0
      )
    ) *
      100) /
      100
  );

  const totalPayableAmount = Math.round(
    (Number(
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
    ) *
      100) /
      100
  );

  const handleCloseShippingAddressModal = (status: boolean, id: any) => {
    console.log(id, status);
    if (status) {
      getCustomerInfo(customerId);
      if (id) {
        setShippingAddress(Number(id));
        setTimeout(() => {
          form.setValues({
            [`ship_customer_shipping_address_id`]: id.toString(),
          });
        }, 2000);
      }
    }
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
                <BreadcrumbLink>Purchase Order Update</BreadcrumbLink>
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
            Purchase Order Update
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay isLoading={loading}>
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
                          setQuotationId(Number(value));
                          setQuotationChanged(true);
                        }}
                        defaultValue={quotationId.toString()}
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
                        setQuotationChanged(true);
                        setRelatedQuotationIds(
                          value ? (value as unknown as number[]) : []
                        );
                      }}
                    />
                  </Box>
                  <Box flex="1.75">
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
                  <Box flex="1.25">
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
                  <FieldDisplay
                    label="Vendor Name"
                    value={customerDetails?.data?.business_name || 'NA'}
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                  />
                  <FieldDisplay
                    label="Vendor Code"
                    value={customerDetails?.data?.code || 'NA'}
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                  />
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
                  <FieldSelect
                    key={`contact_${contactManager}_${contactOptions.length}`}
                    label={'Contact'}
                    name={'customer_contact_manager_id'}
                    size="sm"
                    required={'Contact is required'}
                    options={contactOptions}
                    defaultValue={contactManager.toString()}
                    onValueChange={(value) => {
                      setContactManagerDebounced(Number(value));
                      setContactManager(Number(value));
                    }}
                  />
                  <FieldDisplay
                    key={`contact_address_${contactManager}`}
                    label="Vendor Address"
                    value={fullContactAddress}
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                    isHtml={true}
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
                    key={`ship_address_${customerId}`}
                    label={'Ship To'}
                    name={'ship_customer_shipping_address_id'}
                    size="sm"
                    required={'Shipping Address is required'}
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
                    defaultValue={
                      poDetails?.data?.ship_customer_shipping_address_id
                        ? poDetails?.data?.ship_customer_shipping_address_id
                        : ''
                    }
                    onValueChange={(value) => {
                      if (value === 'add_new_ship_address') {
                        // Open the modal to add a new vendor
                        onShipAddrAddOpen();
                      } else {
                        setShippingAddress(Number(value) ?? 0);
                      }
                    }}
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
                  />
                  <FieldSelect
                    label={'Ship Mode'}
                    name={'ship_mode_id'}
                    size="sm"
                    options={shipModeOptions}
                    required={'Ship Mode is required'}
                  />
                  <FieldSelect
                    label={'Ship Account'}
                    name={'ship_account_id'}
                    size="sm"
                    options={shipAccountOptions}
                    required={'Ship Account is required'}
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
                  />
                  <FieldSelect
                    label={'Payment Mode'}
                    name={'payment_mode_id'}
                    size="sm"
                    options={paymentModeOptions}
                    required={'Payment Mode is required'}
                  />

                  <FieldSelect
                    label={'Payment Terms'}
                    name={'payment_term_id'}
                    options={paymentTermOptions}
                    size="sm"
                    required={'Payment Terms is required'}
                  />
                  <FieldSelect
                    label={'FOB'}
                    name={'fob_id'}
                    size="sm"
                    options={fobOptions}
                    required={'FOB is required'}
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
                          <Tr key={index}>
                            <Td>{index + 1}</Td>
                            <Td>{item.quotation_id}</Td>
                            <Td>
                              <PartDetailText
                                partNumber={item.part_number_id}
                              />
                            </Td>
                            <Td>
                              <PartDetailText
                                partNumber={item.part_number_id}
                                field={'description'}
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                name={`condition_id_${item.id}`}
                                defaultValue={String(item.condition_id)}
                                size={'sm'}
                                menuPortalTarget={document.body}
                                options={conditionOptions}
                                placeholder="Select Condition"
                                width={'100px'}
                              />
                            </Td>
                            <Tooltip
                              hasArrow
                              label="Double-click to change"
                              placement="top"
                              bg="green.600"
                            >
                              <Td>
                                <FieldInput
                                  name={`quantity_${item.id}`}
                                  defaultValue={item.qty}
                                  size={'sm'}
                                  type={'integer'}
                                  onValueChange={(value) =>
                                    handleQuantityChange(item.id, Number(value))
                                  }
                                  onDoubleClick={() =>
                                    handleDoubleClick(`quantity_${item.id}`)
                                  }
                                  onBlur={() => setactiveInput('')}
                                  isReadOnly={
                                    activeInput === `quantity_${item.id}`
                                      ? false
                                      : true
                                  }
                                  inputProps={{
                                    maxLength: 7,
                                  }}
                                  width={'60px'}
                                />
                              </Td>
                            </Tooltip>
                            <Tooltip
                              hasArrow
                              label="Double-click to change"
                              placement="top"
                              bg="green.600"
                            >
                              <Td>
                                <FieldInput
                                  name={`price_${item.id}`}
                                  defaultValue={item.price}
                                  size={'sm'}
                                  type={'decimal'}
                                  onValueChange={(value) =>
                                    handlePriceChange(item.id, Number(value))
                                  }
                                  onDoubleClick={() =>
                                    handleDoubleClick(`price_${item.id}`)
                                  }
                                  onBlur={() => setactiveInput('')}
                                  isReadOnly={
                                    activeInput === `price_${item.id}`
                                      ? false
                                      : true
                                  }
                                  width={'80px'}
                                />
                              </Td>
                            </Tooltip>
                            <Td>
                              <Text>
                                <CurrencyDisplay
                                  currencyId={
                                    quotationDetails?.quotation.currency_id.toString() ??
                                    ''
                                  }
                                />

                                {(
                                  Number(item.price) * Number(item.qty)
                                ).toFixed(2)}
                              </Text>
                            </Td>
                            <Td>
                              <FieldSelect
                                name={`uom_${item.id}`}
                                size={'sm'}
                                menuPortalTarget={document.body}
                                options={convertToOptions(unitOfMeasureOptions)}
                                defaultValue={String(item.unit_of_measure_id)}
                                placeholder="Select UOM"
                                width={'80px'}
                                isDisabled={true}
                                className="disabled-input"
                              />
                            </Td>
                            <Td>{item.remark}</Td>
                            <Tooltip
                              hasArrow
                              label="Double-click to change"
                              placement="top"
                              bg="green.600"
                            >
                              <Td>
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
                                  maxLength={60}
                                  width={'200px'}
                                />
                              </Td>
                            </Tooltip>
                            <Td isNumeric>
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
                          <Td colSpan={2}>
                            Total Line Items:{' '}
                            <span style={{ fontWeight: 'bold' }}>
                              {editableItems.length}
                            </span>
                          </Td>
                          <Td colSpan={3}></Td>
                          <Td colSpan={2}>
                            Total Qty:{' '}
                            <span style={{ fontWeight: 'bold' }}>
                              {overallQTY}
                            </span>
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
                  />
                  <FieldInput
                    label={'Bank Charges'}
                    name={'bank_charge'}
                    size="sm"
                    type="decimal"
                    leftElement={
                      <CurrencyDisplay
                        currencyId={
                          quotationDetails?.quotation.currency_id.toString() ??
                          ''
                        }
                      />
                    }
                    maxLength={9}
                  />
                  <FieldInput
                    label={'Freight Charges'}
                    size="sm"
                    name={'freight'}
                    type="decimal"
                    leftElement={
                      <CurrencyDisplay
                        currencyId={
                          quotationDetails?.quotation.currency_id.toString() ??
                          ''
                        }
                      />
                    }
                    maxLength={9}
                  />
                  <FieldInput
                    label={'Misc Charges'}
                    size="sm"
                    name={'misc'}
                    type="decimal"
                    leftElement={
                      <CurrencyDisplay
                        currencyId={
                          quotationDetails?.quotation.currency_id.toString() ??
                          ''
                        }
                      />
                    }
                    maxLength={9}
                  />
                  <FieldInput
                    label={'VAT'}
                    name={'vat'}
                    size="sm"
                    rightElement={'%'}
                  />
                  <FieldInput
                    label={'Discount'}
                    name={'discount'}
                    size="sm"
                    type="decimal"
                    leftElement={
                      <CurrencyDisplay
                        currencyId={
                          quotationDetails?.quotation.currency_id.toString() ??
                          ''
                        }
                      />
                    }
                    maxLength={9}
                  />
                  <FieldDisplay
                    label="Total Payable Amount"
                    value={totalPayableAmount}
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                  />
                </Stack>

                <Stack>
                  <FormControl>
                    <FormLabel>Remarks</FormLabel>
                    <FieldInput
                      defaultValue={poDetails?.data.remark ?? ''}
                      name={`remark`}
                      size={'sm'}
                      sx={{ display: 'none' }}
                    />
                    <FieldHTMLEditor
                      defaultValue={poDetails?.data.remark ?? ''}
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
                    type="submit"
                    colorScheme="brand"
                    isLoading={updatePurchaseOrder.isLoading}
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
            </LoadingOverlay>
          </Formiz>

          <ShippingAddressCreateModal
            isOpen={isShipAddrAddOpen}
            onClose={onShipAddrAddClose}
            onModalClosed={handleCloseShippingAddressModal}
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

export default PurchaseOrderUpdate;
