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
import { Formiz, useForm } from '@formiz/core';
import { isEmail } from '@formiz/validations';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { isMinLength } from '@formiz/validations';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { useDepartmentList } from '@/services/adminuser/department/services';
import {
  useAdminUserDetails,
  useUpdateAdminUser,
} from '@/services/adminuser/services';
import { useRoleList } from '@/services/adminuser/userrole/services';

export const AdminUserUpdate = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState<boolean>(true);
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();
  const { data: details, isLoading } = useAdminUserDetails(Number(id));

  const form = useForm({
    onValidSubmit: (values) => {
      const payload = {
        id: Number(id),
        username: values.username,
        first_name: values.first_name,
        last_name: values.last_name,
        department_id: Number(values.department_id),
        role_id: Number(values.role_id),
        email: values.email,
        phone: values.phone,
      };

      updateAdminUser.mutate(payload);
    },
  });

  const updateAdminUser = useUpdateAdminUser({
    onSuccess: ({ message }) => {
      toastSuccess({
        title: 'User updated successfully',
        description: message,
      });
      navigate('/admin-users');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to update admin user',
        description: error.response?.data.message,
      });
    },
  });

  const departmentList = useDepartmentList();
  const roleList = useRoleList();
  const departmentOptions = transformToSelectOptions(departmentList?.data);
  const rolesOptions = transformToSelectOptions(roleList?.data);

  useEffect(() => {
    if (details && details.data) {
      setLoading(false);
      form.setValues({
        [`username`]: details.data.username,
        [`first_name`]: details.data.first_name,
        [`last_name`]: details.data.last_name,
        [`email`]: details.data.email,
        [`phone`]: details.data.phone,
        [`role_id`]: details.data.role_id?.toString(),
        [`department_id`]: details.data.department_id?.toString(),
      });
    }
  }, [details]);

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
                <BreadcrumbLink as={Link} to="/admin-users">
                  Admin User Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Update User</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Update Admin User
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
            Admin User Master
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay isLoading={isLoading || loading}>
              <Stack
                spacing={4}
                direction={{ base: 'column', md: 'row' }}
                mt={'.5rem'}
                alignItems={'end'}
              >
                <FieldInput
                  type="text"
                  label="User Name"
                  name="username"
                  placeholder="User name"
                  size={'sm'}
                  defaultValue={details?.data?.username ?? ''}
                  required={'User name is required'}
                />

                <FieldInput
                  type="text"
                  label="First Name"
                  name="first_name"
                  placeholder="First name"
                  size={'sm'}
                  defaultValue={details?.data?.first_name ?? ''}
                  required={'First name is required'}
                />

                <FieldInput
                  type="text"
                  label="Last Name"
                  name="last_name"
                  placeholder="Last name"
                  size={'sm'}
                  defaultValue={details?.data?.last_name ?? ''}
                  required={'Last name is required'}
                />

                <FieldInput
                  type="email"
                  onKeyDown={(e) => {
                    if (e.key === ' ') {
                      e.preventDefault();
                    }
                  }}
                  label="Email"
                  name="email"
                  placeholder="example@gmail.com"
                  size={'sm'}
                  defaultValue={details?.data?.email ? details?.data?.email.toLowerCase(): ''}
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
                spacing={4}
                direction={{ base: 'column', md: 'row' }}
                mt={'.5rem'}
                alignItems={'end'}
              >
                <FieldInput
                  type="password"
                  label="Password"
                  name="password"
                  placeholder="✱✱✱✱✱✱✱✱"
                  size={'sm'}
                  defaultValue={''}
                  validations={[
                    {
                      handler: isMinLength(8),
                      message: 'Password must be at least 8 characters',
                    },
                  ]}
                />
                <FieldInput
                  type="phone-number"
                  label="Phone number"
                  name="phone"
                  placeholder="0123456789"
                  size={'sm'}
                  defaultValue={details?.data?.phone ?? ''}
                  maxLength={15}
                />
                <FieldSelect
                  label="Department"
                  name={'department_id'}
                  placeholder="Select..."
                  options={departmentOptions}
                  required={'Department is required'}
                  defaultValue={details?.data?.department_id?.toString() ?? ''}
                  // onValueChange={(value) => {
                  //   setSelectLrfqId(Number(value));
                  // }}
                  size={'sm'}
                />
                <FieldSelect
                  label="User Role"
                  name={'role_id'}
                  placeholder="Select..."
                  options={rolesOptions}
                  required={'User Role is required'}
                  defaultValue={
                    details?.data?.role_id
                      ? details?.data?.role_id.toString()
                      : ''
                  }
                  // onValueChange={(value) => {
                  //   setSelectLrfqId(Number(value));
                  // }}
                  size={'sm'}
                />
              </Stack>
              <HStack justifyContent={'center'} mt={2}>
                <HStack spacing={2} align="center" marginTop={'1rem'}>
                  <Button
                    colorScheme="green"
                    mx={'auto'}
                    mt={4}
                    type="submit"
                    isLoading={updateAdminUser.isLoading}
                  >
                    Submit
                  </Button>

                  <Button
                    colorScheme="red"
                    mx={'auto'}
                    mt={4}
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </HStack>
              </HStack>
            </LoadingOverlay>
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default AdminUserUpdate;
