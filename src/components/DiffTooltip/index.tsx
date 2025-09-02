import React from 'react';
import { Text , Tooltip } from '@chakra-ui/react';

interface DynamicTooltipProps {
    label: string;
}

export const DiffTooltip: React.FC<DynamicTooltipProps> = ({label}) => {
  return (
    <Tooltip label={label} hasArrow placement="top">
      <Text as="span" color="red.500" marginLeft="1">
      ✱
      </Text>
    </Tooltip>
  );
};

export default DiffTooltip;
