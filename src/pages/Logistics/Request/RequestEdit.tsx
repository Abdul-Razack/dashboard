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
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import Axios from 'axios';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiEye } from 'react-icons/hi';
import { UseQueryResult, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FieldDayPicker } from '@/components/FieldDayPicker';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import LogisticRequestPreview from '@/components/PreviewContents/Logistics/LogisticRequest';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  calculateVolumetricWeight,
  convertToOptions,
  filterUOMoptions,
  formatDate,
  transformToSelectOptions
} from '@/helpers/commonHelper';
import PartDetails from '@/pages/Purchase/Quotation/PartDetails';
import { useLogisticsRequestDetails } from '@/services/logistics/request/services';
import { useCreateLogisticsRequest } from '@/services/logistics/request/services';
import {
  useCustomerList,
  useCustomerSupplierList,
} from '@/services/master/services';
import { useShippingAddressIndex } from '@/services/master/shipping/services';
import {
  usePurchaseOrderDetails,
  usePurchaseOrderList,
  useRelatedPurchaseOrderList,
} from '@/services/purchase/purchase-orders/services';
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

type SelectOption = {
  value: string | number;
  label: string | number;
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
}

interface GroupedItems {
  [packageNumber: string]: SelectedPOItem[];
}

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

export const LogisticsRequestEdit = () => {
  let { id } = useParams();
  const [poId, setPoId] = useState<number | null>(null);
  const [itemInfo, setItemInfo] = useState<any>({});
  const poList = usePurchaseOrderList();
  const poOptions = transformToSelectOptions(poList.data);
  const relatedPoList = useRelatedPurchaseOrderList({
    purchase_order_id: poId || 0,
  });
  const { data: details, isSuccess } = useLogisticsRequestDetails(Number(id));
  const relatedPoOptions = transformToSelectOptions(relatedPoList.data);
  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const shipTypeList = useShipTypesList();
  const shipTypeOptions = transformToSelectOptions(shipTypeList.data);
  const shipViaList = useShipViaList();
  const shipViaOptions = transformToSelectOptions(shipViaList.data);
  const customerList = useCustomerList();
  const customerOptions = transformToSelectOptions(customerList.data);
  const packageTypeList = usePackageTypeList();
  const packageTypeOptions = transformToSelectOptions(packageTypeList.data);
  const uomList = useUnitOfMeasureIndex();
  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const [loading, setLoading] = useState<boolean>(true);
  const { data: poDetails } = usePurchaseOrderDetails(poId ? poId : '');
  const [packageOptions, setPackageOptions] = useState<SelectOption[]>([
    { value: 'not_obtained', label: 'Not Obtained' },
  ]);

  const goodsTypes = [
    { value: 'true', label: 'DG' },
    { value: 'false', label: 'Non-DG' },
  ];

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
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [packages, setPackages] = useState<PackageDetail[]>([]);
  const [rows, setRows] = useState<{ id: number }[]>([]);
  const [relatedPoIds, setRelatedPoIds] = useState<number[]>([]);
  const [allPoItems, setAllPoItems] = useState<any[]>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>([]);
  const [uomOptions, setUOMOptions] = useState<any>([]);
  const [totalPcs, setTotalPcs] = useState(0);
  const [disabledDatePicker, setDisabledDatePicker] = useState<boolean>(true);
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
    if (details && details.data) {
      setItemInfo(details.data);
    }
  }, [isSuccess, details]);

  useEffect(() => {
    if (Object.keys(itemInfo).length > 0) {
      console.log(itemInfo);
      let ref_number: any = '';
      let related_ref_number: any = '';
      if (itemInfo?.purchase_orders.length > 0) {
        ref_number = itemInfo?.purchase_orders[0].purchase_order_id;
        if (itemInfo?.purchase_orders.length > 1) {
          let remaining = itemInfo?.purchase_orders.slice(1);
          if (remaining.length > 0) {
            related_ref_number = remaining
              .map((item: any) => item.purchase_order_id)
              .join(', ');
          }
        }
        setPoIdDebounced(Number(ref_number));
        setPoId(Number(itemInfo?.purchase_orders[0].id));
      } else {
        setPoId(null);
      }
      setRows(itemInfo?.packages);
      setPackages(itemInfo?.packages);
      setDuedate(itemInfo?.priority_id);
      form.setValues({
        [`type`]: itemInfo.type.toString(),
        [`priority_id`]: itemInfo.priority_id.toString(),
        [`ref_no`]: ref_number.toString(),
        [`related_ref_no`]: related_ref_number.toString(),
        [`ref_date`]: dayjs(itemInfo.ref_date),
        [`ship_type_id`]: itemInfo?.ship_type_id.toString(),
        [`ship_via_id`]: itemInfo?.ship_via_id.toString(),
        [`volumetric_weight`]: itemInfo?.volumetric_weight,
        [`no_of_package`]: itemInfo?.no_of_package,
        [`total_pcs`]: itemInfo?.pcs,
        [`is_dg`]: itemInfo?.is_dg.toString(),
        [`customer_id`]: itemInfo?.customer_id,
        [`receiver_customer_id`]: itemInfo?.receiver_customer_id.toString(),
        [`customer_shipping_address_id`]:
          itemInfo?.customer_shipping_address_id,
        [`receiver_shipping_address_id`]:
          itemInfo?.receiver_shipping_address_id,
      });
      let newRows: any = [];
      for (let i = 0; i < itemInfo?.packages.length; i++) {
        newRows.push({ id: i + 1 });
      }
      setRows(newRows);

      console.log(itemInfo?.packages);

      itemInfo?.packages.forEach((item: TODO, index: number) => {
        console.log(index);
        form.setValues({
          [`package_type_id_${index + 1}`]: item.package_type_id.toString(),
          [`description_${index + 1}`]: item.description.toString(),
          [`is_dg_${index + 1}`]: item.is_dg.toString(),
          [`weight_${index + 1}`]: item.weight.toString(),
          [`weight_unit_of_measurement_id_${index + 1}`]:
            item.weight_unit_of_measurement_id.toString(),
          [`length_${index + 1}`]: item.length.toString(),
          [`width_${index + 1}`]: item.width.toString(),
          [`height_${index + 1}`]: item.height.toString(),
          [`unit_of_measurement_id_${index + 1}`]:
            item.unit_of_measurement_id.toString(),
          [`volumetric_weight_${index + 1}`]: item.volumetric_weight.toString(),
        });
      });

      setShipperCustomerDebounced(Number(itemInfo?.customer_id));
      setShipperCustomer(Number(itemInfo?.customer_id));
      setReceiverCustomerDebounced(Number(itemInfo?.receiver_customer_id));
      setReceiverCustomer(Number(itemInfo?.receiver_customer_id));
      setLoading(false);
    }
  }, [itemInfo]);

  const setPoIdDebounced = useRef(
    debounce((value: number) => {
      setPoId(value);
      setRelatedPoIds([]);
      fetchPurchaseOrderDetails(value).then((data) => {
        setAllPoItems(data.data.items || []);
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

  const handleOpenPreview = () => {
    let popupVariables: any = {};
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
    popupVariables.allPoItems = allPoItems;
    popupVariables.addedQuantities = addedQuantities;

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

        const combinedItems = poDetailsResults.flatMap(
          (result) => result.data.items || []
        );
        setAllPoItems(combinedItems);
      } catch (error) {
        console.error('Error fetching PO items:', error);
      }
    };

    fetchAllPoItems();
  }, [poId, relatedPoIds, queryClient]);

  useEffect(() => {
    if (poDetails?.data.ship_customer_id) {
      setReceiverCustomerDebounced(poDetails.data.ship_customer_id);
    }
    if (poDetails?.data.customer_id) {
      setShipperCustomerDebounced(poDetails.data.customer_id);
    }
  }, [poDetails]);

  useEffect(() => {
    if (uomList.data?.items) {
      setUOMOptions(uomList.data?.items);
    }
  }, [uomList]);

  // useEffect( () => {
  //   console.log(allPoItems)
  //   console.log(itemInfo?.items)
  //   // let items_Added : any = [];
  //     itemInfo?.items.forEach((item: TODO, index: number) => {
  //       const itemValue = allPoItems.find((value) => item.id === itemId);
  //     });
  // },[allPoItems])

  const customerListSupplier = useCustomerSupplierList({
    type: 'customers',
  });

  const shipperOptions = customerListSupplier.data?.data.map((customer) => ({
    value: customer.id,
    label: customer.business_name,
  }));

  const consignorShippingIndex = useShippingAddressIndex({
    search: {
      customer_id: shipperCustomer,
    },
  });
  const consignorShippingOptions = consignorShippingIndex.data?.data.map(
    (item) => ({
      value: item.id,
      label: item.address,
    })
  );
  const consigneeShippingIndex = useShippingAddressIndex({
    search: {
      customer_id: receiverCustomer,
    },
  });
  const consigneeShippingOptions = consigneeShippingIndex.data?.data.map(
    (item) => ({
      value: item.id,
      label: item.address,
    })
  );

  // const addNewRow = () => {
  //   rowIdCounter.current += 1;
  //   const newRow = { id: rowIdCounter.current };
  //   setRows([...rows, newRow]);
  // };

  // const deleteRow = (rowId: number) => {
  //   const packageToDelete = getPackageNumber(rowId);

  //   // Remove the package from the packages state
  //   setPackages((prevPackages) =>
  //     prevPackages.filter((pkg) => pkg.package_number !== packageToDelete)
  //   );

  //   // Remove all items associated with this package from addedItemsDetails
  //   // and add the quantities back to the available quantities
  //   setAddedItemsDetails((prevDetails) => {
  //     const itemsToRemove = prevDetails.filter(
  //       (item) => item.packageNumber === packageToDelete
  //     );

  //     // Add back the LR quantities to the PO items
  //     itemsToRemove.forEach((item) => {
  //       const poItem = allPoItems.find((poItem) => poItem.id === item.id);
  //       if (poItem) {
  //         setAddedQuantities((prev) => ({
  //           ...prev,
  //           [item.id]: Math.max(0, (prev[item.id] || 0) - item.lrQuantity),
  //         }));
  //       }
  //     });

  //     return prevDetails.filter(
  //       (item) => item.packageNumber !== packageToDelete
  //     );
  //   });

  //   // Update lrQuantities
  //   setLrQuantities((prev) => {
  //     const newLrQuantities = { ...prev };
  //     addedItemsDetails.forEach((item) => {
  //       if (item.packageNumber === packageToDelete) {
  //         delete newLrQuantities[item.id];
  //       }
  //     });
  //     return newLrQuantities;
  //   });

  //   // Remove the row from the rows state
  //   setRows((prevRows) => prevRows.filter((row) => row.id !== rowId));
  // };

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

  const getPackageNumber = (rowId: number) => {
    const packageTypeId = fields[`package_type_id_${rowId}`]?.value;
    if (!packageTypeId) return ''; // Return empty if no packageTypeId found

    const matchingRows = rows.filter(
      (row: any) => fields[`package_type_id_${row.id}`]?.value === packageTypeId
    );
    const indexInMatchingRows =
      matchingRows.findIndex((row: any) => row.id === rowId) + 1;
    const prefix = generatePackageNumber(packageTypeId); // Prefix based on packageTypeId and sequential number

    return `${prefix}${indexInMatchingRows}`;
  };

  const isPackageObtained = (packageNumber: string) => {
    if (packages.length === 1) return true;
    return addedItemsDetails.some(
      (item) => item.packageNumber === packageNumber
    );
  };

  const updatePackage = (rowId: number) => {
    const packageTypeId = fields[`package_type_id_${rowId}`].value;
    const packageNumber = generatePackageNumber(packageTypeId);

    const newPackage: PackageDetail = {
      package_type_id: Number(packageTypeId),
      package_number: packageNumber,
      description: fields[`description_${rowId}`].value || '',
      is_dg: fields[`is_dg_${rowId}`]?.value === 'true',
      weight: parseFloat(fields[`weight_${rowId}`].value) || 0,
      weight_unit_of_measurement_id:
        Number(fields[`weight_unit_of_measurement_id_${rowId}`].value) || 0,
      length: parseFloat(fields[`length_${rowId}`].value) || 0,
      width: parseFloat(fields[`width_${rowId}`].value) || 0,
      height: parseFloat(fields[`height_${rowId}`].value) || 0,
      unit_of_measurement_id:
        Number(fields[`unit_of_measurement_id_${rowId}`].value) || 0,
      volumetric_weight: calculateVolumetricWeight(
        parseFloat(fields[`length_${rowId}`].value) || 0,
        parseFloat(fields[`width_${rowId}`].value) || 0,
        parseFloat(fields[`height_${rowId}`].value) || 0,
        fields[`unit_of_measurement_id_${rowId}`].value,
        uomOptions
      ),
      is_obtained: isPackageObtained(packageNumber),
    };

    setPackages((prevPackages) => {
      const index = prevPackages.findIndex(
        (p) => p.package_number === packageNumber
      );
      if (index !== -1) {
        const updatedPackages = [...prevPackages];
        updatedPackages[index] = { ...updatedPackages[index], ...newPackage };
        return updatedPackages;
      } else {
        return [...prevPackages, newPackage];
      }
    });
  };

  const updatePackageStatus = (packageNumber: string, isObtained: boolean) => {
    setPackages((prevPackages) =>
      prevPackages.map((pkg) =>
        pkg.package_number === packageNumber
          ? { ...pkg, is_obtained: isObtained }
          : pkg
      )
    );
  };

  useEffect(() => {
    const newPackageOptions = [
      { value: 'not_obtained', label: 'Not Obtained' },
      ...packages.map((pkg) => ({
        value: pkg.package_number,
        label: pkg.package_number,
      })),
    ];
    setPackageOptions(newPackageOptions);
  }, [packages]);

  const totalVolumetricWeight = useMemo(() => {
    return packages.reduce(
      (acc, pkg) =>
        acc + (pkg.volumetric_weight !== undefined ? pkg.volumetric_weight : 0),
      0
    );
  }, [packages]);

  // const packageOptions = useMemo(() => {
  //   return packages.map((pkg) => ({
  //     value: pkg.package_number,
  //     label: pkg.package_number,
  //   }));
  // }, [packages]);

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

  const findTabIndexByPackageNumber = (packageNumber: string) => {
    return organizedItems.findIndex(
      (item) => item.packageNumber === packageNumber
    );
  };

  const canAddSelectedItems = useMemo(() => {
    const hasSelectedItems = selectedItems.length > 0;
    const allHaveQuantities = selectedItems.every(
      (itemId) => lrQuantities[itemId] && lrQuantities[itemId] > 0
    );

    return hasSelectedItems && allHaveQuantities;
  }, [selectedItems, lrQuantities]);

  const handleAddItems = () => {
    if (allPoItems && (canAddItems || packages.length === 1)) {
      const packageNumber =
        packages.length === 1
          ? packages[0].package_number
          : fields['package_number'].value;

      const newSelectedDetails = allPoItems
        .filter((item) => selectedItems.includes(item.id))
        .map((item) => ({
          ...item,
          lrQuantity: lrQuantities[item.id] || 0,
          packageNumber: packageNumber,
        }));

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

      // Update package status only if it's not "not_obtained"
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
    onSubmit: async (values) => {
      const formatSubmissionData = (formValues: any) => {
        const notObtainedItems = addedItemsDetails
          .filter((item) => item.packageNumber === 'not_obtained')
          .map((item) => ({
            part_number_id: item.part_number_id,
            condition_id: item.condition_id,
            qty: item.lrQuantity,
            purchase_order_id: item.purchase_order_id,
            purchase_order_item_id: item.id,
          }));

        const obtainedPackages = packages.map((pkg) => {
          const packageItems = addedItemsDetails
            .filter((item) => item.packageNumber === pkg.package_number)
            .map((item) => ({
              part_number_id: item.part_number_id,
              condition_id: item.condition_id,
              qty: item.lrQuantity,
              purchase_order_id: item.purchase_order_id,
              purchase_order_item_id: item.id,
            }));

          return {
            ...pkg,
            is_dg: pkg.is_dg === true,
            items: packageItems,
          };
        });

        return {
          type: formValues.type,
          ref_date: formatDate(formValues.ref_date) || '',
          priority_id: Number(formValues.priority_id),
          ship_type_id: Number(formValues.ship_type_id),
          ship_via_id: Number(formValues.ship_via_id),
          is_dg: formValues.is_dg === 'true',
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
          items: notObtainedItems,
          packages: obtainedPackages,
        };
      };

      try {
        const payload: any = formatSubmissionData(values);
        // console.log('🚀 ~ onSubmit: ~ payload:', payload);
        createLogisticsRequest.mutate(payload);
      } catch (error) {
        toastError({
          title: 'Error submitting request',
          description: 'Please try again.',
        });
      }
      // const payload = formatSubmissionData(values);
      // console.log('Form values:', payload);
    },
  });

  const fields = useFormFields({
    connect: form,
  });

  const canAddItems = useMemo(() => {
    const packageSelected =
      fields['package_number']?.value && fields['package_number'].value !== '';
    return canAddSelectedItems && packageSelected;
  }, [canAddSelectedItems, fields]);

  useEffect(() => {
    // const numberOfPackages = parseInt(fields.no_of_package?.value || '0', 10);
    // if (numberOfPackages > 0) {
    //   const newRows = Array.from({ length: numberOfPackages }, (_, i) => ({
    //     id: i + 1,
    //   }));
    //   setRows(newRows);
    //   // If there's only one package, automatically mark it as obtained
    //   if (numberOfPackages === 1) {
    //     setPackages([
    //       {
    //         package_type_id: 0, // This will be updated when the user selects a package type
    //         package_number: '',
    //         description: '',
    //         is_dg: false,
    //         weight: 0,
    //         weight_unit_of_measurement_id: 0,
    //         length: 0,
    //         width: 0,
    //         height: 0,
    //         unit_of_measurement_id: 0,
    //         volumetric_weight: 0,
    //         is_obtained: true,
    //       },
    //     ]);
    //   } else {
    //     setPackages([]); // Reset packages for multiple packages
    //   }
    // } else {
    //   setRows([]);
    //   setPackages([]);
    // }
  }, [fields.no_of_package?.value]);

  const allApiDataLoaded = [poList, priorityList, shipTypeList].every(
    (query) => query.isSuccess
  );

  useEffect(() => {
    console.log(rows);
    rows.forEach((row) => {
      if (
        fields[`package_type_id_${row.id}`]?.value &&
        fields[`description_${row.id}`]?.value &&
        fields[`weight_${row.id}`]?.value &&
        fields[`weight_unit_of_measurement_id_${row.id}`]?.value &&
        fields[`length_${row.id}`]?.value &&
        fields[`width_${row.id}`]?.value &&
        fields[`height_${row.id}`]?.value &&
        fields[`unit_of_measurement_id_${row.id}`]?.value
      ) {
        updatePackage(row.id);
      }
    });
  }, [fields, rows]);

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
  }, [addedItemsDetails]);

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

  useEffect(() => {
    console.log(packages);
  }, [packages]);

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
                <BreadcrumbLink as={Link} to="/logistics">
                  Logistics Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Update Logistics Request</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Update Logistics Request
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
            <LoadingOverlay isLoading={!allApiDataLoaded || loading}>
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
                    label="LR Type"
                    name="type"
                    options={[
                      // { value: 'so', label: 'SO' },
                      { value: 'po', label: 'PO' },
                      // { value: 'wo', label: 'WO' },
                      // { value: 'open', label: 'Open' },
                    ]}
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
                      setPoIdDebounced(Number(value));
                      setPoId(Number(value));
                    }}
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
                  <FieldDayPicker
                    key={`ref_date_${poDetails?.data.created_at}`}
                    label="REF Date"
                    name="ref_date"
                    size={'sm'}
                    placeholder="Select Date"
                    defaultValue={
                      poDetails?.data.created_at
                        ? dayjs(poDetails?.data.created_at)
                        : undefined
                    }
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
                  />
                  <FieldSelect
                    label="Ship Via"
                    name="ship_via_id"
                    options={shipViaOptions}
                    size={'sm'}
                  />
                  <FieldSelect
                    label="Goods Type"
                    name="is_dg"
                    options={goodsTypes}
                    size={'sm'}
                    required="Goods Type is required"
                  />
                  <FieldDayPicker
                    label="Due Date"
                    name="due_date"
                    size={'sm'}
                    placeholder="Select Date"
                    disabledDays={{ before: new Date() }}
                    dayPickerProps={{
                      inputProps: {
                        isDisabled: disabledDatePicker,
                      },
                    }}
                  />
                  <FieldInput
                    key="no_of_package"
                    label="No of Pkgs"
                    name="no_of_package"
                    type="integer"
                    size="sm"
                    required="No of Pkgs is required"
                  />
                  <FieldInput
                    key={`total_pcs_${totalPcs}`}
                    label="Total Pcs"
                    name="total_pcs"
                    type="integer"
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
                    label={'Consignor/Shipper'}
                    name={'customer_id'}
                    size="sm"
                    required={'Consignor is required'}
                    options={shipperOptions || []}
                    onValueChange={(value) => {
                      setShipperCustomerDebounced(Number(value));
                      setShipperCustomer(Number(value));
                    }}
                  />
                  <FieldSelect
                    label={'Consignor/Shipper Address'}
                    name={'customer_shipping_address_id'}
                    size="sm"
                    required={'Shipping Address is required'}
                    options={consignorShippingOptions || []}
                  />
                  <FieldSelect
                    label="Consignee/Receiver"
                    name="receiver_customer_id"
                    options={customerOptions}
                    required="Consignee is required"
                    placeholder="Enter Consignee"
                    size="sm"
                    onValueChange={(value) => {
                      setReceiverCustomerDebounced(Number(value));
                      setReceiverCustomer(Number(value));
                    }}
                  />
                  <FieldSelect
                    label="Consignee/Receiver Address"
                    name="receiver_shipping_address_id"
                    required="Consignee Address is required"
                    placeholder="Enter Consignee Address"
                    options={consigneeShippingOptions || []}
                    defaultValue={1}
                    size="sm"
                    selectProps={{
                      isLoading: consigneeShippingIndex.isLoading,
                    }}
                  />
                </Stack>

                {rows.length > 0 && (
                  <>
                    <TableContainer rounded={'md'} overflow={'auto'} mt={2}>
                      <Table colorScheme="cyan" variant="striped" size={'sm'}>
                        <Thead bg={'gray'}>
                          <Tr>
                            <Th color={'white'}>Line Item</Th>
                            <Th color={'white'}>Package Type</Th>
                            <Th color={'white'}>PKG NO</Th>
                            <Th color={'white'}>Description</Th>
                            <Th color={'white'}>Goods Type</Th>
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
                            <Th color={'white'}>View</Th>
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
                                  onValueChange={() => {
                                    setRows([...rows]);
                                  }}
                                />
                              </Td>
                              <Td>
                                <Text>{getPackageNumber(row.id)}</Text>
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`description_${row.id}`}
                                  name={`description_${row.id}`}
                                  size={'sm'}
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
                                  isDisabled={
                                    !isPackageObtained(getPackageNumber(row.id))
                                  }
                                  placeholder={
                                    isPackageObtained(getPackageNumber(row.id))
                                      ? 'Select Goods Type'
                                      : 'Package Not Obtained'
                                  }
                                  onValueChange={(selectedOption) => {
                                    setPackages((prevPackages) =>
                                      prevPackages.map((pkg) =>
                                        pkg.package_number ===
                                        getPackageNumber(row.id)
                                          ? {
                                              ...pkg,
                                              is_dg: selectedOption === 'true',
                                            }
                                          : pkg
                                      )
                                    );
                                  }}
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`weight_${row.id}`}
                                  name={`weight_${row.id}`}
                                  type="decimal"
                                  size="sm"
                                />
                              </Td>
                              <Td>
                                <FieldSelect
                                  key={`weight_unit_of_measurement_id_${row.id}`}
                                  name={`weight_unit_of_measurement_id_${row.id}`}
                                  options={filterUOMoptions(uomOptions, 1)}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`length_${row.id}`}
                                  name={`length_${row.id}`}
                                  type="decimal"
                                  size="sm"
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`width_${row.id}`}
                                  name={`width_${row.id}`}
                                  type="decimal"
                                  size="sm"
                                />
                              </Td>
                              <Td>
                                <FieldInput
                                  key={`height_${row.id}`}
                                  name={`height_${row.id}`}
                                  type="decimal"
                                  size="sm"
                                />
                              </Td>
                              <Td>
                                <FieldSelect
                                  key={`unit_of_measurement_id_${row.id}`}
                                  name={`unit_of_measurement_id_${row.id}`}
                                  options={filterUOMoptions(uomOptions, 2)}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                />
                              </Td>
                              <Td>
                                <Input
                                  key={`volumetric_weight_${row.id}`}
                                  value={calculateVolumetricWeight(
                                    parseFloat(
                                      fields[`length_${row.id}`]?.value
                                    ),
                                    parseFloat(
                                      fields[`width_${row.id}`]?.value
                                    ),
                                    parseFloat(
                                      fields[`height_${row.id}`]?.value
                                    ),
                                    fields[`unit_of_measurement_id_${row.id}`]
                                      ?.value,
                                    uomOptions
                                  )}
                                  size="sm"
                                  isReadOnly
                                />
                              </Td>
                              <Td>
                                {/* <FieldSelect
                                  key={`is_obtained_${row.id}`}
                                  name={`is_obtained_${row.id}`}
                                  options={[
                                    { value: 'obtained', label: 'Obtained' },
                                    {
                                      value: 'not_obtained',
                                      label: 'Not Obtained',
                                    },
                                  ]}
                                  menuPortalTarget={document.body}
                                  size="sm"
                                  isDisabled={!canMarkAsObtained[row.id]}
                                  defaultValue="not_obtained"
                                  onValueChange={(value) =>
                                    updatePackage(
                                      row.id,
                                      value as 'obtained' | 'not_obtained'
                                    )
                                  }
                                /> */}
                                <Text>
                                  {packages.length === 1
                                    ? 'Obtained'
                                    : isPackageObtained(
                                          getPackageNumber(row.id)
                                        )
                                      ? 'Obtained'
                                      : 'Not Obtained'}
                                </Text>
                              </Td>
                              <Td>
                                <IconButton
                                  aria-label="View tab"
                                  colorScheme="blue"
                                  size={'sm'}
                                  icon={<HiEye />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const packageNumber = getPackageNumber(
                                      row.id
                                    );
                                    const tabIndex =
                                      findTabIndexByPackageNumber(
                                        packageNumber
                                      );
                                    if (tabIndex !== -1) {
                                      setActiveTab(tabIndex);
                                    }
                                  }}
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>

                    {allPoItems && (
                      <HStack justify={'space-between'} mt={2}>
                        <Text fontSize="md" fontWeight="700">
                          PO Items
                        </Text>
                        <HStack spacing={2} align="center">
                          <FieldSelect
                            name="package_number"
                            options={packageOptions}
                            size="sm"
                            isDisabled={!canAddSelectedItems}
                            defaultValue="not_obtained"
                          />
                          <Button
                            colorScheme="brand"
                            size={'sm'}
                            minW={0}
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
                              <Th color={'white'}>Line Item</Th>
                              <Th color={'white'}>Part No#</Th>
                              <Th color={'white'}>Description</Th>
                              <Th color={'white'}>HSC Code</Th>
                              <Th color={'white'}>Condition</Th>
                              <Th color={'white'}>Goods Type</Th>
                              <Th color={'white'}>PO Num</Th>
                              <Th color={'white'}>PO Total Qty</Th>
                              <Th color={'white'}>Total Recieved Qty</Th>
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
                                  onClick={() =>
                                    !isDisabled &&
                                    handleItemCheckboxChange(item.id)
                                  }
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
                                  <HscCodeDetails
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
                                  <Td>{item.qty}</Td>
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
                    {packages.length === 1 ? (
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
                              <Th>Line Item</Th>
                              <Th>Part No#</Th>
                              <Th>Description</Th>
                              <Th>HSC Code</Th>
                              <Th>Condition</Th>
                              <Th>Qty</Th>
                              <Th>Goods Type</Th>
                              <Th>PO Num</Th>
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
                                <HscCodeDetails
                                  partNumber={item.part_number_id}
                                />
                                <Td>
                                  {conditionList.data?.items?.[
                                    item.condition_id
                                  ] || 'N/A'}
                                </Td>
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
                                : packageNumber}
                              ({items.length} items,
                              {items.reduce(
                                (sum, item) => sum + item.lrQuantity,
                                0
                              )}
                              total qty)
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
                                        <Th>Line Item</Th>
                                        <Th>Part No#</Th>
                                        <Th>Description</Th>
                                        <Th>HSC Code</Th>
                                        <Th>Condition</Th>
                                        <Th>Qty</Th>
                                        <Th>Goods Type</Th>
                                        <Th>PO Num</Th>
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
                                          key={item.id}
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
                                          <HscCodeDetails
                                            partNumber={item.part_number_id}
                                          />
                                          <Td>
                                            {conditionList.data?.items?.[
                                              item.condition_id
                                            ] || 'N/A'}
                                          </Td>
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
                      isDisabled={!form.isValid}
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
      </Stack>
    </SlideIn>
  );
};

export default LogisticsRequestEdit;
