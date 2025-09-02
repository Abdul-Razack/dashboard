import React, { useEffect, useRef, useState } from 'react';

import { ChevronDownIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  HStack,
  IconButton,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import debounce from 'lodash.debounce';
import { BiEditAlt } from 'react-icons/bi';
import { HiRefresh } from 'react-icons/hi';
import { LuCheck, LuX } from 'react-icons/lu';
import { useQueryClient } from 'react-query';
import { UseQueryResult } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { FieldDateRangePicker } from '@/components/FieldDateRangePicker';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { PRFQCustomersPopup } from '@/components/Popups/PRFQCustomers';
import { SlideIn } from '@/components/SlideIn';
import {
  getPRTypeLabel,
  transformPartsToSelectOptions,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
// import useCustomerName from '@/hooks/useCustomerName';
import { getAPICall } from '@/services/apiService';
import { OptionsListPayload } from '@/services/apiService/Schema/OptionsSchema';
import {
  PRTypeListPayload,
  PartNumberBulkPayload,
  PartNumberSearchPayload,
} from '@/services/apiService/Schema/PRSchema';
import { usePRFQList } from '@/services/purchase/prfq/services';
import { QuotationDataColumn } from '@/services/purchase/quotation/schema';
import {
  useQuotationIndex,
  useQuotationList,
} from '@/services/purchase/quotation/services';

import PartDetailText from '../../../../pages/Purchase/Quotation/PartDetailText';

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
  existingQuotation?: number;
  onPreviewClicked?: (data: any) => void;
  onPRFQChanged?: (data: any) => void;
  isModal: boolean;
  resetTrigger?: boolean;
}

export const QuotationSearch: React.FC<SearchBarProps> = ({
  onSearchFinished,
  setModuleLoading,
  additionalParams,
  existingQuotation,
  onPreviewClicked,
  onPRFQChanged,
  isModal,
  resetTrigger,
}) => {
  const navigate = useNavigate();
  const [initialSearchFinished, setInitialSearchFinished] =
    useState<boolean>(false);
  const [partsLoading, setPartsLoading] = useState<boolean>(true);
  const initialFormData = {
    vendor_quotation_no: '',
    quotation_id: '',
    rfq_id: '',
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
  const [counter, setCounter] = useState(0);
  const queryClient = useQueryClient();
  const [minDate, setMinDate] = useState<any>(null);
  const [maxDate, setMaxDate] = useState<any>(null);
  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const [spareQueryParams, setSpareQueryParams] = useState<any>({});
  const [spareOptions, setSpareOptions] = useState<TODO>([]);
  const [prOptions, setPROptions] = useState<any>([]);
  const [prTypeOptions, setPRTypeOptions] = useState<any>([]);
  const prevQueryParamsRef = useRef(queryParams);
  const [selectedQuotation, setSelectedQuotation] = useState<number>(0);
  const [vendorOptions, setVendorOptions] = useState<any>([]);
  const searchingPartNo = useRef(queryParams.part_number_id);
  const form = useForm({
    onValidSubmit: (values) => {
      console.log(values);
      // setQueryParams({ search: values });
    },
  });
  const rfqList: UseQueryResult<QueryData, unknown> = usePRFQList();
  const rfqOptions = transformToSelectOptions(rfqList.data);
  const [resetKey, setResetKey] = useState(0);
  const quotations: UseQueryResult<QueryData, unknown> = useQuotationList();
  const quotationOptions = transformToSelectOptions(quotations.data);
  const [showCustomerModal, toggleCustomerModal] = useState(false);
  const [prfqInfo, setPRFQData] = useState<TODO>([]);
  const handleCloseModal = () => {
    toggleCustomerModal(false);
    setPRFQData([]);
  };
  let debounceTimeout: any;

  const handleInputChange = (value: any, field: string) => {
    const updatedData: any = { ...queryParams };
    updatedData[field] = value;
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      setQueryParams(updatedData);
    }, 500);
  };

  const getPRTypeList = async (type: string) => {
    try {
      const response = await getAPICall(
        endPoints.list.purchase_request_type,
        PRTypeListPayload,
        { type: type }
      );

      console.log(response);
      setPRTypeOptions(transformToSelectOptions(response));
    } catch (err) {
      setModuleLoading(false);
      console.log(err);
    }
  };

  const toggleItem = (item: any) => {
    console.log(item);
    setSelectedQuotation(item);
    setColumns(tableColumns);
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
      queryClient.invalidateQueries('quotationIndex');
      if (queryParams?.quotation_id) {
        setColumnOrder('quoID');
      } else if (queryParams?.rfq_id) {
        setColumnOrder('rfqID');
      } else if (queryParams?.customer_id) {
        setColumnOrder('vendorName');
      } else if (queryParams?.vendor_quotation_no) {
        setColumnOrder('venQuoNo');
      } else if (queryParams?.part_number_id.length > 0) {
        setColumnOrder('partNo');
      } else if (queryParams?.ref_id || queryParams?.type) {
        setColumnOrder('mrTypeRef');
      } else if (queryParams?.purchase_request_id) {
        setColumnOrder('mrNo');
      } else if (queryParams?.start_date || queryParams?.end_date) {
        setColumnOrder('createdAt');
      } else {
        setColumnOrder('quoID');
      }
    } else {
      setColumnOrder('quoID');
    }
    console.log(queryParams);
  }, [queryParams]);

  useEffect(() => {
    console.log(isModal);
  }, [isModal]);

  useEffect(() => {
    if (initialSearchFinished) {
      const updatedParams = {
        ...queryParams,
        ...additionalParams,
      };
      setQueryParams(updatedParams);
      if (additionalParams?.rfq_id) {
        form.setValues({ [`rfq_id`]: additionalParams?.rfq_id.toString() });
      }
      if (additionalParams?.customer_id) {
        form.setValues({
          [`vendor_name`]: additionalParams?.customer_id.toString(),
        });
      }
    }
  }, [additionalParams, initialSearchFinished]);

  useEffect(() => {
    setSelectedQuotation(0);
    setColumns(tableColumns);
  }, [resetTrigger]);

  useEffect(() => {
    console.log(existingQuotation);
    if (existingQuotation) {
      console.log(existingQuotation);
      setSelectedQuotation(existingQuotation);
      setColumns(tableColumns);
    }
  }, [existingQuotation]);

  const triggerPreview = (previewData: any) => {
    if (onPreviewClicked) {
      console.log(previewData);
      onPreviewClicked(previewData);
    }
  };

  // const openCustomers = (data: any) => {
  //   setPRFQData(data);
  //   toggleCustomerModal(true);
  //   // console.log(part_numbers);
  // };

  const QuotationList = useQuotationIndex(queryParams);
  const [partNumber, setPartNumber] = useState('');
  const columnHelper = createColumnHelper<QuotationDataColumn>();
  const [columnOrder, setColumnOrder] = useState('quoID');
  const tableColumns = [
    ...(columnOrder === 'quoID'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = QuotationList?.data?.current_page ?? 1;
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
            header: 'Q No',
            meta: {
              sortable: true,
              sortParam: 'id',
            }
          }),
          columnHelper.accessor('vendor_quotation_no', {
            cell: (info) => info.getValue(),
            header: 'Ven Quo No',
          }),
          columnHelper.accessor('vendor_quotation_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Ven Quo Date',
          }),
          columnHelper.accessor('expiry_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Quo Exp Date',
          }),
          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
          }),
          columnHelper.accessor('rfq_id', {
            cell: (info) => info.getValue(),
            header: 'PRFQ No',
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
            header: 'MR NO',
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

          columnHelper.accessor('rfq_need_by_date', {
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
                  cell: (info) =>
                    info.getValue() === false ? 'Open' : 'Closed',
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
                <Menu>
                  <MenuButton
                    as={Button}
                    size={'sm'}
                    bg="#0C2556"
                    color="white"
                    _hover={{ color: '#0C2556', bg: '#fff' }}
                    _active={{ color: '#0C2556', bg: '#fff' }}
                    rightIcon={<ChevronDownIcon />}
                  >
                    Actions
                  </MenuButton>
                  <MenuList
                    width="120px"
                    maxW="120px"
                    minW="120px"
                    boxShadow="md"
                    sx={{ overflow: 'hidden', padding: '4px' }}
                  >
                    <MenuItem
                      width="140px"
                      onClick={() =>
                        navigate(
                          `/purchase/quotation/${info.row.original.id}/update`
                        )
                      }
                    >
                      Partial Update
                    </MenuItem>
                    <MenuItem
                      width="140px"
                      onClick={() =>
                        navigate(
                          `/purchase/quotation/pricing/${info.row.original.id}/update`
                        )
                      }
                    >
                      Full Update
                    </MenuItem>
                    <MenuItem
                      width="140px"
                      onClick={() => triggerPreview(info.row.original)}
                      display={'none'}
                    >
                      View
                    </MenuItem>
                  </MenuList>
                </Menu>
                // <HStack spacing={4} gap=".5rem" justify={'flex-end'}>
                //   {isModal === false && (
                //     <React.Fragment>
                //       <IconButton
                //         aria-label="View"
                //         icon={<ViewIcon />}
                //         display={'none'}
                //         size={'sm'}
                //         minW={'1.5rem'}
                //         height={'1.5rem'}
                //         onClick={() => triggerPreview(info.row.original)}
                //       />
                //       <IconButton
                //         aria-label="Edit"
                //         icon={<EditIcon />}
                //         size={'sm'}
                //         minW={'1.5rem'}
                //         height={'1.5rem'}
                //         onClick={() =>
                //           navigate(`/purchase/quotation/${info.row.original.id}/update`)
                //         }
                //       />
                //       <IconButton
                //         aria-label="Pricing Update"
                //         icon={<BiEditAlt   />}
                //         size={'sm'}
                //         minW={'1.5rem'}
                //         height={'1.5rem'}
                //         onClick={() =>
                //           navigate(`/purchase/quotation/pricing/${info.row.original.id}/update`)
                //         }
                //       />
                //     </React.Fragment>
                //   )}
                //   {isModal === true && (
                //     <IconButton
                //       aria-label="action-button"
                //       colorScheme={
                //         selectedQuotation === info.row.original.id
                //           ? 'red'
                //           : 'green'
                //       }
                //       size={'xs'}
                //       onClick={() => {
                //         console.log(info.row.original);
                //         toggleItem(info.row.original.id); // Toggle logic here
                //       }}
                //       icon={
                //         selectedQuotation === info.row.original.id ? (
                //           <LuX />
                //         ) : (
                //           <LuCheck />
                //         )
                //       }
                //     ></IconButton>
                //   )}
                // </HStack>
              );
            },
            header: () => <Text textAlign="end">Actions</Text>,
            meta: {
              isNumeric: true,
            },
          }),
        ]
      : []),
    ...(columnOrder === 'venQuoNo'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = QuotationList?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('vendor_quotation_no', {
            cell: (info) => info.getValue(),
            header: 'Ven Quo No',
          }),
          columnHelper.accessor('vendor_quotation_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Ven Quo Date',
          }),
          columnHelper.accessor('expiry_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Quo Exp Date',
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
            cell: (info) => info.getValue(),
            header: 'Q No',
            meta: {
              sortable: true,
              sortParam: 'id',
            },
          }),
          columnHelper.accessor('rfq_id', {
            cell: (info) => info.getValue(),
            header: 'PRFQ No',
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

          columnHelper.accessor('rfq_need_by_date', {
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
                  cell: (info) =>
                    info.getValue() === false ? 'Open' : 'Closed',
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
                        display={'none'}
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
                            `/purchase/quotation/${info.row.original.id}/update`
                          )
                        }
                      />
                      <IconButton
                        aria-label="Pricing Update"
                        icon={<BiEditAlt />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/purchase/quotation/pricing/${info.row.original.id}/update`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedQuotation === info.row.original.id
                          ? 'red'
                          : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedQuotation === info.row.original.id ? (
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
              const currentPage = QuotationList?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('vendor_quotation_no', {
            cell: (info) => info.getValue(),
            header: 'Ven Quo No',
          }),
          columnHelper.accessor('vendor_quotation_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Ven Quo Date',
          }),
          columnHelper.accessor('expiry_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Quo Exp Date',
          }),

         columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'Q No',
            meta: {
              sortable: true,
              sortParam: 'id',
            },
          }),
          columnHelper.accessor('rfq_id', {
            cell: (info) => info.getValue(),
            header: 'PRFQ No',
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

          columnHelper.accessor('rfq_need_by_date', {
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
                  cell: (info) =>
                    info.getValue() === false ? 'Open' : 'Closed',
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
                        display={'none'}
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
                            `/purchase/quotation/${info.row.original.id}/update`
                          )
                        }
                      />
                      <IconButton
                        aria-label="Pricing Update"
                        icon={<BiEditAlt />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/purchase/quotation/pricing/${info.row.original.id}/update`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedQuotation === info.row.original.id
                          ? 'red'
                          : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedQuotation === info.row.original.id ? (
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
              const currentPage = QuotationList?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),          columnHelper.accessor('items', {
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
            header: 'Q No',
            meta: {
              sortable: true,
              sortParam: 'id',
            },
          }),
          columnHelper.accessor('rfq_id', {
            cell: (info) => info.getValue(),
            header: 'PRFQ No',
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

          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('vendor_quotation_no', {
            cell: (info) => info.getValue(),
            header: 'Ven Quo No',
          }),
          columnHelper.accessor('vendor_quotation_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Ven Quo Date',
          }),
          columnHelper.accessor('expiry_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Quo Exp Date',
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

          columnHelper.accessor('rfq_need_by_date', {
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
                  cell: (info) =>
                    info.getValue() === false ? 'Open' : 'Closed',
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
                        display={'none'}
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
                            `/purchase/quotation/${info.row.original.id}/update`
                          )
                        }
                      />
                      <IconButton
                        aria-label="Pricing Update"
                        icon={<BiEditAlt />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/purchase/quotation/pricing/${info.row.original.id}/update`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedQuotation === info.row.original.id
                          ? 'red'
                          : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedQuotation === info.row.original.id ? (
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
              const currentPage = QuotationList?.data?.current_page ?? 1;
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
            header: 'Q No',
            meta: {
              sortable: true,
              sortParam: 'id',
            },
          }),
          columnHelper.accessor('vendor_quotation_no', {
            cell: (info) => info.getValue(),
            header: 'Ven Quo No',
          }),
          columnHelper.accessor('vendor_quotation_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Ven Quo Date',
          }),
          columnHelper.accessor('expiry_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Quo Exp Date',
          }),
          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
          }),
          columnHelper.accessor('rfq_id', {
            cell: (info) => info.getValue(),
            header: 'PRFQ No',
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

          columnHelper.accessor('rfq_need_by_date', {
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
                  cell: (info) =>
                    info.getValue() === false ? 'Open' : 'Closed',
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
                        display={'none'}
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
                            `/purchase/quotation/${info.row.original.id}/update`
                          )
                        }
                      />
                      <IconButton
                        aria-label="Pricing Update"
                        icon={<BiEditAlt />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/purchase/quotation/pricing/${info.row.original.id}/update`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedQuotation === info.row.original.id
                          ? 'red'
                          : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedQuotation === info.row.original.id ? (
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
    ...(columnOrder === 'rfqID'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = QuotationList?.data?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            header: '#',
            meta: {
              sortable: false,
            },
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          columnHelper.accessor('rfq_id', {
            cell: (info) => info.getValue(),
            header: 'PRFQ No',
          }),

         columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'Q No',
            meta: {
              sortable: true,
              sortParam: 'id',
            },
          }),
          columnHelper.accessor('vendor_quotation_no', {
            cell: (info) => info.getValue(),
            header: 'Ven Quo No',
          }),
          columnHelper.accessor('vendor_quotation_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Ven Quo Date',
          }),
          columnHelper.accessor('expiry_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Quo Exp Date',
          }),
          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
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
            header: 'MR NO',
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

          columnHelper.accessor('rfq_need_by_date', {
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
                  cell: (info) =>
                    info.getValue() === false ? 'Open' : 'Closed',
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
                        display={'none'}
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
                            `/purchase/quotation/${info.row.original.id}/update`
                          )
                        }
                      />
                      <IconButton
                        aria-label="Pricing Update"
                        icon={<BiEditAlt />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/purchase/quotation/pricing/${info.row.original.id}/update`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedQuotation === info.row.original.id
                          ? 'red'
                          : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedQuotation === info.row.original.id ? (
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
              const currentPage = QuotationList?.data?.current_page ?? 1;
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

          columnHelper.accessor('purchase_requests', {
            cell: (info) => {
              const uniqueItems = Array.from(
                new Set(info.getValue().map((prInfo) => prInfo.type))
              );

              return (
                <UnorderedList styleType="none" marginInlineStart={0}>
                  {uniqueItems.map((type, index) => (
                    <ListItem key={`${index}-${type}`}>
                      <Text>{getPRTypeLabel(type)}</Text>
                    </ListItem>
                  ))}
                </UnorderedList>
              );
            },
            header: 'MR Type',
            id: 'mrtype',
          }),

         columnHelper.accessor('id', {
            cell: (info) => info.getValue(),
            header: 'Q No',
            meta: {
              sortable: true,
              sortParam: 'id',
            },
          }),
          columnHelper.accessor('vendor_quotation_no', {
            cell: (info) => info.getValue(),
            header: 'Ven Quo No',
          }),
          columnHelper.accessor('vendor_quotation_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Ven Quo Date',
          }),
          columnHelper.accessor('expiry_date', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Quo Exp Date',
          }),
          columnHelper.accessor('customer.business_name', {
            header: 'Vendor Name',
            cell: (info) => info.getValue(),
          }),

          columnHelper.accessor('customer.code', {
            header: 'Code',
            cell: (info) => info.getValue(),
          }),
          columnHelper.accessor('rfq_id', {
            cell: (info) => info.getValue(),
            header: 'PRFQ No',
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

          columnHelper.accessor('rfq_need_by_date', {
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
                  cell: (info) =>
                    info.getValue() === false ? 'Open' : 'Closed',
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
                        display={'none'}
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
                            `/purchase/quotation/${info.row.original.id}/update`
                          )
                        }
                      />
                      <IconButton
                        aria-label="Pricing Update"
                        icon={<BiEditAlt />}
                        size={'sm'}
                        minW={'1.5rem'}
                        height={'1.5rem'}
                        onClick={() =>
                          navigate(
                            `/purchase/quotation/pricing/${info.row.original.id}/update`
                          )
                        }
                      />
                    </React.Fragment>
                  )}
                  {isModal === true && (
                    <IconButton
                      aria-label="action-button"
                      colorScheme={
                        selectedQuotation === info.row.original.id
                          ? 'red'
                          : 'green'
                      }
                      size={'xs'}
                      onClick={() => {
                        console.log(info.row.original);
                        toggleItem(info.row.original.id); // Toggle logic here
                      }}
                      icon={
                        selectedQuotation === info.row.original.id ? (
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
    if (QuotationList?.data?.purchase_request_ids) {
      setPROptions(convertToOptions(QuotationList?.data?.purchase_request_ids));
    } else {
      setPROptions([]);
    }
    if (QuotationList?.data?.part_numbers) {
      if (QuotationList?.data?.part_numbers.length > 0) {
        getBulkPartNumberList(QuotationList?.data?.part_numbers);
      } else {
        setSpareOptions([]);
      }
    }
    if (QuotationList?.data?.customer_ids) {
      if (QuotationList?.data?.customer_ids.length > 0) {
        getBulkCustomersList(QuotationList?.data?.customer_ids);
      } else {
        setSpareOptions([]);
      }
    }
    if (QuotationList?.data?.min_date) {
      setMinDate(QuotationList?.data?.min_date);
    }
    if (QuotationList?.data?.max_date) {
      setMaxDate(QuotationList?.data?.max_date);
    }
    if (QuotationList?.data) {
      onSearchFinished(QuotationList?.data, columns);
      setInitialSearchFinished(true);
    }
  }, [QuotationList?.data]);

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
    getPartNumberList();
  }, []);

  useEffect(() => {
    if (QuotationList?.data && columns) {
      onSearchFinished(QuotationList?.data, tableColumns);
      if (onPRFQChanged) {
        onPRFQChanged(selectedQuotation);
      }
    }
  }, [QuotationList?.data, columns]);

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
                  label={'Quotation No'}
                  key={`quotation_id_${resetKey}`}
                  name={'quotation_id'}
                  options={quotationOptions ?? []}
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
                      quotation_id: value ?? '',
                      rfq_id: '',
                      customer_id: '',
                      purchase_request_id: '',
                      type: '',
                      part_number_id: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`type`]: '',
                      [`part_number_id`]: '',
                      [`date_range`]: '',
                    });
                  }}
                  size={'sm'}
                  isDisabled={queryParams?.ref_id}
                  menuPortalTarget={document.body}
                />

                <FieldSelect
                  label={'MR No'}
                  name={'purchase_request_id'}
                  key={`purchase_request_id_${resetKey}`}
                  options={prOptions ?? []}
                  isClearable={true}
                  selectProps={{
                    noOptionsMessage: () => 'No MR found',
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
                      purchase_request_id: value ?? '',
                      type: '',
                      start_date: '',
                      end_date: '',
                      part_number_id: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`type`]: '',
                      [`part_number_id`]: '',
                      [`date_range`]: '',
                    });
                    triggerDateClear();
                  }}
                  size={'sm'}
                  isDisabled={queryParams?.quotation_id}
                  menuPortalTarget={document.body}
                  sx={{ mb: isModal === true ? '2' : '0' }}
                  display={'none'}
                />

                <FieldSelect
                  label={'PRFQ No'}
                  key={`rfq_id_${resetKey}`}
                  name={'rfq_id'}
                  options={rfqOptions ?? []}
                  isClearable={true}
                  selectProps={{
                    noOptionsMessage: () => 'No PRFQ found',
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
                      rfq_id: value ?? '',
                      purchase_request_id: '',
                      type: '',
                      part_number_id: '',
                      page: 1,
                    }));
                    form.setValues({
                      [`type`]: '',
                      [`part_number_id`]: '',
                      [`date_range`]: '',
                    });
                  }}
                  size={'sm'}
                  isDisabled={queryParams?.quotation_id}
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
                  isDisabled={queryParams?.quotation_id}
                />

                <FieldInput
                  key={`vendor_quotation_no_${resetKey}`}
                  name="vendor_quotation_no"
                  label="Vendor Quo No"
                  placeholder="Vendor Quo No"
                  size={'sm'}
                  onValueChange={(value) =>
                    handleInputChange(value, 'vendor_quotation_no')
                  }
                  isDisabled={queryParams?.quotation_id}
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
                      customer_id: '',
                      ref_id: '',
                      part_number_id: value ?? '',
                      page: 1,
                    }));
                    form.setValues({
                      [`type`]: '',
                      [`ref_id`]: '',
                      [`vendor_name`]: '',
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
                  isDisabled={queryParams?.quotation_id || queryParams?.rfq_id}
                  sx={{ mb: isModal === true ? '2' : '0' }}
                />

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
                    }else{
                      setPRTypeOptions([]);
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
                  isDisabled={queryParams?.quotation_id || queryParams?.rfq_id}
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
                  isDisabled={queryParams?.quotation_id || queryParams?.rfq_id}
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
                        queryParams?.quotation_id ||
                        queryParams?.rfq_id ||
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
                  queryClient.invalidateQueries('quotationIndex');
                }}
              >
                Reset Form
              </Button>
            </Stack>
          </Box>
        </Formiz>

        <PRFQCustomersPopup
          isOpen={showCustomerModal}
          onClose={handleCloseModal}
          prfqInfo={prfqInfo}
        />
      </Stack>
    </SlideIn>
  );
};

export default QuotationSearch;
