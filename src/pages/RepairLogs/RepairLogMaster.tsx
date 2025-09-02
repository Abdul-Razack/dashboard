import { useEffect, useRef, useState } from 'react';

import { EditIcon, ViewIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Stack,
  Tab,
  TabList,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';
import { HiRefresh } from 'react-icons/hi';
import { LuPlus } from 'react-icons/lu';
import { UseQueryResult, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/DataTable';
import {
  FieldCheckboxes,
  FieldCheckboxesItem,
} from '@/components/FieldCheckboxes';
import { FieldDateRangePicker } from '@/components/FieldDateRangePicker';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import PreviewPopup from '@/components/PreviewContents/RepairLogs';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { TableExport } from '@/components/TableExport';
import { useToastSuccess } from '@/components/Toast';
import {
  convertToOptions,
  exportTableAs,
  getDisplayLabel,
  transformPartsToSelectOptions,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { centerCell, centerText } from '@/helpers/tableColumnCenterHelper';
import { getAPICall } from '@/services/apiService';
import {
  PartNumberBulkPayload,
  PartNumberSearchPayload,
} from '@/services/apiService/Schema/PRSchema';
import { FetchCustomerInfo } from '@/services/master/services';
import { RepairLogDataColumn } from '@/services/repair-logs/schema';
import {
  useRepairLogIndex,
  useRepairLogList,
} from '@/services/repair-logs/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

export const RepairLogMaster = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const initialFormData = {
    repair_log_id: '',
    type: '',
    start_date: '',
    end_date: '',
    is_closed: '',
    part_number: '',
    is_bc: '',
    is_oh: '',
    is_rp: '',
    page: 1,
    per_page: itemsPerPage,
  };
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const navigate = useNavigate();
  const searchingPartNo = useRef(queryParams.part_number_id);
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [previewData, setPreviewData] = useState<TODO>({});
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const unitOfMeasureList = useUnitOfMeasureIndex();
  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const repairLogList: UseQueryResult<QueryData, unknown> = useRepairLogList();
  const repairLogOptions = transformToSelectOptions(repairLogList.data);
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('id');
  const [exportType, setExportType] = useState<'csv' | 'pdf' | undefined>(
    undefined
  );
  const [spareQueryParams, setSpareQueryParams] = useState<any>({});
  const [spareOptions, setSpareOptions] = useState<TODO>([]);
  const [partsLoading, setPartsLoading] = useState<boolean>(true);
  const [partNumber, setPartNumber] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const [minDate, setMinDate] = useState<any>(null);
  const [maxDate, setMaxDate] = useState<any>(null);
  const [columnOrder, setColumnOrder] = useState('rrNo');
  const prevQueryParamsRef = useRef(queryParams);
  const [loading, setLoading] = useState<boolean>(true);

  const form = useForm({
    onValidSubmit: (values) => {
      setQueryParams(values);
    },
  });

  const toastSuccess = useToastSuccess();
  const [exportStatus, triggerExport] = useState(false);
  const [exportStatusTrigger, setExportStatusTrigger] = useState(0);
  const typeOptions = [
    { value: 'sel', label: 'SEL' },
    { value: 'po', label: 'PO' },
    { value: 'project', label: 'Project' },
    { value: 'open', label: 'Open' },
    { value: 'so', label: 'SO' },
    { value: 'mr', label: 'MR' },
  ];

  const { data: downloadData, refetch: downloadDataReload } = useRepairLogIndex(
    {
      ...queryParams,
      per_page: '-1',
    },
    { enabled: false }
  );

  const { data: listData, isLoading: listLoading } =
    useRepairLogIndex(queryParams);
  const data = listData?.data ?? [];

  const handleCloseModal = () => {
    // queryClient.invalidateQueries('ContactDetails');
    // queryClient.invalidateQueries('shippingDetails');
    setLoading(false);
    setIsPreviewModalOpen(false);
    setPreviewData({});
  };

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  const exportTableData = (type: any) => {
    setExportType(type);
    triggerExport(true);
    setExportStatusTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    if (downloadData?.data && exportStatus) {
      triggerExport(false);
      exportTableAs(
        exportColumns,
        downloadData?.data,
        'repair-log-request',
        exportType
      );
      toastSuccess({
        title: 'Report exported Successfully!',
      });
      setExportType(undefined);
    }
  }, [downloadData?.data, exportStatusTrigger]);

  useEffect(() => {
    if (exportStatus) {
      downloadDataReload();
    }
  }, [exportStatusTrigger]);

  useEffect(() => {
    setLoading(true);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      is_closed: selectedTab === 0 ? '' : selectedTab === 1 ? 0 : 1,
      page: 1,
    }));
  }, [selectedTab]);

  const handleSortChange = (columnId: string, direction: 'asc' | 'desc') => {
    setSortDirection((prevDirection) => {
      return prevDirection !== direction ? direction : prevDirection;
    });

    setSortBy((prevSortBy) => {
      return prevSortBy !== columnId ? columnId : prevSortBy;
    });

    setQueryParams((prevParams: TODO) => {
      if (
        prevParams.sort_field !== columnId ||
        prevParams.sort_order !== direction
      ) {
        return {
          ...prevParams,
          sort_field: columnId,
          sort_order: direction,
          page: 1,
        };
      }
      return prevParams;
    });
  };

  const fetchCustomerInfo = FetchCustomerInfo();
  // const stripHtml = (html: string) => {
  //   const doc = new DOMParser().parseFromString(html, 'text/html');
  //   return doc.body.textContent || '';
  // };

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  const handleOpenPreview = async (rpDetails: any) => {
    console.log(rpDetails);
    setLoading(true);
    try {
      let customerDetails: any = {};
      if (rpDetails.customer_id > 0) {
        const customerInfo = await fetchCustomerInfo(rpDetails.customer_id);
        customerDetails = customerInfo?.data;
      }
      // Prepare preview data
      let popupVariables: any = {};
      popupVariables.typeOptions = typeOptions;
      popupVariables.conditionOptions = conditionOptions;
      popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
      popupVariables.priorityOptions = priorityOptions;
      popupVariables.customerInfo = customerDetails;
      Object.keys(rpDetails).forEach(function (key) {
        popupVariables[key] = rpDetails[key];
      });
      popupVariables.remarks = rpDetails.remarks;
      console.log(popupVariables);
      setPreviewData(popupVariables);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypePrefix = (type: string): string => {
    if (!type) return '';
    const lowerType = type.toLowerCase();
    if (lowerType === 'sel') return 'SEL';
    if (lowerType === 'open') return 'OP';
    if (lowerType === 'po') return 'PO';
    return type.slice(0, 2).toUpperCase(); // fallback: first 2 chars in uppercase
  };

  const columnHelper = createColumnHelper<RepairLogDataColumn>();

  const tableColumns = [
    ...(columnOrder === 'rrNo'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('id', {
            cell: (info) => centerCell('REL' + info.getValue()),
            meta: {
              sortable: true,
              sortParam: 'id',
            },
            header: () => centerText('RR No'),
            id: 'RRID',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) =>
              centerCell(format(new Date(info.getValue()), 'dd/MM/yy')),
            header: () => centerText('Created Date'),
            id: 'created_at',
            meta: {
              sortable: true,
              sortParam: 'created_at',
            },
          }),
          columnHelper.accessor('items', {
            cell: (info) => centerCell(info.getValue().length),
            header: () => centerText('Total Items'),
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
                    centerCell(
                      info
                        .getValue()
                        .filter((item: any) => item.is_closed === false).length
                    ),
                  header: () => centerText('Open Items'),
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
                    centerCell(
                      info
                        .getValue()
                        .filter((item: any) => item.is_closed === true).length
                    ),
                  header: () => centerText('Closed Items'),
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
              centerCell(
                info.getValue().reduce((sum, item) => sum + item.qty, 0)
              ),
            header: () => centerText('Total Qty'),
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
          }),
          columnHelper.accessor('type', {
            cell: (info) =>
              centerCell(
                getDisplayLabel(typeOptions, info.getValue(), 'type') || 'N/A'
              ),
            header: 'RR Type',
            id: 'rrType',
          }),
          columnHelper.accessor(
            (row) => ({ items: row.items, type: row.type }),
            {
              cell: (info) => {
                const { items, type } = info.getValue();
                if (!items?.length) return '-';

                const ids = items?.[0]?.repair_log_id;
                const prefix = getTypePrefix(type);
                return prefix && ids ? `${prefix}${ids}` : ids;
              },
              header: 'RR Ref No',
              id: 'rrTypeRefNumber',
            }
          ),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'RR Ref Date',
            id: 'rrTypeRefDate',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Req User'),
            meta: {
              sortable: false,
            },
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: () => centerText('Status'),
            meta: {
              sortable: true,
              isNumeric: false,
            },
            id: 'status',
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() => handleOpenPreview(info.row.original)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/spares-master/${info.row.original.id}/edit`)
                    }
                    display={'none'}
                  />
                  {/* <IconButton aria-label="Delete" icon={<DeleteIcon />} size={'sm'} /> */}
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
    ...(columnOrder === 'rrType'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('type', {
            cell: (info) =>
              centerCell(
                getDisplayLabel(typeOptions, info.getValue(), 'type') || 'N/A'
              ),
            header: 'RR Type',
            id: 'rrType',
          }),
          columnHelper.accessor(
            (row) => ({ items: row.items, type: row.type }),
            {
              cell: (info) => {
                const { items, type } = info.getValue();
                if (!items?.length) return '-';

                const ids = items?.[0]?.repair_log_id;
                const prefix = getTypePrefix(type);
                return prefix && ids ? `${prefix}${ids}` : ids;
              },
              header: 'RR Ref No',
              id: 'rrTypeRefNumber',
            }
          ),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'RR Ref Date',
            id: 'rrTypeRefDate',
          }),
          columnHelper.accessor('id', {
            cell: (info) => centerCell('REL' + info.getValue()),
            meta: {
              sortable: true,
              sortParam: 'id',
            },
            header: () => centerText('RR No'),
            id: 'RRID',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) =>
              centerCell(format(new Date(info.getValue()), 'dd/MM/yy')),
            header: () => centerText('Created Date'),
            id: 'created_at',
            meta: {
              sortable: true,
              sortParam: 'created_at',
            },
          }),
          columnHelper.accessor('items', {
            cell: (info) => centerCell(info.getValue().length),
            header: () => centerText('Total Items'),
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
                    centerCell(
                      info
                        .getValue()
                        .filter((item: any) => item.is_closed === false).length
                    ),
                  header: () => centerText('Open Items'),
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
                    centerCell(
                      info
                        .getValue()
                        .filter((item: any) => item.is_closed === true).length
                    ),
                  header: () => centerText('Closed Items'),
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
              centerCell(
                info.getValue().reduce((sum, item) => sum + item.qty, 0)
              ),
            header: () => centerText('Total Qty'),
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
          }),

          columnHelper.accessor('user.username', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Req User'),
            meta: {
              sortable: false,
            },
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: () => centerText('Status'),
            meta: {
              sortable: true,
              isNumeric: false,
            },
            id: 'status',
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() => handleOpenPreview(info.row.original)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/spares-master/${info.row.original.id}/edit`)
                    }
                    display={'none'}
                  />
                  {/* <IconButton aria-label="Delete" icon={<DeleteIcon />} size={'sm'} /> */}
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
    ...(columnOrder === 'workScope'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          // columnHelper.accessor('items', {
          //   cell: (info) => {
          //     const items = info.getValue();
          //     const partId = items?.[0]?.part_number_id;
          //     const match = spareOptions.find(
          //       (opt: any) => Number(opt.value) === partId
          //     );
          //     return match?.label ?? '-';
          //   },
          //   header: 'PartNo',
          //   id: 'partNo',
          // }),
          columnHelper.accessor('items', {
            cell: (info) => {
              const item = info.getValue()?.[0];
              if (!item) return '-';
              const scopes: string[] = [];
              if (item.is_bc) scopes.push('BC');
              if (item.is_oh) scopes.push('OH');
              if (item.is_rp) scopes.push('RP');

              return scopes.length > 0 ? scopes.join(',') : '-';
            },
            header: 'WorkScope',
            id: 'workScope',
          }),

          columnHelper.accessor('id', {
            cell: (info) => centerCell('REL' + info.getValue()),
            meta: {
              sortable: true,
              sortParam: 'id',
            },
            header: () => centerText('RR No'),
            id: 'RRID',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) =>
              centerCell(format(new Date(info.getValue()), 'dd/MM/yy')),
            header: () => centerText('Created Date'),
            id: 'created_at',
            meta: {
              sortable: true,
              sortParam: 'created_at',
            },
          }),
          columnHelper.accessor('items', {
            cell: (info) => centerCell(info.getValue().length),
            header: () => centerText('Total Items'),
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
                    centerCell(
                      info
                        .getValue()
                        .filter((item: any) => item.is_closed === false).length
                    ),
                  header: () => centerText('Open Items'),
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
                    centerCell(
                      info
                        .getValue()
                        .filter((item: any) => item.is_closed === true).length
                    ),
                  header: () => centerText('Closed Items'),
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
              centerCell(
                info.getValue().reduce((sum, item) => sum + item.qty, 0)
              ),
            header: () => centerText('Total Qty'),
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
          }),
          columnHelper.accessor('type', {
            cell: (info) =>
              centerCell(
                getDisplayLabel(typeOptions, info.getValue(), 'type') || 'N/A'
              ),
            header: 'RR Type',
            id: 'rrType',
          }),
          columnHelper.accessor(
            (row) => ({ items: row.items, type: row.type }),
            {
              cell: (info) => {
                const { items, type } = info.getValue();
                if (!items?.length) return '-';

                const ids = items?.[0]?.repair_log_id;
                const prefix = getTypePrefix(type);
                return prefix && ids ? `${prefix}${ids}` : ids;
              },
              header: 'RR Ref No',
              id: 'rrTypeRefNumber',
            }
          ),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'RR Ref Date',
            id: 'rrTypeRefDate',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Req User'),
            meta: {
              sortable: false,
            },
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: () => centerText('Status'),
            meta: {
              sortable: true,
              isNumeric: false,
            },
            id: 'status',
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() => handleOpenPreview(info.row.original)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/spares-master/${info.row.original.id}/edit`)
                    }
                    display={'none'}
                  />
                  {/* <IconButton aria-label="Delete" icon={<DeleteIcon />} size={'sm'} /> */}
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
              const currentPage = listData?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) =>
              centerCell(format(new Date(info.getValue()), 'dd/MM/yy')),
            header: () => centerText('Created Date'),
            id: 'created_at',
            meta: {
              sortable: true,
              sortParam: 'created_at',
            },
          }),
          columnHelper.accessor('id', {
            cell: (info) => centerCell('REL' + info.getValue()),
            meta: {
              sortable: true,
              sortParam: 'id',
            },
            header: () => centerText('RR No'),
            id: 'RRID',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('items', {
            cell: (info) => centerCell(info.getValue().length),
            header: () => centerText('Total Items'),
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
                    centerCell(
                      info
                        .getValue()
                        .filter((item: any) => item.is_closed === false).length
                    ),
                  header: () => centerText('Open Items'),
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
                    centerCell(
                      info
                        .getValue()
                        .filter((item: any) => item.is_closed === true).length
                    ),
                  header: () => centerText('Closed Items'),
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
              centerCell(
                info.getValue().reduce((sum, item) => sum + item.qty, 0)
              ),
            header: () => centerText('Total Qty'),
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
          }),
          columnHelper.accessor('type', {
            cell: (info) =>
              centerCell(
                getDisplayLabel(typeOptions, info.getValue(), 'type') || 'N/A'
              ),
            header: 'RR Type',
            id: 'rrType',
          }),
          columnHelper.accessor(
            (row) => ({ items: row.items, type: row.type }),
            {
              cell: (info) => {
                const { items, type } = info.getValue();
                if (!items?.length) return '-';

                const ids = items?.[0]?.repair_log_id;
                const prefix = getTypePrefix(type);
                return prefix && ids ? `${prefix}${ids}` : ids;
              },
              header: 'RR Ref No',
              id: 'rrTypeRefNumber',
            }
          ),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'RR Ref Date',
            id: 'rrTypeRefDate',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Req User'),
            meta: {
              sortable: false,
            },
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: () => centerText('Status'),
            meta: {
              sortable: true,
              isNumeric: false,
            },
            id: 'status',
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() => handleOpenPreview(info.row.original)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/spares-master/${info.row.original.id}/edit`)
                    }
                    display={'none'}
                  />
                  {/* <IconButton aria-label="Delete" icon={<DeleteIcon />} size={'sm'} /> */}
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
              const currentPage = listData?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('items', {
            cell: (info) => {
              const items = info.getValue();
              const partId = items?.[0]?.part_number_id;
              const match = spareOptions.find(
                (opt: any) => Number(opt.value) === partId
              );
              return match?.label ?? '-';
            },
            header: 'PartNo',
            id: 'partNo',
          }),
          columnHelper.accessor('id', {
            cell: (info) => centerCell('REL' + info.getValue()),
            meta: {
              sortable: true,
              sortParam: 'id',
            },
            header: () => centerText('RR No'),
            id: 'RRID',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) =>
              centerCell(format(new Date(info.getValue()), 'dd/MM/yy')),
            header: () => centerText('Created Date'),
            id: 'created_at',
            meta: {
              sortable: true,
              sortParam: 'created_at',
            },
          }),
          columnHelper.accessor('items', {
            cell: (info) => centerCell(info.getValue().length),
            header: () => centerText('Total Items'),
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
                    centerCell(
                      info
                        .getValue()
                        .filter((item: any) => item.is_closed === false).length
                    ),
                  header: () => centerText('Open Items'),
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
                    centerCell(
                      info
                        .getValue()
                        .filter((item: any) => item.is_closed === true).length
                    ),
                  header: () => centerText('Closed Items'),
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
              centerCell(
                info.getValue().reduce((sum, item) => sum + item.qty, 0)
              ),
            header: () => centerText('Total Qty'),
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
          }),
          columnHelper.accessor('type', {
            cell: (info) =>
              centerCell(
                getDisplayLabel(typeOptions, info.getValue(), 'type') || 'N/A'
              ),
            header: 'RR Type',
            id: 'rrType',
          }),
          columnHelper.accessor(
            (row) => ({ items: row.items, type: row.type }),
            {
              cell: (info) => {
                const { items, type } = info.getValue();
                if (!items?.length) return '-';

                const ids = items?.[0]?.repair_log_id;
                const prefix = getTypePrefix(type);
                return prefix && ids ? `${prefix}${ids}` : ids;
              },
              header: 'RR Ref No',
              id: 'rrTypeRefNumber',
            }
          ),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'RR Ref Date',
            id: 'rrTypeRefDate',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Req User'),
            meta: {
              sortable: false,
            },
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: () => centerText('Status'),
            meta: {
              sortable: true,
              isNumeric: false,
            },
            id: 'status',
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() => handleOpenPreview(info.row.original)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/spares-master/${info.row.original.id}/edit`)
                    }
                    display={'none'}
                  />
                  {/* <IconButton aria-label="Delete" icon={<DeleteIcon />} size={'sm'} /> */}
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

  const exportColumns = [
    ...(columnOrder === 'rrNo'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('id', {
            cell: (info) => 'REL' + info.getValue(),
            header: 'RR No',
            id: 'RRID',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created Date',
            id: 'created_at',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Total Items',
            id: 'totalItems',
          }),
          ...(queryParams?.is_closed === 0 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === false).length,
                  header: 'Open Items',
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
                      .filter((item: any) => item.is_closed === true).length,
                  header: 'Closed Items',
                  id: 'closeItems',
                }),
              ]
            : []),
          columnHelper.accessor('items', {
            cell: (info) =>
              info.getValue().reduce((sum, item) => sum + item.qty, 0),
            header: 'Total Qty',
            id: 'totalQty',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
          }),
          columnHelper.accessor('type', {
            cell: (info) =>
              getDisplayLabel(typeOptions, info.getValue(), 'type') || 'N/A',
            header: 'RR Type',
            id: 'rrType',
          }),
          columnHelper.display({
            id: 'rrTypeRefNumber',
            header: 'RR Ref No',
            cell: (info) => {
              const { items, type } = info.row.original;
              if (!items?.length) return '-';
              const ids = items[0]?.repair_log_id;
              const prefix = getTypePrefix(type);
              return prefix && ids ? `${prefix}${ids}` : ids || '-';
            },
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'RR Ref Date',
            id: 'rrTypeRefDate',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            id: 'status',
          }),
        ]
      : []),
    ...(columnOrder === 'rrType'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('type', {
            cell: (info) =>
              getDisplayLabel(typeOptions, info.getValue(), 'type') || 'N/A',
            header: 'RR Type',
            id: 'rrType',
          }),
          columnHelper.display({
            id: 'rrTypeRefNumber',
            header: 'RR Ref No',
            cell: (info) => {
              const { items, type } = info.row.original;
              if (!items?.length) return '-';
              const ids = items[0]?.repair_log_id;
              const prefix = getTypePrefix(type);
              return prefix && ids ? `${prefix}${ids}` : ids || '-';
            },
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'RR Ref Date',
            id: 'rrTypeRefDate',
          }),
          columnHelper.accessor('id', {
            cell: (info) => 'REL' + info.getValue(),
            header: 'RR No',
            id: 'RRID',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created Date',
            id: 'created_at',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Total Items',
            id: 'totalItems',
          }),
          ...(queryParams?.is_closed === 0 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === false).length,
                  header: 'Open Items',
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
                      .filter((item: any) => item.is_closed === true).length,
                  header: 'Closed Items',
                  id: 'closeItems',
                }),
              ]
            : []),
          columnHelper.accessor('items', {
            cell: (info) =>
              info.getValue().reduce((sum, item) => sum + item.qty, 0),
            header: 'Total Qty',
            id: 'totalQty',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
          }),

          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            id: 'status',
          }),
        ]
      : []),
    ...(columnOrder === 'workScope'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          // columnHelper.accessor('items', {
          //   cell: (info) => {
          //     const items = info.getValue();
          //     const partId = items?.[0]?.part_number_id;
          //     const match = spareOptions.find(
          //       (opt: any) => Number(opt.value) === partId
          //     );
          //     return match?.label ?? '-';
          //   },
          //   header: 'PartNo',
          //   id: 'partNo',
          // }),
          columnHelper.accessor('items', {
            cell: (info) => {
              const item = info.getValue()?.[0];
              if (!item) return '-';
              const scopes: string[] = [];
              if (item.is_bc) scopes.push('BC');
              if (item.is_oh) scopes.push('OH');
              if (item.is_rp) scopes.push('RP');

              return scopes.length > 0 ? scopes.join(',') : '-';
            },
            header: 'WorkScope',
            id: 'workScope',
          }),

          columnHelper.accessor('id', {
            cell: (info) => 'REL' + info.getValue(),
            header: 'RR No',
            id: 'RRID',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created Date',
            id: 'created_at',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Total Items',
            id: 'totalItems',
          }),
          ...(queryParams?.is_closed === 0 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === false).length,
                  header: 'Open Items',
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
                      .filter((item: any) => item.is_closed === true).length,
                  header: 'Closed Items',
                  id: 'closeItems',
                }),
              ]
            : []),
          columnHelper.accessor('items', {
            cell: (info) =>
              info.getValue().reduce((sum, item) => sum + item.qty, 0),
            header: 'Total Qty',
            id: 'totalQty',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
          }),
          columnHelper.accessor('type', {
            cell: (info) =>
              getDisplayLabel(typeOptions, info.getValue(), 'type') || 'N/A',
            header: 'RR Type',
            id: 'rrType',
          }),
          columnHelper.display({
            id: 'rrTypeRefNumber',
            header: 'RR Ref No',
            cell: (info) => {
              const { items, type } = info.row.original;
              if (!items?.length) return '-';
              const ids = items[0]?.repair_log_id;
              const prefix = getTypePrefix(type);
              return prefix && ids ? `${prefix}${ids}` : ids || '-';
            },
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'RR Ref Date',
            id: 'rrTypeRefDate',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            id: 'status',
          }),
        ]
      : []),
    ...(columnOrder === 'createdAt'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created Date',
            id: 'created_at',
          }),
          columnHelper.accessor('id', {
            cell: (info) => 'REL' + info.getValue(),
            header: 'RR No',
            id: 'RRID',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Total Items',
            id: 'totalItems',
          }),
          ...(queryParams?.is_closed === 0 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === false).length,
                  header: 'Open Items',
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
                      .filter((item: any) => item.is_closed === true).length,
                  header: 'Closed Items',
                  id: 'closeItems',
                }),
              ]
            : []),
          columnHelper.accessor('items', {
            cell: (info) =>
              info.getValue().reduce((sum, item) => sum + item.qty, 0),
            header: 'Total Qty',
            id: 'totalQty',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
          }),
          columnHelper.accessor('type', {
            cell: (info) =>
              getDisplayLabel(typeOptions, info.getValue(), 'type') || 'N/A',
            header: 'RR Type',
            id: 'rrType',
          }),
          columnHelper.display({
            id: 'rrTypeRefNumber',
            header: 'RR Ref No',
            cell: (info) => {
              const { items, type } = info.row.original;
              if (!items?.length) return '-';
              const ids = items[0]?.repair_log_id;
              const prefix = getTypePrefix(type);
              return prefix && ids ? `${prefix}${ids}` : ids || '-';
            },
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'RR Ref Date',
            id: 'rrTypeRefDate',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            id: 'status',
          }),
        ]
      : []),
    ...(columnOrder === 'partNo'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('items', {
            cell: (info) => {
              const items = info.getValue();
              const partId = items?.[0]?.part_number_id;
              const match = spareOptions.find(
                (opt: any) => Number(opt.value) === partId
              );
              return match?.label ?? '-';
            },
            header: 'PartNo',
            id: 'partNo',
          }),
          columnHelper.accessor('id', {
            cell: (info) => 'REL' + info.getValue(),
            header: 'RR No',
            id: 'RRID',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Created Date',
            id: 'created_at',
          }),
          columnHelper.accessor('items', {
            cell: (info) => info.getValue().length,
            header: 'Total Items',
            id: 'totalItems',
          }),
          ...(queryParams?.is_closed === 0 || queryParams?.is_closed === ''
            ? [
                columnHelper.accessor('items', {
                  cell: (info) =>
                    info
                      .getValue()
                      .filter((item: any) => item.is_closed === false).length,
                  header: 'Open Items',
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
                      .filter((item: any) => item.is_closed === true).length,
                  header: 'Closed Items',
                  id: 'closeItems',
                }),
              ]
            : []),
          columnHelper.accessor('items', {
            cell: (info) =>
              info.getValue().reduce((sum, item) => sum + item.qty, 0),
            header: 'Total Qty',
            id: 'totalQty',
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Due Date',
          }),
          columnHelper.accessor('type', {
            cell: (info) =>
              getDisplayLabel(typeOptions, info.getValue(), 'type') || 'N/A',
            header: 'RR Type',
            id: 'rrType',
          }),
          columnHelper.display({
            id: 'rrTypeRefNumber',
            header: 'RR Ref No',
            cell: (info) => {
              const { items, type } = info.row.original;
              if (!items?.length) return '-';
              const ids = items[0]?.repair_log_id;
              const prefix = getTypePrefix(type);
              return prefix && ids ? `${prefix}${ids}` : ids || '-';
            },
          }),
          columnHelper.accessor('due_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'RR Ref Date',
            id: 'rrTypeRefDate',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
            id: 'req_user',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === true ? 'Closed' : 'Open'),
            header: 'Status',
            id: 'status',
          }),
        ]
      : []),
  ];

  const [columns, setColumns] = useState<TODO>(tableColumns);

  const handleDateRangeClear = () => {
    setPartsLoading(true);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      start_date: '',
      end_date: '',
      page: 1,
    }));
    setSpareOptions([]);
    getPartNumberList();
  };

  const triggerDateClear = () => {
    const button = document.getElementById('btn-clear');
    if (button) {
      button.click();
    }
  };

  const getPartNumberList = async () => {
    try {
      const response = await getAPICall(
        endPoints.search.spare_by_partnumber,
        PartNumberSearchPayload,
        spareQueryParams
      );
      console.log(response.part_numbers);
      const options = response.part_numbers?.map((spare: TODO) => ({
        value: spare.id.toString(),
        label: `${spare.part_number} - ${spare.description}`,
      }));
      setSpareOptions(options);
      setPartsLoading(false);
      // setPROptions(transformToSelectOptions(response));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getPartNumberList();
  }, [spareQueryParams]);

  const getBulkPartNumberList = async (partNumbers: any) => {
    try {
      const response = await getAPICall(
        endPoints.bulk.spare_by_part_number_id_bulk,
        PartNumberBulkPayload,
        { part_number_id: partNumbers }
      );
      console.log(response);
      const options = transformPartsToSelectOptions(response);
      setSpareOptions(options);
      setPartsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    console.log(listData?.data);
    triggerExport(false);
    setColumns(tableColumns);
    if (listData?.part_numbers) {
      if (listData?.part_numbers.length > 0) {
        getBulkPartNumberList(listData?.part_numbers);
      }
    }
    if (listData?.min_date) {
      setMinDate(listData?.min_date);
    }
    if (listData?.max_date) {
      setMaxDate(listData?.max_date);
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [listData?.data]);

  useEffect(() => {
    setColumns(tableColumns);
  }, [columnOrder]);

  useEffect(() => {
    console.log(loading);
  }, [loading]);

  const setPartNumberDebounced = useRef(
    debounce((value: any) => {
      setPartNumber(value);
    })
  ).current;

  useEffect(() => {
    const hasQueryParamsChanged = Object.keys(queryParams).some(
      (key) => queryParams[key] !== prevQueryParamsRef.current[key]
    );

    if (hasQueryParamsChanged) {
      setLoading(true);
      prevQueryParamsRef.current = queryParams;
      queryClient.invalidateQueries('rrIndex');
      if (queryParams.repair_log_id) {
        setColumnOrder('rrNo');
      } else if (queryParams.type) {
        setColumnOrder('rrType');
      } else if (queryParams.is_bc || queryParams.is_oh || queryParams.is_rp) {
        setColumnOrder('workScope');
      } else if (queryParams.part_number) {
        console.log('partNo', queryParams.part_number_id);
        setColumnOrder('partNo');
      } else if (queryParams.start_date || queryParams.end_date) {
        setColumnOrder('createdAt');
      } else {
        setColumnOrder('rrNo');
      }
    } else {
      setColumnOrder('rrNo');
    }
  }, [queryParams]);

  useEffect(() => {
    setSpareQueryParams({ query: partNumber });
  }, [partNumber]);

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Repair Logs
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/repair-master/create')}
          >
            Add New
          </ResponsiveIconButton>
        </HStack>

        <Formiz autoForm connect={form}>
          <Box width="100%" bg={'white'} p={4} borderRadius={4}>
            <Box width="100%" bg={'green.200'} p={4} borderRadius={4}>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                display={{ base: 'none', md: 'flex' }}
                align={'flex-start'}
                justify={'flex-start'}
                mt={2}
                mb={2}
              >
                <FieldSelect
                  key={`repair_log_${resetKey}`}
                  name="repair_log_id"
                  label="Repair Log"
                  placeholder="Repair Log"
                  size={'sm'}
                  options={repairLogOptions}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      repair_log_id: value ?? '',
                      type: '',
                      start_date: '',
                      end_date: '',
                      is_closed: '',
                      part_number: '',
                      is_bc: '',
                      is_oh: '',
                      is_rp: '',
                      page: 1,
                    }));
                  }}
                  isClearable={true}
                />

                <FieldSelect
                  key={`type_${resetKey}`}
                  label={'Type'}
                  name={'type'}
                  placeholder="Select type"
                  options={typeOptions}
                  size={'sm'}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      repair_log_id: '',
                      type: value ?? '',
                      start_date: '',
                      end_date: '',
                      is_closed: '',
                      part_number: '',
                      is_bc: '',
                      is_oh: '',
                      is_rp: '',
                      page: 1,
                    }));
                  }}
                  isDisabled={queryParams?.repair_log_id !== ''}
                  isClearable={true}
                />

                <FieldCheckboxes
                  name="workscope"
                  label="Workscope"
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      is_bc: value?.includes('BC') ? true : false,
                      is_oh: value?.includes('OH') ? true : false,
                      is_rp: value?.includes('RP') ? true : false,
                      repair_log_id: '',
                      type: '',
                      start_date: '',
                      end_date: '',
                      is_closed: '',
                      part_number: '',
                      page: 1,
                    }));
                  }}
                  checkboxProps={{
                    size: 'lg',
                    isDisabled: queryParams?.repair_log_id !== '',
                  }}
                >
                  <Flex gap={5} wrap="wrap" direction="row">
                    <FieldCheckboxesItem
                      value="BC"
                      isChecked={queryParams.is_bc}
                    >
                      BC
                    </FieldCheckboxesItem>
                    <FieldCheckboxesItem
                      value="OH"
                      isChecked={queryParams.is_oh}
                    >
                      OH
                    </FieldCheckboxesItem>
                    <FieldCheckboxesItem
                      value="RP"
                      isChecked={queryParams.is_rp}
                    >
                      RP
                    </FieldCheckboxesItem>
                  </Flex>
                </FieldCheckboxes>
              </Stack>

              <Stack
                direction={{ base: 'column', md: 'row' }}
                display={{ base: 'none', md: 'flex' }}
                align={'flex-start'}
                justify={'flex-start'}
                mt={2}
                mb={2}
              >
                <FieldSelect
                  label={'Part Number'}
                  name={`part_number`}
                  key={`part_number_id_${resetKey}`}
                  size={'sm'}
                  options={spareOptions ?? []}
                  isClearable={true}
                  onValueChange={(value) => {
                    searchingPartNo.current = value ?? '';
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      part_number: value ?? '',
                      repair_log_id: '',
                      type: '',
                      start_date: '',
                      end_date: '',
                      is_closed: '',
                      is_bc: '',
                      is_oh: '',
                      is_rp: '',
                      page: 1,
                    }));
                  }}
                  selectProps={{
                    isLoading: partsLoading,
                    noOptionsMessage: () => 'No parts found',
                    onInputChange: (event: any) => {
                      setPartNumberDebounced(event);
                    },
                  }}
                  isDisabled={queryParams?.repair_log_id !== ''}
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
                      // setPartsLoading(true);
                      setQueryParams((prevState: TODO) => ({
                        ...prevState,
                        repair_log_id: '',
                        type: '',
                        is_closed: '',
                        part_number: '',
                        is_bc: '',
                        is_oh: '',
                        is_rp: '',
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
                        queryParams?.repair_log_id !== '' &&
                        queryParams?.repair_log_id !== null,
                    },
                  }}
                  isSearch={true}
                />
              </Stack>
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
                    triggerDateClear();
                    setQueryParams(initialFormData);
                    setResetKey((prevKey) => prevKey + 1);
                    queryClient.invalidateQueries('selIndex');
                  }}
                >
                  Reset Form
                </Button>
              </Stack>
            </Box>
          </Box>
        </Formiz>

        <Box borderRadius={4}>
          {/* Table goes here */}

          <HStack
            bg={'white'}
            justify={'space-between'}
            mb={4}
            p={4}
            borderTopRadius={4}
          >
            <Heading as="h4" size={'md'}>
              Repair Log List
            </Heading>
          </HStack>
          <Box borderRadius={4}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Tabs
                position="relative"
                variant="unstyled"
                onChange={(index) => setSelectedTab(index)}
              >
                <TabList>
                  <Tab
                    bg={selectedTab === 0 ? '#0C2556' : 'gray.200'}
                    color={selectedTab === 0 ? 'white' : 'black'}
                  >
                    All
                  </Tab>
                  <Tab
                    bg={selectedTab === 1 ? '#0C2556' : 'gray.200'}
                    color={selectedTab === 1 ? 'white' : 'black'}
                  >
                    Open
                  </Tab>
                  <Tab
                    bg={selectedTab === 2 ? '#0C2556' : 'gray.200'}
                    color={selectedTab === 2 ? 'white' : 'black'}
                  >
                    Closed
                  </Tab>
                </TabList>
              </Tabs>
              <Box ml="auto" display="flex" alignItems="center">
                <TableExport
                  loading={loading}
                  exportTableData={(format: string) => exportTableData(format)}
                />

                <PageLimit
                  currentLimit={itemsPerPage}
                  loading={listLoading}
                  changeLimit={changePageLimit}
                />
              </Box>
            </Box>
            <LoadingOverlay isLoading={loading || listLoading || exportStatus}>
              <DataTable
                columns={columns}
                data={data}
                loading={listLoading}
                tableProps={{ variant: 'simple' }}
                onSortChange={handleSortChange}
                sortDirection={sortDirection}
                sortBy={sortBy}
              />
              <Box p={4} mt={4} display="flex" justifyContent="space-between">
                {listData && listData?.total > 0 && (
                  <Text fontSize="sm" color="gray.500">
                    {`Showing ${(listData?.current_page - 1) * itemsPerPage + 1} to ${Math.min(listData?.current_page * itemsPerPage, listData?.total)} of ${listData?.total} records`}
                  </Text>
                )}
                <Pagination
                  currentPage={listData?.current_page ?? 1}
                  totalCount={listData?.total ?? 0}
                  pageSize={10}
                  onPageChange={(page) => {
                    setQueryParams({ ...queryParams, page });
                  }}
                />
              </Box>
            </LoadingOverlay>
          </Box>
        </Box>
      </Stack>
      <PreviewPopup
        isOpen={isPreviewModalOpen}
        onClose={handleCloseModal}
        data={previewData}
      />
    </SlideIn>
  );
};

export default RepairLogMaster;
