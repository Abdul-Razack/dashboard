// components/TableSearchBox.tsx
import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';

interface TableSearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: string | number;
}

export const TableSearchBox = ({
  value,
  onChange,
  placeholder = 'Search table...',
  width = '100%',
}: TableSearchBoxProps) => {
  return (
    <InputGroup width={width}>
      <InputLeftElement pointerEvents="none">
        <LuSearch color="gray.300" />
      </InputLeftElement>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        bg="white"
        borderRadius="md"
      />
    </InputGroup>
  );
};