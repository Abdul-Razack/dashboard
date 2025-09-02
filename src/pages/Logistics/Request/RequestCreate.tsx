import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
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
  Input,
  InputGroup,
  InputRightElement,
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
import Axios from 'axios';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiOutlinePlus } from 'react-icons/hi';
import { LuDownload, LuUpload } from 'react-icons/lu';
import { UseQueryResult, useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldCounter } from '@/components/FieldCounter';
import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import SpareCreateModal from '@/components/Modals/SpareMaster';
import { PartNumberButtons } from '@/components/PartNumberButtons';
import { PRCSVUploadModal } from '@/components/Popups/FileUploadResponse/PurchaseRequest';
import LogisticRequestPreview from '@/components/PreviewContents/Logistics/LogisticRequest';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  calculateVolumetricWeight,
  convertToOptions,
  filterUOMoptions,
  formatContactAddress,
  getValueByLabel,
  handleDownload,
  parseCSV,
  transformToSelectOptions,
  formatDate
} from '@/helpers/commonHelper';
import PartDetails from '@/pages/Purchase/Quotation/PartDetails';
import ConditionCreateModal from '@/pages/Submaster/Condition/ConditionCreateModal';
import { postAPICall } from '@/services/apiService';
import {
  PayloadSchema,
  SearchResponsePayload,
} from '@/services/apiService/Schema/SpareSchema';
import { useCreateLogisticsRequest } from '@/services/logistics/request/services';
import { useCustomerSupplierList } from '@/services/master/services';
import {
  useShippingAddressDetails,
  useShippingAddressIndex,
} from '@/services/master/shipping/services';
import {
  usePurchaseOrderDetails,
  usePurchaseOrderList,
  useRelatedPurchaseOrderList,
} from '@/services/purchase/purchase-orders/services';
import { useSearchPartNumber } from '@/services/spare/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import {
  fetchPriorityInfo,
  usePriorityList,
} from '@/services/submaster/priority/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

import HscCodeDetails from './HscCodeDetails';
import PartNumberDetails from './PartNumberDetails';

type QueryData = {
  status: boolean;
  items?: Record<string, string | number>;
};

type PackageDetail = {
  package_type_id: number;
  package_number: string;
  description: string;
  is_dg: boolean;
  weight: number;
  weight_unit_of_measurement_id: number;
  length: number;
  width: number;
  height: number;
  unit_of_measurement_id: number;
  volumetric_weight: number | undefined;
  is_obtained: boolean;
  package_no?: string;
};

export interface SelectedPOItem {
  id: number;
  condition_id: number;
  part_number_id: number;
  price: number;
  purchase_order_id: number;
  qty: number;
  unit_of_measure_id: number;
  note?: string | null | undefined;
  lrQuantity: number;
  packageNumber: string;
  is_dg: boolean;
}

interface GroupedItems {
  [packageNumber: string]: SelectedPOItem[];
}

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

