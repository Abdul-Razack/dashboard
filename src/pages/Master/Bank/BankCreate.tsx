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
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { UseQueryResult } from 'react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useCreateMasterBank } from '@/services/master/bank/services';
import { useCustomerList } from '@/services/master/services';
import { transformToSelectOptions } from '@/helpers/commonHelper';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const BankCreate = () => {
  const { state } = useLocation();
  const customer_id = state?.customer_id;
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const customerList: UseQueryResult<QueryData, unknown> = useCustomerList();
  const customerOptions = transformToSelectOptions(customerList.data);

  const allApiDataLoaded = customerList.isSuccess;

  const createBank = useCreateMasterBank({
    onSuccess: ({ id, message }) => {
      toastSuccess({
        title: 'Bank created - ' + id,
        description: message,
      });
      navigate('/bank-master');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create bank',
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
        customer_id: customer_id,
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
      createBank.mutate(payload);
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
                <BreadcrumbLink as={Link} to="/bank-master">
                  Bank Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Add New Bank</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Add New bank
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
                    defaultValue={customer_id}
                    isDisabled={!!customer_id}
                  />

                  <FieldInput
                    label={'Type of Account'}
                    name={'type_of_ac'}
                    required={'Account Type is required'}
                    placeholder="Enter account type"
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
                    type="alpha-with-space"
                    maxLength={70}
                  />

                  <FieldInput
                    label={'Bank Name'}
                    name={'bank_name'}
                    required={'Name is required'}
                    placeholder="Enter bank name"
                    type="alpha-with-space"
                    maxLength={70}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label="Address Line 1"
                    name="bank_address"
                    placeholder="Enter Address Line 1"
                    required={'Address is required'}
                    maxLength={50}
                    type="text"
                  />

                  <FieldInput
                    label="Address Line 2"
                    name="bank_address_line2"
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
                    type="alpha-with-space"
                    maxLength={35}
                  />
                  <FieldInput
                    label={'Contact Name'}
                    name={'contact_name'}
                    required={'Contact Name is required'}
                    placeholder="Enter Contact Name"
                    type="alpha-with-space"
                    maxLength={70}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'IBAN/account number'}
                    name={'bank_ac_iban_no'}
                    required={'IBAN/Account Number is required'}
                    placeholder="Enter IBAN/Account Number"
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
                      type="alpha-numeric"
                      maxLength={11}
                    />
                    <FieldInput
                      label={'ABA Routing Number'}
                      name={'aba_routing_no'}
                      placeholder="Enter ABA Routing Number"
                      type="alpha-numeric"
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
                    maxLength={15}
                  />
                  <FieldInput
                    label={'Fax No'}
                    name={'bank_fax'}
                    placeholder="Enter Bank Fax No"
                    type="phone-number"
                    maxLength={15}
                  />
                  <FieldInput
                    label={'Mobile Number'}
                    name={'phone-number'}
                    placeholder="Enter Bank Mobile Number"
                    type="phone-number"
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
                    validations={[
                      {
                        handler: isEmail(),
                        message: 'Invalid email',
                      },
                    ]}
                    maxLength={100}
                  />
                </Stack>
                <Button
                  type="submit"
                  colorScheme="brand"
                  mx={'auto'}
                  mt={4}
                  isLoading={createBank.isLoading}
                  disabled={
                    createBank.isLoading ||
                    !form.isValid ||
                    !allApiDataLoaded ||
                    !customer_id
                  }
                >
                  Add New Bank
                </Button>
              </Stack>
            </LoadingOverlay>
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default BankCreate;
