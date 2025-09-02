// Assuming usePRFQDetails is a hook you've already implemented
import { useEffect, useState } from 'react';

import { format } from 'date-fns';

import { usePRFQDetails } from '@/services/purchase/prfq/services';

// Custom hook to get the formatted date
function useFormattedRFQDate(rfqId: number): string {
  const [formattedDate, setFormattedDate] = useState<string>('Loading...');
  const rfqDetails = usePRFQDetails(rfqId);

  useEffect(() => {
    const rfqDate = rfqDetails.data?.data?.created_at;
    if (rfqDate) {
      const date = new Date(rfqDate);
      const formatted = format(date, 'dd/MM/yy');
      setFormattedDate(formatted);
    }
  }, [rfqDetails]);

  return formattedDate;
}

export default useFormattedRFQDate;
