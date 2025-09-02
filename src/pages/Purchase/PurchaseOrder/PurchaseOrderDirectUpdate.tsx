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
  Input,
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
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiEye, HiOutlinePlus } from 'react-icons/hi';
import { LuDownload, LuUpload } from 'react-icons/lu';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PRCSVUploadModal } from '@/components/Popups/FileUploadResponse/PurchaseRequest';
import { ModalPopup } from '@/components/Popups/PurchaseOrder';
import PreviewPopup from '@/components/PreviewContents/Purchase/PurchaseOrder';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  convertToOptions,
  filterDuplicates,
  filterUOMoptions,
  formatContactAddress,
  formatShippingAddress,
  getPropertyList,
  getValueByLabel,
  handleDownload,
  parseCSV,
  transformToSelectOptions
} from '@/helpers/commonHelper';
import ShippingAddressCreateModal from '@/pages/Master/ShippingAddress/ShippingAddressCreateModal';
import { getAPICall, postAPICall } from '@/services/apiService';
import { CustomerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import { FindByPartNumberIdPayload } from '@/services/apiService/Schema/PRSchema';
import {
  PayloadSchema,
  SearchResponsePayload,
} from '@/services/apiService/Schema/SpareSchema';
import {
  useContactManagerDetails,
  useContactManagerListById,
} from '@/services/master/contactmanager/services';
import { useCustomerSupplierList } from '@/services/master/services';
import { useCustomerList } from '@/services/master/services';
import {
  useUpdatePurchaseOrder,
  useUpdatePurchaseOrderBody,
} from '@/services/purchase/purchase-orders/services';
import { usePurchaseOrderDetails } from '@/services/purchase/purchase-orders/services';
import { useSearchPartNumber } from '@/services/spare/services';
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

type QueryData = {
  status: boolean;
  items?: Record<string, string | number>;
};

interface POItem {
  id: any;
  part_number_id: any;
  condition_id: any;
  unit_of_measure_id: any;
  qty: any;
  price: any;
  quotation_item_id: number;
  note: any;
  options?: any;
  disabled?: boolean;
  remark?: string;
  description?: string;
}

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

const PurchaseOrderDirectCreate = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [contactManager, setContactManager] = useState<number>(0);
  const [shippingAddress, setShippingAddress] = useState<number>(0);
  const [customerId, setCustomerId] = useState<number>(0);
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [popupData, setPopupData] = useState<any>({});
  const [customerDetails, setCustomerDetails] = useState<TODO>({});
  const [shippingOptions, setShippingOptions] = useState<TODO>([]);
  const [resetKey, setResetKey] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [poPaylod, setPOPaylod] = useState<TODO>({});
  const [existingPartNos, setExistingPartNos] = useState<string>('');
  const [shippingAddressResetKey, setShippingResetKey] = useState(0);

  const handleOpenModal = (item_id: number) => {
    let popupVariables: any = {};
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    popupVariables.conditionOptions = conditionOptions;
    let obj: any = {};
    obj.condition_id = Number(fields[`condition_id_${item_id}`]?.value);
    obj.qty = fields[`quantity_${item_id}`]?.value;
    obj.unit_of_measure_id = Number(
      fields[`unit_of_measure_id_${item_id}`]?.value
    );
    obj.remarks = fields[`remarks_${item_id}`]?.value;
    popupVariables.formData = obj;
    setPopupData(popupVariables);
    setIsModalOpen(true);
  };

  const {
    data: details,
    isLoading,
    isSuccess,
  } = usePurchaseOrderDetails(Number(id));

  const [queryParams, setQueryParams] = useState<any>({});
  const [changedRIndex, setChangedRIndex] = useState<number | null>(null);

  const listData = useSearchPartNumber(queryParams);
  const sparelistData = listData.data?.part_numbers;

  const spareOptions = sparelistData?.map((spare) => ({
    value: spare.id.toString(),
    label: spare.part_number,
  }));
  const defaultConfirmTitle = 'Upload File';
  const defaultConfirmationContent =
    'Are you sure you want to upload this file?';
  const rowIdCounter = useRef(1);
  const [fullContactAddress, setFullContactAddress] = useState('');
  const [fullVendorAddress, setFullVendorAddress] = useState('');
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>([]);
  const [partNumber, setPartNumber] = useState('');
  const [confirmationType, setConfirmationType] = useState(1);
  const [uploadedFile, setUploadedFile] = useState<TODO>(null);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [confirmationTitle, setConfirmationTitle] =
    useState<string>(defaultConfirmTitle);
  const [confirmationContent, setConfirmationContent] = useState<string>(
    defaultConfirmationContent
  );
  const [fileKey, setFileKey] = useState(0);
  const [isRespModalOpen, setIsRespModalOpen] = useState(false);
  const [csvRows, setCSVRows] = useState<TODO | null>(null);

  const {
    isOpen: isShipAddrAddOpen,
    onOpen: onShipAddrAddOpen,
    onClose: onShipAddrAddClose,
  } = useDisclosure();

  const setCustomerIdDebounced = useRef(
    debounce((value: number) => {
      setCustomerId(value), 500;
    })
  ).current;

  const setContactManagerDebounced = useRef(
    debounce((value: number) => {
      setContactManager(value), 500;
    })
  ).current;

  const getCustomerInfo = async (customerId: any) => {
    try {
      const response = await getAPICall(
        endPoints.info.customer.replace(':id', customerId),
        CustomerInfoSchema,
        { include_default_shipping: true }
      );
      setCustomerDetails(response);
      const uniqueItems = filterDuplicates(
        response?.data?.customer_shipping_addresses,
        'id'
      );
      setShippingOptions(
        uniqueItems?.map((address: any) => ({
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

  const closeFileUploadModal = (items: any) => {
    let parsedItems: any = [];
    console.log(items);
    setResetKey((prevKey) => prevKey + 1);
    items.forEach((item: any) => {
      if (item.part_number_id !== null && item.part_number_id > 0) {
        console.log(rowIdCounter.current + 1);
        let obj: any = {};
        obj.id = Number(rowIdCounter.current + 1);
        obj.part_number_id = Number(item?.part_number_id);
        obj.condition_id = Number(item?.condition_id);
        obj.qty = item?.quantity ? Number(item?.quantity) : '';
        obj.unit_of_measure_id = Number(item?.unit_of_measure_id);
        obj.options =
          Number(item?.unit_of_measure_id) === 6
            ? convertToOptions(unitOfMeasureList)
            : filterUOMoptions(unitOfMeasureList, 2);
        obj.disabled = Number(item?.unit_of_measure_id) === 6 ? true : false;
        obj.remark = item.remark ? item.remark : '';
        obj.note = '';
        obj.is_group = false;
        obj.price = '';
        parsedItems.push(obj);
        form.setValues({
          [`description_${rowIdCounter.current + 1}`]: item?.description,
          [`unit_of_measure_id_${rowIdCounter.current + 1}`]:
            item?.unit_of_measure_id?.toString(),
        });
        rowIdCounter.current += 1;
      }
    });

    console.log(parsedItems);

    setItems((currentItems) => {
      const filteredRows = currentItems.filter((row) => row.part_number_id);
      const updatedRows = [...filteredRows, ...parsedItems];
      return updatedRows;
    });

    setIsRespModalOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfirmationType(1);
    setConfirmationTitle(defaultConfirmTitle);
    setConfirmationContent(defaultConfirmationContent);
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setUploadedFile(selectedFile);
      setOpenConfirmation(true);
    }
    setFileKey((prevKey) => prevKey + 1);
  };

  const getPartNumberDetails = async (rows: any) => {
    try {
      const partNumbers: any = rows.map((item: any) => item.part_number);
      const respData = await postAPICall(
        endPoints.others.search_spares_by_part_numbers,
        { part_numbers: partNumbers },
        PayloadSchema,
        SearchResponsePayload
      );
      const mergedArray = rows.map((item1: any) => {
        const item2 = respData?.results.find(
          (item: any) => item.part_number === item1.part_number
        );
        if (item2) {
          return { ...item1, ...item2 };
        }

        return item1;
      });
      setCSVRows(mergedArray);
      setLoading(false);
      setIsRespModalOpen(true);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const handleConfirm = async () => {
    if (confirmationType === 1) {
      const parsedRows: TODO = await parseCSV(uploadedFile);
      if (parsedRows.length <= 100) {
        const updatedRows = parsedRows.map((obj: any) => {
          const { condition, ...rest } = obj;
          return {
            ...rest,
            condition_id: getValueByLabel(condition, conditionOptions),
          };
        });
        getPartNumberDetails(updatedRows);
        let obj: TODO = {};
        obj.conditions = conditionOptions;
        obj.uoms = unitOfMeasureOptions;
        setPopupOptions(obj);
      } else {
        toastError({
          title:
            'Uploaded CSV has more than 100 rows. Please upload with the max of 100 rows.',
        });
      }
    } else if (confirmationType === 2) {
      updatePurchaseOrder.mutate(poPaylod);
    }

    handleClose();
  };

  const handleClose = () => {
    setConfirmationType(1);
    setConfirmationTitle(defaultConfirmTitle);
    setConfirmationContent(defaultConfirmationContent);
    setOpenConfirmation(false); // Close the modal on cancel or outside click
  };

  const form = useForm({
    onValidSubmit: async (values) => {
      const payload: useUpdatePurchaseOrderBody = {
        id: Number(id),
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
        items: items.map(
          ({ id, options, disabled, remark, description, ...rest }) => rest
        ),
        remark: values.remarks ?? '',
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

      // Object.keys(fields).forEach(function (key, index) {
      //   console.log(fields[key].value, key, index);
      //   payload[key] = fields[key].value;
      // });

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
        updatePurchaseOrder.mutate(payload);
      }
    },
  });

  const showConfirmationPopup = (payload: any) => {
    setConfirmationType(2);
    setConfirmationTitle('Credit Limit Exceeds');
    setConfirmationContent(
      'Vendors credit limit is exceeded. Do you want to continue?'
    );
    setOpenConfirmation(true);
    setPOPaylod(payload);
  };

  const fields = useFormFields({ connect: form });

  const handleRemarksChange = (newValue: string) => {
    form.setValues({ [`remarks`]: newValue });
  };
  const [items, setItems] = useState<POItem[]>([
    {
      id: 1,
      qty: 0,
      price: 0,
      part_number_id: '',
      condition_id: '',
      unit_of_measure_id: '',
      quotation_item_id: 1,
      note: '',
      description: '',
    },
  ]);

  const addNewItem = () => {
    rowIdCounter.current += 1; // Increment the counter to get a new unique ID
    const newItem = {
      id: rowIdCounter.current,
      qty: 0,
      price: 0,
      part_number_id: '',
      condition_id: '',
      unit_of_measure_id: '',
      quotation_item_id: rowIdCounter.current,
      note: '',
    };
    setItems([...items, newItem]);
    setPartNumberDebounced('');
  };

  const handleChange = (field: string, itemId: number, updatedValue: any) => {
    if (field === 'part_number_id') {
      if (updatedValue) {
        getPartNumberInfo(updatedValue, itemId, true);
      } else {
        form.setValues({
          [`description_${itemId}`]: '',
          [`unit_of_measure_id_${itemId}`]: '',
        });
      }
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                [field]: updatedValue,
                description: '',
                unit_of_measure_id: '',
              }
            : item
        )
      );
    } else {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId ? { ...item, [field]: updatedValue } : item
        )
      );
    }
  };

  const getPartNumberInfo = async (
    part_number_id: number,
    rowId: number,
    uom?: boolean
  ) => {
    try {
      const response = await getAPICall(
        endPoints.find.spare_by_partnumber.replace(':id', part_number_id),
        FindByPartNumberIdPayload,
        {}
      );
      console.log(response);
      form.setValues({
        [`description_${rowId}`]: response?.part_number?.description,
      });
      if (uom) {
        form.setValues({
          [`unit_of_measure_id_${rowId}`]:
            response?.part_number?.unit_of_measure_id?.toString(),
        });
      }
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === rowId
            ? {
                ...item,
                part_number_id: part_number_id,
                description: response?.part_number?.description,
                unit_of_measure_id:
                  response?.part_number?.unit_of_measure_id?.toString(),
              }
            : item
        )
      );
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (isSuccess && details && details.data) {
      console.log(details.data);
      setFullContactAddress(
        formatContactAddress(details.data?.customer_contact_manager)
      );
      setCustomerId(details?.data?.customer_id ?? 0);
      getCustomerInfo(details?.data?.customer_id);
      form.setValues({
        ship_mode_id: details.data.ship_mode_id.toString(),
        ship_type_id: details.data.ship_type_id.toString(),
        ship_account_id: details.data.ship_account_id,
        payment_mode_id: details.data.payment_mode_id.toString(),
        payment_term_id: details.data.payment_term_id.toString(),
        customer_contact_manager_id: details.data.customer_contact_manager_id,
        fob_id: details.data.fob_id.toString(),
        bank_charge: details.data.bank_charge
          ? details.data.bank_charge.toString()
          : '',
        freight: details.data.freight ? details.data.freight.toString() : '',
        misc: details.data.miscellaneous_charges
          ? details.data.miscellaneous_charges.toString()
          : '',
        vat: details.data.vat ? details.data.vat.toString() : '',
        discount: details.data.discount ? details.data.discount.toString() : '',
        currency_id: details.data.currency_id.toString(),
        priority_id: details.data.priority_id.toString(),
        customer_id: details.data.customer_id
          ? details.data.customer_id.toString()
          : '',
        ship_customer_shipping_address_id:
          details.data.ship_customer_shipping_address_id.toString(),
      });
      let Items: any = [];
      details.data.items.forEach(function (item) {
        let obj: any = {};
        obj.id = item.id;
        obj.qty = item.qty;
        obj.price = item.price;
        obj.part_number_id = item.part_number_id;
        obj.condition_id = item.condition_id;
        obj.unit_of_measure_id = item.unit_of_measure_id;
        obj.quotation_item_id = item.quotation_item_id;
        obj.note = item.note;
        getPartNumberInfo(item.part_number_id, item.id, false);
        form.setValues({
          [`part_number_${item.id}`]: item.part_number_id
            ? item.part_number_id.toString()
            : '',
          [`condition_id_${item.id}`]: item.condition_id
            ? item.condition_id.toString()
            : '',
          [`unit_of_measure_id_${item.id}`]: item.unit_of_measure_id
            ? item.unit_of_measure_id.toString()
            : '',
          [`remarks_${item.id}`]: item.note ? item.note.toString() : '',
          [`quantity_${item.id}`]: item.qty ? item.qty.toString() : '',
          [`price_${item.id}`]: item.price ? item.price.toString() : '',
        });

        Items.push(obj);
      });

      let existing_ids: any = getPropertyList(Items, 'part_number_id');
      setExistingPartNos(existing_ids.replace(/ /g, ''));
      setItems(Items);

      console.log('existing_ids', existing_ids);
    }
  }, [isSuccess, details]);

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const customerList: UseQueryResult<QueryData, unknown> = useCustomerList({
    type: 'suppliers',
  });
  const customerOptions = transformToSelectOptions(customerList.data);

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
  const [partNumberId, setPartNumberId] = useState<any>(null);
  const [popupOptions, setPopupOptions] = useState<TODO>({});

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  useEffect(() => {
    if (existingPartNos) {
      setQueryParams({ exist_ids: existingPartNos });
    }
  }, [existingPartNos]);

  useEffect(() => {
    if (partNumber) {
      setQueryParams({ query: partNumber });
    }
  }, [partNumber]);

  const setPartNumberDebounced = useRef(
    debounce((value: any) => {
      setPartNumber(value);
    })
  ).current;

  useEffect(() => {
    if (partNumberId !== null) {
      let obj: TODO = {};
      obj.conditions = conditionOptions;
      obj.uoms = convertToOptions(unitOfMeasureOptions);
      setPopupOptions(obj);
    }
  }, [partNumberId]);

  useEffect(() => {
    if (changedRIndex !== null) {
      setPartNumber('');
    }
  }, [changedRIndex]);

  const contactList = useContactManagerListById(customerDetails?.data?.id || 0);
  const contactOptions = transformToSelectOptions(contactList.data);

  const handleOpenPreview = () => {
    let popupVariables: any = {};
    popupVariables.id = id;
    popupVariables.subTotal = subTotal;
    popupVariables.totalPayableAmount = totalPayableAmount;
    popupVariables.vendor_name = customerDetails?.data?.business_name;
    popupVariables.vendor_code = customerDetails?.data?.code;
    popupVariables.vendor_email = customerDetails?.data?.email;
    popupVariables.contactAddress = fullContactAddress;
    popupVariables.vendorAddress = fullVendorAddress;
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
    popupVariables.version = details?.data?.version;
    Object.keys(fields).forEach(function (key, index) {
      console.log(fields[key].value, key, index);
      popupVariables[key] = fields[key].value;
    });
    popupVariables.items = items;
    console.log('popupVariables', popupVariables);
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  useEffect(() => {
    if (contactOptions && contactOptions.length > 0) {
      const newContactManager = Number(contactOptions[0].value);
      setContactManager(newContactManager);
      form.setValues({
        [`customer_contact_manager_id`]: newContactManager.toString(),
      });
    }
  }, [contactOptions, contactManager]);

  useEffect(() => {
    if (shippingOptions.length > 0) {
      console.log(shippingOptions);
      if (customerId) {
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

  useEffect(() => {
    if (shippingAddress > 0) {
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

  const contactDetails = useContactManagerDetails(contactManager);

  useEffect(() => {
    if (contactDetails.data) {
      setFullContactAddress(formatContactAddress(contactDetails.data));
    } else {
      setFullContactAddress('NA');
    }
  }, [contactDetails.data]);

  // const fullContactAddress =
  //   contactDetails.data &&
  //   `${contactDetails.data?.address}, ${contactDetails.data?.city}, ${contactDetails.data?.state}, ${contactDetails.data?.country}`;

  const handleDeleteItem = (index: number) => {
    const updatedItems = [...items];
    updatedItems.splice(index, 1);
    setItems(updatedItems);
  };

  const subTotal = useMemo(() => {
    return Math.round(
      (Number(
        items.reduce((acc, item) => acc + item.qty * Number(item.price), 0)
      ) *
        100) /
        100
    );
  }, [items]);

  const overallQTY = useMemo(() => {
    return items.reduce((acc, item) => acc + Number(item.qty), 0);
  }, [items]);

  const updatePurchaseOrder = useUpdatePurchaseOrder({
    onSuccess: (data) => {
      toastSuccess({
        title: `Direct Purchase Order Created - ${data.id}`,
        description: data.message,
        duration: 5000,
      });
      navigate('/purchase/purchase-order');
    },
    onError: (error) => {
      toastError({
        title: 'Purchase Order Update Failed',
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

  const vatAmount = Math.round(
    Number(
      items.reduce(
        (acc, item) =>
          acc +
          (Number(item.qty) * Number(item.price) * Number(fields.vat?.value)) /
            100,
        0
      ) * 100
    ) / 100
  );

  const totalPayableAmount =
    Math.round(
      Number(
        Number(
          items.reduce(
            (acc, item) => acc + Number(item.qty) * Number(item.price),
            0
          )
        ) +
          Number(fields.bank_charge?.value) +
          Number(fields.freight?.value) +
          Number(fields.misc?.value) -
          Number(fields.discount?.value) +
          vatAmount
      ) * 100
    ) / 100;

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
                <BreadcrumbLink>Direct Purchase Order Update</BreadcrumbLink>
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
            Direct Purchase Order Update
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay isLoading={isLoading}>
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
                  <FieldSelect
                    label={'Priority'}
                    name={'priority_id'}
                    size={'sm'}
                    required={'Priority is required'}
                    options={priorityOptions}
                  />

                  <FieldSelect
                    label={'Currency'}
                    name={'currency_id'}
                    size="sm"
                    required={'Currency is required'}
                    options={currencyOptions}
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
                    label={'Vendor'}
                    name={'customer_id'}
                    required={'Vendor required'}
                    placeholder="Select Vendor"
                    size="sm"
                    options={customerOptions}
                    onValueChange={(value) => {
                      setShippingOptions([]);
                      setShippingResetKey((prevKey) => prevKey + 1);
                      setFullVendorAddress('NA');
                      setFullContactAddress('NA');
                      if (value) {
                        getCustomerInfo(value);
                      }
                      setCustomerIdDebounced(Number(value));
                      setCustomerId(Number(value));
                    }}
                  />

                  <FieldDisplay
                    label="Vendor Code"
                    value={customerDetails?.data?.code || 'NA'}
                    size="sm"
                    style={{ backgroundColor: '#fff' }}
                  />

                  <FieldSelect
                    label={'Contact'}
                    name={'customer_contact_manager_id'}
                    size="sm"
                    required={'Contact is required'}
                    options={contactOptions}
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
                    key={`ship_address_${customerId}_${shippingAddressResetKey}`}
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
                      details?.data?.ship_customer_shipping_address_id
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

                {items.length > 0 && (
                  <Stack>
                    <HStack justify={'space-between'} mt={3}>
                      <Text fontSize="md" fontWeight="700">
                        Items
                      </Text>
                      <Input
                        type="file"
                        accept=".csv" // Add file types you want to accept
                        display="none" // Hide the default input file
                        id="file-upload-input"
                        onChange={handleFileChange}
                        key={fileKey}
                      />
                      <HStack ml="auto">
                        <Button
                          leftIcon={<LuDownload />}
                          colorScheme="blue"
                          as="label"
                          size={'sm'}
                          isDisabled={loading}
                          onClick={() =>
                            handleDownload(
                              import.meta.env.VITE_PR_SAMPLE_PARTNUMBERS_CSV
                            )
                          }
                        >
                          Download Sample
                        </Button>

                        <Button
                          leftIcon={<LuUpload />}
                          colorScheme="green"
                          as="label"
                          htmlFor="file-upload-input"
                          size={'sm'}
                          isDisabled={loading}
                        >
                          Upload PartNumbers
                        </Button>
                      </HStack>
                    </HStack>
                    <TableContainer rounded={'md'} overflow={'scroll'} my={4}>
                      <Table variant="striped" size={'sm'}>
                        <Thead bg={'gray'}>
                          <Tr>
                            <Th color={'white'}>#</Th>
                            <Th color={'white'}>Part.Num</Th>
                            <Th color={'white'}>Desc.</Th>
                            <Th color={'white'}>Cond.</Th>
                            <Th color={'white'}>Qty</Th>
                            <Th color={'white'}>Price</Th>
                            <Th color={'white'}>Total</Th>
                            <Th color={'white'}>UOM</Th>
                            <Th color={'white'}>Remark</Th>
                            <Th color={'white'} isNumeric>
                              Action
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {items.map((item, index) => (
                            <Tr key={item.id}>
                              <Td>{index + 1}</Td>
                              <Td>
                                <FieldSelect
                                  name={`part_number_${item.id}`}
                                  id={`part_number_${item.id}`}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                  required={'Part Number is required'}
                                  options={[
                                    ...(spareOptions ?? []),
                                    {
                                      value: 'add_new',
                                      label: (
                                        <Text
                                          color={'brand.500'}
                                          textDecoration={'underline'}
                                        >
                                          + Add New PN
                                        </Text>
                                      ),
                                    },
                                  ]}
                                  defaultValue={
                                    item.part_number_id
                                      ? item?.part_number_id.toString()
                                      : ''
                                  }
                                  isClearable={true}
                                  width="150px"
                                  onValueChange={(value) => {
                                    if (value === 'add_new') {
                                      navigate('/spares-master/create');
                                    }
                                    handleChange(
                                      'part_number_id',
                                      item.id,
                                      Number(value)
                                    );
                                    setChangedRIndex(null);
                                    setTimeout(() => {
                                      setChangedRIndex(index);
                                    }, 500);
                                  }}
                                  selectProps={{
                                    noOptionsMessage: () => 'No parts found',
                                    isLoading:
                                      listData.isLoading &&
                                      changedRIndex === index,
                                    //inputValue: changedRIndex === index ? partNumber: '',
                                    onInputChange: (event: any) => {
                                      setChangedRIndex(index);
                                      setPartNumber(event);
                                    },
                                  }}
                                  style={{
                                    width: 'auto',
                                    minWidth: 160,
                                    maxWidth: 'auto',
                                  }}
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`description_${resetKey}`}
                                  name={`description_${item.id}`}
                                  size={'sm'}
                                  isDisabled
                                  defaultValue={item.description}
                                />
                              </Td>
                              <Td>
                                <FieldSelect
                                  id={`condition_id_${resetKey}`}
                                  name={`condition_id_${item.id}`}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                  defaultValue={String(item.condition_id)}
                                  options={[
                                    ...(conditionOptions ?? []),
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
                                  onValueChange={(value) =>
                                    handleChange(
                                      'condition_id',
                                      item.id,
                                      Number(value)
                                    )
                                  }
                                  required="Condition is required"
                                />
                              </Td>

                              <Td>
                                <FieldInput
                                  id={`quantity_${item.id}`}
                                  key={`quantity_${resetKey}`}
                                  name={`quantity_${item.id}`}
                                  size={'sm'}
                                  defaultValue={String(item.qty)}
                                  onValueChange={(value) =>
                                    handleChange('qty', item.id, Number(value))
                                  }
                                  inputProps={{
                                    maxLength: 7,
                                  }}
                                  type="integer"
                                  width={'60px'}
                                  required="Quantity is required"
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`price_${resetKey}`}
                                  name={`price_${item.id}`}
                                  size={'sm'}
                                  type={'decimal'}
                                  defaultValue={String(item.price)}
                                  onValueChange={(value) =>
                                    handleChange(
                                      'price',
                                      item.id,
                                      Number(value)
                                    )
                                  }
                                  width={'80px'}
                                  required="Price is required"
                                />
                              </Td>
                              <Td>
                                <Text>
                                  {Number(
                                    fields[`price_${item.id}`]?.value ?? 0
                                  ) *
                                    Number(
                                      fields[`quantity_${item.id}`]?.value ?? 0
                                    )}
                                </Text>
                              </Td>
                              <Td>
                                <FieldSelect
                                  key={`unit_of_measure_id_${resetKey}`}
                                  id={`unit_of_measure_id_${item.id}`}
                                  name={`unit_of_measure_id_${item.id}`}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                  options={convertToOptions(
                                    unitOfMeasureOptions
                                  )}
                                  placeholder="Select UOM"
                                  isReadOnly={true}
                                  width={'80px'}
                                  className="disabled-input"
                                  onValueChange={(value) =>
                                    handleChange(
                                      'unit_of_measure_id',
                                      item.id,
                                      Number(value)
                                    )
                                  }
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  id={`remarks_${item.id}`}
                                  name={`remarks_${item.id}`}
                                  size={'sm'}
                                  defaultValue={String(item.note)}
                                  onValueChange={(value) =>
                                    handleChange('note', item.id, String(value))
                                  }
                                  maxLength={60}
                                />
                              </Td>

                              <Td isNumeric>
                                {index === items.length - 1 && (
                                  <IconButton
                                    aria-label="Add Row"
                                    variant="@primary"
                                    size={'sm'}
                                    icon={<HiOutlinePlus />}
                                    onClick={addNewItem}
                                    mr={2}
                                  />
                                )}

                                <IconButton
                                  aria-label="View Popup"
                                  colorScheme="green"
                                  size={'sm'}
                                  icon={<HiEye />}
                                  isDisabled={
                                    !fields[`part_number_${item.id}`]?.value
                                      ? true
                                      : false
                                  }
                                  onClick={() => {
                                    setPartNumberId(item.part_number_id);
                                    handleOpenModal(item.id);
                                  }}
                                  mr={2}
                                />

                                <IconButton
                                  aria-label="Delete Row"
                                  colorScheme="red"
                                  size={'sm'}
                                  icon={<DeleteIcon />}
                                  onClick={() => handleDeleteItem(index)}
                                  mr={2}
                                  isDisabled={items.length <= 1}
                                />
                              </Td>
                            </Tr>
                          ))}
                          <Tr>
                            <Td colSpan={2}>
                              Total Line Items:
                              <span
                                style={{ fontWeight: 'bold', marginLeft: 2 }}
                              >
                                {items.length}
                              </span>
                            </Td>
                            <Td colSpan={2}></Td>
                            <Td colSpan={2}>
                              Total Qty:
                              <span
                                style={{ fontWeight: 'bold', marginLeft: 2 }}
                              >
                                {overallQTY}
                              </span>
                            </Td>
                            <Td colSpan={5}></Td>
                          </Tr>
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </Stack>
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
                        currencyId={fields['currency_id']?.value ?? ''}
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
                        currencyId={fields['currency_id']?.value ?? ''}
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
                        currencyId={fields['currency_id']?.value ?? ''}
                      />
                    }
                    maxLength={3}
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
                        currencyId={fields['currency_id']?.value ?? ''}
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
                      defaultValue={details?.data.remark ?? ''}
                      name={`remarks`}
                      size={'sm'}
                      sx={{ display: 'none' }}
                    />
                    <FieldHTMLEditor
                      defaultValue={details?.data.remark ?? ''}
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
            onClose={() => {
              onShipAddrAddClose();
              getCustomerInfo(customerId);
              setResetKey((prevKey) => prevKey + 1);
            }}
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
            headerText={confirmationTitle}
            bodyText={confirmationContent}
          />

          <PRCSVUploadModal
            isOpen={isRespModalOpen}
            onClose={closeFileUploadModal}
            rows={csvRows}
            options={popupOptions}
          />
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default PurchaseOrderDirectCreate;
