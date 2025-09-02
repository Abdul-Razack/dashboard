import { useEffect, useState } from 'react';

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
  Tr,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { HiArrowNarrowLeft, HiEye } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';

import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PreviewPopup } from '@/components/PreviewContents/Purchase/PRFQ';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { formatFullAddress, transformToSelectOptions, getPropertyList } from '@/helpers/commonHelper';
import { getAPICall } from '@/services/apiService';
import { usePRFQDetails } from '@/services/purchase/prfq/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';
import { ContactManagerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import PartDetails from '../Quotation/PartDetails';
import { getDisplayLabel } from '@/helpers/commonHelper';

const PRFQDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [rfqDetails, setrfqDetails] = useState<any>({});
  const [rows, setRows] = useState<any>([]);
  const [items, setItems] = useState<any>([]);
  const { data: details, isLoading, isSuccess } = usePRFQDetails(Number(id));
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [previewData, setPreviewData] = useState<any>([]);
  const conditionList = useConditionList();
  const uomList = useUnitOfMeasureList();
  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(
    priorityList?.data
  );
  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  const handleOpenPreview = (forVendor: boolean, rowId: any) => {
    console.log(rfqDetails);
    let popupVariables: any = {};
    popupVariables.items = items;
    popupVariables.priority_id = rfqDetails.priority_id;
    popupVariables.need_by_date = rfqDetails.need_by_date;
    popupVariables.purchase_request_ids = rfqDetails.purchase_request_ids;
    popupVariables.conditionOptions = transformToSelectOptions(
      conditionList?.data
    );
    popupVariables.uomOptions = transformToSelectOptions(uomList?.data);
    popupVariables.priorityOptions = transformToSelectOptions(
      priorityList?.data
    );
    popupVariables.rows = rows;
    popupVariables.forVendor = forVendor;
    popupVariables.rowId = rowId;
    popupVariables.remarks = rfqDetails.remarks;
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
    console.log(popupVariables);
  };

  useEffect(() => {
    if (isSuccess && details && details.data) {
      setrfqDetails(details.data);
    }
  }, [isSuccess, details]);

  const updateContactInfo = async (rows: any) => {
    const updatedArray = await Promise.all(rows.map(async (item : any) => {
      const detailResponse = await getAPICall(
        `/customer-contact-manager/${item.customer_contact_manager_id}`,
        ContactManagerInfoSchema
      );
      return { ...item, selectedContact: detailResponse };
    }));
    setRows(updatedArray);
  }

  useEffect(() => {
    if (Object.keys(rfqDetails).length > 0) {
      let customers: any = rfqDetails.customers;
      let newRows: any = [];
      let items: any = rfqDetails.items;
      let newItems: any = [];
      items.forEach((item: any) => {
        item.purchase_request_ids = rfqDetails.purchase_request_ids;
        newItems.push(item);
      });
      setItems(newItems);
      customers.forEach((customer: any, index: number) => {
        let obj = {
          id: Number(index + 1),
          customer_id: customer.customer_id,
          purchase_request_ids: rfqDetails.purchase_request_ids,
          customer_contact_manager_id: customer.customer_contact_manager_id,
          selectedContact: null,
        };
        newRows.push(obj);
      });
      updateContactInfo(newRows);
    }
  }, [rfqDetails]);

  useEffect(() => {
    if (rows.length === details?.data?.customers.length) {
      setLoading(false);
    }
  }, [rows]);

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
                <BreadcrumbLink as={Link} to="/purchase/prfq">
                  Purchase RFQ List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Purchase RFQ Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Purchase RFQ Details
            </Heading>
          </Stack>

          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/purchase/prfq/${id}/edit`)}
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
          <LoadingOverlay isLoading={isLoading || loading}>
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
                    label="Purchase Request ID's"
                    value={getPropertyList(details?.data.purchase_requests, 'id')}
                  />
                  <FieldDisplay
                    label="Priority"
                    value={getDisplayLabel(
                      priorityOptions,
                      details?.data.priority_id
                        ? details?.data.priority_id.toString()
                        : 0,
                      'Priority'
                    ) || 'N/A'}
                  />

                  <FieldDisplay
                    label="Due Date"
                    value={
                      details?.data.need_by_date
                        ? format(
                            new Date(details?.data.need_by_date),
                            'dd-MM-yyyy'
                          )
                        : ' - '
                    }
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Remarks"
                    value={details?.data.remarks || 'N/A'}
                    isHtml={true}
                  />
                </Stack>
                <Stack>
                  <HStack justify={'space-between'}>
                    <Text fontSize="md" fontWeight="700">
                      Items
                    </Text>
                  </HStack>
                  {details?.data.items && details?.data.items.length > 0 && (
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
                          {details?.data.items.map((item, index) => (
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

                <Stack>
                  <HStack justify={'space-between'}>
                    <Text fontSize="md" fontWeight="700">
                      Customers
                    </Text>
                  </HStack>
                  {rows && rows.length > 0 && (
                    <TableContainer rounded={'md'} overflow={'auto'} border="1px" borderColor="gray.500" borderRadius="md" boxShadow="md">
                      <Table variant="striped" size={'sm'}>
                        <Thead bg={'gray.500'}>
                          <Tr>
                            <Th color={'white'}>S.No.</Th>
                            <Th color={'white'}>Vendor Name</Th>
                            <Th color={'white'}>Vendor Code</Th>
                            <Th color={'white'}>Contact</Th>
                            <Th color={'white'}>Address</Th>
                            <Th color={'white'}>Action</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {rows.map((item: any, index: number) => (
                            <Tr key={index}>
                              <Td>{index + 1}</Td>
                              <Td>
                                {item.selectedContact?.customer?.business_name}
                              </Td>
                              <Td>{item.selectedContact?.customer?.code}</Td>
                              <Td>{item.selectedContact?.attention}</Td>
                              <Td>
                                {item.selectedContact
                                  ? formatFullAddress(item.selectedContact)
                                  : ' - '}
                              </Td>
                              <Td>
                                <IconButton
                                  aria-label="View Popup"
                                  colorScheme="green"
                                  size={'sm'}
                                  icon={<HiEye />}
                                  onClick={() => handleOpenPreview(true, index)}
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  )}
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
                  <Button
                    onClick={() => handleOpenPreview(false, null)}
                    colorScheme="green"
                  >
                    Preview
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </LoadingOverlay>
          <PreviewPopup
            isOpen={isPreviewModalOpen}
            onClose={handleCloseModal}
            data={previewData}
          />
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default PRFQDetails;
