import { Box, Text } from '@chakra-ui/react';
import { DiffTooltip } from '@/components/DiffTooltip';
import { ReactNode } from 'react';
type FieldDisplayProps = {
  label?: string;
  value: string | number | undefined;
  size?: 'sm' | 'md' | 'lg';
  style?: any;
  isHtml?: boolean;
  showTooltip?: boolean;
  tooltipContent?: string;
  leftElement?: ReactNode;
};

const FieldDisplay = ({ label, value, size = 'md', style = {}, isHtml = false, showTooltip = false, tooltipContent = '' , leftElement}: FieldDisplayProps) => {
  // Convert the value to a string and handle NaN and undefined
  const displayValue =
    typeof value === 'number' && isNaN(value)
      ? 'N/A'
      : value === undefined
        ? 'N/A'
        : typeof value === 'number'
          ? value.toString()
          : value;

  return (
    <Box w={'100%'}>
      <Text fontSize={size} fontWeight={size === 'sm' ? 'medium' : 'bold'} mb={2}>
        {label}{showTooltip === true ? <DiffTooltip label={tooltipContent} /> : ''}
      </Text>
      <Box
        px={2}
        py={size === 'sm' ? 1 : 2}
        bg="gray.100"
        borderRadius="md"
        sx={{
          border: '1px solid #E2E8F0',
        }}
        style={style}
      >
        {isHtml === true && ( <Text fontSize={size} dangerouslySetInnerHTML={{__html: displayValue}}></Text>)}
        {isHtml === false && ( <Text fontSize={size}>{leftElement ? leftElement: ''} {displayValue}</Text>)}
      </Box>
    </Box>
  );
};

export default FieldDisplay;
