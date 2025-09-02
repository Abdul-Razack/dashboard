import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Heading,
  IconButton,
  SimpleGrid,
  Stack,
} from '@chakra-ui/react';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';

import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useCustomerGroupDetails } from '@/services/master/group/services';

const CustomerGroupDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();

  const { data: details, isLoading } = useCustomerGroupDetails(Number(id));
  const customerInfo = details?.data;
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
                  Contact Group Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Contact Group Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Contact Group Details
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/customer-group-master/${id}/edit`)}
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
            >
              <Stack spacing={4}>
                {(customerInfo?.customers ?? []).length > 0 ? (
                  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
                    {customerInfo?.customers.map(
                      (
                        item: { business_name: string; code: string },
                        index: number
                      ) => (
                        <FieldDisplay
                          key={index}
                          label={`Customer ${index + 1}`}
                          value={`${item.business_name} - ${item.code}`}
                        />
                      )
                    )}
                  </SimpleGrid>
                ) : (
                  <FieldDisplay label="Customer Name" value="N/A" />
                )}
              </Stack>
              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldDisplay
                  label="Name"
                  value={customerInfo?.name || 'N/A'}
                />
                <FieldDisplay
                  label="Show all under department"
                  value={customerInfo?.department_id == null ? 'NO' : 'Yes'}
                />
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default CustomerGroupDetails;
