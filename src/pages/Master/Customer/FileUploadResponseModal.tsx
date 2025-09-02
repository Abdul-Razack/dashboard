import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  response: any;
};

export const FileUploadResponseModal = ({
  isOpen,
  onClose,
  response,
}: ModalPopupProps) => {
  return (
    <div>
      <Modal isOpen={isOpen} onClose={onClose} size="lg" closeOnOverlayClick={false} closeOnEsc={false}>
        <ModalOverlay />
        <ModalContent maxWidth="50vw">
          <ModalHeader>File Upload Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab
                  _selected={{
                    bg: 'green.400', // Green color for Successful tab when selected
                    color: 'white',
                  }}
                  _hover={{
                    bg: 'green.300', // Green hover effect
                  }}
                >
                  Successful
                </Tab>
                <Tab
                  _selected={{
                    bg: 'red.400', // Red color for Unsuccessful tab when selected
                    color: 'white',
                  }}
                  _hover={{
                    bg: 'red.300', // Red hover effect
                  }}
                >
                  UnSuccessful
                </Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <Table variant="simple" size={'sm'}>
                    <Thead>
                    <Tr>
                        <Th>#</Th>
                        <Th>Business Name</Th>
                        <Th>Email</Th>
                        <Th>Nature of Business</Th>
                      </Tr>
                    
                    </Thead>
                    <Tbody>
                    {response?.added_customers && response?.added_customers.map((item: any, index: number) => (
                      <Tr key={index}>
                        <Td>{index + 1}</Td>
                        <Td>{item.business_name}</Td>
                        <Td>{item.email}</Td>
                        <Td>{item.nature_of_business}</Td>
                      </Tr>
                      ))}
                       {response?.added_customers && response?.added_customers.length === 0 && (
                      <Tr>
                        <Td colSpan={3} textAlign={'center'}>No customers found </Td>
                      </Tr>)}
                    </Tbody>
                  </Table>
                </TabPanel>
                <TabPanel>
                  <Table variant="simple" size={'sm'}>
                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Business Name</Th>
                        <Th>Email</Th>
                        <Th>Error</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                    {response?.errors && response?.errors.map((item: any, index: number) => (
                      <Tr key={index}>
                        <Td>{index + 1}</Td>
                        <Td>{item?.row['business_name']}</Td>
                        <Td>{item?.row['email']}</Td>
                        <Td>{item?.message}</Td>
                      </Tr>))}
                      {response?.failed_customers && response?.failed_customers.length === 0 && (
                      <Tr>
                        <Td colSpan={4} textAlign={'center'}>No customers found </Td>
                      </Tr>)}
                      
                    </Tbody>
                  </Table>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
        </ModalContent>
      </Modal>
    </div>
  );
};

export default FileUploadResponseModal;
