import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  HStack,
  Heading,
  IconButton,
  Stack,
} from '@chakra-ui/react';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';

import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useTraderRefDetails } from '@/services/master/tradersref/services';

const TraderReferenceDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();

  const { data: details, isLoading } = useTraderRefDetails(Number(id));
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
                <BreadcrumbLink as={Link} to="/trader-reference-master">
                  Trader Reference Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Trader Reference Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Trader Reference Details
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/trader-reference-master/${id}/edit`)}
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
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Customer Name"
                    value={details?.customer?.business_name || 'N/A'}
                  />
                  <FieldDisplay
                    label="Attention"
                    value={details?.attention || 'N/A'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Vendor Name"
                    value={details?.vendor_name || 'N/A'}
                  />
                  <FieldDisplay label="Email" value={details?.email || 'N/A'} />
                </Stack>
                <FieldDisplay
                  label="Address"
                  value={details?.address || 'N/A'}
                />
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay label="City" value={details?.city || 'N/A'} />
                  <FieldDisplay label="State" value={details?.state || 'N/A'} />
                  <FieldDisplay
                    label="Zipcode"
                    value={details?.zip_code || 'N/A'}
                  />
                  <FieldDisplay
                    label="Country"
                    value={details?.country || 'N/A'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Phone Number"
                    value={details?.phone || 'N/A'}
                  />
                  <FieldDisplay label="Fax" value={details?.fax || 'N/A'} />
                </Stack>
                <FieldDisplay
                  label="Remarks"
                  value={details?.remarks || 'N/A'}
                />
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default TraderReferenceDetails;
