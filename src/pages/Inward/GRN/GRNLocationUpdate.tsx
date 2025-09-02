import { useEffect, useMemo, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
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
import { Formiz, useForm } from '@formiz/core';
import { FaBarcode } from 'react-icons/fa';
import { HiArrowNarrowLeft, HiOutlinePlus } from 'react-icons/hi';
import { LuEye, LuSave } from 'react-icons/lu';
import { Link, useNavigate } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import PreviewPopup from '@/components/PreviewContents/GRN/Tag';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { STFInfoComponent } from '@/components/STFInfo';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useUpdateGRNLocation } from '@/services/inward/grn/services';
import { useSTFList } from '@/services/purchase/stf/services';
import { useGetListStockByStfId } from '@/services/purchase/stocks/services';
import { useBinLocationList } from '@/services/submaster/bin-location/services';
import { useRackList } from '@/services/submaster/rack/services';
import { useWarehouseList } from '@/services/submaster/warehouse/services';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import PartDetailText from '@/pages/Purchase/Quotation/PartDetailText';
import { StockInfoPopup } from './StockInfoPopup';

const SEARCH_OPTIONS = [
  { value: 'stf_import', label: 'STF IMPORT' },
  { value: 'po', label: 'PO' },
  { value: 'date_range', label: 'Date range' },
  { value: 'all', label: 'All' },
];

