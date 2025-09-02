import { useState } from 'react';

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
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { LuDownload, LuPlus, LuUpload } from 'react-icons/lu';
import { UseQueryResult } from 'react-query';
import { useNavigate } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldUpload } from '@/components/FieldUpload';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  checkArraysHasSameValues,
  getValueByLabel,
  handleDownload,
  parseCSV,
  parseCSVHeaders,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { useCreatePrincipleOwnerBluk } from '@/services/master/principleowner/services';
import { useCustomerListCode } from '@/services/master/services';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

export const OwnerPrincipleBulkUpload = () => {
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const csvFields: any = import.meta.env
    .VITE_CUSTOMERS_PRINCIPAL_OF_OWNER_BULK_UPLOAD_CSV_FIELDS
    ? JSON.parse(
        import.meta.env.VITE_CUSTOMERS_PRINCIPAL_OF_OWNER_BULK_UPLOAD_CSV_FIELDS
      )
    : [];
  const [fileKey, setFileKey] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<TODO>(null);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [uploadedRows, setRows] = useState<any[]>([]);

  const handleInputChange = (value: any, field: string, index: number) => {
    const updatedData = [...uploadedRows];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setRows(updatedData);
  };

  const customerForm = useForm({
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
        if (obj.customer_id) {
          obj.customer_id = Number(obj.customer_id);
        }
        payloadItems.push(obj);
      });
      console.log('payloadItems', payloadItems);
      uploadOwner.mutate(payloadItems as any);
    },
  });

  // const fields = useFormFields({
  //   connect: customerForm,
  // });

  const uploadOwner = useCreatePrincipleOwnerBluk({
    onSuccess: ({ created_owners, errors }) => {
      toastSuccess({
        title: 'Uploaded finished successfully',
        description: `No of owner uploaded: ${uploadedRows.length} Successful: ${created_owners?.length} Failed: ${errors?.length}`,
      });
      let payloadVariables = JSON.parse(JSON.stringify(uploadedRows));
      if (created_owners && created_owners.length > 0) {
        const updatedItems = payloadVariables.filter(
          (obj1: any) =>
            !created_owners.some(
              (obj2: any) => obj2?.customer_id === obj1.customer_id
            )
        );
        payloadVariables = updatedItems; // Log the updated rows
        setFileKey((prevKey) => prevKey + 1);
        setRows(updatedItems);
      }
      if (errors && errors.length > 0) {
        setErrorCount(errors.length);
        const updatedArray1 = payloadVariables.map((obj1: any) => {
          const matchingObj = errors.find(
            (obj2: any) => obj2.customer_id === obj1.customer_id
          );
          if (matchingObj) {
            return {
              ...obj1,
              has_error: true,
              error_message: '',
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

  const customerList: UseQueryResult<QueryData, unknown> =
    useCustomerListCode();
  const customerOptions = transformToSelectOptions(customerList.data);

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
      customer_id: '',
      owner: '',
      phone: '',
      email: '',
      id_passport_copy: '',
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
    if (checkArraysHasSameValues(csvFields, parsedHeaders)) {
      const parsedRows: TODO = await parseCSV(uploadedFile);
      if (parsedRows.length <= 100) {
        const updatedRows = parsedRows.map((obj: any) => {
          const {
            customer_id,
            owner,
            phone,
            email,
            id_passport_copy,
            remarks,
            ...rest
          } = obj;
          return {
            ...rest,
            customer_id: customer_id ? (customerOptions.some((item:any) => item.label.toLowerCase() === customer_id.toLowerCase()) ? 
                          getValueByLabel(customer_id, customerOptions) : '') : '',
            owner: owner,
            phone: phone ? `+${phone.replace(/[^\w\s]/gi, '')}` : '',
            email: email ? email.toLowerCase().trimEnd() : '',
            id_passport_copy: id_passport_copy,
            remarks: remarks,
          };
        });
        setRows((currentRows) => [...currentRows, ...updatedRows]);
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
    setOpenConfirmation(false);
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Principal of Owner Bulk Upload
          </Heading>

          <Button
            leftIcon={<LuDownload />}
            colorScheme="blue"
            as="label"
            size={'sm'}
            onClick={() =>
              handleDownload(
                import.meta.env.VITE_CUSTOMERS_PRINCIPLE_OWNERS_CSV
              )
            }
          >
            Download Sample
          </Button>
        </HStack>

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
                  <Text fontSize="sm">Selected File: {uploadedFile?.name}</Text>
                </Box>
              )}
            </Box>
          </HStack>

          <Formiz autoForm connect={customerForm}>
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
                    <Th color="white">
                      Customer{' '}
                      <Tooltip
                        hasArrow
                        placement="top"
                        label={`Mandatory Field`}
                        aria-label={`Mandatory Field`}
                        textTransform={'capitalize'}
                      >
                        <Text
                          as="span"
                          marginLeft={0.5}
                          color={'red.500'}
                          cursor={'pointer'}
                        >
                          ✱
                        </Text>
                      </Tooltip>
                    </Th>
                    <Th color="white">
                      Owner{' '}
                      <Tooltip
                        hasArrow
                        placement="top"
                        label={`Mandatory Field`}
                        aria-label={`Mandatory Field`}
                        textTransform={'capitalize'}
                      >
                        <Text
                          as="span"
                          marginLeft={0.5}
                          color={'red.500'}
                          cursor={'pointer'}
                        >
                          ✱
                        </Text>
                      </Tooltip>
                    </Th>
                    <Th color="white">Phone</Th>
                    <Th color="white">Email</Th>
                    <Th color="white">Passport copy</Th>
                    <Th color="white">Remarks</Th>
                    <Th color="white" isNumeric>
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {uploadedRows &&
                    uploadedRows.length > 0 &&
                    uploadedRows.map((item: any, index: number) => (
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
                          <FieldSelect
                            key={`customer_id_${fileKey}_${index + 1}`}
                            size="sm"
                            name={`customer_id_${index + 1}`}
                            required={'Required'}
                            placeholder="Select Customer"
                            options={customerOptions}
                            width={'140px'}
                            menuPortalTarget={document.body}
                            defaultValue={
                              item.customer_id
                                ? item.customer_id.toString()
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
                              handleInputChange(value, 'customer_id', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`owner_${fileKey}_${index + 1}`}
                            name={`owner_${index + 1}`}
                            placeholder="Owner Name"
                            size="sm"
                            required="Required"
                            maxLength={40}
                            type="alpha-with-space"
                            defaultValue={item.owner ? item.owner : ''}
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'owner', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`phone_${fileKey}_${index + 1}`}
                            name={`phone_${index + 1}`}
                            placeholder="Phone"
                            size="sm"
                            type="phone-number"
                            maxLength={15}
                            defaultValue={item.phone ? item.phone : ''}
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'phone', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`email_${fileKey}_${index + 1}`}
                            name={`email_${index + 1}`}
                            placeholder="Email"
                            size="sm"
                            type="email"
                            maxLength={100}
                            defaultValue={item.email ? item.email : ''}
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'email', index)
                            }
                            onKeyDown={(e) => {
                              if (e.key === ' ') {
                                e.preventDefault();
                              }
                            }}
                            validations={[
                              {
                                handler: isEmail(),
                                message: 'Invalid email',
                              },
                            ]}
                            required={
                              item.email !== '' ? 'Email is required' : ''
                            }
                          />
                        </Td>
                        <Td>
                          <FieldUpload
                            key={`id_passport_copy_${fileKey}_${index + 1}`}
                            name={`id_passport_copy_${index + 1}`}
                            placeholder="Passport Copy"
                            size="sm"
                            defaultValue={
                              item.id_passport_copy ? item.id_passport_copy : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(
                                value,
                                'id_passport_copy',
                                index
                              )
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`remarks_${fileKey}_${index + 1}`}
                            name={`remarks_${index + 1}`}
                            placeholder="Remarks"
                            size="sm"
                            maxLength={100}
                            defaultValue={item.remarks ? item.remarks : ''}
                            minWidth="150px"
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
                    ))}
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
                disabled={uploadOwner.isLoading}
                onClick={() => navigate('/customer-master')}
              >
                Go to Master
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={uploadOwner.isLoading}
                isDisabled={uploadedRows.length === 0 || uploadOwner.isLoading}
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
      </Stack>
    </SlideIn>
  );
};

export default OwnerPrincipleBulkUpload;
