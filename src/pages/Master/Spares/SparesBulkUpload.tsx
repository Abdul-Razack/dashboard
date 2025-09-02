import { useEffect, useMemo, useState } from 'react';

import { DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
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
  Tr,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { LuDownload, LuPlus, LuUpload } from 'react-icons/lu';
import { UseQueryResult } from 'react-query';
import { useNavigate } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  checkArraysHasSameValues,
  convertToOptions,
  cutString,
  getPropertyList,
  getValueByLabel,
  handleDownload,
  parseCSV,
  parseCSVHeaders,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import {
  checkUploadedPartNumbersExists,
  useBulkSpareUpload,
} from '@/services/spare/services';
import { useHscCodeList } from '@/services/submaster/hsc-code/services';
import {
  useCreateSpareModel,
  useSpareModelList,
} from '@/services/submaster/sparemodel/services';
import {
  useCreateSpareType,
  useSpareTypeList,
} from '@/services/submaster/sparetype/services';
import { useUnIndex } from '@/services/submaster/un/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

export const SparesBulkUpload = () => {
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const booleanOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
  ];
  const [fileKey, setFileKey] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<TODO>(null);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [uploadedRows, setRows] = useState<any[]>([]);
  const unitOfMeasureList = useUnitOfMeasureIndex();
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [spareLoading, setSpareSearchLoading] = useState<boolean>(false);
  const [changedRIndex, setChangedRIndex] = useState<number | null>(null);
  const [changedUnRIndex, setChangedUnRIndex] = useState<number | null>(null);
  const [resetKey, setResetKey] = useState(0);
  const csvFields: any = import.meta.env.VITE_SPARES_BULK_UPLOAD_CSV_FIELDS
    ? JSON.parse(import.meta.env.VITE_SPARES_BULK_UPLOAD_CSV_FIELDS)
    : [];
  const handleInputChange = (value: any, field: string, index: number) => {
    const updatedData = [...uploadedRows];

    const updatedRow = {
      ...updatedData[index],
      [field]: value,
    };

    if (field === 'is_dg') {
      updatedRow.un_id = '';
    }
    updatedData[index] = updatedRow;
    setRows(updatedData);
  };

  const sparesForm = useForm({
    onValidSubmit: () => {
      let payloadItems: any = [];
      const payloadVariables = JSON.parse(JSON.stringify(uploadedRows));
      payloadVariables.map((obj: any) => {
        Object.keys(obj).forEach((key) => {
          if (typeof obj[key] === 'string') {
            if (obj[key].toLowerCase() === 'true') {
              obj[key] = true;
            } else if (obj[key].toLowerCase() === 'false') {
              obj[key] = false;
            }
          }
        });

        if (obj.has_error !== undefined) {
          delete obj.has_error;
        }
        if (obj.error_message !== undefined) {
          delete obj.error_message;
        }
        payloadItems.push(obj);
      });
      uploadSpares.mutate(payloadItems as any);
    },
  });

  // const fields = useFormFields({
  //   connect: sparesForm,
  // });

  const createSpareType = useCreateSpareType({
    onSuccess: ({ message }) => {
      spareTypeList.refetch();
      toastSuccess({
        title: 'Spare Type created',
        description: message,
      });
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create spare type',
        description: error.response?.data.message,
      });
    },
  });

  const handleSpareTypeCreate = (inputValue: string) => {
    const length = inputValue.length;
    if (length > 10) {
      toastError({
        title: 'Failed to create spare type',
        description: 'Character limit is 10',
      });
      return;
    }
    createSpareType.mutate({ name: inputValue });
  };

  const createSpareModel = useCreateSpareModel({
    onSuccess: ({ message }) => {
      spareModelList.refetch();
      toastSuccess({
        title: 'Spare Model created',
        description: message,
      });
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create spare model',
        description: error.response?.data.message,
      });
    },
  });

  const handleSpareModelCreate = (inputValue: string) => {
    const length = inputValue.length;
    if (length > 10) {
      toastError({
        title: 'Failed to create spare model',
        description: 'Character limit is 10',
      });
      return;
    }
    createSpareModel.mutate({ name: inputValue });
  };

  const checkIsPartNumberExists = checkUploadedPartNumbersExists({
    onSuccess: ({ data }) => {
      console.log(data);

      if (data) {
        const updatedSpareParts = uploadedRows.map((part) => {
          const partExists = data[part.part_number as keyof typeof data];
          console.log(partExists);
          return {
            ...part,
            ...(partExists
              ? {
                  has_error: true,
                  error_message: 'Part Number Already exists',
                }
              : {}),
          };
        });
        setRows(updatedSpareParts);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const uploadSpares = useBulkSpareUpload({
    onSuccess: ({ created_part_numbers, errors }) => {
      toastSuccess({
        title: 'Uploaded finished successfully',
        description: `No of spares uploaded: ${uploadedRows.length} Successful: ${created_part_numbers?.length} Failed: ${errors?.length}`,
      });
      let payloadVariables = JSON.parse(JSON.stringify(uploadedRows));
      if (created_part_numbers && created_part_numbers.length > 0) {
        const updatedItems = payloadVariables.filter(
          (obj1: any) =>
            !created_part_numbers.some(
              (obj2: any) => obj2?.part_number === obj1.part_number
            )
        );
        payloadVariables = updatedItems; // Log the updated rows
        setFileKey((prevKey) => prevKey + 1);
        setRows(updatedItems);
      }
      if (errors && errors.length > 0) {
        console.log(errors);
        setErrorCount(errors.length);
        const updatedArray1 = payloadVariables.map((obj1: any) => {
          const matchingObj = errors.find(
            (obj2: any) => obj2.part_number === obj1.part_number
          );
          if (matchingObj) {
            return {
              ...obj1,
              has_error: true,
              error_message: matchingObj?.message,
            };
          }
          return obj1;
        });

        payloadVariables = updatedArray1;
        setRows(payloadVariables);
      }
    },
    onError: (error) => {
      console.log(error); // Log any error that occurs during the upload process
    },
  });

  const spareTypeList: UseQueryResult<QueryData, unknown> = useSpareTypeList();
  const spareTypeOptions = transformToSelectOptions(spareTypeList.data);

  const spareModelList: UseQueryResult<QueryData, unknown> =
    useSpareModelList();
  const spareModelOptions = transformToSelectOptions(spareModelList.data);

  // const spareClassList: UseQueryResult<QueryData, unknown> =
  //   useSpareClassList();
  // const spareClassOptions = transformToSelectOptions(spareClassList.data);

  const hscList: UseQueryResult<QueryData, unknown> = useHscCodeList();
  const hscOptions = transformToSelectOptions(hscList.data);
  const unDetails = useUnIndex();

  const unOptions = useMemo(() => {
    return [
      { value: null, label: 'Select UN' },
      ...(unDetails?.data?.items?.map((un: any) => ({
        value: un.id.toString(),
        label: un.name + ' - ' + un.description,
      })) || []),
    ];
  }, [unDetails]);

  const unOptions2 = useMemo(() => {
    return (
      unDetails?.data?.items?.map((un: any) => ({
        value: un.id.toString(),
        label: un.name.toString(),
      })) || []
    );
  }, [unDetails]);

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList?.data]);

  useEffect(() => {
    console.log(uploadedRows);
  }, [uploadedRows]);

  // Handle file drop event
  const handleDrop = (event: any) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setOpenConfirmation(true);
    }
  };

  const addNewRow = () => {
    const newRow = {
      part_number: '',
      description: '',
      cage_code: '',
      manufacturer_name: '',
      hsc_code_id: '',
      unit_of_measure_id: 'ea',
      spare_type_id: '',
      spare_model_id: '',
      // spare_class_id: '',
      is_llp: '',
      is_dg: '',
      is_shelf_life: '',
      is_serialized: '',
      total_shelf_life: '',
      ata: '',
      un_id: '',
      remarks: '',
    };
    setRows([...uploadedRows, newRow]);
  };

  const deleteRow = (index: number) => {
    const updatedItems = [...uploadedRows];
    updatedItems.splice(index, 1);
    setFileKey((prevKey) => prevKey + 1);
    setRows(updatedItems);
  };

  // Handle drag over event
  const handleDragOver = (event: any) => {
    event.preventDefault();
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
    const parsedHeaders: TODO = await parseCSVHeaders(uploadedFile);
    console.log(parsedHeaders)
    if (checkArraysHasSameValues(csvFields, parsedHeaders)) {
      const parsedRows: TODO = await parseCSV(uploadedFile);
      console.log(parsedRows);
      if (parsedRows.length <= 100) {
        const updatedRows = parsedRows.map((obj: any) => {
          const {
            unit_of_measure,
            spare_type,
            spare_model,
            manufacturer_name,
            cage_code,
            is_llp,
            is_dg,
            is_serialized,
            is_shelf_life,
            shelf_days,
            hsc_code,
            un,
            ata,
            ...rest
          } = obj;
          return {
            ...rest,
            unit_of_measure_id: Number(
              getValueByLabel(
                //unit_of_measure,
                'ea',
                convertToOptions(unitOfMeasureOptions)
              )
            ),
            hsc_code_id: Number(getValueByLabel(hsc_code, hscOptions)),
            spare_type_id: Number(
              getValueByLabel(spare_type, spareTypeOptions)
            ),
            spare_model_id: Number(
              getValueByLabel(spare_model, spareModelOptions)
            ),
            // spare_class_id: Number(getValueByLabel(spare_class, spareClassOptions)),
            is_llp: getValueByLabel(
              is_llp ? is_llp?.toLowerCase() : 'no',
              booleanOptions
            ),
            is_dg: getValueByLabel(
              is_dg ? is_dg?.toLowerCase() : 'no',
              booleanOptions
            ),
            is_shelf_life: getValueByLabel(
              is_shelf_life ? is_shelf_life?.toLowerCase() : 'no',
              booleanOptions
            ),
            total_shelf_life: is_shelf_life === 'YES' ? shelf_days : '',
            is_serialized: getValueByLabel(
              is_serialized ? is_serialized?.toLowerCase() : 'no',
              booleanOptions
            ),
            ata: ata ? cutString(ata.toUpperCase(), 15) : '',
            un_id: Number(getValueByLabel(un, unOptions2)),
            manufacturer_name: manufacturer_name ?? '',
            cage_code: cage_code ?? '',
            remarks: '',
          };
        });
        const parts = getPropertyList(updatedRows, 'part_number');
        const partNumbersArray = parts.split(',').map((part) => part.trim());
        setRows((currentRows) => [...currentRows, ...updatedRows]);
        setTimeout(() => {
          checkIsPartNumberExists.mutate({
            part_numbers: partNumbersArray,
          } as any);
        }, 500);
      } else {
        toastError({
          title:
            'Uploaded CSV has more than 100 rows. Please upload with the max of 100 rows.',
        });
      }
    } else {
      toastError({
        title: 'Not a valid CSV file.',
      });
    }

    setOpenConfirmation(false);
  };

  const handleClose = () => {
    setOpenConfirmation(false); // Close the modal on cancel or outside click
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Spares Bulk Upload
          </Heading>

          <Button
            leftIcon={<LuDownload />}
            colorScheme="blue"
            as="label"
            size={'sm'}
            onClick={() =>
              handleDownload(import.meta.env.VITE_SPARES_SAMPLE_CSV)
            }
          >
            Download Sample
          </Button>
        </HStack>
        <LoadingOverlay isLoading={uploadSpares.isLoading}>
          <Box borderRadius={4} overflowX="auto" width="100%">
            <HStack
              bg={'white'}
              justify={'space-between'}
              mb={4}
              p={4}
              borderTopRadius={4}
            >
              <Box
                width="100%"
                margin="auto"
                padding={4}
                border="2px dashed"
                borderColor="gray.300"
                borderRadius="md"
                textAlign="center"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <Text fontSize="lg" mb={4}>
                  Drag & Drop or upload a file here.
                </Text>
                <input
                  type="file"
                  id="file-upload"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                  key={fileKey}
                />
                <label htmlFor="file-upload">
                  <Button
                    leftIcon={<LuUpload />}
                    colorScheme="green"
                    variant="solid"
                    as="label"
                    htmlFor="file-upload"
                    size="sm"
                    mb={4}
                  >
                    Choose File
                  </Button>
                </label>

                {uploadedFile && (
                  <Box mt={2} mb={4}>
                    <Text fontSize="sm">
                      Selected File: {uploadedFile?.name}
                    </Text>
                  </Box>
                )}
              </Box>
            </HStack>

            <Formiz autoForm connect={sparesForm}>
              <HStack justify={'space-between'} mb={1}>
                <HStack ml="auto">
                  <Button
                    leftIcon={<LuPlus />}
                    colorScheme="blue"
                    size={'sm'}
                    onClick={addNewRow}
                  >
                    Add Row
                  </Button>
                </HStack>
              </HStack>
              <TableContainer
                rounded="md"
                border="1px"
                borderColor="gray.500"
                borderRadius="md"
                boxShadow="md"
                maxWidth="100%" // Ensures the container doesn't shrink
              >
                <Table variant="simple" size="sm">
                  <Thead bg="gray.500">
                    <Tr>
                      <Th color="white">#</Th>
                      {errorCount > 0 && <Th color="white">Error Msg</Th>}
                      <Th color="white">Part Number</Th>
                      <Th color="white">Desc.</Th>
                      <Th color="white">Manufacturer</Th>
                      <Th color="white">Cage Code</Th>
                      <Th color="white">LLP</Th>
                      <Th color="white">Is DG</Th>
                      <Th color="white">Shelf Life</Th>
                      <Th color="white">Tot Shelf Life</Th>
                      <Th color="white">Serialized</Th>
                      <Th color="white">Type</Th>
                      <Th color="white">Model</Th>
                      <Th color="white">HSC Code</Th>
                      <Th color="white">ATA</Th>
                      <Th color="white">UN</Th>
                      <Th color="white">Remarks</Th>
                      <Th color="white" isNumeric>
                        Action
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {uploadedRows &&
                      uploadedRows.length > 0 &&
                      uploadedRows.map((item: any, index: number) => {
                        return (
                          <Tr
                            key={index}
                            marginTop={1}
                            marginBottom={1}
                            bg={item?.has_error === true ? 'red.200' : ''}
                          >
                            <Td>{index + 1}</Td>
                            {item.has_error === true && (
                              <Td>
                                <Box
                                  as="span"
                                  animation="blinkingText 1.5s infinite"
                                  fontSize="md"
                                  color="red"
                                  css={{
                                    '@keyframes blinkingText': {
                                      '0%': { opacity: 0 },
                                      '50%': { opacity: 1 },
                                      '100%': { opacity: 0 },
                                    },
                                  }}
                                >
                                  {item.has_error === true
                                    ? item?.error_message
                                    : ''}
                                </Box>
                              </Td>
                            )}
                            <Td>
                              <FieldInput
                                key={`part_number_${fileKey}_${index + 1}`}
                                name={`part_number_${index + 1}`}
                                size="sm"
                                required="Part Number is required"
                                type="alpha-numeric-with-special"
                                defaultValue={
                                  item.part_number ? item.part_number : ''
                                }
                                minWidth="150px"
                                maxWidth="100%"
                                onValueChange={(value) =>
                                  handleInputChange(value, 'part_number', index)
                                }
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`description_${fileKey}_${index + 1}`}
                                name={`description_${index + 1}`}
                                size="sm"
                                required="Description is required"
                                type="string"
                                defaultValue={
                                  item.description ? item.description : ''
                                }
                                onValueChange={(value) =>
                                  handleInputChange(value, 'description', index)
                                }
                                minWidth="200px"
                                maxWidth="100%"
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`manufacturer_name_${fileKey}_${index + 1}`}
                                name={`manufacturer_name_${index + 1}`}
                                size="sm"
                                type="string"
                                defaultValue={
                                  item.manufacturer_name
                                    ? item.manufacturer_name
                                    : ''
                                }
                                onValueChange={(value) =>
                                  handleInputChange(
                                    value,
                                    'manufacturer_name',
                                    index
                                  )
                                }
                                minWidth="200px"
                                maxWidth="100%"
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`cage_code_${fileKey}_${index + 1}`}
                                name={`cage_code_${index + 1}`}
                                size="sm"
                                type="string"
                                defaultValue={
                                  item.cage_code ? item.cage_code : ''
                                }
                                onValueChange={(value) =>
                                  handleInputChange(value, 'cage_code', index)
                                }
                                minWidth="200px"
                                maxWidth="100%"
                              />
                            </Td>
                            {/* <Td>
                            <FieldInput
                              key={`alternate_part_numbers_${fileKey}_${index + 1}`}
                              name={`alternate_part_numbers_${index + 1}`}
                              size="sm"
                              type="string"
                              defaultValue={
                                item.alternate_part_numbers
                                  ? item.alternate_part_numbers
                                  : ''
                              }
                              onValueChange={(value) =>
                                handleInputChange(
                                  value,
                                  'alternate_part_numbers',
                                  index
                                )
                              }
                              minWidth="200px"
                              maxWidth="100%"
                            />
                          </Td> */}
                            {/* <Td>
                            <FieldSelect
                              style={ display:'none' }
                              key={`unit_of_measure_id_${fileKey}_${index + 1}`}
                              name={`unit_of_measure_id_${index + 1}`}
                              size="sm"
                              options={convertToOptions(unitOfMeasureOptions)}
                              placeholder="UOM"
                              defaultValue={
                                item.unit_of_measure_id
                                  ? item.unit_of_measure_id.toString()
                                  : ''
                              }
                              menuPortalTarget={document.body}
                              selectProps={{
                                styles: {
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                },
                              }}
                              onValueChange={(value) =>
                                handleInputChange(
                                  value,
                                  'unit_of_measure_id',
                                  index
                                )
                              }
                              required={'UOM is required'}
                              width={'100px'}
                              isDisabled={true}
                            />
                          </Td> */}
                            <Td>
                              <FieldSelect
                                key={`is_llp_${fileKey}_${index + 1}`}
                                size="sm"
                                name={`is_llp_${index + 1}`}
                                required={'LLP is required'}
                                placeholder="LLP"
                                options={booleanOptions}
                                width={'100px'}
                                menuPortalTarget={document.body}
                                defaultValue={
                                  item.is_llp ? item.is_llp.toString() : ''
                                }
                                selectProps={{
                                  styles: {
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  },
                                }}
                                onValueChange={(value) =>
                                  handleInputChange(value, 'is_llp', index)
                                }
                              />
                            </Td>

                            <Td>
                              <FieldSelect
                                key={`is_dg_${fileKey}_${index + 1}`}
                                size="sm"
                                name={`is_dg_${index + 1}`}
                                required={'DG Status required'}
                                placeholder="DG/Non-DG"
                                options={booleanOptions}
                                width={'100px'}
                                menuPortalTarget={document.body}
                                defaultValue={
                                  item.is_dg ? item.is_dg.toString() : ''
                                }
                                selectProps={{
                                  styles: {
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  },
                                }}
                                onValueChange={(value) => {
                                  console.log(value);
                                  handleInputChange(value, 'is_dg', index);
                                  // handleInputChange('', 'un_id', index);
                                  setResetKey((prevCount) => prevCount + 1);
                                }}
                              />
                            </Td>

                            <Td>
                              <FieldSelect
                                key={`is_shelf_life_${fileKey}_${index + 1}`}
                                size="sm"
                                name={`is_shelf_life_${index + 1}`}
                                required={'Shelf Life is required'}
                                placeholder="Shelf Life"
                                options={booleanOptions}
                                width={'100px'}
                                menuPortalTarget={document.body}
                                defaultValue={
                                  item.is_shelf_life
                                    ? item.is_shelf_life.toString()
                                    : ''
                                }
                                selectProps={{
                                  styles: {
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  },
                                }}
                                onValueChange={(value) =>
                                  handleInputChange(
                                    value,
                                    'is_shelf_life',
                                    index
                                  )
                                }
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`total_shelf_life_${fileKey}_${index + 1}`}
                                name={`total_shelf_life_${index + 1}`}
                                size="sm"
                                type="string"
                                defaultValue={
                                  item.total_shelf_life
                                    ? item.total_shelf_life
                                    : ''
                                }
                                onValueChange={(value) =>
                                  handleInputChange(
                                    value,
                                    'total_shelf_life',
                                    index
                                  )
                                }
                                isDisabled={
                                  !item.is_shelf_life ||
                                  item.is_shelf_life.toString() === 'false'
                                }
                                minWidth="200px"
                                maxWidth="100%"
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                key={`is_serialized_${fileKey}_${index + 1}`}
                                size="sm"
                                name={`is_serialized_${index + 1}`}
                                required={'Serialized status required'}
                                placeholder="Serialized"
                                options={booleanOptions}
                                width={'100px'}
                                menuPortalTarget={document.body}
                                defaultValue={
                                  item.is_serialized
                                    ? item.is_serialized.toString()
                                    : ''
                                }
                                selectProps={{
                                  styles: {
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  },
                                }}
                                onValueChange={(value) =>
                                  handleInputChange(
                                    value,
                                    'is_serialized',
                                    index
                                  )
                                }
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                key={`spare_type_id_${fileKey}_${index + 1}`}
                                size="sm"
                                name={`spare_type_id_${index + 1}`}
                                required={'Type is required'}
                                placeholder="type"
                                options={spareTypeOptions}
                                defaultValue={
                                  item.spare_type_id
                                    ? item.spare_type_id.toString()
                                    : ''
                                }
                                menuPortalTarget={document.body}
                                selectProps={{
                                  type: 'creatable',
                                  isLoading: createSpareType.isLoading,
                                  onCreateOption: handleSpareTypeCreate,
                                  styles: {
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  },
                                }}
                                isDisabled={createSpareType.isLoading}
                                width={'120px'}
                                onValueChange={(value) =>
                                  handleInputChange(
                                    value,
                                    'spare_type_id',
                                    index
                                  )
                                }
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                key={`spare_model_id_${fileKey}_${index + 1}`}
                                size="sm"
                                name={`spare_model_id_${index + 1}`}
                                required={'Model is required'}
                                placeholder="Model"
                                options={spareModelOptions}
                                defaultValue={
                                  item.spare_model_id
                                    ? item.spare_model_id.toString()
                                    : ''
                                }
                                menuPortalTarget={document.body}
                                selectProps={{
                                  type: 'creatable',
                                  isLoading: createSpareModel.isLoading,
                                  onCreateOption: handleSpareModelCreate,
                                  styles: {
                                    menuPortal: (base) => ({
                                      ...base,
                                      zIndex: 9999,
                                    }),
                                  },
                                }}
                                isDisabled={createSpareModel.isLoading}
                                width={'120px'}
                                onValueChange={(value) =>
                                  handleInputChange(
                                    value,
                                    'spare_model_id',
                                    index
                                  )
                                }
                              />
                            </Td>
                            <Td>
                              <FieldSelect
                                key={`hsc_code_id_${fileKey}_${index + 1}`}
                                name={`hsc_code_id_${index + 1}`}
                                menuPortalTarget={document.body}
                                size="sm"
                                required="HSC Code is required"
                                defaultValue={
                                  item.hsc_code_id
                                    ? item.hsc_code_id.toString()
                                    : ''
                                }
                                options={[...(hscOptions ?? [])]}
                                isClearable
                                onValueChange={(value) => {
                                  setChangedRIndex(null);
                                  setChangedRIndex(index);
                                  handleInputChange(
                                    value,
                                    'hsc_code_id',
                                    index
                                  );
                                }}
                                selectProps={{
                                  noOptionsMessage: () => 'No HSC Code found',
                                  isLoading:
                                    changedRIndex === index && spareLoading,
                                  onInputChange: () => {
                                    setSpareSearchLoading(true);
                                    setTimeout(() => {
                                      setSpareSearchLoading(false);
                                    }, 500);
                                    setChangedRIndex(index);
                                  },
                                }}
                                width={'130px'}
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`ata_${fileKey}_${index + 1}`}
                                name={`ata_${index + 1}`}
                                size="sm"
                                type={'all-capital'}
                                defaultValue={item.ata ? item.ata : ''}
                                minWidth="100px"
                                maxWidth="100%"
                                onValueChange={(value) =>
                                  handleInputChange(value, 'ata', index)
                                }
                                maxLength={12}
                              />
                            </Td>
                            <Td display={'flex'} gap={'1rem'}>
                              {/* <FieldInput
                              key={`un_${fileKey}_${index + 1}`}
                              name={`un_${index + 1}`}
                              size="sm"
                              type="string"
                              defaultValue={item.un ? item.un : ''}
                              minWidth="100px"
                              maxWidth="100%"
                              onValueChange={(value) =>
                                handleInputChange(value, 'un', index)
                              }
                            /> */}
                              <FieldSelect
                                isDisabled={
                                  item.is_dg === 'true' ? false : true
                                }
                                key={`un_id_${fileKey}_${resetKey}_${index + 1}`}
                                name={`un_id_${index + 1}`}
                                size="sm"
                                menuPortalTarget={document.body}
                                required={
                                  item.is_dg === 'true' ? 'UN is required' : ''
                                }
                                defaultValue={
                                  item.un_id ? item.un_id.toString() : ''
                                }
                                options={unOptions}
                                isClearable
                                onValueChange={(value) => {
                                  setChangedUnRIndex(null);
                                  setChangedUnRIndex(index);
                                  handleInputChange(value, 'un_id', index);
                                }}
                                selectProps={{
                                  noOptionsMessage: () => 'No UN found',
                                  isLoading:
                                    changedUnRIndex === index && spareLoading,
                                  onInputChange: () => {
                                    setSpareSearchLoading(true);
                                    setTimeout(() => {
                                      setSpareSearchLoading(false);
                                    }, 500);
                                    setChangedUnRIndex(index);
                                  },
                                }}
                                width={'150px'}
                              />
                            </Td>
                            <Td>
                              <FieldInput
                                key={`remarks_${fileKey}_${index + 1}`}
                                name={`remarks_${index + 1}`}
                                size="sm"
                                type="string"
                                defaultValue={item.remarks ? item.remarks : ''}
                                minWidth="200px"
                                maxWidth="100%"
                                onValueChange={(value) =>
                                  handleInputChange(value, 'remarks', index)
                                }
                              />
                            </Td>
                            <Td isNumeric>
                              <IconButton
                                aria-label="Delete Row"
                                colorScheme="red"
                                size="sm"
                                icon={<DeleteIcon />}
                                onClick={() => deleteRow(index)}
                                isDisabled={uploadedRows.length < 2}
                              />
                            </Td>
                          </Tr>
                        );
                      })}
                    {uploadedRows && uploadedRows.length === 0 && (
                      <Tr>
                        <Td colSpan={18} textAlign="center" bg={'white'}>
                          No records
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </TableContainer>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify="center"
                alignItems="center"
                display="flex"
                mt={4}
              >
                <Button
                  type="button"
                  colorScheme="red"
                  disabled={uploadSpares.isLoading}
                  onClick={() => navigate('/spares-master')}
                >
                  Go to Master
                </Button>
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={uploadSpares.isLoading}
                  isDisabled={
                    uploadedRows.length === 0 || uploadSpares.isLoading
                  }
                >
                  Submit
                </Button>
              </Stack>
            </Formiz>

            <ConfirmationPopup
              isOpen={openConfirmation}
              onClose={handleClose}
              onConfirm={handleConfirm}
              headerText="Upload File"
              bodyText="Are you sure you want to upload this file?"
            />
          </Box>
        </LoadingOverlay>
      </Stack>
    </SlideIn>
  );
};

export default SparesBulkUpload;