export const LogisticsRequestCreate = () => {
  const [packageOptions, setPackageOptions] = useState<TODO>([]);

  const goodsTypes = [
    { value: 'true', label: 'DG' },
    { value: 'false', label: 'Non-DG' },
  ];
  const rowIdCounter = useRef(1);
  const [addedQuantities, setAddedQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [activeTab, setActiveTab] = useState<number>(0);
  const [addedItemsDetails, setAddedItemsDetails] = useState<
    (SelectedPOItem & { packageNumber: string })[]
  >([]);
  const [shipperCustomer, setShipperCustomer] = useState<number>(0);
  const [receiverCustomer, setReceiverCustomer] = useState<number>(0);
  const [lrQuantities, setLrQuantities] = useState<{ [key: number]: number }>(
    {}
  );
  const [validationErrors, setValidationErrors] = useState<{
    [key: number]: string;
  }>({});
  const [lrType, setLRType] = useState<string>('');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [packages, setPackages] = useState<PackageDetail[]>([]);
  const [rows, setRows] = useState<TODO[]>([]);
  const [poId, setPoId] = useState<number | null>(null);
  const [relatedPoIds, setRelatedPoIds] = useState<number[]>([]);
  const [allPoItems, setAllPoItems] = useState<any[]>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>([]);
  const [uomOptions, setUOMOptions] = useState<any>([]);
  const [totalPcs, setTotalPcs] = useState(0);
  const [globalDgStatus, setGlobalDgStatus] = useState<boolean>(false);
  const [queryParams, setQueryParams] = useState<any>({});
  const listData = useSearchPartNumber(queryParams);
  const sparelistData = listData.data?.part_numbers;
  const [partNumber, setPartNumber] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [packageKey, setPackageKey] = useState(0);
  const [isRespModalOpen, setIsRespModalOpen] = useState(false);
  const { isOpen: isCNAddOpen, onClose: onCNAddClose } = useDisclosure();
  const [csvRows, setCSVRows] = useState<TODO | null>(null);
  const [popupOptions, setPopupOptions] = useState<TODO>({});
  const [noOfPackages, setNoOfPackages] = useState<number>(1);
  const defaultConfirmationContent =
    'Are you sure you want to upload this file?';
  const [confirmationContent, setConfirmationContent] = useState<string>(
    defaultConfirmationContent
  );
  const [shipperAddress, setShipperAddress] = useState<number>(0);
  const [receiverAddress, setReceiverAddress] = useState<number>(0);
  const [shipperContactAddress, setShipperContactAddress] = useState('N/A');
  const [receiverContactAddress, setReceiverContactAddress] = useState('N/A');
  const [disabledDatePicker, setDisabledDatePicker] = useState<boolean>(true);
  const shipperAddressDetails = useShippingAddressDetails(shipperAddress);
  const receiverAddressDetails = useShippingAddressDetails(receiverAddress);
  const getPriorityDetails = fetchPriorityInfo();

  const setDuedate = async (priority: any) => {
    let daysToAdd: number = 0;
    const priorityInfo = await getPriorityDetails(Number(priority));

    if (priorityInfo?.item) {
      daysToAdd = priorityInfo?.item?.days || 0;
      if (daysToAdd === 0) {
        setDisabledDatePicker(false);
        form.setValues({ [`due_date`]: '' });
      } else {
        setDisabledDatePicker(true);
        form.setValues({
          [`due_date`]: dayjs().add(daysToAdd, 'day'),
        });
      }
    }
  };

  useEffect(() => {
    if (shipperAddressDetails.data) {
      setShipperContactAddress(
        formatContactAddress(shipperAddressDetails.data)
      );
    } else {
      setShipperContactAddress('NA');
    }
  }, [shipperAddressDetails.data]);

  useEffect(() => {
    if (receiverAddressDetails.data) {
      setReceiverContactAddress(
        formatContactAddress(receiverAddressDetails.data)
      );
    } else {
      setReceiverContactAddress('NA');
    }
  }, [receiverAddressDetails.data]);
  const [spareLoading, setSpareSearchLoading] = useState<boolean>(false);

  useEffect(() => {
    if (spareLoading === true) {
      setTimeout(() => {
        setSpareSearchLoading(false);
      }, 3000);
    }
  }, [spareLoading]);

  const closeFileUploadModal = (items: any) => {
    let parsedItems: any = [];
    items.forEach((item: any) => {
      if (item.part_number_id !== null && item.part_number_id > 0) {
        let obj: any = {};
        obj.id = Number(rowIdCounter.current + 1);
        obj.part_number_id = Number(item?.part_number_id);
        obj.condition_id = Number(item?.condition_id);
        obj.qty = item?.quantity ? Number(item?.quantity) : '';
        obj.unit_of_measure_id = Number(item?.unit_of_measure_id);
        obj.options =
          Number(item?.unit_of_measure_id) === 6
            ? convertToOptions(uomOptions)
            : filterUOMoptions(uomOptions, 2);
        obj.disabled = Number(item?.unit_of_measure_id) === 6 ? true : false;
        obj.remark = item.remark ? item.remark : '';
        obj.note = '';
        obj.is_group = false;
        obj.purchase_order_id = '';
        obj.quotation_item_id = '';
        obj.price = '';
        parsedItems.push(obj);
        rowIdCounter.current += 1;
      }
    });
    setAllPoItems((currentItems) => [...currentItems, ...parsedItems]);
    setIsRespModalOpen(false);
  };

  const handleInputChange = (
    property: keyof PackageDetail,
    value: any,
    index: number
  ) => {
    const update = (item: any, i: number) =>
      i === index
        ? property === 'package_type_id'
          ? {
              ...item,
              [property]: value,
              package_no: getPackageNumber(i, value),
              package_number: getPackageNumber(i, value),
            }
          : { ...item, [property]: value }
        : item;

    setPackages((prevItems) => prevItems.map(update));
    setRows((prevItems) => prevItems.map(update));
  };

  const addNewItem = () => {
    let obj: any = {};
    obj.id = Number(rowIdCounter.current + 1);
    obj.part_number_id = fields.part_number?.value;
    obj.condition_id = fields.condition?.value;
    obj.qty = fields.quantity?.value;
    obj.unit_of_measure_id = fields.item_uom?.value;
    obj.note = '';
    obj.is_group = false;
    obj.purchase_order_id = '';
    obj.quotation_item_id = '';
    obj.price = '';
    setAllPoItems([...allPoItems, obj]);
    rowIdCounter.current += 1;
    setResetKey((prevCount) => prevCount + 1);
    form.setValues({
      [`part_number`]: null,
      [`condition`]: null,
      [`item_uom`]: '',
      [`quantity`]: '',
      [`item_description`]: '',
      [`remarks`]: '',
    });
  };

  useEffect(() => {
    if (partNumber) {
      setQueryParams({ query: partNumber });
    }
  }, [partNumber]);

  const spareOptions = sparelistData?.map((spare) => ({
    value: spare.id.toString(),
    label: spare.part_number,
  }));

  const {
    isOpen: isNewSpareModalOpen,
    onOpen: onNewSpareModalOpen,
    onClose: onNewSpareModalClose,
  } = useDisclosure();
  const [existingPartNos, setExistingPartNos] = useState<string>('');
  const [recentlyCreatedSpares, setRecentlyCreatedSpares] = useState<any>([]);
  const [partNumKey, setPartNumKey] = useState(0);
  const openSpareCreateModal = () => {
    onNewSpareModalOpen();
  };

  useEffect(() => {
    if (existingPartNos) {
      setQueryParams({ exist_ids: existingPartNos });
    }
  }, [existingPartNos]);

  useEffect(() => {
    if (recentlyCreatedSpares.length > 0) {
      setExistingPartNos(recentlyCreatedSpares.join(','));
    } else {
      setExistingPartNos('');
    }
  }, [recentlyCreatedSpares]);

  const handleCloseSpareModal = (status: boolean, id: any) => {
    setPartNumKey((prevKey) => prevKey + 1);
    if (status === true) {
      setRecentlyCreatedSpares((prevNumbers: any) => [...prevNumbers, id]);
      setTimeout(() => {
        form.setValues({ ['part_number']: id.toString() });
        if (id) {
          listData.refetch();
        }
      }, 1000);
    } else {
      setTimeout(() => {
        form.setValues({ ['part_number']: '' });
      }, 1000);
    }
    onNewSpareModalClose();
  };

  const setPoIdDebounced = useRef(
    debounce((value: number) => {
      setPoId(value);
      setRelatedPoIds([]);
      fetchPurchaseOrderDetails(value).then((data) => {
        let Items: any = [];
        data.data.items.forEach((item: any) => {
          item.id = item.id ? item.id : Number(rowIdCounter.current + 1);
          Items.push(item);
          rowIdCounter.current += 1;
        });
        setAllPoItems(Items);
      });
    }, 500)
  ).current;

  const setReceiverCustomerDebounced = useRef(
    debounce((value: number) => {
      setReceiverCustomer(value), 500;
    })
  ).current;

  const setShipperCustomerDebounced = useRef(
    debounce((value: number) => {
      setShipperCustomer(value), 500;
    })
  ).current;

  const handleRemarksChange = (newValue: string) => {
    form.setValues({ [`remarks`]: newValue });
  };

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // const rowIdCounter = useRef(1);

  const poList = usePurchaseOrderList();
  const poOptions = transformToSelectOptions(poList.data);
  const relatedPoList = useRelatedPurchaseOrderList({
    purchase_order_id: poId || 0,
  });
  const relatedPoOptions = transformToSelectOptions(relatedPoList.data);
  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const shipTypeList = useShipTypesList();
  const shipTypeOptions = transformToSelectOptions(shipTypeList.data);
  const shipViaList = useShipViaList();
  const shipViaOptions = transformToSelectOptions(shipViaList.data);
  const customerList = useCustomerSupplierList({
    type: 'customers',
  });

  const packageTypeList = usePackageTypeList();
  const packageTypeOptions = transformToSelectOptions(packageTypeList.data);
  const uomList = useUnitOfMeasureIndex();
  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [poLoading, setPOLoading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<TODO>(null);
  const { data: poDetails } = usePurchaseOrderDetails(poId ? poId : '');
  const [fileKey, setFileKey] = useState(0);
  const [pkgFileKey, setPKGFileKey] = useState(0);
  const [uploadType, setUploadType] = useState(0);
  const [refDateValues, setRefDateValues] = useState<any>([]);

  const fetchPurchaseOrderDetails = async (id: number) => {
    try {
      const response = await Axios.get(
        endPoints.info.purchase_order.replace(':id', id)
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch purchase order details:', error);
      throw error;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadType(1);
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setUploadedFile(selectedFile);
      setOpenConfirmation(true);
    }
    setFileKey((prevKey) => prevKey + 1);
  };

  const handlePKGFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadType(2);
    setConfirmationContent(
      'Existing packages will removed. Are you sure you want to upload this file?'
    );
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setUploadedFile(selectedFile);
      setOpenConfirmation(true);
    }
    setPKGFileKey((prevKey) => prevKey + 1);
  };

  const handleConfirm = async () => {
    const parsedRows: TODO = await parseCSV(uploadedFile);
    if (parsedRows.length <= 100) {
      if (uploadType === 1) {
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
        obj.uoms = uomOptions;
        setPopupOptions(obj);
      } else if (uploadType === 2) {
        form.setValues({ [`no_of_package`]: parsedRows.length });
        const packageTypeCounts: Record<string, number> = {};

        const updatedRows = parsedRows.map((obj: any) => {
          const {
            package_type,
            weight_unit_of_measurement,
            unit_of_measurement,
            goods_type,
            ...rest
          } = obj;

          rowIdCounter.current += 1;
          const id = rowIdCounter.current;
          const package_type_id = getValueByLabel(
            package_type,
            packageTypeOptions
          );

          // Initialize or increment count for this package type
          const typeKey = String(package_type_id ?? 'null');
          packageTypeCounts[typeKey] = (packageTypeCounts[typeKey] || 0) + 1;

          return {
            ...rest,
            id: id,
            package_type_id: package_type_id,
            package_no: getUploadPackageNumber(
              packageTypeCounts[typeKey],
              package_type_id ?? 0
            ),
            package_number: getUploadPackageNumber(
              packageTypeCounts[typeKey],
              package_type_id ?? 0
            ),
            is_dg: getValueByLabel(goods_type, goodsTypes),
            weight_unit_of_measurement_id: getValueByLabel(
              weight_unit_of_measurement,
              filterUOMoptions(uomOptions, 1)
            ),
            unit_of_measurement_id: getValueByLabel(
              unit_of_measurement,
              filterUOMoptions(uomOptions, 2)
            ),
          };
        });
        console.log(updatedRows);
        setRows(updatedRows);
        setPackages(updatedRows);
      }
      setUploadType(0);
    } else {
      toastError({
        title:
          'Uploaded CSV has more than 100 rows. Please upload with the max of 100 rows.',
      });
    }
    setOpenConfirmation(false);
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

  const handleClose = () => {
    setConfirmationContent('Are you sure you want to upload this file?.');
    setOpenConfirmation(false); // Close the modal on cancel or outside click
  };

  const handleOpenPreview = () => {
    let popupVariables: any = {};
    popupVariables.refDateValues = refDateValues;
    popupVariables.shipperContactAddress = shipperContactAddress;
    popupVariables.receiverContactAddress = receiverContactAddress;
    popupVariables.consignorShippingOptions = consignorShippingOptions;
    popupVariables.consigneeShippingOptions = consigneeShippingOptions;
    popupVariables.packageTypeOptions = packageTypeOptions;
    popupVariables.conditionOptions = conditionOptions;
    popupVariables.customerOptions = customerOptions;
    popupVariables.packageTypeList = packageTypeList;
    popupVariables.priorityOptions = priorityOptions;
    popupVariables.shipTypeOptions = shipTypeOptions;
    popupVariables.organizedItems = organizedItems;
    popupVariables.shipViaOptions = shipViaOptions;
    popupVariables.shipperOptions = shipperOptions;
    popupVariables.uomOptions = convertToOptions(uomOptions);
    popupVariables.uomItems = uomOptions;
    popupVariables.goodsTypes = goodsTypes;
    popupVariables.uomList = uomList;
    popupVariables.rows = rows;
    popupVariables.allPoItems = allPoItems;
    popupVariables.packages = packages;
    popupVariables.addedQuantities = addedQuantities;

    Object.keys(fields).forEach(function (key) {
      popupVariables[key] = fields[key].value;
    });
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  useEffect(() => {
    const fetchAllPoItems = async () => {
      const allIds = [poId, ...relatedPoIds].filter(
        (id): id is number => id !== null
      );

      if (allIds.length === 0) return;

      try {
        const poDetailsResults = await Promise.all(
          allIds.map((id) =>
            queryClient.fetchQuery(['purchaseOrderDetails', id], () =>
              fetchPurchaseOrderDetails(id)
            )
          )
        );

        console.log(poDetailsResults);

        const refDates = poDetailsResults.flatMap(
          (result) => result.data.created_at || []
        );

        setRefDateValues(refDates);

        const combinedItems = poDetailsResults.flatMap(
          (result) => result.data.items || []
        );
        let Items: any = [];
        combinedItems.forEach((item: any) => {
          item.id = item.id ? item.id : Number(rowIdCounter.current + 1);
          Items.push(item);
          rowIdCounter.current += 1;
        });
        setAllPoItems(Items);
      } catch (error) {
        console.error('Error fetching PO items:', error);
      }
    };

    fetchAllPoItems();
  }, [poId, relatedPoIds, queryClient]);

  useEffect(() => {
    if (poDetails?.data.ship_customer_id) {
      setReceiverCustomer(poDetails.data.ship_customer_id);
    }
    if (poDetails?.data.customer_id) {
      form.setValues({ [`customer_id`]: poDetails?.data?.customer_id });
      setShipperCustomer(poDetails.data.customer_id);
    }
    if (poDetails?.data) {
      setPOLoading(false);
    }
    setDuedate(poDetails?.data.priority_id);
    form.setValues({ [`receiver_customer_id`]: customerOptions[0]?.value });
    setReceiverCustomer(customerOptions[0]?.value);
  }, [poDetails]);

  useEffect(() => {
    if (uomList.data?.items) {
      setUOMOptions(uomList.data?.items);
    }
  }, [uomList]);

  const customerListSupplier = useCustomerSupplierList({
    type: 'suppliers',
  });

  const shipperOptions = customerListSupplier.data?.data.map((customer) => ({
    value: customer.id,
    label: customer.business_name + ' - ' + customer.code,
  }));

  const consignorShippingIndex = useShippingAddressIndex(
    {
      customer_id: shipperCustomer ? shipperCustomer.toString() : '',
    },
    {
      enabled: shipperCustomer > 0,
    }
  );

  const consigneeShippingIndex = useShippingAddressIndex(
    {
      customer_id: receiverCustomer ? receiverCustomer.toString() : '',
    },
    {
      enabled: receiverCustomer > 0,
    }
  );

  const [customerOptions, setCustomerOptions] = useState<any>([]);
  const [consignorShippingOptions, setConsignorShippingOptions] = useState<any>(
    []
  );
  const [consigneeShippingOptions, setConsigneeShippingOptions] = useState<any>(
    []
  );

  useEffect(() => {
    if (customerList.data) {
      const options: any = customerList.data?.data.map((customer) => ({
        value: customer.id,
        label: customer.business_name + ' - ' + customer.code,
      }));

      setCustomerOptions(options);
    }
  }, [customerList.data]);

  useEffect(() => {
    if (consignorShippingIndex.data) {
      const options: any = consignorShippingIndex.data?.data.map((item) => ({
        value: item.id,
        label: item.attention,
      }));
      setConsignorShippingOptions(options);
      if (options.length > 0) {
        form.setValues({ [`customer_shipping_address_id`]: options[0]?.value });
        setShipperAddress(Number(options[0]?.value));
      } else {
        form.setValues({ [`customer_shipping_address_id`]: '' });
        setShipperAddress(0);
      }
    }
  }, [consignorShippingIndex.data]);

  useEffect(() => {
    if (consigneeShippingIndex.data) {
      const options: any = consigneeShippingIndex.data?.data.map((item) => ({
        value: item.id,
        label: item.attention,
      }));
      setConsigneeShippingOptions(options);
      if (options.length > 0) {
        form.setValues({ [`receiver_shipping_address_id`]: options[0]?.value });
        setReceiverAddress(Number(options[0]?.value));
      } else {
        form.setValues({ [`receiver_shipping_address_id`]: '' });
        setReceiverAddress(0);
      }
    }
  }, [consigneeShippingIndex.data]);

  const generatePackagePrefix = (packageTypeId: number | string | null) => {
    if (!packageTypeId) return '';
    const packageType = packageTypeList.data?.items[Number(packageTypeId)];
    if (!packageType) return '';

    return (
      packageType
        .match(/\b(\w)/g)
        ?.join('')
        .toUpperCase() || ''
    );
  };

  const getUploadPackageNumber = (
    sequenceNumber: number,
    packageTypeId: number | string | null
  ) => {
    const prefix = generatePackagePrefix(packageTypeId);
    return `${prefix}${sequenceNumber}`;
  };

  const generatePackageNumber = (packageTypeId: number | string) => {
    const packageTypeLabel = packageTypeList.data?.items[Number(packageTypeId)];
    if (!packageTypeLabel) return '';
    const prefix =
      packageTypeLabel
        .match(/\b(\w)/g)
        ?.join('')
        .toUpperCase() || '';
    return `${prefix}`;
  };

  const getPackageNumber = (index: number, packageTypeId: number | string) => {
    const prefix = generatePackageNumber(packageTypeId);
    const sameTypeRowsBefore = rows.filter(
      (row, i) => row.package_type_id == packageTypeId && i < index
    );
    const sequenceNumber = sameTypeRowsBefore.length + 1;

    return `${prefix}${sequenceNumber}`;
  };

  const isPackageObtained = (packageNumber: string) => {
    if (packages.length === 1) return true;
    return addedItemsDetails.some(
      (item) => item.packageNumber === packageNumber
    );
  };

  // Add this new function to determine the package's DG status
  const determinePackageDGStatus = (packageNumber: string) => {
    const packageItems = addedItemsDetails.filter(
      (item) => item.packageNumber === packageNumber
    );
    return packageItems.some((item) => item.is_dg);
  };

  // Modify the updatePackageStatus function
  const updatePackageStatus = (packageNumber: string, isObtained: boolean) => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg) => {
        if (pkg.package_number === packageNumber) {
          const updatedPackage = { ...pkg, is_obtained: isObtained };
          if (isObtained) {
            updatedPackage.is_dg = determinePackageDGStatus(packageNumber);
          }
          return updatedPackage;
        }
        return pkg;
      })
    );
  };

  const totalVolumetricWeight = useMemo(() => {
    return (packages || [])
      .filter((pkg) => pkg !== undefined && pkg !== null) // Remove invalid items
      .reduce((acc, pkg) => {
        const volumetricWeight = calculateVolumetricWeight(
          parseFloat(pkg.length.toString()),
          parseFloat(pkg.width.toString()),
          parseFloat(pkg.height.toString()),
          pkg.unit_of_measurement_id.toString(),
          uomOptions
        );

        return acc + (volumetricWeight !== undefined ? volumetricWeight : 0);
      }, 0);
  }, [packages]);

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAllChecked(checked);
    if (checked && allPoItems) {
      setSelectedItems(
        allPoItems
          .filter((item) => !isItemFullyAdded(item))
          .map((item) => item.id)
      );
    } else {
      setSelectedItems([]);
    }
  };

  const handleItemCheckboxChange = (itemId: number) => {
    console.log(allPoItems, itemId);
    const item = allPoItems.find((item) => item.id === itemId);
    if (item && isItemFullyAdded(item)) return;

    setSelectedItems((prevItems) => {
      if (prevItems.includes(itemId)) {
        const filteredItems = prevItems.filter((id) => id !== itemId);
        setSelectAllChecked(false);
        return filteredItems;
      } else {
        const newItems = [...prevItems, itemId];
        setSelectAllChecked(
          newItems.length ===
            allPoItems.filter((item) => !isItemFullyAdded(item)).length
        );
        return newItems;
      }
    });
  };

