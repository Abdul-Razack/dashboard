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
import { useCreateMasterBankBluk } from '@/services/master/bank/services';
import { useCustomerListCode } from '@/services/master/services';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

export const BankBulkUpload = () => {
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const csvFields: any = import.meta.env
    .VITE_CUSTOMER_BANK_BULK_UPLOAD_CSV_FIELDS
    ? JSON.parse(import.meta.env.VITE_CUSTOMER_BANK_BULK_UPLOAD_CSV_FIELDS)
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

  const customerBankForm = useForm({
    onValidSubmit: () => {
      let payloadItems: any = [];
      const payloadVariables = JSON.parse(JSON.stringify(uploadedRows));

      payloadVariables.forEach((obj: any) => {
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
      uploadBank.mutate(payloadItems as any);
    },
  });

  // const fields = useFormFields({
  //   connect: customerBankForm,
  // });

  const uploadBank = useCreateMasterBankBluk({
    onSuccess: ({ created_banks, errors }) => {
      toastSuccess({
        title: 'Uploaded finished successfully',
        description: `No of customer bank uploaded: ${uploadedRows.length} Successful: ${created_banks?.length} Failed: ${errors?.length}`,
      });
      let payloadVariables = JSON.parse(JSON.stringify(uploadedRows));
      if (created_banks && created_banks.length > 0) {
        const updatedItems = payloadVariables.filter(
          (obj1: any) =>
            !created_banks.some(
              (obj2: any) => obj2?.beneficiary_name === obj1.beneficiary_name
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
            (obj2: any) => obj2.beneficiary_name === obj1.beneficiary_name
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
      beneficiary_name: '',
      bank_name: '',
      bank_address: '',
      bank_branch: '',
      bank_ac_iban_no: '',
      type_of_ac: '',
      bank_swift: '',
      aba_routing_no: '',
      contact_name: '',
      bank_phone: '',
      bank_fax: '',
      bank_mobile: '',
      bank_email: '',
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
            beneficiary_name,
            bank_name,
            bank_address,
            bank_branch,
            bank_ac_iban_no,
            type_of_ac,
            bank_swift,
            aba_routing_no,
            contact_name,
            bank_phone,
            bank_fax,
            bank_mobile,
            bank_email,
            ...rest
          } = obj;
          return {
            ...rest,
            customer_id: customer_id ? (customerOptions.some((item:any) => item.label.toLowerCase() === customer_id.toLowerCase()) ? 
                          getValueByLabel(customer_id, customerOptions) : '') : '',
            beneficiary_name: beneficiary_name,
            bank_name: bank_name,
            bank_address: bank_name,
            bank_branch: bank_branch,
            bank_ac_iban_no: bank_ac_iban_no,
            type_of_ac: type_of_ac,
            bank_swift: bank_swift,
            aba_routing_no: aba_routing_no,
            contact_name: contact_name,
            bank_phone: bank_phone
              ? `+${bank_phone.replace(/[^\w\s]/gi, '')}`
              : '',
            bank_fax: bank_fax ? `+${bank_fax.replace(/[^\w\s]/gi, '')}` : '',
            bank_mobile: bank_mobile
              ? `+${bank_mobile.replace(/[^\w\s]/gi, '')}`
              : '',
            bank_email: bank_email ? bank_email.toLowerCase().trimEnd() : '',
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
            Bank Bulk Upload
          </Heading>

          <Button
            leftIcon={<LuDownload />}
            colorScheme="blue"
            as="label"
            size={'sm'}
            onClick={() =>
              handleDownload(import.meta.env.VITE_CUSTOMERS_BANKS_CSV)
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

          <Formiz autoForm connect={customerBankForm}>
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
                      Type of A/C{' '}
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
                      Beneficiary Name{' '}
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
                      Bank Name{' '}
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
                      Address Line 1{' '}
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
                    <Th color="white">Address Line 2</Th>
                    <Th color="white">
                      Branch Name{' '}
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
                      Contact Name{' '}
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
                      IBAN no{' '}
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
                      Swift Code{' '}
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
                    <Th color="white">ABA Routing No</Th>
                    <Th color="white">Phone No</Th>
                    <Th color="white">Fax</Th>
                    <Th color="white">Mobile</Th>
                    <Th color="white">Email</Th>
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
                            placeholder="Choose customer"
                            options={customerOptions}
                            width={'100px'}
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
                            key={`type_of_ac_${fileKey}_${index + 1}`}
                            name={`type_of_ac_${index + 1}`}
                            placeholder="Type of ac"
                            size="sm"
                            required="Required"
                            type="alpha-with-space"
                            maxLength={30}
                            defaultValue={
                              item.type_of_ac ? item.type_of_ac : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'type_of_ac', index)
                            }
                          />
                        </Td>

                        <Td>
                          <FieldInput
                            key={`beneficiary_name_${fileKey}_${index + 1}`}
                            name={`beneficiary_name_${index + 1}`}
                            placeholder="Beneficiary name"
                            size="sm"
                            required="Required"
                            type="alpha-with-space"
                            maxLength={70}
                            defaultValue={
                              item.beneficiary_name ? item.beneficiary_name : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(
                                value,
                                'beneficiary_name',
                                index
                              )
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`bank_name_${fileKey}_${index + 1}`}
                            name={`bank_name_${index + 1}`}
                            placeholder="Bank name"
                            size="sm"
                            required="Required"
                            type="alpha-with-space"
                            maxLength={70}
                            defaultValue={item.bank_name ? item.bank_name : ''}
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'bank_name', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`bank_address_${fileKey}_${index + 1}`}
                            name={`bank_address_${index + 1}`}
                            placeholder="Address Line 1"
                            size="sm"
                            required="Required"
                            type="text"
                            maxLength={50}
                            defaultValue={
                              item.bank_address ? item.bank_address : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'bank_address', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`bank_address_line2_${fileKey}_${index + 1}`}
                            name={`bank_address_line2_${index + 1}`}
                            placeholder="Address Line 2"
                            size="sm"
                            type="text"
                            maxLength={50}
                            defaultValue={
                              item.bank_address_line2_
                                ? item.bank_address_line2_
                                : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(
                                value,
                                'bank_address_line2_',
                                index
                              )
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`bank_branch_${fileKey}_${index + 1}`}
                            name={`bank_branch_${index + 1}`}
                            placeholder="Branch Name"
                            size="sm"
                            required="Required"
                            type="alpha-with-space"
                            maxLength={35}
                            defaultValue={
                              item.bank_branch ? item.bank_branch : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'bank_branch', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`contact_name_${fileKey}_${index + 1}`}
                            name={`contact_name_${index + 1}`}
                            placeholder="Contact name"
                            size="sm"
                            required="Required"
                            type="alpha-with-space"
                            maxLength={70}
                            defaultValue={
                              item.contact_name ? item.contact_name : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'contact_name', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`bank_ac_iban_no_${fileKey}_${index + 1}`}
                            name={`bank_ac_iban_no_${index + 1}`}
                            placeholder="IBAN No"
                            size="sm"
                            required="Required"
                            type="alpha-numeric"
                            maxLength={34}
                            defaultValue={
                              item.bank_ac_iban_no ? item.bank_ac_iban_no : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'bank_ac_iban_no', index)
                            }
                          />
                        </Td>

                        <Td>
                          <FieldInput
                            key={`bank_swift_${fileKey}_${index + 1}`}
                            name={`bank_swift_${index + 1}`}
                            placeholder="Swift Code"
                            size="sm"
                            required="Required"
                            type="alpha-numeric"
                            maxLength={11}
                            defaultValue={
                              item.bank_swift ? item.bank_swift : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'bank_swift', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`aba_routing_no_${fileKey}_${index + 1}`}
                            name={`aba_routing_no_${index + 1}`}
                            placeholder="Aba routing no"
                            size="sm"
                            type="alpha-numeric"
                            maxLength={11}
                            defaultValue={
                              item.aba_routing_no ? item.aba_routing_no : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'aba_routing_no', index)
                            }
                          />
                        </Td>

                        <Td>
                          <FieldInput
                            key={`bank_phone_${fileKey}_${index + 1}`}
                            name={`bank_phone_${index + 1}`}
                            placeholder="Phone Number"
                            size="sm"
                            type="phone-number"
                            maxLength={15}
                            defaultValue={
                              item.bank_phone ? item.bank_phone : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'bank_phone', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`bank_fax_${fileKey}_${index + 1}`}
                            name={`bank_fax_${index + 1}`}
                            placeholder="Fax No"
                            size="sm"
                            type="phone-number"
                            maxLength={15}
                            defaultValue={item.bank_fax ? item.bank_fax : ''}
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'bank_fax', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`bank_mobile_${fileKey}_${index + 1}`}
                            name={`bank_mobile_${index + 1}`}
                            placeholder="Mobile No"
                            size="sm"
                            type="phone-number"
                            maxLength={15}
                            defaultValue={
                              item.bank_mobile ? item.bank_mobile : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'bank_mobile', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`bank_email_${fileKey}_${index + 1}`}
                            name={`bank_email_${index + 1}`}
                            placeholder="Email"
                            size="sm"
                            required={item.bank_email !== '' ? 'Required' : ''}
                            type="email"
                            maxLength={100}
                            defaultValue={
                              item.bank_email ? item.bank_email : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'bank_email', index)
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
                disabled={uploadBank.isLoading}
                onClick={() => navigate('/customer-master')}
              >
                Go to Master
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={uploadBank.isLoading}
                isDisabled={uploadedRows.length === 0 || uploadBank.isLoading}
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

export default BankBulkUpload;
