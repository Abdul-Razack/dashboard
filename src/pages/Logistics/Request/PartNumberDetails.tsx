import { useEffect, useState } from 'react';

import { Td } from '@chakra-ui/react';

import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import { useFindByPartNumberId } from '@/services/spare/services';
import { useUNDetails } from '@/services/submaster/un/services';

interface PartNumberDetailsProps {
  part_number: number;
  type?: 'goods_type' | 'un_number' | 'class' | 'msds';
}

const PartNumberDetails = ({ part_number, type }: PartNumberDetailsProps) => {
  const { data: partNumberDetails, isLoading } =
    useFindByPartNumberId(part_number);

  const [unId, setUNId] = useState<number | null>(null);
  const { data: UNDetails } = useUNDetails(unId ? unId : '', {
    enabled: unId !== null && unId !== 0,
  });

  useEffect(() => {
    if (partNumberDetails) {
      setUNId(partNumberDetails?.part_number?.un_id);
    }
  }, [partNumberDetails]);

  if (isLoading) return <Td>Loading...</Td>;

  switch (type) {
    case 'goods_type':
      return <Td>{partNumberDetails?.part_number.is_dg ? 'DG' : 'Non-DG'}</Td>;
    case 'un_number':
      return <Td>{UNDetails?.item?.name || ' - '}</Td>;
    case 'class':
      return <Td>{UNDetails?.item?.classs || ' - '}</Td>;
    case 'msds':
      return (
        <Td>
          <DocumentDownloadButton
            size={'sm'}
            url={partNumberDetails?.part_number.msds || ''}
          />
        </Td>
      );
    default:
      return <Td>{partNumberDetails?.part_number?.part_number}</Td>;
  }
};

export default PartNumberDetails;
