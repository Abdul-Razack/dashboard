import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Checkbox,
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
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { format } from 'date-fns';
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiOutlinePlus } from 'react-icons/hi';
import { HiOutlineInformationCircle } from 'react-icons/hi';
import { LuDownload, LuUpload } from 'react-icons/lu';
import { useQueryClient } from 'react-query';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PartNumberButtons } from '@/components/PartNumberButtons';
import { RepairLogCSVUploadModal } from '@/components/Popups/FileUploadResponse/RepairLogs';
import PreviewPopup from '@/components/PreviewContents/RepairLogs';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  convertToOptions,
  getDisplayLabel,
  getValueByLabel,
  handleDownload,
  parseCSV,
  transformToSelectOptions,
  formatDate
} from '@/helpers/commonHelper';
import { postAPICall } from '@/services/apiService';
import {
  PayloadSchema,
  SearchResponsePayload,
} from '@/services/apiService/Schema/SpareSchema';
import { useCustomerDetails } from '@/services/master/services';
import { useCreateRepairLog } from '@/services/repair-logs/services';
import { useSelDetails, useSelList } from '@/services/sales/sel/services';
import { findBulkPartNumbersbyId } from '@/services/spare/services';
import { useSearchPartNumber } from '@/services/spare/services';
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

export const RepairLogCreate = () => {
  const rowIdCounter = useRef(1);
  const queryClient = useQueryClient();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();
  const [selId, setSelId] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [repairType, setRepairType] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [formSubmitted, setFormSubmitted] = useState<boolean>(false);
  // const [disabledField, setFieldDisabled] = useState<boolean>(true);
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [partNumber, setPartNumber] = useState('');
  const [queryParams, setQueryParams] = useState<any>({});
  const listData = useSearchPartNumber(queryParams);
  const sparelistData = listData.data?.part_numbers;
  const [isBC, setIsBC] = useState<boolean>(false);
  const [isRP, setIsRP] = useState<boolean>(false);
  const [isOH, setIsOH] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<TODO>({});
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const typeOptions = [
    { value: 'sel', label: 'SEL' },
    { value: 'po', label: 'PO' },
    { value: 'project', label: 'Project' },
    { value: 'open', label: 'Open' },
    { value: 'so', label: 'SO' },
    { value: 'mr', label: 'MR' },
  ];
  const fetchBulkPartNumberDetaiils = findBulkPartNumbersbyId();

  const handleRemarksChange = (newValue: string) => {
    form.setValues({ [`remarks`]: newValue });
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  useEffect(() => {
    if (partNumber) {
      setQueryParams({ query: partNumber });
    }
  }, [partNumber]);

  const spareOptions = sparelistData?.map((spare) => ({
    value: spare.id.toString(),
    label: spare.part_number,
  }));

  const [rows, setRows] = useState<TODO[]>([]);

  const deleteRow = (rowId: number) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const [uploadedFile, setUploadedFile] = useState<TODO>(null);
  const [fileKey, setFileKey] = useState(0);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [isRespModalOpen, setIsRespModalOpen] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [formKey, setFormKey] = useState(0);
  const selList = useSelList();
  const selOptions = transformToSelectOptions(selList.data);
  const soOptions: any = [];
  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const unitOfMeasureList = useUnitOfMeasureIndex();
  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const [popupOptions, setPopupOptions] = useState<TODO>({});
  const [csvRows, setCSVRows] = useState<TODO | null>(null);

  const overallQTY = useMemo(() => {
    return rows.reduce((acc, item) => acc + item.qty, 0);
  }, [rows]);

  // const customerList = useCustomerSupplierList({
  //   type: 'customers',
  // });
  const { data: customerDetails } = useCustomerDetails(
    customerId ? customerId : '',
    {
      enabled: customerId !== null && customerId !== 0,
    }
  );
  const { data: selDetails } = useSelDetails(selId ? selId : '', {
    enabled: repairType === 'sel' && selId !== null,
  });
  const addNewItem = () => {
    let obj: any = {};
    obj.id = Number(rowIdCounter.current + 1);
    obj.part_number = fields.part_number_text?.value;
    obj.description = fields.item_description?.value;
    obj.part_number_id = fields.part_number?.value;
    obj.condition_id = fields.condition?.value;
    obj.qty = fields.quantity?.value;
    obj.unit_of_measure_id = fields.item_uom?.value;
    obj.defect = fields.defect?.value;
    obj.remark = fields.remark?.value;
    obj.is_bc = isBC;
    obj.is_rp = isRP;
    obj.is_oh = isOH;
    console.log(obj);
    setRows([...rows, obj]);
    rowIdCounter.current += 1;
    setResetKey((prevCount) => prevCount + 1);
    setIsBC(false);
    setIsRP(false);
    setIsOH(false);
    form.setValues({
      [`part_number`]: null,
      [`condition`]: null,
      [`item_uom`]: '',
      [`quantity`]: '',
      [`item_description`]: '',
      [`part_number_text`]: '',
      [`remark`]: '',
      [`defect`]: '',
    });
  };

  const getDescriptionForRow = (selectedPartNumber: any) => {
    console.log(selectedPartNumber);
    if (selectedPartNumber) {
      const spareInfo = sparelistData?.find(
        (spare) => spare.id === Number(selectedPartNumber)
      );
      form.setValues({
        [`part_number_text`]: spareInfo?.part_number,
        [`item_description`]: spareInfo?.description,
        [`item_uom`]: spareInfo?.unit_of_measure_id.toString(),
      });
    }
  };

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  const handleClose = () => {
    setOpenConfirmation(false); // Close the modal on cancel or outside click
  };

  const getPartNumberDetails = async (rows: any) => {
    try {
      console.log(rows);
      const partNumbers: any = rows.map((item: any) => item.part_number);
      const respData = await postAPICall(
        endPoints.others.search_spares_by_part_numbers,
        { part_numbers: partNumbers },
        PayloadSchema,
        SearchResponsePayload
      );

      const mergedArray = rows.map((item1: any) => {
        const item2 = respData?.results.find(
          (item: any) => item.part_number === item1.part_number
        );
        if (item2) {
          return { ...item1, ...item2 };
        }

        return item1;
      });
      setCSVRows(mergedArray);
      setLoading(false);
      setIsRespModalOpen(true);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const closeFileUploadModal = (items: any) => {
    setRowItems(items);
    setFileKey((prevKey) => prevKey + 1);
    setIsRespModalOpen(false);
  };

  const handleConfirm = async () => {
    const parsedRows: TODO = await parseCSV(uploadedFile);
    if (parsedRows.length <= 100) {
      const updatedRows = parsedRows.map((obj: any) => {
        const { condition, ...rest } = obj;
        return {
          ...rest,
          condition_id: getValueByLabel(condition, conditionOptions),
        };
      });
      getPartNumberDetails(updatedRows);
      let obj: TODO = {};
      obj.conditions = conditionOptions;
      obj.uoms = unitOfMeasureOptions;
      setPopupOptions(obj);
    } else {
      toastError({
        title:
          'Uploaded CSV has more than 100 rows. Please upload with the max of 100 rows.',
      });
    }
    setOpenConfirmation(false);
  };

  const handleOpenPreview = () => {
    let popupVariables: any = {};
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    popupVariables.conditionOptions = conditionOptions;
    popupVariables.priorityOptions = priorityOptions;
    popupVariables.typeOptions = typeOptions;
    popupVariables.customerInfo = customerDetails?.data;
    Object.keys(fields).forEach(function (key) {
      popupVariables[key] = fields[key].value;
    });
    popupVariables.items = rows;
    if (popupVariables.type === 'sel') {
      popupVariables.itemDetails = selDetails?.data;
    }
    console.log(popupVariables);
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
  };

  useEffect(() => {
    if (customerDetails?.data) {
      setLoading(false);
    }
  }, [customerDetails]);

  useEffect(() => {
    if (rows.length > 0) {
      form.setValues({ [`items`]: '1' });
    } else {
      form.setValues({ [`items`]: '' });
    }
  }, [rows]);

  useEffect(() => {
    if (selDetails?.data) {
      setRows([]);
      processDetailItems(selDetails?.data?.items);
      setTimeout(() => {
        setLoading(false);
        form.setValues({
          [`priority_id`]: selDetails?.data?.priority_id.toString(),
          [`due_date`]: dayjs(selDetails?.data?.due_date),
          [`customer_id`]: selDetails?.data?.customer_id.toString(),
          [`enquiry_date`]: dayjs(),
        });
        setCustomerId(selDetails?.data?.customer_id);
      }, 500);
    } else {
      resetFormFields();
    }
  }, [selDetails]);

  const processDetailItems = (detailsItems: any) => {
    fetchPartDetails(detailsItems, (responseData) => {
      const itemsArray = Object.values(responseData).map((data: TODO) => ({
        ...data.part_number,
        status: data.status,
      }));

      console.log(itemsArray)
      const updatedItems = detailsItems.map((item1: any) => {
        const matchingItem = itemsArray.find(
          (item2) => item2?.id === item1.part_number_id
        );
        return {
          ...item1,
          description: matchingItem?.description, // Add stock (undefined if no match)
          part_number: matchingItem?.part_number, // Add location (undefined if no match)
        };
      });
      console.log(updatedItems)
      setRowItems(updatedItems);
    });
  };

  const setRowItems = (rowItems: any) => {
    let parsedItems: any = [];
    rowItems.forEach((item: any) => {
      if (item.part_number_id !== null && item.part_number_id > 0) {
        let obj: any = {};
        obj.id = Number(rowIdCounter.current + 1);
        obj.part_number = item?.part_number;
        obj.description = item?.description;
        obj.part_number_id = Number(item?.part_number_id);
        obj.condition_id = Number(item?.condition_id);
        obj.qty = item?.qty ? Number(item?.qty) : '';
        obj.unit_of_measure_id = Number(item?.unit_of_measure_id);
        obj.remark = item.remark ? item.remark : '';
        obj.defect = item.defect ? item.defect : '';
        obj.is_bc = item?.is_bc ?? false;
        obj.is_rp = item?.is_rp ?? false;
        obj.is_oh = item?.is_oh ?? false;
        form.setValues({
          [`defect_${Number(rowIdCounter.current + 1)}`]: item?.defect,
        });
        form.setValues({
          [`remarks_${Number(rowIdCounter.current + 1)}`]: item?.remark,
        });
        parsedItems.push(obj);
        rowIdCounter.current += 1;
      }
    });
    const filteredRows = rows.filter((row) => row.part_number_id);
    const updatedRows = [...filteredRows, ...parsedItems];
    setRows(updatedRows);
  };

  const fetchPartDetails = async (
    items: TODO,
    onSuccess?: (data: any) => void
  ) => {
    try {
      const partNumbers: any = items.map((item: any) => item.part_number_id);
      if (partNumbers.length === 0) {
        console.warn('No part numbers found in items');
        return;
      }
      const spareInfo = await fetchBulkPartNumberDetaiils(partNumbers);
      if (onSuccess && spareInfo) {
        onSuccess(spareInfo);
      }
      console.log(spareInfo)
      return spareInfo;
    } catch (error) {
      console.error('Failed to fetch part details:', error);
      throw error; // Re-throw if you want calling code to handle it
    }
  };

  useEffect(() => {
    if (repairType) {
      queryClient.setQueryData(['selDetails', selId], null);
      queryClient.setQueryData(['customerDetails', customerId], null);
      if (
        repairType != 'project' &&
        repairType != 'open' &&
        repairType != 'mr'
      ) {
        //setFieldDisabled(true);
      } else {
        //setFieldDisabled(false);
      }
      resetFormFields();
    }
  }, [repairType]);

  const resetFormFields = () => {
    form.setValues({
      [`priority_id`]: '',
      [`due_date`]: '',
      [`customer_id`]: '',
      [`enquiry_date`]: dayjs(),
    });
    setCustomerId(null);
  };

  const setSelIdDebounced = useRef(
    debounce((value: number) => {
      setLoading(true);
      setFormKey((prevCount) => prevCount + 1);
      setSelId(value);
    }, 500)
  ).current;

  const createRepairLog = useCreateRepairLog({
    onSuccess: (data) => {
      toastSuccess({
        title: `Repair log Request Created ${data.id}`,
      });
      navigate('/repair-logs');
    },
    onError: (error) => {
      toastError({
        title: 'Repair log Request Creation Failed',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });

  

  const form = useForm({
    onValidSubmit: async (values) => {
      const formatSubmissionData = (formValues: any) => {
        return {
          type: formValues.type,
          priority_id: Number(formValues.priority_id),
          due_date: formatDate(formValues.due_date) || '',
          enquiry_date: formatDate(formValues.due_date) || '',
          remark: formValues.remarks ?? '',
          ref_name: formValues.ref_name,
        };
      };
      try {
        const payload: any = formatSubmissionData(values);
        payload.items = rows.map(
          ({ id, part_number, description, ...rest }) => rest
        );
        console.log(payload);
        createRepairLog.mutate(payload);
      } catch (error) {
        toastError({
          title: 'Error submitting request',
          description: 'Please try again.',
        });
      }
    },
    onSubmit: () => {
      setFormSubmitted(true);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setUploadedFile(selectedFile);
      setOpenConfirmation(true);
    }
    setFileKey((prevKey) => prevKey + 1);
  };

  const fields = useFormFields({
    connect: form,
  });

  const handleInputChange = (property: string, value: any, index: number) => {
    const updatedTabItems = [...rows];
    updatedTabItems[index][property] = value;
    setRows(updatedTabItems);
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={2}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Breadcrumb
              fontWeight="medium"
              fontSize="sm"
              separator={<ChevronRightIcon boxSize={6} color="gray.500" />}
            >
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink as={Link} to="/repair-logs">
                  Repair Logs
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Add Repair Logs</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Add Repair Logs
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
            Repair Log
          </Text>
          <LoadingOverlay isLoading={loading}>
            <Formiz autoForm connect={form}>
              <LoadingOverlay isLoading={loading}>
                <Stack spacing={2}>
                  <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    bg={'gray.100'}
                    p={4}
                    rounded={'md'}
                    border={'1px solid'}
                    borderColor={'gray.300'}
                  >
                    <FieldSelect
                      label="RR Type"
                      name="type"
                      options={typeOptions}
                      onValueChange={(value) => {
                        setRepairType(value ?? '');
                        setRows([]);
                        setFormKey((prevCount) => prevCount + 1);
                      }}
                      size={'sm'}
                      required="LR Type is required"
                    />

                    {repairType === 'sel' && (
                      <FieldSelect
                        label="SEL REF"
                        name="sel_no"
                        options={selOptions}
                        size={'sm'}
                        required="SEL No is required"
                        onValueChange={(value) => {
                          setLoading(true);
                          setSelIdDebounced(Number(value));
                        }}
                      />
                    )}

                    {repairType === 'so' && (
                      <FieldSelect
                        label="SO REF"
                        name="so_no"
                        options={soOptions}
                        size={'sm'}
                        required="SO No is required"
                        onValueChange={(value) => {
                          console.log(value);
                          setLoading(true);
                          //setSelIdDebounced(Number(value));
                        }}
                      />
                    )}

                    {repairType !== '' &&
                      repairType !== 'sel' &&
                      repairType !== 'so' && (
                        <FieldInput
                          required={
                            repairType !== '' &&
                            repairType !== 'sel' &&
                            repairType !== 'so'
                              ? 'Ref Name is required'
                              : ''
                          }
                          name={`ref_name`}
                          label={'Ref Name'}
                          size={'sm'}
                          maxLength={20}
                        />
                      )}

                    {(repairType === 'sel' || repairType === 'so') && (
                      <React.Fragment>
                        <FieldDisplay
                          label={'Customer Name'}
                          value={
                            customerDetails?.data?.business_name
                              ? customerDetails?.data?.business_name
                              : 'N/A'
                          }
                          size={'sm'}
                          style={{ backgroundColor: 'white' }}
                        />

                        <FieldDisplay
                          label={'Customer Code'}
                          value={
                            customerDetails?.data?.code
                              ? customerDetails?.data?.code
                              : 'N/A'
                          }
                          size={'sm'}
                          style={{ backgroundColor: 'white' }}
                        />
                      </React.Fragment>
                    )}
                    <FieldSelect
                      key={`priority_${formKey}`}
                      label="Priority"
                      required={'Priority is required'}
                      name="priority_id"
                      options={priorityOptions}
                      size={'sm'}
                      isDisabled={
                        repairType === '' ||
                        (repairType === 'sel' && selId === null) ||
                        repairType === 'so'
                      }
                      // className={disabledField === true ? 'disabled-input' : ''}
                    />
                  </Stack>

                  <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    bg={'gray.100'}
                    p={4}
                    rounded={'md'}
                    border={'1px solid'}
                    borderColor={'gray.300'}
                  >
                    {((repairType && repairType === 'sel') ||
                      repairType === 'so') && (
                      <React.Fragment>
                        <FieldDisplay
                          key={`ref_no_${formKey}`}
                          label={`${repairType === 'sel' ? 'SEL' : repairType === 'so' ? 'SO' : ''} No`}
                          value={
                            repairType === 'sel'
                              ? selDetails?.data?.id
                                ? selDetails?.data?.id
                                : 'N/A'
                              : 'N/A'
                            // : repairType === 'po'
                            //   ? poDetails?.data?.id
                            //     ? poDetails?.data?.id
                            //     : 'N/A'
                            //   : repairType === 'mr'
                            //     ? prDetails?.data?.id
                            //       ? prDetails?.data?.id
                            //       : 'N/A'
                            //     : 'N/A'
                          }
                          size="sm"
                          isHtml={true}
                          style={{ backgroundColor: 'white' }}
                        />

                        <FieldDisplay
                          key={`ref_id_${formKey}`}
                          label={`${repairType === 'sel' ? 'SEL' : repairType === 'so' ? 'SO' : ''} Date`}
                          value={
                            repairType === 'sel'
                              ? selDetails?.data?.created_at
                                ? format(
                                    new Date(selDetails?.data?.created_at),
                                    'dd/MM/yyyy'
                                  )
                                : 'N/A'
                              : 'N/A'
                          }
                          size="sm"
                          isHtml={true}
                          style={{ backgroundColor: 'white' }}
                        />
                      </React.Fragment>
                    )}

                    <FieldDayPicker
                      key={`due_date_${formKey}`}
                      required={'Due Date is required'}
                      label="Due Date"
                      name="due_date"
                      size={'sm'}
                      placeholder="Select Date"
                      dayPickerProps={{
                        inputProps: {
                          isDisabled:
                            repairType === '' ||
                            (repairType === 'sel' && selId === null) ||
                            repairType === 'so',
                        },
                      }}
                    />

                    <FieldDayPicker
                      key={`enquiry_date_${formKey}`}
                      required={'Enquiry Date is required'}
                      label="Enquiry Date"
                      name="enquiry_date"
                      size={'sm'}
                      placeholder="Select Date"
                      dayPickerProps={{
                        inputProps: {
                          isDisabled:
                            repairType === '' ||
                            (repairType === 'sel' && selId === null) ||
                            repairType === 'so',
                        },
                      }}
                    />
                  </Stack>
                  {((repairType !== '' &&
                    repairType !== 'so' &&
                    repairType !== 'sel') ||
                    (repairType === 'sel' && selId != null)) && (
                    <React.Fragment>
                      <HStack justify={'space-between'} mt={3}>
                        <Text
                          fontSize="md"
                          size={'sm'}
                          display="flex"
                          alignItems="center"
                        >
                          <Text as="span">Add Defective Part Number </Text>
                        </Text>
                      </HStack>

                      <TableContainer
                        rounded={'md'}
                        overflow={'auto'}
                        border="1px"
                        borderColor="gray.500"
                        borderRadius="md"
                        boxShadow="md"
                      >
                        <Table variant="simple" size={'sm'}>
                          <Thead bg={'gray'}>
                            <Tr>
                              <Th color={'white'}>Part Number</Th>
                              <Th color={'white'}>Description</Th>
                              <Th color={'white'}>Condition</Th>
                              <Th color={'white'}>Quantity</Th>
                              <Th color={'white'}>UOM</Th>
                              <Th color={'white'}>Defect</Th>
                              <Th color={'white'}>BC</Th>
                              <Th color={'white'}>RP</Th>
                              <Th color={'white'}>OH</Th>
                              <Th color={'white'}>Remark</Th>
                              <Th color={'white'} isNumeric>
                                Action
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            <Tr>
                              <Td width={'150px'}>
                                <Stack
                                  direction={{ base: 'column', md: 'row' }}
                                >
                                  <PartNumberButtons
                                    partNumber={fields.part_number?.value}
                                  />
                                  <FieldSelect
                                    key={`part_number_${resetKey}`}
                                    name={`part_number`}
                                    size={'sm'}
                                    menuPortalTarget={document.body}
                                    options={[...(spareOptions ?? [])]}
                                    isClearable={true}
                                    onValueChange={(value) => {
                                      console.log(value);
                                      if (value) {
                                        getDescriptionForRow(Number(value));
                                      } else {
                                        form.setValues({
                                          [`part_number_text`]: '',
                                          [`item_description`]: '',
                                          [`item_uom`]: '',
                                          [`condition`]: '',
                                          [`quantity`]: '',
                                          [`defect`]: '',
                                          [`remark`]: '',
                                        });
                                        setResetKey(
                                          (prevCount) => prevCount + 1
                                        );
                                        setIsBC(false);
                                        setIsRP(false);
                                        setIsOH(false);
                                      }
                                    }}
                                    selectProps={{
                                      noOptionsMessage: () => 'No parts found',
                                      isLoading: listData.isLoading,
                                      onInputChange: (event: any) => {
                                        setPartNumber(event);
                                      },
                                    }}
                                    style={{
                                      minWidth: '150px',
                                    }}
                                  />
                                </Stack>
                              </Td>
                              <Td width={'150px'}>
                                <FieldInput
                                  name={`part_number_text`}
                                  size={'sm'}
                                  isDisabled
                                  display={'none'}
                                />
                                <FieldInput
                                  name={`item_description`}
                                  size={'sm'}
                                  isDisabled
                                />
                              </Td>
                              <Td width={'120px'}>
                                <FieldSelect
                                  key={`condition_${resetKey}`}
                                  name={`condition`}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                  options={conditionOptions}
                                />
                              </Td>
                              <Td width={'80px'}>
                                <FieldInput
                                  name={`quantity`}
                                  size={'sm'}
                                  type="integer"
                                  maxLength={9}
                                />
                              </Td>
                              <Td width={'100px'}>
                                <FieldSelect
                                  name={`item_uom`}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                  options={convertToOptions(
                                    unitOfMeasureOptions
                                  )}
                                  isDisabled={true}
                                />
                              </Td>

                              <Tooltip
                                label={
                                  fields && fields[`defect`]
                                    ? fields[`defect`].value
                                    : ''
                                }
                                aria-label="Username tooltip"
                                placement="top"
                                hasArrow
                                color="white"
                                isDisabled={
                                  fields &&
                                  fields[`defect`] &&
                                  fields[`defect`].value &&
                                  fields[`defect`].value.length > 20
                                    ? false
                                    : true
                                }
                              >
                                <Td>
                                  <FieldInput
                                    name={`defect`}
                                    size={'sm'}
                                    maxLength={60}
                                  />
                                </Td>
                              </Tooltip>

                              <Td>
                                <Checkbox
                                  variant="subtle"
                                  colorScheme={isBC ? 'green' : 'red'}
                                  isChecked={isBC === true}
                                  onChange={(e) => {
                                    setIsBC(e.target.checked);
                                  }}
                                  sx={{
                                    '& .chakra-checkbox__control': {
                                      bg: isBC ? 'green.100' : 'red.100',
                                      borderColor: isBC
                                        ? 'green.300'
                                        : 'red.300',
                                      borderWidth: '2px',
                                      _checked: {
                                        bg: 'green.100',
                                        borderColor: 'green.300',
                                        color: 'green.500', // Tick color
                                      },
                                    },
                                    // Hover states
                                    '&:hover .chakra-checkbox__control:not([data-checked])':
                                      {
                                        bg: 'red.50',
                                      },
                                    '&:hover .chakra-checkbox__control[data-checked]':
                                      {
                                        bg: 'green.50',
                                      },
                                  }}
                                  size={'lg'}
                                />
                              </Td>
                              <Td>
                                <Checkbox
                                  variant="subtle"
                                  colorScheme={isRP ? 'green' : 'red'}
                                  isChecked={isRP === true}
                                  onChange={(e) => {
                                    setIsRP(e.target.checked);
                                  }}
                                  sx={{
                                    '& .chakra-checkbox__control': {
                                      bg: isRP ? 'green.100' : 'red.100',
                                      borderColor: isRP
                                        ? 'green.300'
                                        : 'red.300',
                                      borderWidth: '2px',
                                      _checked: {
                                        bg: 'green.100',
                                        borderColor: 'green.300',
                                        color: 'green.500', // Tick color
                                      },
                                    },
                                    // Hover states
                                    '&:hover .chakra-checkbox__control:not([data-checked])':
                                      {
                                        bg: 'red.50',
                                      },
                                    '&:hover .chakra-checkbox__control[data-checked]':
                                      {
                                        bg: 'green.50',
                                      },
                                  }}
                                  size={'lg'}
                                />
                              </Td>
                              <Td>
                                <Checkbox
                                  variant="subtle"
                                  colorScheme={isOH ? 'green' : 'red'}
                                  isChecked={isOH === true}
                                  onChange={(e) => {
                                    setIsOH(e.target.checked);
                                  }}
                                  sx={{
                                    '& .chakra-checkbox__control': {
                                      bg: isOH ? 'green.100' : 'red.100',
                                      borderColor: isOH
                                        ? 'green.300'
                                        : 'red.300',
                                      borderWidth: '2px',
                                      _checked: {
                                        bg: 'green.100',
                                        borderColor: 'green.300',
                                        color: 'green.500', // Tick color
                                      },
                                    },
                                    // Hover states
                                    '&:hover .chakra-checkbox__control:not([data-checked])':
                                      {
                                        bg: 'red.50',
                                      },
                                    '&:hover .chakra-checkbox__control[data-checked]':
                                      {
                                        bg: 'green.50',
                                      },
                                  }}
                                  size={'lg'}
                                />
                              </Td>
                              <Tooltip
                                label={
                                  fields && fields[`remark`]
                                    ? fields[`remark`].value
                                    : ''
                                }
                                aria-label="Defect tooltip"
                                placement="top"
                                hasArrow
                                color="white"
                                isDisabled={
                                  fields &&
                                  fields[`remark`] &&
                                  fields[`remark`].value &&
                                  fields[`remark`].value.length > 20
                                    ? false
                                    : true
                                }
                              >
                                <Td>
                                  <FieldInput
                                    name={`remark`}
                                    size={'sm'}
                                    maxLength={60}
                                  />
                                </Td>
                              </Tooltip>

                              <Td isNumeric>
                                <Button
                                  variant="@primary"
                                  size={'sm'}
                                  onClick={addNewItem}
                                  isDisabled={
                                    !fields.item_uom?.value ||
                                    !fields.part_number?.value ||
                                    !fields.condition?.value ||
                                    !fields.defect?.value ||
                                    !fields.quantity?.value
                                  }
                                >
                                  <HiOutlinePlus /> Add Item
                                </Button>
                              </Td>
                            </Tr>
                          </Tbody>
                        </Table>
                      </TableContainer>

                      <HStack justify={'space-between'} mt={3}>
                        <Text
                          fontSize="md"
                          size={'sm'}
                          display="flex"
                          alignItems="center"
                        >
                          <Text as="span">Defective Items </Text>
                          <Text as="span" color={'red'} ml={2}>
                            {' '}
                            *{' '}
                          </Text>
                          {formSubmitted &&
                            fields &&
                            !fields[`items`].value && (
                              <React.Fragment>
                                <HiOutlineInformationCircle
                                  style={{
                                    marginLeft: '4px',
                                    color: 'red',
                                    marginRight: 2,
                                  }}
                                />
                                <Text as="span" fontSize="sm" color="red.500">
                                  Add Some defect Items
                                </Text>
                              </React.Fragment>
                            )}
                        </Text>
                        <Input
                          type="file"
                          accept=".csv"
                          display="none"
                          id="file-upload-input"
                          onChange={handleFileChange}
                          key={fileKey}
                        />
                        <HStack ml="auto">
                          <Button
                            leftIcon={<LuDownload />}
                            colorScheme="blue"
                            as="label"
                            size={'sm'}
                            isDisabled={loading}
                            onClick={() =>
                              handleDownload(
                                import.meta.env
                                  .VITE_REPAIR_SAMPLE_PARTNUMBERS_CSV
                              )
                            }
                          >
                            Download Sample
                          </Button>

                          <Button
                            leftIcon={<LuUpload />}
                            colorScheme="green"
                            as="label"
                            htmlFor="file-upload-input"
                            size={'sm'}
                            isDisabled={loading}
                          >
                            Upload Items
                          </Button>
                        </HStack>
                      </HStack>
                      <TableContainer
                        rounded={'md'}
                        overflow={'auto'}
                        border="1px"
                        borderColor="gray.500"
                        borderRadius="md"
                        boxShadow="md"
                      >
                        <Table variant="simple" size={'sm'}>
                          <Thead bg={'gray'}>
                            <Tr>
                              <Th color={'white'}>S.No</Th>
                              <Th color={'white'}>Part.Num & Desc</Th>
                              <Th color={'white'}>Cond.</Th>
                              <Th color={'white'}>Qty</Th>
                              <Th color={'white'}>UOM</Th>
                              <Th color={'white'}>Defect</Th>
                              <Th color={'white'}>BC</Th>
                              <Th color={'white'}>RP</Th>
                              <Th color={'white'}>OH</Th>
                              <Th color={'white'}>Remarks</Th>
                              <Th color={'white'} isNumeric>
                                Action
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {rows.map((row, index) => (
                              <Tr
                                key={row.id}
                                background={
                                  row?.is_duplicate === true ? 'yellow' : ''
                                }
                              >
                                <Td>
                                  <Text fontSize={'small'}>{index + 1}.</Text>
                                </Td>
                                <Td>
                                  {row?.part_number && (
                                    <Text fontSize="small" lineHeight="tall">
                                      {row?.part_number}
                                      {row?.description && (
                                        <>
                                          <br />
                                          <Text
                                            as="span"
                                            fontSize="xs"
                                            color="gray.600"
                                          >
                                            {row?.description}
                                          </Text>
                                        </>
                                      )}
                                    </Text>
                                  )}
                                </Td>

                                <Td>
                                  <Text fontSize={'small'}>
                                    {getDisplayLabel(
                                      conditionOptions,
                                      row?.condition_id
                                        ? row?.condition_id.toString()
                                        : 0,
                                      'Condition'
                                    ) || 'N/A'}
                                  </Text>
                                </Td>
                                <Td>
                                  <Text fontSize={'small'}>{row?.qty}</Text>
                                </Td>
                                <Td>
                                  <Text fontSize={'small'}>
                                    {getDisplayLabel(
                                      convertToOptions(unitOfMeasureOptions),
                                      row?.unit_of_measure_id
                                        ? row?.unit_of_measure_id.toString()
                                        : 0,
                                      'UOM'
                                    ) || 'N/A'}
                                  </Text>
                                </Td>
                                <Tooltip
                                  label={
                                    fields && fields[`defect_${row.id}`]
                                      ? fields[`defect_${row.id}`].value
                                      : ''
                                  }
                                  aria-label="Username tooltip"
                                  placement="top"
                                  hasArrow
                                  color="white"
                                  isDisabled={
                                    fields &&
                                    fields[`defect_${row.id}`] &&
                                    fields[`defect_${row.id}`].value &&
                                    fields[`defect_${row.id}`].value.length > 20
                                      ? false
                                      : true
                                  }
                                >
                                  <Td>
                                    <FieldInput
                                      name={`defect_${row.id}`}
                                      size={'sm'}
                                      defaultValue={
                                        row.defect ? row.defect : ''
                                      }
                                      maxLength={60}
                                      onValueChange={(value) => {
                                        handleInputChange(
                                          'defect',
                                          value,
                                          index
                                        );
                                      }}
                                    />
                                  </Td>
                                </Tooltip>

                                <Td>
                                  <Checkbox
                                    variant="subtle"
                                    key={`is_bc_${row.id}`}
                                    colorScheme={row.is_bc ? 'green' : 'red'}
                                    isChecked={row.is_bc === true}
                                    onChange={(e) => {
                                      handleInputChange(
                                        'is_bc',
                                        e.target.checked,
                                        index
                                      );
                                    }}
                                    sx={{
                                      '& .chakra-checkbox__control': {
                                        bg: row.is_bc ? 'green.100' : 'red.100',
                                        borderColor: row.is_bc
                                          ? 'green.300'
                                          : 'red.300',
                                        borderWidth: '2px',
                                        _checked: {
                                          bg: 'green.100',
                                          borderColor: 'green.300',
                                          color: 'green.500', // Tick color
                                        },
                                      },
                                      // Hover states
                                      '&:hover .chakra-checkbox__control:not([data-checked])':
                                        {
                                          bg: 'red.50',
                                        },
                                      '&:hover .chakra-checkbox__control[data-checked]':
                                        {
                                          bg: 'green.50',
                                        },
                                    }}
                                    size={'lg'}
                                  />
                                </Td>
                                <Td>
                                  <Checkbox
                                    variant="subtle"
                                    key={`is_rp_${row.id}`}
                                    colorScheme={row.is_rp ? 'green' : 'red'}
                                    isChecked={row.is_rp === true}
                                    onChange={(e) => {
                                      handleInputChange(
                                        'is_rp',
                                        e.target.checked,
                                        index
                                      );
                                    }}
                                    sx={{
                                      '& .chakra-checkbox__control': {
                                        bg: row.is_rp ? 'green.100' : 'red.100',
                                        borderColor: row.is_rp
                                          ? 'green.300'
                                          : 'red.300',
                                        borderWidth: '2px',
                                        _checked: {
                                          bg: 'green.100',
                                          borderColor: 'green.300',
                                          color: 'green.500', // Tick color
                                        },
                                      },
                                      // Hover states
                                      '&:hover .chakra-checkbox__control:not([data-checked])':
                                        {
                                          bg: 'red.50',
                                        },
                                      '&:hover .chakra-checkbox__control[data-checked]':
                                        {
                                          bg: 'green.50',
                                        },
                                    }}
                                    size={'lg'}
                                  />
                                </Td>
                                <Td>
                                  <Checkbox
                                    variant="subtle"
                                    key={`is_oh_${row.id}`}
                                    colorScheme={row.is_oh ? 'green' : 'red'}
                                    isChecked={row.is_oh === true}
                                    onChange={(e) => {
                                      handleInputChange(
                                        'is_oh',
                                        e.target.checked,
                                        index
                                      );
                                    }}
                                    sx={{
                                      '& .chakra-checkbox__control': {
                                        bg: row.is_oh ? 'green.100' : 'red.100',
                                        borderColor: row.is_oh
                                          ? 'green.300'
                                          : 'red.300',
                                        borderWidth: '2px',
                                        _checked: {
                                          bg: 'green.100',
                                          borderColor: 'green.300',
                                          color: 'green.500', // Tick color
                                        },
                                      },
                                      // Hover states
                                      '&:hover .chakra-checkbox__control:not([data-checked])':
                                        {
                                          bg: 'red.50',
                                        },
                                      '&:hover .chakra-checkbox__control[data-checked]':
                                        {
                                          bg: 'green.50',
                                        },
                                    }}
                                    size={'lg'}
                                  />
                                </Td>
                                <Tooltip
                                  label={
                                    fields && fields[`remark_${row.id}`]
                                      ? fields[`remark_${row.id}`].value
                                      : ''
                                  }
                                  aria-label="Remarks tooltip"
                                  placement="top"
                                  hasArrow
                                  color="white"
                                  isDisabled={
                                    fields &&
                                    fields[`remark_${row.id}`] &&
                                    fields[`remark_${row.id}`].value &&
                                    fields[`remark_${row.id}`].value.length > 20
                                      ? false
                                      : true
                                  }
                                >
                                  <Td>
                                    <FieldInput
                                      name={`remark_${row.id}`}
                                      size={'sm'}
                                      defaultValue={
                                        row.remark ? row.remark : ''
                                      }
                                      maxLength={60}
                                      onValueChange={(value) => {
                                        handleInputChange(
                                          'remark',
                                          value,
                                          index
                                        );
                                      }}
                                    />
                                  </Td>
                                </Tooltip>
                                <Td isNumeric>
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
                            {rows && rows.length > 0 && (
                              <Tr>
                                <Td colSpan={5}>
                                  Total Line Items:
                                  <Text
                                    as={'span'}
                                    style={{ fontWeight: 'bold' }}
                                    ml={2}
                                    size={'sm'}
                                  >
                                    {rows.length}
                                  </Text>
                                </Td>

                                <Td colSpan={4}>
                                  Total Qty:
                                  <Text
                                    as={'span'}
                                    style={{ fontWeight: 'bold' }}
                                    ml={2}
                                    size={'sm'}
                                  >
                                    {overallQTY}
                                  </Text>
                                </Td>
                                <Td colSpan={2}></Td>
                              </Tr>
                            )}
                            {rows && rows.length === 0 && (
                              <Tr>
                                <Td colSpan={11} textAlign={'center'}>
                                  No items Found.
                                </Td>
                              </Tr>
                            )}
                          </Tbody>
                        </Table>
                      </TableContainer>

                      <Stack>
                        <FormControl>
                          <FormLabel
                            size={'sm'}
                            display="flex"
                            alignItems="center"
                            gap={1}
                          >
                            Remarks
                            <Text as="span" color={'red'}>
                              *
                            </Text>
                            {formSubmitted &&
                              fields &&
                              !fields[`remarks`].value && (
                                <React.Fragment>
                                  <HiOutlineInformationCircle
                                    style={{ marginLeft: '4px', color: 'red' }}
                                  />
                                  <Text as="span" fontSize="sm" color="red.500">
                                    Repair remarks required
                                  </Text>
                                </React.Fragment>
                              )}
                          </FormLabel>
                          <FieldInput
                            name={`remarks`}
                            required={'remarks requird'}
                            size={'sm'}
                            sx={{ display: 'none' }}
                          />
                          <FieldInput
                            name={`items`}
                            required={'items required'}
                            size={'sm'}
                            sx={{ display: 'none' }}
                          />
                          <FieldHTMLEditor
                            onValueChange={handleRemarksChange}
                            maxLength={150}
                            placeHolder={'Enter Remarks Here'}
                          />
                        </FormControl>
                      </Stack>
                    </React.Fragment>
                  )}
                  <Stack
                    direction={{ base: 'column', md: 'row' }}
                    justify={'center'}
                    mt={4}
                  >
                    <Button
                      type="submit"
                      colorScheme="brand"
                      isLoading={createRepairLog.isLoading}
                    >
                      Save
                    </Button>

                    <Tooltip
                      label="Please fill form to preview"
                      hasArrow
                      isDisabled={form.isValid}
                    >
                      <Button
                        onClick={() => handleOpenPreview()}
                        colorScheme="green"
                        isDisabled={!form.isValid}
                      >
                        Preview
                      </Button>
                    </Tooltip>
                  </Stack>
                </Stack>
              </LoadingOverlay>
            </Formiz>
          </LoadingOverlay>

          <ConfirmationPopup
            isOpen={openConfirmation}
            onClose={handleClose}
            onConfirm={handleConfirm}
            headerText="Upload File"
            bodyText="Are you sure you want to upload this file?"
          />

          <PreviewPopup
            isOpen={isPreviewModalOpen}
            onClose={handleCloseModal}
            data={previewData}
          />

          <RepairLogCSVUploadModal
            isOpen={isRespModalOpen}
            onClose={closeFileUploadModal}
            rows={csvRows}
            options={popupOptions}
          />
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default RepairLogCreate;
