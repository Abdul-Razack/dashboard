import { useEffect, useState } from 'react';

import { useCustomerDetails } from '@/services/master/services';

function useCustomerName(customerId: number): string {
  const [customerName, setCustomerName] = useState('');
  const customerDetails = useCustomerDetails(customerId);

  useEffect(() => {
    if (customerDetails.isLoading) {
      return setCustomerName('Loading...');
    }

    setCustomerName(
      customerDetails.data?.data?.business_name ?? 'Name not available'
    );
  }, [customerDetails]);

  return customerName;
}

export default useCustomerName;
