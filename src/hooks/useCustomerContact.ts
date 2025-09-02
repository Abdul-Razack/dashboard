import { useEffect, useState } from 'react';

import { useCustomerDetails } from '@/services/master/services';

function useCustomerContact(customerId: number): string {
  const [customerContact, setCustomerContact] = useState('');
  const customerDetails = useCustomerDetails(customerId);

  useEffect(() => {
    if (customerDetails.isLoading) {
      return setCustomerContact('Loading...');
    }

    setCustomerContact(
      customerDetails.data?.data?.contact_type?.name ?? 'Contact type not available'
    );
  }, [customerDetails]);

  return customerContact;
}

export default useCustomerContact;
