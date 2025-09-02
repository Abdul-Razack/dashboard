import { useEffect, useState } from 'react';

import {
  Box,
  Button,
  Container,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { DataTable } from '@/components/DataTable';
import LoadingOverlay from '@/components/LoadingOverlay';
import Pagination from '@/components/Pagination';
import { QuotationSearch } from '@/components/SearchBars/Purchase/Quotation';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: (data: any) => void;
  data?: any;
};

const QuotationSearchPopup = ({ isOpen, onClose, data = {} }: ModalPopupProps) => {
  //const [loading, setLoading] = useState<boolean>(false);
  const initialFormData = {
    page: 1,
    is_closed: 0
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedPRFQ, setSelectedPRFQ] = useState<number>(0);
  const [existingQuotation, setExistingPRFQ] = useState<number>(0);
  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const [mrData, setData] = useState<TODO>([]);
  const [columns, setColumns] = useState<TODO>([]);
  const [listData, setListData] = useState<TODO>({});
  const [clearTrigger, setClearTrigger] = useState(false);
  const searchForm = useForm();
  
  const handleClose = () => {
    onClose(selectedPRFQ);
    setExistingPRFQ(0);
    setSelectedPRFQ(0);
  };

  const applyPRFQ = () => {
    onClose(selectedPRFQ);
    setSelectedPRFQ(0);
  };

  const clearPRFQ = () => {
    setSelectedPRFQ(0);
    setClearTrigger((prev) => !prev);
  };

  useEffect(() => {
    if (isOpen) {
      console.log(data)
      if (data.existingQuotation) {
        setExistingPRFQ(Number(data.existingQuotation));
        setSelectedPRFQ(Number(data.existingQuotation));
      }
    }
  }, [isOpen, data]);

  const handleResponse = (data: any, columns: any) => {
    setColumns(columns);
    setListData(data);
    setData(data?.data);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleLoader = (status: boolean) => {
    setLoading(status);
  };

  const handlePRFQupdate = (prfq: any) => {
    setSelectedPRFQ(prfq)
  };

  const handleOpenPreview = async (PODetails: any) => {
    console.log('PODetails', PODetails);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} id={'modal-root'} closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="85vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Search Quotation
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box borderRadius={4}>
            <Stack spacing={2} bg={'white'} borderRadius={'md'}>
              <Formiz autoForm connect={searchForm}>
                <Container maxW="container.2xl" p={1}>
                  <Stack spacing={2} direction={{ base: 'column', md: 'row' }}>
                    <Box
                      flex="1"
                      rounded={'md'}
                      border={'1px solid'}
                      borderColor={'gray.300'}
                      p={4}
                    >
                      <QuotationSearch
                        onSearchFinished={handleResponse}
                        setModuleLoading={handleLoader}
                        additionalParams={queryParams}
                        onPreviewClicked={handleOpenPreview}
                        onPRFQChanged={handlePRFQupdate}
                        isModal={true}
                        resetTrigger={clearTrigger}
                        existingQuotation={existingQuotation}
                      />
                    </Box>

                    <Box
                      flex="3"
                      rounded={'md'}
                      border={'1px solid'}
                      borderColor={'gray.300'}
                      p={4}
                      overflowX="auto"
                    >

                      <LoadingOverlay isLoading={loading}>
                        <DataTable
                          columns={columns}
                          data={mrData}
                          loading={loading}
                          tableProps={{ variant: 'simple' }}
                        />
                      </LoadingOverlay>
                      <Box
                        p={4}
                        mt={4}
                        display="flex"
                        justifyContent="space-between"
                      >
                        <Stack
                          direction={{ base: 'column', md: 'row' }}
                          justify={'center'}
                          alignItems={'center'}
                          display={'flex'}
                        >
                          <Button
                            size={'sm'}
                            onClick={applyPRFQ}
                            colorScheme="green"
                            isDisabled={loading || selectedPRFQ === 0}
                          >
                            Apply
                          </Button>

                          <Button
                            colorScheme="red"
                            size={'sm'}
                            isDisabled={loading || selectedPRFQ === 0}
                            onClick={clearPRFQ}
                          >
                            Clear
                          </Button>
                        </Stack>
                        <Pagination
                          currentPage={listData?.current_page ?? 1}
                          totalCount={listData?.total ?? 0}
                          pageSize={10}
                          onPageChange={(page) => {
                            setQueryParams({ ...queryParams, page });
                          }}
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Container>
              </Formiz>
            </Stack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default QuotationSearchPopup;
