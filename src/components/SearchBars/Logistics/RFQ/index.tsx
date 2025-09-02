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
import useCustomerName from '@/hooks/useCustomerName';
import { getAPICall } from '@/services/apiService';
import {
  DataColumn,
  IndexPayload,
} from '@/services/apiService/Schema/LRFQSchema';
import { OptionsListPayload } from '@/services/apiService/Schema/OptionsSchema';
import { useLRFQList } from '@/services/logistics/lrfq/services';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type QueryData = {
  status: boolean;
  items?: Record<string, string | number>;
};

interface SearchBarProps {
  onSearchFinished: (response: any, columns: any) => void;
  setModuleLoading: (response: boolean) => void;
  additionalParams?: any;
  existingPRFQ?: number;
  onPreviewClicked?: (data: any) => void;
  onPRFQChanged?: (data: any) => void;
  isModal: boolean;
  resetTrigger?: boolean;
}

export const LRFQSearch: React.FC<SearchBarProps> = ({
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

  const typeOptions = [
    { value: 'po', label: 'PO' },
    { value: 'so', label: 'SO', isDisabled: true },
    { value: 'wo', label: 'WO' },
    { value: 'oe', label: 'OPEN' },
  ];
  const initialFormData = {
    lrfq_id: '',
    ref_id: '',
    customer_id: '',
    lrfq_customer_id: '',
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
  const prevQueryParamsRef = useRef(queryParams);
  const [selectedPRFQ, setSelectedPRFQ] = useState<number>(0);
  const [customerOptions, setCustomerOptions] = useState<any>([]);
  const [receiverOptions, setReciverOptions] = useState<any>([]);
  const [logisticsVendorOptios, setLogisticsVendorOptios] = useState<any>([]);
  const [lrItems, setlrItems] = useState<any>({});
  const form = useForm({
    onValidSubmit: (values) => {
      console.log(values);
      // setQueryParams({ search: values });
    },
  });
  const lrfqList: UseQueryResult<QueryData, unknown> = useLRFQList();
  const lrfqOptions = transformToSelectOptions(lrfqList.data);
  const [refResetKey, setRefResetKey] = useState(0);
  const [refOptions, setREFOptions] = useState<any>([]);
  const toggleItem = (item: any) => {
    console.log(item);
    setSelectedPRFQ(item);
    setColumns(tableColumns);
  };

  const getBulkCustomersList = async (customers: any, type: string) => {
    try {
      const response = await getAPICall(
        endPoints.bulk.customer_list_by_customer_id_bulk,
        OptionsListPayload,
        { customer_ids: customers }
      );
      const options = transformToSelectOptions(response);
      if (type === 'receiver') {
        setReciverOptions(options);
      } else if (type === 'customer') {
        setCustomerOptions(options);
      } else if (type === 'vendor') {
        setLogisticsVendorOptios(options);
      }
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
      getLRFQItems();
      setCounter((prevKey) => prevKey + 1);
      prevQueryParamsRef.current = queryParams;
      queryClient.invalidateQueries('purchaseOrderIndex');
      if (queryParams?.lrfq_id) {
        setColumnOrder('lrfqId');
      } else if (queryParams?.customer_id) {
        setColumnOrder('shipperName');
      } else if (queryParams?.receiver_customer_id) {
        setColumnOrder('shipperName');
      } else if (queryParams?.lrfq_customer_id) {
        setColumnOrder('logisticsVendor');
      } else if (queryParams?.ref_id || queryParams?.type) {
        setColumnOrder('refType');
      } else if (queryParams?.start_date || queryParams?.end_date) {
        setColumnOrder('createdAt');
      } else {
        setColumnOrder('lrfqId');
      }
    } else {
      setColumnOrder('lrfqId');
    }
    console.log(queryParams);
  }, [queryParams]);

  const getLRFQItems = async () => {
    try {
      const data = await getAPICall(
        endPoints.index.lrfq,
        IndexPayload,
        queryParams
      );
      console.log(data);
      setlrItems(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getLRFQItems();
  }, []);

  useEffect(() => {
    console.log(isModal);
  }, [isModal]);

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

  const columnHelper = createColumnHelper<DataColumn>();
  const [columnOrder, setColumnOrder] = useState('lrfqId');

  const tableColumns = [
    ...(columnOrder === 'lrfqId'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = lrItems?.data?.current_page ?? 1;
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
            header: 'LRFQ No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),

          columnHelper.accessor('lr_customers', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(
                  info.getValue().map((item) => item?.logistic_request_id)
                )
              );
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return uniqueItems.length > 0 ? (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>LR#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              ) : (
                ' - '
              );
            },
            header: 'LR No',
          }),
          columnHelper.accessor('purchase_order_ids', {
            cell: (info) => {
              const items = info.getValue() || [];
              const uniqueItems = [...new Set(items)];
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}`}>
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
          columnHelper.accessor('lr_customers', {
            cell: (info) => info.getValue().length,
            header: 'Tot No of Vendors',
            id: 'totalVendors',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.packages?.length || 0;
            },
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.items?.length || 0;
            },
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.pcs || 0;
            },
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
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.customer?.business_name || 'N/A';
            },
            header: 'Shipper Name',
            id: 'shipper',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.receiver_customer?.business_name || 'N/A';
            },
            header: 'Receiver Name',
            id: 'receiver',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.user?.username || 'N/A';
            },
            header: 'Req User',
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'is_closed',
            },
            id: 'status',
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
                        isDisabled={true}
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
                        isDisabled={true}
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
              const currentPage = lrItems?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.customer?.business_name || 'N/A';
            },
            header: 'Shipper Name',
            id: 'shipper',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.receiver_customer?.business_name || 'N/A';
            },
            header: 'Receiver Name',
            id: 'receiver',
          }),
          columnHelper.accessor('lr_customers', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(
                  info.getValue().map((item) => item?.logistic_request_id)
                )
              );
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return uniqueItems.length > 0 ? (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>LR#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              ) : (
                ' - '
              );
            },
            header: 'LR No',
          }),
          columnHelper.accessor('purchase_order_ids', {
            cell: (info) => {
              const items = info.getValue() || [];
              const uniqueItems = [...new Set(items)];
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}`}>
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
          columnHelper.accessor('lr_customers', {
            cell: (info) => info.getValue().length,
            header: 'Tot No of Vendors',
            id: 'totalVendors',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.packages?.length || 0;
            },
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.items?.length || 0;
            },
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.pcs || 0;
            },
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

          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.user?.username || 'N/A';
            },
            header: 'Req User',
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'is_closed',
            },
            id: 'status',
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
                        isDisabled={true}
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
                        isDisabled={true}
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
              const currentPage = lrItems?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return (
                (logisticRequest?.type
                  ? getDisplayLabel(typeOptions, logisticRequest?.type, 'Type')
                  : 'N/A') || 'N/A'
              );
            },
            header: 'REF Type',
            id: 'ref_type',
          }),
          columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'LRFQ No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),

          columnHelper.accessor('lr_customers', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(
                  info.getValue().map((item) => item?.logistic_request_id)
                )
              );
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return uniqueItems.length > 0 ? (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>LR#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              ) : (
                ' - '
              );
            },
            header: 'LR No',
          }),
          columnHelper.accessor('purchase_order_ids', {
            cell: (info) => {
              const items = info.getValue() || [];
              const uniqueItems = [...new Set(items)];
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}`}>
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
          columnHelper.accessor('lr_customers', {
            cell: (info) => info.getValue().length,
            header: 'Tot No of Vendors',
            id: 'totalVendors',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.packages?.length || 0;
            },
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.items?.length || 0;
            },
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.pcs || 0;
            },
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
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.customer?.business_name || 'N/A';
            },
            header: 'Shipper Name',
            id: 'shipper',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.receiver_customer?.business_name || 'N/A';
            },
            header: 'Receiver Name',
            id: 'receiver',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.user?.username || 'N/A';
            },
            header: 'Req User',
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'is_closed',
            },
            id: 'status',
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
                        isDisabled={true}
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
                        isDisabled={true}
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
    ...(columnOrder === 'logisticsVendor'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = lrItems?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('lr_customers', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((item) => item?.customer_id))
              );
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return uniqueItems.length > 0 ? (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>{useCustomerName(id || 0)}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              ) : (
                ' - '
              );
            },
            header: 'Vendor Name',
            id: 'logVendor',
          }),
          columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'LRFQ No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),
          columnHelper.accessor('lr_customers', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(
                  info.getValue().map((item) => item?.logistic_request_id)
                )
              );
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return uniqueItems.length > 0 ? (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>LR#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              ) : (
                ' - '
              );
            },
            header: 'LR No',
          }),
          columnHelper.accessor('purchase_order_ids', {
            cell: (info) => {
              const items = info.getValue() || [];
              const uniqueItems = [...new Set(items)];
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}`}>
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
          columnHelper.accessor('lr_customers', {
            cell: (info) => info.getValue().length,
            header: 'Tot No of Vendors',
            id: 'totalVendors',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.packages?.length || 0;
            },
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.items?.length || 0;
            },
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.pcs || 0;
            },
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
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.customer?.business_name || 'N/A';
            },
            header: 'Shipper Name',
            id: 'shipper',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.receiver_customer?.business_name || 'N/A';
            },
            header: 'Receiver Name',
            id: 'receiver',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.user?.username || 'N/A';
            },
            header: 'Req User',
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'is_closed',
            },
            id: 'status',
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
                        isDisabled={true}
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
                        isDisabled={true}
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
              const currentPage = lrItems?.data?.current_page ?? 1;
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
            header: 'LRFQ No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'id',
          }),

          columnHelper.accessor('lr_customers', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(
                  info.getValue().map((item) => item?.logistic_request_id)
                )
              );
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return uniqueItems.length > 0 ? (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>LR#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              ) : (
                ' - '
              );
            },
            header: 'LR No',
          }),
          columnHelper.accessor('purchase_order_ids', {
            cell: (info) => {
              const items = info.getValue() || [];
              const uniqueItems = [...new Set(items)];
              if (uniqueItems.length === 0) {
                return <Text> ---- </Text>;
              }
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}`}>
                      <Text>PO#{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF No',
            id: 'ref_no',
          }),

          columnHelper.accessor('lr_customers', {
            cell: (info) => info.getValue().length,
            header: 'Tot No of Vendors',
            id: 'totalVendors',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.packages?.length || 0;
            },
            header: 'Tot Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.items?.length || 0;
            },
            header: 'Tot Itms',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_items',
            },
            id: 'totalItems',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.pcs || 0;
            },
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
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.customer?.business_name || 'N/A';
            },
            header: 'Shipper Name',
            id: 'shipper',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.receiver_customer?.business_name || 'N/A';
            },
            header: 'Receiver Name',
            id: 'receiver',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.user?.username || 'N/A';
            },
            header: 'Req User',
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'is_closed',
            },
            id: 'status',
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
                        isDisabled={true}
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
                        isDisabled={true}
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
  const [refType, setRefType] = useState<string>('');

  useEffect(() => {
    if (lrItems?.data) {
      onSearchFinished(lrItems, columns);
    }
    if (lrItems?.customer_ids) {
      if (lrItems?.customer_ids.length > 0) {
        getBulkCustomersList(lrItems?.customer_ids, 'customer');
      } else {
        //setReciverOptions([]);
      }
    }
    if (lrItems?.receiver_customer_ids) {
      if (lrItems?.receiver_customer_ids.length > 0) {
        getBulkCustomersList(lrItems?.receiver_customer_ids, 'receiver');
      } else {
        //setCustomerOptions([]);
      }
    }
    if (lrItems?.lrfq_customer_ids) {
      if (lrItems?.lrfq_customer_ids.length > 0) {
        getBulkCustomersList(lrItems?.lrfq_customer_ids, 'vendor');
      } else {
        //setLogisticsVendorOptios([]);
      }
    }
    if (lrItems?.min_date) {
      setMinDate(lrItems?.min_date);
    }
    if (lrItems?.max_date) {
      setMaxDate(lrItems?.max_date);
    }
    if (lrItems?.purchase_order_ids) {
      console;
      if (refType === 'po') {
        const sortedPOs = lrItems?.purchase_order_ids?.sort(
          (a: any, b: any) => a - b
        );
        const options = convertArrayToOptions(sortedPOs);
        setREFOptions(options);
      }
    }
    if (lrItems?.purchase_request_ids) {
      if (refType === 'oe') {
        const sortedPRs = lrItems?.purchase_request_ids?.sort(
          (a: any, b: any) => a - b
        );
        const options = convertArrayToOptions(sortedPRs, 'OE');
        setREFOptions(options);
      }
    }
  }, [lrItems?.data]);

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
    console.log(columnOrder);
    setColumns(tableColumns);
  }, [columnOrder]);

  useEffect(() => {
    if (lrItems?.data && columns) {
      onSearchFinished(lrItems, tableColumns);
      if (onPRFQChanged) {
        onPRFQChanged(selectedPRFQ);
      }
    }
  }, [lrItems?.data, columns]);

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
                  label={'LRFQ No'}
                  name={'lrfq_id'}
                  key={`lrfq_id_${resetKey}`}
                  options={lrfqOptions ?? []}
                  isClearable={true}
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
                      lrfq_id: value ?? '',
                      ref_id: '',
                      type: '',
                      customer_id: '',
                      receiver_customer_id: '',
                      lrfq_customer_id: '',
                      page: 1,
                    }));
                    triggerDateClear();
                    form.setValues({
                      [`type`]: '',
                      [`customer_id`]: '',
                      ['receiver_customer_id']: '',
                      ['lrfq_customer_id']: '',
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
                  isDisabled={queryParams?.lrfq_id}
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
                  isDisabled={queryParams?.lrfq_id}
                />

                <FieldSelect
                  label="Logistic Vendor"
                  name="lrfq_customer_id"
                  key={`lrfq_customer_id_${resetKey}`}
                  placeholder="Select..."
                  options={logisticsVendorOptios}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      lrfq_customer_id: value ?? '',
                    }));
                  }}
                  selectProps={{
                    noOptionsMessage: () => 'No Logistics Vendor found',
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                  isClearable={true}
                  size="sm"
                  isDisabled={queryParams?.lrfq_id}
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
                  isDisabled={queryParams?.lrfq_id}
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
                  isDisabled={queryParams?.lrfq_id}
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
                        queryParams?.lrfq_id !== '' ||
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
                    [`lrfq_id`]: '',
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

export default LRFQSearch;
