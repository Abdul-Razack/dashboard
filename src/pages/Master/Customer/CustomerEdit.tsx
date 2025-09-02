import { useEffect, useState } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import dayjs from 'dayjs';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { UseQueryResult, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FieldDayPicker } from '@/components/FieldDayPicker';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import { FieldUpload } from '@/components/FieldUpload';
import { FieldYearPicker } from '@/components/FieldYearPicker';
import { LoaderFull } from '@/components/LoaderFull';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { isFormFieldsChanged } from '@/helpers/FormChangeDetector';
import { formatDate } from '@/helpers/commonHelper';
import { QualityCertificateGroup } from '@/pages/Master/Customer/QualityCertificateGroup';
import { getAPICall } from '@/services/apiService';
import { CustomerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import { useUpdateMaster } from '@/services/master/services';
import { useBusinessTypeList } from '@/services/submaster/businesstype/services';
import { useContactTypeList } from '@/services/submaster/contacttype/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { usePaymentModeList } from '@/services/submaster/paymentmode/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';

type QueryData = {
  status: boolean;
  items?: Record<number, string>;
};

type SelectOption = {
  value: number;
  label: string;
};

const transformToSelectOptions = (data?: QueryData): SelectOption[] => {
  if (!data || !data.items) {
    return [];
  }

  return Object.entries(data.items).map(([key, value]) => ({
    value: Number(key), // Convert the key to a number
    label: value,
  }));
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

const CustomerEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const queryClient = useQueryClient();
  const [resetKey, setResetKey] = useState(0);
  const [details, setCustomerDetails] = useState<any>({});

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

  const isAllDataLoaded = !(
    loading ||
    businessTypeList.isLoading ||
    contactTypeList.isLoading ||
    currencyList.isLoading
  );

  const [qcFields, setQcFields] = useState([{ id: 1 }]);

  const addQcFields = (qcData: any) => {
    setQcFields([...qcFields, qcData]);
  };

  const removeQcFields = (index: number) => {
    setQcFields(qcFields.filter((_, idx) => idx !== index));
  };

  const editQcFields = (index: number, updatedData: any) => {
    setQcFields(
      qcFields.map((cert, i) =>
        i === index ? { ...cert, ...updatedData } : cert
      )
    );
  };

  const updateCustomer = useUpdateMaster({
    onSuccess: ({ message }) => {
      toastSuccess({
        title: 'Customer updated successfully',
        description: message,
      });
      queryClient.invalidateQueries(['customerDetails', Number(id)]);
      navigate('/customer-master');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create customer',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      const quality_certificates = qcFields;

      let year_of_business: number = 0;
      if (values.business_since) {
        year_of_business =
          Number(dayjs().year()) - Number(dayjs(values.business_since).year());
      }
      let payload: any = {
        id: Number(id),
        ...values,
        is_foreign_entity: values.is_foreign_entity === 'true',
        license_trade_exp_date: formatDate(values.license_trade_exp_date),
        ...(quality_certificates.length > 0 && {
          quality_certificates,
        }),
      };

      payload.year_of_business = year_of_business;
      Object.keys(payload).forEach(
        (key) =>
          payload[key as keyof typeof payload] === undefined &&
          delete payload[key as keyof typeof payload]
      );

      // Function to recursively remove null values
      const removeNull = (obj: TODO) => {
        Object.keys(obj).forEach((key) => {
          if (obj[key] && typeof obj[key] === 'object') removeNull(obj[key]);
          else if (obj[key] === null) delete obj[key];
        });
        return obj;
      };

      // Apply the function to clean the payload
      payload = removeNull(payload);

      console.log('Payload:', payload);
      updateCustomer.mutate(payload);
    },
  });

  const fields = useFormFields({
    connect: form,
  });
  const [initialValues, setInitialValues] = useState<any>(null);

  const isFormValuesChanged = isFormFieldsChanged({
    fields,
    initialValues,
    keys: [
      'business_name',
      'business_since',
      'contact_type_id',
      'is_foreign_entity',
      'currency_id',
      'nature_of_business',
      'email',
      'license_trade_no',
      'license_trade_exp_date',
      'vat_tax_id',
      'payment_mode_id',
      'payment_term_id',
      'total_credit_amount',
      'total_credit_period',
      'remarks',
      'quality_certificates',
    ],
  });

  const [tocDisabled, setTOCDisabled] = useState<any>(true);

  const getCustomerInfo = async () => {
    try {
      const response: any = await getAPICall(
        endPoints.info.customer.replace(':id', id),
        CustomerInfoSchema
      );
      console.log(response?.data);
      const mappedCertificates: any[] =
        response?.data?.quality_certificates &&
        response?.data?.quality_certificates.length > 0
          ? response?.data?.quality_certificates?.map((certificate: any) => ({
              certificate_type: certificate.certificate_type,
              doc_no: certificate.doc_no,
              validity_date: certificate.validity_date
                ? formatDate(certificate.validity_date)
                : null,
              issue_date: certificate.issue_date
                ? formatDate(certificate.issue_date)
                : null,
              doc_url: certificate.doc_url,
            }))
          : [];

      const init: any = {
        business_name: response?.data?.business_name ?? '',
        business_since: response?.data?.year_of_business
          ? dayjs(
              `${new Date().getFullYear() - Number(response.data.year_of_business)}-01-01`
            )
          : null,
        contact_type_id: response?.data?.contact_type_id ?? '',
        is_foreign_entity: response?.data?.is_foreign_entity.toString() ?? '',
        currency_id: response?.data?.currency_id ?? '',
        nature_of_business: response?.data?.nature_of_business ?? null,
        business_type_id: response?.data?.business_type_id ?? null,
        email: response?.data?.email ?? '',
        license_trade_no: response?.data?.license_trade_no ?? null,
        license_trade_exp_date: response?.data?.license_trade_exp_date
          ? response?.data?.license_trade_exp_date
          : null,
        license_trade_url: response?.data?.license_trade_url ?? null,
        vat_tax_id: response?.data?.vat_tax_id ?? null,
        payment_mode_id: response?.data?.payment_mode_id ?? '',
        payment_term_id: response?.data?.payment_term_id ?? '',
        total_credit_amount:
          response?.data?.total_credit_amount !== 0
            ? response?.data?.total_credit_amount
            : '',
        total_credit_period:
          response?.data?.total_credit_period !== 0
            ? response?.data?.total_credit_period
            : '',
        remarks: response?.data?.remarks ?? '',
        quality_certificates:
          mappedCertificates.length > 0 ? mappedCertificates : null,
      };
      setInitialValues(init);
      form.setValues(init);

      setQcFields(mappedCertificates);
      setCustomerDetails(response);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    getCustomerInfo();
  }, []);

  useEffect(() => {
    if (form.isReady) {
      // Only set values when form is ready
      console.log(qcFields);
      form.setValues({ quality_certificates: qcFields });
    }
  }, [qcFields, form.isReady]);

  useEffect(() => {
    if (details?.data?.payment_term_id === 1) {
      setTOCDisabled(false);
      form.setValues({
        [`total_credit_amount`]: details?.data?.total_credit_amount,
        [`total_credit_period`]: details?.data?.total_credit_period,
      });
    }
  }, [details?.data?.payment_term_id]);

  useEffect(() => {
    if (tocDisabled === true) {
      form.setValues({
        [`total_credit_amount`]: '',
        [`total_credit_period`]: '',
      });
    }
  }, [tocDisabled]);

  if (!isAllDataLoaded) {
    return <LoaderFull />;
  }

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
                <BreadcrumbLink as={Link} to="/customer-master">
                  Contact Management
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Update Customer</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Update customer
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
            Contact Management
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay
              isLoading={!isAllDataLoaded && details !== undefined}
            >
              <Stack spacing={2}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'Type of Contact'}
                    name={'contact_type_id'}
                    required={'Type of Contact is required'}
                    placeholder="Select type of contact"
                    defaultValue={details?.data?.contact_type_id}
                    isDisabled={details?.data?.contact_type_id}
                    options={contactTypeOptions}
                  />

                  <FieldInput
                    label={'Business Name'}
                    name={'business_name'}
                    required={'Business Name is required'}
                    placeholder="Enter business name"
                    defaultValue={details?.data?.business_name}
                    maxLength={40}
                    type={'alpha-numeric-with-space'}
                  />

                  <FieldYearPicker
                    name="business_since"
                    label="Business Since"
                    placeholder="Select year"
                    yearRange={{ start: 1950, end: dayjs().year() }}
                    defaultValue={
                      details?.data?.year_of_business
                        ? dayjs(
                            `${new Date().getFullYear() - Number(details.data.year_of_business)}-01-01`
                          )
                        : null
                    }
                    onValueChange={(value) => {
                      let year_of_business: number = 0;
                      if (value) {
                        year_of_business =
                          Number(dayjs().year()) - Number(dayjs(value).year());
                        form.setValues({
                          [`year_of_business`]: year_of_business.toString(),
                        });
                      }
                    }}
                  />

                  <FieldInput
                    label="Years in Business"
                    name="year_of_business"
                    placeholder="Enter license / trade number"
                    defaultValue={details?.data?.year_of_business}
                    isDisabled={true}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'Types of Business'}
                    name={'business_type_id'}
                    required={'Business Type is required'}
                    placeholder="Select business type"
                    defaultValue={details?.data?.business_type_id}
                    options={businessTypeOptions}
                  />

                  {/* <FieldSelect
                    label={'Contact Group'}
                    name={'customer_group_id'}
                    required={'Contact Group is required'}
                    placeholder="Select Contact Group"
                    options={customerGroupOptions}
                    defaultValue={details?.data?.customer_group_id}
                  /> */}

                  <FieldSelect
                    label={'Foreign Entity'}
                    name={'is_foreign_entity'}
                    required={'Foreign Entity is required'}
                    placeholder="Select foreign entity"
                    defaultValue={details?.data?.is_foreign_entity?.toString()}
                    options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                  />

                  <FieldSelect
                    label="Currency"
                    name="currency_id"
                    required="Currency is required"
                    placeholder="Select currency"
                    defaultValue={details?.data?.currency_id}
                    options={currencyOptions}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label="Nature of Business"
                    name="nature_of_business"
                    placeholder="Enter nature of business"
                    defaultValue={details?.data?.nature_of_business}
                    maxLength={35}
                    type={'alpha-numeric-with-space'}
                  />
                  <FieldInput
                    label="Email"
                    name="email"
                    type="email"
                    onKeyDown={(e) => {
                      if (e.key === ' ') {
                        e.preventDefault();
                      }
                    }}
                    placeholder="Enter email"
                    defaultValue={details?.data?.email}
                    maxLength={100}
                    validations={[
                      {
                        handler: isEmail(),
                        message: 'Invalid email',
                      },
                    ]}
                    required={'Email is required'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <Stack
                    w={'full'}
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                  >
                    <FieldInput
                      label="License / Trade Number"
                      name="license_trade_no"
                      placeholder="Enter license / trade number"
                      defaultValue={details?.data?.license_trade_no}
                      maxLength={25}
                      type={'alpha-numeric-with-special'}
                    />
                    <FieldDayPicker
                      label="License / Trade Expiry Date"
                      name="license_trade_exp_date"
                      placeholder="Enter license / trade expiry date"
                      defaultValue={
                        details?.data?.license_trade_exp_date ?? null
                      }
                      disabledDays={{ before: new Date() }}
                    />
                  </Stack>
                  <FieldUpload
                    label="License / Trade Doc Upload"
                    name="license_trade_url"
                    placeholder="Upload license / trade doc"
                    existingFileUrl={details?.data?.license_trade_url || ''}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label="Vat / Tax ID"
                    name="vat_tax_id"
                    placeholder="Enter vat / tax id"
                    defaultValue={details?.data?.vat_tax_id}
                    maxLength={30}
                    type={'alpha-numeric-with-special'}
                  />
                  <FieldUpload
                    label="Vat / Tax Doc Upload"
                    name="vat_tax_url"
                    placeholder="Upload vat / tax doc"
                    existingFileUrl={details?.data?.vat_tax_url || ''}
                  />
                </Stack>
                {/* New Code */}
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'Mode of Payment'}
                    name={'payment_mode_id'}
                    required={'Mode of Payment is required'}
                    placeholder="Select mode of payment"
                    options={paymentModeOptions}
                    defaultValue={details?.data?.payment_mode?.id ?? 0}
                  />
                  <FieldSelect
                    label={'Payment Terms'}
                    name={'payment_term_id'}
                    required={'Payment Terms is required'}
                    placeholder="Select payment terms"
                    options={paymentTermsOptions}
                    defaultValue={details?.data?.payment_term?.id ?? 0}
                    onValueChange={(value) => {
                      setResetKey((prevKey) => prevKey + 1);
                      if (Number(value) === 1) {
                        setTOCDisabled(false);
                        form.setValues({
                          [`total_credit_amount`]: '',
                          [`total_credit_period`]: '',
                        });
                      } else {
                        setTOCDisabled(true);
                        form.setValues({
                          [`total_credit_amount`]: '',
                          [`total_credit_period`]: '',
                        });
                      }
                    }}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    key={`total_credit_amount_${resetKey}`}
                    label={'Total Credit Amount'}
                    name={'total_credit_amount'}
                    required={
                      !tocDisabled ? 'Total Credit Amount is required' : ''
                    }
                    placeholder="Enter Total Credit Amount"
                    type="decimal"
                    maxLength={10}
                    isDisabled={tocDisabled}
                  />
                  <FieldInput
                    key={`total_credit_period_${resetKey}`}
                    label={'Total Credit Period (Days)'}
                    name={'total_credit_period'}
                    required={
                      !tocDisabled ? 'Total Credit Period is required' : ''
                    }
                    placeholder="Enter Total Credit Period"
                    type="integer"
                    isDisabled={tocDisabled}
                    maxLength={6}
                  />
                </Stack>
                {/* End */}
                <QualityCertificateGroup
                  name="QC"
                  fields={qcFields}
                  onAdd={addQcFields}
                  onRemove={removeQcFields}
                  onEdit={editQcFields}
                  fieldPrefix="certificate"
                />

                {qcFields.map((field, index) => (
                  <Stack
                    key={`QC-${field.id}-${index}`}
                    spacing={2}
                    display={'none'}
                  >
                    <FieldInput
                      name={`quality_certificates[${index}].certificate_type`}
                      defaultValue={
                        details?.data?.quality_certificates &&
                        Array.isArray(details?.data?.quality_certificates)
                          ? details?.data?.quality_certificates[index]
                              ?.certificate_type
                          : ''
                      }
                    />
                    <FieldUpload
                      name={`quality_certificates[${index}].doc_url`}
                      existingFileUrl={
                        details?.data?.quality_certificates &&
                        Array.isArray(details?.data?.quality_certificates)
                          ? details?.data?.quality_certificates[index]?.doc_url
                          : ''
                      }
                    />
                    <FieldInput
                      name={`quality_certificates[${index}].doc_no`}
                      defaultValue={
                        details?.data?.quality_certificates !== undefined &&
                        Array.isArray(details?.data?.quality_certificates)
                          ? details?.data?.quality_certificates[index]?.doc_no
                          : ''
                      }
                      maxLength={30}
                    />
                    <FieldInput
                      name={`quality_certificates[${index}].validity_date`}
                      defaultValue={
                        details?.data?.quality_certificates &&
                        Array.isArray(details?.data?.quality_certificates) &&
                        details?.data?.quality_certificates[index]
                          ?.validity_date
                          ? dayjs(
                              details?.data?.quality_certificates[index]
                                ?.validity_date
                            ).format('DD-MMM-YYYY')
                          : null
                      }
                    />
                    <FieldInput
                      name={`quality_certificates[${index}].issue_date`}
                      defaultValue={
                        details?.data?.quality_certificates &&
                        Array.isArray(details?.data?.quality_certificates) &&
                        details?.data?.quality_certificates[index]?.issue_date
                          ? dayjs(
                              details?.data?.quality_certificates[index]
                                ?.issue_date
                            ).format('DD-MMM-YYYY')
                          : null
                      }
                    />
                  </Stack>
                ))}

                <FieldTextarea
                  label="Remarks"
                  name="remarks"
                  placeholder="Enter remarks"
                  defaultValue={details?.data?.remarks}
                  maxLength={100}
                />
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
                    mt={4}
                    isLoading={updateCustomer.isLoading}
                    isDisabled={
                      updateCustomer.isLoading || !isFormValuesChanged
                    }
                  >
                    Submit
                  </Button>

                  <Button
                    type="button"
                    colorScheme="red"
                    mt={4}
                    isDisabled={updateCustomer.isLoading}
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </LoadingOverlay>
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default CustomerEdit;
