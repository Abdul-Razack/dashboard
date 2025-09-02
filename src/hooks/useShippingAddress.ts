import { useEffect, useState } from 'react';

import { useShippingAddressDetails } from '@/services/master/shipping/services';

function useShippingAddress(addressId: number): string {
  const [shippingAddress, setShippingAddress] = useState('');
  const shippingAddressDetails = useShippingAddressDetails(addressId);

  useEffect(() => {
    if (shippingAddressDetails.isLoading) {
      return setShippingAddress('Loading...');
    }

    setShippingAddress(
      shippingAddressDetails.data?.address ?? 'Address not available'
    );
  }, [shippingAddressDetails]);

  return shippingAddress;
}

export default useShippingAddress;
