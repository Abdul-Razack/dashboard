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
import { Formiz, useForm, useFormFields} from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { UseQueryResult, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import { LoaderFull } from '@/components/LoaderFull';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { countryOptions } from '@/constants';
import { useCustomerList } from '@/services/master/services';
import {
  useShippingAddressDetails,
  useUpdateShipping,
} from '@/services/master/shipping/services';

import { transformToSelectOptions } from '@/helpers/commonHelper';
import { isFormFieldsChanged } from '@/helpers/FormChangeDetector';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const ShippingAddressEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const queryClient = useQueryClient();

  const { data: details, isLoading: detailsLoading } =
    useShippingAddressDetails(Number(id));
  const customerList: UseQueryResult<QueryData, unknown> = useCustomerList();
  const customerOptions = transformToSelectOptions(customerList.data);

  const allApiDataLoaded = !detailsLoading && customerList.isSuccess;

  const updateShippingAddress = useUpdateShipping({
    onSuccess: ({ message }) => {
      toastSuccess({
        title: 'Updated shipping address',
        description: message,
      });
      queryClient.invalidateQueries(['shippingDetails', Number(id)]);
      navigate('/shipping-address-master');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to update shipping address',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      // Destructure mandatory fields directly
      const {
        attention,
        consignee_name,
        address,
        city,
        state,
        zip_code,
        country,
        phone,
        fax,
        email,
        remarks,
        ...optionalValues
      } = values;

      // Construct the final payload, excluding null or undefined optional fields and empty quality_certificates
      const payload: any = {
        id: Number(id),
        attention,
        consignee_name,
        address,
        city,
        state,
        zip_code,
        country,
        phone,
        fax,
        email,
        remarks,
        ...Object.fromEntries(
          Object.entries(optionalValues).filter(
            ([_, value]) => value !== null && value !== ''
          )
        ),
      };
      // console.log(payload);
      // Assuming you have a function to make the API call
      updateShippingAddress.mutate(payload);
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
      "attention",
      "consignee_name",
      "address",
      "address_line2",
      "city",
      "state",
      "zip_code",
      "country",
      "phone",
      "fax",
      "email",
      "remarks"
    ],
  });
   
  useEffect(() => {
    if (details) {
      const init = {
        attention: details?.attention ?? '',
        consignee_name: details?.consignee_name ?? '',
        address: details?.address ?? '',
        address_line2: details?.address_line2 ?? '',
        city: details?.city ?? '',
        state: details?.state ?? '',
        zip_code: details?.zip_code ?? '',
        country: details?.country ?? '',
        phone: details?.phone ?? '',
        fax: details?.fax ?? '',
        email: details?.email ?? '',
        remarks: details?.remarks ?? ''
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
                <BreadcrumbLink as={Link} to="/shipping-address-master">
                  Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Update Shipping Address</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Update shipping address
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
            Shipping address master
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay isLoading={!allApiDataLoaded}>
              <Stack spacing={2}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'Customer Name'}
                    name={'customer_id'}
                    required={'customer_id required'}
                    placeholder="Select customer"
                    options={customerOptions}
                    defaultValue={details?.customer_id.toString() ?? ''}
                    isDisabled={!!details?.customer_id}
                  />

                  <FieldInput
                    label={'Attention'}
                    name={'attention'}
                    required={'Attention is required'}
                    placeholder="Enter Attention"
                    defaultValue={details?.attention ?? ''}
                    maxLength={40}
                    type={'alpha-with-space'}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Consignee Name'}
                    name={'consignee_name'}
                    required={'Consignee Name is required'}
                    placeholder="Enter Consignee Name"
                    defaultValue={details?.consignee_name ?? ''}
                    maxLength={40}
                    type={'alpha-with-space'}
                  />
                  <FieldInput
                    label={'Email'}
                    name={'email'}
                    placeholder="Enter Email"
                    defaultValue={details?.email ?? ''}
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
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label="Address Line 1"
                    name="address"
                    placeholder="Enter Address Line 1"
                    required={'Address Line 1 is required'}
                    defaultValue={details?.address ?? ''}
                    maxLength={50}
                  />

                  <FieldInput
                    label="Address Line 2"
                    name="address_line2"
                    placeholder="Enter Address  Line 2"
                    defaultValue={details?.address_line2 ?? ''}
                    maxLength={50}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'City'}
                    name={'city'}
                    placeholder="Enter city"
                    defaultValue={details?.city ?? ''}
                    maxLength={40}
                    type={'alpha-numeric-with-space'}
                  />
                  <FieldInput
                    label={'State'}
                    name={'state'}
                    placeholder="Enter State"
                    defaultValue={details?.state ?? ''}
                    maxLength={40}
                    type={'alpha-with-space'}
                  />
                  <FieldInput
                    label={'Zipcode'}
                    name={'zip_code'}
                    placeholder="Enter Zipcode"
                    defaultValue={details?.zip_code ?? ''}
                    maxLength={8}
                    type={'integer'}
                  />
                  <FieldSelect
                    label={'Country'}
                    name={'country'}
                    placeholder="Enter Country"
                    required={'Country is required'}
                    options={countryOptions}
                    defaultValue={details?.country ?? ''}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Phone Number'}
                    name={'phone'}
                    required={'Phone Number is required'}
                    placeholder="Enter Phone Number"
                    type="phone-number"
                    defaultValue={details?.phone ?? ''}
                    maxLength={15}
                  />

                  <FieldInput
                    label={'Fax No'}
                    name={'fax'}
                    placeholder="Enter Fax No"
                    type="phone-number"
                    defaultValue={details?.fax ?? ''}
                    maxLength={15}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldTextarea
                    label="Remarks"
                    name="remarks"
                    placeholder="Enter Remarks"
                    defaultValue={details?.remarks ?? ''}
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
                    isLoading={updateShippingAddress.isLoading}
                    isDisabled={updateShippingAddress.isLoading || !isFormValuesChanged}
                  >
                    Update Shipping Address
                  </Button>
                  <Button
                    type="button"
                    colorScheme="red"
                    mt={4}
                    isDisabled={updateShippingAddress.isLoading}
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

export default ShippingAddressEdit;
