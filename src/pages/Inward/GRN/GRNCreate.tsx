import { useEffect, useMemo, useState } from 'react';

import {
  ChevronDownIcon,
  ChevronRightIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Checkbox,
  Flex,
  HStack,
  Heading,
  Icon,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
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
import { Formiz, useForm, useFormFields } from '@formiz/core';
import dayjs from 'dayjs';
import { FaFile } from 'react-icons/fa';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { LuEye } from 'react-icons/lu';
import { useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { GRNStockInfo } from '@/components/Popups/GRNStock';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { STFInfoComponent } from '@/components/STFInfo';
import { SlideIn } from '@/components/SlideIn';
import {
  useToastError, // useToastInfo,
  useToastSuccess,
} from '@/components/Toast';
import { getPropertyList, transformToSelectOptions } from '@/helpers/commonHelper';
import useConditionName from '@/hooks/useConditionName';
import useTagTypeName from '@/hooks/useTagTypeName';
import { useCreateBulkGRN } from '@/services/inward/grn/services';
import { useGRNByStfId } from '@/services/inward/grn/services';
import { useSTFList } from '@/services/purchase/stf/services';
import { useGetListStockByStfId } from '@/services/purchase/stocks/services';
import { findByPartNumberId } from '@/services/spare/services';
import { useFindByPartNumberBulkId } from '@/services/spare/services';
import { useBinLocationList } from '@/services/submaster/bin-location/services';
import { useRackIndex } from '@/services/submaster/rack/services';
import { useWarehouseList } from '@/services/submaster/warehouse/services';

interface AddedItem {
  condition_id: number;
  control_id: string;
  created_at: string;
  files: {
    file_name: string;
    id: number;
    stock_id: number;
    url: string;
    user_id: number;
  }[];
  grn?: {
    bin_location_id: number;
    created_at: string;
    id: number;
    modified_at: string;
    qty: number;
    rack_id: number;
    remark: string;
    stock_id: number;
    user_id: number;
    warehouse_id: number;
  };
  id: number;
  inspection_user_id: number;
  is_grn: boolean;
  is_quality_check: boolean;
  is_quarantine: boolean;
  llp: string;
  logistic_request_item?: {
    condition_id: number;
    id: number;
    logistic_request_id: number;
    logistic_request_package_id?: number;
    part_number_id: number;
    purchase_order_id?: number;
    qty: number;
  };
  logistic_request_item_id?: number;
  logistic_request_package: {
    description: string;
    height: number;
    id: number;
    is_dg: boolean;
    is_obtained: boolean;
    length: number;
    logistic_request_id: number;
    package_number: string;
    package_type_id: number;
    pcs: number;
    unit_of_measurement_id: number;
    volumetric_weight: number;
    weight: number;
    weight_unit_of_measurement_id: number;
    width: number;
  };
  logistic_request_package_id: number;
  modified_at: string;
  part_number_id: number;
  qty: number;
  quality_checks: {
    id: number;
    inspection_report: any;
    is_approved: boolean;
    is_quarantine: boolean;
    remark: string;
    stock_id: number;
    user_id: number;
  }[];
  remark: string;
  serial_lot_number: string;
  shelf_life: string;
  tag_by: any;
  tag_date: string;
  trace: any;
  type_of_tag_id: number;
  warehouse: string;
  rack: string;
  binLoc: string;
}

interface GRNDataItem {
  stock_id: number;
  warehouse_id: number;
  rack_id: number;
  bin_location_id: number;
  qty: number;
  remark: string;
}

const SEARCH_OPTIONS = [
  { value: 'stf_import', label: 'STF IMPORT' },
  { value: 'po', label: 'PO' },
  { value: 'date_range', label: 'Date range' },
  { value: 'all', label: 'All' },
];

type Rack = {
  id: number;
  name: string;
  is_quarantine: boolean;
  created_at: string;
  modified_at: string;
};

type RackOption = {
  value: string;
  label: string;
};

const GRNCreate = () => {
  const [stfId, setStfId] = useState<number | null>(null);
  const [selectAll, setSelectAll] = useState(false);
  const [itemQuantities, setItemQuantities] = useState<Record<number, number>>(
    {}
  );
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [showStockInfo, setStockInfoModalOpen] = useState(false);
  const [addedItems, setAddedItems] = useState<AddedItem[]>([]);
  const [grnPayload, setGRNPayload] = useState<{ grn_data: GRNDataItem[] }>({
    grn_data: [],
  });
  const [partDetails, setPartDetails] = useState<
    Record<
      number,
      {
        isSerialised: boolean;
        unitOfMeasure: string;
        partNumber: string;
        description: string;
      }
    >
  >({});
  const [availableQuantities, setAvailableQuantities] = useState<
    Record<number, number>
  >({});
  const [disabledItems, setDisabledItems] = useState<number[]>([]);
  const [afterStockItems, setAfterStockItems] = useState<TODO>([]);
  const [isAllDisabled, setIsAllDisabled] = useState(false);
  const [isAddBtnClicked, setIsAddBtnClicked] = useState(false);
  const [popupData, setPopupData] = useState<TODO>({});
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  // const toastInfo = useToastInfo();

  const warehouseList = useWarehouseList();
  const binLocationList = useBinLocationList();
  const stfList = useSTFList();
  const rackIndex = useRackIndex();

  const warehouseOptions = useMemo(
    () => transformToSelectOptions(warehouseList.data),
    [warehouseList.data]
  );
  const binLocationOptions = useMemo(
    () => transformToSelectOptions(binLocationList.data),
    [binLocationList.data]
  );
  const stfListOptions = useMemo(
    () => transformToSelectOptions(stfList.data),
    [stfList.data]
  );

  const handleCloseModal = () => {
    setPopupData({});
    setStockInfoModalOpen(false);
  };

  useEffect(() => {
    if (Object.keys(popupData).length > 0) {
      setStockInfoModalOpen(true);
    }
  }, [popupData]);

  const { quarantineRacks, nonQuarantineRacks } = useMemo(() => {
    const quarantine: RackOption[] = [];
    const nonQuarantine: RackOption[] = [];

    if (rackIndex.data && rackIndex.data.items) {
      (rackIndex.data.items as Rack[]).forEach((rack) => {
        if (rack.is_quarantine) {
          quarantine.push({ value: rack.id.toString(), label: rack.name });
        } else {
          nonQuarantine.push({ value: rack.id.toString(), label: rack.name });
        }
      });
    }

    return { quarantineRacks: quarantine, nonQuarantineRacks: nonQuarantine };
  }, [rackIndex.data]);

  const {
    data: stockByStfData,
    isLoading: stockByStfLoading,
    refetch: stockByStfRefetch,
  } = useGetListStockByStfId(
    { stf_id: stfId ?? undefined },
    {
      enabled: stfId !== null,
    }
  );

  const afterStockGRNList = stockByStfData?.data.filter((item) => item.grns);

  const partNumberFinalIds: number[] =
    Array.isArray(afterStockGRNList) && afterStockGRNList.length > 0
      ? [...new Set(afterStockGRNList.map((item) => item.part_number_id))]
      : [0];
  const partNumderDetails = useFindByPartNumberBulkId(partNumberFinalIds);
  const { data: grnByStfData, refetch: grnByStfRefetch } = useGRNByStfId({
    stf_id: stfId ?? 0,
  });

  const queryClient = useQueryClient();

  const fetchPartDetails = async (partNumberIds: number[]) => {
    try {
      const responses = await Promise.all(
        partNumberIds.map((id) =>
          queryClient.fetchQuery(['findByPartNumberId', id], () =>
            findByPartNumberId(id)
          )
        )
      );

      const newDetails = responses.reduce(
        (acc, response, index) => {
          if (response && response.status && response.spare) {
            acc[partNumberIds[index]] = {
              isSerialised: response.spare.is_serialized,
              unitOfMeasure: response.spare.unit_of_measure?.name || 'N/A',
              description: response.spare.description || 'N/A',
            };
          }
          return acc;
        },
        {} as Record<
          number,
          {
            isSerialised: boolean;
            unitOfMeasure: string;
            description: string;
          }
        >
      );

      setPartDetails((prev) => {
        const updated = { ...prev, ...newDetails };
        return updated;
      });
    } catch (error) {
      console.error('Error fetching part details:', error);
    }
  };

  useEffect(() => {
    if (stockByStfData && stockByStfData.data) {
      const partNumberIds = stockByStfData.data.map(
        (item) => item.part_number_id
      );
      fetchPartDetails(partNumberIds);
    }
    if (grnByStfData && grnByStfData.data) {
      setStockItems();
    }
  }, [stockByStfData]);

  const setStockItems = () => {
    let items: any = grnByStfData?.data;
    items.forEach((item: any) => {
      item.stock_data = stockByStfData?.data.find(
        (obj) => obj.id === item.stock_id
      );
    });
    setAfterStockItems(items);
  };

  const viewStockInfo = (item: any, isExist: boolean) => {
    const popupProps: any = item;
    popupProps.isExist = isExist;
    if(!isExist){
      popupProps.warehouse_id = fields[`warehouse_${item.id}`]?.value;
      popupProps.rack_id = fields[`rack_${item.id}`]?.value;
      popupProps.bin_location_id = fields[`bin_loc_${item.id}`]?.value;
    }
    popupProps.remarks = fields[`remark_${item.id}`]?.value;
    popupProps.qty = itemQuantities[item.id] || 0;
    popupProps.quarantineRacks = quarantineRacks;
    popupProps.nonQuarantineRacks = nonQuarantineRacks;
    popupProps.warehouseOptions = warehouseOptions;
    popupProps.binLocationOptions = binLocationOptions;
    setPopupData(popupProps);
  };

  useEffect(() => {
    if (stockByStfData && stockByStfData.data) {
      const newAvailableQuantities = stockByStfData.data.reduce(
        (acc, item) => {
          const grnQty = (item.grns || []).reduce(
            (sum, grnItem) => sum + (grnItem?.qty || 0),
            0
          );
          const availableQty = Math.max(item.qty - grnQty, 0);
          acc[item.id] = availableQty;
          return acc;
        },
        {} as Record<number, number>
      );
      setAvailableQuantities(newAvailableQuantities);

      const newDisabledItems = stockByStfData.data
        .filter(
          (item) =>
            item.qty ===
            (item.grns || []).reduce(
              (sum, grnItem) => sum + (grnItem?.qty || 0),
              0
            )
        )
        .map((item) => item.id);
      setDisabledItems(newDisabledItems);

      // Check if all items are disabled
      setIsAllDisabled(newDisabledItems.length === stockByStfData.data.length);
    }
  }, [stockByStfData]);

  useEffect(() => {
    if (stockByStfData && stockByStfData.data) {
      if (selectAll) {
        setSelectedItems(stockByStfData.data.map((item) => item.id));
      } else {
        setSelectedItems([]);
      }
    }
  }, [selectAll, stockByStfData]);

  const handleSelectAllChange = (checked: boolean) => {
    if (isAllDisabled) return;
    setSelectAll(checked);
    setSelectedItems([]);
    console.log(disabledItems);
    if (checked) {
      const allSelectableItems =
        stockByStfData?.data
          ?.filter((item) => !disabledItems.includes(item.id))
          .map((item) => item.id) || [];
      setSelectedItems(allSelectableItems);
    }
  };

  const handleItemCheckboxChange = (itemId: number) => {
    if (disabledItems.includes(itemId)) return;

    setSelectedItems((prevSelected) => {
      const newSelected = prevSelected.includes(itemId)
        ? prevSelected.filter((id) => id !== itemId)
        : [...prevSelected, itemId];

      if (stockByStfData && stockByStfData.data) {
        const selectableItemsCount = stockByStfData.data.filter(
          (item) => !disabledItems.includes(item.id)
        ).length;
        setSelectAll(newSelected.length === selectableItemsCount);
      }
      return newSelected;
    });
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    const maxQuantity = availableQuantities[itemId] || 0;
    const validQuantity = Math.min(Math.max(newQuantity, 0), maxQuantity);
    setItemQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: validQuantity,
    }));
  };

  const form = useForm({
    onValidSubmit: async (values) => {
      console.log('Values:', values);
    },
  });

  const fields = useFormFields({
    connect: form,
  });

  const createBulkGRN = useCreateBulkGRN({
    onSuccess: () => {
      toastSuccess({
        title: `GRN created successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      stockByStfRefetch();
      grnByStfRefetch();
      setIsAddBtnClicked(false);
    },
    onError: (error) => {
      toastError({
        title: 'Error creating GRN',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    },
  });

  const handleAddItems = () => {
    setIsAddBtnClicked(true);
    let isValid: boolean = true;
    const itemsToAdd = stockByStfData?.data
      .filter((item) => selectedItems.includes(item.id))
      .map((item) => ({
        ...item,
        qty: itemQuantities[item.id] || item.qty,
        warehouse: fields[`warehouse_${item.id}`].value as string,
        rack: fields[`rack_${item.id}`].value as string,
        binLoc: fields[`bin_loc_${item.id}`].value as string,
        remark: fields[`remark_${item.id}`].value as string,
      }));

    console.log(itemsToAdd);
    let newItems: any = [];

    itemsToAdd?.forEach((item: any) => {
      console.log(item);
      console.log(disabledItems);
      if (!disabledItems.includes(item.id)) {
        if (
          item.qty === '' ||
          item.qty === null ||
          !fields[`rack_${item.id}`].value ||
          !fields[`warehouse_${item.id}`].value ||
          !fields[`bin_loc_${item.id}`].value
        ) {
          isValid = false;
        }
        newItems.push(item);
      }
    });
    if (isValid) {
      setAddedItems((prevAdded) => [
        ...prevAdded,
        ...((newItems as AddedItem[]) || []),
      ]);
      const newGRNData: GRNDataItem[] =
        newItems?.map((item: any) => ({
          stock_id: item.id,
          warehouse_id: parseInt(item.warehouse),
          rack_id: parseInt(item.rack),
          bin_location_id: parseInt(item.binLoc),
          qty: item.qty,
          remark: item.remark || '',
        })) ?? [];

      setGRNPayload((prevPayload) => ({
        grn_data: [...prevPayload.grn_data, ...newGRNData],
      }));

      console.log('Updated GRN Payload:', {
        grn_data: [...grnPayload.grn_data, ...newGRNData],
      });

      createBulkGRN.mutate({ grn_data: newGRNData });
      setSelectedItems([]);
      setItemQuantities({});
      handleSelectAllChange(false);
    } else {
      toastError({
        title: 'Oops!!',
        description: 'Some required values are missing. Please check...',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }

    // Create the GRN payload

    // toastInfo({
    //   title: 'Items added successfully',
    //   status: 'success',
    //   duration: 3000,
    //   isClosable: true,
    // });
  };

  const handleFileDownload = (url: string, fileName: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Breadcrumb
              fontWeight="medium"
              fontSize="sm"
              separator={<ChevronRightIcon boxSize={6} color="gray.500" />}
            >
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink as={Link} to={'/inward/grn'}>
                  GRN
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>GRN Create</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              GRN
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
            GRN Create
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
                <FieldSelect
                  name={'slect_type'}
                  required={'Slect Type is required'}
                  placeholder="Slect Type"
                  options={SEARCH_OPTIONS}
                  w={{ base: 'full', md: '20%' }}
                  size={'sm'}
                />
                {/* <FieldInput
                  name="ref_no"
                  placeholder="Ref No"
                  type="text"
                  required="Ref No is required"
                  w={{ base: 'full', md: '20%' }}
                  onValueChange={(value) => {
                    setStfIdDebounced(Number(value));
                    setStfId(Number(value));
                  }}
                /> */}
                <FieldSelect
                  name="stf_id"
                  placeholder="STF No"
                  options={stfListOptions}
                  w={{ base: 'full', md: '20%' }}
                  onValueChange={(value) => {
                    setStfId(Number(value));
                  }}
                  size={'sm'}
                />
              </Stack>

              <STFInfoComponent stfId={stfId} />
              {stockByStfLoading ? (
                <Flex justify="center" align="center" height="200px">
                  <Spinner size="xl" color="brand.500" />
                </Flex>
              ) : stockByStfData && stockByStfData.data.length > 0 ? (
                <>
                  <Flex justifyContent="flex-end" my={2}>
                    <Button
                      colorScheme="green"
                      onClick={handleAddItems}
                      isDisabled={selectedItems.length === 0}
                    >
                      Add Selected Items
                    </Button>
                  </Flex>
                  <TableContainer
                    boxShadow={'md'}
                    borderWidth={1}
                    borderColor={'gray.200'}
                    overflow={'auto'}
                  >
                    <Table variant={'unstyled'} size={'sm'}>
                      <Thead bg={'gray'}>
                        <Tr>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            <Checkbox
                              isChecked={selectAll}
                              onChange={(e) =>
                                handleSelectAllChange(e.target.checked)
                              }
                              isDisabled={isAllDisabled}
                            />
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            S.No
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Ctrl ID
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Rec CN
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            S/N
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Qty
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            UOM
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            QT Status
                          </Th>
                          {/* <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Insp Remarks
                          </Th> */}
                          {/* <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            PKG Info
                          </Th> */}
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Tag Type
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Tag Date
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Tag By
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Trace
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            LLP
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Shelf Life
                          </Th>
                          {/* <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Files
                          </Th> */}
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            WH
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            RACK
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            BIN LOC
                          </Th>
                          <Th
                            bg={'blue.300'}
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Remark
                          </Th>
                          <Th
                            color={'white'}
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Action
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {stockByStfData?.data?.map((item, index) => {
                          const { isSerialised, unitOfMeasure } =
                            partDetails[item.part_number_id] || {};

                          const availableQty =
                            availableQuantities[item.id] || 0;
                          const isQuantityDisabled = availableQty === 0;
                          const isDisabled = disabledItems.includes(item.id);

                          const ConditionName = () => {
                            const conditionName = useConditionName(
                              item.condition_id
                            );
                            return <>{conditionName}</>;
                          };

                          const TagTypeName = () => {
                            const tagTypeName = useTagTypeName(
                              item.type_of_tag_id
                            );
                            return <>{tagTypeName}</>;
                          };

                          return (
                            <Tr key={index}>
                              <Td borderWidth="1px" borderColor="black">
                                <Checkbox
                                  isChecked={
                                    selectedItems.includes(Number(item.id)) &&
                                    !disabledItems.includes(Number(item.id))
                                  }
                                  onChange={() =>
                                    handleItemCheckboxChange(item.id)
                                  }
                                  isDisabled={isDisabled}
                                />
                              </Td>
                              <Td
                                bg={'red.100'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                {index + 1}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {item.control_id}
                              </Td>
                              <Td
                                bg={'red.100'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                <ConditionName />
                              </Td>
                              <Td
                                bg={'red.100'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                {item.serial_lot_number}
                              </Td>
                              <Td
                                bg={'red.100'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                {isSerialised ? (
                                  item.qty
                                ) : (
                                  <Input
                                    type="number"
                                    value={itemQuantities[item.id] || 0}
                                    min={0}
                                    max={availableQty}
                                    size="sm"
                                    width="60px"
                                    onChange={(e) =>
                                      handleQuantityChange(
                                        item.id,
                                        parseInt(e.target.value) || 0
                                      )
                                    }
                                    isDisabled={isQuantityDisabled}
                                  />
                                )}
                              </Td>
                              <Td
                                bg={'red.100'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                {unitOfMeasure}
                              </Td>
                              <Td
                                bg={'red.100'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                {item.is_quarantine
                                  ? 'Quarantine'
                                  : 'Not Quarantine'}
                              </Td>
                              {/* <Td
                                bg={'red.100'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                <Text
                                  dangerouslySetInnerHTML={{
                                    __html: item.remark ? item.remark : ' - ',
                                  }}
                                ></Text>
                              </Td> */}
                              {/* <Td
                                bg={'green.500'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                {item.logistic_request_package.package_number}
                              </Td> */}
                              <Td borderWidth="1px" borderColor="black">
                                <TagTypeName />
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {dayjs(item.tag_date).format('DD-MM-YYYY')}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {item.tag_by}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {item.trace}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {item.llp}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {dayjs(item.shelf_life).format('DD-MM-YYYY')}
                              </Td>
                              {/* <Td borderWidth="1px" borderColor="black">
                                {item.files && item.files.length > 0 ? (
                                  <Menu>
                                    <MenuButton
                                      as={Button}
                                      rightIcon={<ChevronDownIcon />}
                                      size="sm"
                                      bg={'orange.300'}
                                      color={'black'}
                                      borderWidth="1px"
                                      borderColor="black"
                                      _hover={{
                                        bg: 'orange.400',
                                        color: 'white',
                                      }}
                                      _active={{
                                        bg: 'orange.400',
                                        color: 'white',
                                      }}
                                    >
                                      <HStack spacing={2}>
                                        <Icon as={FaFile} />
                                        <Text>View Files</Text>
                                      </HStack>
                                    </MenuButton>
                                    <MenuList>
                                      {item.files.map((file, fileIndex) => (
                                        <MenuItem
                                          key={fileIndex}
                                          onClick={() =>
                                            handleFileDownload(
                                              file.url,
                                              file.file_name
                                            )
                                          }
                                        >
                                          {file.file_name}
                                        </MenuItem>
                                      ))}
                                    </MenuList>
                                  </Menu>
                                ) : (
                                  'No files'
                                )}
                              </Td> */}
                              <Td
                                bg={'pink.100'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                <Box width="150px">
                                  <FieldSelect
                                    name={`warehouse_${item.id}`}
                                    placeholder="Select Warehouse"
                                    options={warehouseOptions}
                                    required={
                                      !disabledItems.includes(item.id) &&
                                      isAddBtnClicked
                                        ? 'Warehouse is required'
                                        : ''
                                    }
                                    menuPortalTarget={document.body}
                                    size={'sm'}
                                    isClearable={false}
                                    isDisabled={disabledItems.includes(item.id)}
                                  />
                                </Box>
                              </Td>
                              <Td
                                bg={'pink.100'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                <Box width="150px">
                                  {item.is_quarantine ? (
                                    <FieldSelect
                                      name={`rack_${item.id}`}
                                      placeholder="Select Rack"
                                      options={quarantineRacks}
                                      required={
                                        !disabledItems.includes(item.id) &&
                                        isAddBtnClicked
                                          ? 'Rack is required'
                                          : ''
                                      }
                                      menuPortalTarget={document.body}
                                      size={'sm'}
                                      isDisabled={disabledItems.includes(
                                        item.id
                                      )}
                                    />
                                  ) : (
                                    <FieldSelect
                                      name={`rack_${item.id}`}
                                      placeholder="Select Rack"
                                      options={nonQuarantineRacks}
                                      required={
                                        !disabledItems.includes(item.id) &&
                                        isAddBtnClicked
                                          ? 'Rack is required'
                                          : ''
                                      }
                                      menuPortalTarget={document.body}
                                      size={'sm'}
                                      isDisabled={disabledItems.includes(
                                        item.id
                                      )}
                                    />
                                  )}
                                </Box>
                              </Td>
                              <Td
                                bg={'pink.100'}
                                borderWidth="1px"
                                borderColor="black"
                              >
                                <Box width="150px">
                                  <FieldSelect
                                    name={`bin_loc_${item.id}`}
                                    placeholder="Select Bin Location"
                                    options={binLocationOptions}
                                    required={
                                      !disabledItems.includes(item.id) &&
                                      isAddBtnClicked
                                        ? 'Bin Location is required'
                                        : ''
                                    }
                                    menuPortalTarget={document.body}
                                    size={'sm'}
                                    isDisabled={disabledItems.includes(item.id)}
                                  />
                                </Box>
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                <Box width="150px">
                                  <FieldInput
                                    name={`remark_${item.id}`}
                                    placeholder="Enter remark"
                                    size="sm"
                                    isDisabled={disabledItems.includes(item.id)}
                                  />
                                </Box>
                              </Td>
                              <Td
                                borderWidth="1px"
                                borderColor="black"
                                textAlign="center"
                                verticalAlign="middle"
                              >
                                <IconButton
                                  aria-label="Edit"
                                  icon={<LuEye />}
                                  size="sm"
                                  variant="solid"
                                  colorScheme="blue"
                                  onClick={() => viewStockInfo(item, false)}
                                />
                              </Td>
                            </Tr>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Text
                  textAlign="center"
                  fontSize="lg"
                  mt={4}
                  sx={{ display: stfId !== null ? 'block' : 'none' }}
                >
                  No stock data available for this STF.
                </Text>
              )}
            </Stack>

            {!isAddBtnClicked && addedItems.length > 0 && (
              <>
                <Text fontSize={'md'} fontWeight={'700'} mt={4}>
                  Added Items
                </Text>
                <TableContainer
                  boxShadow={'md'}
                  borderWidth={1}
                  borderColor={'gray.200'}
                  overflow={'auto'}
                >
                  <Table variant={'unstyled'} size={'sm'}>
                    <Thead bg={'gray'}>
                      <Tr>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          S.No
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Ctrl ID
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Received CN
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Serial Number
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Qty
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          UOM
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Quarantine Status
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Inspection Remarks
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Package Info
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Type Of Tag
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Tag Date
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Tag By
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Trace
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          LLP
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Shelf Life
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Files
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          WH
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          RACK
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          BIN LOC
                        </Th>
                        <Th
                          color={'white'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          Remark
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {addedItems.map((item, index) => {
                        const { unitOfMeasure } =
                          partDetails[item.part_number_id] || {};

                        const ConditionName = () => {
                          const conditionName = useConditionName(
                            item.condition_id
                          );
                          return <>{conditionName}</>;
                        };

                        const TagTypeName = () => {
                          const tagTypeName = useTagTypeName(
                            item.type_of_tag_id
                          );
                          return <>{tagTypeName}</>;
                        };

                        return (
                          <Tr key={index}>
                            <Td
                              bg={'red.100'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              {index + 1}
                            </Td>
                            <Td borderWidth="1px" borderColor="black">
                              {item.control_id}
                            </Td>
                            <Td
                              bg={'red.100'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              <ConditionName />
                            </Td>
                            <Td
                              bg={'red.100'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              {item.serial_lot_number}
                            </Td>
                            <Td
                              bg={'red.100'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              {item.qty}
                            </Td>
                            <Td
                              bg={'red.100'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              {unitOfMeasure}
                            </Td>
                            <Td
                              bg={'red.100'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              {item.is_quarantine
                                ? 'Quarantine'
                                : 'Not Quarantine'}
                            </Td>
                            <Td
                              bg={'red.100'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              <Text
                                dangerouslySetInnerHTML={{
                                  __html: item.remark ? item.remark : ' - ',
                                }}
                              ></Text>
                            </Td>
                            <Td
                              bg={'green.500'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              {item.logistic_request_package.package_number}
                            </Td>
                            <Td borderWidth="1px" borderColor="black">
                              <TagTypeName />
                            </Td>
                            <Td borderWidth="1px" borderColor="black">
                              {dayjs(item.tag_date).format('DD-MM-YYYY')}
                            </Td>
                            <Td borderWidth="1px" borderColor="black">
                              {item.tag_by}
                            </Td>
                            <Td borderWidth="1px" borderColor="black">
                              {item.trace}
                            </Td>
                            <Td borderWidth="1px" borderColor="black">
                              {item.llp}
                            </Td>
                            <Td borderWidth="1px" borderColor="black">
                              {dayjs(item.shelf_life).format('DD-MM-YYYY')}
                            </Td>
                            <Td borderWidth="1px" borderColor="black">
                              {item.files && item.files.length > 0 ? (
                                <Menu>
                                  <MenuButton
                                    as={Button}
                                    rightIcon={<ChevronDownIcon />}
                                    size="sm"
                                    bg={'orange.300'}
                                    color={'black'}
                                    borderWidth="1px"
                                    borderColor="black"
                                    _hover={{
                                      bg: 'orange.400',
                                      color: 'white',
                                    }}
                                    _active={{
                                      bg: 'orange.400',
                                      color: 'white',
                                    }}
                                  >
                                    <HStack spacing={2}>
                                      <Icon as={FaFile} />
                                      <Text>View Files</Text>
                                    </HStack>
                                  </MenuButton>
                                  <MenuList>
                                    {item.files.map((file, fileIndex) => (
                                      <MenuItem
                                        key={fileIndex}
                                        onClick={() =>
                                          handleFileDownload(
                                            file.url,
                                            file.file_name
                                          )
                                        }
                                      >
                                        {file.file_name}
                                      </MenuItem>
                                    ))}
                                  </MenuList>
                                </Menu>
                              ) : (
                                'No files'
                              )}
                            </Td>
                            <Td
                              bg={'pink.100'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              {
                                warehouseOptions.find(
                                  (option) => option.value === item.warehouse
                                )?.label
                              }
                            </Td>
                            <Td
                              bg={'pink.100'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              {
                                rackIndex.data?.items.find(
                                  (rack) => rack.id === parseInt(item.rack)
                                )?.name
                              }
                            </Td>
                            <Td
                              bg={'pink.100'}
                              borderWidth="1px"
                              borderColor="black"
                            >
                              {
                                binLocationOptions.find(
                                  (option) => option.value === item.binLoc
                                )?.label
                              }
                            </Td>
                            <Td borderWidth="1px" borderColor="black">
                              <Text
                                dangerouslySetInnerHTML={{
                                  __html: item.remark ? item.remark : ' - ',
                                }}
                              ></Text>
                            </Td>
                          </Tr>
                        );
                      })}
                    </Tbody>
                  </Table>
                </TableContainer>
              </>
            )}

            <HStack align="center" mt={8} mb={2}>
              <Text fontSize={'md'} fontWeight={'700'}>
                After Stock Entered-GRN List
              </Text>
              <FieldInput
                name="search"
                placeholder="Search GRN list..."
                type="text"
                size={'sm'}
                w={{ base: 'full', md: '20%' }}
                leftElement={<SearchIcon color="gray.300" />}
              />
            </HStack>
            <TableContainer
              boxShadow={'md'}
              borderWidth={1}
              borderColor={'gray.200'}
              overflow={'auto'}
              mt={2}
              mb={4}
            >
              <Table variant={'unstyled'} size={'sm'}>
                <Thead bg={'gray'}>
                  <Tr>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      S.No
                    </Th>
                    {/* <Th color={'white'} borderWidth="1px" borderColor="black">
                      GRN NO
                    </Th> */}
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      STF NO
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      PO NO
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Control id
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Part Number
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Description
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Condition
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Serial Number
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Qty
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      UOM
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Quarantine Status
                    </Th>
                    {/* <Th color={'white'} borderWidth="1px" borderColor="black">
                      Inspection Remarks
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Package Info
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Package no
                    </Th> */}
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Type Of Tag
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Tag Date
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Tag By
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Trace
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      LLP
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Shelf Life
                    </Th>
                    {/* <Th color={'white'} borderWidth="1px" borderColor="black">
                      Files
                    </Th> */}
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      WH
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      RACK
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      BIN LOC
                    </Th>
                    <Th
                      color={'white'}
                      bg={'blue.300'}
                      borderWidth="1px"
                      borderColor="black"
                    >
                      Remark
                    </Th>
                    <Th color={'white'} borderWidth="1px" borderColor="black">
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {afterStockItems?.map((item: TODO, index: number) => {
                    const { unitOfMeasure, description } =
                      partDetails[item?.stock_data?.part_number_id] || {};

                    const ConditionName = () => {
                      const conditionName = useConditionName(
                        item?.stock_data?.condition_id
                      );
                      return <>{conditionName}</>;
                    };

                    const TagTypeName = () => {
                      const tagTypeName = useTagTypeName(
                        item?.stock_data?.type_of_tag_id
                      );
                      return <>{tagTypeName}</>;
                    };

                    return (
                      <Tr key={index}>
                        <Td
                          bg={'red.100'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          {index + 1}
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          {getPropertyList(
                            item?.stock_data?.grns
                              ? item?.stock_data?.grns
                              : [],
                            'id'
                          )}
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          {stfId}
                        </Td>
                        {/* <Td borderWidth="1px" borderColor="black">
                          {
                            item?.stock_data?.logistic_request_item
                              ?.purchase_order_id
                          }
                        </Td> */}
                        <Td borderWidth="1px" borderColor="black">
                          {item?.stock_data?.control_id}
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          {getPartNumberById(item?.stock_data?.part_number_id)}
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          {description}
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          <ConditionName />
                        </Td>
                        <Td
                          bg={'red.100'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          {item?.stock_data?.serial_lot_number}
                        </Td>
                        <Td
                          bg={'red.100'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          {item?.stock_data?.qty}
                        </Td>
                        <Td
                          bg={'red.100'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          {unitOfMeasure}
                        </Td>
                        <Td
                          bg={'red.100'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          {item?.stock_data?.is_quarantine
                            ? 'Quarantine'
                            : 'Not Quarantine'}
                        </Td>
                        {/* <Td
                          bg={'red.100'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          <Text
                            dangerouslySetInnerHTML={{
                              __html: item?.stock_data?.remark
                                ? item?.stock_data?.remark
                                : ' - ',
                            }}
                          ></Text>
                        </Td>
                        <Td
                          bg={'green.500'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          {
                            item?.stock_data?.logistic_request_package
                              .package_number
                          }
                        </Td>
                        <Td
                          bg={'red.100'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          {
                            item?.stock_data?.logistic_request_package
                              .package_number
                          }
                        </Td> */}
                        <Td borderWidth="1px" borderColor="black">
                          <TagTypeName />
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          {dayjs(item?.stock_data?.tag_date).format(
                            'DD-MM-YYYY'
                          )}
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          {item?.stock_data?.tag_by}
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          {item?.stock_data?.trace}
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          {item?.stock_data?.llp}
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          {dayjs(item?.stock_data?.shelf_life).format(
                            'DD-MM-YYYY'
                          )}
                        </Td>
                        {/* <Td borderWidth="1px" borderColor="black">
                          {item?.stock_data?.files &&
                          item?.stock_data?.files.length > 0 ? (
                            <Menu>
                              <MenuButton
                                as={Button}
                                rightIcon={<ChevronDownIcon />}
                                size="sm"
                                bg={'orange.300'}
                                color={'black'}
                                borderWidth="1px"
                                borderColor="black"
                                _hover={{
                                  bg: 'orange.400',
                                  color: 'white',
                                }}
                                _active={{
                                  bg: 'orange.400',
                                  color: 'white',
                                }}
                              >
                                <HStack spacing={2}>
                                  <Icon as={FaFile} />
                                  <Text>View Files</Text>
                                </HStack>
                              </MenuButton>
                              <MenuList>
                                {item?.stock_data?.files.map(
                                  (file: any, fileIndex: number) => (
                                    <MenuItem
                                      key={fileIndex}
                                      onClick={() =>
                                        handleFileDownload(
                                          file.url,
                                          file.file_name
                                        )
                                      }
                                    >
                                      {file.file_name}
                                    </MenuItem>
                                  )
                                )}
                              </MenuList>
                            </Menu>
                          ) : (
                            'No files'
                          )}
                        </Td> */}
                        <Td
                          bg={'pink.100'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          {
                            warehouseOptions.find(
                              (option) =>
                                option.value === item.warehouse_id?.toString()
                            )?.label
                          }
                        </Td>
                        <Td
                          bg={'pink.100'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          {
                            rackIndex.data?.items.find(
                              (rack) => rack.id === Number(item?.rack_id)
                            )?.name
                          }
                        </Td>
                        <Td
                          bg={'pink.100'}
                          borderWidth="1px"
                          borderColor="black"
                        >
                          {
                            binLocationOptions.find(
                              (option) =>
                                option.value ===
                                item?.bin_location_id?.toString()
                            )?.label
                          }
                        </Td>
                        <Td borderWidth="1px" borderColor="black">
                          <Text
                            dangerouslySetInnerHTML={{
                              __html: item.remark ? item.remark : ' - ',
                            }}
                          ></Text>
                          </Td>
                        <Td
                          borderWidth="1px"
                          borderColor="black"
                          textAlign="center"
                          verticalAlign="middle"
                        >
                          <IconButton
                            aria-label="Edit"
                            icon={<LuEye />}
                            size="sm"
                            variant="solid"
                            colorScheme="blue"
                            onClick={() => viewStockInfo(item, true)}
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                  {afterStockItems.length === 0 && (
                    <Tr>
                      <Td colSpan={15} textAlign="center">
                        No data available
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </TableContainer>

            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify={'center'}
              mt={4}
            >
              <Button colorScheme="green" isDisabled={!isAllDisabled}>
                Complete
              </Button>
              <Button colorScheme="red" onClick={() => navigate(-1)}>
                Back
              </Button>
            </Stack>
          </Formiz>
        </Stack>
        <GRNStockInfo
          isOpen={showStockInfo}
          onClose={() => {
            handleCloseModal();
          }}
          data={popupData}
        />
      </Stack>
    </SlideIn>
  );
};

export default GRNCreate;
