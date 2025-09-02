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
  Text,
} from '@chakra-ui/react';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';

import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useGRNDetails } from '@/services/inward/grn/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

const GRNDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();

  const { data: details, isLoading } = useGRNDetails(Number(id));
  const conditionList = useConditionList();
  const uomList = useUnitOfMeasureList();

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
                <BreadcrumbLink as={Link} to="/purchase/stf">
                  GRN List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>GRN Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              GRN Details
            </Heading>
          </Stack>

          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/inward/grn/${id}/edit`)}
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
                <Stack
                  spacing={4}
                  p={4}
                  bg={'white'}
                  borderRadius={'md'}
                  boxShadow={'md'}
                  borderWidth={1}
                  borderColor={'gray.200'}
                >
                  <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                    <FieldDisplay
                      label={'GRN No'}
                      value={details?.grn.id || 'N/A'}
                    />
                    <FieldDisplay
                      label="STF ID"
                      value={details?.grn.stf_id || 'N/A'}
                    />
                  </Stack>
                </Stack>

                <Stack
                  spacing={4}
                  p={4}
                  bg={'white'}
                  borderRadius={'md'}
                  boxShadow={'md'}
                  borderWidth={1}
                  borderColor={'gray.200'}
                >
                  {details?.grn.items &&
                    details?.grn.items.length > 0 &&
                    details.grn.items.map((entry, index) => (
                      <Stack key={index}>
                        <Text
                          fontSize={'medium'}
                          bg={'gray.100'}
                          p={2}
                          borderRadius={'md'}
                        >
                          Item {index + 1}.
                        </Text>
                        <Stack
                          spacing={8}
                          direction={{ base: 'column', md: 'row' }}
                        >
                          <FieldDisplay
                            label="Quarantine"
                            value={entry.is_quarantine ? 'Yes' : 'No'}
                          />
                          <FieldDisplay
                            label="Serialized"
                            value={entry.is_serialized ? 'Yes' : 'No'}
                          />
                          <FieldDisplay
                            label="Package No"
                            value={entry.package_no || 'N/A'}
                          />
                          <FieldDisplay
                            label="Part Number ID"
                            value={entry.part_number_id || 'N/A'}
                          />
                        </Stack>

                        <Stack
                          spacing={8}
                          direction={{ base: 'column', md: 'row' }}
                        >
                          <FieldDisplay
                            label="Condition"
                            value={
                              conditionList.data?.items[entry.condition_id] ||
                              'N/A'
                            }
                          />
                          <FieldDisplay
                            label="Quantity"
                            value={entry.qty || 'N/A'}
                          />
                          <FieldDisplay
                            label="UoM"
                            value={
                              uomList.data?.items[entry.unit_of_measure_id] ||
                              'N/A'
                            }
                          />
                        </Stack>

                        <Stack
                          spacing={8}
                          direction={{ base: 'column', md: 'row' }}
                        >
                          <FieldDisplay
                            label="Ship Qty"
                            value={entry.ship_qty || 'N/A'}
                          />
                          <FieldDisplay
                            label="Ship UoM"
                            value={
                              uomList.data?.items[
                                entry.ship_unit_of_measure_id
                              ] || 'N/A'
                            }
                          />
                        </Stack>

                        <FieldDisplay
                          label="Remark"
                          value={entry.remark || 'N/A'}
                        />
                      </Stack>
                    ))}
                </Stack>
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default GRNDetails;
