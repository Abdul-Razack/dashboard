import { useEffect, useState } from 'react';
import FieldDisplay from '@/components/FieldDisplay';
import { getAPICall } from '@/services/apiService';
import { FindByPartNumberIdPayload } from '@/services/apiService/Schema/PRSchema';

type Props = {
  partNumberId?: number;
};

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};
  
const DescriptionCell: React.FC<Props> = ({ partNumberId }) => {
  const [description, setDescription] = useState<string>('Loading...');

  useEffect(() => {
    const fetchDescription = async () => {
      if (!partNumberId) {
        setDescription('N/A');
        return;
      }

      try {
        const response = await getAPICall(
          endPoints.find.spare_by_partnumber.replace(':id', String(partNumberId)),
          FindByPartNumberIdPayload,
          {}
        );
        setDescription(response?.spare?.description ?? 'N/A');
      } catch (error) {
        console.error('Failed to fetch part number:', error);
        setDescription('N/A');
      }
    };

    fetchDescription();
  }, [partNumberId]);

  return <FieldDisplay value={description} size="sm" />;
};

export default DescriptionCell;