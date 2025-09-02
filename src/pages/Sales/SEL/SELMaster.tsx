import { useEffect, useRef, useState } from 'react';

import { EditIcon, ViewIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  HStack,
  Heading,
  IconButton,
  ListItem,
  Stack,
  Tab,
  TabList,
  Tabs,
  Text,
  Tooltip,
  UnorderedList,
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
import { FieldDateRangePicker } from '@/components/FieldDateRangePicker';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import PreviewPopup from '@/components/PreviewContents/Sales/Sel';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { TableExport } from '@/components/TableExport';
import { useToastSuccess } from '@/components/Toast';
import {
  exportTableAs,
  formatContactAddress,
  formatShippingAddress,
  getDisplayLabel,
  transformPartsToSelectOptions,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { centerCell, centerText } from '@/helpers/tableColumnCenterHelper';
import PartDetailText from '@/pages/Purchase/Quotation/PartDetailText';
import { getAPICall } from '@/services/apiService';
import { OptionsListPayload } from '@/services/apiService/Schema/OptionsSchema';
import {
  PartNumberBulkPayload,
  PartNumberSearchPayload,
} from '@/services/apiService/Schema/PRSchema';
import { fetchContactManagerInfo } from '@/services/master/contactmanager/services';
import { fetchShippingAddressInfo } from '@/services/master/shipping/services';
import { SelDataColumn } from '@/services/sales/sel/schema';
import { useSelIndex, useSelList } from '@/services/sales/sel/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { useFOBList } from '@/services/submaster/fob/services';
import { useModeOfReceiptList } from '@/services/submaster/mode-of-receipt/services';
import { usePaymentModeList } from '@/services/submaster/paymentmode/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

const SELMaster = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const initialFormData = {
    sales_log_id: '',
    is_closed: '',
    mode_of_receipt_id: '',
    customer_id: '',
    part_number_id: '',
    cust_rfq_no: '',
    start_date: '',
    end_date: '',
    sort_field: 'id',
    sort_order: 'desc',
    page: 1,
    per_page: itemsPerPage,
  };
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const navigate = useNavigate();
  const [resetKey, setResetKey] = useState(0);
  const form = useForm({
    onValidSubmit: (values) => {
      setQueryParams(values);
    },
  });
  const uomList: UseQueryResult<QueryData, unknown> = useUnitOfMeasureList();
  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const currencyList: UseQueryResult<QueryData, unknown> = useCurrencyList();
  const fobList: UseQueryResult<QueryData, unknown> = useFOBList();
  const priorityList: UseQueryResult<QueryData, unknown> = usePriorityList();
  const paymentModeList: UseQueryResult<QueryData, unknown> =
    usePaymentModeList();
  const paymentTermsList: UseQueryResult<QueryData, unknown> =
    usePaymentTermsList();
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const paymentModeOptions = transformToSelectOptions(paymentModeList.data);
  const paymentTermsOptions = transformToSelectOptions(paymentTermsList.data);
  const currencyOptions = transformToSelectOptions(currencyList.data);
  const fobOptions = transformToSelectOptions(fobList.data);
  const uomOptions = transformToSelectOptions(uomList.data);
  const receiptList: UseQueryResult<QueryData, unknown> =
    useModeOfReceiptList();
  const receiptModeOptions = transformToSelectOptions(receiptList.data);
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const searchingPartNo = useRef(queryParams.part_number_id);
  const { data: listData, isLoading: listLoading } = useSelIndex(queryParams);
  const [tableData, setData] = useState<any>([]);
  const columnHelper = createColumnHelper<SelDataColumn>();
  const [minDate, setMinDate] = useState<any>(null);
  const [maxDate, setMaxDate] = useState<any>(null);
  const selList: UseQueryResult<QueryData, unknown> = useSelList();
  const selOptions = transformToSelectOptions(selList.data);
  const [loading, setLoading] = useState<boolean>(true);
  const [exportStatus, triggerExport] = useState(false);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('id');
  const [spareQueryParams, setSpareQueryParams] = useState<any>({});
  const [spareOptions, setSpareOptions] = useState<TODO>([]);
  const [receiptOptions, setReceiptOptions] = useState<TODO>([]);
  const [partsLoading, setPartsLoading] = useState<boolean>(true);
  const [partNumber, setPartNumber] = useState('');
  const prevQueryParamsRef = useRef(queryParams);
  const [columnOrder, setColumnOrder] = useState('selNo');
  const [exportType, setExportType] = useState<'csv' | 'pdf' | undefined>(
    undefined
  );

  const [exportStatusTrigger, setExportStatusTrigger] = useState(0);
  const toastSuccess = useToastSuccess();
  const [previewData, setPreviewData] = useState<TODO>({});
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const { data: downloadData, refetch: downloadDataReload } = useSelIndex(
    {
      ...queryParams,
      per_page: '-1',
    },
    { enabled: false }
  );

  const contactManagerRefetch = fetchContactManagerInfo();
  const shippingAddressRefetch = fetchShippingAddressInfo();

  let debounceTimeout: any;

  const handleRFQNoChange = (value: any) => {
    const updatedData: any = { ...queryParams };
    updatedData['cust_rfq_no'] = value;
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      setQueryParams(updatedData);

      form.setValues({
        [`sales_log_id`]: '',
        [`date_range`]: '',
        [`mode_of_receipt`]: '',
        [`part_number_id`]: '',
        [`customer_id`]: '',
        [`rfq_id`]: '',
      });
    }, 500);
  };

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  const handleCloseModal = () => {
    queryClient.invalidateQueries('ContactDetails');
    queryClient.invalidateQueries('shippingDetails');
    setLoading(false);
    setIsPreviewModalOpen(false);
    setPreviewData({});
  };

  const handleOpenPreview = async (selDetails: any) => {
    setLoading(true);
    try {
      let formattedContactAddress = '';
      let formattedVendorAddress = '';

      // Call with parameter only if ID is valid
      if (selDetails.customer_contact_manager_id > 0) {
        const contactData = await contactManagerRefetch(
          selDetails.customer_contact_manager_id
        );
        formattedContactAddress = formatContactAddress(contactData);
      }

      if (selDetails.customer_shipping_address_id > 0) {
        const shippingData = await shippingAddressRefetch(
          selDetails.customer_shipping_address_id
        );
        formattedVendorAddress = formatShippingAddress(shippingData);
      }

      // Prepare preview data
      let popupVariables: any = {};
      popupVariables.conditionOptions = conditionOptions;
      popupVariables.uomOptions = uomOptions;
      popupVariables.currencyOptions = currencyOptions;
      popupVariables.fobOptions = fobOptions;
      popupVariables.paymentModeOptions = paymentModeOptions;
      popupVariables.paymentTermsOptions = paymentTermsOptions;
      popupVariables.receiptOptions = receiptModeOptions;
      popupVariables.priorityOptions = priorityOptions;
      popupVariables.customerInfo = selDetails.customer;
      popupVariables.contactAddress = formattedContactAddress;
      popupVariables.vendorAddress = formattedVendorAddress;
      Object.keys(selDetails).forEach(function (key) {
        popupVariables[key] = selDetails[key];
      });
      popupVariables.remarks = selDetails.remarks;

      setPreviewData(popupVariables);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setLoading(false);
    }
  };

  const setPartNumberDebounced = useRef(
    debounce((value: any) => {
      setPartNumber(value);
    })
  ).current;

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

  const handleDateRangeClear = () => {
    setPartsLoading(true);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      start_date: '',
      end_date: '',
      page: 1,
    }));
    setSpareOptions([]);
    //getPRList();
    getPartNumberList();
  };

  const exportTableData = (type: any) => {
    setExportType(type);
    triggerExport(true);
    setExportStatusTrigger((prev) => prev + 1);
  };

  useEffect(() => {
    setSpareQueryParams({ query: partNumber });
  }, [partNumber]);

  useEffect(() => {
    const hasQueryParamsChanged = Object.keys(queryParams).some(
      (key) => queryParams[key] !== prevQueryParamsRef.current[key]
    );

    if (hasQueryParamsChanged) {
      setLoading(true);
      prevQueryParamsRef.current = queryParams;
      queryClient.invalidateQueries('selIndex');
      if (queryParams.purchase_request_id) {
        setColumnOrder('selNo');
      } else if (queryParams.mode_of_receipt_id) {
        setColumnOrder('receiptMode');
      } else if (queryParams.customer_id) {
        setColumnOrder('customerFilter');
      } else if (queryParams.part_number_id) {
        console.log('partNo', queryParams.part_number_id);
        setColumnOrder('partNo');
      } else if (queryParams.start_date || queryParams.end_date) {
        setColumnOrder('createdAt');
      } else {
        setColumnOrder('selNo');
      }
    } else {
      setColumnOrder('selNo');
    }
    console.log(queryParams);
  }, [queryParams]);

  useEffect(() => {
    getPartNumberList();
  }, [spareQueryParams]);

  useEffect(() => {
    if (downloadData?.data && exportStatus) {
      triggerExport(false);
      exportTableAs(
        exportColumns,
        downloadData?.data,
        'sel-request',
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

  const tableColumns = [
    ...(columnOrder === 'selNo'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return centerCell((currentPage - 1) * 10 + info.row.index + 1);
            },
            header: () => centerText('#'),
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('id', {
            cell: (info) => centerCell('SEL' + info.getValue()),
            meta: {
              sortable: true,
              sortParam: 'id',
            },
            header: () => centerText('SEL No'),
            id: 'SELID',
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
            cell: (info) =>
              centerCell(format(new Date(info.getValue()), 'dd/MM/yy')),
            header: () => centerText('Due Date'),
            meta: {
              sortable: true,
              sortParam: 'due_date',
            },
          }),
          columnHelper.accessor('mode_of_receipt_id', {
            cell: (info) =>
              centerCell(
                getDisplayLabel(
                  receiptModeOptions,
                  info.getValue(),
                  'Mode.Of.Rec'
                ) || 'N/A'
              ),
            header: () => centerText('Mode Of Receipt'),
          }),

          columnHelper.accessor('customer.business_name', {
            cell: (info) => (
              <Tooltip
                label={info.getValue()}
                aria-label="Customer name tooltip"
                placement="top"
                hasArrow
                color="white"
                backgroundColor={'#0C2556'}
              >
                <Text
                  textAlign="center"
                  maxW="100px"
                  isTruncated
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {info.getValue()}
                </Text>
              </Tooltip>
            ),
            header: () => centerText('Customer Name'),
            id: 'cust_name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer Code'),
            id: 'cust_code',
          }),
          columnHelper.accessor('cust_rfq_no', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer RFQ No'),
            id: 'cust_rfq_no',
          }),

          columnHelper.accessor('cust_rfq_date', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer RFQ Date'),
            id: 'cust_rfq_date',
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
                <HStack spacing={4} justify={'flex-start'}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() => handleOpenPreview(info.row.original)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    display={'none'}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/sel-master/${info.row.original.id}/edit`)
                    }
                  />
                </HStack>
              );
            },
            header: () => <Text textAlign="end">Actions</Text>,
            meta: {
              isNumeric: false,
            },
          }),
        ]
      : []),
    ...(columnOrder === 'receiptMode'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return centerCell((currentPage - 1) * 10 + info.row.index + 1);
            },
            header: () => centerText('#'),
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('mode_of_receipt_id', {
            cell: (info) =>
              centerCell(
                getDisplayLabel(
                  receiptModeOptions,
                  info.getValue(),
                  'Mode.Of.Rec'
                ) || 'N/A'
              ),
            header: () => centerText('Mode Of Receipt'),
          }),
          columnHelper.accessor('id', {
            cell: (info) => centerCell('SEL' + info.getValue()),
            meta: {
              sortable: true,
              sortParam: 'id',
            },
            header: () => centerText('SEL No'),
            id: 'SELID',
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
            cell: (info) =>
              centerCell(format(new Date(info.getValue()), 'dd/MM/yy')),
            header: () => centerText('Due Date'),
            meta: {
              sortable: true,
              sortParam: 'due_date',
            },
          }),
          columnHelper.accessor('customer.business_name', {
            cell: (info) => (
              <Tooltip
                label={info.getValue()}
                aria-label="Customer name tooltip"
                placement="top"
                hasArrow
                color="white"
                backgroundColor={'#0C2556'}
              >
                <Text
                  textAlign="center"
                  maxW="100px"
                  isTruncated
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {info.getValue()}
                </Text>
              </Tooltip>
            ),
            header: () => centerText('Customer Name'),
            id: 'cust_name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer Code'),
            id: 'cust_code',
          }),
          columnHelper.accessor('cust_rfq_no', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer RFQ No'),
            id: 'cust_rfq_no',
          }),

          columnHelper.accessor('cust_rfq_date', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer RFQ Date'),
            id: 'cust_rfq_date',
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
                <HStack spacing={4} justify={'flex-start'}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() => handleOpenPreview(info.row.original)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    display={'none'}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/sel-master/${info.row.original.id}/edit`)
                    }
                  />
                </HStack>
              );
            },
            header: () => <Text textAlign="end">Actions</Text>,
            meta: {
              isNumeric: false,
            },
          }),
        ]
      : []),
    ...(columnOrder === 'customerFilter'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return centerCell((currentPage - 1) * 10 + info.row.index + 1);
            },
            header: () => centerText('#'),
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('customer.business_name', {
            cell: (info) => (
              <Tooltip
                label={info.getValue()}
                aria-label="Customer name tooltip"
                placement="top"
                hasArrow
                color="white"
                backgroundColor={'#0C2556'}
              >
                <Text
                  textAlign="center"
                  maxW="100px"
                  isTruncated
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {info.getValue()}
                </Text>
              </Tooltip>
            ),
            header: () => centerText('Customer Name'),
            id: 'cust_name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer Code'),
            id: 'cust_code',
          }),
          columnHelper.accessor('cust_rfq_no', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer RFQ No'),
            id: 'cust_rfq_no',
          }),

          columnHelper.accessor('cust_rfq_date', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer RFQ Date'),
            id: 'cust_rfq_date',
          }),

          columnHelper.accessor('id', {
            cell: (info) => centerCell('SEL' + info.getValue()),
            meta: {
              sortable: true,
              sortParam: 'id',
            },
            header: () => centerText('SEL No'),
            id: 'SELID',
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
            cell: (info) =>
              centerCell(format(new Date(info.getValue()), 'dd/MM/yy')),
            header: () => centerText('Due Date'),
            meta: {
              sortable: true,
              sortParam: 'due_date',
            },
          }),
          columnHelper.accessor('mode_of_receipt_id', {
            cell: (info) =>
              centerCell(
                getDisplayLabel(
                  receiptModeOptions,
                  info.getValue(),
                  'Mode.Of.Rec'
                ) || 'N/A'
              ),
            header: () => centerText('Mode Of Receipt'),
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
                <HStack spacing={4} justify={'flex-start'}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() => handleOpenPreview(info.row.original)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    display={'none'}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/sel-master/${info.row.original.id}/edit`)
                    }
                  />
                </HStack>
              );
            },
            header: () => <Text textAlign="end">Actions</Text>,
            meta: {
              isNumeric: false,
            },
          }),
        ]
      : []),
    ...(columnOrder === 'partNo'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return centerCell((currentPage - 1) * 10 + info.row.index + 1);
            },
            header: () => centerText('#'),
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('items', {
            header: () => centerText('Part Numbers'),
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
            cell: (info) => centerCell('SEL' + info.getValue()),
            meta: {
              sortable: true,
              sortParam: 'id',
            },
            header: () => centerText('SEL No'),
            id: 'SELID',
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
            cell: (info) =>
              centerCell(format(new Date(info.getValue()), 'dd/MM/yy')),
            header: () => centerText('Due Date'),
            meta: {
              sortable: true,
              sortParam: 'due_date',
            },
          }),
          columnHelper.accessor('mode_of_receipt_id', {
            cell: (info) =>
              centerCell(
                getDisplayLabel(
                  receiptModeOptions,
                  info.getValue(),
                  'Mode.Of.Rec'
                ) || 'N/A'
              ),
            header: () => centerText('Mode Of Receipt'),
          }),

          columnHelper.accessor('customer.business_name', {
            cell: (info) => (
              <Tooltip
                label={info.getValue()}
                aria-label="Customer name tooltip"
                placement="top"
                hasArrow
                color="white"
                backgroundColor={'#0C2556'}
              >
                <Text
                  textAlign="center"
                  maxW="100px"
                  isTruncated
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {info.getValue()}
                </Text>
              </Tooltip>
            ),
            header: () => centerText('Customer Name'),
            id: 'cust_name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer Code'),
            id: 'cust_code',
          }),
          columnHelper.accessor('cust_rfq_no', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer RFQ No'),
            id: 'cust_rfq_no',
          }),

          columnHelper.accessor('cust_rfq_date', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer RFQ Date'),
            id: 'cust_rfq_date',
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
                <HStack spacing={4} justify={'flex-start'}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() => handleOpenPreview(info.row.original)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    display={'none'}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/sel-master/${info.row.original.id}/edit`)
                    }
                  />
                </HStack>
              );
            },
            header: () => <Text textAlign="end">Actions</Text>,
            meta: {
              isNumeric: false,
            },
          }),
        ]
      : []),
    ...(columnOrder === 'createdAt'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = listData?.current_page ?? 1;
              return centerCell((currentPage - 1) * 10 + info.row.index + 1);
            },
            header: () => centerText('#'),
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('id', {
            cell: (info) => centerCell('SEL' + info.getValue()),
            meta: {
              sortable: true,
              sortParam: 'id',
            },
            header: () => centerText('SEL No'),
            id: 'SELID',
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
            cell: (info) =>
              centerCell(format(new Date(info.getValue()), 'dd/MM/yy')),
            header: () => centerText('Due Date'),
            meta: {
              sortable: true,
              sortParam: 'due_date',
            },
          }),
          columnHelper.accessor('mode_of_receipt_id', {
            cell: (info) =>
              centerCell(
                getDisplayLabel(
                  receiptModeOptions,
                  info.getValue(),
                  'Mode.Of.Rec'
                ) || 'N/A'
              ),
            header: () => centerText('Mode Of Receipt'),
          }),

          columnHelper.accessor('customer.business_name', {
            cell: (info) => (
              <Tooltip
                label={info.getValue()}
                aria-label="Customer name tooltip"
                placement="top"
                hasArrow
                color="white"
                backgroundColor={'#0C2556'}
              >
                <Text
                  textAlign="center"
                  maxW="100px"
                  isTruncated
                  overflow="hidden"
                  whiteSpace="nowrap"
                >
                  {info.getValue()}
                </Text>
              </Tooltip>
            ),
            header: () => centerText('Customer Name'),
            id: 'cust_name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer Code'),
            id: 'cust_code',
          }),
          columnHelper.accessor('cust_rfq_no', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer RFQ No'),
            id: 'cust_rfq_no',
          }),

          columnHelper.accessor('cust_rfq_date', {
            cell: (info) => centerCell(info.getValue()),
            header: () => centerText('Customer RFQ Date'),
            id: 'cust_rfq_date',
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
                <HStack spacing={4} justify={'flex-start'}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() => handleOpenPreview(info.row.original)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    display={'none'}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/sel-master/${info.row.original.id}/edit`)
                    }
                  />
                </HStack>
              );
            },
            header: () => <Text textAlign="end">Actions</Text>,
            meta: {
              isNumeric: false,
            },
          }),
        ]
      : []),
  ];

  const exportColumns = [
    ...(columnOrder === 'selNo'
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
            cell: (info) => 'SEL' + info.getValue(),

            header: 'SEL No',
            id: 'SELID',
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
          columnHelper.accessor('mode_of_receipt_id', {
            cell: (info) =>
              getDisplayLabel(
                receiptModeOptions,
                info.getValue(),
                'Mode.Of.Rec'
              ) || 'N/A',
            header: 'Mode Of Receipt',
          }),

          columnHelper.accessor('customer.business_name', {
            cell: (info) => info.getValue(),
            header: 'Customer Name',
            id: 'cust_name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => info.getValue(),
            header: 'Customer Code',
            id: 'cust_code',
          }),
          columnHelper.accessor('cust_rfq_no', {
            cell: (info) => info.getValue(),
            header: 'Customer RFQ No',
            id: 'cust_rfq_no',
          }),

          columnHelper.accessor('cust_rfq_date', {
            cell: (info) => info.getValue(),
            header: 'Customer RFQ Date',
            id: 'cust_rfq_date',
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
    ...(columnOrder === 'receiptMode'
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
          columnHelper.accessor('mode_of_receipt_id', {
            cell: (info) =>
              getDisplayLabel(
                receiptModeOptions,
                info.getValue(),
                'Mode.Of.Rec'
              ) || 'N/A',
            header: 'Mode Of Receipt',
          }),
          columnHelper.accessor('id', {
            cell: (info) => 'SEL' + info.getValue(),

            header: 'SEL No',
            id: 'SELID',
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
          columnHelper.accessor('customer.business_name', {
            cell: (info) => info.getValue(),
            header: 'Customer Name',
            id: 'cust_name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => info.getValue(),
            header: 'Customer Code',
            id: 'cust_code',
          }),
          columnHelper.accessor('cust_rfq_no', {
            cell: (info) => info.getValue(),
            header: 'Customer RFQ No',
            id: 'cust_rfq_no',
          }),

          columnHelper.accessor('cust_rfq_date', {
            cell: (info) => info.getValue(),
            header: 'Customer RFQ Date',
            id: 'cust_rfq_date',
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
    ...(columnOrder === 'customerFilter'
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
          columnHelper.accessor('customer.business_name', {
            cell: (info) => info.getValue(),
            header: 'Customer Name',
            id: 'cust_name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => info.getValue(),
            header: 'Customer Code',
            id: 'cust_code',
          }),
          columnHelper.accessor('cust_rfq_no', {
            cell: (info) => info.getValue(),
            header: 'Customer RFQ No',
            id: 'cust_rfq_no',
          }),

          columnHelper.accessor('cust_rfq_date', {
            cell: (info) => info.getValue(),
            header: 'Customer RFQ Date',
            id: 'cust_rfq_date',
          }),

          columnHelper.accessor('id', {
            cell: (info) => 'SEL' + info.getValue(),

            header: 'SEL No',
            id: 'SELID',
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
          columnHelper.accessor('mode_of_receipt_id', {
            cell: (info) =>
              getDisplayLabel(
                receiptModeOptions,
                info.getValue(),
                'Mode.Of.Rec'
              ) || 'N/A',
            header: 'Mode Of Receipt',
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
            cell: (info) => 'SEL' + info.getValue(),

            header: 'SEL No',
            id: 'SELID',
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
          columnHelper.accessor('mode_of_receipt_id', {
            cell: (info) =>
              getDisplayLabel(
                receiptModeOptions,
                info.getValue(),
                'Mode.Of.Rec'
              ) || 'N/A',
            header: 'Mode Of Receipt',
          }),

          columnHelper.accessor('customer.business_name', {
            cell: (info) => info.getValue(),
            header: 'Customer Name',
            id: 'cust_name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => info.getValue(),
            header: 'Customer Code',
            id: 'cust_code',
          }),
          columnHelper.accessor('cust_rfq_no', {
            cell: (info) => info.getValue(),
            header: 'Customer RFQ No',
            id: 'cust_rfq_no',
          }),

          columnHelper.accessor('cust_rfq_date', {
            cell: (info) => info.getValue(),
            header: 'Customer RFQ Date',
            id: 'cust_rfq_date',
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
          columnHelper.accessor('id', {
            cell: (info) => 'SEL' + info.getValue(),

            header: 'SEL No',
            id: 'SELID',
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
          columnHelper.accessor('mode_of_receipt_id', {
            cell: (info) =>
              getDisplayLabel(
                receiptModeOptions,
                info.getValue(),
                'Mode.Of.Rec'
              ) || 'N/A',
            header: 'Mode Of Receipt',
          }),

          columnHelper.accessor('customer.business_name', {
            cell: (info) => info.getValue(),
            header: 'Customer Name',
            id: 'cust_name',
          }),
          columnHelper.accessor('customer.code', {
            cell: (info) => info.getValue(),
            header: 'Customer Code',
            id: 'cust_code',
          }),
          columnHelper.accessor('cust_rfq_no', {
            cell: (info) => info.getValue(),
            header: 'Customer RFQ No',
            id: 'cust_rfq_no',
          }),

          columnHelper.accessor('cust_rfq_date', {
            cell: (info) => info.getValue(),
            header: 'Customer RFQ Date',
            id: 'cust_rfq_date',
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

  const [columns, setColumns] = useState<TODO>(tableColumns);

  const [customerOptions, setCustomerOptions] = useState<any>([]);

  const getBulkCustomersList = async (customers: any) => {
    try {
      const response = await getAPICall(
        endPoints.bulk.customer_list_by_customer_id_bulk,
        OptionsListPayload,
        { customer_ids: customers }
      );
      const options = transformToSelectOptions(response);
      setCustomerOptions(options);
    } catch (err) {
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
      console.log(err);
    }
  };

  useEffect(() => {
    setLoading(true);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      is_closed: selectedTab === 0 ? '' : selectedTab === 1 ? 0 : 1,
      page: 1,
    }));
  }, [selectedTab]);

  useEffect(() => {
    if (listData?.data) {
      setColumns(tableColumns);
      setLoading(false);
      triggerExport(false);
      if (listData?.part_numbers) {
        if (listData?.part_numbers.length > 0) {
          getBulkPartNumberList(listData?.part_numbers);
        }
      }
      if (listData?.mode_of_receipts) {
        if (listData?.mode_of_receipts.length > 0) {
          console.log(listData?.mode_of_receipts);
          const filtered = receiptModeOptions.filter((item: any) =>
            listData?.mode_of_receipts?.includes(Number(item.value))
          );
          setReceiptOptions(filtered);
        } else {
          setSpareOptions([]);
        }
      }
      if (listData?.customers) {
        if (listData?.customers.length > 0) {
          getBulkCustomersList(listData?.customers);
        }
      }
      if (listData?.min_date) {
        setMinDate(listData?.min_date);
      }
      if (listData?.max_date) {
        setMaxDate(listData?.max_date);
      }
      setData(listData?.data);
    }
  }, [listData]);

  useEffect(() => {
    console.log(columnOrder);
    setColumns(tableColumns);
  }, [columnOrder]);

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            SEL Master
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/sel-master/create')}
          >
            Add New SEL
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
                  key={`sales_log_id_${resetKey}`}
                  name="sales_log_id"
                  label="SEL No"
                  placeholder="SEL No"
                  size={'sm'}
                  options={selOptions}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      sales_log_id: value ?? '',
                      mode_of_receipt: '',
                      part_number_id: '',
                      cust_rfq_no: '',
                      customer_id: '',
                      start_date: '',
                      end_date: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`mode_of_receipt`]: '',
                      [`date_range`]: '',
                      [`cust_rfq_no`]: '',
                      [`part_number_id`]: '',
                      [`customer_id`]: '',
                      [`rfq_id`]: '',
                    });
                  }}
                  isClearable={true}
                />

                <FieldSelect
                  key={`mode_of_receipt_${resetKey}`}
                  label={'Mode of Receipt'}
                  name={'mode_of_receipt'}
                  placeholder="Select Receipt"
                  options={receiptOptions}
                  size={'sm'}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      mode_of_receipt_id: value ?? '',
                      sales_log_id: '',
                      part_number_id: '',
                      cust_rfq_no: '',
                      customer_id: '',
                      start_date: '',
                      end_date: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`sales_log_id`]: '',
                      [`date_range`]: '',
                      [`cust_rfq_no`]: '',
                      [`part_number_id`]: '',
                      [`customer_id`]: '',
                      [`rfq_id`]: '',
                    });
                  }}
                  isDisabled={queryParams?.sales_log_id !== ''}
                  isClearable={true}
                />
                <FieldInput
                  key={`cust_rfq_no_${resetKey}`}
                  name="cust_rfq_no"
                  label="Customer RFQ No"
                  placeholder="Customer RFQ No"
                  size={'sm'}
                  onValueChange={(value) => {
                    handleRFQNoChange(value ?? '');
                  }}
                  isDisabled={queryParams?.sales_log_id != ''}
                />
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
                  key={`customer_id_${resetKey}`}
                  name="customer_id"
                  placeholder="Customer"
                  label="Customer"
                  size={'sm'}
                  options={customerOptions}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      customer_id: value ?? '',
                      cust_rfq_no: '',
                      sales_log_id: '',
                      part_number_id: '',
                      mode_of_receipt_id: '',
                      start_date: '',
                      end_date: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`sales_log_id`]: '',
                      [`date_range`]: '',
                      [`part_number_id`]: '',
                      [`mode_of_receipt`]: '',
                      [`cust_rfq_no`]: '',
                      [`rfq_id`]: '',
                    });
                  }}
                  isClearable={true}
                  isDisabled={queryParams?.sales_log_id !== ''}
                />
                <FieldSelect
                  label={'Part Number'}
                  name={`part_number_id`}
                  key={`part_number_id_${resetKey}`}
                  size={'sm'}
                  options={spareOptions ?? []}
                  isClearable={true}
                  onValueChange={(value) => {
                    searchingPartNo.current = value ?? '';
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      part_number_id: value ?? '',
                      sales_log_id: '',
                      customer_id: '',
                      cust_rfq_no: '',
                      mode_of_receipt_id: '',
                      start_date: '',
                      end_date: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`sales_log_id`]: '',
                      [`date_range`]: '',
                      [`mode_of_receipt`]: '',
                      [`customer_id`]: '',
                      [`cust_rfq_no`]: '',
                      [`rfq_id`]: '',
                    });
                  }}
                  selectProps={{
                    isLoading: partsLoading,
                    noOptionsMessage: () => 'No parts found',
                    onInputChange: (event: any) => {
                      setPartNumberDebounced(event);
                    },
                  }}
                  isDisabled={queryParams?.sales_log_id !== ''}
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
                        sales_log_id: '',
                        customer_id: '',
                        cust_rfq_no: '',
                        mode_of_receipt_id: '',
                        start_date: value.from
                          ? format(new Date(value.from), 'yyyy-MM-dd')
                          : '',
                        end_date: value.to
                          ? format(new Date(value.to), 'yyyy-MM-dd')
                          : '',
                        page: 1,
                      }));

                      form.setValues({
                        [`sales_log_id`]: '',
                        [`part_number_id`]: '',
                        [`mode_of_receipt`]: '',
                        [`customer_id`]: '',
                        [`cust_rfq_no`]: '',
                        [`rfq_id`]: '',
                      });
                    }
                  }}
                  minDate={minDate}
                  maxDate={maxDate}
                  onClear={handleDateRangeClear}
                  dateRangePickerProps={{
                    inputProps: {
                      isDisabled:
                        queryParams?.sales_log_id !== '' &&
                        queryParams?.sales_log_id !== null,
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
                    setSpareOptions([]);
                    setQueryParams(initialFormData);
                    setResetKey((prevKey) => prevKey + 1);
                    form.setValues({
                      [`sales_log_id`]: '',
                      [`part_number_id`]: '',
                      [`customer_id`]: '',
                      [`cust_rfq_no`]: '',
                      [`rfq_id`]: '',
                      [`date_range`]: '',
                    });
                    triggerDateClear();
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
              SEL List
            </Heading>
          </HStack>
          <LoadingOverlay isLoading={loading || listLoading || exportStatus}>
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
                    exportTableData={(format: string) =>
                      exportTableData(format)
                    }
                  />

                  <PageLimit
                    currentLimit={itemsPerPage}
                    loading={listLoading}
                    changeLimit={changePageLimit}
                  />
                </Box>
              </Box>
            </Box>

            <DataTable
              columns={columns}
              data={tableData}
              loading={listLoading}
              tableProps={{ variant: 'simple' }}
              onSortChange={handleSortChange}
              sortDirection={sortDirection}
              sortBy={sortBy}
            />
            <Box p={4} mt={4} display="flex" justifyContent="space-between">
              {listData &&
                listData?.data &&
                listData?.current_page &&
                listData?.total > 0 && (
                  <Text fontSize="sm" color="gray.500">
                    {`Showing ${(listData?.current_page - 1) * itemsPerPage + 1} to ${Math.min(listData?.current_page * itemsPerPage, listData?.total)} of ${listData?.total} records`}
                  </Text>
                )}
              <Pagination
                currentPage={listData?.current_page ?? 1}
                totalCount={listData?.total ?? 0}
                pageSize={itemsPerPage}
                onPageChange={(page) => {
                  setQueryParams({ ...queryParams, page });
                }}
              />
            </Box>
          </LoadingOverlay>
        </Box>
        <PreviewPopup
          isOpen={isPreviewModalOpen}
          onClose={handleCloseModal}
          data={previewData}
        />
      </Stack>
    </SlideIn>
  );
};

export default SELMaster;
