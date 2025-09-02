import { useContactManagerList } from '@/services/master/contactmanager/services';

const useContactName = (contactId: number) => {
  const contactList = useContactManagerList();
  const contactName = contactList.data?.items[contactId];

  if (contactList.isLoading) {
    return 'Loading...';
  }

  return contactName ?? 'Contact not available';
};

export default useContactName;
