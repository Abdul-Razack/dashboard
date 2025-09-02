import { Td } from '@chakra-ui/react';

import { useContactManagerDetails } from '@/services/master/contactmanager/services';

export const CustomerContactInfo = ({ contactId }: { contactId: number }) => {
  const { data, isLoading, error } = useContactManagerDetails(contactId);

  if (isLoading) return <Td>Loading...</Td>;
  if (error) return <Td>Error!</Td>;
  return (
    <>
      <Td>{data?.attention}</Td>
      <Td>{data?.address}</Td>
    </>
  );
};

export default CustomerContactInfo;
