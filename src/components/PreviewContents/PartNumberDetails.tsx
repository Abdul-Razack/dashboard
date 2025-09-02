import { useEffect, useState } from 'react';

import { Text } from '@chakra-ui/react';
import { useFindByPartNumberId } from '@/services/spare/services';
import { useUNDetails } from '@/services/submaster/un/services';
interface PartNumberDetailsProps {
  part_number: number;
  type?: 'goods_type' | 'un_number' | 'class' | 'msds';
}

const PartNumberDetails = ({ part_number, type }: PartNumberDetailsProps) => {
  const { data: partNumberDetails, isLoading } = useFindByPartNumberId(part_number);

   const [unId, setUNId] = useState<number | null>(null);
    const { data: UNDetails } = useUNDetails(unId ? unId : '', {
      enabled: unId !== null && unId !== 0,
    });

      useEffect(() => {
        if (partNumberDetails) {
          setUNId(partNumberDetails?.part_number?.un_id);
        }
      }, [partNumberDetails]);

  if (isLoading) return <Text>Loading...</Text>;

  switch (type) {
    case 'goods_type':
      return <Text>{partNumberDetails?.part_number?.is_dg ? 'DG' : 'Non-DG'}</Text>;
    case 'un_number':
      return <Text>{UNDetails?.item?.name || 'NA'}</Text>;
    case 'class':
      return <Text>{UNDetails?.item?.classs || 'NA'}</Text>;
    case 'msds':
      return <Text>{partNumberDetails?.part_number?.msds || 'NA'}</Text>;
    default:
      return <Text>{partNumberDetails?.part_number?.id}</Text>;
  }
};

export default PartNumberDetails;
