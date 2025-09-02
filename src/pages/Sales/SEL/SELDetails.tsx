import { useEffect, useState } from 'react';
import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import FieldDisplay from '@/components/FieldDisplay';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
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
  Tooltip,
  Tr,
  Box
} from '@chakra-ui/react';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { UseQueryResult } from 'react-query';

import LoadingOverlay from '@/components/LoadingOverlay';
import { PartNumberButtons } from '@/components/PartNumberButtons';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';

import { useSelDetails } from '@/services/sales/sel/services';
import { useSearchPartNumber } from '@/services/spare/services';
import { useCustomerList, useCustomerListCode } from '@/services/master/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { usePaymentModeList } from '@/services/submaster/paymentmode/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useFOBList } from '@/services/submaster/fob/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';
import { useModeOfReceiptList } from '@/services/submaster/mode-of-receipt/services';

import DescriptionCell from './DescriptionCell';
import { getAPICall } from '@/services/apiService';
import { CustomerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import { useContactManagerDetails, useContactManagerListById } from '@/services/master/contactmanager/services';
import { formatContactAddress, formatShippingAddress, transformToSelectOptions } from '@/helpers/commonHelper';

type QueryData = {
    status: boolean;
    items?: Record<string, string>;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

export const SELDetails = () => {

  let { id } = useParams();
  const navigate = useNavigate();
  const { data: details, isLoading } = useSelDetails(Number(id));
  const [fullContactAddress, setFullContactAddress] = useState('');
  const [fullVendorAddress, setFullVendorAddress] = useState('');
  const [customerDetails, setCustomerDetails] = useState<TODO>({});
  const [shippingOptions, setShippingOptions] = useState<TODO>([]);

  const paymentModeList: UseQueryResult<QueryData, unknown> = usePaymentModeList();
  const paymentTermsList: UseQueryResult<QueryData, unknown> = usePaymentTermsList();
  const currencyList: UseQueryResult<QueryData, unknown> = useCurrencyList();
  const fobList: UseQueryResult<QueryData, unknown> = useFOBList();
  const priorityList: UseQueryResult<QueryData, unknown> = usePriorityList();
  const customerList: UseQueryResult<QueryData, unknown> = useCustomerList({type: 'customers'});
  const customerListCode: UseQueryResult<QueryData, unknown> = useCustomerListCode();
  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const unitOfMeasureList: UseQueryResult<QueryData, unknown> = useUnitOfMeasureList();
  const receiptList: UseQueryResult<QueryData, unknown> =  useModeOfReceiptList();

  const conditionOptions = transformToSelectOptions(conditionList.data);
  const customerOptions = transformToSelectOptions(customerList.data);
  const customerCodeOptions = transformToSelectOptions(customerListCode?.data);
  const paymentModeOptions = transformToSelectOptions(paymentModeList.data);
  const paymentTermsOptions = transformToSelectOptions(paymentTermsList.data);
  const currencyOptions = transformToSelectOptions(currencyList.data);
  const fobOptions = transformToSelectOptions(fobList.data);
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const unitOfMeasureOptions = transformToSelectOptions(unitOfMeasureList.data);
  const receiptOptions = transformToSelectOptions(receiptList.data);

  
  const getLabelById = (options: any[], id: string): string => {
    return options.find((opt) => String(opt.value) === String(id))?.label || 'N/A';
  };

  const listData = useSearchPartNumber({ query: '' });
  const sparelistData = listData?.data?.part_numbers;
  const spareOptions = (sparelistData ?? []).map((spare: any) => ({
    value: spare.id.toString(),
    label: spare.part_number,
  }));

  const contactList = useContactManagerListById(details?.data?.customer_id ?? 0);
  const contactOptions = transformToSelectOptions(contactList.data);

  const contactDetails = useContactManagerDetails(details?.data?.customer_id ?? 0);

  useEffect(() => {
    if (contactDetails.data) {
      setFullContactAddress(formatContactAddress(contactDetails.data));
    } else {
      setFullContactAddress('NA');
    }
  }, [contactDetails.data]);

  const getCustomerInfo = async (customerId: any) => {
    try {
      const response = await getAPICall(
        endPoints.info.customer.replace(':id', customerId),
        CustomerInfoSchema,
      );
        setCustomerDetails(response);
       
        setShippingOptions(response?.data?.customer_shipping_addresses?.map((address: any) => ({
          value: address.id,
          label: address.attention,
        })) || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const shippingAddressInfo =
      customerDetails?.data?.customer_shipping_addresses?.find(
        (item: any) => item.id === details?.data?.customer_shipping_address_id
      );
    if (shippingAddressInfo) {
      setFullVendorAddress(formatShippingAddress(shippingAddressInfo));      
    } else {
      setFullVendorAddress('NA');
    }
  
  }, [shippingOptions]);

  useEffect(() =>{
    getCustomerInfo(details?.data?.customer_id)
  }, [details?.data])
  
  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Breadcrumb
              fontWeight="medium"
              fontSize="sm"
              separator={<ChevronRightIcon boxSize={6} color="gray.500" />}
            >
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink as={Link} to={'/sel-master'}>
                   SEL Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Details SEL</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Details SEL
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/sel-master/${id}/edit`)}
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

        <Stack
          spacing={2}
          p={4}
          bg={'white'}
          borderRadius={'md'}
          boxShadow={'md'}
        >
          <Text fontSize={'md'} fontWeight={'700'}>
             SEL
          </Text>
          <Box borderRadius={4}>
            <LoadingOverlay isLoading={isLoading}>
                <Stack spacing={2}>
                    <Stack 
                        spacing={8}
                        direction={{ base: 'column', md: 'row' }}
                        bg={'gray.100'}
                        p={4}
                        rounded={'md'}
                        border={'1px solid'}
                        borderColor={'gray.300'}
                    >
                        <FieldDisplay
                            label={'Mode of Receipt'}
                            value={getLabelById(receiptOptions, details?.data?.mode_of_receipt_id.toString() ?? '0')}
                        />
                        <FieldDisplay
                            label={'Cust RFQ NO'}
                            value={details?.data?.cust_rfq_no ?? 'N/A'}
                        />
                        <FieldDisplay
                            label="Cust RFQ Date"
                            value={details?.data?.cust_rfq_date ?? 'N/A'}

                        />
                        <FieldDisplay
                            label={'Priority'}
                            value={getLabelById(priorityOptions, details?.data?.priority_id.toString() ?? '0')}
                        />
                        <FieldDisplay
                            label="Due Date"
                            value={details?.data?.due_date ?? 'N/A'}
                        />
                    </Stack>
                    <Stack 
                        spacing={8}
                        direction={{ base: 'column', md: 'row' }}
                        bg={'gray.100'}
                        p={4}
                        rounded={'md'}
                        border={'1px solid'}
                        borderColor={'gray.300'}
                    >   
                        <FieldDisplay
                            label={'Customer Name'}
                            value={getLabelById(customerOptions, details?.data?.customer_id.toString() ?? '0')}
                        />
                        <FieldDisplay
                            label="Customer Code"
                            value={
                                customerCodeOptions?.find(item => Number(item.value) === details?.data?.customer_id)?.label || 'N/A'
                            }
                        />
                        <FieldDisplay
                            label={'Contact'}
                            value={getLabelById(contactOptions, details?.data?.customer_contact_manager_id.toString() ?? '0')}
                        />              
                        <FieldDisplay
                            label="Address"
                            value={fullContactAddress}
                            isHtml={true}
                            // style={{ backgroundColor: '#fff' }}
                        />
                        <FieldDisplay
                            label={'Shipping Contact'}
                            value={getLabelById(shippingOptions, details?.data?.customer_shipping_address_id.toString() ?? '0')}
                        />
                        <FieldDisplay
                            label="Shipping Address"
                            value={fullVendorAddress}
                            isHtml={true}
                            // style={{ backgroundColor: '#fff' }}
                        />
                    </Stack>
                    <Stack 
                        spacing={8}
                        direction={{ base: 'column', md: 'row' }}
                        bg={'gray.100'}
                        p={4}
                        rounded={'md'}
                        border={'1px solid'}
                        borderColor={'gray.300'}
                    >
                        <FieldDisplay
                            label={'Fob'}
                            value={getLabelById(fobOptions, details?.data?.fob_id.toString() ?? '0')}
                        />
                        <FieldDisplay
                            label={'Currency'}
                            value={getLabelById(currencyOptions, details?.data?.currency_id.toString() ?? '0')}
                        />
                        <FieldDisplay
                            label={'Payment Mode'}
                            value={getLabelById(paymentModeOptions, details?.data?.payment_mode_id.toString() ?? '0')}
                        />
                        <FieldDisplay
                            label={'Payment Terms'}
                            value={getLabelById(paymentTermsOptions, details?.data?.payment_terms_id.toString() ?? '0')}
                        />
                    </Stack>
                <HStack justify={'space-between'} mt={3}>
                    <Text fontSize="md" fontWeight="700">Items</Text>
                </HStack>

                <LoadingOverlay isLoading={isLoading}>
                    <TableContainer
                    rounded={'md'}
                    overflow={'auto'}
                    border="1px"
                    borderColor="gray.500"
                    borderRadius="md"
                    boxShadow="md"
                    >
                    <Table variant="simple" size={'sm'}>
                        <Thead bg={'gray'}>
                        <Tr>
                            <Th color={'white'}>S.No.</Th>
                            <Th color={'white'}>Part Number</Th>
                            <Th color={'white'}>Description</Th>
                            <Th color={'white'}>Condition</Th>
                            <Th color={'white'}>Quantity</Th>
                            <Th color={'white'}>UOM</Th>
                            <Th color={'white'}>Remarks</Th>
                        </Tr>
                        </Thead>
                        <Tbody>
                        {details?.data?.items.map((row, index) => (
                            <Tr
                            key={row.id}
                            // background={
                            //     row?.is_duplicate === true ? 'yellow' : ''
                            // }
                            >
                            <Td>
                                <Text fontSize={'medium'}>{index + 1}.</Text>
                            </Td>
                            <Td>
                                <Stack direction={{ base: 'column', md: 'row' }}>
                                <PartNumberButtons
                                    partNumber={row?.part_number_id}
                                />
                                <FieldDisplay
                                    value={getLabelById(spareOptions, row?.part_number_id.toString() ?? '0')}
                                    size='sm'
                                    style={{
                                    width: 'auto',
                                    minWidth: 160,
                                    maxWidth: 'auto',
                                    }}
                                />
                                </Stack>
                            </Td>
                            <Td>
                                <DescriptionCell partNumberId={row?.part_number_id} />
                            </Td>
                            <Td>
                                <FieldDisplay
                                   value={getLabelById(conditionOptions, row?.condition_id.toString() ?? '0')}
                                   size='sm'
                                />
                            </Td>
                            <Td>
                                <FieldDisplay
                                   value={row?.qty}
                                   size='sm'
                                />
                            </Td>
                            <Td>
                                <FieldDisplay
                                   value={getLabelById(unitOfMeasureOptions, row?.unit_of_measure_id.toString() ?? '0')}
                                   size='sm'
                                />
                            </Td>
                            <Tooltip
                                label={row?.remark}
                                aria-label="Username tooltip"
                                placement="top"
                                hasArrow
                                color="white"
                            >
                                <Td>
                                <FieldDisplay
                                //    conditionOptions
                                   value={row?.remark}
                                   size='sm'
                                />
                                </Td>
                            </Tooltip>
                            </Tr>
                        ))}
                        </Tbody>
                    </Table>
                    </TableContainer>
                </LoadingOverlay>

                <HStack mt={3}>
                    <Text marginEnd={3}>
                    Total Qty:
                    <Text as="span" marginStart={3} fontWeight={'bold'}>
                        {details?.data?.items
                        .map((row) => row?.qty ?? 0)
                        .reduce((acc, curr) => Number(acc) + Number(curr), 0)}
                    </Text>
                    </Text>

                    <Text marginStart={3}>
                    Total Line Items:
                    <Text as="span" marginStart={3} fontWeight={'bold'}>
                        {details?.data?.items.length}
                    </Text>
                    </Text>
                </HStack>

                <Stack>
                    <FieldDisplay
                        label={'Remarks'}
                        value={details?.data?.remarks ?? 'N/A'}
                    />
                </Stack>
            </Stack>
            </LoadingOverlay>
          </Box>  
        </Stack>
      </Stack>
    </SlideIn>
  );
};
