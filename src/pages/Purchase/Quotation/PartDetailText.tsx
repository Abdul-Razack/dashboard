import { useState } from 'react';

import { HStack, IconButton, Text } from '@chakra-ui/react';
import { HiClipboardList, HiOutlineInformationCircle } from 'react-icons/hi';

import { PartInfoPopup } from '@/components/Popups/PartInfo';
import { StockInfoPopup } from '@/components/Popups/StockInfo';
import { useFindByPartNumberId } from '@/services/spare/services';

type Props = {
  partNumber: number;
  field?: string;
  hidePopupButtons?: Boolean;
};

const PartDetailText = ({ partNumber, field = '', hidePopupButtons = false  }: Props) => {
  const { data, isLoading } = useFindByPartNumberId(partNumber);
  const [showPartInfo, setPartInfoPopup] = useState(false);
  const [showStockInfo, setStockInfoPopup] = useState(false);

  const handleCloseModal = () => {
    setPartInfoPopup(false);
    setStockInfoPopup(false);
  };

  if (isLoading) return <span>Loading...</span>;
  return (
    <>
      {field === 'description' && <Text>{data?.part_number?.description}</Text>}
      {field === 'part_number' ||
        (!field && (
          <HStack spacing={1} alignItems="center">
            <IconButton
              aria-label="Part Info Popup"
              icon={<HiOutlineInformationCircle />}
              variant="unstyled"
              size="xs"
              boxShadow={'none'}
              fontSize={'sm'}
              onClick={() => setPartInfoPopup(true)}
              minWidth={'auto!important'}
              display={hidePopupButtons === true ? 'none': 'block'}
            />
            <IconButton
              aria-label="Stock Info Popup"
              icon={<HiClipboardList />}
              variant="unstyled"
              size="xs"
              boxShadow={'none'}
              fontSize={'sm'}
              onClick={() => setStockInfoPopup(true)}
              minWidth={'auto!important'}
              display={hidePopupButtons === true ? 'none': 'block'}
            />
            <Text as="span" fontSize={hidePopupButtons === true ? 'sm': 'xs'}>{data?.part_number?.part_number}</Text>
          </HStack>
        ))}
      <PartInfoPopup
        isOpen={showPartInfo}
        onClose={() => {
          handleCloseModal();
        }}
        partNumber={partNumber}
      ></PartInfoPopup>

      <StockInfoPopup
        isOpen={showStockInfo}
        onClose={() => {
          handleCloseModal();
        }}
        partNumber={partNumber}
      ></StockInfoPopup>
    </>
  );
};

export default PartDetailText;
