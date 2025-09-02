import React, { useEffect, useRef, useState } from 'react';

import { EditIcon, ViewIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { FiChevronDown } from 'react-icons/fi';
import { HiPrinter, HiRefresh } from 'react-icons/hi';
import { LuPlus } from 'react-icons/lu';
import { LuDownload, LuUpload } from 'react-icons/lu';
import { UseQueryResult } from 'react-query';
import { useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { DataTable } from '@/components/DataTable';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import { PreviewPopup } from '@/components/PreviewContents/Masters';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { TableExport } from '@/components/TableExport';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  exportTableAs,
  handleDownload,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { uploadAPICall } from '@/services/apiService';
import { dataColumn } from '@/services/master/schema';
import {
  useCustomerIndex,
  useCustomerListCode,
  useUpdateCustomerStatus,
} from '@/services/master/services';
import { useContactTypeList } from '@/services/submaster/contacttype/services';

import { CustomerInfo } from './CustomerDetails/CustomerInfo';
import { FileUploadResponseModal } from './FileUploadResponseModal';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

const CustomerMaster = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const customerListCode = useCustomerListCode();
  const customerCodeOptions = transformToSelectOptions(customerListCode?.data);
  const contactTypeList: UseQueryResult<QueryData, unknown> =
    useContactTypeList();
  const contactTypeOptions = transformToSelectOptions(contactTypeList.data);
  const form = useForm({
    onValidSubmit: (values) => {
      console.log(values);
      // setQueryParams({ search: values });
    },
  });
  const [resetKey, setResetKey] = useState(0);
  const columnHelper = createColumnHelper<dataColumn>();
  const [loading, setLoading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<TODO>(null);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const toastError = useToastError();
  const toastSuccess = useToastSuccess();
  const [fileKey, setFileKey] = useState(0);
  const [responseData, setResponseData] = useState<TODO | null>(null);
  const [isRespModalOpen, setIsRespModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>([]);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [exportStatus, triggerExport] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf' | undefined>(
    undefined
  );
  const [exportStatusTrigger, setExportStatusTrigger] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const initialFormData = {
    page: 1,
    customer_id: '',
    business_name: '',
    contact_type_id: '',
    per_page: itemsPerPage,
  };

  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const {
    data: customerIndex,
    isLoading: customerIndexLoading,
    refetch: refreshCustomers,
  } = useCustomerIndex(queryParams);
  const [data, setData] = useState<TODO>([]);
  const prevQueryParamsRef = useRef(queryParams);

  const [columnOrder, setColumnOrder] = useState('businessName');
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setUploadedFile(selectedFile);
      setOpenConfirmation(true);
    }
    setFileKey((prevKey) => prevKey + 1);
  };

  const handleConfirm = () => {
    setLoading(true);
    confirmFileUpload();
    setOpenConfirmation(false); // Close the modal after confirmation
  };

  const handleCloseModal = () => {
    setIsRespModalOpen(false);
  };

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  const { data: downloadData, refetch: downloadDataReload } = useCustomerIndex(
    {
      ...queryParams,
      per_page: '-1',
    },
    { enabled: false }
  );

  useEffect(() => {
    if (downloadData?.data && exportStatus) {
      triggerExport(false);
      exportTableAs(columns, downloadData?.data, 'customers', exportType);
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
    if (customerIndex?.data) {
      setData(customerIndex?.data);
      setLoading(false);
      setColumns(tableColumns);
    }
  }, [customerIndex?.data]);

  const confirmFileUpload = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', uploadedFile);
      const response = await uploadAPICall(
        endPoints.others.upload_customer_bulk,
        formData
      );
      if (response.status === true) {
        toastSuccess({
          title: 'Uploaded Successfully!!!',
          description: response.message,
        });
        setResponseData(response);
        setIsRespModalOpen(true);
        refreshCustomers();
      } else {
        toastError({
          title: 'Oops!!!',
          description: response?.message,
        });
      }
      setLoading(false);
    } catch (err: TODO) {
      console.error('File upload error:', err);
      setLoading(false);
      toastError({
        title: 'Oops!!!',
        description: err?.message,
      });
    }
  };

  const handleClose = () => {
    setOpenConfirmation(false); // Close the modal on cancel or outside click
  };

  useEffect(() => {
    const hasQueryParamsChanged = Object.keys(queryParams).some(
      (key: any) => queryParams[key] !== prevQueryParamsRef.current[key]
    );
    console.log(queryParams);
    if (hasQueryParamsChanged) {
      prevQueryParamsRef.current = queryParams;
      queryClient.invalidateQueries('customerIndex');
      if (queryParams?.business_name) {
        setColumnOrder('businessName');
      } else if (queryParams?.customer_id) {
        setColumnOrder('businessode');
      } else if (queryParams?.contact_type_id !== '') {
        setColumnOrder('contactType');
      } else {
        setColumnOrder('businessName');
      }
    } else {
      setLoading(false);
      setColumnOrder('businessName');
    }
    console.log(queryParams);
  }, [queryParams]);

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

  const tableColumns = [
    ...(columnOrder === 'businessName'
      ? [
          columnHelper.display({
            cell: (info) => {
              const currentPage = customerIndex?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            meta: {
              sortable: false,
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),

          // columnHelper.accessor('id', {
          //   cell: (info) => 'CUST-' + info.getValue(),
          //   meta: {
          //     sortable: true,
          //     isNumeric: false,
          //     sortParam: 'id',
          //   },
          //   header: 'Cust.ID',
          //   id: 'CustID',
          //   size: 60, // Optional: set a fixed width for the serial number column
          // }),

          columnHelper.accessor('business_name', {
            cell: (info) => info.getValue(),
            header: 'Bus.Name',
            id: 'business_name',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'business_name',
            },
          }),
          columnHelper.accessor('code', {
            cell: (info) => info.getValue(),
            header: 'Code',
            id: 'code',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'code',
            },
          }),
          columnHelper.accessor('contact_type', {
            cell: (info) => info.getValue().name,
            header: 'Cont.Type',
            id: 'contact_type_id',
          }),
          columnHelper.accessor('currency', {
            cell: (info) => info.getValue().code,
            header: 'Currency',
          }),
          columnHelper.accessor('is_foreign_entity', {
            cell: (info) => (info.getValue() ? 'Yes' : 'No'),
            header: 'Foreign',
          }),
          columnHelper.accessor('nature_of_business', {
            cell: (info) => info.getValue(),
            header: 'Nat.of.Bus',
          }),
          columnHelper.accessor('year_of_business', {
            cell: (info) => info.getValue(),
            header: 'Year',
            meta: {
              sortable: true,
              sortParam: 'year_of_business',
            },
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Crea.By',
          }),
          columnHelper.accessor('created_at', {
            cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
            header: 'Crea.At',
            meta: {
              sortable: true,
              isNumeric: false,
            },
            id: 'created_at',
          }),
          columnHelper.accessor('is_active', {
            cell: (info) => {
              const [isActive, setIsActive] = useState(info.getValue());
              const [isConfirmationOpen, setIsConfirmationOpen] =
                useState(false);
              const { mutate: updateStatus } = useUpdateCustomerStatus();
              const handleStatusChange = () => {
                updateStatus(
                  { id: info.row.original.id, isActive: !isActive },
                  {
                    onSuccess: ({ message }) => {
                      toastSuccess({
                        title: message,
                      });
                      setIsActive(!isActive);
                    },
                    onError: () => {
                      // Error handling (optional)
                    },
                  }
                );
                setIsConfirmationOpen(false);
              };

              return (
                <>
                  <Button
                    onClick={() => setIsConfirmationOpen(true)}
                    colorScheme={isActive ? 'green' : 'red'}
                    size="sm"
                    minW={'90px'}
                  >
                    {isActive ? 'Active' : 'In-Active'}
                  </Button>

                  <ConfirmationPopup
                    isOpen={isConfirmationOpen}
                    onClose={() => setIsConfirmationOpen(false)}
                    onConfirm={handleStatusChange}
                    headerText="Confirm!!!"
                    bodyText={`Are you sure you want to change this contact to ${!isActive ? 'Active' : 'In-Active'}?`}
                  />
                </>
              );
            },
            header: 'Status',
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4} justify={'flex-end'}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/customer-master/${info.row.original.id}`)
                    }
                  />
                  <IconButton
                    aria-label="preview"
                    icon={<HiPrinter />}
                    size={'sm'}
                    onClick={() => triggerPreview(info.row.original.id)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/customer-master/${info.row.original.id}/edit`)
                    }
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
    ...(columnOrder === 'businesscode'
      ? [
          columnHelper.accessor('id', {
            cell: (info) => {
              const currentPage = customerIndex?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            meta: {
              sortable: false,
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          // columnHelper.accessor('id', {
          //   cell: (info) => 'CUST-' + info.getValue(),
          //   meta: {
          //     sortable: true,
          //     isNumeric: false,
          //     sortParam: 'id',
          //   },
          //   header: 'Cust.ID',
          //   id: 'CustID',
          //   size: 60, // Optional: set a fixed width for the serial number column
          // }),

          columnHelper.accessor('code', {
            cell: (info) => info.getValue(),
            header: 'Code',
            id: 'code',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'code',
            },
          }),
          columnHelper.accessor('business_name', {
            cell: (info) => info.getValue(),
            header: 'Bus.Name',
            id: 'business_name',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'business_name',
            },
          }),
          columnHelper.accessor('contact_type', {
            cell: (info) => info.getValue().name,
            header: 'Cont.Type',
            id: 'contact_type_id',
          }),
          columnHelper.accessor('currency', {
            cell: (info) => info.getValue().code,
            header: 'Currency',
          }),
          columnHelper.accessor('is_foreign_entity', {
            cell: (info) => (info.getValue() ? 'Yes' : 'No'),
            header: 'Foreign',
          }),
          columnHelper.accessor('nature_of_business', {
            cell: (info) => info.getValue(),
            header: 'Nat.of.Bus',
          }),
          columnHelper.accessor('year_of_business', {
            cell: (info) => info.getValue(),
            header: 'Year',
            meta: {
              sortable: true,
              sortParam: 'code',
            },
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Created By',
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
          columnHelper.accessor('is_active', {
            cell: (info) => {
              const [isActive, setIsActive] = useState(info.getValue());
              const [isConfirmationOpen, setIsConfirmationOpen] =
                useState(false);
              const { mutate: updateStatus } = useUpdateCustomerStatus();
              const handleStatusChange = () => {
                updateStatus(
                  { id: info.row.original.id, isActive: !isActive },
                  {
                    onSuccess: ({ message }) => {
                      toastSuccess({
                        title: message,
                      });
                      setIsActive(!isActive);
                    },
                    onError: () => {
                      // Error handling (optional)
                    },
                  }
                );
                setIsConfirmationOpen(false);
              };

              return (
                <>
                  <Button
                    onClick={() => setIsConfirmationOpen(true)}
                    colorScheme={isActive ? 'green' : 'red'}
                    size="sm"
                    minW={'90px'}
                  >
                    {isActive ? 'Active' : 'In-Active'}
                  </Button>

                  <ConfirmationPopup
                    isOpen={isConfirmationOpen}
                    onClose={() => setIsConfirmationOpen(false)}
                    onConfirm={handleStatusChange}
                    headerText="Confirm!!!"
                    bodyText={`Are you sure you want to change this contact to ${!isActive ? 'Active' : 'In-Active'}?`}
                  />
                </>
              );
            },
            header: 'Status',
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4} justify={'flex-end'}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/customer-master/${info.row.original.id}`)
                    }
                  />
                  <IconButton
                    aria-label="preview"
                    icon={<HiPrinter />}
                    size={'sm'}
                    onClick={() => triggerPreview(info.row.original.id)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/customer-master/${info.row.original.id}/edit`)
                    }
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
    ...(columnOrder === 'contactType'
      ? [
          columnHelper.accessor('id', {
            cell: (info) => {
              const currentPage = customerIndex?.current_page ?? 1;
              return (currentPage - 1) * 10 + info.row.index + 1;
            },
            meta: {
              sortable: false,
            },
            header: '#',
            id: 'sNo',
            size: 60, // Optional: set a fixed width for the serial number column
          }),
          // columnHelper.accessor('id', {
          //   cell: (info) => 'CUST-' + info.getValue(),
          //   meta: {
          //     sortable: true,
          //     isNumeric: false,
          //     sortParam: 'id',
          //   },
          //   header: 'Cust ID',
          //   id: 'CustID',
          //   size: 60, // Optional: set a fixed width for the serial number column
          // }),

          columnHelper.accessor('contact_type', {
            cell: (info) => info.getValue().name,
            header: 'Contact Type',
            id: 'contact_type_id',
          }),

          columnHelper.accessor('business_name', {
            cell: (info) => info.getValue(),
            header: 'Business Name',
            id: 'business_name',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'business_name',
            },
          }),
          columnHelper.accessor('code', {
            cell: (info) => info.getValue(),
            header: 'Code',
            id: 'code',
            meta: {
              sortable: true,
              isNumeric: false,
              sortParam: 'code',
            },
          }),
          columnHelper.accessor('currency', {
            cell: (info) => info.getValue().code,
            header: 'Currency',
          }),
          columnHelper.accessor('is_foreign_entity', {
            cell: (info) => (info.getValue() ? 'Yes' : 'No'),
            header: 'Foreign',
          }),
          columnHelper.accessor('nature_of_business', {
            cell: (info) => info.getValue(),
            header: 'Nature of Business',
          }),
          columnHelper.accessor('year_of_business', {
            cell: (info) => info.getValue(),
            header: 'Year',
            meta: {
              sortable: true,
              sortParam: 'code',
            },
          }),
          columnHelper.accessor('user.username', {
            cell: (info) => info.getValue(),
            header: 'Created By',
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
          columnHelper.accessor('is_active', {
            cell: (info) => {
              const [isActive, setIsActive] = useState(info.getValue());
              const [isConfirmationOpen, setIsConfirmationOpen] =
                useState(false);
              const { mutate: updateStatus } = useUpdateCustomerStatus();
              const handleStatusChange = () => {
                updateStatus(
                  { id: info.row.original.id, isActive: !isActive },
                  {
                    onSuccess: ({ message }) => {
                      toastSuccess({
                        title: message,
                      });
                      setIsActive(!isActive);
                    },
                    onError: () => {
                      // Error handling (optional)
                    },
                  }
                );
                setIsConfirmationOpen(false);
              };

              return (
                <>
                  <Button
                    onClick={() => setIsConfirmationOpen(true)}
                    colorScheme={isActive ? 'green' : 'red'}
                    size="sm"
                    minW={'90px'}
                  >
                    {isActive ? 'Active' : 'In-Active'}
                  </Button>

                  <ConfirmationPopup
                    isOpen={isConfirmationOpen}
                    onClose={() => setIsConfirmationOpen(false)}
                    onConfirm={handleStatusChange}
                    headerText="Confirm!!!"
                    bodyText={`Are you sure you want to change this contact to ${!isActive ? 'Active' : 'In-Active'}?`}
                  />
                </>
              );
            },
            header: 'Status',
          }),
          columnHelper.accessor('actions', {
            cell: (info) => {
              return (
                <HStack spacing={4} justify={'flex-end'}>
                  <IconButton
                    aria-label="View"
                    icon={<ViewIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/customer-master/${info.row.original.id}`)
                    }
                  />
                  <IconButton
                    aria-label="preview"
                    icon={<HiPrinter />}
                    size={'sm'}
                    onClick={() => triggerPreview(info.row.original.id)}
                  />
                  <IconButton
                    aria-label="Edit"
                    icon={<EditIcon />}
                    size={'sm'}
                    onClick={() =>
                      navigate(`/customer-master/${info.row.original.id}/edit`)
                    }
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

  const [columns, setColumns] = useState<TODO>(tableColumns);

  useEffect(() => {
    setColumns(tableColumns);
  }, [columnOrder]);

  const DownloadSampleOptions = [
    { label: 'Contact Master', value: 'customer_master' },
    { label: 'Contact Banks', value: 'customer_banks' },
    { label: 'Contact Managers', value: 'customer_contact_managers' },
    { label: 'Contact Principle Owners', value: 'customer_principle_owners' },
    {
      label: 'Contact Shipping Addresses',
      value: 'customer_shipping_addresses',
    },
    {
      label: 'Contact Trader References',
      value: 'customer_trader_references',
    },
  ] as const;

  // Extract a type from the `value` properties
  type DownloadSampleKeys = (typeof DownloadSampleOptions)[number]['value'];

  // Map values to corresponding environment variables
  const csvMapping: Record<DownloadSampleKeys, string | undefined> = {
    customer_master: import.meta.env.VITE_CUSTOMERS_SAMPLE_CSV,
    customer_banks: import.meta.env.VITE_CUSTOMERS_BANKS_CSV,
    customer_contact_managers: import.meta.env
      .VITE_CUSTOMERS_CONTACT_MANAGERS_CSV,
    customer_principle_owners: import.meta.env
      .VITE_CUSTOMERS_PRINCIPLE_OWNERS_CSV,
    customer_shipping_addresses: import.meta.env
      .VITE_CUSTOMERS_SHIPPING_ADDRESSES_CSV,
    customer_trader_references: import.meta.env
      .VITE_CUSTOMERS_TRADER_REFERENCES_CSV,
  };

  const handleDownloadSampleFunction = (value: DownloadSampleKeys) => {
    const csvPath = csvMapping[value];

    if (csvPath) {
      handleDownload(csvPath);
    } else {
      console.warn('No CSV file found for:', value);
    }
  };

  const handleUploadSampleFunction = (value: DownloadSampleKeys) => {
    switch (value) {
      case 'customer_master':
        navigate('/customer-master/bulk/upload');
        break;
      case 'customer_banks':
        navigate('/bank-master/bulk/upload');
        break;
      case 'customer_contact_managers':
        navigate('/contact-manager-master/bulk/upload');
        break;
      case 'customer_principle_owners':
        navigate('/principle-of-owner-master/bulk/upload');
        break;
      case 'customer_shipping_addresses':
        navigate('/shipping-address-master/bulk/upload');
        break;
      case 'customer_trader_references':
        navigate('/trader-reference-master/bulk/upload');
        break;
      default:
        break;
    }
  };

  const triggerPreview = async (id: number) => {
    setPreviewData(id);
    setIsPreviewModalOpen(true);
  };

  const exportTableData = (type: any) => {
    setExportType(type);
    triggerExport(true);
    setExportStatusTrigger((prev) => prev + 1);
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Contact Management
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/customer-master/create')}
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
                <FieldInput
                  size={'sm'}
                  label={'Business Name'}
                  name="business_name"
                  placeholder="Enter Business Name"
                  type={'all-capital'}
                  w={{ base: 'full', md: '20%' }}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      customer_id: '',
                      business_name: value,
                      contact_type_id: '',
                      page: 1,
                    }));
                  }}
                  isDisabled={queryParams?.customer_id}
                />
                <FieldSelect
                  name="customer_id"
                  key={`customer_id_${resetKey}`}
                  label={'Business Code'}
                  placeholder="Business Code"
                  w={{ base: 'full', md: '20%' }}
                  size={'sm'}
                  options={customerCodeOptions}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      customer_id: value ?? '',
                      business_name: '',
                      contact_type_id: '',
                      page: 1,
                    }));
                    form.setValues({
                      business_name: '',
                      contact_type_id: '',
                    });
                  }}
                  isClearable={true}
                />
                <FieldSelect
                  w={{ base: 'full', md: '20%' }}
                  size={'sm'}
                  label={'Type of Contact'}
                  key={`contact_type_id_${resetKey}`}
                  name={'contact_type_id'}
                  options={contactTypeOptions}
                  onValueChange={(value) => {
                    setQueryParams((prevState: TODO) => ({
                      ...prevState,
                      contact_type_id: value ?? '',
                      business_name: '',
                      customer_id: '',
                      page: 1,
                    }));

                    form.setValues({
                      contact_type_id: '',
                    });
                  }}
                  isClearable={true}
                  isDisabled={queryParams?.customer_id}
                />

                <Stack>
                  <Text fontSize="sm">&nbsp;</Text>
                  <Button
                    type="reset"
                    size={'sm'}
                    variant="@primary"
                    leftIcon={<HiRefresh />}
                    w={{ base: 'full', md: 'auto' }}
                    onClick={() => {
                      form.reset();
                      setLoading(true);
                      setResetKey((prevKey) => prevKey + 1);
                      form.setValues({
                        business_name: '',
                        customer_id: '',
                        contact_type_id: '',
                      });
                      setQueryParams(initialFormData);
                    }}
                  >
                    Reset Form
                  </Button>
                </Stack>
              </Stack>
            </Box>
          </Box>
        </Formiz>

        <Box borderRadius={4}>
          <HStack
            bg={'white'}
            justify={'space-between'}
            mb={4}
            p={4}
            borderTopRadius={4}
          >
            <Heading as="h4" size={'md'}>
              Contact Management List
            </Heading>
            <Input
              type="file"
              accept=".csv" // Add file types you want to accept
              display="none" // Hide the default input file
              id="file-upload-input"
              onChange={handleFileChange}
              key={fileKey}
            />
            <HStack ml="auto">
              {/* Download */}
              <Flex alignItems={'center'}>
                <Menu>
                  <MenuButton
                    as={Button}
                    leftIcon={<Box mr={3} as={LuDownload} />}
                    rightIcon={<Box ml={3} as={FiChevronDown} />}
                    size="sm"
                    bgColor={'blue'}
                    ml={2}
                    color={'white'}
                    _hover={{
                      bg: 'blue',
                    }}
                    isDisabled={loading}
                  >
                    Download Sample
                  </MenuButton>
                  <MenuList bg={'white'} borderColor={'gray.200'}>
                    {DownloadSampleOptions.map(({ label, value }) => (
                      <MenuItem
                        key={value}
                        bg={'white'}
                        color={'gray.800'}
                        _hover={{ bg: 'gray.100' }}
                        onClick={() => handleDownloadSampleFunction(value)}
                        icon={<LuDownload />}
                        isDisabled={loading}
                      >
                        {label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Flex>
              {/* Upload */}
              <Flex alignItems={'center'}>
                <Menu>
                  <MenuButton
                    as={Button}
                    leftIcon={<Box mr={3} as={LuUpload} />}
                    rightIcon={<Box ml={3} as={FiChevronDown} />}
                    size="sm"
                    bgColor={'green'}
                    ml={2}
                    color={'white'}
                    _hover={{
                      bg: '#green',
                    }}
                    isDisabled={loading}
                  >
                    Bulk Upload
                  </MenuButton>

                  <MenuList bg={'white'} borderColor={'gray.200'}>
                    {DownloadSampleOptions.map(({ label, value }) => (
                      <MenuItem
                        key={value}
                        bg={'white'}
                        color={'gray.800'}
                        _hover={{ bg: 'gray.100' }}
                        onClick={() => handleUploadSampleFunction(value)}
                        icon={<LuUpload />}
                        isDisabled={loading}
                      >
                        {label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>
              </Flex>

              <Box ml="auto" display="flex" alignItems="center">
                <TableExport
                  loading={loading}
                  exportTableData={(format: string) => exportTableData(format)}
                />
              </Box>

              <Box ml="auto" display="flex" alignItems="center">
                <PageLimit
                  currentLimit={itemsPerPage}
                  loading={loading}
                  changeLimit={changePageLimit}
                />
              </Box>

              {/* <Button
                leftIcon={<LuDownload />}
                colorScheme="blue"
                as="label"
                size={'sm'}
                isDisabled={loading}
                onClick={() =>
                  handleDownload(import.meta.env.VITE_CUSTOMERS_SAMPLE_CSV)
                }
              >
                Download Sample
              </Button> */}

              {/* <Button
                leftIcon={<LuUpload />}
                colorScheme="green"
                size={'sm'}
                onClick={() => navigate('/customer-master/bulk/upload')}
              >
                Upload Customers
              </Button>*/}
            </HStack>
          </HStack>
          {!queryParams.customer_id && (
            <Box p={0} m={0}>
              <LoadingOverlay isLoading={loading || exportStatus}>
                <DataTable
                  columns={columns}
                  data={data}
                  loading={customerIndexLoading || loading}
                  tableProps={{ variant: 'simple' }}
                  onSortChange={handleSortChange}
                  sortDirection={sortDirection}
                  sortBy={sortBy}
                />
              </LoadingOverlay>
              <Box p={4} mt={4} display="flex" justifyContent="space-between">
                {customerIndex && customerIndex?.total > 0 && (
                  <Text fontSize="sm" color="gray.500">
                    {`Showing ${customerIndex?.current_page * itemsPerPage - (itemsPerPage - 1)} to ${Math.min(customerIndex?.current_page * itemsPerPage, customerIndex?.total)} of ${customerIndex?.total} records`}
                  </Text>
                )}
                <Pagination
                  currentPage={customerIndex?.current_page ?? 1}
                  totalCount={customerIndex?.total ?? 0}
                  pageSize={itemsPerPage}
                  onPageChange={(page) => {
                    setQueryParams({ ...queryParams, page });
                  }}
                />
              </Box>
            </Box>
          )}

          {queryParams.customer_id && (
            <Box p={0} m={0}>
              <CustomerInfo
                customerId={Number(queryParams.customer_id)}
              ></CustomerInfo>
            </Box>
          )}

          <ConfirmationPopup
            isOpen={openConfirmation}
            onClose={handleClose}
            onConfirm={handleConfirm}
            headerText="Upload File"
            bodyText="Are you sure you want to upload this file?"
          />

          <FileUploadResponseModal
            isOpen={isRespModalOpen}
            onClose={handleCloseModal}
            response={responseData}
          />
          <PreviewPopup
            isOpen={isPreviewModalOpen}
            onClose={() => {
              setIsPreviewModalOpen(false);
            }}
            customerData={previewData}
          ></PreviewPopup>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default CustomerMaster;
