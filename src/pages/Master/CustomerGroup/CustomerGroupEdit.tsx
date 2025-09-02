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
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { LoaderFull } from '@/components/LoaderFull';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { isFormFieldsChanged } from '@/helpers/FormChangeDetector';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { usePutCustomerGroup } from '@/services/master/group/services';
import { useCustomerGroupDetails } from '@/services/master/group/services';
import { useCustomerList } from '@/services/master/services';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const CustomerGroupEdit = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const [initialValues, setInitialValues] = useState<any>(null);

  const customerList: UseQueryResult<QueryData, unknown> = useCustomerList({
    field: 'all',
  });
  const customerOptions = transformToSelectOptions(customerList.data);

  const updateCustomerGroup = usePutCustomerGroup({
    onSuccess: ({ message }) => {
      toastSuccess({
        title: 'Contact Group updated successfully',
        description: message,
      });
      form.reset();
      navigate('/customer-group-master');
      // window.location.reload();
    },
    onError: (error) => {
      toastError({
        title: 'Failed to update customer group',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      const payload: any = {
        id: Number(id),
        customer_ids: values?.customer_ids,
      };
      console.log('values?.customer_ids', values?.customer_ids);
      setSelectedCustomers(values?.customer_ids);
      updateCustomerGroup.mutate(payload);
    },
  });

  const fields = useFormFields({ connect: form });

  const isFormValuesChanged = isFormFieldsChanged({
    fields,
    initialValues,
    keys: ['name', 'customer_ids', 'is_department'],
  });

  const { data: details, isLoading: detailsLoading } = useCustomerGroupDetails(
    Number(id)
  );
  const groupInfo = details?.data;
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  useEffect(() => {
    if (groupInfo) {
      const init = {
        name: groupInfo?.name ?? '',
        customer_ids: [
          ...new Set(groupInfo.customers.map((c) => String(c.id))),
        ],
        is_department: groupInfo?.department_id == null ? false : true,
      };
      setInitialValues(init);
      form.setValues(init); // This will pre-fill Formiz form
      if (groupInfo?.customers) {
        const uniqueCustomerIds = [
          ...new Set(
            groupInfo.customers.map((item: { id: number }) =>
              String(item.id)
            )
          ),
        ];
        setSelectedCustomers(uniqueCustomerIds);
      } else {
        setSelectedCustomers([]);
      }
    }
  }, [groupInfo]);

  useEffect(() => {}, [groupInfo]);

  const allApiDataLoaded = !detailsLoading && customerList.isSuccess;

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
                <BreadcrumbLink as={Link} to="/customer-group-master">
                  Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Update customer group create</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Update customer group create
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
            Contact Group master
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay isLoading={!allApiDataLoaded}>
              <Stack spacing={2}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label="Customer Name"
                    name="customer_ids"
                    required={'Customers required'}
                    validations={[
                      {
                        handler: (value) =>
                          Array.isArray(value) && value.length > 0,
                        message: 'Customers required',
                      },
                    ]}
                    isMulti={true}
                    placeholder="Select customer"
                    options={customerOptions}
                    defaultValue={selectedCustomers}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Name'}
                    name={'name'}
                    required={'Name required'}
                    placeholder="Enter Name"
                    maxLength={50}
                    defaultValue={groupInfo?.name || 'N/A'}
                    isDisabled={true}
                  />
                  <FieldSelect
                    label={'Show all under department'}
                    name={'is_department'}
                    // required={'Department required'}
                    placeholder="Select option"
                    options={[
                      { label: 'Yes', value: true },
                      { label: 'No', value: false },
                    ]}
                    defaultValue={
                      groupInfo?.department_id == null ? false : true
                    }
                    isDisabled={true}
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
                    mt={4}
                    isLoading={updateCustomerGroup.isLoading}
                    isDisabled={
                      updateCustomerGroup.isLoading || !isFormValuesChanged
                    }
                  >
                    Submit
                  </Button>

                  <Button
                    type="button"
                    colorScheme="red"
                    mt={4}
                    isDisabled={updateCustomerGroup.isLoading}
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

export default CustomerGroupEdit;
