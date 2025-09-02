import { useEffect, useMemo, useState } from 'react';

import {
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import dayjs from 'dayjs';
import { UseQueryResult, useQueryClient } from 'react-query';

import { FieldDayPicker } from '@/components/FieldDayPicker';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import { FieldUpload } from '@/components/FieldUpload';
import { FieldYearPicker } from '@/components/FieldYearPicker';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { formatDate } from '@/helpers/commonHelper';
import { transformToSelectOptions } from '@/helpers/commonHelper';
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

type CustomerCreateModalProps = {
  isOpen: boolean;
  onClose: (status?: boolean, id?: any) => void;
  defaultType?: string;
  customerName?: string;
  isDisabled?: boolean;
  fromPRFQ?: boolean;
};

const CustomerCreateModal = ({
  isOpen,
  onClose,
  defaultType,
  customerName = '',
  isDisabled = false,
  fromPRFQ = false,
}: CustomerCreateModalProps) => {
  const [qcFields, setQcFields] = useState<any>([]);
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const queryClient = useQueryClient();
  const [tocDisabled, setTOCDisabled] = useState<any>(true);
  const [resetKey, setResetKey] = useState(0);
  const [ctOptions, setCTOptions] = useState<any>([]);

  const handleClose = () => {
    onClose(false, null);
  };
  
  const businessTypeList: UseQueryResult<QueryData, unknown> =
    useBusinessTypeList();
  const businessTypeOptions = transformToSelectOptions(businessTypeList.data);

  const contactTypeList: UseQueryResult<QueryData, unknown> =
    useContactTypeList();
  const contactTypeOptions = useMemo(() => {
    return transformToSelectOptions(contactTypeList.data);
  }, [contactTypeList.data]);

  const currencyList: UseQueryResult<QueryData, unknown> = useCurrencyList();
  const currencyOptions = transformToSelectOptions(currencyList.data);

  const paymentModeList: UseQueryResult<QueryData, unknown> =
    usePaymentModeList();
  const paymentModeOptions = transformToSelectOptions(paymentModeList.data);

  const paymentTermsList: UseQueryResult<QueryData, unknown> =
    usePaymentTermsList();
  const paymentTermsOptions = transformToSelectOptions(paymentTermsList.data);

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
        title: 'Customer created - ' + id,
        description: message,
      });
      queryClient.invalidateQueries(['customerIndex']);
      onClose(true, id);
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
        currency_id,
        payment_mode_id,
        payment_term_id,
        total_credit_amount,
        total_credit_period,
        ...optionalValues
      } = values;

      const quality_certificates = qcFields;

      optionalValues.license_trade_exp_date = formatDate(
        optionalValues.license_trade_exp_date
      );

      let year_of_business: number = 0;
      if (values.business_since) {
        year_of_business =
          Number(dayjs().year()) - Number(dayjs(values.business_since).year());
      }
      // Construct the final payload, excluding null or undefined optional fields and empty quality_certificates
      const payload: any = {
        business_name,
        business_type_id,
        contact_type_id,
        is_foreign_entity: values.is_foreign_entity === 'true' ? true : false,
        nature_of_business,
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

  useEffect(() => {
    if (
      contactTypeList.isSuccess &&
      contactTypeOptions.length > 0 &&
      fromPRFQ
    ) {
      if (fromPRFQ) {
        const filteredData = contactTypeOptions.filter(
          (item: any) => item.value === '1' || item.value === '6'
        );
        setCTOptions(filteredData);
      } else {
        setCTOptions(contactTypeOptions);
      }
    }
  }, [fromPRFQ, contactTypeOptions, contactTypeList.isSuccess]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size={'lg'}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <ModalOverlay />
      <ModalContent maxWidth="75vw">
        <Formiz autoForm connect={form}>
          <ModalHeader>Create Customer</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Stack spacing={2}>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldSelect
                  label={'Type of Contact'}
                  name={'contact_type_id'}
                  required={'Type of Contact is required'}
                  placeholder="Select type of contact"
                  options={fromPRFQ ? ctOptions : contactTypeOptions}
                  isDisabled={isDisabled}
                  className={isDisabled === true ? 'disabled-input' : ''}
                  defaultValue={defaultType ?? ''}
                  onValueChange={(value) => {
                    console.log(value);
                  }}
                />

                <FieldInput
                  label={'Business Name'}
                  name={'business_name'}
                  required={'Business Name is required'}
                  placeholder="Enter business name"
                  maxLength={40}
                  type={'alpha-numeric-with-space'}
                  defaultValue={customerName.toUpperCase() ?? ''}
                />
              </Stack> 
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
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
                <FieldSelect
                  label={'Types of Business'}
                  name={'business_type_id'}
                  required={'Business Type is required'}
                  placeholder="Select business type"
                  options={businessTypeOptions}
                />
              </Stack>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
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
                <FieldSelect
                  label="Currency"
                  name="currency_id"
                  required="Currency is required"
                  placeholder="Select currency"
                  options={currencyOptions}
                />
              </Stack>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
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
                  required={'Email is required'}
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  placeholder="Enter email"
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
                    label="License / Trade Exp-Date"
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
                  placeholder="Enter vat / tax id"
                  maxLength={30}
                  type={'alpha-numeric-with-special'}
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
                  placeholder="Select Mode"
                  options={paymentModeOptions}
                />
                <FieldSelect
                  label={'Payment Terms'}
                  name={'payment_term_id'}
                  required={'Payment Terms is required'}
                  placeholder="Select Terms"
                  options={paymentTermsOptions}
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
                name="Quality Certificate"
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
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleClose}>
              Close
            </Button>
            <Button
              type="submit"
              colorScheme="brand"
              isLoading={createCustomer.isLoading}
              disabled={
                businessTypeList.isLoading ||
                contactTypeList.isLoading ||
                currencyList.isLoading
              }
            >
              Add New Contact
            </Button>
          </ModalFooter>
        </Formiz>
      </ModalContent>
    </Modal>
  );
};

export default CustomerCreateModal;
