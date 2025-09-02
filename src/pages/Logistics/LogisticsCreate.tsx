import { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Checkbox,
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
  Tr,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiEye, HiOutlinePlus } from 'react-icons/hi';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import FieldDisplay from '@/components/FieldDisplay';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import {
  usePurchaseOrderDetails,
  usePurchaseOrderList,
} from '@/services/purchase/purchase-orders/services';
import {
  useFindByPartNumberId,
  usePartNumberDetails,
} from '@/services/spare/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useHscCodeDetails } from '@/services/submaster/hsc-code/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useUNDetails } from '@/services/submaster/un/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

import PartDescription from '../Purchase/Quotation/PartDescription';
import PartDetails from '../Purchase/Quotation/PartDetails';
import { transformToSelectOptions } from '@/helpers/commonHelper';

type QueryData = {
  status: boolean;
  items?: Record<string, string | number>;
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
  lr_qty: number;
  unique_id: string;
}

interface PackageDetail {
  type: string;
  number: string;
}

interface PackageDetails {
  [key: number]: PackageDetail; // Using number as index signature
}

interface PackageItem {
  rowId: number;
  packageType: string;
  packageNumber: string;
  status: 'obtained' | 'not_obtained';
}

interface PartDetail {
  partNumber: number;
  condition: string;
  quantity: number;
  goodsType: string;
  unNumber: string;
  class: string;
  msds: string;
  hscCode: string;
}

// Assuming you have some way to uniquely identify each tab
interface TabDetails {
  [tabKey: number]: PartDetail[];
}

