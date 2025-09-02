import { useEffect, useState } from 'react';

import { Box, HStack, Stack } from '@chakra-ui/react';
import dayjs from 'dayjs';

import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { getPropertyList } from '@/helpers/commonHelper';
import { getAPICall } from '@/services/apiService';
import { CustomerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import { InfoPayload } from '@/services/apiService/Schema/STFSchema';

type ComponentProps = {
  stfId: any;
};

interface formData {
  stf_id: number;
}

export const STFInfoComponent = ({ stfId }: ComponentProps) => {
  const endPoints = import.meta.env.VITE_API_ENDPOINTS
    ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
    : {};

  const initialFormData = {
    stf_id: 0,
  };
  const [showLoader, setLoading] = useState<boolean>(false);
  const [stfInfo, setSTFInfo] = useState<TODO>({});
  const [logisticOrders, setLogisticOrders] = useState<any>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<any>([]);
  const [queryParams, setQueryParams] = useState<formData>(initialFormData);
  const [customerDetails, setCustomerDetails] = useState<TODO>({});

  const getSTFInfo = async () => {
    try {
      const data = await getAPICall(
        endPoints.others.details_by_stf,
        InfoPayload,
        queryParams
      );
      setSTFInfo(data?.data?.stf);
      setLogisticOrders(data?.data?.logistic_orders);
      setPurchaseOrders(data?.data?.purchase_orders);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  const getCustomerInfo = async (customerId: any) => {
    try {
      const response = await getAPICall(
        endPoints.info.customer.replace(':id', customerId),
        CustomerInfoSchema
      );
      setCustomerDetails(response);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
    }
  };

  useEffect(() => {
    if (stfId !== null) {
      setQueryParams((prev) => ({ ...prev, ['stf_id']: stfId }));
    }
  }, [stfId]);

  useEffect(() => {
    if (stfId) {
      setLoading(true);
      getSTFInfo();
    }
  }, [queryParams]);

  useEffect(() => {
    if (Object.keys(stfInfo).length > 0) {
      getCustomerInfo(stfInfo?.user_id);
    }
  }, [stfInfo]);

  useEffect(() => {
    if (Object.keys(customerDetails).length > 0) {
      console.log(customerDetails);
    }
  }, [customerDetails]);

  return (
    <>
      <Stack
        spacing={2}
        bg={'gray.100'}
        p={4}
        rounded={'md'}
        border={'1px solid'}
        borderColor={'gray.300'}
      >
        <LoadingOverlay isLoading={showLoader} style={{ minHeight: '20vh' }}>
          <HStack mb={2}>
            <FieldDisplay
              label="STF No"
              value={stfInfo?.sft_number ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="STF Date"
              value={
                stfInfo?.stf_date
                  ? dayjs(stfInfo?.stf_date).format('DD-MMM-YYYY')
                  : 'N/A'
              }
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="AWB Number"
              value={stfInfo?.awb_number ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="CI Number"
              value={stfInfo?.ci_number ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="CI Date"
              value={
                stfInfo?.ci_date
                  ? dayjs(stfInfo?.ci_date).format('DD-MMM-YYYY')
                  : 'N/A'
              }
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="PO No"
              value={getPropertyList(purchaseOrders, 'id')}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
          </HStack>
          <HStack mb={2}>
            <FieldDisplay
              label="LO No"
              value={getPropertyList(logisticOrders, 'id')}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="Total CI Value"
              value={stfInfo?.total_ci_value ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />

            <FieldDisplay
              label="Vendor"
              value={customerDetails?.business_name ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="Vendor Code"
              value={customerDetails?.code ?? 'N/A'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="Contact"
              value={
                customerDetails?.customer_contact_managers?.[0]?.attention ??
                'N/A'
              }
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
            <FieldDisplay
              label="No of Package"
              value={stfInfo?.packages ? stfInfo?.packages.length : '0'}
              size="sm"
              style={{ backgroundColor: '#fff' }}
            />
          </HStack>
          <HStack mb={2} spacing={4}>
            <Box width="25%">
              <FieldDisplay
                label="Shipping Address"
                value={
                  customerDetails?.customer_shipping_addresses?.[0]
                    ? `${customerDetails.customer_shipping_addresses[0].address}<br />${customerDetails.customer_shipping_addresses[0].city}<br />${customerDetails.customer_shipping_addresses[0].state}<br />${customerDetails.customer_shipping_addresses[0].zip_code}`
                    : 'N/A<br /><br /><br />'
                }
                isHtml={true}
                size="sm"
                style={{ backgroundColor: '#fff' }}
              />
            </Box>
            <Box width="25%">
              <FieldDisplay
                label="Bill To Address"
                value={
                  customerDetails?.customer_contact_managers?.[0]
                    ? `${customerDetails.customer_contact_managers[0].address}<br /> ${customerDetails.customer_contact_managers[0].city}<br /> ${customerDetails.customer_contact_managers[0].state}<br /> ${customerDetails.customer_contact_managers[0].zip_code}`: 'N/A<br /><br /><br />'
                }
                size="sm"
                isHtml={true}
                style={{ backgroundColor: '#fff' }}
              />
            </Box>
            <Box width="25%" />
            <Box width="25%" /> 
          </HStack>
        </LoadingOverlay>
      </Stack>
    </>
  );
};

export default STFInfoComponent;
