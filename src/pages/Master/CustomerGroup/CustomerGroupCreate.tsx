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
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useCreateCustomerGroup } from '@/services/master/group/services';
import { useCustomerList } from '@/services/master/services';
import { transformToSelectOptions } from '@/helpers/commonHelper';

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const CustomerGroupCreate = () => {
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const customerList: UseQueryResult<QueryData, unknown> = useCustomerList({
    field: 'all',
  });
  const customerOptions = transformToSelectOptions(customerList.data);

  const allApiDataLoaded = customerList.isSuccess;

  const createCustomerGroup = useCreateCustomerGroup({
    onSuccess: ({ message }) => {
      toastSuccess({
        title: 'Contact Group created successfully',
        description: message,
      });
      navigate('/customer-group-master');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create customer group',
        description: error.response?.data.message,
      });
    },
  });

  const form = useForm({
    onValidSubmit: (values) => {
      const payload: any = values;
      createCustomerGroup.mutate(payload);
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
                <BreadcrumbLink as={Link} to="/customer-group-master">
                  Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Add New Contact Group</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Add New Contact Group
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
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Name'}
                    name={'name'}
                    required={'Name required'}
                    placeholder="Enter Name"
                    maxLength={50}
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
                    defaultValue={true}
                  />
                </Stack>
                <Button
                  type="submit"
                  colorScheme="brand"
                  mx={'auto'}
                  mt={4}
                  isLoading={createCustomerGroup.isLoading}
                  disabled={createCustomerGroup.isLoading}
                >
                  Add New Contact Group
                </Button>
              </Stack>
            </LoadingOverlay>
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default CustomerGroupCreate;