const LogisticsCreate = () => {
  const [tabPartDetails, setTabPartDetails] = useState<TabDetails>({});
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [packageDetails, setPackageDetails] = useState<PackageDetails>({});
  const [obtainedItems, setObtainedItems] = useState<PackageItem[]>([]);
  const [poId, setPoId] = useState<number | null>(null);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedPoItems, setSelectedPoItems] = useState<SelectedPOItem[]>([]);
  const [lrQuantities, setLrQuantities] = useState<{ [key: number]: number }>(
    {}
  );
  const [receivedQuantities, setReceivedQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [validationErrors, setValidationErrors] = useState<{
    [key: number]: string;
  }>({});
  const [cumulativeAddedQuantities, setCumulativeAddedQuantities] = useState<{
    [key: number]: number;
  }>({});

  const [rows, setRows] = useState([{ id: 1 }]);
  const rowIdCounter = useRef(1);
  const navigate = useNavigate();

  const setPoIdDebounced = useRef(
    debounce((value: number) => {
      setPoId(value), 500;
    })
  ).current;

  const [partNumber, setPartNumber] = useState<number>(0);

  const setPartNumberDebounced = useRef(
    debounce((value: number) => {
      setPartNumber(value), 500;
    })
  ).current;

  const addNewRow = () => {
    rowIdCounter.current += 1;
    const newRow = { id: rowIdCounter.current };
    setRows([...rows, newRow]);
  };

  const deleteRow = (rowId: number) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const poList = usePurchaseOrderList();
  const poOptions = transformToSelectOptions(poList.data);
  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const shipTypeList = useShipTypesList();
  const shipTypeOptions = transformToSelectOptions(shipTypeList.data);
  const packageTypeList = usePackageTypeList();
  const packageTypeOptions = transformToSelectOptions(packageTypeList.data);
  const uomList = useUnitOfMeasureList();
  const uomOptions = transformToSelectOptions(uomList.data);
  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  //const conditionOptions = transformToSelectOptions(conditionList.data);

  const { data: poDetails } = usePurchaseOrderDetails(poId ? poId : '');

  const poItems = poDetails?.data.items;

  const handleSelectAllChange = (checked: boolean) => {
    setSelectAllChecked(checked);
    if (checked && poItems) {
      // Select all item IDs
      setSelectedItems(poItems.map((item) => item.id));
    } else {
      // Clear selection
      setSelectedItems([]);
    }
  };

  const handleItemCheckboxChange = (itemId: number) => {
    setSelectedItems((prevItems) => {
      if (prevItems.includes(itemId)) {
        // If the item is already selected, remove it
        const filteredItems = prevItems.filter((id) => id !== itemId);
        setSelectAllChecked(false); // Uncheck "Select All" if any item is manually unchecked
        return filteredItems;
      } else {
        // If the item is not selected, add it
        const newItems = [...prevItems, itemId];
        poItems && setSelectAllChecked(newItems.length === poItems.length); // Check "Select All" if all items are selected
        return newItems;
      }
    });
  };

  const canAddSelectedItems = useMemo(() => {
    // Check if there are any selected items
    const hasSelectedItems = selectedItems.length > 0;

    // Check if all selected items have a corresponding non-zero LR quantity
    const allHaveQuantities = selectedItems.every(
      (itemId) => lrQuantities[itemId] && lrQuantities[itemId] > 0
    );

    return hasSelectedItems && allHaveQuantities;
  }, [selectedItems, lrQuantities]);

  const handleLrQtyChange = (itemId: number, lrQty: string) => {
    const parsedQty = parseInt(lrQty, 10);
    const item = poItems?.find((item) => item.id === itemId);

    if (!item) return;

    if (
      isNaN(parsedQty) ||
      parsedQty > item.qty - (cumulativeAddedQuantities[itemId] || 0)
    ) {
      const errorMsg = isNaN(parsedQty)
        ? 'LR Qty must be a valid number'
        : 'LR Qty cannot be more than available quantity';

      setValidationErrors((prevErrors) => ({
        ...prevErrors,
        [itemId]: errorMsg,
      }));
      return;
    }

    setValidationErrors((prevErrors) => ({
      ...prevErrors,
      [itemId]: '',
    }));

    setLrQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: parsedQty,
    }));

    const receivedQty =
      item.qty - (cumulativeAddedQuantities[itemId] || 0) - parsedQty;
    setReceivedQuantities((prevQuantities) => ({
      ...prevQuantities,
      [itemId]: receivedQty,
    }));
  };

  const addToSelectedPoItems = () => {
    const timestamp = new Date().getTime();
    const items =
      poItems?.filter((item) => selectedItems.includes(item.id)) ?? [];

    const itemsWithQty = items.map((item, index) => ({
      ...item,
      lr_qty: lrQuantities[item.id] || 0,
      unique_id: `${item.id}_${timestamp}_${index}`,
    }));

    setSelectedPoItems((prev) => [...prev, ...itemsWithQty]);
    setSelectedItems([]);
    setSelectAllChecked(false);

    itemsWithQty.forEach((item) => {
      const existingQty = cumulativeAddedQuantities[item.id] || 0;
      setCumulativeAddedQuantities((prev) => ({
        ...prev,
        [item.id]: existingQty + item.lr_qty,
      }));

      // Update receivedQuantities
      setReceivedQuantities((prev) => ({
        ...prev,
        [item.id]: item.qty - (existingQty + item.lr_qty),
      }));
    });

    setLrQuantities({});
  };

  const handleDeleteSelectedItem = (uniqueId: string) => {
    const itemToRemove = selectedPoItems.find(
      (item) => item.unique_id === uniqueId
    );
    const newSelectedPoItems = selectedPoItems.filter(
      (item) => item.unique_id !== uniqueId
    );
    setSelectedPoItems(newSelectedPoItems);

    if (itemToRemove) {
      setCumulativeAddedQuantities((prevQuantities) => ({
        ...prevQuantities,
        [itemToRemove.id]:
          (prevQuantities[itemToRemove.id] || 0) - itemToRemove.lr_qty,
      }));

      setReceivedQuantities((prevQuantities) => ({
        ...prevQuantities,
        [itemToRemove.id]:
          itemToRemove.qty -
          ((cumulativeAddedQuantities[itemToRemove.id] || 0) -
            itemToRemove.lr_qty),
      }));
    }
  };

  const updatePackageDetails = (rowId: number, selectedType: string) => {
    const packageTypeLabel = packageTypeList.data?.items[Number(selectedType)];
    if (!packageTypeLabel) return;
    const prefix =
      packageTypeLabel
        .match(/\b(\w)/g)
        ?.join('')
        .toUpperCase() || 'Unknown'; // Assuming type is "Box" or "Text Edit" etc.

    const packageNo = `${prefix}${rowId}`;
    setPackageDetails((prevDetails) => ({
      ...prevDetails,
      [rowId]: { type: selectedType, number: packageNo },
    }));
  };

  const handleStatusChange = (
    rowId: number,
    status: 'obtained' | 'not_obtained'
  ) => {
    // Update the status in rowDetails state
    // setRowDetails((prev) => ({
    //   ...prev,
    //   [rowId]: status,
    // }));

    // Conditionally add or remove items from the obtainedItems array
    setObtainedItems((prev) => {
      const currentDetails = packageDetails[rowId];
      if (!currentDetails) return prev; // Guard against undefined package details

      if (status === 'obtained') {
        // Add to obtainedItems if not already included
        if (!prev.some((item) => item.rowId === rowId)) {
          return [
            ...prev,
            {
              rowId,
              packageType: currentDetails.type,
              packageNumber: currentDetails.number,
              status,
            },
          ];
        }
      } else {
        // Remove from obtainedItems if it was previously added
        return prev.filter((item) => item.rowId !== rowId);
      }
      return prev;
    });
  };

  const partNumberList = selectedPoItems.map((item) => item.part_number_id);
  const partDetailsResults = usePartNumberDetails(partNumberList);

  const partNumberOption = partNumberList.map((item) => {
    return {
      value: item,
      label:
        (!partDetailsResults.isLoading &&
          partDetailsResults.data.find(
            (partDetail) => partDetail?.part_number?.id === item
          )?.part_number.part_number) ||
        'Loading',
    };
  });

  const { data: partNumberDetails } = useFindByPartNumberId(partNumber);

  const [unId, setUNId] = useState<number | null>(null);
  const [hscId, setHSCId] = useState<number | null>(null);
  const { data: UNDetails } = useUNDetails(unId ? unId : '', {
    enabled: unId !== null && unId !== 0,
  });
  const { data: HSCCodeDetails } = useHscCodeDetails(hscId ? hscId : '', {
    enabled: hscId !== null && hscId !== 0,
  });
  
  useEffect(() => {
    if (partNumberDetails) {
      setUNId(partNumberDetails?.part_number?.un_id);
      setHSCId(partNumberDetails?.part_number?.hsc_code_id);
    }
  }, [partNumberDetails]);

  const handleAddPartDetails = (tabKey: number) => {
    // Assuming you have a way to fetch these values correctly from your form
    // You might need to adjust this part to fetch the data directly from the form elements or state
    const newDetail: PartDetail = {
      partNumber: partNumber, // Ensure this is being set correctly
      condition: fields[`condition_${tabKey}`].value as string, // Correctly handle parsing and fallback
      quantity: Number(fields[`quantity_${tabKey}`].value) || 0, // Correctly handle parsing and fallback
      goodsType: partNumberDetails?.part_number.is_dg ? 'DG' : 'Non-DG',
      unNumber: UNDetails?.item?.name || 'NA',
      class: UNDetails?.item?.classs || 'NA',
      msds: partNumberDetails?.part_number.msds || 'NA',
      hscCode: HSCCodeDetails?.item?.name || '5678', // Default or fetched value
    };

    if (isNaN(newDetail.quantity)) {
      console.error('Invalid quantity input'); // Handle error or fallback
      return; // Optionally return to avoid adding invalid data
    }

    const updatedDetails = { ...tabPartDetails };
    const currentDetails = updatedDetails[tabKey] || [];
    updatedDetails[tabKey] = [...currentDetails, newDetail];

    setTabPartDetails(updatedDetails);
  };

  const allApiDataLoaded = [poList, priorityList, shipTypeList].every(
    (query) => query.isSuccess
  );

  const form = useForm({});

  const fields = useFormFields({
    connect: form,
  });

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
                    name="lr_type"
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
                      options={poOptions}
                      size={'sm'}
                      required="REF No is required"
                      isMulti
                      // onValueChange={(value) => {
                      //   setPoIdDebounced(Number(value));
                      //   setPoId(Number(value));
                      // }}
                    />
                  )}
                  <FieldInput
                    key={`ref_date_${poDetails?.data.created_at}`}
                    label="REF Date"
                    name="ref_date"
                    size={'sm'}
                    defaultValue={
                      poDetails?.data.created_at
                        ? format(
                            new Date(poDetails?.data.created_at),
                            'yyyy-MM-dd'
                          )
                        : ''
                    }
                  />
                  <FieldSelect
                    key={`priority_${poDetails?.data.priority_id}`}
                    label="Priority"
                    name="priority"
                    options={priorityOptions}
                    size={'sm'}
                    defaultValue={
                      poDetails?.data.priority_id
                        ? poDetails.data.priority_id.toString()
                        : ''
                    }
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
                    name="ship_type"
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
                    name="ship_via"
                    options={[
                      { value: 'courier', label: 'Courier' },
                      { value: 'air', label: 'Air' },
                      { value: 'freight', label: 'Freight' },
                    ]}
                    size={'sm'}
                  />
                  <FieldSelect
                    label="Goods Type"
                    name="goods_type"
                    options={[
                      { value: 'dg', label: 'DG' },
                      { value: 'non_dg', label: 'Non-DG' },
                    ]}
                    size={'sm'}
                  />
                  <FieldInput
                    key={`due_date_${poDetails?.data.created_at}`}
                    label="Due Date"
                    name="due_date"
                    size={'sm'}
                    defaultValue={
                      poDetails?.data.created_at
                        ? format(
                            new Date(poDetails?.data.created_at),
                            'yyyy-MM-dd'
                          )
                        : ''
                    }
                  />
                  <FieldInput
                    label="No of Pkgs"
                    name="no_of_pkgs"
                    type="number"
                    size="sm"
                    required="No of Pkgs is required"
                    defaultValue={2}
                  />
                  <FieldInput
                    label="Volumetric Wt"
                    name="volumetric_wt"
                    type="number"
                    size="sm"
                    required="Volumetric Wt is required"
                    defaultValue={1532}
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
                  <FieldTextarea
                    label="Consignor/Shipper"
                    name="consignor_name"
                    size={'sm'}
                    required="Consignor/Shipper is required"
                  />
                  <FieldTextarea
                    label="Consignee/Receiver"
                    name="consignee_name"
                    size={'sm'}
                    required="Consignee/Receiver is required"
                  />
                </Stack>

                {poItems && (
                  <HStack justify={'space-between'}>
                    <Text fontSize="md" fontWeight="700">
                      PO Items
                    </Text>
                    <Button
                      colorScheme="brand"
                      mr={3}
                      size={'sm'}
                      onClick={addToSelectedPoItems}
                      isDisabled={!canAddSelectedItems}
                    >
                      Add Selected Items
                    </Button>
                  </HStack>
                )}

                {poItems && (
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
                            />
                          </Th>
                          <Th color={'white'}>Line Item</Th>
                          <Th color={'white'}>Part No#</Th>
                          <Th color={'white'}>Description</Th>
                          <Th color={'white'}>Condition</Th>
                          <Th color={'white'}>Goods Type</Th>
                          <Th color={'white'}>PO Total Qty</Th>
                          <Th color={'white'}>Total Recieved Qty</Th>
                          <Th color={'white'}>LR Qty</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {poItems &&
                          poItems.map((item, index) => (
                            <Tr
                              key={index}
                              onClick={() =>
                                cumulativeAddedQuantities[item.id] >= item.qty
                                  ? null
                                  : handleItemCheckboxChange(item.id)
                              }
                              _hover={{ backgroundColor: 'gray.100' }}
                              className={
                                cumulativeAddedQuantities[item.id] >= item.qty
                                  ? 'disabled cursor-not-allowed opacity-50'
                                  : 'cursor-pointer'
                              }
                            >
                              <Td>
                                <Checkbox
                                  isChecked={selectedItems.includes(item.id)}
                                  onChange={(e) => {
                                    e.stopPropagation(); // Prevent the event from bubbling up to the row click
                                    handleItemCheckboxChange(item.id);
                                  }}
                                  disabled={
                                    cumulativeAddedQuantities[item.id] >=
                                    item.qty
                                  }
                                />
                              </Td>
                              <Td>{index + 1}</Td>
                              <PartDetails partNumber={item.part_number_id} />
                              <Td>
                                {conditionList.data?.items?.[
                                  item.condition_id
                                ] || 'N/A'}
                              </Td>
                              <Td>DG</Td>
                              <Td>{item.qty}</Td>
                              <Td>
                                {receivedQuantities[item.id] !== undefined
                                  ? receivedQuantities[item.id]
                                  : item.qty -
                                    (cumulativeAddedQuantities[item.id] || 0)}
                              </Td>

                              <Td>
                                <Input
                                  name={`lr_qty_${item.id}`}
                                  type="number"
                                  size="sm"
                                  onClick={(
                                    e: React.MouseEvent<HTMLInputElement>
                                  ) => e.stopPropagation()}
                                  onChange={(e) =>
                                    handleLrQtyChange(item.id, e.target.value)
                                  }
                                  value={lrQuantities[item.id] || ''}
                                  borderColor={
                                    validationErrors[item.id]
                                      ? 'red.500'
                                      : 'gray.200'
                                  }
                                  disabled={
                                    cumulativeAddedQuantities[item.id] >=
                                    item.qty
                                  }
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
                          ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}

                {selectedPoItems.length > 0 && (
                  <HStack justify={'space-between'} mt={2}>
                    <Text fontSize="md" fontWeight="700">
                      Added Items
                    </Text>
                  </HStack>
                )}

                {selectedPoItems.length > 0 && (
                  <TableContainer rounded={'md'} overflow={'auto'}>
                    <Table variant="striped" size={'sm'}>
                      <Thead bg={'gray'}>
                        <Tr>
                          <Th color={'white'}>Line Item</Th>
                          <Th color={'white'}>Part No#</Th>
                          <Th color={'white'}>Description</Th>
                          <Th color={'white'}>Condition</Th>
                          <Th color={'white'}>Goods Type</Th>
                          <Th color={'white'}>Qty</Th>
                          <Th color={'white'} isNumeric>
                            Action
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedPoItems.map((item, index) => (
                          <Tr key={index}>
                            <Td>{index + 1}</Td>
                            <PartDetails partNumber={item.part_number_id} />
                            <Td>
                              {conditionList.data?.items?.[item.condition_id] ||
                                'N/A'}
                            </Td>
                            <Td>DG</Td>
                            <Td>{item.lr_qty}</Td>
                            <Td isNumeric>
                              <IconButton
                                aria-label="Delete Row"
                                colorScheme="red"
                                size={'sm'}
                                icon={<DeleteIcon />}
                                onClick={() =>
                                  handleDeleteSelectedItem(item.unique_id)
                                }
                                mr={2}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}

                {selectedPoItems.length > 0 && (
                  <TableContainer rounded={'md'} overflow={'auto'}>
                    <Table colorScheme="cyan" variant="striped" size={'sm'}>
                      <Thead bg={'gray'}>
                        <Tr>
                          <Th color={'white'}>Line Item</Th>
                          <Th color={'white'}>Package Type</Th>
                          <Th color={'white'}>PKG NO</Th>
                          <Th color={'white'}>Description</Th>
                          <Th color={'white'}>Goods Type</Th>
                          <Th color={'white'}>Weight</Th>
                          <Th color={'white'} sx={{ minWidth: '150px' }}>
                            UOM
                          </Th>
                          <Th color={'white'}>Length</Th>
                          <Th color={'white'}>Width</Th>
                          <Th color={'white'}>Height</Th>
                          <Th color={'white'} sx={{ minWidth: '150px' }}>
                            UOM
                          </Th>
                          <Th color={'white'}>Pcs</Th>
                          <Th color={'white'}>Volumetric Wt</Th>
                          <Th color={'white'}>Add Part Details</Th>
                          <Th color={'white'} isNumeric>
                            Action
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {rows.map((row, index) => (
                          <Tr key={index}>
                            <Td>{index + 1}</Td>
                            <Td>
                              <FieldSelect
                                key={`package_type_${row.id}`}
                                name={`package_type_${row.id}`}
                                options={packageTypeOptions}
                                size={'sm'}
                                menuPortalTarget={document.body}
                                onValueChange={(selectedOption) =>
                                  updatePackageDetails(
                                    row.id,
                                    selectedOption as string
                                  )
                                }
                              />
                            </Td>
                            <Td>
                              <Text>
                                {packageDetails[row.id]?.number || ``}
                              </Text>
                            </Td>
                            <Td>
                              <FieldInput
                                key={`description_${row.id}`}
                                name={`description_${row.id}`}
                                size={'sm'}
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                name={'is_dg'}
                                options={[
                                  { value: 'true', label: 'DG' },
                                  { value: 'false', label: 'Non-DG' },
                                ]}
                                size={'sm'}
                                menuPortalTarget={document.body}
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`weight_${row.id}`}
                                name={`weight_${row.id}`}
                                type="number"
                                size="sm"
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                key={`weight_uom_${row.id}`}
                                name={`weight_uom_${row.id}`}
                                options={uomOptions}
                                size={'sm'}
                                menuPortalTarget={document.body}
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`length_${row.id}`}
                                name={`length_${row.id}`}
                                type="number"
                                size="sm"
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`width_${row.id}`}
                                name={`width_${row.id}`}
                                type="number"
                                size="sm"
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`height_${row.id}`}
                                name={`height_${row.id}`}
                                type="number"
                                size="sm"
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                key={`uom_${row.id}`}
                                name={`uom_${row.id}`}
                                options={uomOptions}
                                size={'sm'}
                                menuPortalTarget={document.body}
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`qty_${row.id}`}
                                name={`qty_${row.id}`}
                                type="number"
                                size="sm"
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`volumetric_wt_${row.id}`}
                                name={`volumetric_wt_${row.id}`}
                                type="number"
                                size="sm"
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                key={`part_details_${row.id}`}
                                name={`part_details_${row.id}`}
                                options={
                                  [
                                    { value: 'obtained', label: 'Obtained' },
                                    {
                                      value: 'not_obtained',
                                      label: 'Not Obtained',
                                    },
                                  ] as any
                                }
                                menuPortalTarget={document.body}
                                size="sm"
                                onValueChange={(selectedOption) =>
                                  handleStatusChange(
                                    row.id,
                                    selectedOption as
                                      | 'obtained'
                                      | 'not_obtained'
                                  )
                                }
                              />
                            </Td>
                            <Td isNumeric>
                              {index === 0 && (
                                <IconButton
                                  aria-label="Add Row"
                                  variant="@primary"
                                  size={'sm'}
                                  icon={<HiOutlinePlus />}
                                  onClick={addNewRow}
                                  mr={2}
                                />
                              )}

                              {fields &&
                                fields[`part_details_${row.id}`]?.value ===
                                  'obtained' && (
                                  <IconButton
                                    aria-label="Add Part Details"
                                    colorScheme="blue"
                                    size={'sm'}
                                    icon={<HiEye />}
                                    onClick={() => setTabIndex(index)}
                                    mr={2}
                                  />
                                )}

                              <IconButton
                                aria-label="Delete Row"
                                colorScheme="red"
                                size={'sm'}
                                icon={<DeleteIcon />}
                                onClick={() => deleteRow(row.id)}
                                isDisabled={rows.length <= 1}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}

                <Tabs
                  index={tabIndex}
                  onChange={setTabIndex}
                  variant="enclosed-colored"
                  colorScheme="green"
                  mt={4}
                >
                  <TabList flexWrap={'wrap'}>
                    {obtainedItems.map((item, num) => (
                      <Tab key={`tab-${num}`}>{item.packageNumber}</Tab>
                    ))}
                  </TabList>
                  <TabPanels>
                    {obtainedItems.map((_item, index) => (
                      <TabPanel p={4} key={`panel-${index}`}>
                        <Stack
                          bg={'white'}
                          borderRadius={'md'}
                          boxShadow={'md'}
                          borderWidth={1}
                          borderColor={'gray.200'}
                          p={4}
                          mt={4}
                          spacing={4}
                          direction={{ base: 'column', md: 'row' }}
                        >
                          <FieldSelect
                            name={`part_number_${index}`}
                            id={`part_number_${index}`}
                            label={'Part Number'}
                            size={'sm'}
                            required={'Part Number is required'}
                            options={partNumberOption || []}
                            onValueChange={(selectedOption) => {
                              setPartNumber(selectedOption || 0);
                              setPartNumberDebounced(selectedOption || 0);
                            }}
                            isClearable={true}
                            selectProps={{
                              noOptionsMessage: () => 'No parts found',
                            }}
                            style={{
                              width: 'auto',
                              minWidth: 160,
                              maxWidth: 'auto',
                            }}
                          />
                          <PartDescription
                            partNumber={Number(partNumber)}
                            size="sm"
                          />
                          <FieldDisplay
                            label="Condition"
                            value={
                              conditionList?.data?.items &&
                              selectedPoItems.length > 0
                                ? conditionList.data.items[
                                    selectedPoItems
                                      .find(
                                        (item) =>
                                          item.part_number_id === partNumber
                                      )
                                      ?.condition_id.toString() || 'default'
                                  ] || 'NA'
                                : 'NA'
                            }
                            size="sm"
                          />
                          <FieldInput
                            id={`quantity_${index}`}
                            label={'Quantity'}
                            name={`quantity_${index}`}
                            type="integer"
                            size={'sm'}
                            maxLength={9}
                          />
                          <FieldDisplay
                            label="Goods Type"
                            value={
                              partNumberDetails?.part_number.is_dg
                                ? 'DG'
                                : 'Non-DG'
                            }
                            size="sm"
                          />
                          <FieldDisplay
                            label="UN#"
                            value={
                              UNDetails?.item?.name || 'NA'
                            }
                            size="sm"
                          />
                          <FieldDisplay
                            label="CLASS"
                            value={ UNDetails?.item?.classs  || 'NA' }
                            size="sm"
                          />
                          <FieldDisplay
                            label="MSDS"
                            value={partNumberDetails?.part_number.msds || 'NA'}
                            size="sm"
                          />
                          <FieldDisplay
                            label="HSC Code"
                            value={
                              HSCCodeDetails?.item?.name ||
                              'NA'
                            }
                            size="sm"
                          />
                          <Button
                            colorScheme="brand"
                            type="button"
                            size={'sm'}
                            px={4}
                            mt={7}
                            width="200px"
                            onClick={() => handleAddPartDetails(tabIndex)}
                          >
                            Add
                          </Button>
                        </Stack>

                        <TableContainer
                          bg={'white'}
                          borderRadius={'md'}
                          boxShadow={'md'}
                          borderWidth={1}
                          borderColor={'gray.200'}
                          mt={4}
                        >
                          {tabIndex === index && tabPartDetails[index] && (
                            <Table variant={'unstyled'} size="sm">
                              <Thead bg={'gray.200'}>
                                <Tr>
                                  <Th>Part Number</Th>
                                  <Th>Condition</Th>
                                  <Th>Quantity</Th>
                                  <Th>Goods Type</Th>
                                  <Th>UN#</Th>
                                  <Th>Class</Th>
                                  <Th>MSDS</Th>
                                  <Th>HSC Code</Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {tabPartDetails[index].map(
                                  (detail: PartDetail, detailIndex: number) => (
                                    <Tr
                                      key={detailIndex}
                                      sx={{
                                        backgroundColor:
                                          detailIndex % 2 === 0
                                            ? 'green.200'
                                            : '#fff',
                                      }}
                                    >
                                      <Td>{detail.partNumber}</Td>
                                      <Td>{detail.condition}</Td>
                                      <Td>{detail.quantity}</Td>
                                      <Td>{detail.goodsType}</Td>
                                      <Td>{detail.unNumber}</Td>
                                      <Td>{detail.class}</Td>
                                      <Td>{detail.msds}</Td>
                                      <Td>{detail.hscCode}</Td>
                                    </Tr>
                                  )
                                )}
                              </Tbody>
                            </Table>
                          )}
                        </TableContainer>
                      </TabPanel>
                    ))}
                  </TabPanels>
                </Tabs>

                <FieldTextarea
                  label={'Remarks'}
                  name={'remark'}
                  textareaProps={{
                    maxLength: 150,
                  }}
                  maxLength={150}
                />

                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  justify={'center'}
                  mt={4}
                >
                  <Button
                    type="submit"
                    colorScheme="brand"
                    // isLoading={createPurchaseOrder.isLoading}
                  >
                    Save
                  </Button>
                </Stack>
              </Stack>
            </LoadingOverlay>
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default LogisticsCreate;
