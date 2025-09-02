import { usePRDetails } from '@/services/purchase/purchase-request/services';
import dayjs from 'dayjs';
import { getDisplayLabel } from '@/helpers/commonHelper';
const MRDetails = ({ mrId, field, options }: { mrId: number, field: string, options: any }) => {
const { data, isLoading, error } = usePRDetails(mrId);
  if (isLoading) return 'Loading...';
  if (error) return 'Error!';
  return (field ? (field === 'priority_id' ? getDisplayLabel(options, data?.data.priority_id, 'priority') : (field === 'due_date' ? dayjs(data?.data.due_date).format('DD-MMM-YYYY') : '')) :  ' - ');
};

export default MRDetails;
