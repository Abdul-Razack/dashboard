import { useCustomerDetails } from '@/services/master/services';

const CustomerDetails = ({ id, field }: { id: number, field: string }) => {
const { data, isLoading, error } = useCustomerDetails(id);
  if (isLoading) return 'Loading...';
  if (error) return 'Error!';
  return (field ? (field === 'business_name' ?  data?.data?.business_name : data?.data?.code) :  ' - ');
};

export default CustomerDetails;


