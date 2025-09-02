import React from 'react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';

interface PageLimitProps {
  loading?: boolean;
  changeLimit: (limit: number) => void;
  currentLimit: number; // Add currentLimit to props
}

export const PageLimit: React.FC<PageLimitProps> = ({
  loading,
  changeLimit,
  currentLimit,
}) => {
  const limits: number[] = [10, 25, 50, 100];
  
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<Box ml={3} as={ChevronDownIcon} />}
        size="sm"
        variant="ghost"
        maxW="130px"
        minW="130px"
        ml={2}
        color={'#0C2556'}
        isDisabled={loading}
      >
        {currentLimit} {/* Display the current limit */}
      </MenuButton>
      <MenuList
        width="130px"
        maxW="130px"
        minW="130px"
        boxShadow="md"
        sx={{ overflow: 'hidden', padding: '4px' }}
      >
        {limits.map((limit: number) => (
          <MenuItem
            key={limit}
            onClick={() => changeLimit(limit)}
            fontSize="sm"
            fontWeight="semibold"
          >
            {limit}
          </MenuItem>
        ))}
      </MenuList>
    </Menu>
  );
};

export default PageLimit;