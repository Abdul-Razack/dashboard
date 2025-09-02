import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
import dayjs from 'dayjs';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft, HiEye, HiOutlinePlus } from 'react-icons/hi';
import { UseQueryResult, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FieldDayPicker } from '@/components/FieldDayPicker';
import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { LoaderFull } from '@/components/LoaderFull';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ModalPopup } from '@/components/Popups/PurchaseRequest';
import PreviewPopup from '@/components/PreviewContents/Purchase/MaterialRequest';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { convertToOptions , formatDate, getPropertyList, transformToSelectOptions } from '@/helpers/commonHelper';
import {
  usePRDetails,
  useUpdatePR,
} from '@/services/purchase/purchase-request/services';
import { useSearchPartNumber } from '@/services/spare/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { usePriorityList, fetchPriorityInfo } from '@/services/submaster/priority/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';
import { getAPICall } from '@/services/apiService';
import { FindByPartNumberIdPayload } from '@/services/apiService/Schema/PRSchema';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

type Item = {
  condition_id?: number;
  id: number;
  purchase_request_id?: number;
  qty?: number;
  remark?: string;
  part_number_id?: number;
  unit_of_measure_id?: number;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};
const MaterialRequestEdit = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [queryParams, setQueryParams] = useState({});
  const [rows, setRows] = useState<Item[]>([]);
  const rowIdCounter = useRef(1);
  const [partNumber, setPartNumber] = useState('');
  const [disabledDatePicker, setDisabledDatePicker] = useState<boolean>(true);
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [previewData, setPreviewData] = useState<any>([]);
  const [popupData, setPopupData] = useState<any>({});
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data: details, isSuccess } = usePRDetails(Number(id));
  const [partNumberId, setPartNumberId] = useState<any>(null);
  const [popupOptions, setPopupOptions] = useState<TODO>({});
  const [existingPartNos, setExistingPartNos] = useState<string>('');

  const getPriorityDetails = fetchPriorityInfo();

  useEffect(() => {
    if (isSuccess && details?.data?.items) {
      let existing_ids: any = getPropertyList(
        details?.data?.items,
        'part_number_id'
      );
      setExistingPartNos(existing_ids.replace(/ /g, ''));
      const initialRows = details?.data?.items.map((item) => ({
        ...item,
        remark: item.remark ?? '',
        id: item.id, // Assuming `id` is unique and provided by your API
      }));
      setRows(initialRows);

      // Update rowIdCounter to a value beyond any existing IDs to avoid conflicts
      const highestId = Math.max(0, ...initialRows.map((row) => row.id));
      rowIdCounter.current = highestId + 1;
    }
  }, [isSuccess, details]);

  const setPartNumberDebounced = useRef(
    debounce((value: string) => {
      setPartNumber(value), 500;
    })
  ).current;

  const addNewRow = () => {
    const newRow: Item = {
      id: rowIdCounter.current /* any other default properties */,
    };
    setRows((currentRows) => [...currentRows, newRow]);
    rowIdCounter.current += 1; // Ensure the next id is unique
  };

  const deleteRow = (rowId: number) => {
    setRows((currentRows) => currentRows.filter((row) => row.id !== rowId));
  };

  useEffect(() => {
    if (partNumber) {
      setQueryParams({ query: partNumber });
    }
  }, [partNumber]);

  useEffect(() => {
    if (existingPartNos) {
      setQueryParams({ exist_ids: existingPartNos });
    }
  }, [existingPartNos]);

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
    console.log(popupVariables);
    setIsPreviewModalOpen(true);
  };

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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setIsPreviewModalOpen(false);
  };

  const priorityList: UseQueryResult<QueryData, unknown> = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);

  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);

  const unitOfMeasureList = useUnitOfMeasureIndex();
  const listData = useSearchPartNumber(queryParams);
  const sparelistData = listData.data?.part_numbers;

  const spareOptions = sparelistData?.map((spare) => ({
    value: spare.id.toString(),
    label: spare.part_number,
  }));

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  const allApiDataLoaded = useMemo(
    () =>
      priorityList.isSuccess &&
      conditionList.isSuccess &&
      unitOfMeasureList.isSuccess &&
      listData.isSuccess &&
      isSuccess,
    [
      priorityList.isSuccess,
      conditionList.isSuccess,
      unitOfMeasureList.isSuccess,
      listData.isSuccess,
      isSuccess,
    ]
  );

  // Helper function for date formatting
  

  const updatePR = useUpdatePR({
    onSuccess: ({ message }) => {
      toastSuccess({
        title: 'Material Request updated',
        description: message,
      });
      queryClient.invalidateQueries(['prIndex']);
      navigate('/purchase/purchase-request');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to update material request',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      const payload = {
        id: Number(id),
        type: values.pr_type_id,
        priority_id: Number(values.priority_id),
        due_date: formatDate(values.due_date) as string,
        remark: values.remarks,
        items: rows.map((row) => ({
          id: row.id,
          part_number_id:
            values[`part_number_${row.id}`] !== null
              ? Number(values[`part_number_${row.id}`])
              : (details?.data?.items.find((item) => item.id === row.id)
                  ?.part_number_id as number),
          condition_id: Number(values[`condition_${row.id}`]),
          qty: values[`quantity_${row.id}`],
          unit_of_measure_id: Number(values[`uom_${row.id}`]),
          remark: values[`remarks_${row.id}`],
        })),
      };
      // console.log('🚀 ~ MaterialRequestEdit ~ payload:', payload);

      updatePR.mutate(payload);
    },
  });

  const fields = useFormFields({
    connect: form,
  });

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

  const handleRemarksChange = (newValue: any) => {
    form.setValues({ [`remarks`]: newValue ? newValue : '' });
  };
  const getPartNumberInfo = async (part_number_id: number) => {
    try {
      const response = await getAPICall(
        endPoints.find.spare_by_partnumber.replace(':id', part_number_id),
        FindByPartNumberIdPayload,
        {  }
      );
      console.log(response)
      return response?.part_number;
    } catch (err) {
      console.log(err);
    }
  };

  const getDescriptionForRow = useCallback(
    async (id: any) => {
      const selectedPartNumber = fields[`part_number_${id}`]?.value;
      let desc: string = '';
      if (selectedPartNumber) {
        const partInfo = await getPartNumberInfo(selectedPartNumber);
        console.log(partInfo);
        form.setValues({ [`description_${id}`]: partInfo?.description });
        form.setValues({ [`uom_${id}`]:  partInfo?.unit_of_measure_id?.toString() });
        desc = partInfo?.description;
      }
      return desc;
    },
    [fields, sparelistData]
  );

  const [descriptions, setDescriptions] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchDescriptions = async () => {
      const resolvedDescriptions = await Promise.all(
        rows.map((row) => getDescriptionForRow(row.id))
      );
      setDescriptions(resolvedDescriptions);
    };
  
    fetchDescriptions();
  }, [rows, getDescriptionForRow]);

  useEffect(() => {
    if (partNumberId !== null) {
      let obj: TODO = {};
      obj.conditions = conditionOptions;
      obj.uoms = convertToOptions(unitOfMeasureOptions);
      setPopupOptions(obj);
    }
  }, [partNumberId]);

  if (!allApiDataLoaded) {
    return <LoaderFull />;
  }

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
                <BreadcrumbLink as={Link} to={'/purchase/purchase-request'}>
                  Material Request List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Edit Material Request</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Edit Material Request
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
            Material Request
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay isLoading={!allApiDataLoaded}>
              <Stack spacing={2}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'MR Type'}
                    name={'pr_type_id'}
                    required={'MR Type is required'}
                    placeholder="Select MR Type"
                    options={[
                      // { value: 'sel', label: 'SEL' },
                      // { value: 'wo', label: 'WO' },
                      { value: 'stock', label: 'Stock' },
                      { value: 'oe', label: 'Open Enquiry' },
                      { value: 'project', label: 'Project' },
                    ]}
                    defaultValue={
                      details?.data?.type ? details?.data?.type : ''
                    }
                  />

                  <FieldSelect
                    label={'Priority'}
                    name={'priority_id'}
                    required={'Priority is required'}
                    placeholder="Select Priority"
                    options={priorityOptions}
                    onValueChange={(value) => {
                      if (value) {
                        setDuedate(value);
                      }
                    }}
                    defaultValue={
                      details?.data?.priority_id
                        ? details?.data?.priority_id.toString()
                        : ''
                    }
                  />

                  <FieldDayPicker
                    label={'Due Date'}
                    name={'due_date'}
                    placeholder="Select Due Date"
                    required={'Due Date is required'}
                    dayPickerProps={{
                      inputProps: {
                        isDisabled: disabledDatePicker,
                      },
                    }}
                    defaultValue={
                      details?.data?.due_date
                        ? dayjs(details?.data?.due_date)
                        : null
                    }
                  />
                </Stack>

                <TableContainer rounded={'md'} overflow={'auto'} my={4}>
                  <Table variant="striped" size={'sm'}>
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
                        <Tr key={row.id}>
                          <Td>
                            <Text fontSize={'medium'}>{index + 1}.</Text>
                          </Td>
                          <Td>
                            <FieldSelect
                              name={`part_number_${row.id}`}
                              size={'sm'}
                              menuPortalTarget={document.body}
                              required={'Part Number is required'}
                              options={spareOptions ?? []}
                              defaultValue={
                                row.part_number_id
                                  ? row?.part_number_id.toString()
                                  : ''
                              }
                              isClearable={true}
                              selectProps={{
                                noOptionsMessage: () => 'No parts found',
                                isLoading: listData.isLoading,
                                inputValue: partNumber,
                                onInputChange: (inputValue: string) => {
                                  if (inputValue) {
                                    setPartNumber(inputValue);
                                    setPartNumberDebounced(inputValue);
                                  }
                                },
                              }}
                              style={{width: 'auto', minWidth: 160, maxWidth: 'auto'}}
                            />
                          </Td>
                          <Td>
                            <FieldInput
                              name={`description_${row.id}`}
                              size={'sm'}
                              isDisabled
                              defaultValue={descriptions[index] || ''}
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              name={`condition_${row.id}`}
                              size={'sm'}
                              menuPortalTarget={document.body}
                              options={conditionOptions}
                              required={'Condition is required'}
                              defaultValue={
                                row.condition_id
                                  ? row.condition_id?.toString()
                                  : ''
                              }
                            />
                          </Td>
                          <Td>
                            <FieldInput
                              name={`quantity_${row.id}`}
                              size={'sm'}
                              required={'Quantity is required'}
                              type="integer"
                              defaultValue={row.qty ? row.qty : ''}
                              width={'100px'}
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              name={`uom_${row.id}`}
                              size={'sm'}
                              menuPortalTarget={document.body}
                              options={convertToOptions(unitOfMeasureOptions)}
                              required={'UOM is required'}
                              defaultValue={
                                row.unit_of_measure_id
                                  ? row.unit_of_measure_id?.toString()
                                  : ''
                              }
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
                                maxLength={100}
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
                              mr={2}
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

                <Text>
                  Total Qty:
                  {rows
                    .map((row) => fields[`quantity_${row.id}`]?.value ?? 0)
                    .reduce((acc, curr) => Number(acc) + Number(curr), 0)}
                </Text>
                <Stack>
                  <FormControl>
                    <FieldInput
                      name={`remarks`}
                      size={'sm'}
                      sx={{ display: 'none' }}
                      defaultValue={
                        details?.data?.remark ? details?.data?.remark : ''
                      }
                    />
                    <FormLabel>Remarks</FormLabel>
                    <FieldHTMLEditor
                      defaultValue={
                        details?.data?.remark ? details?.data?.remark : ''
                      }
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
                    isLoading={updatePR.isLoading}
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
                      isDisabled={!form.isValid}
                    >
                      Preview
                    </Button>
                  </Tooltip>
                </Stack>
              </Stack>
            </LoadingOverlay>
          </Formiz>

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
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default MaterialRequestEdit;
