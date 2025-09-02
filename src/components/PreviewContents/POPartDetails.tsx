import { useEffect, useState } from 'react';
import { Text } from '@chakra-ui/react';
import { useFindByPartNumberId } from '@/services/spare/services';
import { useHscCodeDetails } from '@/services/submaster/hsc-code/services';

interface POPartDetailsProps {
  partNumber: number;
  note?: string;
  showHSC?: boolean;
}

const POPartDetails = ({ partNumber, note, showHSC = true }: POPartDetailsProps) => {
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

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error!</Text>;
  
  return (
    <>
      <Text>{data?.part_number.part_number}</Text>
      <Text>{data?.part_number.description}</Text>
      {note && (
        <Text>
          <Text as="span" fontWeight={'bold'}>Note: </Text>
          {note}
        </Text>
      )}
      {showHSC && HSCCodeDetails?.item?.name && (
        <Text>
          <Text as="span" fontWeight={'bold'}>HSC Code: </Text>
          {HSCCodeDetails?.item?.name}
        </Text>
      )}
    </>
  );
};

export default POPartDetails;