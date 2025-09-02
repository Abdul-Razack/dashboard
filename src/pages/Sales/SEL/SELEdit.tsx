import { useEffect, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
import FieldDisplay from '@/components/FieldDisplay';
import {
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
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiEye, HiOutlinePlus } from 'react-icons/hi';
import { LuDownload, LuUpload } from 'react-icons/lu';
import { UseQueryResult } from 'react-query';
import {
  Link,
  useNavigate,
} from 'react-router-dom';
import dayjs from 'dayjs';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldDayPicker } from '@/components/FieldDayPicker';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import SpareCreateModal from '@/components/Modals/SpareMaster';
import { PartNumberButtons } from '@/components/PartNumberButtons';
import { PRCSVUploadModal } from '@/components/Popups/FileUploadResponse/PurchaseRequest';
import { ModalPopup } from '@/components/Popups/PurchaseRequest';
import PreviewPopup from '@/components/PreviewContents/Purchase/MaterialRequest';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  convertToOptions,
  filterUOMoptions,
  getValueByLabel,
  handleDownload,
  parseCSV,
  formatDate,
  transformToSelectOptions
} from '@/helpers/commonHelper';
import ConditionCreateModal from '@/pages/Submaster/Condition/ConditionCreateModal';
// import { uploadAPICall } from '@/services/apiService';
import { getAPICall, postAPICall } from '@/services/apiService';
import { FindByPartNumberIdPayload } from '@/services/apiService/Schema/PRSchema';
import {
  PayloadSchema,
  SearchResponsePayload,
} from '@/services/apiService/Schema/SpareSchema';
import { useCreateSel } from '@/services/sales/sel/services';
import { useSearchPartNumber } from '@/services/spare/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { usePriorityList, fetchPriorityInfo } from '@/services/submaster/priority/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';
import { useCustomerList, useCustomerListCode } from '@/services/master/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { usePaymentModeList } from '@/services/submaster/paymentmode/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';
import { useFOBList } from '@/services/submaster/fob/services';
import { useModeOfReceiptList } from '@/services/submaster/mode-of-receipt/services';