const GRNLocationUpdate = () => {
  const [stfId, setStfId] = useState<number | null>(null);
  const [stockData, setStockData] = useState<TODO>([]);
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const [loading, setLoading] = useState<boolean>(false);
  const [showPreview, setPreviewStatus] = useState<boolean>(false);
  const [savedIndex, setSavedIndex] = useState<any | null>(null);
  const warehouseList = useWarehouseList();
  const binLocationList = useBinLocationList();
  const stfList = useSTFList();
  const rackList = useRackList();
  const [showStockPopup, setShowStockPopup] = useState<boolean>(false);
  const [stockInfo, setStockInfo] = useState<any | null>(null);
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

  const rackOptions = useMemo(
    () => transformToSelectOptions(rackList.data),
    [rackList.data]
  );

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

  const handleClosePopup = () => {
    setShowStockPopup(false);
    setPreviewStatus(false);
    setStockInfo(null);
  };

  useEffect(() => {
    if (stockByStfData && stockByStfData.data) {
      setStockData(formatStockItems(stockByStfData?.data));
    }
  }, [stockByStfData]);

  const updateGRNLocation = useUpdateGRNLocation({
    onSuccess: (data) => {
      toastSuccess({
        title: data.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      setSavedIndex(null);
      stockByStfRefetch();
    },
    onError: (error) => {
      toastError({
        title: 'Sorry!!',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      setLoading(false);
      setSavedIndex(null);
    },
  });

  const formatStockItems = (itemsToUpdate: TODO) => {
    let stockItems: any = [];
    let items: any = itemsToUpdate;
    items.forEach((item: any) => {
      let obj: any = item;
      obj.existing_qty = 0;
      obj.is_addable = false;
      obj.zerocount = 0;
      let grnItems: any = [];
      item.grns.forEach((grn_item: any) => {
        grnItems.push(grn_item);
        obj.existing_qty = obj.existing_qty + Number(grn_item.qty);
        if (Number(grn_item.qty) === 0) {
          obj.zerocount++;
        }
      });
      if (obj.existing_qty < obj.qty && obj.zerocount === 0) {
        obj.is_addable = true;
      }
      obj.grns = grnItems;
      stockItems.push(obj);
    });
    return stockItems;
  };

  const addGRNItem = (index: number) => {
    let obj: any = {};
    obj.bin_location_id = '';
    obj.qty = '';
    obj.rack_id = '';
    obj.stock_id = stockData[index].id;
    obj.warehouse_id = '';
    obj.remark = '';
    let updatedStockData = [...stockData];

    updatedStockData[index] = {
      ...updatedStockData[index],
      grns: [...updatedStockData[index].grns, obj],
    };

    setStockData(formatStockItems(updatedStockData));
  };

  const deleteGRNItem = (index: number, grnIndex: number) => {
    let updatedStockData = [...stockData];
    updatedStockData[index] = {
      ...updatedStockData[index],
      grns: [...updatedStockData[index].grns],
    };

    updatedStockData[index].grns.splice(grnIndex, 1);

    setStockData(formatStockItems(updatedStockData));
  };

  const showStockInfo = (item: any) => {
    setStockInfo(item);
    setShowStockPopup(true);
  };

  const handleGlobalChange = (
    property: string,
    value: any,
    index: number,
    grnIndex: number = -1
  ) => {
    const updatedStockData = [...stockData];
    if (property !== 'qty') {
      if (grnIndex >= 0) {
        updatedStockData[index].grns[grnIndex][property] = value;
      } else {
        updatedStockData[index][property] = value;
      }
    } else {
      updatedStockData[index].grns[grnIndex][property] = value;
      const maxQuantity =
        updatedStockData[index].qty - updatedStockData[index].existing_qty || 0;
      const validQuantity = Math.min(Math.max(value, 0), maxQuantity);
      updatedStockData[index].grns[grnIndex][property] = validQuantity;
    }

    setStockData(formatStockItems(updatedStockData));
  };

  const saveGRNupdates = (index: number) => {
    let isValid: boolean = true;
    let msg: string = '';
    if (stockData[index].qty === stockData[index].existing_qty) {
      stockData[index].grns.forEach((grn_item: any) => {
        if (
          Number(grn_item.bin_location_id) === 0 ||
          Number(grn_item.rack_id) === 0 ||
          Number(grn_item.warehouse_id) === 0
        ) {
          isValid = false;
          msg = 'GRN property value missing. Please check.';
        }
      });
    } else {
      msg = 'Total quantity and GRNs quantity are mismatching.';
      isValid = false;
    }
    if (!isValid) {
      toastError({
        title: 'Sorry!!!',
        description: msg,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } else {
      setSavedIndex(index);
      setLoading(true);
      let payLoad: any = {};
      payLoad.stock_id = stockData[index].id;
      payLoad.grns = stockData[index].grns;
      console.log(payLoad);
      updateGRNLocation.mutate(payLoad);
    }
  };

  useEffect(() => {
    console.log(stockData);
  }, [stockData]);

  useEffect(() => {
    if (stfId !== null) {
      stockByStfRefetch();
    }
  }, [stfId]);

  const form = useForm({
    onValidSubmit: async (values) => {
      console.log('Values:', values);
    },
  });

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
                <BreadcrumbLink>GRN Location Upate</BreadcrumbLink>
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
          <HStack justify={'space-between'}>
            <Heading as="h4" size={'md'}>
              GRN Location Upate
            </Heading>
            <ResponsiveIconButton
              colorScheme={'green'}
              icon={<FaBarcode />}
              size={'sm'}
              onClick={() => setPreviewStatus(true)}
            >
              View Tag
            </ResponsiveIconButton>
          </HStack>

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
                />
              </Stack>

              <STFInfoComponent stfId={stfId} />

              {stockByStfLoading && (
                <Flex justify="center" align="center" height="200px">
                  <Spinner size="xl" color="brand.500" />
                </Flex>
              )}

              {stockData.length > 0 && (
                <Stack>
                  <HStack spacing={2}>
                    <Text fontSize={'md'} fontWeight={'700'}>
                      Stock Items
                    </Text>
                  </HStack>
                  <TableContainer
                    boxShadow={'md'}
                    borderWidth={1}
                    borderColor={'gray.200'}
                    overflow={'auto'}
                  >
                    <Table variant={'unstyled'} size={'sm'}>
                      <Thead>
                        <Tr>
                          <Th borderWidth="1px" borderColor="black">
                            S.No
                          </Th>
                          <Th borderWidth="1px" borderColor="black">
                            BIN LOC
                          </Th>
                          <Th borderWidth="1px" borderColor="black">
                            Rack
                          </Th>
                          <Th borderWidth="1px" borderColor="black">
                            Warehouse
                          </Th>
                          <Th borderWidth="1px" borderColor="black">
                            Quantity
                          </Th>
                          <Th borderWidth="1px" borderColor="black">
                            Remarks
                          </Th>
                          <Th borderWidth="1px" borderColor="black">
                            Action
                          </Th>
                          <Th borderWidth="1px" borderColor={'black'}>
                            Sto.Info
                          </Th>
                          <Th borderWidth="1px" borderColor={'black'}>
                            Sto.Action
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {stockData.map((item: TODO, index: number) => {
                          // Ensure item.grns exists before mapping
                          if (!item.grns || item.grns.length === 0) return null;

                          return (
                            <>
                              {item.grns.map(
                                (detail: TODO, grnindex: number) => {
                                  const maxQuantity =
                                    Number(item.qty) -
                                    Number(item.existing_qty);
                                  return (
                                    <Tr key={`${index}-${grnindex}`}>
                                      <Td borderWidth="1px" borderColor="black">
                                        {index + 1}.{grnindex + 1}
                                      </Td>
                                      <Td borderWidth="1px" borderColor="black">
                                        <FieldSelect
                                          name={`bin_location_id_${item.id}_${grnindex}`}
                                          placeholder="Select BinLocation"
                                          options={binLocationOptions}
                                          menuPortalTarget={document.body}
                                          size="sm"
                                          isClearable={false}
                                          defaultValue={
                                            detail?.bin_location_id?.toString() ||
                                            ''
                                          }
                                          onValueChange={(value) =>
                                            handleGlobalChange(
                                              'bin_location_id',
                                              Number(value),
                                              index,
                                              grnindex
                                            )
                                          }
                                          width="120px"
                                        />
                                      </Td>
                                      <Td borderWidth="1px" borderColor="black">
                                        <FieldSelect
                                          name={`rack_${item.id}_${grnindex}`}
                                          placeholder="Select Rack"
                                          options={rackOptions}
                                          menuPortalTarget={document.body}
                                          size="sm"
                                          isClearable={false}
                                          defaultValue={
                                            detail?.rack_id?.toString() || ''
                                          }
                                          onValueChange={(value) =>
                                            handleGlobalChange(
                                              'rack_id',
                                              Number(value),
                                              index,
                                              grnindex
                                            )
                                          }
                                          width="120px"
                                        />
                                      </Td>
                                      <Td borderWidth="1px" borderColor="black">
                                        <FieldSelect
                                          name={`warehouse_${item.id}_${grnindex}`}
                                          placeholder="Select Warehouse"
                                          options={warehouseOptions}
                                          menuPortalTarget={document.body}
                                          size="sm"
                                          isClearable={false}
                                          defaultValue={
                                            detail?.warehouse_id?.toString() ||
                                            ''
                                          }
                                          onValueChange={(value) =>
                                            handleGlobalChange(
                                              'warehouse_id',
                                              Number(value),
                                              index,
                                              grnindex
                                            )
                                          }
                                          width="140px"
                                        />
                                      </Td>
                                      <Td borderWidth="1px" borderColor="black">
                                        <Input
                                          type="number"
                                          value={detail?.qty || 0}
                                          min={0}
                                          max={maxQuantity}
                                          size="sm"
                                          onChange={(e) =>
                                            handleGlobalChange(
                                              'qty',
                                              parseInt(e.target.value, 10) || 0,
                                              index,
                                              grnindex
                                            )
                                          }
                                        />
                                      </Td>
                                      <Td borderWidth="1px" borderColor="black">
                                        <FieldInput
                                          name={`remark_${item.id}_${grnindex}`}
                                          placeholder="Remarks"
                                          type="text"
                                          size="sm"
                                          onValueChange={(value) =>
                                            handleGlobalChange(
                                              'remark',
                                              value,
                                              index,
                                              grnindex
                                            )
                                          }
                                        />
                                      </Td>
                                      <Td borderWidth="1px" borderColor="black">
                                        {grnindex === item.grns.length - 1 && item.is_addable && (
                                          <IconButton
                                            aria-label="Add Row"
                                            variant="@primary"
                                            size="sm"
                                            icon={<HiOutlinePlus />}
                                            onClick={() => addGRNItem(index)}
                                            mr={2}
                                          />
                                        )}
                                        <IconButton
                                          aria-label="Delete Row"
                                          colorScheme="red"
                                          size="sm"
                                          icon={<DeleteIcon />}
                                          onClick={() =>
                                            deleteGRNItem(index, grnindex)
                                          }
                                          isDisabled={
                                            item?.grns && item?.grns.length <= 1
                                          }
                                        />
                                      </Td>
                                      {grnindex === 0 && (
                                        <Td
                                          rowSpan={item.grns.length}
                                          borderWidth="1px"
                                          borderColor="black"
                                          textAlign="center"
                                          verticalAlign="middle"
                                        >
                                          <Text textAlign={'left'}>
                                            <PartDetailText
                                              partNumber={item.part_number_id}
                                            />
                                            <PartDetailText
                                              partNumber={item.part_number_id}
                                              field={'description'}
                                            />
                                            Ctrl/ID:
                                            <strong>{item.control_id}</strong>
                                            <br />
                                            S.No:
                                            <strong>
                                              {item.serial_lot_number}
                                            </strong>
                                            <br />
                                            QTY: <strong>{item.qty}</strong>
                                            <br />
                                            <strong>
                                              {item.is_quarantine
                                                ? 'Quarantine'
                                                : 'Not Quarantine'}
                                            </strong>
                                          </Text>
                                        </Td>
                                      )}
                                      {grnindex === 0 && (
                                        <Td
                                          rowSpan={item.grns.length}
                                          borderWidth="1px"
                                          borderColor="black"
                                          textAlign="center"
                                          verticalAlign="middle"
                                        >
                                          <Button
                                            leftIcon={<LuSave />}
                                            colorScheme="green"
                                            size="sm"
                                            onClick={() =>
                                              saveGRNupdates(index)
                                            }
                                            isDisabled={loading}
                                            isLoading={
                                              loading && index === savedIndex
                                            }
                                            mr={2}
                                          >
                                            Save
                                          </Button>

                                          <Button
                                            leftIcon={<LuEye />}
                                            colorScheme="blue"
                                            size="sm"
                                            onClick={() => showStockInfo(item)}
                                            isDisabled={loading}
                                            isLoading={
                                              loading && index === savedIndex
                                            }
                                          >
                                            View
                                          </Button>
                                        </Td>
                                      )}
                                    </Tr>
                                  );
                                }
                              )}
                            </>
                          );
                        })}
                      </Tbody>
                    </Table>
                  </TableContainer>
                </Stack>
              )}
            </Stack>

            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify={'center'}
              mt={4}
            >
              <Button colorScheme="red" onClick={() => navigate(-1)} size={'sm'}>
                Back
              </Button>
            </Stack>
          </Formiz>
        </Stack>
        <StockInfoPopup
          isOpen={showStockPopup}
          onClose={() => {
            handleClosePopup();
          }}
          stockInfo={stockInfo}
        />

        <PreviewPopup
          isOpen={showPreview}
          onClose={() => {
            handleClosePopup();
          }}
        ></PreviewPopup>
      </Stack>
    </SlideIn>
  );
};

export default GRNLocationUpdate;
