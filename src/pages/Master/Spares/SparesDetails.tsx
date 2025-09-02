import React, { useEffect, useState } from 'react';

import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Grid,
  GridItem,
  HStack,
  Heading,
  IconButton,
  Stack,
  Text,
} from '@chakra-ui/react';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';

import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import {
  getDisplayLabel,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { useSpareDetails } from '@/services/spare/services';
import { useHscCodeList } from '@/services/submaster/hsc-code/services';
import { useSpareModelList } from '@/services/submaster/sparemodel/services';
import { useSpareTypeList } from '@/services/submaster/sparetype/services';
import { useUNDetails } from '@/services/submaster/un/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

const SparesDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const { data: details, isLoading } = useSpareDetails(Number(id));
  const [unId, setUNId] = useState<number | null>(null);
  const { data: UNDetails } = useUNDetails(unId ? unId : '', {
    enabled: unId !== null && unId !== 0,
  });
  const spareModelList = useSpareModelList();
  const spareTypeList = useSpareTypeList();
  const uomList = useUnitOfMeasureList();
  const hscCodeList = useHscCodeList();
  const spareModelOptions = transformToSelectOptions(spareModelList.data);
  const spareTypeOptions = transformToSelectOptions(spareTypeList.data);
  const hscCodeOptions = transformToSelectOptions(hscCodeList.data);
  const uomOptions = transformToSelectOptions(uomList.data);

  useEffect(() => {
    if (details) {
      setUNId(details?.un_id);
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
                <BreadcrumbLink as={Link} to="/spares-master">
                  Spares Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Spare Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Spare Details
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/spares-master/${id}/edit`)}
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
                    label={'Part Number'}
                    value={details?.part_number || 'N/A'}
                  />
                </Stack>
                {details?.alternates && details?.alternates.length > 0 && (
                  <Box w={'100%'}>
                    <Text fontSize={'md'} fontWeight={'bold'}>
                      Alternate Part Numbers
                    </Text>
                    <Grid
                      templateColumns={{
                        sm: 'repeat(1, 1fr)',
                        md: 'repeat(2, 1fr)',
                        lg: 'repeat(4, 1fr)',
                      }}
                      gap={6}
                    >
                      {details?.alternates?.map((field, index) => {
                        return (
                          <GridItem
                            colSpan={{ sm: 1, md: 2, lg: 4 }}
                            key={index}
                          >
                            <FieldDisplay
                              value={
                                `<strong>${field?.alternate_part_number?.part_number}</strong> - ${field?.alternate_part_number?.description}` ||
                                'N/A'
                              }
                              isHtml={true}
                            />
                          </GridItem>
                        );
                      })}
                    </Grid>
                  </Box>
                )}

                <FieldDisplay
                  label="Description"
                  value={details?.description || 'N/A'}
                />

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Unit of Measure"
                    value={
                      getDisplayLabel(
                        uomOptions,
                        details?.unit_of_measure_id ?? 0,
                        'uom'
                      ) || 'N/A'
                    }
                  />
                  <FieldDisplay label="ATA" value={details?.ata || 'N/A'} />
                  <FieldDisplay
                    label="Spare Type"
                    value={
                      getDisplayLabel(
                        spareTypeOptions,
                        details?.spare_type_id ?? 0,
                        'type'
                      ) || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Spare Model"
                    value={
                      getDisplayLabel(
                        spareModelOptions,
                        details?.spare_model_id ?? 0,
                        'model'
                      ) || 'N/A'
                    }
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="HSC Code"
                    value={
                      getDisplayLabel(
                        hscCodeOptions,
                        details?.hsc_code_id ?? 0,
                        'code'
                      ) || 'N/A'
                    }
                  />

                  <FieldDisplay
                    label="Shelf Life"
                    value={details?.is_shelf_life ? 'Yes' : 'No'}
                  />
                  <FieldDisplay
                    label="Total Shelf Life"
                    value={details?.total_shelf_life || 'N/A'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="LLP"
                    value={details?.is_llp ? 'Yes' : 'No'}
                  />
                  <FieldDisplay
                    label="Type of Goods/Hazmat"
                    value={details?.is_dg ? 'Yes' : 'No'}
                  />
                  {UNDetails?.item && (
                    <React.Fragment>
                      <FieldDisplay
                        label="UN"
                        value={UNDetails?.item?.name || 'N/A'}
                      />

                      <FieldDisplay
                        label="Class"
                        value={UNDetails?.item?.classs || 'N/A'}
                      />
                    </React.Fragment>
                  )}
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <Box w={'100%'} mt={2}>
                    <Text fontSize={'md'} fontWeight={'bold'} mb={1}>
                      MSDS
                    </Text>
                    <DocumentDownloadButton
                      url={details?.msds || ''}
                      size={'sm'}
                    />
                  </Box>
                  <Box w={'100%'} mt={2}>
                    <Text fontSize={'md'} fontWeight={'bold'} mb={1}>
                      IPC Reference
                    </Text>
                    <DocumentDownloadButton
                      url={details?.ipc_ref || ''}
                      size={'sm'}
                    />
                  </Box>

                  <Box w={'100%'} mt={2}>
                    <Text fontSize={'md'} fontWeight={'bold'} mb={1}>
                      Picture
                    </Text>
                    <DocumentDownloadButton
                      url={details?.picture || ''}
                      size={'sm'}
                    />
                  </Box>
                  <Box w={'100%'} mt={2}>
                    <Text fontSize={'md'} fontWeight={'bold'} mb={1}>
                      X-Ref
                    </Text>
                    <DocumentDownloadButton
                      url={details?.xref || ''}
                      size={'sm'}
                    />
                  </Box>
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Remarks"
                    value={details?.remarks || 'N/A'}
                  />
                </Stack>
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default SparesDetails;
