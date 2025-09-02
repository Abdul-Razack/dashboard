import React, { useEffect, useRef, useState } from 'react';

import { EditIcon, ViewIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  HStack,
  IconButton,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';
import { HiClipboardList, HiRefresh } from 'react-icons/hi';
import { LuCheck, LuX } from 'react-icons/lu';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { FieldDateRangePicker } from '@/components/FieldDateRangePicker';
import { FieldSelect } from '@/components/FieldSelect';
import { SlideIn } from '@/components/SlideIn';
import {
  getPRTypeLabel,
  transformPartsToSelectOptions,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import PartDetailText from '@/pages/Purchase/Quotation/PartDetailText';
import { getAPICall } from '@/services/apiService';
import {
  PRListPayload,
  PRTypeListPayload,
  PartNumberBulkPayload,
  PartNumberSearchPayload,
} from '@/services/apiService/Schema/PRSchema';
import { PRDataColumn } from '@/services/purchase/purchase-request/schema';
import { usePRIndex } from '@/services/purchase/purchase-request/services';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

interface SearchBarProps {
  onSearchFinished: (response: any, columns: any, queryParams?: any) => void;
  setModuleLoading: (response: boolean) => void;
  additionalParams?: any;
  existingMRs?: any;
  onPreviewClicked?: (data: any) => void;
  onMRChanged?: (data: any) => void;
  isModal: boolean;
  resetTrigger?: boolean;
}

export const MaterialRequestSearch: React.FC<SearchBarProps> = ({
  onSearchFinished,
  setModuleLoading,
  additionalParams,
  existingMRs,
  onPreviewClicked,
  onMRChanged,
  isModal,
  resetTrigger,
}) => {
  const navigate = useNavigate();
  const [partsLoading, setPartsLoading] = useState<boolean>(true);
  const initialFormData = {
    purchase_request_id: '',
    ref_id: '',
    type: '',
    part_number_id: '',
    start_date: '',
    end_date: '',
    page: 1,
    is_closed: '',
  };
  const queryClient = useQueryClient();
  const [minDate, setMinDate] = useState<any>(null);
  const [maxDate, setMaxDate] = useState<any>(null);
  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const [spareQueryParams, setSpareQueryParams] = useState<any>({});
  const [spareOptions, setSpareOptions] = useState<TODO>([]);
  const [prOptions, setPROptions] = useState<any>([]);
  const [prTypeOptions, setPRTypeOptions] = useState<any>([]);
  const prevQueryParamsRef = useRef(queryParams);
  const searchingPartNo = useRef(queryParams.part_number_id);
  const [selectedMRs, setSelectedMRs] = useState<any[]>([]);
  const [resetKey, setResetKey] = useState(0);
  const form = useForm({
    onValidSubmit: (values) => {
      console.log(values);
      // setQueryParams({ search: values });
    },
  });

  const getPRList = async () => {
    try {
      const response = await getAPICall(
        endPoints.list.purchase_request,
        PRListPayload
      );
      setPROptions(transformToSelectOptions(response));
    } catch (err) {
      setModuleLoading(false);
      console.log(err);
    }
  };

  const getPRTypeList = async (type: string) => {
    try {
      const response = await getAPICall(
        endPoints.list.purchase_request_type,
        PRTypeListPayload,
        { type: type }
      );
      setPRTypeOptions(transformToSelectOptions(response));
    } catch (err) {
      setModuleLoading(false);
      console.log(err);
    }
  };

  const getPartNumberList = async () => {
    try {
      const response = await getAPICall(
        endPoints.search.spare_by_partnumber,
        PartNumberSearchPayload,
        spareQueryParams
      );
      const options = response.part_numbers?.map((spare: TODO) => ({
        value: spare.id.toString(),
        label: `${spare.part_number} - ${spare.description}`,
      }));
      setSpareOptions(options);
      setPartsLoading(false);
      // setPROptions(transformToSelectOptions(response));
    } catch (err) {
      setModuleLoading(false);
      console.log(err);
    }
  };

  const getBulkPartNumberList = async (partNumbers: any) => {
    try {
      const response = await getAPICall(
        endPoints.bulk.spare_by_part_number_id_bulk,
        PartNumberBulkPayload,
        { part_number_id: partNumbers }
      );
      const options = transformPartsToSelectOptions(response);
      setSpareOptions(options);
      setPartsLoading(false);
    } catch (err) {
      setModuleLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    const hasQueryParamsChanged = Object.keys(queryParams).some(
      (key) => queryParams[key] !== prevQueryParamsRef.current[key]
    );

    if (hasQueryParamsChanged) {
      setModuleLoading(true);
      prevQueryParamsRef.current = queryParams;
      queryClient.invalidateQueries('prIndex');
      if (queryParams?.purchase_request_id) {
        setColumnOrder('mrNo');
      } else if (queryParams?.ref_id || queryParams?.type) {
        setColumnOrder('mrTypeRef');
      } else if (queryParams?.part_number_id) {
        setColumnOrder('partNo');
      } else if (queryParams?.start_date || queryParams?.end_date) {
        setColumnOrder('createdAt');
      } else {
        setColumnOrder('mrNo');
      }
    } else {
      setColumnOrder('mrNo');
    }
    console.log(queryParams);
  }, [queryParams]);

  useEffect(() => {
    const updatedParams = {
      ...queryParams,
      ...additionalParams,
    };
    setQueryParams(updatedParams);
  }, [additionalParams]);

  useEffect(() => {
    setSelectedMRs(existingMRs);
    setColumns(tableColumns);
  }, [resetTrigger]);

  useEffect(() => {
    if (Array.isArray(existingMRs)) {
      setSelectedMRs(existingMRs.map(Number));
      setColumns(tableColumns);
    }
  }, [existingMRs]);

  const triggerPreview = (previewData: any) => {
    if (onPreviewClicked) {
      onPreviewClicked(previewData);
    }
  };

  const toggleItem = (item: any) => {
    setSelectedMRs((prevItems) => {
      if (prevItems.includes(item)) {
        return prevItems.filter((i) => i !== item);
      } else {
        return [...prevItems, item];
      }
    });
    setColumns((prev: any) => [...prev]);
  };

  const MRList = usePRIndex(queryParams);
  const [partNumber, setPartNumber] = useState('');
  const columnHelper = createColumnHelper<PRDataColumn>();
  const [columnOrder, setColumnOrder] = useState('mrNo');
  const tableColumns = [
    ...(columnOrder === 'mrNo'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = MRList?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'MR No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created At',
            meta: {
              sortable: true,
              isNumeric: false,
            },
            id: 'created_at',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Tot Line Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          ...(queryParams?.is_closed === 0 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === true).length,
                  header: 'Open Items',
                  meta: {
                    sortable: true,
                    isNumeric: false,
                    sortParam: 'total_open',
                  },
                  id: 'openItems',
                }),
              ]
            : []),

          ...(queryParams?.is_closed === 1 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === false).length,
                  header: 'Clo Items',
                  meta: {
                    sortable: true,
                    isNumeric: false,
                    sortParam: 'total_closed',
                  },
                  id: 'closeItems',
                }),
              ]
            : []),

          columnHelper.accessor('items', {
            cell: (info) =>
              info.getValue().reduce((sum, item) => sum + item.qty, 0),
            header: 'Tot Qty',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_qty',
            },
            id: 'totalQty',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
          }),
          columnHelper.accessor('ref', {
            cell: (info) => info.getValue(),
            header: 'Ref.No',
            id: 'ref_id',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'is_closed',
            },
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4} justify={'flex-end'}>
                  {isModal === false && (
                    <React.Fragment>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size={'sm'}
                        onClick={() => triggerPreview(info.row.original)}
                      />

                      <IconButton
                        aria-label="Logs"
                        icon={<HiClipboardList />}
                        size={'sm'}
                        onClick={() =>
                          navigate(
                            `/purchase/purchase-request/${info.row.original.id}/logs`
                          )
                        }
                        display={'none'}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size={'sm'}
                        display={'none'}
                        onClick={() =>
                          navigate(
                            `/purchase/purchase-request/${info.row.original.id}/edit`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedMRs.includes(info.row.original.id)
                          ? 'red'
                          : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(selectedMRs);
                        console.log(
                          selectedMRs.some(
                            (item) => item === info.row.original.id
                          )
                        );
                        console.log(info.row.original.id);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedMRs.includes(info.row.original.id) ? (
                          <LuX />
                        ) : (
                          <LuCheck />
                        )
                      }
                    ></IconButton>
                  )}
                </HStack>
              );
            },
            header: () => <Text textAlign="end">Actions</Text>,
            meta: {
              isNumeric: true,
            },
          }),
        ]
      : []),
    ...(columnOrder === 'partNo'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = MRList?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('items', {
            header: 'Part Numbers',
            cell: (info) => {
              const uniquePartNumbers = Array.from(
                new Set(info.getValue().map((item) => item.part_number_id))
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniquePartNumbers.map((partNumber, index) => (
                    <ListItem
                      key={`${index}-${partNumber}`}
                      className={`${searchingPartNo.current}-${partNumber}`}
                      display={`${
                        searchingPartNo.current.toString() ===
                        partNumber.toString()
                          ? 'show'
                          : 'none'
                      }`}
                      width={20}
                    >
                      <Text>
                        <PartDetailText partNumber={partNumber} />
                      </Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            id: 'part_number_id',
          }),
          columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'MR No',
            meta: {
              sortable: true,
              isNumeric: false,
            },
            id: 'id',
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created At',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'created_at',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Tot Line Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          ...(queryParams?.is_closed === 0 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === true).length,
                  header: 'Open Items',
                  meta: {
                    sortable: true,
                    isNumeric: false,
                    sortParam: 'total_open',
                  },
                  id: 'openItems',
                }),
              ]
            : []),

          ...(queryParams?.is_closed === 1 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === false).length,
                  header: 'Clo Items',
                  meta: {
                    sortable: true,
                    isNumeric: false,
                    sortParam: 'total_closed',
                  },
                  id: 'closeItems',
                }),
              ]
            : []),

          columnHelper.accessor('items', {
            cell: (info) =>
              info.getValue().reduce((sum, item) => sum + item.qty, 0),
            header: 'Tot Qty',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_qty',
            },
            id: 'totalQty',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
          }),
          columnHelper.accessor('ref', {
            cell: (info) => info.getValue(),
            header: 'Ref.No',
            id: 'ref_id',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'is_closed',
            },
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4} justify={'flex-end'}>
                  {isModal === false && (
                    <React.Fragment>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size={'sm'}
                        onClick={() => triggerPreview(info.row.original)}
                      />

                      <IconButton
                        aria-label="Logs"
                        icon={<HiClipboardList />}
                        size={'sm'}
                        onClick={() =>
                          navigate(
                            `/purchase/purchase-request/${info.row.original.id}/logs`
                          )
                        }
                        display={'none'}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size={'sm'}
                        display={'none'}
                        onClick={() =>
                          navigate(
                            `/purchase/purchase-request/${info.row.original.id}/edit`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedMRs.includes(info.row.original.id)
                          ? 'red'
                          : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedMRs.includes(info.row.original.id) ? (
                          <LuX />
                        ) : (
                          <LuCheck />
                        )
                      }
                    ></IconButton>
                  )}
                </HStack>
              );
            },
            header: () => <Text textAlign="end">Actions</Text>,
            meta: {
              isNumeric: true,
            },
          }),
        ]
      : []),
    ...(columnOrder === 'mrTypeRef'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = MRList?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('type', {
            cell: (info) => getPRTypeLabel(info.getValue()),
            header: 'MR Type',
            id: 'type',
          }),
          columnHelper.accessor('ref', {
            cell: (info) => info.getValue(),
            header: 'Ref.No',
            id: 'ref_id',
          }),
          columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'MR No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created At',
            meta: {
              sortable: true,
              isNumeric: false,
            },
            id: 'created_at',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Tot Line Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          ...(queryParams?.is_closed === 0 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === true).length,
                  header: 'Open Items',
                  meta: {
                    sortable: true,
                    isNumeric: false,
                    sortParam: 'total_open',
                  },
                  id: 'openItems',
                }),
              ]
            : []),

          ...(queryParams?.is_closed === 1 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === false).length,
                  header: 'Clo Items',
                  meta: {
                    sortable: true,
                    isNumeric: false,
                    sortParam: 'total_closed',
                  },
                  id: 'closeItems',
                }),
              ]
            : []),

          columnHelper.accessor('items', {
            cell: (info) =>
              info.getValue().reduce((sum, item) => sum + item.qty, 0),
            header: 'Tot Qty',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_qty',
            },
            id: 'totalQty',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
          }),

          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'is_closed',
            },
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4} justify={'flex-end'}>
                  {isModal === false && (
                    <React.Fragment>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size={'sm'}
                        onClick={() => triggerPreview(info.row.original)}
                      />

                      <IconButton
                        aria-label="Logs"
                        icon={<HiClipboardList />}
                        size={'sm'}
                        onClick={() =>
                          navigate(
                            `/purchase/purchase-request/${info.row.original.id}/logs`
                          )
                        }
                        display={'none'}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size={'sm'}
                        display={'none'}
                        onClick={() =>
                          navigate(
                            `/purchase/purchase-request/${info.row.original.id}/edit`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedMRs.includes(info.row.original.id)
                          ? 'red'
                          : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedMRs.includes(info.row.original.id) ? (
                          <LuX />
                        ) : (
                          <LuCheck />
                        )
                      }
                    ></IconButton>
                  )}
                </HStack>
              );
            },
            header: () => <Text textAlign="end">Actions</Text>,
            meta: {
              isNumeric: true,
            },
          }),
        ]
      : []),
    ...(columnOrder === 'createdAt'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = MRList?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created At',
            meta: {
              sortable: true,
              isNumeric: false,
            },
            id: 'created_at',
          }),
          columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'MR No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),

          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Tot Line Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          ...(queryParams?.is_closed === 0 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === true).length,
                  header: 'Open Items',
                  meta: {
                    sortable: true,
                    isNumeric: false,
                    sortParam: 'total_open',
                  },
                  id: 'openItems',
                }),
              ]
            : []),

          ...(queryParams?.is_closed === 1 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === false).length,
                  header: 'Clo Items',
                  meta: {
                    sortable: true,
                    isNumeric: false,
                    sortParam: 'total_closed',
                  },
                  id: 'closeItems',
                }),
              ]
            : []),

          columnHelper.accessor('items', {
            cell: (info) =>
              info.getValue().reduce((sum, item) => sum + item.qty, 0),
            header: 'Tot Qty',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_qty',
            },
            id: 'totalQty',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
          }),
          columnHelper.accessor('ref', {
            cell: (info) => info.getValue(),
            header: 'Ref.No',
            id: 'ref_id',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'is_closed',
            },
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4} justify={'flex-end'}>
                  {isModal === false && (
                    <React.Fragment>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size={'sm'}
                        onClick={() => triggerPreview(info.row.original)}
                      />

                      <IconButton
                        aria-label="Logs"
                        icon={<HiClipboardList />}
                        size={'sm'}
                        onClick={() =>
                          navigate(
                            `/purchase/purchase-request/${info.row.original.id}/logs`
                          )
                        }
                        display={'none'}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size={'sm'}
                        display={'none'}
                        onClick={() =>
                          navigate(
                            `/purchase/purchase-request/${info.row.original.id}/edit`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedMRs.includes(info.row.original.id)
                          ? 'red'
                          : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedMRs.includes(info.row.original.id) ? (
                          <LuX />
                        ) : (
                          <LuCheck />
                        )
                      }
                    ></IconButton>
                  )}
                </HStack>
              );
            },
            header: () => <Text textAlign="end">Actions</Text>,
            meta: {
              isNumeric: true,
            },
          }),
        ]
      : []),
  ];

  const [columns, setColumns] = useState<TODO>(tableColumns);

  useEffect(() => {
    if (MRList?.data) {
      onSearchFinished(MRList?.data, columns, queryParams);
    }
    if (MRList?.data?.purchase_request_ids) {
      if (MRList?.data?.purchase_request_ids.length > 0) {
        setPROptions(convertToOptions(MRList?.data?.purchase_request_ids));
      }
    }
    if (MRList?.data?.part_numbers) {
      if (MRList?.data?.part_numbers.length > 0) {
        getBulkPartNumberList(MRList?.data?.part_numbers);
      }
    }
    if (MRList?.data?.min_date) {
      setMinDate(MRList?.data?.min_date);
    }
    if (MRList?.data?.max_date) {
      setMaxDate(MRList?.data?.max_date);
    }
  }, [MRList?.data]);

  const convertToOptions = (options: any) => {
    let convertedOptions: any = [];
    options.forEach((item: any) => {
      let object: any = {};
      object.value = item.toString();
      object.label = item;
      convertedOptions.push(object);
    });
    return convertedOptions;
  };
  const setPartNumberDebounced = useRef(
    debounce((value: any) => {
      setPartNumber(value);
    })
  ).current;

  useEffect(() => {
    setSpareQueryParams({ query: partNumber });
  }, [partNumber]);

  useEffect(() => {
    setColumns(tableColumns);
  }, [columnOrder]);

  useEffect(() => {
    getPartNumberList();
  }, [spareQueryParams]);

  useEffect(() => {
    getPRList();
    getPartNumberList();
  }, []);

  useEffect(() => {
    if (isModal === true) {
      if (MRList?.data && onMRChanged) {
        onSearchFinished(MRList?.data, tableColumns, queryParams);
        onMRChanged(selectedMRs);
      }
      setColumns(tableColumns);
    }
  }, [selectedMRs]);

  const handleDateRangeClear = () => {
    setPartsLoading(true);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      start_date: '',
      end_date: '',
      page: 1,
    }));
    setSpareOptions([]);
    getPRList();
    getPartNumberList();
  };

  const triggerDateClear = () => {
    const button = document.getElementById('btn-clear');
    if (button) {
      button.click();
    }
  };

  return (
    <SlideIn>
      <Stack
        p={isModal === true ? 0 : 0}
        spacing={4}
        className={isModal === true ? 'popupForm' : 'pageForm'}
      >
        <Formiz autoForm connect={form}>
          <Box
            bg={'white'}
            sx={{
              width: isModal === false ? '100%' : 'auto',
              padding: isModal === false ? '4' : '0',
              borderRadius: isModal === false ? '4' : '0',
            }}
          >
            <Box
              sx={{
                bg: isModal === false ? 'green.200' : 'white',
                width: isModal === false ? '100%' : 'auto',
                padding: isModal === false ? '4' : '0',
                borderRadius: isModal === false ? '4' : '0',
              }}
            >
              <Stack
                sx={{
                  display: isModal === false ? 'flex' : '',
                  align: isModal === false ? 'flex-start' : '',
                  justify: isModal === false ? 'flex-start' : '',
                }}
                direction={{ base: 'column', md: 'row' }}
                mt={2}
              >
                <FieldSelect
                  label={'MR No'}
                  name={'purchase_request_id'}
                  key={`purchase_request_id_${resetKey}`}
                  options={prOptions ?? []}
                  isClearable={true}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      purchase_request_id: value ?? '',
                      type: '',
                      start_date: '',
                      end_date: '',
                      part_number_id: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`type`]: [],
                      [`part_number_id`]: '',
                      [`date_range`]: '',
                    });
                    triggerDateClear();
                  }}
                  selectProps={{
                    noOptionsMessage: () => 'MR No not found',
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                  size={'sm'}
                  isDisabled={queryParams?.ref_id !== ''}
                  menuPortalTarget={document.body}
                  sx={{ mb: isModal === true ? '2' : '0' }}
                />

                <FieldSelect
                  label={'MR Type'}
                  name={'type'}
                  key={`type_${resetKey}`}
                  placeholder="Select"
                  options={[
                    { value: 'sel', label: 'SEL' },
                    { value: 'wo', label: 'WO' },
                    { value: 'stock', label: 'Stock' },
                    { value: 'oe', label: 'Open Enquiry' },
                    { value: 'project', label: 'Project' },
                  ]}
                  onValueChange={(value) => {
                    if (value) {
                      getPRTypeList(value);
                    }
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      type: value ?? '',
                      ref_id: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`ref_id`]: '',
                    });
                  }}
                  isClearable={true}
                  size={'sm'}
                  menuPortalTarget={document.body}
                  selectProps={{
                    noOptionsMessage: () => 'MR Type not found',
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                  isDisabled={
                    queryParams?.purchase_request_id !== '' &&
                    queryParams?.purchase_request_id !== null
                  }
                  sx={{ mb: isModal === true ? '2' : '0' }}
                />

                <FieldSelect
                  label={'REF No'}
                  key={`ref_id_${resetKey}`}
                  name={'ref_id'}
                  placeholder="Select"
                  options={prTypeOptions ?? []}
                  isClearable={true}
                  size={'sm'}
                  isDisabled={queryParams?.type === ''}
                  menuPortalTarget={document.body}
                  selectProps={{
                    noOptionsMessage: () => 'REF No not found',
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      ref_id: value ?? '',
                      purchase_request_id: '',
                      part_number_id: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`purchase_request_id`]: '',
                      [`part_number_id`]: '',
                      [`date_range`]: '',
                    });
                  }}
                  sx={{ mb: isModal === true ? '2' : '0' }}
                />

                <FieldSelect
                  label={'Part Number'}
                  key={`part_number_id_${resetKey}`}
                  name={`part_number_id`}
                  size={'sm'}
                  menuPortalTarget={document.body}
                  options={spareOptions ?? []}
                  isClearable={true}
                  onValueChange={(value) => {
                    searchingPartNo.current = value ?? '';
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      type: '',
                      ref_id: '',
                      part_number_id: value ?? '',
                      page: 1,
                    }));
                    form.setValues({
                      [`type`]: [],
                      [`ref_id`]: [],
                    });
                  }}
                  selectProps={{
                    isLoading: partsLoading,
                    noOptionsMessage: () => 'No parts found',
                    onInputChange: (event: any) => {
                      setPartNumberDebounced(event);
                    },
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                  isDisabled={
                    queryParams?.ref_id !== '' ||
                    (queryParams?.purchase_request_id !== '' &&
                      queryParams?.purchase_request_id !== null)
                  }
                  sx={{ mb: isModal === true ? '2' : '0' }}
                />

                <FieldDateRangePicker
                  label={'Date Range'}
                  name={'date_range'}
                  key={`date_range_${resetKey}`}
                  placeholder="Select Date Period"
                  size={'sm'}
                  disabledDays={{ after: new Date() }}
                  onValueChange={(value) => {
                    if (value?.from && value?.to) {
                      setPartsLoading(true);
                      setQueryParams((prevState: TODO) => ({
                        ...prevState,
                        part_number_id: '',
                        start_date: value.from
                          ? format(new Date(value.from), 'yyyy-MM-dd')
                          : '',
                        end_date: value.to
                          ? format(new Date(value.to), 'yyyy-MM-dd')
                          : '',
                        page: 1,
                      }));

                      form.setValues({ [`part_number_id`]: '' });
                    }
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                  onClear={handleDateRangeClear}
                  dateRangePickerProps={{
                    inputProps: {
                      isDisabled:
                        queryParams?.ref_id !== '' ||
                        (queryParams?.purchase_request_id !== '' &&
                          queryParams?.purchase_request_id !== null),
                    },
                  }}
                  isSearch={true}
                  sx={{ mb: isModal === true ? '2' : '0' }}
                />
              </Stack>
            </Box>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              alignItems="center"
              justifyContent="center"
              mt={4}
            >
              <Button
                type="reset"
                variant="@primary"
                size={'sm'}
                leftIcon={<HiRefresh />}
                onClick={() => {
                  setSpareOptions([]);
                  setQueryParams(initialFormData);
                  setResetKey((prevKey) => prevKey + 1);
                  form.setValues({
                    [`type`]: '',
                    [`purchase_request_id`]: '',
                    [`part_number_id`]: '',
                    [`date_range`]: '',
                    [`ref_id`]: '',
                  });
                  triggerDateClear();
                  queryClient.invalidateQueries('prIndex');
                }}
              >
                Reset Form
              </Button>
            </Stack>
          </Box>
        </Formiz>
      </Stack>
    </SlideIn>
  );
};

export default MaterialRequestSearch;
