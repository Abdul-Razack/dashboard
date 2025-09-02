import FieldDisplay from '@/components/FieldDisplay';
import { useFindByPartNumberId } from '@/services/spare/services';
import { Text } from '@chakra-ui/react';
interface PartDescriptionProps {
  partNumber: number;
  size?: 'sm' | 'md' | 'lg';
  isPlain?: boolean;
  field?: string;
}

const PartDescription = ({ partNumber, size = 'md', isPlain= false, field='' }: PartDescriptionProps) => {
  const { data, isLoading, error } = useFindByPartNumberId(partNumber);

  if (isLoading)
    return !isPlain ? <FieldDisplay label="Description" size={size} value="Loading..." /> : <Text> Loading...</Text>;
  if (error)
    return !isPlain ? <FieldDisplay label="Description" size={size} value="Error!" /> : <Text> Error!</Text>;
  return (
    !isPlain ? <FieldDisplay
      label="Description"
      size={size}
      value={data?.part_number.description || ''}
    /> : <Text as="span"> {field === '' ? data?.part_number.description : (data?.part_number.part_number ? data?.part_number.part_number :'')}</Text>
  );
};

export default PartDescription;
