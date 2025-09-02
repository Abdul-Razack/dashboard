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

import CurrencyDisplay from '@/components/CurrencyDisplay';
import { FieldDateRangePicker } from '@/components/FieldDateRangePicker';
import { FieldSelect } from '@/components/FieldSelect';
import { SlideIn } from '@/components/SlideIn';
import {
  convertArrayToOptions,
  getDisplayLabel,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { getAPICall } from '@/services/apiService';
import {
  DataColumn,
  IndexPayload,
} from '@/services/apiService/Schema/LogisticsOrderSchema';
import { OptionsListPayload } from '@/services/apiService/Schema/OptionsSchema';
import { useLogisticOrderList } from '@/services/logistics/order/services';

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

export const LogisticsOrderSearch: React.FC<SearchBarProps> = ({
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
    ref_id: '',
    customer_id: '',
    receiver_customer_id: '',
    lrfq_customer_id: '',
    logistic_order_id: '',
    type: '',
    start_date: '',
    end_date: '',
    page: 1,
    is_closed: '',
  };

  const typeOptions = [
    { value: 'po', label: 'PO' },
    { value: 'so', label: 'SO', isDisabled: true },
    { value: 'wo', label: 'WO' },
    { value: 'oe', label: 'OPEN' },
  ];
  const [resetKey, setResetKey] = useState(0);
  const queryClient = useQueryClient();
  const [minDate, setMinDate] = useState<any>(null);
  const [maxDate, setMaxDate] = useState<any>(null);
  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const prevQueryParamsRef = useRef(queryParams);
  const [selectedPRFQ, setSelectedPRFQ] = useState<number>(0);
  const [customerOptions, setCustomerOptions] = useState<any>([]);
  const [receiverOptions, setReciverOptions] = useState<any>([]);
  const [listItems, setListItems] = useState<any>({});
  const [logisticsVendorOptios, setLogisticsVendorOptios] = useState<any>([]);
  const [refOptions, setREFOptions] = useState<any>([]);

  const [refResetKey, setRefResetKey] = useState(0);
  const [refType, setRefType] = useState<string>('');

  const form = useForm({
    onValidSubmit: (values) => {
      console.log(values);
      // setQueryParams({ search: values });
    },
  });
  const loList: UseQueryResult<QueryData, unknown> = useLogisticOrderList();
  const loOptions = transformToSelectOptions(loList.data);

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
      getListItems();
      prevQueryParamsRef.current = queryParams;
      queryClient.invalidateQueries('purchaseOrderIndex');
      if (queryParams?.logistic_order_id) {
        setColumnOrder('logQuoId');
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
        setColumnOrder('logQuoId');
      }
    } else {
      setColumnOrder('logQuoId');
    }
    console.log(queryParams);
  }, [queryParams]);

  const getListItems = async () => {
    try {
      const data = await getAPICall(
        endPoints.index.logistic_order,
        IndexPayload,
        queryParams
      );
      console.log(data);
      setListItems(data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getListItems();
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
  const [columnOrder, setColumnOrder] = useState('logQuoId');
  const tableColumns = [
    ...(columnOrder === 'logQuoId'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listItems?.data?.current_page ?? 1;
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
            header: 'LO No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'LONo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('logistic_quotation_id', {
            cell: (info) => info.getValue(),
            header: 'Q.No',
            id: 'LQNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('lrfq', {
            cell: (info) => {
              const LRFQInfo = info.getValue();
              return LRFQInfo?.id || 'N/A';
            },
            header: 'LRFQ No',
            id: 'LRFQNo',
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
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.customer?.business_name || 'N/A';
            },
            header: 'Log Vendor Name',
            id: 'LVenName',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.customer?.code || 'N/A';
            },
            header: 'Vendor Code',
            id: 'LVenCode',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.quotation_number || 'N/A';
            },
            header: 'LVQ No',
            id: 'LVQNo',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.quotation_date
                ? format(new Date(QInfo?.quotation_date), 'dd/MM/yy')
                : 'N/A';
            },
            header: 'LQuo. Date',
            id: 'LVQDate',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.expiry_date
                ? format(new Date(QInfo?.expiry_date), 'dd/MM/yy')
                : 'N/A';
            },
            header: 'Quo. Exp. Date', meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'QEXDate',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.packages?.length || 0;
            },
            header: 'Tot No of Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages'
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.pcs || 0;
            },
            header: 'Tot No of PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'totalPcs',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.is_dg ? 'DG' : 'NON-DG';
            },
            header: 'Goods Type',
            id: 'GoodsType',
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
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return (
                <React.Fragment>
                  <CurrencyDisplay
                    currencyId={QInfo?.currency_id?.toString() ?? ''}
                  />
                  <Text as="span" ml={1}>
                    {QInfo?.price || 0}
                  </Text>
                </React.Fragment>
              );
            },
            header: 'LO Value',
            id: 'LOValue',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.is_closed === true ? 'Closed' : 'Open';
            },
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
              const currentPage = listItems?.data?.current_page ?? 1;
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
          columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'LO No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'LONo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('logistic_quotation_id', {
            cell: (info) => info.getValue(),
            header: 'Q.No',
            id: 'LQNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('lrfq', {
            cell: (info) => {
              const LRFQInfo = info.getValue();
              return LRFQInfo?.id || 'N/A';
            },
            header: 'LRFQ No',
            id: 'LRFQNo',
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
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.customer?.business_name || 'N/A';
            },
            header: 'Log Vendor Name',
            id: 'LVenName',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.customer?.code || 'N/A';
            },
            header: 'Vendor Code',
            id: 'LVenCode',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.quotation_number || 'N/A';
            },
            header: 'LVQ No',
            id: 'LVQNo',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.quotation_date
                ? format(new Date(QInfo?.quotation_date), 'dd/MM/yy')
                : 'N/A';
            },
            header: 'LQuo. Date',
            id: 'LVQDate',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.expiry_date
                ? format(new Date(QInfo?.expiry_date), 'dd/MM/yy')
                : 'N/A';
            },
            header: 'Quo. Exp. Date', meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'QEXDate',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.packages?.length || 0;
            },
            header: 'Tot No of Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages'
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.pcs || 0;
            },
            header: 'Tot No of PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'totalPcs',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.is_dg ? 'DG' : 'NON-DG';
            },
            header: 'Goods Type',
            id: 'GoodsType',
          }),

          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return (
                <React.Fragment>
                  <CurrencyDisplay
                    currencyId={QInfo?.currency_id?.toString() ?? ''}
                  />
                  <Text as="span" ml={1}>
                    {QInfo?.price || 0}
                  </Text>
                </React.Fragment>
              );
            },
            header: 'LO Value',
            id: 'LOValue',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.is_closed === true ? 'Closed' : 'Open';
            },
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
              const currentPage = listItems?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.customer?.business_name || 'N/A';
            },
            header: 'Log Vendor Name',
            id: 'LVenName',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.customer?.code || 'N/A';
            },
            header: 'Vendor Code',
            id: 'LVenCode',
          }),
          columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'LO No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'LONo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('logistic_quotation_id', {
            cell: (info) => info.getValue(),
            header: 'Q.No',
            id: 'LQNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('lrfq', {
            cell: (info) => {
              const LRFQInfo = info.getValue();
              return LRFQInfo?.id || 'N/A';
            },
            header: 'LRFQ No',
            id: 'LRFQNo',
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

          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.quotation_number || 'N/A';
            },
            header: 'LVQ No',
            id: 'LVQNo',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.quotation_date
                ? format(new Date(QInfo?.quotation_date), 'dd/MM/yy')
                : 'N/A';
            },
            header: 'LQuo. Date',
            id: 'LVQDate',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.expiry_date
                ? format(new Date(QInfo?.expiry_date), 'dd/MM/yy')
                : 'N/A';
            },
            header: 'Quo. Exp. Date', meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'QEXDate',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.packages?.length || 0;
            },
            header: 'Tot No of Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages'
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.pcs || 0;
            },
            header: 'Tot No of PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'totalPcs',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.is_dg ? 'DG' : 'NON-DG';
            },
            header: 'Goods Type',
            id: 'GoodsType',
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
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return (
                <React.Fragment>
                  <CurrencyDisplay
                    currencyId={QInfo?.currency_id?.toString() ?? ''}
                  />
                  <Text as="span" ml={1}>
                    {QInfo?.price || 0}
                  </Text>
                </React.Fragment>
              );
            },
            header: 'LO Value',
            id: 'LOValue',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.is_closed === true ? 'Closed' : 'Open';
            },
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
              const currentPage = listItems?.data?.current_page ?? 1;
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
          columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'LO No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'LONo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('logistic_quotation_id', {
            cell: (info) => info.getValue(),
            header: 'Q.No',
            id: 'LQNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('lrfq', {
            cell: (info) => {
              const LRFQInfo = info.getValue();
              return LRFQInfo?.id || 'N/A';
            },
            header: 'LRFQ No',
            id: 'LRFQNo',
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
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.customer?.business_name || 'N/A';
            },
            header: 'Log Vendor Name',
            id: 'LVenName',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.customer?.code || 'N/A';
            },
            header: 'Vendor Code',
            id: 'LVenCode',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.quotation_number || 'N/A';
            },
            header: 'LVQ No',
            id: 'LVQNo',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.quotation_date
                ? format(new Date(QInfo?.quotation_date), 'dd/MM/yy')
                : 'N/A';
            },
            header: 'LQuo. Date',
            id: 'LVQDate',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.expiry_date
                ? format(new Date(QInfo?.expiry_date), 'dd/MM/yy')
                : 'N/A';
            },
            header: 'Quo. Exp. Date', meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'QEXDate',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.packages?.length || 0;
            },
            header: 'Tot No of Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages'
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.pcs || 0;
            },
            header: 'Tot No of PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'totalPcs',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.is_dg ? 'DG' : 'NON-DG';
            },
            header: 'Goods Type',
            id: 'GoodsType',
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
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return (
                <React.Fragment>
                  <CurrencyDisplay
                    currencyId={QInfo?.currency_id?.toString() ?? ''}
                  />
                  <Text as="span" ml={1}>
                    {QInfo?.price || 0}
                  </Text>
                </React.Fragment>
              );
            },
            header: 'LO Value',
            id: 'LOValue',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.is_closed === true ? 'Closed' : 'Open';
            },
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
              const currentPage = listItems?.data?.current_page ?? 1;
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
            header: 'LO No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
            id: 'LONo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('logistic_quotation_id', {
            cell: (info) => info.getValue(),
            header: 'Q.No',
            id: 'LQNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('lrfq', {
            cell: (info) => {
              const LRFQInfo = info.getValue();
              return LRFQInfo?.id || 'N/A';
            },
            header: 'LRFQ No',
            id: 'LRFQNo',
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

          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.customer?.business_name || 'N/A';
            },
            header: 'Log Vendor Name',
            id: 'LVenName',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.customer?.code || 'N/A';
            },
            header: 'Vendor Code',
            id: 'LVenCode',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.quotation_number || 'N/A';
            },
            header: 'LVQ No',
            id: 'LVQNo',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.quotation_date
                ? format(new Date(QInfo?.quotation_date), 'dd/MM/yy')
                : 'N/A';
            },
            header: 'LQuo. Date',
            id: 'LVQDate',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.expiry_date
                ? format(new Date(QInfo?.expiry_date), 'dd/MM/yy')
                : 'N/A';
            },
            header: 'Quo. Exp. Date', meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'due_date',
            },
            id: 'QEXDate',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.packages?.length || 0;
            },
            header: 'Tot No of Pkgs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_packages',
            },
            id: 'totalPackages'
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.pcs || 0;
            },
            header: 'Tot No of PCs',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_pcs',
            },
            id: 'totalPcs',
          }),
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return QInfo?.is_dg ? 'DG' : 'NON-DG';
            },
            header: 'Goods Type',
            id: 'GoodsType',
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
          columnHelper.accessor('logistic_quotation', {
            cell: (info) => {
              const QInfo = info.getValue();
              return (
                <React.Fragment>
                  <CurrencyDisplay
                    currencyId={QInfo?.currency_id?.toString() ?? ''}
                  />
                  <Text as="span" ml={1}>
                    {QInfo?.price || 0}
                  </Text>
                </React.Fragment>
              );
            },
            header: 'LO Value',
            id: 'LOValue',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('logistic_request', {
            cell: (info) => {
              const logisticRequest = info.getValue();
              return logisticRequest?.is_closed === true ? 'Closed' : 'Open';
            },
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

  useEffect(() => {
    if (listItems?.data) {
      onSearchFinished(listItems, columns);
    }
    console.log(listItems);
    if (listItems?.customer_ids) {
      if (listItems?.customer_ids.length > 0) {
        getBulkCustomersList(listItems?.customer_ids, 'customer');
      }
    }
    if (listItems?.receiver_customer_ids) {
      if (listItems?.receiver_customer_ids.length > 0) {
        getBulkCustomersList(listItems?.receiver_customer_ids, 'receiver');
      }
    }
    if (listItems?.lrfq_customer_ids) {
      if (listItems?.lrfq_customer_ids.length > 0) {
        getBulkCustomersList(listItems?.lrfq_customer_ids, 'vendor');
      }
    }
    if (listItems?.min_date) {
      setMinDate(listItems?.min_date);
    }
    if (listItems?.max_date) {
      setMaxDate(listItems?.max_date);
    }
    if (listItems?.purchase_order_ids) {
      console;
      if (refType === 'po') {
        const sortedPOs = listItems?.purchase_order_ids?.sort(
          (a: any, b: any) => a - b
        );
        const options = convertArrayToOptions(sortedPOs);
        setREFOptions(options);
      }
    }
    if (listItems?.purchase_request_ids) {
      if (refType === 'oe') {
        const sortedPRs = listItems?.purchase_request_ids?.sort(
          (a: any, b: any) => a - b
        );
        const options = convertArrayToOptions(sortedPRs, 'OE');
        setREFOptions(options);
      }
    }
  }, [listItems?.data]);

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
    setColumns(tableColumns);
  }, [columnOrder]);

  useEffect(() => {
    if (listItems?.data && columns) {
      onSearchFinished(listItems, tableColumns);
      if (onPRFQChanged) {
        onPRFQChanged(selectedPRFQ);
      }
    }
  }, [listItems?.data, columns]);

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
                  label={'LO No'}
                  name={'logistic_order_id'}
                  key={`logistic_order_id_${resetKey}`}
                  options={loOptions ?? []}
                  isClearable={true}
                  selectProps={{
                    noOptionsMessage: () => 'No Quotation found',
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
                      logistic_order_id: value ?? '',
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
                  isDisabled={queryParams?.logistic_order_id}
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
                  isDisabled={queryParams?.logistic_order_id}
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
                  isDisabled={queryParams?.logistic_order_id}
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
                  isDisabled={queryParams?.logistic_order_id}
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
                      [`purchase_request_id`]: '',
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
                  isDisabled={queryParams?.logistic_order_id}
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
                        queryParams?.logistic_order_id !== '' ||
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
                    [`logistic_order_id`]: '',
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

export default LogisticsOrderSearch;
