import { useEffect, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
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
import { format } from 'date-fns';
import dayjs from 'dayjs';
import { HiArrowNarrowLeft, HiEye, HiOutlinePlus } from 'react-icons/hi';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldDayPicker } from '@/components/FieldDayPicker';
import FieldDisplay from '@/components/FieldDisplay';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import PreviewPopup from '@/components/PreviewContents/Logistics/LRFQ';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastSuccess } from '@/components/Toast';
import {
  calculateVolumetricWeight,
  convertToOptions,
  filterUOMoptions,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import ContactManagerCreateModal from '@/pages/Master/ContactManager/ContactManagerCreateModal';
import CustomerCreateModal from '@/pages/Master/Customer/CustomerCreateModal';
import { getAPICall, postAPICall } from '@/services/apiService';
import { CustomerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import {
  ContactManagerInfoSchema,
  CustomerGroupListSchema,
} from '@/services/apiService/Schema/CustomerSchema';
import {
  CreateResponsePayload,
  LRFQBody,
  PayloadSchema,
} from '@/services/apiService/Schema/LRFQSchema';
import {
  InfoPayload,
  ListPayload,
} from '@/services/apiService/Schema/LRSchema';
import { OptionsListPayload } from '@/services/apiService/Schema/OptionsSchema';
import {
  useCustomerList, // useCustomerSupplierList,
} from '@/services/master/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useCustomerGroupList } from '@/services/submaster/customer-group/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import {
  fetchPriorityInfo,
  usePriorityList,
} from '@/services/submaster/priority/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

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
  customer_id?: any;
  contact_manager_id?: number;
  options: any;
  vendor_code?: string;
  resetKey?: number;
}

type QueryData = {
  status: boolean;
  items?: Record<string, string | number>;
};

const LRFQCreate = () => {
  const [rows, setRows] = useState<Row[]>([
    { id: 1, selectedContact: null, options: [], resetKey: 0 },
  ]);
  const rowIdCounter = useRef(1);
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
  const toastSuccess = useToastSuccess();
  const navigate = useNavigate();

  const conditionList = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList?.data);
  const customerList = useCustomerList({
    type: 'freight',
  });

  const [errorStatus, setHideErrors] = useState(false);
  const customerOptions = transformToSelectOptions(customerList.data);
  const shipViaList = useShipViaList();
  const shipViaOptions = transformToSelectOptions(shipViaList.data);
  const packageTypeList = usePackageTypeList();
  const packageTypeOptions = transformToSelectOptions(packageTypeList.data);
  const uomList = useUnitOfMeasureIndex();
  const [relatedLROptions, setRelatedLROptions] = useState<any>([]);
  const [tableItems, setTableItems] = useState<any>([]);
  const [packageItems, setPackageItems] = useState<any>([]);
  const [lrid, setLRID] = useState<number | null>(null);
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [activeLRInfo, setActiveLRInfo] = useState<any | null>(null);
  const [prOptions, setPROptions] = useState<any>([]);
  const [previewData, setPreviewData] = useState<any>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [totalVolumetricWeight, setTotalVolumetricWeight] = useState<number>(0);
  const [totalPackages, setTotalPackages] = useState<number>(0);
  const [totalPcs, setTotalPcs] = useState<number>(0);
  const [isDG, setIsDG] = useState<boolean>(false);
  const [disabledDatePicker, setDisabledDatePicker] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [items, setItems] = useState<any>({});
  const [selectedItems, setSelectedItems] = useState<TODO>([]);
  const [contactLoading, setContactLoading] = useState<boolean>(false);
  const [activeRow, setActiveRow] = useState<any>(0);
  const [vendorGroup, setVendorGroup] = useState<any>(0);
  const [resetKey, setResetKey] = useState(0);
  const goodsTypes = [
    { value: 'true', label: 'DG' },
    { value: 'false', label: 'Non-DG' },
  ];

  const lrTypes = [
    // { value: 'so', label: 'SO' },
    { value: 'po', label: 'PO' },
    // { value: 'wo', label: 'WO' },
    // { value: 'open', label: 'Open' },
  ];

  const getPriorityDetails = fetchPriorityInfo();
  const [relatedLRIds, setRelatedLRIds] = useState<number[]>([]);
  const customerGroupList: UseQueryResult<QueryData, unknown> =
    useCustomerGroupList();
  const customerGroupOptions = transformToSelectOptions(customerGroupList.data);

  const filterOptions = (row: number) => {
    const filteredRowIds = selectedItems.filter(
      (item: any) => item.row !== row
    );
    const filteredRows = filteredRowIds
      .map((item: any) => item.value)
      .filter((value: any) => value != null);

    const filteredOptions = customerOptions.filter(
      (item: any) => !filteredRows.map(Number).includes(Number(item.value))
    );

    return filteredOptions;
  };

  const getGroupCustomerList = async () => {
    try {
      const data = await getAPICall(
        endPoints.others.customer_group_customers,
        CustomerGroupListSchema,
        { group_id: vendorGroup, customer_type: 'suppliers' }
      );

      setLoading(false);
      assignRows(data?.data);
      setVendorGroup(0);
      setResetKey((prevKey) => prevKey + 1);
      form.setValues({ customer_group_id: '' });
    } catch (err) {
      console.log(err);
    }
  };

  const handleCloseCMModal = (status: boolean, id: any) => {
    if (status) {
      if (rows[activeRow]) {
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
    }
  };

  const handleCloseCustomerModal = (status?: boolean, id?: any) => {
    console.log(status, id)
    if (status) {
      customerList.refetch();
      setTimeout(() => {
        form.setValues({ [`vendor_name_${rows[activeRow].id}`]: id.toString() });
        getCustomerInfo(Number(id) ?? 0, activeRow);
        setRows((prevRows) => {
          const newRows = [...prevRows];
          newRows[activeRow] = {
            ...newRows[activeRow],
            customer_id: id,
            selectedContact: null,
            vendor_code: '',
          };
          return newRows;
        });
      }, 2000);
    } else {
      setTimeout(() => {
        form.setValues({ [`vendor_name_${rows[activeRow].id}`]: '' });
      }, 1000);
    }
    onVendorAddClose();
    setVendorSelectKey((prevKey) => prevKey + 1);
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

  const getCustomerInfo = async (customerId: any, index: number) => {
    try {
      const response = await getAPICall(
        endPoints.info.customer.replace(':id', customerId),
        CustomerInfoSchema,
        { include_default_shipping: true }
      );
      setRows((prevRows) => {
        const newRows = [...prevRows];
        newRows[index] = {
          ...newRows[index],
          vendor_code: response?.data?.code,
        };
        return newRows;
      });
      //setLoading(false);
    } catch (err) {
      //setLoading(false);
      console.log(err);
    }
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
          newRows[index] = {
            ...newRows[index],
            options: Options,
            resetKey: (newRows[index].resetKey || 0) + 1,
          };
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
          resetKey: (newRows[index].resetKey || 0) + 1,
        };
        return newRows;
      });
    }
  };

  useEffect(() => {
    const result = rows.map((item) => {
      return {
        row: item.id,
        value: item.customer_id || null, // If customer_id doesn't exist, set it to null
      };
    });

    setSelectedItems(result);
  }, [rows]);

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
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const setDuedate = async (priority: any) => {
    let daysToAdd: number = 0;
    const priorityInfo = await getPriorityDetails(Number(priority));

    if (priorityInfo?.item) {
      daysToAdd = priorityInfo?.item?.days || 0;
      if (daysToAdd === 0) {
        setDisabledDatePicker(false);
        form.setValues({ [`due_date`]: '' });
      } else {
        setDisabledDatePicker(true);
        form.setValues({
          [`due_date`]: dayjs().add(daysToAdd, 'day'),
        });
      }
    }
  };

  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const shipTypeList = useShipTypesList();
  const shipTypeOptions = transformToSelectOptions(shipTypeList.data);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);

  const unitOfMeasureList = useUnitOfMeasureIndex();

  const deleteUnmatched = () => {
    const existingKeys = Object.keys(items);
    const newArray = existingKeys.filter(
      (item: any) => item !== lrid?.toString()
    );
    newArray.forEach((item: any) => {
      let updatedItems: any = items;
      delete updatedItems[item];
      console.log(updatedItems);
      setItems((prevData: any) => {
        const { item, ...updatedItems } = prevData;
        return updatedItems;
      });
    });
  };

  useEffect(() => {
    console.log(relatedLRIds);
    if (Object.keys(items).length > 0) {
      relatedLRIds.forEach((item: number) => {
        if (!items.hasOwnProperty(item)) {
          getLRInfo(item);
        }
      });
    }
    if (relatedLRIds.length + 1 < Object.keys(items).length) {
      deleteUnmatched();
    }
  }, [relatedLRIds]);

  useEffect(() => {
    console.log(items);
    let packages: any = [];
    let tableItems: any = [];
    let totalPKGs: number = 0;
    let totalPieces: number = 0;
    Object.keys(items).forEach(function (key) {
      const currentObj = { ...items[key] };
      const objPackages = currentObj.packages || [];
      const objItems = currentObj.items || [];

      // Accumulate totals
      totalPKGs += currentObj.packages.length || 0;
      totalPieces += currentObj.pcs || 0;

      // Collect packages and items
      packages = [...packages, ...objPackages];
      tableItems = [...tableItems, ...objItems];
    });

    // Set all states ONCE after calculations are complete
    setTotalPackages(totalPKGs);
    setTotalPcs(totalPieces);
    setPackageItems(packages);
    setTableItems(tableItems);

    form.setValues({
      [`no_of_package`]: totalPKGs,
      [`no_of_pcs`]: totalPieces,
    });
  }, [items]);

  useEffect(() => {
    if (packageItems.length > 0) {
      let volumetric_weight: number = 0;
      let is_dg: boolean = false;
      packageItems.forEach((item: any) => {
        volumetric_weight += Number(item.volumetric_weight);
        if (item.is_dg === true) {
          is_dg = true;
        }
      });
      setIsDG(is_dg);
      setTotalVolumetricWeight(volumetric_weight);
    }
  }, [packageItems]);

  const handleSelectContact = async (contactId: number, index: number) => {
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
    let popupVariables: any = {};
    popupVariables.lrInfo = activeLRInfo;
    popupVariables.packageItems = packageItems;
    popupVariables.packageTypeOptions = packageTypeOptions;
    popupVariables.conditionOptions = conditionOptions;
    popupVariables.customerOptions = customerOptions;
    popupVariables.packageTypeList = packageTypeList;
    popupVariables.priorityOptions = priorityOptions;
    popupVariables.shipTypeOptions = shipTypeOptions;
    popupVariables.shipViaOptions = shipViaOptions;
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    popupVariables.uomItems = unitOfMeasureOptions;
    popupVariables.goodsTypes = goodsTypes;
    popupVariables.lrTypes = lrTypes;
    popupVariables.uomList = unitOfMeasureList;
    popupVariables.rows = rows;
    popupVariables.forVendor = forVendor;
    popupVariables.rowId = rowId;
    popupVariables.tableItems = tableItems;
    Object.keys(fields).forEach(function (key) {
      popupVariables[key] = fields[key].value;
    });
    setPreviewData(popupVariables);
    console.log(popupVariables);
    setIsPreviewModalOpen(true);
  };

  const handleConfirm = () => {
    setLoading(true);
    getGroupCustomerList();
    setOpenConfirmation(false);
  };

  const handleClose = () => {
    setOpenConfirmation(false);
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  const createLRFQ = async (payload: any) => {
    try {
      const data = await postAPICall(
        endPoints.create.lrfq,
        payload,
        PayloadSchema,
        CreateResponsePayload
      );
      toastSuccess({
        title: `LRFQ created successfully - ${data?.id}`,
        description: `${data?.message}`,
      });
      navigate('/logistics/lrfq');
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const form = useForm({
    onValidSubmit: (values) => {
      setLoading(true);
      let lr_customers: any = [];
      console.log(rows);
      rows.forEach((item: any) => {
        let obj: any = {};
        obj.customer_id = item.selectedContact.customer_id;
        obj.customer_contact_manager_id = item.selectedContact.id;
        obj.logistic_request_id = lrid;
        lr_customers.push(obj);
      });

      const payload: LRFQBody = {
        priority_id: Number(values.priority_id),
        ship_type_id: Number(values.ship_type_id),
        ship_via_id: Number(values.ship_via_id),
        is_dg: isDG,
        due_date: format(new Date(values.due_date), 'yyyy-MM-dd'),
        no_of_package: packageItems.length,
        volumetric_weight: totalVolumetricWeight,
        remark: values.remarks ? values.remarks : '',
        lr_customers: lr_customers,
      };
      setLoading(true);

      createLRFQ(payload);
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

  useEffect(() => {
    if (uomList.data?.items) {
      setUOMOptions(uomList.data?.items);
    }
  }, [uomList]);

  useEffect(() => {}, [tableItems]);

  const getLRList = async () => {
    try {
      const data = await getAPICall(
        endPoints.list.logistic_request,
        ListPayload
      );
      if (data.items) {
        setPROptions(transformToSelectOptions(data));
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const getLRInfo = async (id: any) => {
    try {
      const data = await getAPICall(
        endPoints.info.logistic_request.replace(':id', id),
        InfoPayload
      );
      setActiveLRInfo(data.data);
      const key: any = id;
      setItems((prevItems: any) => ({
        ...prevItems,
        [key]: data.data,
      }));
      setLoading(false);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const getRelatedLRs = async () => {
    try {
      const data = await getAPICall(
        endPoints.others.logistic_request_related_by_id,
        ListPayload,
        { logistic_request_id: lrid }
      );
      if (data.items) {
        setRelatedLROptions(transformToSelectOptions(data));
      }
      getLRInfo(lrid);
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getLRList();
  }, []);

  useEffect(() => {
    if (lrid) {
      setRelatedLROptions([]);
      setLoading(true);
      getRelatedLRs();
    }
  }, [lrid]);

  useEffect(() => {
    if (activeLRInfo) {
      let goods_type = 'non_dg';
      if (activeLRInfo?.is_dg === true) {
        goods_type = 'dg';
      }
      setDuedate(activeLRInfo?.priority_id);
      setTotalPackages(
        activeLRInfo?.packages ? activeLRInfo?.packages.length : 0
      );
      setTotalPcs(activeLRInfo?.pcs);
      form.setValues({
        [`lr_date`]: dayjs(activeLRInfo?.ref_date),
        [`priority_id`]: activeLRInfo?.priority_id.toString(),
        [`lr_type`]: activeLRInfo?.type.toString(),
        [`ship_type_id`]: activeLRInfo?.ship_type_id.toString(),
        [`ship_via_id`]: activeLRInfo?.ship_via_id.toString(),
        [`volumetric_weight`]: activeLRInfo?.volumetric_weight,
        [`customer_id`]: activeLRInfo?.customer_id,
        [`receiver_customer_id`]: activeLRInfo?.receiver_customer_id.toString(),
        [`receiver_shipping_address_id`]:
          activeLRInfo?.receiver_shipping_address_id,
        [`customer_shipping_address_id`]:
          activeLRInfo?.customer_shipping_address_id,
        [`goods_type`]: goods_type,
      });
    }
  }, [activeLRInfo]);

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
                  Logistics RFQ
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Create Logistics RFQ</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Create Logistics RFQ
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
        <LoadingOverlay isLoading={loading}>
          <Stack
            spacing={2}
            p={4}
            bg={'white'}
            borderRadius={'md'}
            boxShadow={'md'}
          >
            <Text fontSize={'md'} fontWeight={'700'}>
              Logistics RFQ
            </Text>

            <Formiz autoForm connect={form}>
              <Stack
                spacing={8}
                direction={{ base: 'column', md: 'row' }}
                bg={'gray.100'}
                p={4}
                rounded={'md'}
                border={'1px solid'}
                borderColor={'gray.300'}
                mb={2}
              >
                <FieldSelect
                  size="sm"
                  label={'Logistic Request'}
                  name={'purchase_request_ids'}
                  required={'Logistic Request is required'}
                  options={prOptions ?? []}
                  selectProps={{
                    noOptionsMessage: () => 'No LR found',
                  }}
                  onValueChange={(value) => {
                    setItems({});
                    setLRID(Number(value));
                  }}
                  showError={errorStatus}
                />

                <FieldSelect
                  label="Related LR's"
                  name="related_ref_no"
                  options={relatedLROptions}
                  size={'sm'}
                  isMulti
                  isDisabled={activeLRInfo === null}
                  className={activeLRInfo === null ? 'disabled-input' : ''}
                  onValueChange={(value) => {
                    setRelatedLRIds(value ? value.map(Number) : []);
                  }}
                />
                <FieldDayPicker
                  size="sm"
                  label={'LR Date'}
                  name={'lr_date'}
                  placeholder="Select LR Date"
                  required={'LR Date is required'}
                  // disabledDays={{ before: new Date() }}
                  dayPickerProps={{
                    inputProps: {
                      isDisabled: activeLRInfo === null ? true : false,
                    },
                  }}
                  showError={errorStatus}
                />
                <FieldSelect
                  size="sm"
                  label="LR Type"
                  name="lr_type"
                  options={lrTypes}
                  isDisabled={relatedLRIds.length === 0 ? true : false}
                  className="disabled-input"
                />
                <FieldSelect
                  size="sm"
                  label={'Priority'}
                  name={'priority_id'}
                  placeholder="Select Priority"
                  options={priorityOptions}
                  onValueChange={(value) => {
                    setDuedate(value);
                  }}
                  isDisabled={relatedLRIds.length === 0 ? true : false}
                  className="disabled-input"
                />
                <FieldDayPicker
                  size="sm"
                  label={'Need By Date'}
                  name={'due_date'}
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
                <FieldInput
                  size="sm"
                  label="No of Packs"
                  name="no_of_package"
                  defaultValue={totalPackages}
                  type="number"
                  isDisabled={relatedLRIds.length === 0 ? true : false}
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
                mb={2}
              >
                <FieldInput
                  size="sm"
                  label="No of Pcs"
                  name="no_of_pcs"
                  type="number"
                  defaultValue={totalPcs}
                  isDisabled={relatedLRIds.length === 0 ? true : false}
                />
                <FieldSelect
                  size="sm"
                  label="Ship Type"
                  name="ship_type_id"
                  options={shipTypeOptions}
                  isDisabled={relatedLRIds.length === 0 ? true : false}
                  className="disabled-input"
                />
                <FieldSelect
                  size="sm"
                  label="Ship Via"
                  name="ship_via_id"
                  options={shipViaOptions}
                  isDisabled={relatedLRIds.length === 0 ? true : false}
                  className="disabled-input"
                />
                <FieldSelect
                  size="sm"
                  label="Goods Type"
                  name="goods_type"
                  options={[
                    { value: 'dg', label: 'DG' },
                    { value: 'non_dg', label: 'Non-DG' },
                  ]}
                  isDisabled={relatedLRIds.length === 0 ? true : false}
                  className="disabled-input"
                />
                <FieldInput
                  size="sm"
                  label="Volumetric Wt"
                  name="volumetric_weight"
                  type="number"
                  required="Volumetric Wt is required"
                  defaultValue={totalVolumetricWeight.toFixed(2)}
                  isReadOnly
                  rightElement={<Text>KG</Text>}
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
                mb={2}
              >
                <FieldDisplay
                  label="Consignor/Shipper"
                  value={
                    activeLRInfo ? activeLRInfo?.customer?.business_name : 'N/A'
                  }
                  size={'sm'}
                  style={{ backgroundColor: '#f4f6ed' }}
                />
                <FieldDisplay
                  label="Consignor/Shipper Address"
                  value={
                    activeLRInfo
                      ? activeLRInfo?.customer_shipping_address?.address
                      : 'N/A'
                  }
                  size={'sm'}
                  style={{ backgroundColor: '#f4f6ed' }}
                />
                <FieldDisplay
                  label="Consignee/Receiver"
                  value={
                    activeLRInfo
                      ? activeLRInfo?.receiver_customer?.business_name
                      : 'N/A'
                  }
                  size={'sm'}
                  style={{ backgroundColor: '#f4f6ed' }}
                />
                <FieldDisplay
                  label="Consignee/Receiver Address"
                  value={
                    activeLRInfo
                      ? activeLRInfo?.receiver_shipping_address?.address
                      : 'N/A'
                  }
                  size={'sm'}
                  style={{ backgroundColor: '#f4f6ed' }}
                />
              </Stack>

              <Stack spacing={2}>
                {packageItems.length > 0 && (
                  <TableContainer rounded={'md'} overflow={'auto'} mt={2}>
                    <HStack justify={'space-between'} mb={2}>
                      <Text fontSize="md" fontWeight="700">
                        Packages
                      </Text>
                    </HStack>
                    <Table colorScheme="cyan" variant="striped" size={'sm'}>
                      <Thead bg={'gray'}>
                        <Tr>
                          <Th color={'white'}>Line Item</Th>
                          <Th color={'white'}>Package Type</Th>
                          <Th color={'white'}>PKG NO</Th>
                          <Th color={'white'}>Description</Th>
                          <Th color={'white'}>Goods Type</Th>
                          <Th color={'white'}>Weight</Th>
                          <Th color={'white'} sx={{ minWidth: '130px' }}>
                            UOM
                          </Th>
                          <Th color={'white'}>Length</Th>
                          <Th color={'white'}>Width</Th>
                          <Th color={'white'}>Height</Th>
                          <Th color={'white'} sx={{ minWidth: '130px' }}>
                            UOM
                          </Th>
                          <Th color={'white'} sx={{ minWidth: '10`0px' }}>
                            Pcs
                          </Th>
                          <Th color={'white'}>Volumetric Wt</Th>
                          <Th color={'white'}>Add Part Details</Th>
                          {/* <Th color={'white'}>View</Th> */}
                        </Tr>
                      </Thead>
                      <Tbody>
                        {packageItems.map((row: any, index: number) => (
                          <Tr key={index}>
                            <Td>{index + 1}</Td>
                            <Td>
                              <FieldSelect
                                key={`package_type_id_${row.id}`}
                                name={`package_type_id_${row.id}`}
                                options={packageTypeOptions}
                                size={'sm'}
                                menuPortalTarget={document.body}
                                defaultValue={
                                  row ? row.package_type_id.toString() : ''
                                }
                                isReadOnly={true}
                                onValueChange={() => {
                                  setRows([...rows]);
                                }}
                                className="disabled-input"
                              />
                            </Td>
                            <Td>
                              <Text>{row ? row?.package_number : ''}</Text>
                            </Td>
                            <Td>
                              <FieldInput
                                key={`description_${row.id}`}
                                name={`description_${row.id}`}
                                size={'sm'}
                                defaultValue={row ? row?.description : ''}
                                isReadOnly={true}
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                name={'is_dg'}
                                options={[
                                  { value: 'true', label: 'DG' },
                                  { value: 'false', label: 'Non-DG' },
                                ]}
                                size={'sm'}
                                menuPortalTarget={document.body}
                                defaultValue={
                                  row
                                    ? row?.is_dg === true
                                      ? 'true'
                                      : 'false'
                                    : ''
                                }
                                isReadOnly={true}
                                className="disabled-input"
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`weight_${row.id}`}
                                name={`weight_${row.id}`}
                                type="number"
                                size="sm"
                                defaultValue={row ? row?.weight : ''}
                                isReadOnly={true}
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                key={`weight_unit_of_measurement_id_${row.id}`}
                                name={`weight_unit_of_measurement_id_${row.id}`}
                                options={filterUOMoptions(
                                  unitOfMeasureOptions,
                                  1
                                )}
                                size={'sm'}
                                menuPortalTarget={document.body}
                                defaultValue={
                                  row
                                    ? row.weight_unit_of_measurement_id.toString()
                                    : ''
                                }
                                isReadOnly={true}
                                className="disabled-input"
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`length_${row.id}`}
                                name={`length_${row.id}`}
                                type="number"
                                size="sm"
                                defaultValue={row ? row?.length : ''}
                                isReadOnly={true}
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`width_${row.id}`}
                                name={`width_${row.id}`}
                                type="number"
                                size="sm"
                                defaultValue={row ? row?.width : ''}
                                isReadOnly={true}
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`height_${row.id}`}
                                name={`height_${row.id}`}
                                type="number"
                                size="sm"
                                defaultValue={row ? row?.height : ''}
                                isReadOnly={true}
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                key={`unit_of_measurement_id_${row.id}`}
                                name={`unit_of_measurement_id_${row.id}`}
                                options={filterUOMoptions(
                                  unitOfMeasureOptions,
                                  2
                                )}
                                size={'sm'}
                                menuPortalTarget={document.body}
                                defaultValue={
                                  row
                                    ? row.unit_of_measurement_id.toString()
                                    : ''
                                }
                                isReadOnly={true}
                                className="disabled-input"
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`pcs_${row.id}`}
                                name={`pcs_${row.id}`}
                                type="number"
                                size="sm"
                                defaultValue={row ? row.pcs : ''}
                                isReadOnly={true}
                                width={'60px'}
                              />
                            </Td>
                            <Td>
                              <Input
                                key={`volumetric_weight_${row.id}`}
                                value={calculateVolumetricWeight(
                                  parseFloat(row.length),
                                  parseFloat(row.width),
                                  parseFloat(row.height),
                                  row.unit_of_measurement_id,
                                  unitOfMeasureOptions
                                )}
                                size="sm"
                                isReadOnly
                              />
                            </Td>
                            <Td>
                              <Text>
                                {row
                                  ? row.is_obtained === true
                                    ? 'Obtained'
                                    : 'Not Obtained'
                                  : ''}
                              </Text>
                            </Td>
                            {/* <Td>
                                  <IconButton
                                    aria-label="View tab"
                                    colorScheme="blue"
                                    size={'sm'}
                                    icon={<HiEye />}
                                  />
                                </Td> */}
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}
              </Stack>

              {/* <Stack
                spacing={4}
                p={4}
                bg={'white'}
                borderRadius={'md'}
                boxShadow={'md'}
                borderWidth={1}
                borderColor={'gray.200'}
                backgroundColor={'teal.100'}
                className="tableRadius-0"
                mt={4}
              >
                <Stack>
                  <HStack justify={'space-between'}>
                    <Text fontSize="md" fontWeight="700">
                      Obtained Items
                    </Text>
                  </HStack>

                  {tableItems && tableItems.length > 0 && (
                    <TableContainer rounded={'md'} overflow={'auto'}>
                      <Table size={'sm'}>
                        <Thead bg={'gray'}>
                          <Tr
                            sx={{
                              th: {
                                borderColor: 'gray',
                                borderWidth: '1px',
                                borderStyle: 'solid',
                              },
                            }}
                          >
                            <Th color={'white'}>S.no</Th>
                            <Th color={'white'}>Package</Th>
                            <Th color={'white'}>Part No</Th>
                            <Th color={'white'}>Desc</Th>
                            <Th color={'white'}>Condition</Th>
                            <Th color={'white'}>Goods Type</Th>
                            <Th color={'white'}>PO Num</Th>
                            <Th color={'white'}>PO Tot.Qty</Th>
                            <Th color={'white'}>Tot Rec.Qty</Th>
                            <Th color={'white'}>Add.Qty</Th>
                            <Th color={'white'}>LR Qty</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {tableItems.length === 0 && (
                            <Tr>
                              <Td colSpan={14} textAlign="center">
                                No data available
                              </Td>
                            </Tr>
                          )}
                          {tableItems.map(
                            (item: any, index: number) => (
                                <Tr
                                  key={item.id}
                                  sx={{
                                    td: {
                                      borderColor: 'gray',
                                      borderWidth: '1px',
                                      borderStyle: 'solid',
                                    },
                                  }}
                                >
                                  <Td>
                                    {index + 1}
                                  </Td>
                                  <Td>
                                    {getPackageInfo(
                                      item.logistic_request_package_id
                                    )}
                                  </Td>
                                  <PartDetails
                                    partNumber={item.part_number_id}
                                  />
                                  <Td>
                                    {conditionList.data?.items?.[
                                      item.condition_id
                                    ] || 'N/A'}
                                  </Td>
                                  <PartNumberDetails
                                    part_number={item.part_number_id}
                                    type="goods_type"
                                  />
                                  <Td>{item.purchase_order_id}</Td>
                                  <Td>{item.qty}</Td>
                                  <Td>{item.qty}</Td>
                                  <Td>{item.qty}</Td>
                                  <Td>{item.qty}</Td>
                                </Tr>
                              )
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </Stack>
              </Stack> */}

              <Stack spacing={2}>
                <HStack justify={'space-between'} mt={4}>
                  <Text fontSize="lg" fontWeight="700">
                    Suppliers
                  </Text>
                  <HStack spacing={2} align="center" display={'none'}>
                    <FieldSelect
                      name={'customer_group_id'}
                      placeholder="Select Contact Group"
                      options={customerGroupOptions}
                      size={'sm'}
                      key={`customer_group_id_${resetKey}`}
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

                <TableContainer rounded={'md'} overflow={'auto'} my={4}>
                  <Table variant="striped" size={'sm'}>
                    <Thead bg={'gray'}>
                      <Tr>
                        <Th color={'white'}>S.No.</Th>
                        <Th color={'white'} sx={{ maxW: '150px' }}>
                          Vendor Name
                        </Th>
                        <Th color={'white'} sx={{ maxW: '150px' }}>
                          Vendor Code
                        </Th>
                        <Th color={'white'} sx={{ maxW: '150px' }}>
                          Contact
                        </Th>
                        <Th color={'white'} sx={{ minWidth: '150px' }}>
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
                                setActiveRow(index);
                                if (value === 'add_new') {
                                  // Open the modal to add a new vendor
                                  onVendorAddOpen();
                                } else {
                                  if (value === null) {
                                    if (rows[activeRow]) {
                                      form.setValues({
                                        [`contact_${rows[activeRow].id}`]: '',
                                      });
                                    }
                                  } else {
                                    getCustomerInfo(Number(value) ?? 0, index);
                                  }
                                  setRows((prevRows) => {
                                    const newRows = [...prevRows];
                                    newRows[index] = {
                                      ...newRows[index],
                                      customer_id: value,
                                      selectedContact: null,
                                      vendor_code: '',
                                    };
                                    return newRows;
                                  });
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
                              key={`vendor_code-${row.id}-${resetKey}`}
                              type="text"
                              size={'sm'}
                              placeholder="Vendor Code"
                              disabled
                              value={row.vendor_code ?? ' - '}
                            />
                          </Td>
                          <Td sx={{ maxW: '150px' }}>
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
                          </Td>
                          <Td>
                            <Input
                              key={`contactAddress-${row.id}-${resetKey}`}
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
                            <IconButton
                              aria-label="View Popup"
                              colorScheme="green"
                              size={'sm'}
                              icon={<HiEye />}
                              onClick={() => handleOpenPreview(true, index)}
                              mr={2}
                              isDisabled={
                                !fields[`vendor_name_${row.id}`]?.value
                              }
                            />
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

                            {rows.length > 1 && (
                              <IconButton
                                aria-label="Delete Row"
                                colorScheme="red"
                                size={'sm'}
                                icon={<DeleteIcon />}
                                onClick={() => deleteRow(row.id)}
                                mr={2}
                              />
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>

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
                    isLoading={loading}
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
              onClose={handleCloseCustomerModal}
              defaultType={'4'}
              isDisabled={true}
            />

            <ContactManagerCreateModal
              isOpen={isCMAddOpen}
              onClose={() => {
                onCMAddClose();
                setContactSelectKey((prevKey) => prevKey + 1);
              }}
              onModalClosed={handleCloseCMModal}
              customer_id={
                rows[activeRow] ? rows[activeRow].customer_id?.toString() : '0'
              }
            />

            <PreviewPopup
              isOpen={isPreviewModalOpen}
              onClose={handleCloseModal}
              data={previewData}
            />

            <ConfirmationPopup
              isOpen={openConfirmation}
              onClose={handleClose}
              onConfirm={handleConfirm}
              headerText="Add Vendors"
              bodyText="Are you sure you want to add the vendors under this group?"
            />
          </Stack>
        </LoadingOverlay>
      </Stack>
    </SlideIn>
  );
};

export default LRFQCreate;
