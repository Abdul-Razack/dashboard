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
import { HiRefresh } from 'react-icons/hi';
import { LuCheck, LuX } from 'react-icons/lu';
import { useQueryClient } from 'react-query';
import { UseQueryResult } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { FieldDateRangePicker } from '@/components/FieldDateRangePicker';
import { FieldSelect } from '@/components/FieldSelect';
import { SlideIn } from '@/components/SlideIn';
import {
  convertArrayToOptions,
  getDisplayLabel,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { getAPICall } from '@/services/apiService';
import { OptionsListPayload } from '@/services/apiService/Schema/OptionsSchema';
import { LogisticRequestDataColumn } from '@/services/logistics/request/schema';
import {
  useLogisticsRequestIndex,
  useLogisticsRequestList,
} from '@/services/logistics/request/services';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type QueryData = {
  status: boolean;
  items?: Record<string, string | number>;
};

interface SearchBarProps {
  onSearchFinished: (response: any, columns: any) => void;
  setModuleLoading: (loaderStatus: boolean) => void;
  additionalParams?: any;
  existingPRFQ?: number;
  onPreviewClicked?: (data: any) => void;
  onPRFQChanged?: (data: any) => void;
  isModal: boolean;
  resetTrigger?: boolean;
}

export const LRSearch: React.FC<SearchBarProps> = ({
  onSearchFinished,
  setModuleLoading,
  additionalParams,
  existingPRFQ,
  onPreviewClicked,
  onPRFQChanged,
  isModal,
  resetTrigger,
}) => {
  const navigate = useNavigate();
  const initialFormData = {
    logistic_request_id: '',
    ref_id: '',
    customer_id: '',
    receiver_customer_id: '',
    type: '',
    start_date: '',
    end_date: '',
    page: 1,
    is_closed: '',
  };
  const [resetKey, setResetKey] = useState(0);
  const [counter, setCounter] = useState(0);
  const queryClient = useQueryClient();
  const [minDate, setMinDate] = useState<any>(null);
  const [maxDate, setMaxDate] = useState<any>(null);
  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const [refType, setRefType] = useState<string>('');
  const prevQueryParamsRef = useRef(queryParams);
  const typeOptions = [
    { value: 'po', label: 'PO' },
    { value: 'so', label: 'SO', isDisabled: true },
    { value: 'wo', label: 'WO' },
    { value: 'oe', label: 'OPEN' },
  ];

  const [loading, setLoading] = useState(true);

  const [selectedPRFQ, setSelectedPRFQ] = useState<number>(0);
  const [customerOptions, setCustomerOptions] = useState<any>([]);
  const [receiverOptions, setReciverOptions] = useState<any>([]);
  const [refOptions, setREFOptions] = useState<any>([]);
  const form = useForm({
    onValidSubmit: (values) => {
      console.log(values);
      // setQueryParams({ search: values });
    },
  });
  const lrList: UseQueryResult<QueryData, unknown> = useLogisticsRequestList();
  const lrOptions = transformToSelectOptions(lrList.data);
  const [refResetKey, setRefResetKey] = useState(0);

  const toggleItem = (item: any) => {
    console.log(item);
    setSelectedPRFQ(item);
    setColumns(tableColumns);
  };

  const getBulkCustomersList = async (customers: any, receiver?: boolean) => {
    try {
      const response = await getAPICall(
        endPoints.bulk.customer_list_by_customer_id_bulk,
        OptionsListPayload,
        { customer_ids: customers }
      );
      const options = transformToSelectOptions(response);
      if (receiver === true) {
        setReciverOptions(options);
      } else {
        setCustomerOptions(options);
      }
    } catch (err) {
      setLoading(false);
      setModuleLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    const hasQueryParamsChanged = Object.keys(queryParams).some(
      (key) => queryParams[key] !== prevQueryParamsRef.current[key]
    );

    if (hasQueryParamsChanged) {
      setLoading(true);
      setModuleLoading(true);
      setCounter((prevKey) => prevKey + 1);
      prevQueryParamsRef.current = queryParams;
      queryClient.invalidateQueries('purchaseOrderIndex');
      if (queryParams?.logistic_request_id) {
        setColumnOrder('lrId');
      } else if (queryParams?.customer_id) {
        setColumnOrder('shipperName');
      } else if (queryParams?.receiver_customer_id) {
        setColumnOrder('receiverName');
      } else if (queryParams?.ref_id || queryParams?.type) {
        setColumnOrder('refType');
      } else if (queryParams?.start_date || queryParams?.end_date) {
        setColumnOrder('createdAt');
      } else {
        setColumnOrder('lrId');
      }
    } else {
      setColumnOrder('lrId');
    }
    console.log(queryParams);
  }, [queryParams]);

  useEffect(() => {
    console.log(isModal);
  }, [isModal]);

  useEffect(() => {
    console.log(refType);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      type: refType ?? '',
      ref_id: '',
      page: 1,
    }));
    form.setValues({
      [`ref_id`]: '',
    });
  }, [refType]);

  useEffect(() => {
    const updatedParams = {
      ...queryParams,
      ...additionalParams,
    };
    setQueryParams(updatedParams);
  }, [additionalParams]);

  useEffect(() => {
    setSelectedPRFQ(0);
    setColumns(tableColumns);
  }, [resetTrigger]);

  useEffect(() => {
    if (existingPRFQ) {
      setSelectedPRFQ(existingPRFQ);
      setColumns(tableColumns);
    }
  }, [existingPRFQ]);

  const triggerPreview = (previewData: any) => {
    if (onPreviewClicked) {
      onPreviewClicked(previewData);
    }
  };

  const LRItems = useLogisticsRequestIndex(queryParams);
  const columnHelper = createColumnHelper<LogisticRequestDataColumn>();
  const [columnOrder, setColumnOrder] = useState('lrId');

  const tableColumns = [
    ...(columnOrder === 'lrId'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = LRItems?.data?.current_page ?? 1;
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
            header: 'LR No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),
          columnHelper.accessor('purchase_orders', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((item) => item?.purchase_order_id))
              );
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>PO#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF No',
            id: 'ref_no',
          }),

          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created At',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'created_at',
            },
            id: 'created_at',
          }),
          columnHelper.accessor('packages', {
            cell: (info) => info.getValue().length,
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('pcs', {
            cell: (info) => info.getValue(),
            header: 'Tot No PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'total_pcs',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'due_date',
          }),
          columnHelper.accessor('volumetric_weight', {
            cell: (info) => info.getValue() + ' KG',
            header: 'Volum Weight',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_volumetric_weight',
            },
            id: 'total_volumetric_weight',
          }),
          columnHelper.accessor('customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Shipper Name',
          }),
          columnHelper.accessor('receiver_customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Receiver Name',
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
                <HStack spacing={4} gap=".5rem" justify={'flex-end'}>
                  {isModal === false && (
                    <React.Fragment>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => triggerPreview(info.row.original)}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/logistics/request/${info.row.original.id}/edit`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedPRFQ === info.row.original.id ? 'red' : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedPRFQ === info.row.original.id ? (
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
    ...(columnOrder === 'shipperName'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = LRItems?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Shipper Name',
          }),
          columnHelper.accessor('receiver_customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Receiver Name',
          }),
           columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'LR No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),
          columnHelper.accessor('purchase_orders', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((item) => item?.purchase_order_id))
              );
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>PO#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF No',
            id: 'ref_no',
          }),

          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created At',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'created_at',
            },
            id: 'created_at',
          }),
          columnHelper.accessor('packages', {
            cell: (info) => info.getValue().length,
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('pcs', {
            cell: (info) => info.getValue(),
            header: 'Tot No PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'total_pcs',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'due_date',
          }),
          columnHelper.accessor('volumetric_weight', {
            cell: (info) => info.getValue() + ' KG',
            header: 'Volum Weight',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_volumetric_weight',
            },
            id: 'total_volumetric_weight',
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
                <HStack spacing={4} gap=".5rem" justify={'flex-end'}>
                  {isModal === false && (
                    <React.Fragment>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => triggerPreview(info.row.original)}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/logistics/request/${info.row.original.id}/edit`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedPRFQ === info.row.original.id ? 'red' : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedPRFQ === info.row.original.id ? (
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
    ...(columnOrder === 'receiverName'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = LRItems?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('receiver_customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Receiver Name',
          }),
          columnHelper.accessor('customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Shipper Name',
          }),
           columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'LR No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),
          columnHelper.accessor('purchase_orders', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((item) => item?.purchase_order_id))
              );
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>PO#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF No',
            id: 'ref_no',
          }),

          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created At',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'created_at',
            },
            id: 'created_at',
          }),
          columnHelper.accessor('packages', {
            cell: (info) => info.getValue().length,
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('pcs', {
            cell: (info) => info.getValue(),
            header: 'Tot No PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'total_pcs',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'due_date',
          }),
          columnHelper.accessor('volumetric_weight', {
            cell: (info) => info.getValue() + ' KG',
            header: 'Volum Weight',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_volumetric_weight',
            },
            id: 'total_volumetric_weight',
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
                <HStack spacing={4} gap=".5rem" justify={'flex-end'}>
                  {isModal === false && (
                    <React.Fragment>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => triggerPreview(info.row.original)}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/logistics/request/${info.row.original.id}/edit`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedPRFQ === info.row.original.id ? 'red' : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedPRFQ === info.row.original.id ? (
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
    ...(columnOrder === 'refType'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = LRItems?.data?.current_page ?? 1;
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
            cell: (info) =>
              getDisplayLabel(typeOptions, info.getValue(), 'Type'),
            header: 'Ref Type',
          }),
          columnHelper.accessor('purchase_orders', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((item) => item?.purchase_order_id))
              );
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>PO#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF No',
            id: 'ref_no',
          }),

           columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'LR No',
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
              sortParam: 'created_at',
            },
            id: 'created_at',
          }),
          columnHelper.accessor('packages', {
            cell: (info) => info.getValue().length,
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('pcs', {
            cell: (info) => info.getValue(),
            header: 'Tot No PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'total_pcs',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'due_date',
          }),
          columnHelper.accessor('volumetric_weight', {
            cell: (info) => info.getValue() + ' KG',
            header: 'Volum Weight',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_volumetric_weight',
            },
            id: 'total_volumetric_weight',
          }),
          columnHelper.accessor('customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Shipper Name',
          }),
          columnHelper.accessor('receiver_customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Receiver Name',
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
                <HStack spacing={4} gap=".5rem" justify={'flex-end'}>
                  {isModal === false && (
                    <React.Fragment>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => triggerPreview(info.row.original)}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/logistics/request/${info.row.original.id}/edit`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedPRFQ === info.row.original.id ? 'red' : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedPRFQ === info.row.original.id ? (
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
              const currentPage = LRItems?.data?.current_page ?? 1;
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
              sortParam: 'created_at',
            },
            id: 'created_at',
          }),
           columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'LR No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),
          columnHelper.accessor('purchase_orders', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((item) => item?.purchase_order_id))
              );
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>PO#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF No',
            id: 'ref_no',
          }),
          columnHelper.accessor('packages', {
            cell: (info) => info.getValue().length,
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('pcs', {
            cell: (info) => info.getValue(),
            header: 'Tot No PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'total_pcs',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'due_date',
          }),
          columnHelper.accessor('volumetric_weight', {
            cell: (info) => info.getValue() + ' KG',
            header: 'Volum Weight',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_volumetric_weight',
            },
            id: 'total_volumetric_weight',
          }),
          columnHelper.accessor('customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Shipper Name',
          }),
          columnHelper.accessor('receiver_customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Receiver Name',
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
                <HStack spacing={4} gap=".5rem" justify={'flex-end'}>
                  {isModal === false && (
                    <React.Fragment>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => triggerPreview(info.row.original)}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/logistics/request/${info.row.original.id}/edit`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedPRFQ === info.row.original.id ? 'red' : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedPRFQ === info.row.original.id ? (
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
    ...(columnOrder === 'purchaseOrder'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = LRItems?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('purchase_orders', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((item) => item?.purchase_order_id))
              );
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>PO#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF No',
            id: 'ref_no',
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created At',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'created_at',
            },
            id: 'created_at',
          }),
           columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'LR No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),
          columnHelper.accessor('packages', {
            cell: (info) => info.getValue().length,
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('pcs', {
            cell: (info) => info.getValue(),
            header: 'Tot No PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'total_pcs',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'due_date',
          }),
          columnHelper.accessor('volumetric_weight', {
            cell: (info) => info.getValue() + ' KG',
            header: 'Volum Weight',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_volumetric_weight',
            },
            id: 'total_volumetric_weight',
          }),
          columnHelper.accessor('customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Shipper Name',
          }),
          columnHelper.accessor('receiver_customer', {
            cell: (info) => info.getValue().business_name,
            header: 'Receiver Name',
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
                <HStack spacing={4} gap=".5rem" justify={'flex-end'}>
                  {isModal === false && (
                    <React.Fragment>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => triggerPreview(info.row.original)}
                      />
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/logistics/request/${info.row.original.id}/edit`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedPRFQ === info.row.original.id ? 'red' : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedPRFQ === info.row.original.id ? (
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
    if (LRItems?.data) {
      setLoading(false);
      onSearchFinished(LRItems?.data, columns);
    }
    console.log(LRItems?.data);
    if (LRItems?.data?.customer_ids) {
      if (LRItems?.data?.customer_ids.length > 0) {
        getBulkCustomersList(LRItems?.data?.customer_ids);
      }
    }
    if (LRItems?.data?.receiver_customer_ids) {
      if (LRItems?.data?.receiver_customer_ids.length > 0) {
        getBulkCustomersList(LRItems?.data?.receiver_customer_ids, true);
      }
    }
    if (LRItems?.data?.min_date) {
      setMinDate(LRItems?.data?.min_date);
    }
    if (LRItems?.data?.max_date) {
      setMaxDate(LRItems?.data?.max_date);
    }
    if (LRItems?.data?.purchase_order_ids) {
      if (refType === 'po') {
        const sortedPOs = LRItems?.data?.purchase_order_ids?.sort(
          (a, b) => a - b
        );
        const options = convertArrayToOptions(sortedPOs);
        setREFOptions(options);
      }
    }
    if (LRItems?.data?.purchase_request_ids) {
      if (refType === 'oe') {
        const sortedPRs = LRItems?.data?.purchase_request_ids?.sort(
          (a, b) => a - b
        );
        const options = convertArrayToOptions(sortedPRs, 'OE');
        setREFOptions(options);
      }
    }
  }, [LRItems?.data]);

  useEffect(() => {
    setColumns(tableColumns);
  }, [columnOrder]);

  useEffect(() => {
    if (LRItems?.data && columns) {
      onSearchFinished(LRItems?.data, tableColumns);
      if (onPRFQChanged) {
        onPRFQChanged(selectedPRFQ);
      }
    }
  }, [LRItems?.data, columns]);

  const handleDateRangeClear = () => {
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      start_date: '',
      end_date: '',
      page: 1,
    }));
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
                  label={'LR No'}
                  name={'logistic_request_id'}
                  key={`logistic_request_id_${resetKey}`}
                  options={lrOptions ?? []}
                  isClearable={true}
                  isDisabled={loading}
                  selectProps={{
                    noOptionsMessage: () => 'No PO found',
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
                      logistic_request_id: value ?? '',
                      ref_id: '',
                      type: '',
                      customer_id: '',
                      receiver_customer_id: '',
                      page: 1,
                    }));
                    triggerDateClear();
                    form.setValues({
                      [`type`]: '',
                      [`customer_id`]: '',
                      ['receiver_customer_id']: '',
                      [`date_range`]: '',
                    });
                  }}
                  size={'sm'}
                  menuPortalTarget={document.body}
                />

                <FieldSelect
                  label="Shipper"
                  name="customer_id"
                  key={`customer_id_${resetKey}`}
                  placeholder="Select..."
                  options={customerOptions}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      customer_id: value ?? '',
                    }));
                  }}
                  selectProps={{
                    noOptionsMessage: () => 'No Shipper found',
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                  isClearable={true}
                  size="sm"
                  isDisabled={queryParams?.logistic_request_id || loading}
                />

                <FieldSelect
                  label="Receiver"
                  name="receiver_customer_id"
                  key={`receiver_customer_id_${resetKey}`}
                  placeholder="Select..."
                  options={receiverOptions}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      receiver_customer_id: value ?? '',
                    }));
                  }}
                  selectProps={{
                    noOptionsMessage: () => 'No Receiver found',
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                  isClearable={true}
                  size="sm"
                  isDisabled={queryParams?.logistic_request_id || loading}
                />
              </Stack>

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
                  label={'Ref Type'}
                  key={`type_${resetKey}`}
                  name={'type'}
                  placeholder="Select"
                  options={typeOptions}
                  onValueChange={(value) => {
                    console.log('Ref value', value);
                    setRefResetKey((prevKey) => prevKey + 1);
                    setRefType(value || '');
                  }}
                  selectProps={{
                    noOptionsMessage: () => 'No Type found',
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                    isOptionDisabled: (option) => !!option.isDisabled,
                  }}
                  isClearable={true}
                  size={'sm'}
                  menuPortalTarget={document.body}
                  isDisabled={queryParams?.logistic_request_id || loading}
                  sx={{ mb: isModal === true ? '2' : '0' }}
                />
                <FieldSelect
                  label={'REF No'}
                  name={'ref_id'}
                  key={`ref_id_${resetKey}_${refResetKey}`}
                  placeholder="Select"
                  options={refOptions ?? []}
                  isClearable={true}
                  size={'sm'}
                  menuPortalTarget={document.body}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      ref_id: value ?? '',
                      page: 1,
                    }));
                    form.setValues({
                      [`date_range`]: '',
                    });
                  }}
                  selectProps={{
                    noOptionsMessage: () => 'No REF No found',
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                  sx={{ mb: isModal === true ? '2' : '0' }}
                  isDisabled={
                    queryParams?.logistic_request_id ||
                    !queryParams?.type ||
                    queryParams?.type === 'wo' ||
                    queryParams?.type === 'so' ||
                    loading
                  }
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
                      setQueryParams((prevState: TODO) => ({
                        ...prevState,
                        start_date: value.from
                          ? format(new Date(value.from), 'yyyy-MM-dd')
                          : '',
                        end_date: value.to
                          ? format(new Date(value.to), 'yyyy-MM-dd')
                          : '',
                        page: 1,
                      }));
                    }
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                  onClear={handleDateRangeClear}
                  dateRangePickerProps={{
                    inputProps: {
                      isDisabled:
                        queryParams?.logistic_request_id !== '' ||
                        loading ||
                        (queryParams?.ref_id !== '' &&
                          queryParams?.ref_id !== null),
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
                  setResetKey((prevKey) => prevKey + 1);
                  setQueryParams(initialFormData);
                  form.setValues({
                    [`type`]: '',
                    [`ref_id`]: '',
                    [`date_range`]: '',
                    [`logistic_request_id`]: '',
                  });
                  triggerDateClear();
                  queryClient.invalidateQueries('purchaseOrderIndex');
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

export default LRSearch;