const handleLrQtyChange = (itemId: number, lrQty: string) => {
  const parsedQty = parseInt(lrQty, 10);
  const item = allPoItems.find((item) => item.id === itemId);

  if (!item) return;

  const totalAddedQty = addedQuantities[itemId] || 0;
  const remainingQty = item.qty - totalAddedQty;

  if (parsedQty > remainingQty) {
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [itemId]: `Cannot exceed remaining quantity of ${remainingQty}`,
    }));

    setTimeout(() => {
      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [itemId]: '',
      }));
    }, 2000);
  } else {
    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [itemId]: '',
    }));

    setLrQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: parsedQty,
    }));
  }
};


  // const findTabIndexByPackageNumber = (packageNumber: string) => {
  //   return organizedItems.findIndex(
  //     (item) => item.packageNumber === packageNumber
  //   );
  // };

  const canAddSelectedItems = useMemo(() => {
    const hasSelectedItems = selectedItems.length > 0;
    const allHaveQuantities = selectedItems.every(
      (itemId) => lrQuantities[itemId] && lrQuantities[itemId] > 0
    );

    return hasSelectedItems && allHaveQuantities;
  }, [selectedItems, lrQuantities]);

  // Modify the handleAddItems function
  const handleAddItems = async () => {
    if (allPoItems && (canAddItems || packages.length === 1)) {
      const packageNumber = fields['package_number'].value;
      // packages.length === 1
      //   ? packages[0].package_no
      //   : fields['package_number'].value;

      const newSelectedDetails = await Promise.all(
        allPoItems
          .filter((item) => selectedItems.includes(item.id))
          .map(async (item) => {
            console.log(item);
            const partNumberDetails = await queryClient.fetchQuery(
              ['partNumberDetails', item.part_number_id],
              () => fetchPartNumberDetails(item.part_number_id)
            );
            const is_dg = partNumberDetails?.spare?.is_dg || false;

            return {
              ...item,
              lrQuantity: lrQuantities[item.id] || 0,
              packageNumber: packageNumber,
              is_dg: is_dg,
            };
          })
      );

      setAddedItemsDetails((prevDetails) => {
        const updatedDetails = prevDetails.filter(
          (item) =>
            !newSelectedDetails.some(
              (newItem) =>
                newItem.id === item.id &&
                newItem.packageNumber === item.packageNumber
            )
        );

        return [...updatedDetails, ...newSelectedDetails];
      });

      // Update addedQuantities
      setAddedQuantities((prevQuantities) => {
        const newQuantities = { ...prevQuantities };
        newSelectedDetails.forEach((item) => {
          newQuantities[item.id] =
            (newQuantities[item.id] || 0) + item.lrQuantity;
        });
        return newQuantities;
      });

      // Update package status and DG status
      if (packageNumber !== 'not_obtained') {
        updatePackageStatus(packageNumber, true);
      }

      // Reset selected items and LR quantities
      setSelectedItems([]);
      setLrQuantities({});
      setSelectAllChecked(false);
    } else {
      toastError({
        title: 'Cannot add selected items',
        description: 'Please ensure all items have quantities entered.',
      });
    }
  };

  const isItemFullyAdded = (item: any) => {
    const totalAddedQty = addedQuantities[item.id] || 0;
    return totalAddedQty >= item.qty;
  };

  const deleteItem = (itemId: number, packageNumber: string) => {
    setAddedItemsDetails((prevDetails) => {
      const itemToDelete = prevDetails.find(
        (item) => item.id === itemId && item.packageNumber === packageNumber
      );

      if (itemToDelete) {
        // Update addedQuantities
        setAddedQuantities((prevQuantities) => ({
          ...prevQuantities,
          [itemId]: Math.max(
            0,
            (prevQuantities[itemId] || 0) - itemToDelete.lrQuantity
          ),
        }));
      }

      const updatedDetails = prevDetails.filter(
        (item) => !(item.id === itemId && item.packageNumber === packageNumber)
      );

      // Check if the package still has items
      const packageStillHasItems = updatedDetails.some(
        (item) => item.packageNumber === packageNumber
      );

      // Update package status if it no longer has items
      if (!packageStillHasItems) {
        updatePackageStatus(packageNumber, false);
      }
      return updatedDetails;
    });

    // Reset LR quantity for the deleted item
    setLrQuantities((prevQuantities) => {
      const { [itemId]: _, ...rest } = prevQuantities;
      return rest;
    });
  };

  const organizedItems = useMemo(() => {
    console.log(addedItemsDetails);
    const grouped = addedItemsDetails.reduce<GroupedItems>((acc, item) => {
      if (!acc[item.packageNumber]) {
        acc[item.packageNumber] = [];
      }
      acc[item.packageNumber].push(item);
      return acc;
    }, {});

    return Object.entries(grouped).map(([packageNumber, items]) => ({
      packageNumber,
      items,
    }));
  }, [addedItemsDetails]);

  const createLogisticsRequest = useCreateLogisticsRequest({
    onSuccess: (data) => {
      toastSuccess({
        title: `Logistics Request Created ${data.id}`,
      });
      navigate('/logistics/request');
    },
    onError: (error) => {
      toastError({
        title: 'Logistics Request Creation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });

  

  const form = useForm({
    onValidSubmit: async (values) => {
      if (addedItemsDetails.length > 0) {
        const formatSubmissionData = (formValues: any) => {
          const itemsNotObtained = addedItemsDetails
            .filter((item) => item.packageNumber === 'not_obtained')
            .map((item) => ({
              part_number_id: item.part_number_id,
              condition_id: item.condition_id,
              qty: item.lrQuantity,
              purchase_order_id: item.purchase_order_id,
              purchase_order_item_id: item.id,
              unit_of_measure_id: item.unit_of_measure_id,
            }));

          let notObtainedItems: any = [];

          itemsNotObtained.forEach((item: any) => {
            if (
              item.purchase_order_id === '' ||
              item.purchase_order_id === undefined ||
              item.purchase_order_id === null
            ) {
              delete item.purchase_order_id;
            }
            if (
              item.purchase_order_item_id === '' ||
              item.purchase_order_item_id === undefined ||
              item.purchase_order_item_id === null
            ) {
              delete item.purchase_order_item_id;
            }
            notObtainedItems.push(item);
          });

          const activePackages = packages.filter(
            (pkg) => pkg.package_type_id !== 0 && pkg.package_number !== ''
          );

          const validPackages = activePackages.map((obj: any) => {
            const newPackage: PackageDetail = {
              package_type_id: Number(obj.package_type_id),
              package_number: obj.package_no,
              description: obj.description,
              is_dg: obj.is_dg === 'true',
              weight: parseFloat(obj.weight) || 0,
              weight_unit_of_measurement_id:
                Number(obj.weight_unit_of_measurement_id) || 0,
              length: parseFloat(obj.length) || 0,
              width: parseFloat(obj.width) || 0,
              height: parseFloat(obj.height) || 0,
              unit_of_measurement_id: Number(obj.unit_of_measurement_id) || 0,
              volumetric_weight: calculateVolumetricWeight(
                parseFloat(obj.length) || 0,
                parseFloat(obj.width) || 0,
                parseFloat(obj.height) || 0,
                obj.unit_of_measurement_id,
                uomOptions
              ),
              is_obtained: isPackageObtained(obj.package_no),
            };
            return newPackage;
          });

          const obtainedPackages = validPackages.map((pkg) => {
            const packageItems = addedItemsDetails
              .filter((item) => item.packageNumber === pkg.package_number)
              .map((item) => {
                const { purchase_order_id, purchase_order_item_id, ...rest } = {
                  part_number_id: item.part_number_id,
                  condition_id: item.condition_id,
                  qty: item.lrQuantity,
                  purchase_order_id: item.purchase_order_id,
                  purchase_order_item_id: item.id,
                  unit_of_measure_id: item.unit_of_measure_id,
                };

                return {
                  ...rest,
                  ...(purchase_order_id && { purchase_order_id }),
                  ...(purchase_order_item_id && { purchase_order_item_id }),
                };
              });

            return {
              ...pkg,
              is_dg: pkg.is_dg === true,
              items: packageItems,
            };
          });

          return {
            type: formValues.type,
            priority_id: Number(formValues.priority_id),
            ship_type_id: Number(formValues.ship_type_id),
            ship_via_id: Number(formValues.ship_via_id),
            pcs: totalPcs,
            is_dg: globalDgStatus,
            due_date: formatDate(formValues.due_date) || '',
            no_of_package: Number(formValues.no_of_package),
            volumetric_weight: Number(formValues.volumetric_weight),
            customer_id: Number(formValues.customer_id),
            customer_shipping_address_id: Number(
              formValues.customer_shipping_address_id
            ),
            receiver_customer_id: Number(formValues.receiver_customer_id),
            receiver_shipping_address_id: Number(
              formValues.receiver_shipping_address_id
            ),
            purchase_order_ids: [
              Number(formValues.ref_no),
              ...(formValues.related_ref_no || []).map(Number),
            ].filter(Boolean),
            remark: formValues.remark,
            items: itemsNotObtained,
            packages: obtainedPackages,
          };
        };
        console.log(formatSubmissionData(values));
        try {
          const payload: any = formatSubmissionData(values);
          createLogisticsRequest.mutate(payload);
        } catch (error) {
          toastError({
            title: 'Error submitting request',
            description: 'Please try again.',
          });
        }
      } else {
        toastError({
          title: 'No Packages Found!!!',
          description:
            'You forgot to add items inside packages. Please add items to proceed',
        });
      }
    },
  });

  const fields = useFormFields({
    connect: form,
  });

  const getDescriptionForRow = (selectedPartNumber: string) => {
    if (selectedPartNumber) {
      const item = sparelistData?.find(
        (spare) => spare.id === Number(selectedPartNumber)
      );
      const desc = item?.description || '';
      const uom = item?.unit_of_measure_id || '';
      form.setValues({ [`item_description`]: desc });
      form.setValues({ [`item_uom`]: uom?.toString() });
    } else {
      form.setValues({ [`item_description`]: '', [`item_uom`]: '' });
    }
  };

  const canAddItems = useMemo(() => {
    const packageSelected =
      fields['package_number']?.value && fields['package_number'].value !== '';
    return canAddSelectedItems && packageSelected;
  }, [canAddSelectedItems, fields]);

  useEffect(() => {
    const handlePackagesChange = debounce((value: number) => {
      if (value > 0) {
        setRows((prevRows) => {
          if (value < prevRows.length) {
            const newRows = prevRows.slice(0, value);
            setPackages(newRows);
            return newRows;
          }

          const newRows = [...prevRows];
          for (let i = prevRows.length; i < value; i++) {
            newRows.push({
              package_type_id: 0,
              package_number: '',
              description: '',
              is_dg: false,
              weight: 0,
              weight_unit_of_measurement_id: 0,
              length: 0,
              width: 0,
              height: 0,
              unit_of_measurement_id: 0,
              volumetric_weight: 0,
              is_obtained: false,
            });
          }
          setPackages(newRows);
          return newRows;
        });
      } else {
        setRows([]);
        setPackages([]);
      }
    }, 500);

    handlePackagesChange(noOfPackages);

    return () => {
      handlePackagesChange.cancel();
    };
  }, [noOfPackages]);

  const allApiDataLoaded = [poList, priorityList, shipTypeList].every(
    (query) => query.isSuccess
  );

  useEffect(() => {
    console.log(rows);
    const newPackageOptions = [
      ...(rows.length > 1
        ? [{ value: 'not_obtained', label: 'Not Obtained' }]
        : []),
      ...rows
        .filter((pkg) => pkg.package_type_id)
        .map((pkg) => ({
          value: pkg.package_no,
          label: pkg.package_no,
        })),
    ];
    setPackageOptions(newPackageOptions);
    // form.setValues({
    //     [`package_number`]: newPackageOptions[0].value
    //   });
    setPackageKey((prevCount) => prevCount + 1);
    // rows.forEach((row) => {
    //   if (
    //     fields[`package_type_id_${row.id}`]?.value &&
    //     fields[`description_${row.id}`]?.value &&
    //     fields[`weight_${row.id}`]?.value &&
    //     fields[`weight_unit_of_measurement_id_${row.id}`]?.value &&
    //     fields[`length_${row.id}`]?.value &&
    //     fields[`width_${row.id}`]?.value &&
    //     fields[`height_${row.id}`]?.value &&
    //     fields[`unit_of_measurement_id_${row.id}`]?.value
    //   ) {
    //     updatePackage(row.id);
    //   }
    // });
  }, [rows]);

  const packageHasItems = (packageNumber: string) => {
    return addedItemsDetails.some(
      (item) => item.packageNumber === packageNumber
    );
  };

  useEffect(() => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg) => ({
        ...pkg,
        is_obtained: packageHasItems(pkg.package_number),
      }))
    );
    const dgStatus = addedItemsDetails.some((item) => item.is_dg === true);
    const updatedPackages = packages.map((pkg, index) => {
      const hasDangerousGoods = addedItemsDetails.some(
        (item) =>
          item.packageNumber === pkg.package_number && item.is_dg === true
      );
      form.setValues({
        [`is_dg_${rows[index].id}`]: hasDangerousGoods ? 'true' : 'false',
      });

      return {
        ...pkg,
        is_dg: hasDangerousGoods ? true : pkg.is_dg,
      };
    });
    setPackages(updatedPackages);
    setGlobalDgStatus(dgStatus);
    setTimeout(() => {
      form.setValues({
        [`is_dg`]: dgStatus.toString(),
      });
    }, 1000);
  }, [addedItemsDetails]);

  useEffect(() => {
    if (allPoItems.length > 0) {
      const dgStatus = allPoItems.some((item) => item.is_dg === true);
      setGlobalDgStatus(dgStatus);
      form.setValues({
        [`is_dg`]: dgStatus.toString(),
      });
    }
  }, [allPoItems]);

  useEffect(() => {
    const calculateTotalPcs = () => {
      const total = addedItemsDetails.reduce(
        (sum, item) => sum + item.lrQuantity,
        0
      );
      setTotalPcs(total);
    };

    calculateTotalPcs();
  }, [addedItemsDetails]);

  const fetchPartNumberDetails = async (partNumberId: number) => {
    try {
      const response = await Axios.get(
        `/spare/find-by-part-number-id/${partNumberId}`
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return response.data;
    } catch (error) {
      console.error('Failed to fetch part number details:', error);
      throw error;
    }
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
                <BreadcrumbLink as={Link} to="/logistics/request">
                  Logistics Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Add Logistics Request</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Add Logistics Request
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
            Logistics Request
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay isLoading={!allApiDataLoaded}>
              <Stack spacing={2}>
                <LoadingOverlay isLoading={poLoading}>
                  <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    bg={'gray.100'}
                    p={4}
                    rounded={'md'}
                    border={'1px solid'}
                    borderColor={'gray.300'}
                    mb={2}
                  >
                    <FieldSelect
                      label="LR Type"
                      name="type"
                      options={[
                        // { value: 'so', label: 'SO' },
                        { value: 'po', label: 'PO' },
                        // { value: 'wo', label: 'WO' },
                        // { value: 'open', label: 'Open' },
                      ]}
                      onValueChange={(value) => {
                        setLRType(value ?? '');
                      }}
                      size={'sm'}
                      required="LR Type is required"
                    />
                    <FieldSelect
                      label="REF No"
                      name="ref_no"
                      options={poOptions}
                      size={'sm'}
                      required="REF No is required"
                      onValueChange={(value) => {
                        setPOLoading(true);
                        setPoIdDebounced(Number(value));
                        setPoId(Number(value));
                        setRelatedPoIds([]);
                        setShipperCustomer(0);
                        //setShipperContactAddress('N/A');
                        form.setValues({
                          [`customer_id`]: '',
                          [`customer_shipping_address_id`]: '',
                        });
                      }}
                      isDisabled={lrType === ''}
                    />
                    {poId && (
                      <FieldSelect
                        label="Related REF No"
                        name="related_ref_no"
                        options={relatedPoOptions}
                        size={'sm'}
                        isMulti
                        onValueChange={(value) => {
                          setRelatedPoIds(value ? value.map(Number) : []);
                        }}
                      />
                    )}
                    <FieldDisplay
                      key={`ref_date_${poDetails?.data.created_at}`}
                      label="REF Date"
                      value={
                        refDateValues?.length > 0
                          ? refDateValues
                              .map((date: string) =>
                                format(new Date(date), 'dd/MM/yyyy')
                              )
                              .join('<br />')
                          : 'N/A'
                      }
                      size="sm"
                      isHtml={true}
                      style={{ backgroundColor: '#f4f5ec' }}
                    />
                    <FieldSelect
                      key={`priority_${poDetails?.data.priority_id}`}
                      label="Priority"
                      name="priority_id"
                      options={priorityOptions}
                      size={'sm'}
                      defaultValue={
                        poDetails?.data.priority_id
                          ? poDetails.data.priority_id.toString()
                          : ''
                      }
                      onValueChange={(value) => {
                        setDuedate(value);
                      }}
                      isDisabled={lrType === '' || poId === null}
                    />

                    <FieldDayPicker
                      key={`due_date_${poDetails?.data.created_at}`}
                      label="Due Date"
                      name="due_date"
                      size={'sm'}
                      placeholder="Select Date"
                      dayPickerProps={{
                        inputProps: {
                          isDisabled:
                            lrType === '' ||
                            poId === null ||
                            disabledDatePicker,
                        },
                      }}
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
                    mb={2}
                  >
                    <Box flex="1">
                      <FieldSelect
                        label={'Consignor/Shipper'}
                        name={'customer_id'}
                        size="sm"
                        required={'Consignor is required'}
                        options={shipperOptions || []}
                        onValueChange={(value) => {
                          setShipperCustomerDebounced(Number(value));
                        }}
                        isDisabled={lrType === '' || poId === null}
                      />
                    </Box>
                    <Box flex="1">
                      <FieldSelect
                        label={'Consignor/Shipper Contact'}
                        name={'customer_shipping_address_id'}
                        size="sm"
                        required={'Shipping Address is required'}
                        options={consignorShippingOptions || []}
                        onValueChange={(value) => {
                          setShipperAddress(Number(value));
                        }}
                        isDisabled={lrType === '' || poId === null}
                      />
                    </Box>
                    <Box flex="2">
                      <FieldDisplay
                        key={`shipper_contact_address_${shipperAddress}`}
                        label="Consignor/Shipper Address"
                        value={shipperContactAddress}
                        size="sm"
                        isHtml={true}
                        style={{ backgroundColor: '#fff' }}
                      />
                    </Box>
                    <Box flex="1">
                      <FieldSelect
                        key={`ship_type_${poDetails?.data.ship_type_id}`}
                        label="Ship Type"
                        name="ship_type_id"
                        options={shipTypeOptions}
                        size={'sm'}
                        required="Ship Type is required"
                        defaultValue={
                          poDetails?.data.ship_type_id
                            ? poDetails.data.ship_type_id.toString()
                            : ''
                        }
                        isDisabled={lrType === '' || poId === null}
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
                    mb={2}
                  >
                    <Box flex="1">
                      <FieldSelect
                        key={`receiver_customer`}
                        label="Consignee/Receiver"
                        name="receiver_customer_id"
                        options={customerOptions || []}
                        required="Consignee is required"
                        placeholder="Enter Consignee"
                        size="sm"
                        onValueChange={(value) => {
                          setReceiverCustomerDebounced(Number(value));
                        }}
                        isDisabled={lrType === '' || poId === null}
                      />
                    </Box>
                    <Box flex="1">
                      <FieldSelect
                        label="Consignee/Receiver Contact"
                        name="receiver_shipping_address_id"
                        required="Consignee Address is required"
                        placeholder="Enter Consignee Address"
                        options={consigneeShippingOptions || []}
                        defaultValue={1}
                        size="sm"
                        selectProps={{
                          isLoading: consigneeShippingIndex.isLoading,
                        }}
                        onValueChange={(value) => {
                          setReceiverAddress(Number(value));
                        }}
                        isDisabled={lrType === '' || poId === null}
                      />
                    </Box>
                    <Box flex="2">
                      <FieldDisplay
                        key={`receiver_contact_address_${receiverAddress}`}
                        label="Consignor/Receiver Address"
                        value={receiverContactAddress}
                        size="sm"
                        isHtml={true}
                        style={{ backgroundColor: '#fff' }}
                      />
                    </Box>
                    <Box flex="1">
                      <FieldSelect
                        label="Ship Via"
                        name="ship_via_id"
                        options={shipViaOptions}
                        required="Ship Via is required"
                        size={'sm'}
                        isDisabled={lrType === '' || poId === null}
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
                    <FieldCounter
                      size={'sm'}
                      name="no_of_package"
                      label="No of Pkgs"
                      min={1}
                      max={200}
                      defaultValue={1}
                      required="No of Pkgs is required"
                      onFinalChange={(value) => {
                        setNoOfPackages(Number(value));
                      }}
                      debounceDelay={500}
                    />

                    <FieldSelect
                      key={`is_dg_${globalDgStatus}`}
                      label="Goods Type"
                      name="is_dg"
                      options={goodsTypes}
                      size={'sm'}
                      required="Goods Type is required"
                      isDisabled={true}
                    />

                    <FieldInput
                      key={`total_pcs_${totalPcs}`}
                      label="Total Pcs"
                      name="total_pcs"
                      type="integre"
                      size="sm"
                      isReadOnly
                      defaultValue={totalPcs}
                    />
                    <FieldInput
                      key={`volumetric_weight_${totalVolumetricWeight.toFixed(2)}`}
                      label="Volumetric Wt"
                      name="volumetric_weight"
                      type="number"
                      size="sm"
                      required="Volumetric Wt is required"
                      defaultValue={totalVolumetricWeight.toFixed(2)}
                      isReadOnly
                      rightElement={<Text>KG</Text>}
                    />
                  </Stack>
                </LoadingOverlay>
                {rows.length > 0 && lrType && poId !== null && (
                  <>
                    <HStack justify={'space-between'} mt={3}>
                      <Text fontSize="md" fontWeight="700">
                        Packages
                      </Text>
                      <Input
                        type="file"
                        accept=".csv" // Add file types you want to accept
                        display="none" // Hide the default input file
                        id="package-upload-input"
                        onChange={handlePKGFileChange}
                        key={pkgFileKey}
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
                              import.meta.env.VITE_LR_PACKAGES_SAMPLE_CSV
                            )
                          }
                        >
                          Download PKG Sample
                        </Button>

                        <Button
                          leftIcon={<LuUpload />}
                          colorScheme="green"
                          as="label"
                          htmlFor="package-upload-input"
                          size={'sm'}
                          isDisabled={loading}
                        >
                          Upload Packages
                        </Button>
                      </HStack>
                    </HStack>
                    <TableContainer rounded={'md'} overflow={'auto'} mt={2}>
                      <Table colorScheme="cyan" variant="striped" size={'sm'}>
                        <Thead bg={'gray'}>
                          <Tr>
                            <Th color={'white'}>#</Th>
                            <Th color={'white'}>Package Type</Th>
                            <Th color={'white'}>PKG NO</Th>
                            <Th color={'white'}>Description</Th>
                            <Th color={'white'} sx={{ minWidth: '150px' }}>
                              Goods Type
                            </Th>
                            <Th color={'white'}>Weight</Th>
                            <Th color={'white'} sx={{ minWidth: '130px' }}>
                              UOM
                            </Th>
                            <Th color={'white'}>Length</Th>
                            <Th color={'white'}>Width</Th>
                            <Th color={'white'}>Height</Th>
                            <Th color={'white'} sx={{ minWidth: '130px' }}>
                              UOM
                            </Th>
                            <Th color={'white'}>Volumetric Wt</Th>
                            <Th color={'white'}>Add Part Details</Th>
                            {/* <Th color={'white'}>View</Th> */}
                          </Tr>
                        </Thead>
                        <Tbody>
                          {rows.map((row, index) => (
                            <Tr key={index}>
                              <Td>{index + 1}</Td>
                              <Td>
                                <FieldSelect
                                  key={`package_type_id_${row.id}`}
                                  name={`package_type_id_${row.id}`}
                                  options={packageTypeOptions}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                  onValueChange={(value) => {
                                    handleInputChange(
                                      'package_type_id',
                                      value,
                                      index
                                    );
                                  }}
                                  defaultValue={
                                    row?.package_type_id
                                      ? row?.package_type_id.toString()
                                      : ''
                                  }
                                  required="Package Type is required"
                                />
                              </Td>
                              <Td>
                                <Text>{row.package_no}</Text>
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`description_${row.id}`}
                                  name={`description_${row.id}`}
                                  size={'sm'}
                                  defaultValue={
                                    row?.description ? row?.description : ''
                                  }
                                  maxLength={20}
                                  onValueChange={(value) => {
                                    handleInputChange(
                                      'description',
                                      value,
                                      index
                                    );
                                  }}
                                />
                              </Td>
                              <Td>
                                {/* <FieldSelect
                                  name={'is_dg'}
                                  options={[
                                    { value: 'true', label: 'DG' },
                                    { value: 'false', label: 'Non-DG' },
                                  ]}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                /> */}
                                <FieldSelect
                                  name={`is_dg_${row.id}`}
                                  options={[
                                    { value: 'true', label: 'DG' },
                                    { value: 'false', label: 'Non-DG' },
                                  ]}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                  isDisabled={isPackageObtained(row.package_no)}
                                  placeholder={
                                    !isPackageObtained(row.package_no)
                                      ? 'Select Goods Type'
                                      : 'Package Obtained'
                                  }
                                  onValueChange={(selectedOption) => {
                                    setPackages((prevPackages) =>
                                      prevPackages.map((pkg) =>
                                        pkg.package_number === row.package_no
                                          ? {
                                              ...pkg,
                                              is_dg: selectedOption === 'true',
                                            }
                                          : pkg
                                      )
                                    );
                                  }}
                                  required="Goods type is required"
                                  defaultValue={'false'}
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`weight_${row.id}`}
                                  name={`weight_${row.id}`}
                                  type="decimal"
                                  size="sm"
                                  defaultValue={row?.weight ? row?.weight : ''}
                                  maxLength={9}
                                  showErrorinTT={true}
                                  required="Weight required"
                                  onValueChange={(value) => {
                                    handleInputChange('weight', value, index);
                                  }}
                                />
                              </Td>
                              <Td>
                                <FieldSelect
                                  key={`weight_unit_of_measurement_id_${row.id}`}
                                  name={`weight_unit_of_measurement_id_${row.id}`}
                                  options={filterUOMoptions(uomOptions, 1)}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                  defaultValue={
                                    row?.weight_unit_of_measurement_id
                                      ? row?.weight_unit_of_measurement_id.toString()
                                      : ''
                                  }
                                  required="Weight UOM required"
                                  onValueChange={(value) => {
                                    handleInputChange(
                                      'weight_unit_of_measurement_id',
                                      value,
                                      index
                                    );
                                  }}
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`length_${row.id}`}
                                  name={`length_${row.id}`}
                                  type="decimal"
                                  size="sm"
                                  defaultValue={row?.length ? row?.length : ''}
                                  maxLength={9}
                                  required="Length required"
                                  showErrorinTT={true}
                                  onValueChange={(value) => {
                                    handleInputChange('length', value, index);
                                  }}
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`width_${row.id}`}
                                  name={`width_${row.id}`}
                                  type="decimal"
                                  size="sm"
                                  defaultValue={row?.width ? row?.width : ''}
                                  maxLength={9}
                                  required="Width required"
                                  showErrorinTT={true}
                                  onValueChange={(value) => {
                                    handleInputChange('width', value, index);
                                  }}
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`height_${row.id}`}
                                  name={`height_${row.id}`}
                                  type="decimal"
                                  size="sm"
                                  defaultValue={row?.height ? row?.height : ''}
                                  maxLength={9}
                                  showErrorinTT={true}
                                  required="Height required"
                                  onValueChange={(value) => {
                                    handleInputChange('height', value, index);
                                  }}
                                />
                              </Td>
                              <Td>
                                <FieldSelect
                                  key={`unit_of_measurement_id_${row.id}`}
                                  name={`unit_of_measurement_id_${row.id}`}
                                  options={filterUOMoptions(uomOptions, 2)}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                  defaultValue={
                                    row?.unit_of_measurement_id
                                      ? row?.unit_of_measurement_id.toString()
                                      : ''
                                  }
                                  required="UOM required"
                                  onValueChange={(value) => {
                                    handleInputChange(
                                      'unit_of_measurement_id',
                                      value,
                                      index
                                    );
                                  }}
                                />
                              </Td>
                              <Td>
                                <InputGroup size="sm">
                                  <Input
                                    key={`volumetric_weight_${row.id}`}
                                    value={calculateVolumetricWeight(
                                      parseFloat(row?.length ?? 0),
                                      parseFloat(row?.width ?? 0),
                                      parseFloat(row?.height ?? 0),
                                      row?.unit_of_measurement_id ?? 0,
                                      uomOptions
                                    )}
                                    size="sm"
                                    isReadOnly
                                  />
                                  <InputRightElement>
                                    <Text fontSize="sm">KG</Text>
                                  </InputRightElement>
                                </InputGroup>
                              </Td>
                              <Td>
                                <Text>
                                  {packages.length === 1
                                    ? 'Obtained'
                                    : isPackageObtained(row.package_no)
                                      ? 'Obtained'
                                      : 'Not Obtained'}
                                </Text>
                              </Td>
                              {/* <Td>
                                <IconButton
                                  aria-label="View tab"
                                  colorScheme="blue"
                                  size={'sm'}
                                  icon={<HiEye />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const packageNumber = getPackageNumber(row.id);
                                    const tabIndex =
                                      findTabIndexByPackageNumber(
                                        packageNumber
                                      );
                                    if (tabIndex !== -1) {
                                      setActiveTab(tabIndex);
                                    }
                                  }}
                                />
                              </Td> */}
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>

                    <Stack display={'none'}>
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
                      <LoadingOverlay isLoading={loading}>
                        <TableContainer
                          rounded={'md'}
                          overflow={'auto'}
                          border="1px"
                          borderColor="gray.500"
                          borderRadius="md"
                          boxShadow="md"
                        >
                          <Table variant="simple" size={'sm'}>
                            <Thead bg={'gray'}>
                              <Tr>
                                <Th color={'white'}>Part Number</Th>
                                <Th color={'white'}>Description</Th>
                                <Th color={'white'}>Condition</Th>
                                <Th color={'white'}>Quantity</Th>
                                <Th color={'white'}>UOM</Th>
                                <Th color={'white'} isNumeric>
                                  Action
                                </Th>
                              </Tr>
                            </Thead>
                            <Tbody>
                              <Tr>
                                <Td width={'200px'}>
                                  <Stack
                                    direction={{ base: 'column', md: 'row' }}
                                  >
                                    <PartNumberButtons
                                      partNumber={fields.part_number?.value}
                                    />
                                    <FieldSelect
                                      key={`part_number_${partNumKey}`}
                                      name={`part_number`}
                                      size={'sm'}
                                      menuPortalTarget={document.body}
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
                                      isClearable={true}
                                      onValueChange={(value) => {
                                        if (value === 'add_new') {
                                          openSpareCreateModal();
                                        }
                                        getDescriptionForRow(
                                          value === 'add_new' ? '' : value ?? ''
                                        );
                                      }}
                                      selectProps={{
                                        noOptionsMessage: () =>
                                          'No parts found',
                                        isLoading: spareLoading,
                                        onInputChange: (event: any) => {
                                          setPartNumber(event);
                                        },
                                      }}
                                      style={{
                                        minWidth: '200px',
                                      }}
                                    />
                                  </Stack>
                                </Td>
                                <Td>
                                  <FieldInput
                                    name={`item_description`}
                                    size={'sm'}
                                    isDisabled
                                  />
                                </Td>
                                <Td width={'120px'}>
                                  <FieldSelect
                                    key={`condition_${resetKey}`}
                                    name={`condition`}
                                    size={'sm'}
                                    menuPortalTarget={document.body}
                                    options={conditionOptions}
                                  />
                                </Td>
                                <Td width={'120px'}>
                                  <FieldInput
                                    name={`quantity`}
                                    size={'sm'}
                                    type="integer"
                                    maxLength={9}
                                  />
                                </Td>
                                <Td width={'120px'}>
                                  <FieldSelect
                                    name={`item_uom`}
                                    size={'sm'}
                                    menuPortalTarget={document.body}
                                    options={convertToOptions(uomOptions)}
                                  />
                                </Td>

                                <Td isNumeric>
                                  <Button
                                    variant="@primary"
                                    size={'sm'}
                                    onClick={addNewItem}
                                    isDisabled={
                                      !fields.item_uom?.value ||
                                      !fields.part_number?.value ||
                                      !fields.condition?.value ||
                                      !fields.quantity?.value
                                    }
                                  >
                                    <HiOutlinePlus /> Add Item
                                  </Button>
                                </Td>
                              </Tr>
                            </Tbody>
                          </Table>
                        </TableContainer>
                      </LoadingOverlay>
                    </Stack>

                    {allPoItems && allPoItems.length > 0 && (
                      <HStack justify={'space-between'} mt={2}>
                        <Text fontSize="md" fontWeight="700">
                          PO Items
                        </Text>
                        <HStack spacing={2} align="center">
                          <FieldSelect
                            key={`package_${packageKey}`}
                            name="package_number"
                            options={packageOptions}
                            size="sm"
                            isDisabled={!canAddSelectedItems}
                          />
                          <Button
                            px={6}
                            variant="@primary"
                            size={'sm'}
                            isDisabled={!canAddItems}
                            onClick={handleAddItems}
                            title={
                              !canAddItems
                                ? 'Please select items, enter quantities, and choose a package number'
                                : 'Add selected items'
                            }
                          >
                            Add Items
                          </Button>
                        </HStack>
                      </HStack>
                    )}

                    {allPoItems.length > 0 && (
                      <TableContainer
                        borderRadius={'md'}
                        boxShadow={'md'}
                        borderWidth={1}
                        borderColor={'gray.200'}
                        overflow={'auto'}
                      >
                        <Table variant={'unstyled'} size={'sm'}>
                          <Thead bg={'gray'}>
                            <Tr>
                              <Th color={'white'}>
                                <Checkbox
                                  isChecked={selectAllChecked}
                                  onChange={(e) =>
                                    handleSelectAllChange(e.target.checked)
                                  }
                                  isDisabled={allPoItems.every(
                                    isItemFullyAdded
                                  )}
                                />
                              </Th>
                              <Th color={'white'}>#</Th>
                              <Th color={'white'}>Part No#</Th>
                              <Th color={'white'}>Description</Th>
                              <Th color={'white'}>Condition</Th>
                              <Th color={'white'}>HSC Code</Th>
                              <Th color={'white'}>Goods Type</Th>
                              <Th color={'white'}>PO</Th>
                              <Th color={'white'}>PO Total Qty</Th>
                              <Th color={'white'}>Total Rec Qty</Th>
                              <Th color={'white'}>Added Qty</Th>
                              <Th color={'white'}>LR Qty</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {allPoItems.map((item, index) => {
                              const isDisabled = isItemFullyAdded(item);
                              return (
                                <Tr
                                  key={index}
                                  // onClick={() =>
                                  //   !isDisabled &&
                                  //   handleItemCheckboxChange(item.id)
                                  // }
                                  _hover={{
                                    backgroundColor: isDisabled
                                      ? 'transparent'
                                      : 'gray.100',
                                  }}
                                  className={
                                    isDisabled
                                      ? 'cursor-not-allowed'
                                      : 'cursor-pointer'
                                  }
                                  opacity={isDisabled ? 0.5 : 1}
                                >
                                  <Td>
                                    <Checkbox
                                      isChecked={selectedItems.includes(
                                        item.id
                                      )}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        if (!isDisabled)
                                          handleItemCheckboxChange(item.id);
                                      }}
                                      isDisabled={isDisabled}
                                    />
                                  </Td>
                                  <Td>{index + 1}</Td>
                                  <PartDetails
                                    partNumber={item.part_number_id}
                                  />
                                  <Td>
                                    {conditionList.data?.items?.[
                                      item.condition_id
                                    ] || 'N/A'}
                                  </Td>
                                  <HscCodeDetails
                                    partNumber={item.part_number_id}
                                  />
                                  <PartNumberDetails
                                    part_number={item.part_number_id}
                                    type="goods_type"
                                  />
                                  <Td>{item.purchase_order_id}</Td>
                                  <Td>{item.qty}</Td>
                                  <Td>0</Td>
                                  <Td>{addedQuantities[item.id] || 0}</Td>
                                  <Td>
                                    <Input
                                      name={`lr_qty_${item.id}`}
                                      type="number"
                                      size="sm"
                                      onClick={(
                                        e: React.MouseEvent<HTMLInputElement>
                                      ) => e.stopPropagation()}
                                      onChange={(e) =>
                                        handleLrQtyChange(
                                          item.id,
                                          e.target.value
                                        )
                                      }
                                      value={lrQuantities[item.id] || ''}
                                      borderColor={
                                        validationErrors[item.id]
                                          ? 'red.500'
                                          : 'gray.200'
                                      }
                                      isDisabled={isDisabled}
                                    />
                                    {validationErrors[item.id] && (
                                      <Text
                                        color="red.500"
                                        fontWeight={500}
                                        fontSize="sm"
                                      >
                                        {validationErrors[item.id]}
                                      </Text>
                                    )}
                                  </Td>
                                </Tr>
                              );
                            })}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    )}
                  </>
                )}

                {addedItemsDetails.length > 0 && (
                  <Box mt={4}>
                    <Text fontSize="md" fontWeight="700">
                      Added Items
                    </Text>
                    {organizedItems.length === 1 ? (
                      <TableContainer
                        bg={'white'}
                        borderRadius={'md'}
                        boxShadow={'md'}
                        borderWidth={1}
                        borderColor={'gray.200'}
                        mt={4}
                      >
                        <Table variant={'unstyled'} size="sm">
                          <Thead bg={'gray.200'}>
                            <Tr>
                              <Th>#</Th>
                              <Th>Part No#</Th>
                              <Th>Description</Th>
                              <Th>Condition</Th>
                              <Th>HSC Code</Th>
                              <Th>Qty</Th>
                              <Th>Goods Type</Th>
                              <Th>PO</Th>
                              <Th>UN#</Th>
                              <Th>Class</Th>
                              <Th>MSDS</Th>
                              <Th>LR Qty</Th>
                              <Th isNumeric>Action</Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {addedItemsDetails.map((item, index) => (
                              <Tr
                                key={item.id}
                                sx={{
                                  backgroundColor:
                                    index % 2 === 0 ? 'green.200' : '#fff',
                                }}
                              >
                                <Td>{index + 1}</Td>
                                <PartDetails partNumber={item.part_number_id} />

                                <Td>
                                  {conditionList.data?.items?.[
                                    item.condition_id
                                  ] || 'N/A'}
                                </Td>
                                <HscCodeDetails
                                  partNumber={item.part_number_id}
                                />
                                <Td>{item.qty}</Td>
                                <PartNumberDetails
                                  part_number={item.part_number_id}
                                  type="goods_type"
                                />
                                <Td>{item.purchase_order_id}</Td>
                                <PartNumberDetails
                                  part_number={item.part_number_id}
                                  type="un_number"
                                />
                                <PartNumberDetails
                                  part_number={item.part_number_id}
                                  type="class"
                                />
                                <PartNumberDetails
                                  part_number={item.part_number_id}
                                  type="msds"
                                />
                                <Td>{item.lrQuantity}</Td>
                                <Td isNumeric>
                                  <IconButton
                                    aria-label="Delete Row"
                                    colorScheme="red"
                                    size={'sm'}
                                    icon={<DeleteIcon />}
                                    onClick={() =>
                                      deleteItem(item.id, item.packageNumber)
                                    }
                                  />
                                </Td>
                              </Tr>
                            ))}
                          </Tbody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Tabs
                        variant="enclosed-colored"
                        colorScheme="green"
                        mt={4}
                        index={activeTab}
                        onChange={(index) => setActiveTab(index)}
                      >
                        <TabList flexWrap={'wrap'}>
                          {organizedItems.map(({ packageNumber, items }) => (
                            <Tab key={packageNumber}>
                              {packageNumber === 'not_obtained'
                                ? 'Not Obtained'
                                : packageNumber}{' '}
                              (Items - {items.length}, Qty -{' '}
                              {items.reduce(
                                (sum, item) => sum + item.lrQuantity,
                                0
                              )}
                              )
                            </Tab>
                          ))}
                        </TabList>
                        <TabPanels>
                          {organizedItems.map(({ packageNumber, items }) => (
                            <TabPanel p={4} key={packageNumber}>
                              {items.length > 0 ? (
                                <TableContainer
                                  bg={'white'}
                                  borderRadius={'md'}
                                  boxShadow={'md'}
                                  borderWidth={1}
                                  borderColor={'gray.200'}
                                  mt={4}
                                >
                                  <Table variant={'unstyled'} size="sm">
                                    <Thead bg={'gray.200'}>
                                      <Tr>
                                        <Th>#</Th>
                                        <Th>Part No#</Th>
                                        <Th>Description</Th>
                                        <Th>Condition</Th>
                                        <Th>HSC Code</Th>
                                        <Th>Qty</Th>
                                        <Th>Goods Type</Th>
                                        <Th>PO</Th>
                                        <Th>UN#</Th>
                                        <Th>Class</Th>
                                        <Th>MSDS</Th>
                                        <Th>LR Qty</Th>
                                        <Th isNumeric>Action</Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody>
                                      {items.map((item, index) => (
                                        <Tr
                                          key={`${index}_${item.id}`}
                                          sx={{
                                            backgroundColor:
                                              index % 2 === 0
                                                ? 'green.200'
                                                : '#fff',
                                          }}
                                        >
                                          <Td>{index + 1}</Td>
                                          <PartDetails
                                            partNumber={item.part_number_id}
                                          />

                                          <Td>
                                            {conditionList.data?.items?.[
                                              item.condition_id
                                            ] || 'N/A'}
                                          </Td>
                                          <HscCodeDetails
                                            partNumber={item.part_number_id}
                                          />
                                          <Td>{item.qty}</Td>
                                          <PartNumberDetails
                                            part_number={item.part_number_id}
                                            type="goods_type"
                                          />
                                          <Td>{item.purchase_order_id}</Td>
                                          <PartNumberDetails
                                            part_number={item.part_number_id}
                                            type="un_number"
                                          />
                                          <PartNumberDetails
                                            part_number={item.part_number_id}
                                            type="class"
                                          />
                                          <PartNumberDetails
                                            part_number={item.part_number_id}
                                            type="msds"
                                          />
                                          <Td>{item.lrQuantity}</Td>
                                          <Td isNumeric>
                                            <IconButton
                                              aria-label="Delete Row"
                                              colorScheme="red"
                                              size={'sm'}
                                              icon={<DeleteIcon />}
                                              onClick={() =>
                                                deleteItem(
                                                  item.id,
                                                  packageNumber
                                                )
                                              }
                                            />
                                          </Td>
                                        </Tr>
                                      ))}
                                    </Tbody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <Text>No items in this package</Text>
                              )}
                            </TabPanel>
                          ))}
                        </TabPanels>
                      </Tabs>
                    )}
                  </Box>
                )}

                {addedItemsDetails.length === 0 && (
                  <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    bg="gray.100"
                    p={4}
                    rounded="md"
                    border="1px solid"
                    borderColor="gray.300"
                    mb={2}
                    textAlign="center"
                    align="center"
                    justify="center"
                  >
                    <Text fontSize="md">No items added into packages yet</Text>
                  </Stack>
                )}

                {lrType && poId !== null && (
                  <Stack>
                    <FormControl>
                      <FormLabel>Remarks</FormLabel>
                      <FieldInput
                        name={`remarks`}
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
                )}
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  justify={'center'}
                  mt={4}
                >
                  <Button
                    type="submit"
                    colorScheme="brand"
                    isLoading={createLogisticsRequest.isLoading}
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
                      isDisabled={!form.isValid || addedItemsDetails.length === 0}
                    >
                      Preview
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>
            </LoadingOverlay>
          </Formiz>
        </Stack>

        <LogisticRequestPreview
          isOpen={isPreviewModalOpen}
          onClose={handleCloseModal}
          data={previewData}
        />

        <ConditionCreateModal
          isOpen={isCNAddOpen}
          onClose={() => {
            onCNAddClose();
            conditionList.refetch();
          }}
        />

        <ConfirmationPopup
          isOpen={openConfirmation}
          onClose={handleClose}
          onConfirm={handleConfirm}
          headerText="Upload File"
          bodyText={confirmationContent}
        />

        <SpareCreateModal
          isOpen={isNewSpareModalOpen}
          onClose={handleCloseSpareModal}
        />

        <PRCSVUploadModal
          isOpen={isRespModalOpen}
          onClose={closeFileUploadModal}
          rows={csvRows}
          options={popupOptions}
        />
      </Stack>
    </SlideIn>
  );
};

export default LogisticsRequestCreate;
