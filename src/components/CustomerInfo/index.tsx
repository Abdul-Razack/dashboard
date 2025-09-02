import { Td } from '@chakra-ui/react';

import { useCustomerDetails } from '@/services/master/services';

export const CustomerInfo = ({ customerId }: { customerId: number }) => {
  const { data, isLoading, error } = useCustomerDetails(customerId);

  if (isLoading) return <Td>Loading...</Td>;
  if (error) return <Td>Error!</Td>;
  return (
    <>
      <Td>{data?.data?.business_name}</Td>
      <Td>{data?.data?.code}</Td>
    </>
  );
};

export default CustomerInfo;
