import { useEffect, useRef, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
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
import { format } from 'date-fns';
import dayjs from 'dayjs';
import {
  HiArrowNarrowLeft,
  HiEye,
  HiOutlinePlus,
  HiTrash,
} from 'react-icons/hi';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FieldDayPicker } from '@/components/FieldDayPicker';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PreviewPopup } from '@/components/PreviewContents/Purchase/PRFQ';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { convertToOptions, transformToSelectOptions } from '@/helpers/commonHelper';
import ContactManagerCreateModal from '@/pages/Master/ContactManager/ContactManagerCreateModal';
import CustomerCreateModal from '@/pages/Master/Customer/CustomerCreateModal';
import ConditionCreateModal from '@/pages/Submaster/Condition/ConditionCreateModal';
import {
  useContactManagerBulkList,
  useContactManagerIndex,
} from '@/services/master/contactmanager/services';
import { useCustomerSupplierList } from '@/services/master/services';
import {
  useCombinePRItems,
  useUpdateRFQ,
} from '@/services/purchase/prfq/services';
import { usePRFQDetails } from '@/services/purchase/prfq/services';
import { usePRList } from '@/services/purchase/purchase-request/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import {
  fetchPriorityInfo,
  usePriorityList,
} from '@/services/submaster/priority/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

import PartDetailText from '../Quotation/PartDetailText';
import MRDetails from './MRDetails';

type QueryData = {
  status: boolean;
  items?: Record<string, string | number>;
};

interface CombinedItem {
  condition_id: number;
  part_number?: string;
  part_number_id: number;
  qty: number;
  remarks?: any;
  remark?: string;
  unit_of_measure_id: number;
  purchase_request_ids?: any;
  purchase_request_item_id?: any;
}

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
  customer_id?: number | null;
}