import { useContactManagerDetails, useContactManagerListById } from '@/services/master/contactmanager/services';
import { CustomerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import { formatContactAddress, formatShippingAddress } from '@/helpers/commonHelper';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

export const SELEdit = () => {
  const [customer_id, setCustomerId] = useState<number>(0);
  const [fullContactAddress, setFullContactAddress] = useState('');
  const [fullVendorAddress, setFullVendorAddress] = useState('');
  const [customerDetails, setCustomerDetails] = useState<TODO>({});
  const [shippingOptions, setShippingOptions] = useState<TODO>([]);
  const [shippingAddress, setShippingAddress] = useState<number>(0);
  const [contactManager, setContactManager] = useState<number>(0);

  const [queryParams, setQueryParams] = useState<any>({});
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [spareLoading, setSpareSearchLoading] = useState<boolean>(false);
  const [uploadedFile, setUploadedFile] = useState<TODO>(null);
  const [fileKey, setFileKey] = useState(0);
  const [isRespModalOpen, setIsRespModalOpen] = useState(false);
  const [csvRows, setCSVRows] = useState<TODO | null>(null);
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [recentlyCreatedSpares, setRecentlyCreatedSpares] = useState<any>([]);
  const [rows, setRows] = useState<TODO[]>([{ id: 1, disabled: true, options: convertToOptions(unitOfMeasureOptions) }]);
  const [popupData, setPopupData] = useState<any>({});
  const [previewData, setPreviewData] = useState<any>([]);
  const rowIdCounter = useRef(1);
  const [partNumber, setPartNumber] = useState('');
  const [changedRIndex, setChangedRIndex] = useState<number | null>(null);
  const listData = useSearchPartNumber(queryParams);
  const sparelistData = listData?.data?.part_numbers;
  const spareOptions = sparelistData?.map((spare: any) => ({
    value: spare.id.toString(),
    label: spare.part_number,
  }));
  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const [partNumberId, setPartNumberId] = useState<any>(null);
  const [popupOptions, setPopupOptions] = useState<TODO>({});
  const unitOfMeasureList = useUnitOfMeasureIndex();
  
  const [existingPartNos, setExistingPartNos] = useState<string>('');
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();
  
  const setPartNumberDebounced = useRef(
    debounce((value: any) => {
      setPartNumber(value);
    })
  ).current;

  const addNewRow = () => {
    rowIdCounter.current += 1; // Increment the counter to get a new unique ID
    const newRow = { id: rowIdCounter.current, disabled: true };
    setRows([...rows, newRow]);
    setPartNumberDebounced('');
    setChangedRIndex(null);
  };

  const handleInputChange = (property: string, value: any, index: number) => {
    const updatedTabItems = [...rows];
    updatedTabItems[index][property] = value;

    updateRowDuplicateProp(updatedTabItems);
  };

  const handleCloseSpareModal = (status: boolean, id: any) => {
    setPartNumKey((prevKey) => prevKey + 1);
    if (status === true) {
      setRecentlyCreatedSpares((prevNumbers: any) => [...prevNumbers, id]);
      setTimeout(() => {
        form.setValues({ [selectedPartNum]: id.toString() });
        if (id) {
          listData.refetch();
        }
      }, 1000);
    } else {
      setTimeout(() => {
        form.setValues({ [selectedPartNum]: '' });
      }, 1000);
    }
    setSelectedPartNum('');
    onNewSpareModalClose();
  };

  const handleCloseConditionModal = (status?: boolean) => {
    console.log(status);
    if (status) {
      setConditionIdKey((prevKey) => prevKey + 1);
      conditionList.refetch();
    }
    setTimeout(() => {
      form.setValues({ [selectedCondition]: '' });
    }, 1000);
    onCNAddClose();
  };

  const updateRowDuplicateProp = (updatedTabItems: any) => {
    const seen = new Set(); // To keep track of combinations of part_number_id and condition_id
    const result = updatedTabItems.map((item: any) => {
      const { part_number_id, condition_id } = item;
      const key = `${part_number_id}-${condition_id || ''}`; // Combine part_number_id and condition_id as a unique key

      if (seen.has(key)) {
        item.is_duplicate = true;
      } else {
        item.is_duplicate = false;
        seen.add(key); // Mark the combination as seen
      }
      return item;
    });

    setRows(result);
  };

  const handleRemarksChange = (newValue: string) => {
    form.setValues({ [`remarks`]: newValue });
  };

  const deleteRow = (rowId: number) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  useEffect(() => {
    setQueryParams({ query: partNumber });
  }, [partNumber]);
  

  useEffect(() => {
    if (recentlyCreatedSpares.length > 0) {
      setExistingPartNos(recentlyCreatedSpares.join(','));
    } else {
      setExistingPartNos('');
    }
  }, [recentlyCreatedSpares]);

  useEffect(() => {
    setSpareSearchLoading(false);
  }, [listData]);

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  useEffect(() => {
    if (existingPartNos) {
      setQueryParams({ exist_ids: existingPartNos });
    }
  }, [existingPartNos]);

  useEffect(() => {
    if (unitOfMeasureOptions.length > 0) {
      setRows(
        (prevData) =>
          prevData.map((item) => ({
            ...item,
            options: convertToOptions(unitOfMeasureOptions),
          })) // Update the name for all rows
      );
    }
  }, [unitOfMeasureOptions]);

  useEffect(() => {
    if (changedRIndex !== null) {
      setPartNumber('');
    }
  }, [changedRIndex]);

  useEffect(() => {
    if (spareLoading === true) {
      setTimeout(() => {
        setSpareSearchLoading(false);
      }, 3000);
    }
  }, [spareLoading]);

  const [condition_id_key, setConditionIdKey] = useState(0);
  const [selectedPartNum, setSelectedPartNum] = useState<string>('');
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [partNumKey, setPartNumKey] = useState(0);
  const priorityList: UseQueryResult<QueryData, unknown> = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);

  const customerList: UseQueryResult<QueryData, unknown> = useCustomerList();
  const customerListCode: UseQueryResult<QueryData, unknown> = useCustomerListCode();
  const paymentModeList: UseQueryResult<QueryData, unknown> = usePaymentModeList();
  const paymentTermsList: UseQueryResult<QueryData, unknown> = usePaymentTermsList();
  const currencyList: UseQueryResult<QueryData, unknown> = useCurrencyList();
  const fobList: UseQueryResult<QueryData, unknown> = useFOBList();
  const receiptList: UseQueryResult<QueryData, unknown> =  useModeOfReceiptList();

  const customerOptions = transformToSelectOptions(customerList.data);
  const customerCodeOptions = transformToSelectOptions(customerListCode?.data);
  const paymentModeOptions = transformToSelectOptions(paymentModeList.data);
  const paymentTermsOptions = transformToSelectOptions(paymentTermsList.data);
  const currencyOptions = transformToSelectOptions(currencyList.data);
  const fobOptions = transformToSelectOptions(fobList.data);
  const receiptOptions = transformToSelectOptions(receiptList.data);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const handleOpenModal = (item_id: number) => {
    let popupVariables: any = {};
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    popupVariables.conditionOptions = conditionOptions;
    let obj: any = {};
    obj.part_number_id = sparelistData?.find(
      (spare) => spare.id === Number(fields[`part_number_${item_id}`]?.value)
    )?.part_number;
    obj.condition_id = Number(fields[`condition_${item_id}`]?.value);
    obj.qty = fields[`quantity_${item_id}`]?.value;
    obj.unit_of_measure_id = Number(fields[`uom_${item_id}`]?.value);
    obj.remarks = fields[`remarks_${item_id}`]?.value;
    popupVariables.formData = obj;
    setPopupData(popupVariables);
    setIsModalOpen(true);
  };
  

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setUploadedFile(selectedFile);
      setOpenConfirmation(true);
    }
    setFileKey((prevKey) => prevKey + 1);
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

      const existing_ids = respData?.results
        .map((item: any) => item.id)
        .filter((id: any) => id !== null);
      if (existing_ids.length > 0) {
        console.log(existing_ids.join(','));
        setExistingPartNos(existing_ids.join(','));
      }
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

  const handleClose = () => {
    setOpenConfirmation(false); // Close the modal on cancel or outside click
  };

  const closeFileUploadModal = (items: any) => {
    let parsedItems: any = [];
    console.log(items);
    items.forEach((item: any) => {
      if (item.part_number_id !== null && item.part_number_id > 0) {
        let obj: any = {};
        obj.id = Number(rowIdCounter.current + 1);
        obj.part_number_id = Number(item?.part_number_id);
        obj.condition_id = Number(item?.condition_id);
        obj.qty = item?.quantity ? Number(item?.quantity) : '';
        obj.unit_of_measure_id = Number(item?.unit_of_measure_id);
        obj.options =
          Number(item?.unit_of_measure_id) === 6
            ? convertToOptions(unitOfMeasureOptions)
            : filterUOMoptions(unitOfMeasureOptions, 2);
        obj.disabled = Number(item?.unit_of_measure_id) === 6 ? true : false;
        obj.remark = item.remark ? item.remark : '';
        form.setValues({
          [`description_${Number(rowIdCounter.current + 1)}`]:
            item?.description,
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
    updateRowDuplicateProp(updatedRows);
    setFileKey((prevKey) => prevKey + 1);
    setIsRespModalOpen(false);
  };

  const handleOpenPreview = () => {
    let popupVariables: any = {};
    popupVariables.conditionOptions = conditionOptions;
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    let items: any = [];
    rows.forEach((item: any) => {
      let obj: any = {};
      obj.part_number_id = Number(fields[`part_number_${item.id}`]?.value);
      obj.condition_id = Number(fields[`condition_${item.id}`]?.value);
      obj.qty = fields[`quantity_${item.id}`]?.value;
      obj.unit_of_measure_id = Number(fields[`uom_${item.id}`]?.value);
      obj.remark = fields[`remarks_${item.id}`]?.value;
      items.push(obj);
    });
    Object.keys(fields).forEach(function (key) {
      popupVariables[key] = fields[key].value;
    });
    popupVariables.items = items;
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsPreviewModalOpen(false);
    setIsRespModalOpen(false);
  };

  const {
    isOpen: isCNAddOpen,
    onOpen: onCNAddOpen,
    onClose: onCNAddClose,
  } = useDisclosure();

  const {
    isOpen: isNewSpareModalOpen,
    onOpen: onNewSpareModalOpen,
    onClose: onNewSpareModalClose,
  } = useDisclosure();

  const openSpareCreateModal = (fieldName: string) => {
    setSelectedPartNum(fieldName);
    onNewSpareModalOpen();
  };

  const openConditionCreateModal = (fieldName: string) => {
    setSelectedCondition(fieldName);
    onCNAddOpen();
  };
  
  

  // Helper function for date formatting
  const createSel = useCreateSel({
    onSuccess: ({ id, message }) => {
      toastSuccess({
        title: 'Sel created successfully - ' + id,
        description: message,
      });
      navigate('/sel-master');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create Sel',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      const duplicateCount = rows.filter(
        (item) => item.is_duplicate === true
      ).length;
      if (duplicateCount === 0) {
        const payload = {
            mode_of_receipt_id: Number(values?.mode_of_receipt_id),
            customer_id:  Number(values?.customer_id),
            priority_id:  Number(values?.priority_id),
            customer_contact_manager_id:  Number(values?.customer_contact_manager_id),
            customer_shipping_address_id:  Number(values?.customer_shipping_address_id),
            currency_id:  Number(values?.currency_id),
            due_date:  formatDate(values?.due_date) as string, 
            cust_rfq_no:  String(values?.cust_rfq_no),
            cust_rfq_date:  formatDate(values?.cust_rfq_date) as string,
            fob_id:  Number(values?.fob_id),
            payment_mode_id:  Number(values?.payment_mode_id),
            payment_terms_id:  Number(values?.payment_terms_id),
            remarks: values.remarks,
            items: rows.map((row) => ({
                part_number_id: Number(values[`part_number_${row.id}`]),
                condition_id: Number(values[`condition_${row.id}`]),
                qty: Number(values[`quantity_${row.id}`]),
                unit_of_measure_id: Number(values[`uom_${row.id}`]),
                remark: values[`remarks_${row.id}`],
            })),
        };

        createSel.mutate(payload);
      } else {
        toastError({
          title: 'Duplicate Entries found',
          description: 'Same Part Number added with same condition manytimes',
        });
      }
    },
  });

  const fields = useFormFields({
    connect: form,
  });

  const getPartNumberInfo = async (part_number_id: number) => {
    try {
      const response = await getAPICall(
        endPoints.find.spare_by_partnumber.replace(':id', part_number_id),
        FindByPartNumberIdPayload,
        {}
      );
      return response?.part_number;
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const getDescriptionForRow = async (id: number, rowId: number) => {
    const selectedPartNumber = id;
    if (selectedPartNumber) {
      const partInfo = await getPartNumberInfo(selectedPartNumber);
      form.setValues({ [`description_${rowId}`]: partInfo?.description });
      form.setValues({
        [`uom_${rowId}`]: partInfo?.unit_of_measure_id?.toString(),
      });
      setSpareSearchLoading(false);
      setRows((prevData) =>
        prevData.map((item) =>
          item.id === rowId
            ? {
                ...item,
                disabled: partInfo?.unit_of_measure_id === 6 ? true : false,
                options:
                  partInfo?.unit_of_measure_id === 6
                    ? convertToOptions(unitOfMeasureOptions)
                    : filterUOMoptions(unitOfMeasureOptions, 2),
              }
            : item
        )
      );
    }
  };

  useEffect(() => {
    if (partNumberId !== null) {
      let obj: TODO = {};
      obj.conditions = conditionOptions;
      obj.uoms = unitOfMeasureOptions;
      setPopupOptions(obj);
    }
  }, [partNumberId]);

  const contactList = useContactManagerListById(customer_id || 0);
  const contactOptions = transformToSelectOptions(contactList.data);
  
  const contactDetails = useContactManagerDetails(customer_id);

  useEffect(() => {
    if (contactDetails.data) {
      setFullContactAddress(formatContactAddress(contactDetails.data));
    } else {
      setFullContactAddress('NA');
    }
  }, [contactDetails.data]);

  useEffect(() => {
    if (contactOptions && contactOptions.length > 0) {
        const newContactManager = Number(contactOptions[0].value);
        setContactManager(newContactManager);
    }
  }, [contactOptions, contactManager]);

  useEffect(() => {
      getCustomerInfo(customer_id)
  }, [customer_id]);
  
  const getCustomerInfo = async (customerId: any) => {
    try {
      const response = await getAPICall(
        endPoints.info.customer.replace(':id', customerId),
        CustomerInfoSchema,
        {include_default_shipping: true}
      );
        setCustomerDetails(response);
       
        setShippingOptions(response?.data?.customer_shipping_addresses?.map((address: any) => ({
          value: address.id,
          label: address.attention,
        })) || []);
      //setLoading(false);
    } catch (err) {
      //setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
      const shippingAddressInfo =
        customerDetails?.data?.customer_shipping_addresses?.find(
          (item: any) => item.id === shippingAddress
        );
      if (shippingAddressInfo) {
        setFullVendorAddress(formatShippingAddress(shippingAddressInfo));      
      } else {
        setFullVendorAddress('NA');
      }
    
  }, [shippingAddress]);

  useEffect(() => {
    if (shippingOptions.length > 0) {
      if (customer_id) {
        form.setValues({
          [`customer_shipping_address_id`]: shippingOptions[0].value,
        });
        setShippingAddress(Number(shippingOptions[0].value));
      }
    } else {
      form.setValues({ [`customer_shipping_address_id`]: '' });
      setShippingAddress(0);
      setFullVendorAddress('NA');
    }
  }, [shippingOptions, customer_id]);
  
  const [disabledDatePicker, setDisabledDatePicker] = useState<boolean>(true);
  const getPriorityDetails = fetchPriorityInfo()
  
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
                <BreadcrumbLink as={Link} to={'/sel-master'}>
                   SEL Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Edit SEL</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Edit SEL
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
             SEL
          </Text>

          <Formiz autoForm connect={form}>
            <FieldInput name={`remarks`} size={'sm'} sx={{ display: 'none' }} />
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
                        label={'Mode of Receipt'}
                        name={'mode_of_receipt_id'}
                        required={'Mode of Receipt id required'}
                        placeholder="Select Receipt"
                        options={receiptOptions}
                    />
                    <FieldInput
                        label={'Cust RFQ NO'}
                        name={'cust_rfq_no'}
                        placeholder="Enter Cust RFQ NO"
                        type='alpha-numeric-with-special'
                        allowedSpecialChars={["-","/"]}
                        maxLength={20}
                    />
                    <FieldDayPicker
                      label="Cust RFQ Date"
                      name="cust_rfq_date"
                      required="Cust RFQ Date is required"
                      placeholder="Select Cust RFQ Date"
                      disabledDays={{ before: new Date() }}
                    />
                    <FieldSelect
                        label={'Priority'}
                        name={'priority_id'}
                        required={'priority id required'}
                        placeholder="Select priority"
                        options={priorityOptions}
                        onValueChange={(value) => {
                            setDuedate(value);
                        }}
                    />
                    <FieldDayPicker
                      label="Due Date"
                      name="due_date"
                      required="Due Date is required"
                      placeholder="Select Due Date"
                      dayPickerProps={{
                        inputProps: {
                          isDisabled: disabledDatePicker,
                        },
                      }}
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
                    <FieldSelect
                        label={'Customer Name'}
                        name={'customer_id'}
                        required={'customer id required'}
                        placeholder="Select customer"
                        options={customerOptions}
                        onValueChange={(value) => {
                            setCustomerId(Number(value));
                        }}
                    />
                    <FieldDisplay
                        label="Customer Code"
                        value={
                            customerCodeOptions?.find(item => Number(item.value) === customer_id)?.label || 'N/A'
                        }
                    />
                    <FieldSelect
                        key={`contact_${contactManager}_${contactOptions.length}`}
                        label={'Contact'}
                        name={'customer_contact_manager_id'}
                        required={'Contact required'}
                        placeholder="Select Contact"
                        options={contactOptions}
                        defaultValue={contactManager.toString()}
                        onValueChange={(value) => {
                            setContactManager(Number(value));
                        }}
                    />              
                    <FieldDisplay
                        key={`contact_address_${contactManager}`}
                        label="Address"
                        value={fullContactAddress}
                        isHtml={true}
                        style={{ backgroundColor: '#fff' }}
                    />
                    <FieldSelect
                        key={`shipping_address_${shippingAddress}_${contactOptions.length}`}
                        label={'Shipping Contact'}
                        name={'customer_shipping_address_id'}
                        required={'Shipping contact required'}
                        placeholder="Shipping Contact"
                        options={shippingOptions}
                        defaultValue={shippingAddress.toString()}
                        onValueChange={(value) => {
                            setShippingAddress(Number(value));
                        }}
                    />
                    <FieldDisplay
                        key={`shipping_address_${contactManager}`}
                        label="Shipping Address"
                        value={fullVendorAddress}
                        isHtml={true}
                        style={{ backgroundColor: '#fff' }}
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
                    <FieldSelect
                        label={'Fob'}
                        name={'fob_id'}
                        required={'Fob is required'}
                        placeholder="Select fob"
                        options={fobOptions}
                    />
                    <FieldSelect
                        label={'Currency'}
                        name={'currency_id'}
                        required={'currency is required'}
                        placeholder="Select currency"
                        options={currencyOptions}
                    />
                    <FieldSelect
                        label={'Payment Mode'}
                        name={'payment_mode_id'}
                        required={'payment mode required'}
                        placeholder="Select payment mode"
                        options={paymentModeOptions}
                    />
                    <FieldSelect
                        label={'Payment Terms'}
                        name={'payment_terms_id'}
                        required={'payment terms required'}
                        placeholder="Select payment terms"
                        options={paymentTermsOptions}
                    />
                </Stack>
              <HStack justify={'space-between'} mt={3}>
                <Text fontSize="md" fontWeight="700">
                  Items
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
                        import.meta.env.VITE_PR_SAMPLE_PARTNUMBERS_CSV
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
                    Upload PartNumbers
                  </Button>
                </HStack>
              </HStack>

              <LoadingOverlay isLoading={loading}>
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
                        <Th color={'white'}>S.No.</Th>
                        <Th color={'white'}>Part Number</Th>
                        <Th color={'white'}>Description</Th>
                        <Th color={'white'}>Condition</Th>
                        <Th color={'white'}>Quantity</Th>
                        <Th color={'white'}>UOM</Th>
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
                            <Text fontSize={'medium'}>{index + 1}.</Text>
                          </Td>
                          <Td>
                            <Stack direction={{ base: 'column', md: 'row' }}>
                              <PartNumberButtons
                                partNumber={
                                  fields[`part_number_${row.id}`]?.value
                                }
                              />
                              <FieldSelect
                                key={`part_number_${row.id}_${partNumKey}`}
                                name={`part_number_${row.id}`}
                                size={'sm'}
                                menuPortalTarget={document.body}
                                required={'Part Number is required'}
                                defaultValue={
                                  row.part_number_id
                                    ? row?.part_number_id.toString()
                                    : ''
                                }
                                options={[
                                  ...(spareOptions ?? []),
                                  {
                                    value: 'add_new',
                                    label: (
                                      <Text
                                        color={'brand.500'}
                                        textDecoration={'underline'}
                                      >
                                        + Add New PN
                                      </Text>
                                    ),
                                  },
                                ]}
                                isClearable={true}
                                onValueChange={(value) => {
                                  if (value) {
                                    if (value === 'add_new') {
                                      openSpareCreateModal(
                                        `part_number_${row.id}`
                                      );
                                    } else {
                                      getDescriptionForRow(
                                        Number(value),
                                        row.id
                                      );
                                    }
                                  }
                                  setChangedRIndex(null);
                                  setChangedRIndex(index);
                                  handleInputChange(
                                    'part_number_id',
                                    value,
                                    index
                                  );
                                }}
                                selectProps={{
                                  noOptionsMessage: () => 'No parts found',
                                  isLoading:
                                    changedRIndex === index && spareLoading,
                                  onInputChange: (event: any) => {
                                    setTimeout(() => {
                                      setPartNumber(event);
                                    }, 1000);
                                    setSpareSearchLoading(true);
                                    setChangedRIndex(index);
                                  },
                                }}
                                style={{
                                  width: 'auto',
                                  minWidth: 160,
                                  maxWidth: 'auto',
                                }}
                              />
                            </Stack>
                          </Td>
                          <Td>
                            <FieldInput
                              name={`description_${row.id}`}
                              size={'sm'}
                              isDisabled
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              key={condition_id_key}
                              name={`condition_${row.id}`}
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
                              required={'Condition is required'}
                              defaultValue={
                                row.condition_id
                                  ? row.condition_id?.toString()
                                  : ''
                              }
                              onValueChange={(value) => {
                                if (value === 'add_new') {
                                  openConditionCreateModal(
                                    `condition_${row.id}`
                                  );
                                }
                                handleInputChange('condition_id', value, index);
                              }}
                              style={{
                                width: 'auto',
                                minWidth: 120,
                                maxWidth: 'auto',
                              }}
                              maxLength={3}
                            />
                          </Td>
                          <Td>
                            <FieldInput
                              name={`quantity_${row.id}`}
                              size={'sm'}
                              required={'Quantity is required'}
                              type={row.disabled ? 'integer' : 'decimal'}
                              defaultValue={row.qty ? row.qty : ''}
                              width={'100px'}
                              onValueChange={(value) => {
                                handleInputChange('qty', value, index);
                              }}
                              isDisabled={
                                fields[`part_number_${row.id}`]?.value
                                  ? false
                                  : true
                              }
                              maxLength={9}
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              name={`uom_${row.id}`}
                              size={'sm'}
                              menuPortalTarget={document.body}
                              options={row.options}
                              required={'UOM is required'}
                              defaultValue={
                                row.unit_of_measure_id
                                  ? row.unit_of_measure_id?.toString()
                                  : ''
                              }
                              isDisabled={row.disabled}
                              style={{
                                width: 'auto',
                                minWidth: 120,
                                maxWidth: 'auto',
                              }}
                              onValueChange={(value) => {
                                handleInputChange(
                                  'unit_of_measure_id',
                                  value,
                                  index
                                );
                              }}
                            />
                          </Td>
                          <Tooltip
                            label={
                              fields && fields[`remarks_${row.id}`]
                                ? fields[`remarks_${row.id}`].value
                                : ''
                            }
                            aria-label="Username tooltip"
                            placement="top"
                            hasArrow
                            color="white"
                            isDisabled={
                              fields &&
                              fields[`remarks_${row.id}`] &&
                              fields[`remarks_${row.id}`].value &&
                              fields[`remarks_${row.id}`].value.length > 20
                                ? false
                                : true
                            }
                          >
                            <Td>
                              <FieldInput
                                name={`remarks_${row.id}`}
                                size={'sm'}
                                defaultValue={row.remark ? row.remark : ''}
                                maxLength={60}
                              />
                            </Td>
                          </Tooltip>
                          <Td isNumeric>
                            {index === rows.length - 1 && (
                              <IconButton
                                aria-label="Add Row"
                                variant="@primary"
                                size={'sm'}
                                icon={<HiOutlinePlus />}
                                onClick={addNewRow}
                                mr={2}
                              />
                            )}

                            <IconButton
                              aria-label="View Popup"
                              colorScheme="green"
                              size={'sm'}
                              icon={<HiEye />}
                              mr={2}
                              display={'none'}
                              isDisabled={
                                !fields[`part_number_${row.id}`]?.value
                                  ? true
                                  : false
                              }
                              onClick={() => {
                                console.log(
                                  fields[`part_number_${row.id}`]?.value
                                );
                                setPartNumberId(
                                  fields[`part_number_${row.id}`]?.value
                                );
                                handleOpenModal(row.id);
                              }}
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

              <HStack mt={3}>
                <Text marginEnd={3}>
                  Total Qty:
                  <Text as="span" marginStart={3} fontWeight={'bold'}>
                    {rows
                      .map((row) => fields[`quantity_${row.id}`]?.value ?? 0)
                      .reduce((acc, curr) => Number(acc) + Number(curr), 0)}
                  </Text>
                </Text>

                <Text marginStart={3}>
                  Total Line Items:
                  <Text as="span" marginStart={3} fontWeight={'bold'}>
                    {
                      rows.filter(
                        (row) => fields[`part_number_${row.id}`]?.value
                      ).length
                    }
                  </Text>
                </Text>
              </HStack>

              <Stack>
                <FormControl>
                  <FormLabel>Remarks</FormLabel>
                  <FieldHTMLEditor
                    onValueChange={handleRemarksChange}
                    maxLength={import.meta.env.VITE_ELABORATE_REMARKS_LENGTH}
                    placeHolder={'Enter Remarks Here'}
                  />
                </FormControl>
              </Stack>
            </Stack>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify={'center'}
              alignItems={'center'}
              display={'flex'}
              mt={4}
            >
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={createSel.isLoading}
              >
                Submit
              </Button>

              <Tooltip
                label="Please fill form to preview"
                placement="top"
                hasArrow
                isDisabled={form.isValid}
              >
                <Button
                  onClick={() => handleOpenPreview()}
                  colorScheme="green"
                //   isDisabled={!form.isValid}
                  isDisabled={true}
                >
                  Preview
                </Button>
              </Tooltip>
            </Stack>
          </Formiz>

          <ConditionCreateModal
            isOpen={isCNAddOpen}
            onClose={handleCloseConditionModal}
          />

          <SpareCreateModal
            isOpen={isNewSpareModalOpen}
            onClose={handleCloseSpareModal}
          />

          <ModalPopup
            isOpen={isModalOpen}
            data={popupData}
            onClose={() => {
              setPartNumberId(null);
              handleCloseModal();
            }}
            partNumber={partNumberId}
            options={popupOptions}
          ></ModalPopup>

          <PreviewPopup
            isOpen={isPreviewModalOpen}
            onClose={handleCloseModal}
            data={previewData}
          ></PreviewPopup>

          <ConfirmationPopup
            isOpen={openConfirmation}
            onClose={handleClose}
            onConfirm={handleConfirm}
            headerText="Upload File"
            bodyText="Are you sure you want to upload this file?"
          />

          <PRCSVUploadModal
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
