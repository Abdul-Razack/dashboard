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
  Tag,
  TagCloseButton,
  TagLabel,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import { DataTable } from '@/components/DataTable';
import LoadingOverlay from '@/components/LoadingOverlay';
import Pagination from '@/components/Pagination';
import { MaterialRequestSearch } from '@/components/SearchBars/Purchase/MaterialRequest';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: (data: any) => void;
  data?: any;
};

const PreviewPopup = ({ isOpen, onClose, data = {} }: ModalPopupProps) => {
  //const [loading, setLoading] = useState<boolean>(false);
  const initialFormData = {
    page: 1,
    is_closed: 0
  };

  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMRs, setSelectedMRs] = useState<string[]>([]);
  const [existingMRs, setExistingMRs] = useState<number[]>([]);
  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const [mrData, setData] = useState<TODO>([]);
  const [columns, setColumns] = useState<TODO>([]);
  const [listData, setListData] = useState<TODO>({});
  const [clearTrigger, setClearTrigger] = useState(false);
  const searchForm = useForm({
    onValidSubmit: (values) => {
      console.log(values);
    },
  });

  // const toggleItem = (item: string) => {
  //   setSelectedMRs((prevItems) => {
  //     if (prevItems.includes(item)) {
  //       // Remove the item if it exists
  //       return prevItems.filter((i) => i !== item);
  //     } else {
  //       // Add the item if it does not exist
  //       return [...prevItems, item];
  //     }
  //   });
  // };

  const handleClose = () => {
    onClose(selectedMRs);
    setSelectedMRs([]);
  };

  const applyMRs = () => {
    onClose(selectedMRs);
    setSelectedMRs([]);
  };

  const clearMRs = () => {
    setSelectedMRs([]);
    setClearTrigger((prev) => !prev);
  };

  useEffect(() => {
    if (isOpen) {
      if (Array.isArray(data.request_ids)) {
      console.log(data)
        setExistingMRs(data.request_ids.map(Number));
        setSelectedMRs(data.request_ids.map(String));
      }
    }
  }, [isOpen, data]);


  useEffect(() => {
    if (isOpen) {
      console.log(selectedMRs);
    }
  }, [selectedMRs]);

  const handleDelete = (mrToDelete: any) => {
    const index = selectedMRs.findIndex((item) => item === mrToDelete);
    if (index !== -1) {
      const updatedMRs = [...selectedMRs];
      updatedMRs.splice(index, 1);
      setSelectedMRs(updatedMRs);
      setExistingMRs(updatedMRs.map(Number));
      setClearTrigger((prev) => !prev);
    }
  };

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

  const handleMRUpdates = (mrs: any) => {
    setSelectedMRs(mrs)
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
            Search Material Request
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
                      <MaterialRequestSearch
                        onSearchFinished={handleResponse}
                        setModuleLoading={handleLoader}
                        additionalParams={queryParams}
                        onPreviewClicked={handleOpenPreview}
                        onMRChanged={handleMRUpdates}
                        isModal={true}
                        resetTrigger={clearTrigger}
                        existingMRs={existingMRs}
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
                      {selectedMRs.length > 0 && (
                        <Stack
                          spacing={2}
                          direction={{ base: 'column', md: 'row' }}
                          mb={2}
                          alignItems={'center'}
                        >
                          <Text fontWeight={'bold'} verticalAlign={'middle'}>
                            Selected MR's:{' '}
                          </Text>
                          {selectedMRs.map((mr) => (
                            <Tag
                              key={mr}
                              size="md"
                              borderRadius="full"
                              variant="solid"
                              colorScheme="green"
                              m={1}
                              display="inline-flex"
                              alignItems="center"
                            >
                              <TagLabel>{mr}</TagLabel>
                              <TagCloseButton
                                onClick={() => handleDelete(mr)}
                              />
                            </Tag>
                          ))}
                        </Stack>
                      )}

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
                            onClick={applyMRs}
                            colorScheme="green"
                            isDisabled={loading || selectedMRs.length === 0}
                          >
                            Apply
                          </Button>

                          <Button
                            colorScheme="red"
                            size={'sm'}
                            isDisabled={loading || selectedMRs.length === 0}
                            onClick={clearMRs}
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

export default PreviewPopup;