const PRFQEdit = () => {
  let { id } = useParams();
  const [rows, setRows] = useState<Row[]>([{ id: 1, selectedContact: null }]);
  const rowIdCounter = useRef(1);
  const [combinedItems, setCombinedItems] = useState<CombinedItem[]>([]);
  const [contactManagerQParams, setContactManagerQParams] = useState({
    search: { customer_id: 0 },
    rowIndex: 0,
  });

  const [bulkcontactManagerQParams, setBulkContactManagerQParams] = useState({
    customer_ids: '',
  });

  const [contactManagers, setContactManagers] = useState<Record<number, any[]>>(
    {}
  );
  const [vendorSelectKey, setVendorSelectKey] = useState(0);
  const [contactSelectKey, setContactSelectKey] = useState(0);
  const [changedRowIndex, setChangedRowIndex] = useState(0);
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
  const toastError = useToastError();
  const navigate = useNavigate();

  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>([]);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [request_ids, setRequestIDs] = useState<any>([]);
  const [formattedIds, setFormattedIds] = useState<any>([]);
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [rfqDetails, setrfqDetails] = useState<any>({});

  const {
    isOpen: isCNAddOpen,
    onOpen: onCNAddOpen,
    onClose: onCNAddClose,
  } = useDisclosure();

  const addNewRow = () => {
    rowIdCounter.current = rows.length + 1;
    const newRow = {
      id: rowIdCounter.current,
      selectedContact: null,
    };
    console.log(rows, newRow);
    setRows([...rows, newRow]);
  };

  const deleteRow = (rowId: number) => {
    setRows(rows.filter((row) => row.id !== rowId));
  };

  const { data: details, isSuccess } = usePRFQDetails(Number(id));

  const prList: UseQueryResult<QueryData, unknown> = usePRList();
  const prOptions = transformToSelectOptions(prList.data);

  const priorityList: UseQueryResult<QueryData, unknown> = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);

  const customerListSupplier = useCustomerSupplierList({
    type: 'suppliers',
  });
  const customerOptions = customerListSupplier.data?.data.map((customer) => ({
    value: customer.id,
    label: customer.business_name,
  }));

  const unitOfMeasureList = useUnitOfMeasureIndex();
  const contactManagerList = useContactManagerIndex(contactManagerQParams);
  const bulkcontactManagerList = useContactManagerBulkList(
    bulkcontactManagerQParams
  );

  const [disabledDatePicker, setDisabledDatePicker] = useState<boolean>(true);
  const getPriorityDetails = fetchPriorityInfo();
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

  useEffect(() => {
    if (bulkcontactManagerList.data) {
      setContactManagers(bulkcontactManagerList.data.items);
    }
  }, [bulkcontactManagerList.data]);

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  useEffect(() => {
    if (contactManagerList.data && contactManagerList.data.data.length > 0) {
      setContactManagers((prev: any) => ({
        ...prev,
        [contactManagerList.data.data[0].customer_id]:
          contactManagerList.data.data,
      }));
    }
  }, [contactManagerList.data]);

  const handleSelectContact = (contactId: number, rowId: number) => {
    const vendorId = fields[`vendor_name_${rowId}`]?.value;
    const contact =
      contactManagers[vendorId]?.find((c) => c.id === contactId) || null;

    setRows((prevRows: any) =>
      prevRows.map((row: { id: number }) =>
        row.id === rowId ? { ...row, selectedContact: contact } : row
      )
    );
  };

  useEffect(() => {
    if (isSuccess && details && details.data) {
      setrfqDetails(details.data);
    }
  }, [isSuccess, details]);

  useEffect(() => {
    if (Object.keys(rfqDetails).length > 0) {
      console.log(rfqDetails);
      let items: any = rfqDetails.items;
      let customers: any = rfqDetails.customers;
      items.forEach((item: any) => {
        item.purchase_request_ids = rfqDetails.purchase_requests?.map(
          (item: any) => item.id
        );
        item.remarks = item.remark;
      });

      setCombinedItems(items);
      let newRows: any = [];
      let customerIDs: any = [];
      customers.forEach((customer: any, index: number) => {
        customerIDs.push(customer.customer_id);
        form.setValues({
          [`vendor_name_${Number(index) + 1}`]: customer.customer_id,
        });
        let obj = {
          id: Number(index + 1),
          selectedContact: null,
          customer_id: customer.customer_id,
        };
        newRows.push(obj);
      });

      setRows(newRows);
      let stringArray = Array.from(
        rfqDetails.purchase_requests?.map((item: any) => item.id),
        (num: any) => num.toString()
      );
      setRequestIDs(stringArray);

      setBulkContactManagerQParams({
        customer_ids: customerIDs ? customerIDs.toString() : '',
      });
      setDuedate(rfqDetails.priority_id);
      form.setValues({
        [`purchase_request_ids`]: stringArray,
        [`priority_id`]: rfqDetails.priority_id.toString(),
        [`need_by_date`]: dayjs(rfqDetails.need_by_date),
      });
      handleRemarksChange(rfqDetails.remarks);
    }
  }, [rfqDetails]);

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
    popupVariables.prfq_id = id;
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
    setIsPreviewModalOpen(true);
    console.log(popupVariables);
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  const combineItems = useCombinePRItems({
    onSuccess: (data) => {
      setCombinedItems(data.combined_items);
    },
    onError: (error) => {
      toastError({ title: 'Error', description: error.message });
    },
  });

  const updatePRFQ = useUpdateRFQ({
    onSuccess: ({ id, message }) => {
      setLoading(false);
      toastSuccess({
        title: 'PRFQ Update successfully - ' + id,
        description: message,
      });
      navigate('/purchase/prfq');
    },
    onError: (error) => {
      setLoading(false);
      toastError({
        title: 'Failed to create PRFQ',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      setLoading(true);
      const payload = {
        id: Number(id),
        priority_id: Number(values.priority_id),
        need_by_date: format(new Date(values.need_by_date), 'yyyy-MM-dd'),
        remarks: values.remarks,
        purchase_request_ids: values.purchase_request_ids.map((id: string) =>
          Number(id)
        ),
        items: combinedItems.map((item) => ({
          part_number_id: item.part_number_id,
          condition_id: item.condition_id,
          unit_of_measure_id: item.unit_of_measure_id,
          qty: item.qty,
          remark: item.remark ?? '',
          purchase_request_item_id: item.condition_id,
        })),
        customers: rows.map((row) => ({
          customer_id: Number(values[`vendor_name_${row.id}`]),
          customer_contact_manager_id: Number(values[`contact_${row.id}`]),
        })),
      };
      updatePRFQ.mutate(payload);
    },
  });

  const fields = useFormFields({
    connect: form,
  });

  useEffect(() => {
    if (request_ids.length > 0) {
      let formattedIds = request_ids
        ? request_ids?.map((id: string) => Number(id))
        : '';
      setFormattedIds(formattedIds);
    }
  }, [request_ids]);

  useEffect(() => {
    if (formattedIds) {
      const formattedIdsJson = JSON.stringify(formattedIds);
      const idsArray = JSON.parse(formattedIdsJson);
      if (idsArray.length > 0) {
        combineItems.mutate({ ids: idsArray });
      }
    }
  }, [formattedIds ? JSON.stringify(formattedIds) : '', combineItems.mutate]);

  useEffect(() => {
    setChangedRowIndex(contactManagerQParams.rowIndex);
  }, [contactManagerQParams]);

  useEffect(() => {
    const lastAddedCustomerId = Object.keys(contactManagers).pop();
    if (lastAddedCustomerId) {
      const newContact = contactManagers[lastAddedCustomerId as any][0];
      setRows((prevRows) =>
        prevRows.map((row, index) =>
          index === changedRowIndex
            ? { ...row, selectedContact: newContact }
            : row
        )
      );
      if (rows[changedRowIndex].id) {
        form.setValues({
          [`contact_${rows[changedRowIndex].id}`]: newContact.id,
        });
      }
    }
  }, [contactManagers, changedRowIndex, form]);

  useEffect(() => {
    setRows((prevRows) =>
      prevRows.map((row) => {
        const vendorId = fields[`vendor_name_${row.id}`]?.value;
        const contacts = contactManagers[vendorId as number];
        const selectedContact = contacts?.[0] || null;

        // Set the default value for the contact field
        if (selectedContact) {
          form.setValues({
            [`contact_${row.id}`]: selectedContact.id,
          });
          // form.setFieldValue(`contact_${row.id}`, selectedContact.id);
        }

        return {
          ...row,
          selectedContact,
        };
      })
    );
  }, [contactManagers, fields, form]);

  // const handleCloseCustomerModal = (status?: boolean, id?: any) => {
  //   console.log(status, id)
  //   if (status) {
  //     customerListSupplier.refetch();
  //     setTimeout(() => {
  //       form.setValues({ [`contact_${rows[activeRow].id}`]: id.toString() });
  //     }, 2000);
  //   } else {
  //     setTimeout(() => {
  //       form.setValues({ [`contact_${rows[activeRow].id}`]: '' });
  //     }, 1000);
  //   }
  //   onVendorAddClose();
  //   setVendorSelectKey((prevKey) => prevKey + 1);
  // };
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
                <BreadcrumbLink>Edit Purchase RFQ</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Edit Purchase RFQ
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
          <LoadingOverlay isLoading={!isSuccess || loading}>
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
                    <FieldSelect
                      label={'Material Request'}
                      name={'purchase_request_ids'}
                      required={'Material Request is required'}
                      options={prOptions ?? []}
                      isClearable={true}
                      isMulti={true}
                      selectProps={{
                        noOptionsMessage: () => 'No PR found',
                        isLoading: prList.isLoading,
                      }}
                    />

                    <FieldSelect
                      label={'Priority'}
                      name={'priority_id'}
                      required={'Priority is required'}
                      placeholder="Select Priority"
                      options={priorityOptions}
                      onValueChange={(value) => {
                        setDuedate(value);
                      }}
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
                        {request_ids &&
                          request_ids.length > 0 &&
                          request_ids.map((item: any, index: number) => (
                            <Tr key={index}>
                              <Td>{item}</Td>
                              <Td>
                                <Text>
                                  <MRDetails
                                    mrId={item}
                                    field={'due_date'}
                                    options={[]}
                                  />
                                </Text>
                              </Td>
                              <Td>
                                <Text>
                                  <MRDetails
                                    mrId={item}
                                    field={'priority_id'}
                                    options={priorityOptions}
                                  />
                                </Text>
                              </Td>
                            </Tr>
                          ))}

                        {(!request_ids || request_ids.length === 0) && (
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
                          <Th color={'white'}>S.No</Th>
                          <Th color={'white'}>Mat.Req No</Th>
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
                            <Td>{item?.purchase_request_ids.join(', ')}</Td>
                            <Td>
                              <PartDetailText
                                partNumber={item.part_number_id}
                              />
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
                                defaultValue={
                                  item.condition_id?.toString() ?? ''
                                }
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
                                    setIdxIndex(index)
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
                                maxLength={9}
                                defaultValue={item.qty ?? ''}
                                onValueChange={(value) => {
                                  const newItems = combinedItems.map(
                                    (i, iIndex) => {
                                      if (iIndex === index) {
                                        return {
                                          ...i,
                                          qty: Number(value),
                                        };
                                      }
                                      return i;
                                    }
                                  );
                                  setCombinedItems(newItems);
                                }}
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
                                className="disabled-input"
                              />
                            </Td>
                            <Td>{item?.remark ? item?.remark : ''}</Td>
                            <Td>
                              <Input
                                type="text"
                                size={'sm'}
                                maxLength={100}
                                value={item.remark}
                                onChange={(e) => {
                                  const newItems = combinedItems.map(
                                    (i, iIndex) => {
                                      if (iIndex === index) {
                                        return {
                                          ...i,
                                          remark: e.target.value,
                                        };
                                      }
                                      return i;
                                    }
                                  );
                                  setCombinedItems(newItems);
                                }}
                              />
                            </Td>
                            <Td isNumeric>
                              <IconButton
                                aria-label="Delete Row"
                                variant={'@danger'}
                                size={'sm'}
                                icon={<HiTrash />}
                                onClick={() => {
                                  const newItems = combinedItems.filter(
                                    (_i, iIndex) => iIndex !== index
                                  );
                                  setCombinedItems(newItems);
                                }}
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </TableContainer>
                )}

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
                                ...(customerOptions ?? []),
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
                              defaultValue={
                                row?.customer_id ? row?.customer_id : ''
                              }
                              size={'sm'}
                              menuPortalTarget={document.body}
                              isClearable={true}
                              placeholder="Select Vendor"
                              required={'Vendor is required'}
                              onValueChange={(value) => {
                                if (value === 'add_new') {
                                  // Open the modal to add a new vendor
                                  onVendorAddOpen();
                                } else {
                                  // Handle normal vendor selection
                                  setContactManagerQParams({
                                    search: {
                                      customer_id: value ? Number(value) : 0,
                                    },
                                    rowIndex: index,
                                  });
                                }
                              }}
                            />
                          </Td>
                          <Td sx={{ maxW: '150px' }}>
                            <Input
                              type="text"
                              size={'sm'}
                              placeholder="Vendor Code"
                              disabled
                              defaultValue={
                                customerListSupplier &&
                                customerListSupplier.data &&
                                customerListSupplier.data?.data
                                  ? customerListSupplier.data?.data?.find(
                                      (customer) =>
                                        customer.id ===
                                        Number(
                                          fields[`vendor_name_${row.id}`]?.value
                                        )
                                    )?.code
                                  : ''
                              }
                            />
                          </Td>
                          <Td sx={{ maxW: '150px' }}>
                            <FieldSelect
                              key={`contactSelect-${row.id}-${contactSelectKey}`}
                              name={`contact_${row.id}`}
                              required={'Contact is required'}
                              options={[
                                ...(contactManagers[
                                  fields[`vendor_name_${row.id}`]?.value
                                ]?.map((contact) => ({
                                  value: contact.id,
                                  label: contact.attention,
                                })) ?? []),
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
                              defaultValue={
                                row.selectedContact
                                  ? (row.selectedContact?.id as any)
                                  : ''
                              }
                              onValueChange={(value) => {
                                console.log(value);
                                if (value === 'add_new') {
                                  onCMAddOpen();
                                }
                                handleSelectContact(Number(value), row.id);
                              }}
                            />
                          </Td>
                          <Td>
                            <Input
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
                              isDisabled={rows.length <= 1}
                            />
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>

                <Stack>
                  <FormControl>
                    <FieldInput
                      name={`remarks`}
                      size={'sm'}
                      sx={{ display: 'none' }}
                      defaultValue={rfqDetails ? rfqDetails.remarks : ''}
                    />
                    <FormLabel>Remarks</FormLabel>
                    <FieldHTMLEditor
                      defaultValue={rfqDetails ? rfqDetails.remarks : ''}
                      onValueChange={handleRemarksChange}
                      maxLength={import.meta.env.VITE_ELABORATE_REMARKS_LENGTH}
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
                    type="submit"
                    colorScheme="brand"
                    isLoading={updatePRFQ.isLoading}
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
              onClose={() => {
                onVendorAddClose();
                customerListSupplier.refetch();
                setVendorSelectKey((prevKey) => prevKey + 1);
              }}
              // onClose={handleCloseCustomerModal}
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
              // onModalClosed={handleCloseCMModal}
              customer_id={
                fields[`vendor_name_${rows[rows.length - 1].id}`]?.value
              }
            />

            <PreviewPopup
              isOpen={isPreviewModalOpen}
              onClose={handleCloseModal}
              data={previewData}
            />
          </LoadingOverlay>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default PRFQEdit;
