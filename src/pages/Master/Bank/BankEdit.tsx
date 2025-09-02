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
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { UseQueryResult, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { LoaderFull } from '@/components/LoaderFull';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  useBankDetails,
  useUpdateMasterBank,
} from '@/services/master/bank/services';
import { useCustomerList } from '@/services/master/services';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { isFormFieldsChanged } from '@/helpers/FormChangeDetector';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const BankEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const queryClient = useQueryClient();

  const { data: details, isLoading: detailsLoading } = useBankDetails(
    Number(id)
  );
  const customerList: UseQueryResult<QueryData, unknown> = useCustomerList();
  const customerOptions = transformToSelectOptions(customerList.data);

  const allApiDataLoaded = customerList.isSuccess && !detailsLoading;

  const updateBank = useUpdateMasterBank({
    onSuccess: ({ message }) => {
      toastSuccess({
        title: 'Bank updated',
        description: message,
      });
      queryClient.invalidateQueries(['bankDetails', Number(id)]);
      navigate('/bank-master');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to update bank',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      // Destructure mandatory fields directly
      const {
        beneficiary_name,
        bank_name,
        bank_address,
        bank_branch,
        bank_ac_iban_no,
        type_of_ac,
        bank_swift,
        contact_name,
        ...optionalValues
      } = values;

      // Construct the final payload, excluding null or undefined optional fields and empty quality_certificates
      const payload: any = {
        id: Number(id),
        beneficiary_name,
        bank_name,
        bank_address,
        bank_branch,
        bank_ac_iban_no,
        type_of_ac,
        bank_swift,
        contact_name,
        ...Object.fromEntries(
          Object.entries(optionalValues).filter(
            ([_, value]) => value !== null && value !== ''
          )
        ),
      };
      // console.log(payload);
      // Assuming you have a function to make the API call
      updateBank.mutate(payload);
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
      "beneficiary_name",
      "bank_name",
      "bank_address",
      "bank_address_line2",
      "bank_branch",
      "bank_ac_iban_no",
      "type_of_ac",
      "bank_swift",
      "aba_routing_no",
      "contact_name",
      "bank_phone",
      "bank_fax",
      "bank_mobile",
      "bank_email",
    ],
  });

  useEffect(() => {
    if (details) {
      const init = {
        beneficiary_name: details?.beneficiary_name ?? '',
        bank_name: details?.bank_name ?? '',
        bank_address: details?.bank_address ?? '',
        bank_address_line2: details?.bank_address_line2 ?? '',
        bank_branch: details?.bank_branch ?? '',
        bank_ac_iban_no: details?.bank_ac_iban_no ?? '',
        type_of_ac: details?.customer?.type_of_ac ?? '',
        bank_swift: details?.bank_swift ?? '',
        aba_routing_no: details?.aba_routing_no ?? '',
        contact_name: details?.contact_name ?? '',
        bank_phone: details?.bank_phone ?? '',
        bank_fax: details?.bank_fax ?? '',
        bank_mobile: details?.bank_mobile ?? '',
        bank_email: details?.bank_email ?? '',
      };    
      setInitialValues(init);
      form.setValues(init); 
    }
  }, [details]);

  if (!allApiDataLoaded) {
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
                <BreadcrumbLink as={Link} to="/bank-master">
                  Bank Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Update Bank</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Update bank
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
            Bank master
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay isLoading={!allApiDataLoaded}>
              <Stack spacing={2}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'Customer'}
                    name={'customer_id'}
                    required={'customer_id required'}
                    placeholder="Select customer"
                    options={customerOptions}
                    defaultValue={details?.customer_id.toString() ?? ''}
                    isDisabled={!!details?.customer_id}
                  />

                  <FieldInput
                    label={'Type of Account'}
                    name={'type_of_ac'}
                    required={'Account Type is required'}
                    placeholder="Enter account type"
                    defaultValue={details?.customer?.type_of_ac ?? ''}
                     type="alpha-with-space"
                    maxLength={30}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Beneficiary Name'}
                    name={'beneficiary_name'}
                    required={'Beneficiary Name is required'}
                    placeholder="Enter beneficiary name"
                    defaultValue={details?.beneficiary_name ?? ''}
                     type="alpha-with-space"
                    maxLength={70}
                  />

                  <FieldInput
                    label={'Bank Name'}
                    name={'bank_name'}
                    required={'Name is required'}
                    placeholder="Enter bank name"
                    defaultValue={details?.bank_name ?? ''}
                    type="alpha-with-space"
                    maxLength={70}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label="Address Line 1"
                    name="bank_address"
                    defaultValue={details?.bank_address ?? ''}
                    placeholder="Enter Address Line 1"
                    required={'Address is required'}
                    maxLength={50}
                    type="text"
                  />

                  <FieldInput
                    label="Address Line 2"
                    name="bank_address_line2"
                    defaultValue={details?.bank_address_line2 ?? ''}
                    placeholder="Enter Address Line 2"
                    maxLength={50}
                    type="text"
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Branch'}
                    name={'bank_branch'}
                    required={'Branch is required'}
                    placeholder="Enter bank branch"
                    defaultValue={details?.bank_branch ?? ''}
                    type="alpha-with-space"
                    maxLength={35}
                  />
                  <FieldInput
                    label={'Contact Name'}
                    name={'contact_name'}
                    required={'Contact Name is required'}
                    placeholder="Enter Contact Name"
                    defaultValue={details?.contact_name ?? ''}
                    type="alpha-with-space"
                    maxLength={70}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'IBAN/account number'}
                    name={'bank_ac_iban_no'}
                    required={'IBAN Number is required'}
                    placeholder="Enter IBAN Number"
                    defaultValue={details?.bank_ac_iban_no ?? ''}
                    type="alpha-numeric"
                    maxLength={34}
                  />
                  <Stack
                    w={'full'}
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                  >
                    <FieldInput
                      label={'Swift Code'}
                      name={'bank_swift'}
                      required={'Swift code is required'}
                      placeholder="Enter Bank Swift code"
                      defaultValue={details?.bank_swift ?? ''}
                       maxLength={11}
                      type="alpha-numeric"
                    />
                    <FieldInput
                      label={'ABA Routing Number'}
                      name={'aba_routing_no'}
                      placeholder="Enter ABA Routing Number"
                      type="alpha-numeric"
                      defaultValue={details?.aba_routing_no ?? ''}
                      maxLength={11}
                    />
                  </Stack>
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Phone Number'}
                    name={'bank_phone'}
                    placeholder="Enter Bank Phone Number"
                    type="phone-number"
                    defaultValue={details?.bank_phone ?? ''}
                    maxLength={15}
                  />
                  <FieldInput
                    label={'Fax No'}
                    name={'bank_fax'}
                    placeholder="Enter Bank Fax No"
                    type="phone-number"
                    defaultValue={details?.bank_fax ?? ''}
                    maxLength={15}
                  />
                  <FieldInput
                    label={'Mobile Number'}
                    name={'bank_mobile'}
                    placeholder="Enter Bank Mobile Number"
                    type="phone-number"
                    defaultValue={details?.bank_mobile ?? ''}
                    maxLength={15}
                  />
                  <FieldInput
                    label={'Email'}
                    name={'bank_email'}
                    placeholder="Enter Bank Email"
                    type="email"
                    onKeyDown={(e) => {
                      if (e.key === ' ') {
                        e.preventDefault();
                      }
                    }}
                    defaultValue={details?.bank_email ?? ''}
                    validations={[
                      {
                        handler: isEmail(),
                        message: 'Invalid email',
                      },
                    ]}
                    maxLength={100}
                  />
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
                    mx={'auto'}
                    mt={4}
                    isLoading={updateBank.isLoading}
                    isDisabled={
                      updateBank.isLoading ||
                      !form.isValid ||
                      !allApiDataLoaded ||
                      !isFormValuesChanged
                    }
                  >
                    Update Bank
                  </Button>
                  <Button
                    type="button"
                    colorScheme="red"
                    mt={4}
                    isDisabled={updateBank.isLoading}
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

export default BankEdit;
