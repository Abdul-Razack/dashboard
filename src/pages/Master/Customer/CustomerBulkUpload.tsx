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
import dayjs from 'dayjs';
import { LuDownload, LuPlus, LuUpload } from 'react-icons/lu';
import { UseQueryResult } from 'react-query';
import { useNavigate } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldYearPicker } from '@/components/FieldYearPicker';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  checkArraysHasSameValues,
  getPropertyList,
  getValueByLabel,
  getValueByValue,
  handleDownload,
  parseCSV,
  parseCSVHeaders,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import {
  checkUploadedCustomerNamesExists,
  useCreateCustomerBluk,
} from '@/services/master/services';
import { useBusinessTypeList } from '@/services/submaster/businesstype/services';
import { useContactTypeList } from '@/services/submaster/contacttype/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { usePaymentModeList } from '@/services/submaster/paymentmode/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

export const CustomerBulkUpload = () => {
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const [resetKey, setResetKey] = useState(0);
  const [fileKey, setFileKey] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<TODO>(null);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [uploadedRows, setRows] = useState<any[]>([]);
  const csvFields: any = import.meta.env.VITE_CUSTOMERS_BULK_UPLOAD_CSV_FIELDS
    ? JSON.parse(import.meta.env.VITE_CUSTOMERS_BULK_UPLOAD_CSV_FIELDS)
    : [];

  const handleInputChange = (value: any, field: string, index: number) => {
    const updatedData = [...uploadedRows];
    updatedData[index] = { ...updatedData[index], [field]: value };
    if (field === 'payment_term_id' && Number(value) !== 1) {
      setResetKey((prevKey) => prevKey + 1);
      updatedData[index].total_credit_amount = '';
      updatedData[index].total_credit_period = '';
    }
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
        delete obj.business_since;
        if (obj.has_error !== undefined) {
          delete obj.has_error;
        }if (obj.error_message !== undefined) {
          delete obj.error_message;
        }
        payloadItems.push(obj);
      });
      console.log('payloadItems', payloadItems);
      uploadContacts.mutate(payloadItems as any);
    },
  });

  // const fields = useFormFields({
  //   connect: customerForm,
  // });

  const uploadContacts = useCreateCustomerBluk({
    onSuccess: ({ created_customers, errors }) => {
      toastSuccess({
        title: 'Uploaded finished successfully',
        description: `No of customer uploaded: ${uploadedRows.length} Successful: ${created_customers?.length} Failed: ${errors?.length}`,
      });
      let payloadVariables = JSON.parse(JSON.stringify(uploadedRows));
      if (created_customers && created_customers.length > 0) {
        const updatedItems = payloadVariables.filter(
          (obj1: any) =>
            !created_customers.some(
              (obj2: any) => obj2?.business_name === obj1.business_name
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
            (obj2: any) => obj2.business_name === obj1.business_name
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
        setRows(updatedArray1);
      }
    },
    onError: (error) => {
      console.log(error); // Log any error that occurs during the upload process
    },
  });

  const businessTypeList: UseQueryResult<QueryData, unknown> =
    useBusinessTypeList();
  const businessTypeOptions = transformToSelectOptions(businessTypeList.data);

  const contactTypeList: UseQueryResult<QueryData, unknown> =
    useContactTypeList();
  const contactTypeOptions = transformToSelectOptions(contactTypeList.data);

  const currencyList: UseQueryResult<QueryData, unknown> = useCurrencyList();
  const currencyOptions = transformToSelectOptions(currencyList.data);

  const paymentModeList: UseQueryResult<QueryData, unknown> =
    usePaymentModeList();
  const paymentModeOptions = transformToSelectOptions(paymentModeList.data);

  const paymentTermsList: UseQueryResult<QueryData, unknown> =
    usePaymentTermsList();
  const paymentTermsOptions = transformToSelectOptions(paymentTermsList.data);

  const foreignEntityTypeOptions = [
    { value: 'true', label: 'Yes' },
    { value: 'false', label: 'No' },
  ];

  // Handle file drop event
  const handleDrop = (event: any) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setUploadedFile(file);
      setOpenConfirmation(true);
    }
  };

  const checkIsCustomersNamesExists = checkUploadedCustomerNamesExists({
    onSuccess: ({ data }) => {
      if (data) {
        const updatedCustomers = uploadedRows.map((customer) => {
          const customerExists =
            data[customer.business_name as keyof typeof data];
          return {
            ...customer,
            ...(customerExists
              ? {
                  has_error: true,
                  error_message: `Customer Already exists with business name ${customer.business_name}`,
                }
              : {}),
          };
        });
        const existErrorCount = updatedCustomers.filter(
          (item) => item.has_error === true
        ).length;
        setErrorCount(existErrorCount);
        setRows(updatedCustomers);
      }
    },
    onError: (error) => {
      console.log(error);
    },
  });

  const addNewRow = () => {
    const newRow = {
      business_name: '',
      business_type_id: '',
      year_of_business: '',
      contact_type_id: '',
      is_foreign_entity: '',
      nature_of_business: '',
      license_trade_no: '',
      email: '',
      currency_id: '',
      payment_mode_id: '',
      payment_term_id: '',
      total_credit_amount: '',
      total_credit_period: '',
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
      console.log(parsedRows)
      console.log(foreignEntityTypeOptions)
      if (parsedRows.length <= 100) {
        const updatedRows = parsedRows.map((obj: any) => {
          const {
            business_name,
            business_type_id,
            business_from,
            contact_type_id,
            is_foreign_entity,
            nature_of_business,
            license_trade_no,
            email,
            currency_id,
            payment_mode_id,
            payment_term_id,
            total_credit_amount,
            total_credit_period,
            ...rest
          } = obj;
          return {
            ...rest,
            business_name: business_name,
            business_type_id: business_type_id ? (businessTypeOptions.some((item:any) => item.label.toLowerCase() === business_type_id.toLowerCase()) ? 
              getValueByLabel(business_type_id, businessTypeOptions) : '') : '',
            year_of_business: business_from
              ? Number(dayjs().year()) - Number(dayjs(business_from).year())
              : '',
            business_since: business_from
              ? dayjs(
                  `${new Date().getFullYear() - Number(Number(dayjs().year()) - Number(dayjs(business_from).year()))}-01-01`
                )
              : null,
            contact_type_id: contact_type_id ? (contactTypeOptions.some((item:any) => item.label.toLowerCase() === contact_type_id.toLowerCase()) ? Number(
              getValueByLabel(contact_type_id, contactTypeOptions)
            ): '') : '',
            is_foreign_entity: is_foreign_entity ? (foreignEntityTypeOptions.some((item:any) => item.value.toLowerCase() === is_foreign_entity.toLowerCase()) ? 
              getValueByValue(is_foreign_entity.toLowerCase(), foreignEntityTypeOptions)
            : 'false') : 'false',
            nature_of_business: nature_of_business,
            license_trade_no: license_trade_no,
            email: email.toLowerCase().trimEnd(),
            currency_id: currency_id ? (currencyOptions.some((item:any) => item.label.toLowerCase() === currency_id.toLowerCase()) ? Number(
              getValueByLabel(currency_id, currencyOptions)
            ): '') : '',
            payment_mode_id: payment_mode_id ? (paymentModeOptions.some((item:any) => item.label.toLowerCase() === payment_mode_id.toLowerCase()) ? Number(
              getValueByLabel(payment_mode_id, paymentModeOptions)
            ): '') : '',
            payment_term_id: payment_term_id ? (paymentTermsOptions.some((item:any) => item.label.toLowerCase() === payment_term_id.toLowerCase()) ? Number(
              getValueByLabel(payment_term_id, paymentTermsOptions)
            ): '') : '',
            total_credit_amount:
              Number(getValueByLabel(payment_term_id, paymentTermsOptions)) !==
              1
                ? ''
                : total_credit_amount,
            total_credit_period:
              Number(getValueByLabel(payment_term_id, paymentTermsOptions)) !==
              1
                ? ''
                : total_credit_period,
          };
        });
        const customerNames = getPropertyList(updatedRows, 'business_name');
        const customerNameArray = customerNames
          .split(',')
          .map((customer_name) => customer_name.trim());
        setRows((currentRows) => [...currentRows, ...updatedRows]);
        setTimeout(() => {
          checkIsCustomersNamesExists.mutate({
            customer_names: customerNameArray,
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
    setOpenConfirmation(false);
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Contact Bulk Upload
          </Heading>

          <Button
            leftIcon={<LuDownload />}
            colorScheme="blue"
            as="label"
            size={'sm'}
            onClick={() =>
              handleDownload(import.meta.env.VITE_CUSTOMERS_SAMPLE_CSV)
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
                      Type of Contact{' '}
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
                      Business Name{' '}
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
                      Type of Business{' '}
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
                    <Th color="white">Business Since</Th>
                    <Th color="white">Years in Business</Th>

                    <Th color="white">
                      Is foreign entity{' '}
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
                    <Th color="white">Nature of Business</Th>
                    <Th color="white">License trade no</Th>
                    <Th color="white">Email</Th>
                    <Th color="white">
                      Currency{' '}
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
                      Pay. Mode{' '}
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
                      Pay. Terms
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
                    <Th color="white">Total Credit Amount</Th>
                    <Th color="white">Total Credit Period</Th>
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
                            key={`contact_type_id_${fileKey}_${index + 1}`}
                            size="sm"
                            name={`contact_type_id_${index + 1}`}
                            required={'Required'}
                            placeholder="Contact type"
                            options={contactTypeOptions}
                            width={'140px'}
                            menuPortalTarget={document.body}
                            defaultValue={
                              item.contact_type_id
                                ? item.contact_type_id.toString()
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
                              handleInputChange(value, 'contact_type_id', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`business_name_${fileKey}_${index + 1}`}
                            name={`business_name_${index + 1}`}
                            placeholder="Business name"
                            size="sm"
                            required="Required"
                            maxLength={40}
                            type={'alpha-numeric-with-space'}
                            defaultValue={
                              item.business_name ? item.business_name : ''
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            onValueChange={(value) =>
                              handleInputChange(value, 'business_name', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldSelect
                            key={`business_type_id_${fileKey}_${index + 1}`}
                            size="sm"
                            name={`business_type_id_${index + 1}`}
                            required={'Required'}
                            placeholder="Business type"
                            options={businessTypeOptions}
                            width={'140px'}
                            menuPortalTarget={document.body}
                            defaultValue={
                              item.business_type_id
                                ? item.business_type_id.toString()
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
                                'business_type_id',
                                index
                              )
                            }
                          />
                        </Td>
                        <Td>
                          <FieldYearPicker
                            name="business_since"
                            placeholder="Select year"
                            yearRange={{ start: 1950, end: dayjs().year() }}
                            size={'sm'}
                            defaultValue={
                              item.business_since ? item.business_since : null
                            }
                            onValueChange={(value) => {
                              let year_of_business: number = 0;
                              if (value) {
                                year_of_business =
                                  Number(dayjs().year()) -
                                  Number(dayjs(value).year());
                                customerForm.setValues({
                                  [`year_of_business_${index + 1}`]:
                                    year_of_business.toString(),
                                });
                                handleInputChange(
                                  year_of_business,
                                  'year_of_business',
                                  index
                                );
                              }
                            }}
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`year_of_business_${fileKey}_${index + 1}`}
                            name={`year_of_business_${index + 1}`}
                            size="sm"
                            type="integer"
                            maxLength={4}
                            placeholder="Years in business"
                            defaultValue={
                              item.year_of_business ? item.year_of_business : ''
                            }
                            minWidth="120px"
                            maxWidth="100%"
                            isDisabled={true}
                          />
                        </Td>

                        <Td>
                          <FieldSelect
                            key={`is_foreign_entity_${fileKey}_${index + 1}`}
                            size="sm"
                            name={`is_foreign_entity_${index + 1}`}
                            required={'Required'}
                            placeholder="Foreign entity"
                            options={foreignEntityTypeOptions}
                            width={'100px'}
                            menuPortalTarget={document.body}
                            defaultValue={
                              item.is_foreign_entity
                                ? item.is_foreign_entity.toString()
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
                                'is_foreign_entity',
                                index
                              )
                            }
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`nature_of_business_${fileKey}_${index + 1}`}
                            name={`nature_of_business_${index + 1}`}
                            placeholder="Nature of business"
                            size="sm"
                            maxLength={35}
                            type={'alpha-numeric-with-space'}
                            defaultValue={
                              item.nature_of_business
                                ? item.nature_of_business
                                : ''
                            }
                            onValueChange={(value) =>
                              handleInputChange(
                                value,
                                'nature_of_business',
                                index
                              )
                            }
                            minWidth="200px"
                            maxWidth="100%"
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`license_trade_no_${fileKey}_${index + 1}`}
                            name={`license_trade_no_${index + 1}`}
                            placeholder="License trade no"
                            size="sm"
                            maxLength={25}
                            type={'alpha-numeric-with-special'}
                            defaultValue={
                              item.license_trade_no ? item.license_trade_no : ''
                            }
                            onValueChange={(value) =>
                              handleInputChange(
                                value,
                                'license_trade_no',
                                index
                              )
                            }
                            minWidth="200px"
                            maxWidth="100%"
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`email_${fileKey}_${index + 1}`}
                            name={`email_${index + 1}`}
                            size="sm"
                            placeholder="Enter email"
                            type="email"
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
                            maxLength={100}
                            defaultValue={item.email ? item.email : ''}
                            onValueChange={(value) =>
                              handleInputChange(value, 'email', index)
                            }
                            required={'Required'}
                            minWidth="200px"
                            maxWidth="100%"
                          />
                        </Td>
                        <Td>
                          <FieldSelect
                            key={`currency_id_${fileKey}_${index + 1}`}
                            size="sm"
                            name={`currency_id_${index + 1}`}
                            required={'Required'}
                            placeholder="Currency code"
                            options={currencyOptions}
                            width={'100px'}
                            menuPortalTarget={document.body}
                            defaultValue={
                              item.currency_id
                                ? item.currency_id.toString()
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
                              handleInputChange(value, 'currency_id', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldSelect
                            key={`payment_mode_id_${fileKey}_${index + 1}`}
                            size="sm"
                            name={`payment_mode_id_${index + 1}`}
                            required={'Required'}
                            placeholder="Pay. mode"
                            options={paymentModeOptions}
                            width={'100px'}
                            menuPortalTarget={document.body}
                            defaultValue={
                              item.payment_mode_id
                                ? item.payment_mode_id.toString()
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
                              handleInputChange(value, 'payment_mode_id', index)
                            }
                          />
                        </Td>
                        <Td>
                          <FieldSelect
                            key={`payment_term_id_${fileKey}_${index + 1}`}
                            size="sm"
                            name={`payment_term_id_${index + 1}`}
                            required={'Required'}
                            placeholder="Pay. Terms"
                            options={paymentTermsOptions}
                            width={'100px'}
                            menuPortalTarget={document.body}
                            defaultValue={
                              item.payment_term_id
                                ? item.payment_term_id.toString()
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
                            onValueChange={(value) => {
                              handleInputChange(
                                Number(value),
                                'payment_term_id',
                                index
                              );
                            }}
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`total_credit_amount_${resetKey}_${index + 1}`}
                            name={`total_credit_amount_${index + 1}`}
                            placeholder="Total credit amount"
                            size="sm"
                            type="decimal"
                            maxLength={10}
                            defaultValue={
                              item.total_credit_amount
                                ? item.total_credit_amount
                                : ''
                            }
                            onValueChange={(value) =>
                              handleInputChange(
                                value,
                                'total_credit_amount',
                                index
                              )
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            isDisabled={item.payment_term_id !== 1}
                          />
                        </Td>
                        <Td>
                          <FieldInput
                            key={`total_credit_period_${resetKey}_${index + 1}`}
                            name={`total_credit_period_${index + 1}`}
                            placeholder="Total credit period"
                            size="sm"
                            type="integer"
                            maxLength={6}
                            defaultValue={
                              item.total_credit_period
                                ? item.total_credit_period
                                : ''
                            }
                            onValueChange={(value) =>
                              handleInputChange(
                                value,
                                'total_credit_period',
                                index
                              )
                            }
                            minWidth="150px"
                            maxWidth="100%"
                            isDisabled={item.payment_term_id !== 1}
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
                disabled={uploadContacts.isLoading}
                onClick={() => navigate('/customer-master')}
              >
                Go to Master
              </Button>
              <Button
                type="submit"
                colorScheme="brand"
                isLoading={uploadContacts.isLoading}
                isDisabled={
                  uploadedRows.length === 0 || uploadContacts.isLoading
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
      </Stack>
    </SlideIn>
  );
};

export default CustomerBulkUpload;
