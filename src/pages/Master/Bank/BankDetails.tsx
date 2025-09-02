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
import { useBankDetails } from '@/services/master/bank/services';

const BankDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();

  const { data: details, isLoading } = useBankDetails(Number(id));
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
                <BreadcrumbLink>Bank Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Bank Details
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/bank-master/${id}/edit`)}
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
                    label="Beneficiary Name"
                    value={details?.beneficiary_name || 'N/A'}
                  />
                  <FieldDisplay
                    label="Bank Name"
                    value={details?.bank_name || 'N/A'}
                  />
                </Stack>
                <FieldDisplay
                  label="Bank Address"
                  value={details?.bank_address || 'N/A'}
                />
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Bank Branch"
                    value={details?.bank_branch || 'N/A'}
                  />
                  <FieldDisplay
                    label="Bank AC/IBAN Number"
                    value={details?.bank_ac_iban_no || 'N/A'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Type of Account"
                    value={details?.customer?.type_of_ac || 'N/A'}
                  />
                  <FieldDisplay
                    label="Bank Swift Code"
                    value={details?.bank_swift || 'N/A'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="ABA Routing Number"
                    value={details?.aba_routing_no || 'N/A'}
                  />
                  <FieldDisplay
                    label="Contact Name"
                    value={details?.contact_name || 'N/A'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Bank Phone"
                    value={details?.bank_phone || 'N/A'}
                  />
                  <FieldDisplay
                    label="Bank Fax"
                    value={details?.bank_fax || 'N/A'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Bank Mobile"
                    value={details?.bank_mobile || 'N/A'}
                  />
                  <FieldDisplay
                    label="Bank Email"
                    value={details?.bank_email || 'N/A'}
                  />
                </Stack>
                {/* <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Mode of Payment"
                    value={details?.payment_mode?.name || 'N/A'}
                  />
                  <FieldDisplay
                    label="Payment Terms"
                    value={details?.payment_term?.name || 'N/A'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Total Credit Amount"
                    value={details?.total_credit_amount || 'N/A'}
                  />
                  <FieldDisplay
                    label="Total Credit Period (Days)"
                    value={details?.total_credit_period || 'N/A'}
                  />
                </Stack> */}
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default BankDetails;
