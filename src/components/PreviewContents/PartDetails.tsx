import { Text } from '@chakra-ui/react';
import { useFindByPartNumberId } from '@/services/spare/services';

const PartDetails = ({ partNumber, field }: { partNumber: number, field: string }) => {
  const { data, isLoading, error } = useFindByPartNumberId(partNumber);
  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error!</Text>;
  return (
    <>
      <Text>{field ? (field === 'part_number' ? data?.part_number.part_number : data?.part_number?.description) :  data?.part_number?.description}</Text>
    </>
  );
};

export default PartDetails;
