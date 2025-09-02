import { useState } from 'react';
import { IconButton, Td } from '@chakra-ui/react';
import { HiClipboardList, HiOutlineInformationCircle } from 'react-icons/hi';
import { PartInfoPopup } from '@/components/Popups/PartInfo';
import { StockInfoPopup } from '@/components/Popups/StockInfo';
import { useFindByPartNumberId } from '@/services/spare/services';

const PartDetails = ({ partNumber }: { partNumber: number }) => {
  const { data, isLoading, error } = useFindByPartNumberId(partNumber);
  const [showPartInfo, setPartInfoPopup] = useState(false);
  const [showStockInfo, setStockInfoPopup] = useState(false);

  const handleCloseModal = () => {
    setPartInfoPopup(false);
    setStockInfoPopup(false);
  };
  if (isLoading) return <Td>Loading...</Td>;
  if (error) return <Td>Error!</Td>;
  return (
    <>
      <Td>
        <IconButton
          aria-label="Part Info Popup"
          backgroundColor={'white'}
          _hover={{
            bg: 'black',
            color: 'white',
          }}
          color={'black'}
          variant="solid"
          size={'xs'}
          icon={<HiOutlineInformationCircle />}
          mr={1}
          onClick={() => {
            setPartInfoPopup(true);
          }}
        />
        <IconButton
          aria-label="Stock Info Popup"
          backgroundColor={'white'}
          _hover={{
            bg: 'black',
            color: 'white',
          }}
          color={'black'}
          variant="solid"
          size={'xs'}
          icon={<HiClipboardList />}
          mr={1}
          onClick={() => {
            setStockInfoPopup(true);
          }}
        />
        {data?.part_number.part_number}
      </Td>
      <Td>{data?.part_number.description}</Td>

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

export default PartDetails;
