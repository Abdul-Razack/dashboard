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
import { FieldTextarea } from '@/components/FieldTextarea';
import { FieldUpload } from '@/components/FieldUpload';
import { LoaderFull } from '@/components/LoaderFull';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  usePrincipleOwnerDetails,
  useUpdateOwner,
} from '@/services/master/principleowner/services';
import { useCustomerList } from '@/services/master/services';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { isFormFieldsChanged } from '@/helpers/FormChangeDetector';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const OwnerPrincipleEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const queryClient = useQueryClient();

  const { data: details, isLoading: detailsLoading } = usePrincipleOwnerDetails(
    Number(id)
  );
  const customerList: UseQueryResult<QueryData, unknown> = useCustomerList();
  const customerOptions = transformToSelectOptions(customerList.data);

  const allApiDataLoaded = !detailsLoading && customerList.isSuccess;

  const updateContact = useUpdateOwner({
    onSuccess: ({ message }) => {
      toastSuccess({
        title: 'Updated principle of owner',
        description: message,
      });
      queryClient.invalidateQueries(['OwnerDetails', Number(id)]);
      navigate('/principle-of-owner-master');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to update principle of owner',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      // Destructure mandatory fields directly
      const { owner, phone, email, remarks, ...optionalValues } = values;

      // Construct the final payload, excluding null or undefined optional fields and empty quality_certificates
      const payload: any = {
        id: Number(id),
        owner,
        phone,
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
      updateContact.mutate(payload);
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
      "owner",
      "phone",
      "email",
      "id_passport_copy",
      "remarks"
    ],
  });
   
  useEffect(() => {
    if (details) {
      const init = {
        owner: details?.owner ?? '',
        phone: details?.phone ?? '',
        email: details?.email ?? '',
        id_passport_copy: details?.id_passport_copy ?? '',
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
                <BreadcrumbLink as={Link} to="/principle-of-owner">
                  Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Update Principal of Owner</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Update Principal of Owner
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
            Principal of Owner master
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
                    label={'Owner'}
                    name={'owner'}
                    required={'Owner is required'}
                    placeholder="Enter Owner Name"
                    defaultValue={details?.owner ?? ''}
                    maxLength={40}
                    type={'alpha-with-space'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Phone Number'}
                    name={'phone'}
                    // required={'Phone Number is required'}
                    placeholder="Enter Phone Number"
                    type="phone-number"
                    defaultValue={details?.phone ?? ''}
                    maxLength={15}
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
                  <FieldUpload
                    label="ID/Passport Copy"
                    name="id_passport_copy"
                    placeholder="Passport Copy"
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
                    isLoading={updateContact.isLoading}
                    isDisabled={updateContact.isLoading || !isFormValuesChanged}
                  >
                    Update Principal of Owner
                  </Button>
                  <Button
                    type="button"
                    colorScheme="red"
                    mt={4}
                    isDisabled={updateContact.isLoading}
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

export default OwnerPrincipleEdit;
