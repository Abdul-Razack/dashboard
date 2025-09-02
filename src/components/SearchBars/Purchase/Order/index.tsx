import React, { useEffect, useRef, useState } from 'react';

import { EditIcon, ViewIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  HStack,
  IconButton,
  Link,
  ListItem,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';
import { HiRefresh } from 'react-icons/hi';
import { HiPrinter } from 'react-icons/hi';
import { LuCheck, LuX } from 'react-icons/lu';
import { TbMailForward } from 'react-icons/tb';
import { useQueryClient } from 'react-query';
import { UseQueryResult } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { FieldDateRangePicker } from '@/components/FieldDateRangePicker';
import { FieldSelect } from '@/components/FieldSelect';
import { SlideIn } from '@/components/SlideIn';
import {
  getPRTypeLabel,
  transformPartsToSelectOptions,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import useCurrencySymbol from '@/hooks/useCurrencySymbol';
import PartDetailText from '@/pages/Purchase/Quotation/PartDetailText';
import { getAPICall } from '@/services/apiService';
import { OptionsListPayload } from '@/services/apiService/Schema/OptionsSchema';
import {
  PRTypeListPayload,
  PartNumberBulkPayload,
  PartNumberSearchPayload,
} from '@/services/apiService/Schema/PRSchema';
// import { useCustomerList } from '@/services/master/services';
import { PurchaseOrderDataColumn } from '@/services/purchase/purchase-orders/schema';
import {
  usePurchaseOrderIndex,
  usePurchaseOrderList,
} from '@/services/purchase/purchase-orders/services';

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
  onEmailTriggered?: (data: any) => void;
  isModal: boolean;
  resetTrigger?: boolean;
}

export const POSearch: React.FC<SearchBarProps> = ({
  onSearchFinished,
  setModuleLoading,
  additionalParams,
  existingPRFQ,
  onPreviewClicked,
  onPRFQChanged,
  onEmailTriggered,
  isModal,
  resetTrigger,
}) => {
  const navigate = useNavigate();
  const [partsLoading, setPartsLoading] = useState<boolean>(true);
  const initialFormData = {
    purchase_order_id: '',
    purchase_request_id: '',
    ref_id: '',
    customer_id: '',
    type: '',
    part_number_id: '',
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
  const [spareQueryParams, setSpareQueryParams] = useState<any>({});
  const [spareOptions, setSpareOptions] = useState<TODO>([]);
  const [prTypeOptions, setPRTypeOptions] = useState<any>([]);
  const prevQueryParamsRef = useRef(queryParams);
  const [selectedPRFQ, setSelectedPRFQ] = useState<number>(0);
  const [vendorOptions, setVendorOptions] = useState<any>([]);
  const searchingPartNo = useRef(queryParams.part_number_id);
  const form = useForm({
    onValidSubmit: (values) => {
      console.log(values);
      // setQueryParams({ search: values });
    },
  });
  const poList: UseQueryResult<QueryData, unknown> = usePurchaseOrderList();
  const poOptions = transformToSelectOptions(poList.data);
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

  const toggleItem = (item: any) => {
    console.log(item);
    setSelectedPRFQ(item);
    setColumns(tableColumns);
  };

  const sendMailNotification = (data: any) => {
    if (onEmailTriggered) {
      onEmailTriggered(data?.id);
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

  const getBulkCustomersList = async (customers: any) => {
    try {
      const response = await getAPICall(
        endPoints.bulk.customer_list_by_customer_id_bulk,
        OptionsListPayload,
        { customer_ids: customers }
      );
      const options = transformToSelectOptions(response);
      console.log(options);
      setVendorOptions(options);
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
      setCounter((prevKey) => prevKey + 1);
      prevQueryParamsRef.current = queryParams;
      queryClient.invalidateQueries('purchaseOrderIndex');
      if (queryParams?.purchase_order_id) {
        setColumnOrder('poId');
      } else if (queryParams?.customer_id) {
        setColumnOrder('vendorName');
      } else if (queryParams?.part_number_id.length > 0) {
        setColumnOrder('partNo');
      } else if (queryParams?.ref_id || queryParams?.type) {
        setColumnOrder('mrTypeRef');
      } else if (queryParams?.purchase_request_id) {
        setColumnOrder('mrNo');
      } else if (queryParams?.start_date || queryParams?.end_date) {
        setColumnOrder('createdAt');
      } else {
        setColumnOrder('poId');
      }
    } else {
      setColumnOrder('poId');
    }
    console.log(queryParams);
  }, [queryParams]);

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
      console.log(previewData);
      onPreviewClicked(previewData);
    }
  };

  const POList = usePurchaseOrderIndex(queryParams);
  const [partNumber, setPartNumber] = useState('');
  const columnHelper = createColumnHelper<PurchaseOrderDataColumn>();
  const [columnOrder, setColumnOrder] = useState('poId');
  const tableColumns = [
    ...(columnOrder === 'poId'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = POList?.data?.current_page ?? 1;
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
            cell: (info) => {
              const row = info.row.original;
              return `${row.id}${row.version && row.version > 0 ? 'R' + row.version : ''}`;
            },
            header: 'PO No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
          }),
          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((prInfo) => prInfo?.id))
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Q.No',
            id: 'q_no',
          }),

          columnHelper.accessor('rfq_ids', {
            cell: (info) => {
              const uniqueItems = Array.from(new Set(info.getValue()));

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((rfq, index) => (
                    <ListItem key={`${index}-${rfq}`}>
                      <Text>{rfq}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'RFQ.No',
            id: 'rfq_no',
          }),

          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
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

          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotations = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) => quotation.vendor_quotation_no)
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotations.map((vendorQuotationNo, index) => (
                    <ListItem key={`${index}-${vendorQuotationNo}`}>
                      <Text>{vendorQuotationNo}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Ven Quo No',
            id: 'vendor_q_no',
          }),

          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotationDates = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) =>
                      quotation?.vendor_quotation_date
                        ? format(
                            new Date(quotation.vendor_quotation_date),
                            'dd/MM/yy'
                          )
                        : ''
                    )
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotationDates.map((quotationDate, index) => (
                    <ListItem key={`${index}-${quotationDate}`}>
                      <Text>{quotationDate}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Quo Exp Date',
            id: 'vendor_q_dates',
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
                  header: 'Clo Item',
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
          columnHelper.accessor('total_price', {
            cell: (info) => {
              const row = info.row.original; // Get full row data
              const currencySymbol = useCurrencySymbol(
                row.currency_id.toString()
              ); // Access currency_id from row data

              return `${currencySymbol} ${info.getValue()?.toFixed(2)}`; // Combine currency symbol with total price
            },
            header: 'PO Value',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_value',
            },
            id: 'total_price',
          }),
          columnHelper.accessor('purchase_requests', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((prInfo) => prInfo?.ref))
              );
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF NO',
            id: 'Ref_no',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === false ? 'Open' : 'Closed'),
            header: 'Status',
            id: 'status',
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
                        onClick={() => {
                          if (info.row.original.quotations.length > 0) {
                            navigate(
                              `/purchase/purchase-order/${info.row.original.id}/edit`
                            );
                          } else {
                            navigate(
                              `/purchase/purchase-order/${info.row.original.id}/direct/edit`
                            );
                          }
                        }}
                        isDisabled={info.row.original.is_editable !== true}
                      />
                      <IconButton
                        aria-label="Send Mail"
                        icon={<TbMailForward />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => {
                          sendMailNotification(info.row.original);
                        }}
                      />
                      <Link
                        href={`/preview/purchase-order/${info.row.original.token}`}
                        isExternal
                      >
                        <IconButton
                          aria-label="View"
                          icon={<HiPrinter />}
                          size={'sm'}
                          minW={'1.5rem'}
                          height={'1.5rem'}
                        />
                      </Link>
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
    ...(columnOrder === 'partNo'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = POList?.data?.current_page ?? 1;
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
            cell: (info) => {
              const row = info.row.original;
              return `${row.id}${row.version && row.version > 0 ? 'R' + row.version : ''}`;
            },
            header: 'PO No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
          }),
          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotations = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) => quotation.vendor_quotation_no)
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotations.map((vendorQuotationNo, index) => (
                    <ListItem key={`${index}-${vendorQuotationNo}`}>
                      <Text>{vendorQuotationNo}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Ven Quo No',
            id: 'vendor_q_no',
          }),

          columnHelper.accessor('rfq_ids', {
            cell: (info) => {
              const uniqueItems = Array.from(new Set(info.getValue()));

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((rfq, index) => (
                    <ListItem key={`${index}-${rfq}`}>
                      <Text>{rfq}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'RFQ.No',
            id: 'rfq_no',
          }),

          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
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

          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotations = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) => quotation.vendor_quotation_no)
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotations.map((vendorQuotationNo, index) => (
                    <ListItem key={`${index}-${vendorQuotationNo}`}>
                      <Text>{vendorQuotationNo}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Ven Quo No',
            id: 'vendor_q_no',
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
                  header: 'Clo Item',
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
          columnHelper.accessor('total_price', {
            cell: (info) => {
              const row = info.row.original; // Get full row data
              const currencySymbol = useCurrencySymbol(
                row.currency_id.toString()
              ); // Access currency_id from row data

              return `${currencySymbol} ${info.getValue()?.toFixed(2)}`; // Combine currency symbol with total price
            },
            header: 'PO Value',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_value',
            },
            id: 'total_price',
          }),
          columnHelper.accessor('purchase_requests', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((prInfo) => prInfo?.ref))
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((ref, index) => (
                    <ListItem key={`${index}-${ref}`}>
                      <Text>{ref}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF NO',
            id: 'Ref_no',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === false ? 'Open' : 'Closed'),
            header: 'Status',
            id: 'status',
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
                        onClick={() => {
                          if (info.row.original.quotations.length > 0) {
                            navigate(
                              `/purchase/purchase-order/${info.row.original.id}/edit`
                            );
                          } else {
                            navigate(
                              `/purchase/purchase-order/${info.row.original.id}/direct/edit`
                            );
                          }
                        }}
                        isDisabled={info.row.original.is_editable !== true}
                      />
                      <IconButton
                        aria-label="Send Mail"
                        icon={<TbMailForward />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => {
                          sendMailNotification(info.row.original);
                        }}
                      />
                      <Link
                        href={`/preview/purchase-order/${info.row.original.token}`}
                        isExternal
                      >
                        <IconButton
                          aria-label="View"
                          icon={<HiPrinter />}
                          size={'sm'}
                          minW={'1.5rem'}
                          height={'1.5rem'}
                        />
                      </Link>
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
    ...(columnOrder === 'vendorName'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = POList?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),

          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('id', {
            cell: (info) => {
              const row = info.row.original;
              return `${row.id}${row.version && row.version > 0 ? 'R' + row.version : ''}`;
            },
            header: 'PO No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
          }),

          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotations = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) => quotation.vendor_quotation_no)
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotations.map((vendorQuotationNo, index) => (
                    <ListItem key={`${index}-${vendorQuotationNo}`}>
                      <Text>{vendorQuotationNo}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Ven Quo No',
            id: 'vendor_q_no',
          }),

          columnHelper.accessor('rfq_ids', {
            cell: (info) => {
              const uniqueItems = Array.from(new Set(info.getValue()));

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((rfq, index) => (
                    <ListItem key={`${index}-${rfq}`}>
                      <Text>{rfq}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'RFQ.No',
            id: 'rfq_no',
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

          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotations = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) => quotation.vendor_quotation_no)
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotations.map((vendorQuotationNo, index) => (
                    <ListItem key={`${index}-${vendorQuotationNo}`}>
                      <Text>{vendorQuotationNo}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Ven Quo No',
            id: 'vendor_q_no',
          }),
          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotationDates = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) =>
                      quotation?.vendor_quotation_date
                        ? format(
                            new Date(quotation.vendor_quotation_date),
                            'dd/MM/yy'
                          )
                        : ''
                    )
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotationDates.map((quotationDate, index) => (
                    <ListItem key={`${index}-${quotationDate}`}>
                      <Text>{quotationDate}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Quo Exp Date',
            id: 'vendor_q_dates',
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
                  header: 'Clo Item',
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
          columnHelper.accessor('total_price', {
            cell: (info) => {
              const row = info.row.original; // Get full row data
              const currencySymbol = useCurrencySymbol(
                row.currency_id.toString()
              ); // Access currency_id from row data

              return `${currencySymbol} ${info.getValue()?.toFixed(2)}`; // Combine currency symbol with total price
            },
            header: 'PO Value',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_value',
            },
            id: 'total_price',
          }),
          columnHelper.accessor('purchase_requests', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((prInfo) => prInfo?.ref))
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((ref, index) => (
                    <ListItem key={`${index}-${ref}`}>
                      <Text>{ref}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF NO',
            id: 'Ref_no',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === false ? 'Open' : 'Closed'),
            header: 'Status',
            id: 'status',
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
                        onClick={() => {
                          if (info.row.original.quotations.length > 0) {
                            navigate(
                              `/purchase/purchase-order/${info.row.original.id}/edit`
                            );
                          } else {
                            navigate(
                              `/purchase/purchase-order/${info.row.original.id}/direct/edit`
                            );
                          }
                        }}
                        isDisabled={info.row.original.is_editable !== true}
                      />
                      <IconButton
                        aria-label="Send Mail"
                        icon={<TbMailForward />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => {
                          sendMailNotification(info.row.original);
                        }}
                      />
                      <Link
                        href={`/preview/purchase-order/${info.row.original.token}`}
                        isExternal
                      >
                        <IconButton
                          aria-label="View"
                          icon={<HiPrinter />}
                          size={'sm'}
                          minW={'1.5rem'}
                          height={'1.5rem'}
                        />
                      </Link>
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
              const currentPage = POList?.data?.current_page ?? 1;
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
            cell: (info) => {
              const row = info.row.original;
              return `${row.id}${row.version && row.version > 0 ? 'R' + row.version : ''}`;
            },
            header: 'PO No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
          }),

          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotations = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) => quotation.vendor_quotation_no)
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotations.map((vendorQuotationNo, index) => (
                    <ListItem key={`${index}-${vendorQuotationNo}`}>
                      <Text>{vendorQuotationNo}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Ven Quo No',
            id: 'vendor_q_no',
          }),

          columnHelper.accessor('rfq_ids', {
            cell: (info) => {
              const uniqueItems = Array.from(new Set(info.getValue()));

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((rfq, index) => (
                    <ListItem key={`${index}-${rfq}`}>
                      <Text>{rfq}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'RFQ.No',
            id: 'rfq_no',
          }),

          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotations = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) => quotation.vendor_quotation_no)
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotations.map((vendorQuotationNo, index) => (
                    <ListItem key={`${index}-${vendorQuotationNo}`}>
                      <Text>{vendorQuotationNo}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Ven Quo No',
            id: 'vendor_q_no',
          }),
          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotationDates = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) =>
                      quotation?.vendor_quotation_date
                        ? format(
                            new Date(quotation.vendor_quotation_date),
                            'dd/MM/yy'
                          )
                        : ''
                    )
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotationDates.map((quotationDate, index) => (
                    <ListItem key={`${index}-${quotationDate}`}>
                      <Text>{quotationDate}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Quo Exp Date',
            id: 'vendor_q_dates',
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
                  header: 'Clo Item',
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
          columnHelper.accessor('total_price', {
            cell: (info) => {
              const row = info.row.original; // Get full row data
              const currencySymbol = useCurrencySymbol(
                row.currency_id.toString()
              ); // Access currency_id from row data

              return `${currencySymbol} ${info.getValue()?.toFixed(2)}`; // Combine currency symbol with total price
            },
            header: 'PO Value',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_value',
            },
            id: 'total_price',
          }),
          columnHelper.accessor('purchase_requests', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((prInfo) => prInfo?.ref))
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((ref, index) => (
                    <ListItem key={`${index}-${ref}`}>
                      <Text>{ref}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF NO',
            id: 'Ref_no',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === false ? 'Open' : 'Closed'),
            header: 'Status',
            id: 'status',
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
                        onClick={() => {
                          if (info.row.original.quotations.length > 0) {
                            navigate(
                              `/purchase/purchase-order/${info.row.original.id}/edit`
                            );
                          } else {
                            navigate(
                              `/purchase/purchase-order/${info.row.original.id}/direct/edit`
                            );
                          }
                        }}
                        isDisabled={info.row.original.is_editable !== true}
                      />
                      <IconButton
                        aria-label="Send Mail"
                        icon={<TbMailForward />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => {
                          sendMailNotification(info.row.original);
                        }}
                      />
                      <Link
                        href={`/preview/purchase-order/${info.row.original.token}`}
                        isExternal
                      >
                        <IconButton
                          aria-label="View"
                          icon={<HiPrinter />}
                          size={'sm'}
                          minW={'1.5rem'}
                          height={'1.5rem'}
                        />
                      </Link>
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
    ...(columnOrder === 'mrTypeRef'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = POList?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('purchase_requests', {
            cell: (info) => {
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {info.getValue().map((prInfo, index) => {
                    return (
                      <ListItem key={`${index}-${counter}`}>
                        <Text>{getPRTypeLabel(prInfo.type)}</Text>
                      </ListItem>
                    );
                  })}
                </UnorderedList>
              );
            },
            header: 'MR Type',
            id: 'mrtype',
          }),
          columnHelper.accessor('purchase_requests', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((prInfo) => prInfo?.ref))
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((ref, index) => (
                    <ListItem key={`${index}-${ref}`}>
                      <Text>{ref}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF NO',
            id: 'Ref_no',
          }),

          columnHelper.accessor('id', {
            cell: (info) => {
              const row = info.row.original;
              return `${row.id}${row.version && row.version > 0 ? 'R' + row.version : ''}`;
            },
            header: 'PO No',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'id',
            },
          }),

          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotations = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) => quotation.vendor_quotation_no)
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotations.map((vendorQuotationNo, index) => (
                    <ListItem key={`${index}-${vendorQuotationNo}`}>
                      <Text>{vendorQuotationNo}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Ven Quo No',
            id: 'vendor_q_no',
          }),

          columnHelper.accessor('rfq_ids', {
            cell: (info) => {
              const uniqueItems = Array.from(new Set(info.getValue()));

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((rfq, index) => (
                    <ListItem key={`${index}-${rfq}`}>
                      <Text>{rfq}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'RFQ.No',
            id: 'rfq_no',
          }),

          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
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

          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotations = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) => quotation.vendor_quotation_no)
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotations.map((vendorQuotationNo, index) => (
                    <ListItem key={`${index}-${vendorQuotationNo}`}>
                      <Text>{vendorQuotationNo}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Ven Quo No',
            id: 'vendor_q_no',
          }),
          columnHelper.accessor('quotations', {
            cell: (info) => {
              const uniqueQuotationDates = Array.from(
                new Set(
                  info
                    .getValue()
                    .map((quotation) =>
                      quotation?.vendor_quotation_date
                        ? format(
                            new Date(quotation.vendor_quotation_date),
                            'dd/MM/yy'
                          )
                        : ''
                    )
                )
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueQuotationDates.map((quotationDate, index) => (
                    <ListItem key={`${index}-${quotationDate}`}>
                      <Text>{quotationDate}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'Quo Exp Date',
            id: 'vendor_q_dates',
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
                  header: 'Clo Item',
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
          columnHelper.accessor('total_price', {
            cell: (info) => {
              const row = info.row.original; // Get full row data
              const currencySymbol = useCurrencySymbol(
                row.currency_id.toString()
              ); // Access currency_id from row data

              return `${currencySymbol} ${info.getValue()?.toFixed(2)}`; // Combine currency symbol with total price
            },
            header: 'PO Value',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'total_value',
            },
            id: 'total_price',
          }),

          columnHelper.accessor('purchase_requests', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((prInfo) => prInfo?.id))
              );
              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((id, index) => (
                    <ListItem key={`${index}-${id}-${counter}`}>
                      <Text>{id}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'REF NO',
            id: 'Ref_no',
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Req User',
          }),
          columnHelper.accessor('is_closed', {
            cell: (info) => (info.getValue() === false ? 'Open' : 'Closed'),
            header: 'Status',
            id: 'status',
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
                        onClick={() => {
                          if (info.row.original.quotations.length > 0) {
                            navigate(
                              `/purchase/purchase-order/${info.row.original.id}/edit`
                            );
                          } else {
                            navigate(
                              `/purchase/purchase-order/${info.row.original.id}/direct/edit`
                            );
                          }
                        }}
                        isDisabled={info.row.original.is_editable !== true}
                      />
                      <IconButton
                        aria-label="Send Mail"
                        icon={<TbMailForward />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() => {
                          sendMailNotification(info.row.original);
                        }}
                      />
                      <Link
                        href={`/preview/purchase-order/${info.row.original.token}`}
                        isExternal
                      >
                        <IconButton
                          aria-label="View"
                          icon={<HiPrinter />}
                          size={'sm'}
                          minW={'1.5rem'}
                          height={'1.5rem'}
                        />
                      </Link>
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
    if (POList?.data) {
      onSearchFinished(POList?.data, columns);
    }
    if (POList?.data?.part_numbers) {
      if (POList?.data?.part_numbers.length > 0) {
        getBulkPartNumberList(POList?.data?.part_numbers);
      } else {
        setSpareOptions([]);
      }
    }
    if (POList?.data?.customer_ids) {
      if (POList?.data?.customer_ids.length > 0) {
        getBulkCustomersList(POList?.data?.customer_ids);
      } else {
        setSpareOptions([]);
      }
    }
    if (POList?.data?.min_date) {
      setMinDate(POList?.data?.min_date);
    }
    if (POList?.data?.max_date) {
      setMaxDate(POList?.data?.max_date);
    }
  }, [POList?.data]);

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
    getPartNumberList();
  }, []);

  useEffect(() => {
    if (POList?.data && columns) {
      onSearchFinished(POList?.data, tableColumns);
      if (onPRFQChanged) {
        onPRFQChanged(selectedPRFQ);
      }
    }
  }, [POList?.data, columns]);

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
                  label={'PO No'}
                  name={'purchase_order_id'}
                  key={`purchase_order_id_${resetKey}`}
                  options={poOptions ?? []}
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
                      purchase_order_id: value ?? '',
                      purchase_request_id: '',
                      type: '',
                      part_number_id: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`type`]: [],
                      [`part_number_id`]: '',
                      [`date_range`]: '',
                    });
                  }}
                  size={'sm'}
                  isDisabled={queryParams?.ref_id}
                  menuPortalTarget={document.body}
                />

                <FieldSelect
                  label="Vendor Name"
                  name="vendor_name"
                  key={`vendor_name_${resetKey}`}
                  placeholder="Select..."
                  options={vendorOptions}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      customer_id: value ?? '',
                    }));
                  }}
                  selectProps={{
                    noOptionsMessage: () => 'No Vendor found',
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                  isClearable={true}
                  size="sm"
                  isDisabled={queryParams?.purchase_order_id}
                />

                <FieldSelect
                  label={'Part Number'}
                  name={`part_number_id`}
                  key={`part_number_id_${resetKey}`}
                  size={'sm'}
                  menuPortalTarget={document.body}
                  options={spareOptions ?? []}
                  isClearable={true}
                  onValueChange={(value) => {
                    searchingPartNo.current = value ?? '';
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      type: '',
                      customer_id: '',
                      ref_id: '',
                      part_number_id: value ?? '',
                      page: 1,
                    }));
                    form.setValues({
                      [`type`]: [],
                      [`ref_id`]: [],
                      [`vendor_name`]: [],
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
                  isDisabled={queryParams?.purchase_order_id}
                  sx={{ mb: isModal === true ? '2' : '0' }}
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
                  label={'MR Type'}
                  key={`type_${resetKey}`}
                  name={'type'}
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
                  selectProps={{
                    noOptionsMessage: () => 'No Type found',
                    styles: {
                      menuPortal: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                    },
                  }}
                  isClearable={true}
                  size={'sm'}
                  menuPortalTarget={document.body}
                  isDisabled={queryParams?.purchase_order_id}
                  sx={{ mb: isModal === true ? '2' : '0' }}
                />
                <FieldSelect
                  label={'REF No'}
                  name={'ref_id'}
                  key={`ref_id_${resetKey}`}
                  placeholder="Select"
                  options={prTypeOptions ?? []}
                  // onValueChange={(value) => {
                  // handleChange('type', value ?? []);
                  // handleChange('page', 1);
                  // }}
                  isClearable={true}
                  size={'sm'}
                  isDisabled={queryParams?.purchase_order_id}
                  menuPortalTarget={document.body}
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
                  setResetKey((prevKey) => prevKey + 1);
                  setSpareOptions([]);
                  setQueryParams(initialFormData);
                  form.setValues({
                    [`type`]: '',
                    [`purchase_request_id`]: '',
                    [`part_number_id`]: '',
                    [`date_range`]: '',
                    [`ref_id`]: '',
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

export default POSearch;
