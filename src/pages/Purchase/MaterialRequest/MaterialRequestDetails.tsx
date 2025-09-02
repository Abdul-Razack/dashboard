import { useState } from 'react';

import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  HStack,
  Heading,
  IconButton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import { HiArrowNarrowLeft, HiClipboardList } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PreviewPopup } from '@/components/PreviewContents/Purchase/MaterialRequest';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { transformToSelectOptions, getPRTypeLabel } from '@/helpers/commonHelper';
import { usePRDetails } from '@/services/purchase/purchase-request/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

import PartDetails from '../Quotation/PartDetails';

const PurchaseRequestDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();

  const uomList = useUnitOfMeasureList();
  const conditionList = useConditionList();
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>([]);
  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  const handleOpenPreview = () => {
    let popupVariables: any = {};
    let PODetails: any = details?.data;
    popupVariables.conditionOptions = transformToSelectOptions(
      conditionList?.data
    );
    popupVariables.uomOptions = transformToSelectOptions(uomList?.data);
    Object.keys(PODetails).forEach(function (key) {
      popupVariables[key] = PODetails[key];
    });
    popupVariables['remarks'] = PODetails.remark;
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
  };

  const { data: details, isLoading } = usePRDetails(Number(id));
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
                <BreadcrumbLink as={Link} to="/purchase/purchase-request">
                  Material Request List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Material Request Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Material Request Details
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/purchase/purchase-request/${id}/edit`)}
            />
            <ResponsiveIconButton
              colorScheme="green"
              aria-label="View Logs"
              icon={<HiClipboardList />}
              size="sm"
              onClick={() => navigate(`/purchase/purchase-request/${id}/logs`)}
            > Logs </ResponsiveIconButton>

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
                    label="User"
                    value={details?.data?.user.username || 'N/A'}
                  />
                  <FieldDisplay
                    label="MR Type"
                    value={getPRTypeLabel(details?.data?.type || '')}
                  />

                  <FieldDisplay
                    label="Priority"
                    value={details?.data?.priority.name || 'N/A'}
                  />
                  <FieldDisplay
                    label="Due Date"
                    value={details?.data?.due_date || 'N/A'}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Remarks"
                    value={details?.data?.remark || 'N/A'}
                    isHtml={true}
                  />
                </Stack>
                <Stack>
                  <HStack justify={'space-between'}>
                    <Text fontSize="md" fontWeight="700">
                      Items
                    </Text>
                  </HStack>
                  {details?.data?.items && details?.data?.items.length > 0 && (
                    <TableContainer rounded={'md'} overflow={'auto'} border="1px" borderColor="gray.500" borderRadius="md" boxShadow="md">
                      <Table variant="striped" size={'sm'}>
                        <Thead bg={'gray.500'}>
                          <Tr>
                            <Th color={'white'}>S.NO</Th>
                            <Th color={'white'}>Part Number</Th>
                            <Th color={'white'}>Description</Th>
                            <Th color={'white'}>Condition</Th>
                            <Th color={'white'}>Quantity</Th>
                            <Th color={'white'}>UOM</Th>
                            <Th color={'white'}>Remarks</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {details?.data?.items.map((item, index) => (
                            <Tr key={item.id}>
                              <Td>{index + 1}</Td>
                              <PartDetails partNumber={item.part_number_id} />
                              <Td>
                                {conditionList.data?.items[item.condition_id] ||
                                  'N/A'}
                              </Td>
                              <Td>{item.qty}</Td>
                              <Td>
                                {uomList.data?.items[item.unit_of_measure_id] ||
                                  'N/A'}
                              </Td>
                              <Td>{item.remark || ' - '}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
                </Stack>
              </Stack>

              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify={'center'}
                alignItems={'center'}
                display={'flex'}
                mt={4}
              >
                <Button colorScheme="brand" onClick={() => navigate(-1)}>
                  Back
                </Button>
                <Button onClick={() => handleOpenPreview()} colorScheme="green">
                  Preview
                </Button>
              </Stack>
            </Stack>
          </LoadingOverlay>
        </Box>

        <PreviewPopup
          isOpen={isPreviewModalOpen}
          onClose={handleCloseModal}
          data={previewData}
        ></PreviewPopup>
      </Stack>
    </SlideIn>
  );
};

export default PurchaseRequestDetails;
