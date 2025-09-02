import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Heading,
  IconButton,
  Stack
} from '@chakra-ui/react';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';

import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useAdminUserDetails } from '@/services/adminuser/services';
import { useProfileInfo } from '@/services/profile/services';
import { useGetAssignMenu } from '@/services/menu/services';
import NestedCheckboxes from './NestedCheckboxes';

export const AdminUserDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();

  const { data: details, isLoading } = useAdminUserDetails(Number(id));
  const { data } = useProfileInfo();
  const userInfo = data?.data?.menu || [];

  const menuData = useGetAssignMenu({user_id: Number(id)});
  const menuInfo = menuData?.data?.menus || [];

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
                  Admin User Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Admin User Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Admin User Details
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/admin-users/${id}/edit`)}
            />
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
        </HStack>
        <Box borderRadius={4}>
          <LoadingOverlay isLoading={isLoading}>
            <Stack
              spacing={2}
              p={4}
              bg={'white'}
              borderRadius={'md'}
              boxShadow={'lg'}
              minH={'70vh'}
            >
              <Stack spacing={4}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label={'User Name'}
                    value={details?.data?.username || 'N/A'}
                    size={'sm'}
                  />
                  <FieldDisplay
                    label={'First Name'}
                    value={details?.data?.first_name || 'N/A'}
                    size={'sm'}
                  />
                  <FieldDisplay
                    label={'Last Name'}
                    value={details?.data?.last_name || 'N/A'}
                    size={'sm'}
                  />
                  <FieldDisplay
                    label={'Email'}
                    value={details?.data?.email || 'N/A'}
                    size={'sm'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay label="Phone Number" value={details?.data?.phone || 'N/A'}
                  size={'sm'} />
                  <FieldDisplay label="Role" value={details?.data?.role?.name || 'N/A'}
                  size={'sm'} />
                  <FieldDisplay
                    label="Department"
                    value={details?.data?.department?.name || 'N/A'}
                    size={'sm'}
                  />
                </Stack>
              </Stack>
              {/* Details of menu */}
                <Stack spacing={4} marginTop={'1rem'} bg={'blue.100'} p={'1rem'} borderRadius={'0.5rem'}>
                  <NestedCheckboxes data={userInfo} user_id={Number(id)} menu_ids={menuInfo} />
                </Stack> 
              {/* End */}
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default AdminUserDetails;
