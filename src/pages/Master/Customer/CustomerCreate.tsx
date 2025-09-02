import { useState } from 'react';

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
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import dayjs from 'dayjs';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import { FieldDayPicker } from '@/components/FieldDayPicker';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import { FieldUpload } from '@/components/FieldUpload';
import { FieldYearPicker } from '@/components/FieldYearPicker';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { formatDate } from '@/helpers/commonHelper';
import { QualityCertificateGroup } from '@/pages/Master/Customer/QualityCertificateGroup';
import { useCreateMaster } from '@/services/master/services';
import { useBusinessTypeList } from '@/services/submaster/businesstype/services';
import { useContactTypeList } from '@/services/submaster/contacttype/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { usePaymentModeList } from '@/services/submaster/paymentmode/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

type SelectOption = {
  value: string;
  label: string;
};

const CustomerCreate = () => {
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const [tocDisabled, setTOCDisabled] = useState<any>(true);
  const [resetKey, setResetKey] = useState(0);
  const transformToSelectOptions: any = (data?: QueryData): SelectOption[] => {
    if (!data || !data.items) {
      return [];
    }

    return Object.entries(data.items).map(([key, value]) => ({
      value: key,
      label: value,
    }));
  };

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

  const [qcFields, setQcFields] = useState<any>([]);

  const addQcFields = (qcData: any) => {
    setQcFields([...qcFields, qcData]);
  };

  const removeQcFields = (index: number) => {
    setQcFields(qcFields.filter((_: unknown, idx: number) => idx !== index));
  };

  const editQcFields = (index: number, updatedData: any) => {
    setQcFields(
      qcFields.map((cert: any, i: number) =>
        i === index ? { ...cert, ...updatedData } : cert
      )
    );
  };

  const createCustomer = useCreateMaster({
    onSuccess: ({ id, message }) => {
      toastSuccess({
        title: 'Customer created Successfully',
        description: message,
      });
      if (id) {
        navigate(`/customer-master/${id}`);
      } else {
        navigate('/customer-master');
      }
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
      // Destructure mandatory fields directly
      const {
        business_name,
        business_type_id,
        contact_type_id,
        is_foreign_entity,
        nature_of_business,
        license_trade_exp_date,
        license_trade_no,
        email,
        currency_id,
        payment_mode_id,
        payment_term_id,
        total_credit_amount,
        total_credit_period,
        ...optionalValues
      } = values;

      // Process and populate quality certificates
      Object.keys(optionalValues).forEach((key) => {
        const match = key.match(/^(.+)-(\d+)$/);
        if (match) {
          const [fullMatch] = match;
          // Delete processed quality certificate fields
          delete optionalValues[fullMatch];
        }
      });
      // Qc value
      const quality_certificates = qcFields;
      let year_of_business: number = 0;
      if (values.business_since) {
        year_of_business =
          Number(dayjs().year()) - Number(dayjs(values.business_since).year());
      }

      const payload: any = {
        business_name,
        business_type_id,
        contact_type_id,
        is_foreign_entity: values.is_foreign_entity === 'true' ? true : false,
        nature_of_business,
        license_trade_no,
        license_trade_exp_date: license_trade_exp_date
          ? formatDate(license_trade_exp_date)
          : null,
        email,
        currency_id,
        payment_mode_id: Number(payment_mode_id),
        payment_term_id: Number(payment_term_id),
        total_credit_amount,
        total_credit_period,
        ...(quality_certificates.length > 0 && {
          quality_certificates,
        }),
        ...Object.fromEntries(
          Object.entries(optionalValues).filter(
            ([_, value]) => value !== null && value !== ''
          )
        ),
      };
      payload.year_of_business = year_of_business;

      createCustomer.mutate(payload);
    },
  });

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
                <BreadcrumbLink>Add New Contact</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Add New Contact
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
            <Stack spacing={2}>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldSelect
                  label={'Type of Contact'}
                  name={'contact_type_id'}
                  required={'Type of Contact is required'}
                  placeholder="Select type of contact"
                  options={contactTypeOptions}
                />
                <FieldInput
                  label={'Business Name'}
                  name={'business_name'}
                  required={'Business Name is required'}
                  placeholder="Enter business name"
                  maxLength={40}
                  type={'alpha-numeric-with-space'}
                />

                <FieldYearPicker
                  name="business_since"
                  label="Business Since"
                  placeholder="Select year"
                  yearRange={{ start: 1950, end: dayjs().year() }}
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
                  placeholder="Years in Business"
                  defaultValue={'0'}
                  isDisabled={true}
                />
              </Stack>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldSelect
                  label={'Types of Business'}
                  name={'business_type_id'}
                  required={'Business Type is required'}
                  placeholder="Select business type"
                  options={businessTypeOptions}
                />

                <FieldSelect
                  label={'Foreign Entity'}
                  name={'is_foreign_entity'}
                  required={'Foreign Entity is required'}
                  placeholder="Select foreign entity"
                  options={[
                    { value: 'true', label: 'Yes' },
                    { value: 'false', label: 'No' },
                  ]}
                />
              </Stack>

              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldSelect
                  label="Currency"
                  name="currency_id"
                  required="Currency is required"
                  placeholder="Select currency"
                  options={currencyOptions}
                />

                <FieldInput
                  label="Nature of Business"
                  name="nature_of_business"
                  placeholder="Enter nature of business"
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
                  validations={[
                    {
                      handler: isEmail(),
                      message: 'Invalid email',
                    },
                  ]}
                  required={'Email is required'}
                  maxLength={100}
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
                    maxLength={25}
                    type={'alpha-numeric-with-special'}
                  />
                  <FieldDayPicker
                    label="License / Trade Expiry Date"
                    name="license_trade_exp_date"
                    placeholder="Enter license / trade expiry date"
                    disabledDays={{ before: new Date() }}
                  />
                </Stack>
                <FieldUpload
                  label="License / Trade Doc Upload"
                  name="license_trade_url"
                  placeholder="Upload license / trade doc"
                />
              </Stack>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldInput
                  label="Vat / Tax ID"
                  name="vat_tax_id"
                  type={'alpha-numeric-with-special'}
                  placeholder="Enter vat / tax id"
                  maxLength={30}
                />
                <FieldUpload
                  label="Vat / Tax Doc Upload"
                  name="vat_tax_url"
                  placeholder="Upload vat / tax doc"
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
                />
                <FieldSelect
                  label={'Payment Terms'}
                  name={'payment_term_id'}
                  required={'Payment Terms is required'}
                  placeholder="Select payment terms"
                  options={paymentTermsOptions}
                  onValueChange={(value) => {
                    setResetKey((prevKey) => prevKey + 1);
                    console.log(value);
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
                  maxLength={6}
                  isDisabled={tocDisabled}
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
              <FieldTextarea
                label="Remarks"
                name="remarks"
                placeholder="Enter remarks"
                maxLength={100}
              />
              <Button
                type="submit"
                colorScheme="brand"
                mx={'auto'}
                mt={4}
                isLoading={createCustomer.isLoading}
                disabled={
                  businessTypeList.isLoading ||
                  contactTypeList.isLoading ||
                  currencyList.isLoading
                }
              >
                Add New Contact
              </Button>
            </Stack>
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default CustomerCreate;
