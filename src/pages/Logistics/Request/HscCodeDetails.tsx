import React, { useEffect, useState } from 'react';
import { Td } from '@chakra-ui/react';
import { useFindByPartNumberId } from '@/services/spare/services';
import { useHscCodeDetails } from '@/services/submaster/hsc-code/services';

interface HscCodeDetailsProps {
  partNumber: number;
}

const HscCodeDetails: React.FC<HscCodeDetailsProps> = ({ partNumber }) => {
  const { data, isLoading, error } = useFindByPartNumberId(partNumber);
 
   const [hscId, setHSCId] = useState<number | null>(null);
   const { data: HSCCodeDetails } = useHscCodeDetails(hscId ? hscId : '', {
     enabled: hscId !== null && hscId !== 0,
   });
 
   useEffect(() => {
     if (data) {
       setHSCId(data?.part_number?.hsc_code_id);
     }
   }, [data]);

  if (isLoading) {
    return <Td>Loading...</Td>;
  }
  if (error) {
    return <Td>Error!</Td>;
  }

  return <Td>{HSCCodeDetails?.item?.name || 'N/A'}</Td>;
};

export default HscCodeDetails;
