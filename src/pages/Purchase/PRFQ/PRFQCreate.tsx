import { useEffect, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  IconButton,
  Input,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import Axios from 'axios';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import {
  HiArrowNarrowLeft,
  HiEye,
  HiOutlinePlus,
  HiTrash,
} from 'react-icons/hi';
import { UseQueryResult, useQueryClient } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldDayPicker } from '@/components/FieldDayPicker';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import SearchPopup from '@/components/Popups/Search/MaterialRequest';
import PreviewPopup from '@/components/PreviewContents/Purchase/PRFQ';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  convertToOptions,
  getDisplayLabel,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import ContactManagerCreateModal from '@/pages/Master/ContactManager/ContactManagerCreateModal';
import CustomerCreateModal from '@/pages/Master/Customer/CustomerCreateModal';
import ConditionCreateModal from '@/pages/Submaster/Condition/ConditionCreateModal';
import { getAPICall } from '@/services/apiService';
import {
  ContactManagerInfoSchema,
  CustomerGroupListSchema,
} from '@/services/apiService/Schema/CustomerSchema';
import { OptionsListPayload } from '@/services/apiService/Schema/OptionsSchema';
import { useCustomerSupplierList } from '@/services/master/services';
import { useCreatePRFQ } from '@/services/purchase/prfq/services';
import { usePRList } from '@/services/purchase/purchase-request/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useCustomerGroupList } from '@/services/submaster/customer-group/services';
import {
  fetchPriorityInfo,
  usePriorityList,
} from '@/services/submaster/priority/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

import PartDetailText from '../Quotation/PartDetailText';

