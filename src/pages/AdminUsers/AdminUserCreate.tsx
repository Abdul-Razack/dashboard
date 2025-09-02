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
import { isMinLength } from '@formiz/validations';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { useDepartmentList } from '@/services/adminuser/department/services';
import { useCreateAdminUser } from '@/services/adminuser/services';
import { useRoleList } from '@/services/adminuser/userrole/services';

export const AdminUserCreate = () => {
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const navigate = useNavigate();

  const form = useForm({
    onValidSubmit: (values) => {
      const payload = {
        username: values.username,
        first_name: values.first_name,
        last_name: values.last_name,
        department_id: Number(values.department_id),
        role_id: Number(values.role_id),
        email: values.email,
        phone: values.phone,
        password: values.password,
      };

      createAdminUser.mutate(payload);
    },
  });

  const createAdminUser = useCreateAdminUser({
    onSuccess: ({ id, message }) => {
      toastSuccess({
        title: 'User created successfully - ' + id,
        description: message,
      });
      navigate('/admin-users');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create admin user',
        description: error.response?.data.message,
      });
    },
  });

  const departmentList = useDepartmentList();
  const roleList = useRoleList();
  const departmentOptions = transformToSelectOptions(departmentList?.data);
  const rolesOptions = transformToSelectOptions(roleList?.data);
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
                <BreadcrumbLink>Add New User</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Add New Admin User
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
                placeholder="Type user name"
                size={'sm'}
                defaultValue={''}
                required={'User name is required'}
              />

              <FieldInput
                type="text"
                label="First Name"
                name="first_name"
                placeholder="first name"
                size={'sm'}
                defaultValue={''}
                required={'First name is required'}
              />

              <FieldInput
                type="text"
                label="Last Name"
                name="last_name"
                placeholder="Last name"
                size={'sm'}
                defaultValue={''}
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
                defaultValue={''}
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
                required={'Password is required'}
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
                placeholder="Type phone number eg:- '0123456789"
                size={'sm'}
                defaultValue={''}
                maxLength={15}
              />
              <FieldSelect
                label="Department"
                name={'department_id'}
                placeholder="Select..."
                options={departmentOptions}
                required={'Department is required'}
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
                // onValueChange={(value) => {
                //   setSelectLrfqId(Number(value));
                // }}
                size={'sm'}
              />
            </Stack>
            {/* Button action */}
            <HStack justifyContent={'center'} mt={2}>
              <HStack spacing={2} align="center" marginTop={'1rem'}>
                <Button
                  colorScheme="green"
                  mx={'auto'}
                  mt={4}
                  type="submit"
                  isLoading={createAdminUser.isLoading}
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
            {/* End */}
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default AdminUserCreate;
