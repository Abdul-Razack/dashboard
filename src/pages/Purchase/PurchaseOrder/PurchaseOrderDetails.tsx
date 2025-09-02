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
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getAPICall } from '@/services/apiService';
import { CustomerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PreviewPopup } from '@/components/PreviewContents/Purchase/PurchaseOrder';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import useContactName from '@/hooks/useContactName';
import useCustomerName from '@/hooks/useCustomerName';
import useShippingAddress from '@/hooks/useShippingAddress';
import { useContactManagerListById } from '@/services/master/contactmanager/services';
import { useCustomerSupplierList } from '@/services/master/services';
import { usePurchaseOrderDetails } from '@/services/purchase/purchase-orders/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useCurrencyList } from '@/services/submaster/currency/services';
import { useFOBList } from '@/services/submaster/fob/services';
import { usePaymentModeList } from '@/services/submaster/paymentmode/services';
import { usePaymentTermsList } from '@/services/submaster/paymentterms/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useShipAccountList } from '@/services/submaster/ship-account/services';
import { useShipModesList } from '@/services/submaster/ship-modes/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

import PartDetails from '../Quotation/PartDetails';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
: {};

const PurchaseOrderDetails = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const priorityList = usePriorityList();
  const currencyList = useCurrencyList();
  const paymentModeList = usePaymentModeList();
  const paymentTermList = usePaymentTermsList();
  const fobList = useFOBList();
  const shipTypeList = useShipTypesList();
  const shipModeList = useShipModesList();
  const shipAccountList = useShipAccountList();
  const conditionList = useConditionList();
  const uomList = useUnitOfMeasureList();
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [customerDetails, setCustomerDetails] = useState<any>({});
  const [previewData, setPreviewData] = useState<any>([]);
  const [customerId, setCustomerId] = useState<any>(0);
  const [fullContactAddress, setFullContactAddress] = useState('');
  
  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  const customerListSupplier = useCustomerSupplierList({
    type: 'customers',
  });

  const shipAccountOptions = transformToSelectOptions(shipAccountList.data);
  const shipToOptions =
    customerListSupplier.data?.data.map((customer) => ({
      value: customer.id,
      label: customer.business_name,
    })) || [];

  const {
    data: details,
    isLoading,
    isSuccess,
  } = usePurchaseOrderDetails(Number(id));
  const contactList = useContactManagerListById(customerId);
  const contactOptions = transformToSelectOptions(contactList.data);

  const getCustomerInfo = async (customerId: any) => {
    setCustomerId(customerId);
    if(customerId > 0){
      try {
        const response = await getAPICall(endPoints.info.customer.replace(':id', customerId),
          CustomerInfoSchema
        );
        setLoading(false);
        setCustomerDetails(response);
      } catch (err) {
        setLoading(false);
        console.log(err);
      }
    }else{
      setLoading(false);
    }
    
  }

  //console.log(details);

  const handleOpenPreview = () => {
    console.log(customerDetails)
    let popupVariables: any = {};
    let PODetails: any = details?.data;
    console.log(PODetails);
    popupVariables.conditionOptions = transformToSelectOptions(
      conditionList?.data
    );
    popupVariables.contactAddress = fullContactAddress;
    popupVariables.related_quotation_id = PODetails.quotation_ids;
    popupVariables.vendor_name = customerDetails?.business_name;
    popupVariables.vendor_code = customerDetails?.code;
    popupVariables.uomOptions = transformToSelectOptions(uomList?.data);
    popupVariables.shipToOptions = shipToOptions;
    popupVariables.currencyOptions = transformToSelectOptions(
      currencyList?.data
    );
    popupVariables.paymentModeOptions = transformToSelectOptions(
      paymentModeList?.data
    );
    popupVariables.paymentTermOptions = transformToSelectOptions(
      paymentTermList?.data
    );
    popupVariables.fobOptions = transformToSelectOptions(fobList?.data);
    popupVariables.shipTypeOptions = transformToSelectOptions(
      shipTypeList?.data
    );
    popupVariables.shipModeOptions = transformToSelectOptions(
      shipModeList?.data
    );
    popupVariables.shippingOptions = transformToSelectOptions(
      shipAccountList?.data
    );
    popupVariables.priorityOptions = transformToSelectOptions(
      priorityList?.data
    );
    popupVariables.shipAccountOptions = shipAccountOptions;
    popupVariables.contactOptions = contactOptions;
    Object.keys(PODetails).forEach(function (key) {
      popupVariables[key] = PODetails[key];
    });
    popupVariables['remarks'] = PODetails.remark;
    console.log(popupVariables);
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
  };

  useEffect(() => {
    if (isSuccess && details && details.data) {
      console.log(details.data)
      setFullContactAddress(
        `${details.data?.customer_contact_manager.address}, ${details.data?.customer_contact_manager.city}, ${details.data?.customer_contact_manager.state}, ${details.data?.customer_contact_manager.country}`
      );
      getCustomerInfo(details?.data?.customer_id ?? 0);
    }
  }, [isSuccess, details]);

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
                <BreadcrumbLink as={Link} to="/purchase/purchase-order">
                  Purchase Order List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Purchase Order Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Purchase Order Details
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/purchase/purchase-order/${id}/edit`)}
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
                    label={'Purchase Order'}
                    value={details?.data.id || 'N/A'}
                  />
                  <FieldDisplay
                    label={'Contact'}
                    value={
                      useContactName(
                        details?.data.customer_contact_manager_id || 0
                      ) || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Priority"
                    value={
                      priorityList.data?.items[
                        details?.data?.priority_id || 0
                      ] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Currency"
                    value={
                      currencyList.data?.items[
                        details?.data.currency_id || 0
                      ] || 'N/A'
                    }
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Vendor"
                    value={
                      useCustomerName(details?.data.ship_customer_id || 0) ||
                      'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Shipping Address"
                    value={
                      useShippingAddress(
                        details?.data.ship_customer_shipping_address_id || 0
                      ) || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Payment Mode"
                    value={
                      paymentModeList.data?.items[
                        details?.data.payment_mode_id || 0
                      ] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Payment Terms"
                    value={
                      paymentTermList.data?.items[
                        details?.data.payment_term_id || 0
                      ] || 'N/A'
                    }
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="FOB"
                    value={
                      fobList.data?.items[details?.data.fob_id || 0] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Ship Type"
                    value={
                      shipTypeList.data?.items[
                        details?.data.ship_type_id || 0
                      ] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Ship Mode"
                    value={
                      shipModeList.data?.items[
                        details?.data.ship_mode_id || 0
                      ] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Ship Account"
                    value={
                      shipAccountList.data?.items[
                        details?.data.ship_account_id || 0
                      ] || 'N/A'
                    }
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Bank Charge"
                    value={details?.data.bank_charge || 'N/A'}
                  />
                  <FieldDisplay
                    label="Freight Charge"
                    value={details?.data.freight || 'N/A'}
                  />
                  <FieldDisplay
                    label="Discount"
                    value={details?.data.discount || 'N/A'}
                  />
                  <FieldDisplay
                    label="VAT"
                    value={details?.data.vat || 'N/A'}
                  />
                </Stack>

                <FieldDisplay
                  label="Remarks"
                  value={details?.data.remark || 'N/A'}
                  isHtml={true}
                />

                {/* {details?.data.items.map((item, index) => (
                  <VStack key={index} spacing={4} align="stretch">
                    <HStack
                      justify={'flex-start'}
                      bg={'gray.500'}
                      rounded={'md'}
                      mt={index == 0 ? 0 : 4}
                    >
                      <Text
                        fontSize={'md'}
                        fontWeight={'700'}
                        color={'white'}
                        paddingX={4}
                      >
                        Item {index + 1}
                      </Text>
                    </HStack>

                    <Stack
                      direction={{ base: 'column', md: 'row' }}
                      spacing={4}
                    >
                      <FieldDisplay
                        label="Part Number"
                        value={item.part_number_id || 'N/A'}
                      />
                      <FieldDisplay
                        label="Condition"
                        value={
                          conditionList.data?.items[item.condition_id] || 'N/A'
                        }
                      />
                      <FieldDisplay
                        label="Purchase Order"
                        value={item.purchase_order_id || 'N/A'}
                      />
                    </Stack>

                    <Stack
                      direction={{ base: 'column', md: 'row' }}
                      spacing={4}
                    >
                      <FieldDisplay
                        label="Unit of Measure"
                        value={
                          uomList.data?.items[item.unit_of_measure_id] || 'N/A'
                        }
                      />
                      <FieldDisplay label="Price" value={item.price || 'N/A'} />
                      <FieldDisplay label="Qty" value={item.qty || 'N/A'} />
                    </Stack>
                    <FieldDisplay label="Note" value={item.note || 'N/A'} />
                  </VStack>
                ))} */}
              </Stack>
              <Stack>
                <HStack justify={'space-between'}>
                  <Text fontSize="md" fontWeight="700">
                    Items
                  </Text>
                </HStack>
                {details?.data?.items && details?.data?.items.length > 0 && (
                  <TableContainer
                    rounded={'md'}
                    overflow={'auto'}
                    border="1px"
                    borderColor="gray.500"
                    borderRadius="md"
                    boxShadow="md"
                  >
                    <Table variant="striped" size={'sm'}>
                      <Thead bg={'gray.500'}>
                        <Tr>
                          <Th color={'white'}>S.NO</Th>
                          <Th color={'white'}>Part Number</Th>
                          <Th color={'white'}>Description</Th>
                          <Th color={'white'}>Condition</Th>
                          <Th color={'white'}>Qty</Th>
                          <Th color={'white'}>Price</Th>
                          <Th color={'white'}>Total</Th>
                          <Th color={'white'}>UOM</Th>
                          <Th color={'white'}>Remarks</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {details?.data?.items.map((item, index) => (
                          <Tr key={item.id}>
                            <Td>{index + 1}</Td>
                            <PartDetails partNumber={item.part_number_id ?? 0} />
                            <Td>
                              {conditionList.data?.items[item.condition_id ?? 0] ||
                                'N/A'}
                            </Td>
                            <Td>{item.qty}</Td>
                            <Td>{item.price}</Td>
                            <Td>{(item.price * item.qty).toFixed(2)}</Td>
                            <Td>
                              {uomList.data?.items[item.unit_of_measure_id] ||
                                'N/A'}
                            </Td>
                            <Td>{item.note || ' - '}</Td>
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

export default PurchaseOrderDetails;