type QueryData = {
  status: boolean;
  items?: Record<string, string | number>;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

interface Contact {
  address: string;
  attention: string;
  city: string;
  country: string;
  created_at: string;
  customer_id: number;
  customer: {
    business_name: string;
    business_type: {
      created_at: string;
      id: number;
      modified_at: string;
      name: string;
    };
    business_type_id: number;
    code: string;
    contact_type: {
      created_at: string;
      id: number;
      modified_at: string;
      name: string;
    };
    contact_type_id: number;
    created_at: string;
    currency: {
      code: string;
      created_at: string;
      id: number;
      modified_at: string;
      name: string;
    };
    currency_id: number;
    email: string | null;
    id: number;
    is_foreign_entity: boolean;
    license_trade_exp_date: string | null;
    license_trade_no: string | null;
    license_trade_url: string | null;
    modified_at: string;
    nature_of_business: string;
    remarks: string | null;
    vat_tax_id: string | null;
    vat_tax_url: string | null;
    year_of_business: number | null;
  };
  email: string | null;
  fax: string | null;
  id: number;
  modified_at: string;
  phone: string;
  remarks: string | null;
  state: string;
  zip_code: string;
}

interface Row {
  id: number;
  selectedContact: Contact | null;
  customer_id?: number;
  contact_manager_id?: number;
  options: any;
}

interface PRItem {
  condition_id: number;
  id: number;
  part_number_id: number;
  purchase_request_id: number;
  qty: number;
  remark?: string | null;
  mr_remark?: string | null;
  unit_of_measure_id?: number;
  purchase_request_item_id: number;
}

const PRFQCreate = () => {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, selectedContact: null, options: [] },
  ]);
  const rowIdCounter = useRef(1);
  const queryClient = useQueryClient();
  const [resetKey, setResetKey] = useState(0);
  const [vendorGroupResetKey, setVendorGroupResetKey] = useState(0);
  const [combinedItems, setCombinedItems] = useState<PRItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<TODO>([]);
  const [contactLoading, setContactLoading] = useState<boolean>(false);
  const [errorStatus, setHideErrors] = useState<boolean>(false);
  const [activeRow, setActiveRow] = useState<any>(0);
  const [vendorGroup, setVendorGroup] = useState<any>(0);
  const [vendorSelectKey, setVendorSelectKey] = useState(0);
  const [contactSelectKey, setContactSelectKey] = useState(0);
  const {
    isOpen: isVendorAddOpen,
    onOpen: onVendorAddOpen,
    onClose: onVendorAddClose,
  } = useDisclosure();
  const {
    isOpen: isCMAddOpen,
    onOpen: onCMAddOpen,
    onClose: onCMAddClose,
  } = useDisclosure();
  const [loading, setLoading] = useState<boolean>(false);
  const [disableAddBtn, toggleAddBtn] = useState<boolean>(true);

  const getPriorityDetails = fetchPriorityInfo();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();
  const [selectedMRS, setSelectedMRs] = useState<any>([]);
  const [mrItems, setMRItems] = useState<TODO>([]);
  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const customerGroupList: UseQueryResult<QueryData, unknown> =
    useCustomerGroupList();
  const customerGroupOptions = transformToSelectOptions(customerGroupList.data);
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [previewData, setPreviewData] = useState<any>([]);
  const [popupData, setPopupData] = useState<TODO>({});
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [disabledDatePicker, setDisabledDatePicker] = useState<boolean>(true);

  const {
    isOpen: isCNAddOpen,
    onOpen: onCNAddOpen,
    onClose: onCNAddClose,
  } = useDisclosure();

  const addNewRow = () => {
    setHideErrors(false);
    rowIdCounter.current += 1;
    const newRow = {
      id: rowIdCounter.current,
      selectedContact: null,
      options: [],
    };
    setRows([...rows, newRow]);
  };

  const deleteRow = (rowId: number) => {
    setActiveRow(0);
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const handleConfirm = () => {
    setLoading(true);
    getGroupCustomerList();
    setOpenConfirmation(false);
  };

  const handleClose = () => {
    setOpenConfirmation(false);
  };

  const fetchPurchaseOrderDetails = async (id: number) => {
    try {
      const response = await Axios.get(
        endPoints.info.purchase_request.replace(':id', id)
      );
      if (response.status !== 200) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      return response.data?.data;
    } catch (error) {
      console.error('Failed to fetch purchase order details:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchAllMRItems = async () => {
      try {
        const MRs = await Promise.all(
          selectedMRS.map((id: any) =>
            queryClient.fetchQuery(['purchaseOrderDetails', id], () =>
              fetchPurchaseOrderDetails(id)
            )
          )
        );

        setMRItems(MRs);
      } catch (error) {
        console.error('Error fetching PO items:', error);
      }
    };
    fetchAllMRItems();
  }, [selectedMRS]);

  useEffect(() => {
    const items = mrItems.flatMap((purchase: any) => purchase.items);
    const processedItems: PRItem[] = items.map((item: any) => ({
      condition_id: item.condition_id,
      id: item.id,
      part_number_id: item.part_number_id,
      qty: item.qty,
      unit_of_measure_id: item.unit_of_measure_id,
      mr_remark: item.remark || null,
      remark: '',
      purchase_request_id: item.purchase_request_id,
      purchase_request_item_id: item.id,
    }));
    setCombinedItems(processedItems);
  }, [mrItems]);

  const handleInputChange = (value: any, field: string, index: number) => {
    const updatedData = [...combinedItems];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setCombinedItems(updatedData);
  };

  const getGroupCustomerList = async () => {
    try {
      const respData = await getAPICall(
        endPoints.others.customer_group_customers,
        CustomerGroupListSchema,
        { group_id: vendorGroup, customer_type: 'suppliers' }
      );
      console.log(respData);
      setLoading(false);
      if (respData?.data.length > 0) {
        assignRows(respData?.data);
      } else {
        setRows([{ id: 1, selectedContact: null, options: [] }]);
        toastError({
          title: 'OOPS!!',
          description: 'No customers added in this group',
        });
      }
      setVendorGroup(0);
      setVendorGroupResetKey((prevKey) => prevKey + 1);
      form.setValues({ customer_group_id: '' });
    } catch (err) {
      console.log(err);
    }
  };

  const assignRows = async (userRows: any) => {
    let newItems: any[] = [];
    for (const item of userRows) {
      if (newItems.some((row) => row.customer_id === item.id)) {
        continue;
      }
      if (rows.some((row) => row.customer_id === item.id)) {
        continue;
      }

      let obj: any = {
        id: Number(rowIdCounter.current + 1),
        customer_id: item.id,
        options: [],
        selectedContact: null,
      };

      rowIdCounter.current += 1;
      newItems.push(obj);
    }

    setRows((currentRows) => {
      const filteredRows = currentRows.filter((row) => row.customer_id);
      const updatedRows = [...filteredRows, ...newItems];

      newItems.forEach((row) => {
        const index = updatedRows.findIndex((r) => r.id === row.id);
        console.log(index);
        if (index !== -1) {
          getCustomerContactManagerList(index, row.customer_id);
        }
      });

      return updatedRows;
    });

    setLoading(false);
  };

  const getCustomerContactManagerList = async (
    index: number,
    customerId: number
  ) => {
    if (customerId > 0) {
      try {
        const data = await getAPICall(
          `${endPoints.list.customer_contact_manager}/${customerId}`,
          OptionsListPayload
        );
        const Options = transformToSelectOptions(data);

        setRows((prevRows) => {
          const newRows = [...prevRows];
          newRows[index] = { ...newRows[index], options: Options };
          return newRows;
        });

        // Select first available contact by default
        if (Options.length > 0) {
          await handleSelectContact(Number(Options[0].value), index);
        }

        setContactLoading(false);
      } catch (err) {
        console.log(err);
      }
    } else {
      setContactLoading(false);
      setRows((prevRows) => {
        const newRows = [...prevRows];
        newRows[index] = {
          ...newRows[index],
          options: [],
          selectedContact: null,
        };
        return newRows;
      });
    }
  };

  useEffect(() => {
    let validRows = 0;

    const result = rows.map((item) => {
      const isValid = !!item.customer_id && !!item.selectedContact;
      if (isValid) validRows += 1;
      return {
        row: item.id,
        value: isValid ? item.customer_id : null,
      };
    });

    const buttonStatus = rows.length > 0 && validRows === rows.length;
    toggleAddBtn(!buttonStatus);
    setSelectedItems(result);
  }, [rows]);

  const filterOptions = (row: number) => {
    const filteredRowIds = selectedItems.filter(
      (item: any) => item.row !== row
    );
    const filteredRows = filteredRowIds
      .map((item: any) => item.value)
      .filter((value: any) => value != null);
    const filteredOptions = customerOptions.filter(
      (item: any) => !filteredRows.includes(Number(item.value))
    );

    return filteredOptions;
  };

  useEffect(() => {
    console.log(selectedItems);
  }, [selectedItems]);

  useEffect(() => {
    console.log(selectedItems);
  }, [rows]);

  const openSearchPopup = () => {
    let popupVariables: any = {};
    popupVariables.request_ids = selectedMRS;
    popupVariables.conditionOptions = conditionOptions;
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    popupVariables.priorityOptions = priorityOptions;
    setPopupData(popupVariables);
    setIsSearchModalOpen(true);
  };

  const setDuedate = async (priority: any) => {
    let daysToAdd: number = 0;
    const priorityInfo = await getPriorityDetails(Number(priority));

    if (priorityInfo?.item) {
      daysToAdd = priorityInfo?.item?.days || 0;
      if (daysToAdd === 0) {
        setDisabledDatePicker(false);
        form.setValues({ [`need_by_date`]: '' });
      } else {
        setDisabledDatePicker(true);
        form.setValues({
          [`need_by_date`]: dayjs().add(daysToAdd, 'day'),
        });
      }
    }
  };

  const prList: UseQueryResult<QueryData, unknown> = usePRList();
  const prOptions = transformToSelectOptions(prList.data);

  const priorityList: UseQueryResult<QueryData, unknown> = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);

  const customerListSupplier = useCustomerSupplierList({
    type: 'suppliers',
  });

  const [customerOptions, setCustomerOptions] = useState<TODO>([]);

  const unitOfMeasureList = useUnitOfMeasureIndex();

  useEffect(() => {
    if (
      customerListSupplier?.data &&
      customerListSupplier?.data?.data.length > 0
    ) {
      const Options = customerListSupplier.data?.data?.map((contact) => ({
        value: contact.id,
        label: contact.business_name,
      }));
      setCustomerOptions(Options);
    }
  }, [customerListSupplier.data]);

  const handleSelectContact = async (contactId: number, index: number) => {
    console.log(contactId);
    if (contactId > 0) {
      const detailResponse = await getAPICall(
        `/customer-contact-manager/${contactId}`,
        ContactManagerInfoSchema
      );
      setRows((prevRows) => {
        const updatedData = [...prevRows];
        form.setValues({
          [`contact_${updatedData[index].id}`]: contactId.toString(),
        });
        updatedData[index] = {
          ...updatedData[index],
          contact_manager_id: contactId,
          options: [...(updatedData[index].options || [])], // Ensure options persist
          selectedContact: detailResponse,
        };
        return updatedData;
      });
    } else {
      setRows((prevRows) => {
        const updatedData = [...prevRows];
        updatedData[index] = {
          ...updatedData[index],
          selectedContact: null,
        };
        return updatedData;
      });
    }
  };

  const handleRemarksChange = (newValue: string) => {
    form.setValues({ [`remarks`]: newValue });
  };

  const formatFullAddress = (contact: Contact) => {
    const parts = [
      contact.address,
      contact.city,
      contact.state,
      contact.zip_code,
      contact.country,
    ].filter(Boolean); // This ensures no undefined or empty strings are included

    return parts.join(', '); // Join all parts with a comma
  };

  const handleOpenPreview = (forVendor: boolean, rowId: any) => {
    console.log(rowId);
    let popupVariables: any = {};
    popupVariables.items = combinedItems;
    popupVariables.conditionOptions = conditionOptions;
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    popupVariables.priorityOptions = priorityOptions;
    popupVariables.rows = rows;
    popupVariables.forVendor = forVendor;
    popupVariables.rowId = rowId;
    Object.keys(fields).forEach(function (key) {
      popupVariables[key] = fields[key].value;
    });
    setPreviewData(popupVariables);
    console.log(popupVariables);
    setIsPreviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  const handleCloseCMModal = (status: boolean, id: any) => {
    if (status) {
      getCustomerContactManagerList(
        activeRow,
        rows[activeRow]?.customer_id ?? 0
      );
      setTimeout(() => {
        form.setValues({
          [`contact_${rows[activeRow].id}`]: id.toString(),
        });
      }, 2000);
    }
  };

  const closeSearchPopup = (selectedMrs: any) => {
    setSelectedMRs(selectedMrs.map(String) ?? []);
    form.setValues({ [`purchase_request_id`]: selectedMrs.map(String) });
    setIsSearchModalOpen(false);
    console.log(selectedMrs.map(String));
  };

  const createPRFQ = useCreatePRFQ({
    onSuccess: ({ id, message }) => {
      toastSuccess({
        title: 'PRFQ created successfully - ' + id,
        description: message,
      });
      navigate('/purchase/prfq');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create PRFQ',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      const payload = {
        priority_id: Number(values.priority_id),
        need_by_date: format(new Date(values.need_by_date), 'yyyy-MM-dd'),
        remarks: values.remarks,
        purchase_request_ids: values.purchase_request_id.map((id: string) =>
          Number(id)
        ),
        items: combinedItems.map((item) => ({
          part_number_id: item.part_number_id,
          condition_id: item.condition_id,
          unit_of_measure_id: item.unit_of_measure_id ?? 0,
          qty: item.qty,
          remark: item.remark ?? '',
          purchase_request_item_id: item.id,
        })),
        customers: rows.map((row) => ({
          customer_id: Number(values[`vendor_name_${row.id}`]),
          customer_contact_manager_id: Number(values[`contact_${row.id}`]),
        })),
      };
      createPRFQ.mutate(payload);
    },
  });

  const fields = useFormFields({
    connect: form,
  });

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  const handleCloseCustomerModal = (status?: boolean, id?: any) => {
    console.log(status, id)
    if (status) {
      customerListSupplier.refetch();
      setTimeout(() => {
        form.setValues({ [`contact_${rows[activeRow].id}`]: id.toString() });
      }, 2000);
    } else {
      setTimeout(() => {
        form.setValues({ [`contact_${rows[activeRow].id}`]: '' });
      }, 1000);
    }
    onVendorAddClose();
    setVendorSelectKey((prevKey) => prevKey + 1);
  };

  const [idxIndex, setIdxIndex] = useState(0);

  const handleCloseConditionModal = (status?: boolean, id?: any) => {
    console.log(status);
    if (status) {
      conditionList.refetch();
      form.setValues({ [`condition_${idxIndex}`]: id.toString() });
    }
    form.setValues({ [`condition_${idxIndex}`]: '' });
    onCNAddClose();
  };

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
                <BreadcrumbLink as={Link} to={'/purchase/prfq'}>
                  Purchase RFQ
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Create Purchase RFQ</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Create Purchase RFQ
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
          <Text fontSize={'md'} fontWeight={'700'}>
            Purchase RFQ
          </Text>

          <Formiz autoForm connect={form}>
            <Stack spacing={2} direction={{ base: 'column', md: 'row' }}>
              <Box
                flex="1"
                rounded={'md'}
                border={'1px solid'}
                borderColor={'gray.300'}
                p={4}
              >
                <Stack>
                  <FormControl>
                    <FormLabel>
                      Material Request
                      <IconButton
                        aria-label="Open Search"
                        colorScheme="brand"
                        size={'sm'}
                        icon={<SearchIcon />}
                        onClick={openSearchPopup}
                        ml={2}
                      />
                    </FormLabel>
                    <FieldSelect
                      name={'purchase_request_id'}
                      required={'Material Request is required'}
                      options={prOptions ?? []}
                      isClearable={true}
                      isMulti={true}
                      onValueChange={(value) => {
                        setSelectedMRs(value ?? []);
                        setResetKey((prevKey) => prevKey + 1);
                        form.setValues({ [`priority_id`]: '' });
                      }}
                      selectProps={{
                        noOptionsMessage: () => 'No PR found',
                        isLoading: prList.isLoading,
                      }}
                      showError={errorStatus}
                    />
                  </FormControl>

                  <FieldSelect
                    key={`priority_id_${resetKey}`}
                    label={`Priority`}
                    name={'priority_id'}
                    required={'Priority is required'}
                    placeholder="Select Priority"
                    options={priorityOptions}
                    onValueChange={(value) => {
                      setDuedate(value);
                    }}
                    isDisabled={selectedMRS.length === 0}
                    className={selectedMRS.length === 0 ? 'disabled-input' : ''}
                    showError={errorStatus}
                  />

                  <FieldDayPicker
                    label={'Need By Date'}
                    name={'need_by_date'}
                    placeholder="Select Need By Date"
                    required={'Need By Date is required'}
                    disabledDays={{ before: new Date() }}
                    dayPickerProps={{
                      inputProps: {
                        isDisabled: disabledDatePicker,
                      },
                    }}
                    showError={errorStatus}
                  />
                </Stack>
              </Box>
              <Box
                flex="2"
                rounded={'md'}
                border={'1px solid'}
                borderColor={'gray.300'}
                p={4}
              >
                <TableContainer>
                  <Table variant="simple" size={'sm'}>
                    <Thead>
                      <Tr>
                        <Th>MR ID</Th>
                        <Th>Need by Date</Th>
                        <Th>Priority</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {mrItems &&
                        mrItems.length > 0 &&
                        mrItems.map((item: any, index: number) => (
                          <Tr key={index}>
                            <Td>{item?.id}</Td>
                            <Td>
                              {dayjs(item?.due_date).format('DD-MMM-YYYY')}
                            </Td>
                            <Td>
                              {getDisplayLabel(
                                priorityOptions,
                                item?.priority_id,
                                'priority'
                              )}
                            </Td>
                          </Tr>
                        ))}

                      {(!mrItems || mrItems.length === 0) && (
                        <Tr>
                          <Td colSpan={3} textAlign="center">
                            No MR Selected
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </Box>
            </Stack>
            <Stack spacing={2}>
              {combinedItems.length > 0 && (
                <TableContainer rounded={'md'} overflow={'auto'} my={4}>
                  <Table variant="striped" size={'sm'}>
                    <Thead bg={'gray'}>
                      <Tr>
                        <Th color={'white'}>S.No.</Th>
                        <Th color={'white'}>MR No</Th>
                        <Th color={'white'}>Part Number</Th>
                        <Th color={'white'}>Description</Th>
                        <Th color={'white'}>Condition</Th>
                        <Th color={'white'}>Qty</Th>
                        <Th color={'white'}>UOM</Th>
                        <Th color={'white'}>MR Remarks</Th>
                        <Th color={'white'}>Remark</Th>
                        <Th color={'white'} isNumeric>
                          Action
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {combinedItems.map((item, index) => (
                        <Tr key={index}>
                          <Td>{index + 1}</Td>
                          {/* <Td>{item?.purchase_request_id.join(', ')}</Td> */}
                          <Td>{item?.purchase_request_id}</Td>
                          <Td>
                            <PartDetailText partNumber={item.part_number_id} />
                          </Td>
                          <Td>
                            <PartDetailText
                              partNumber={item.part_number_id}
                              field={'description'}
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              name={`condition_${index}`}
                              defaultValue={item.condition_id?.toString() ?? ''}
                              size={'sm'}
                              menuPortalTarget={document.body}
                              options={[
                                ...(conditionOptions ?? []),
                                {
                                  value: 'add_new',
                                  label: (
                                    <Text
                                      color={'brand.500'}
                                      textDecoration={'underline'}
                                    >
                                      + Add New
                                    </Text>
                                  ),
                                },
                              ]}
                              required="Condition is required"
                              onValueChange={(value) => {
                                if (value === 'add_new') {
                                  onCNAddOpen();
                                  setIdxIndex(index);
                                } else if (value) {
                                  handleInputChange(
                                    value,
                                    'condition_id',
                                    index
                                  );
                                }
                              }}
                              width={'100px'}
                            />
                          </Td>
                          <Td>
                            <FieldInput
                              type="integer"
                              size={'sm'}
                              name={`qty_${index}`}
                              defaultValue={item.qty}
                              onValueChange={(value) =>
                                handleInputChange(value, 'qty', index)
                              }
                              maxLength={9}
                              width={'60px'}
                            />
                          </Td>

                          <Td>
                            <FieldSelect
                              name={`uom_${index}`}
                              size={'sm'}
                              menuPortalTarget={document.body}
                              options={convertToOptions(unitOfMeasureOptions)}
                              required={'UOM is required'}
                              defaultValue={
                                item.unit_of_measure_id?.toString() ?? ''
                              }
                              width={'90px'}
                              isDisabled={true}
                              className={'disabled-input'}
                              onValueChange={(value) =>
                                handleInputChange(
                                  value,
                                  'unit_of_measure_id',
                                  index
                                )
                              }
                            />
                          </Td>
                          <Td>{item?.mr_remark}</Td>
                          <Td>
                            <FieldInput
                              name={`remark_${index}`}
                              size={'sm'}
                              maxLength={60}
                              onValueChange={(value) =>
                                handleInputChange(value, 'remark', index)
                              }
                            />
                          </Td>
                          <Td isNumeric>
                            <IconButton
                              aria-label="Delete Row"
                              colorScheme="red"
                              size={'sm'}
                              icon={<HiTrash />}
                              onClick={() => {
                                const newItems = combinedItems.filter(
                                  (_i, iIndex) => iIndex !== index
                                );
                                setCombinedItems(newItems);
                              }}
                              isDisabled={combinedItems.length <= 1}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )}

              <HStack justify={'space-between'} mt={4}>
                <Text fontSize="lg" fontWeight="700">
                  Vendors
                </Text>
                <HStack spacing={2} align="center">
                  <FieldSelect
                    name={'customer_group_id'}
                    placeholder="Select Contact Group"
                    options={customerGroupOptions}
                    size={'sm'}
                    key={`customer_group_id_${vendorGroupResetKey}`}
                    onValueChange={(value) => {
                      setVendorGroup(value);
                    }}
                    selectProps={{
                      noOptionsMessage: () => 'No Contact Group found',
                      isLoading: customerGroupList.isLoading,
                    }}
                  />
                  <Button
                    colorScheme="brand"
                    size={'sm'}
                    minW={0}
                    onClick={() => setOpenConfirmation(true)}
                    isDisabled={!vendorGroup || loading}
                    isLoading={loading}
                    type={'button'}
                  >
                    Add
                  </Button>
                </HStack>
              </HStack>
              <LoadingOverlay isLoading={loading}>
                <TableContainer rounded={'md'} overflow={'auto'} my={4} mt={0}>
                  <Table variant="striped" size={'sm'}>
                    <Thead bg={'gray'}>
                      <Tr>
                        <Th color={'white'}>S.No.</Th>
                        <Th color={'white'} sx={{ maxW: '150px' }}>
                          Vendor Name
                        </Th>
                        <Th color={'white'} sx={{ maxW: '120px' }}>
                          Code
                        </Th>
                        <Th color={'white'} sx={{ maxW: '150px' }}>
                          Contact
                        </Th>
                        <Th color={'white'} sx={{ minWidth: '200px' }}>
                          Address
                        </Th>
                        <Th color={'white'} isNumeric>
                          Action
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {rows.map((row, index) => (
                        <Tr key={row.id}>
                          <Td>
                            <Text fontSize={'medium'}>{index + 1}.</Text>
                          </Td>
                          <Td sx={{ maxW: '150px' }}>
                            <FieldSelect
                              key={`vendorSelect-${row.id}-${vendorSelectKey}`}
                              name={`vendor_name_${row.id}`}
                              options={[
                                ...(filterOptions(row.id) ?? []),
                                {
                                  value: 'add_new',
                                  label: (
                                    <Text
                                      color={'brand.500'}
                                      textDecoration={'underline'}
                                    >
                                      + Add New Vendor
                                    </Text>
                                  ),
                                },
                              ]}
                              size={'sm'}
                              menuPortalTarget={document.body}
                              isClearable={true}
                              placeholder="Select Vendor"
                              required={'Vendor is required'}
                              defaultValue={
                                row?.customer_id ? row?.customer_id : ''
                              }
                              onValueChange={(value) => {
                                if (value === 'add_new') {
                                  // Open the modal to add a new vendor
                                  onVendorAddOpen();
                                } else {
                                  if (value === null) {
                                    form.setValues({
                                      [`contact_${rows[activeRow].id}`]: '',
                                    });
                                  }
                                  setRows((prevRows) => {
                                    const newRows = [...prevRows];
                                    newRows[index] = {
                                      ...newRows[index],
                                      customer_id: value,
                                    };
                                    return newRows;
                                  });
                                  setActiveRow(index);
                                  setContactLoading(true);
                                  setTimeout(() => {
                                    getCustomerContactManagerList(
                                      index,
                                      value ? Number(value) : 0
                                    );
                                  }, 200);
                                }
                              }}
                              showError={errorStatus}
                              // isDisabled={
                              //   row.id > 1 &&
                              //   !fields[`vendor_name_${Number(row.id) - 1}`]
                              //     ?.value
                              // }
                            />
                          </Td>
                          <Td sx={{ maxW: '150px' }}>
                            <Input
                              type="text"
                              size={'sm'}
                              placeholder="Vendor Code"
                              disabled
                              defaultValue={
                                customerListSupplier.data?.data?.find(
                                  (customer) =>
                                    customer.id ===
                                    Number(
                                      fields[`vendor_name_${row.id}`]?.value
                                    )
                                )?.code
                              }
                            />
                          </Td>
                          <Td sx={{ maxW: '150px' }}>
                            <FieldSelect
                              key={`contactSelect-${row.id}-${contactSelectKey}`}
                              name={`contact_${row.id}`}
                              required={'Contact is required'}
                              options={[
                                ...(row.options ?? []),
                                {
                                  value: 'add_new',
                                  label: (
                                    <Text
                                      color={'brand.500'}
                                      textDecoration={'underline'}
                                    >
                                      + Add New Contact
                                    </Text>
                                  ),
                                },
                              ]}
                              size={'sm'}
                              menuPortalTarget={document.body}
                              isClearable={true}
                              placeholder="Select Contact"
                              onValueChange={(value) => {
                                if (value === 'add_new') {
                                  onCMAddOpen();
                                } else {
                                  handleSelectContact(Number(value), index);
                                }
                              }}
                              selectProps={{
                                noOptionsMessage: () => 'No Contacts found',
                                isLoading:
                                  activeRow === index && contactLoading,
                              }}
                              isDisabled={!row.customer_id}
                              showError={errorStatus}
                            />
                          </Td>
                          <Td sx={{ minW: '200px' }}>
                            <Input
                              key={
                                row.selectedContact
                                  ? formatFullAddress(row.selectedContact)
                                  : 'empty'
                              }
                              type="text"
                              size={'sm'}
                              placeholder="Address"
                              disabled
                              value={
                                row.selectedContact
                                  ? formatFullAddress(row.selectedContact)
                                  : ''
                              }
                            />
                          </Td>
                          <Td isNumeric>
                            {index === rows.length - 1 && (
                              <IconButton
                                aria-label="Add Row"
                                variant="@primary"
                                size={'sm'}
                                icon={<HiOutlinePlus />}
                                onClick={addNewRow}
                                mr={2}
                                isDisabled={disableAddBtn}
                              />
                            )}

                            <IconButton
                              aria-label="View Popup"
                              colorScheme="green"
                              size={'sm'}
                              icon={<HiEye />}
                              onClick={() => handleOpenPreview(true, index)}
                              mr={2}
                              isDisabled={
                                combinedItems.length === 0 ||
                                !fields[`vendor_name_${row.id}`]?.value
                              }
                            />

                            <IconButton
                              aria-label="Delete Row"
                              colorScheme="red"
                              size={'sm'}
                              icon={<DeleteIcon />}
                              onClick={() => deleteRow(row.id)}
                              mr={2}
                              isDisabled={rows.length <= 1}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </LoadingOverlay>
              <Stack>
                <FormControl>
                  <FormLabel>Remarks</FormLabel>
                  <FieldInput
                    name={`remarks`}
                    size={'sm'}
                    sx={{ display: 'none' }}
                  />
                  <FieldHTMLEditor
                    onValueChange={handleRemarksChange}
                    maxLength={250}
                    placeHolder={'Enter Remarks Here'}
                  />
                </FormControl>
              </Stack>

              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify={'center'}
                alignItems={'center'}
                display={'flex'}
                mt={4}
              >
                <Button
                  type="button"
                  colorScheme="brand"
                  isLoading={createPRFQ.isLoading}
                  onClick={() => {
                    form.submit();
                    setHideErrors(true);
                  }}
                >
                  Submit
                </Button>

                <Tooltip
                  label="Please fill form to preview"
                  hasArrow
                  isDisabled={form.isValid}
                >
                  <Button
                    onClick={() => handleOpenPreview(false, null)}
                    colorScheme="green"
                    isDisabled={!form.isValid}
                  >
                    Preview
                  </Button>
                </Tooltip>
              </Stack>
            </Stack>
          </Formiz>
          <CustomerCreateModal
            isOpen={isVendorAddOpen}
            // onClose={() => {
            //   onVendorAddClose();
            //   customerListSupplier.refetch();
            //   setVendorSelectKey((prevKey) => prevKey + 1);
            // }}
            onClose={handleCloseCustomerModal}
            isDisabled={false}
            defaultType={'1'}
            fromPRFQ={true}
          />
          <ConditionCreateModal
            isOpen={isCNAddOpen}
            // onClose={() => {
            //   onCNAddClose();
            //   conditionList.refetch();
            // }}
            onClose={handleCloseConditionModal}
          />

          <ContactManagerCreateModal
            isOpen={isCMAddOpen}
            onClose={() => {
              onCMAddClose();
              setContactSelectKey((prevKey) => prevKey + 1);
            }}
            onModalClosed={handleCloseCMModal}
            customer_id={rows[activeRow]?.customer_id?.toString()}
          />

          <PreviewPopup
            isOpen={isPreviewModalOpen}
            onClose={handleCloseModal}
            data={previewData}
          />

          <SearchPopup
            isOpen={isSearchModalOpen}
            onClose={closeSearchPopup}
            data={popupData}
          />

          <ConfirmationPopup
            isOpen={openConfirmation}
            onClose={handleClose}
            onConfirm={handleConfirm}
            headerText="Add Vendors"
            bodyText="Are you sure you want to add the vendors under this group?"
          />
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default PRFQCreate;
