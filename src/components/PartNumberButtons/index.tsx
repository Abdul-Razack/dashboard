import { useState } from 'react';
import { IconButton, Text, HStack } from '@chakra-ui/react';
import { HiClipboardList, HiOutlineInformationCircle } from 'react-icons/hi';
import { PartInfoPopup } from '@/components/Popups/PartInfo';
import { StockInfoPopup } from '@/components/Popups/StockInfo';

type Props = {
  partNumber?: any;
  partName?: string;
  showStock?: boolean;
};

export const PartNumberButtons = ({ partNumber, partName = '', showStock=true }: Props) => {
  const [showPartInfo, setPartInfoPopup] = useState(false);
  const [showStockInfo, setStockInfoPopup] = useState(false);

  const handleCloseModal = () => {
    setPartInfoPopup(false);
    setStockInfoPopup(false);
  };

  return (
    <>
      <HStack spacing={2} align="center">
        <IconButton
          aria-label="Part Info Popup"
          color={'black'}
          variant="unstyled"
          boxShadow={'none'}
          minWidth={'auto'}
          size={'sm'}
          background={'transparent !important'}
          border={'none'}
          icon={<HiOutlineInformationCircle />}
          onClick={() => {
            setPartInfoPopup(true);
          }}
          isDisabled={!partNumber}
          _disabled={{
            background: "transparent",
            border: "none",
            opacity: 0.4,
            cursor: "not-allowed",
          }}
        />
        {showStock === true && (
        <IconButton
          aria-label="Stock Info Popup"
          color={'black'}
          variant="unstyled"
          boxShadow={'none'}
          minWidth={'auto'}
          background={'transparent'}
          border={'none'}
          size={'sm'}
          icon={<HiClipboardList />}
          onClick={() => {
            setStockInfoPopup(true);
          }}
          isDisabled={!partNumber}
          _disabled={{
            background: "transparent",
            border: "none",
            opacity: 0.4,
            cursor: "not-allowed",
          }}
        />)}
        {partName && (
          <Text as={'span'} whiteSpace="nowrap" fontWeight={'bold'}>
            {partName}
          </Text>
        )}
      </HStack>
      <PartInfoPopup
        isOpen={showPartInfo}
        onClose={() => {
          handleCloseModal();
        }}
        partNumber={partNumber}
      />
      <StockInfoPopup
        isOpen={showStockInfo}
        onClose={() => {
          handleCloseModal();
        }}
        partNumber={partNumber}
      />
    </>
  );
};

export default PartNumberButtons;