import React, { useEffect, useState } from 'react';

import { ChevronRightIcon, EditIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  HStack,
  Heading,
  IconButton,
  Select,
  Stack,
  Tab,
  TabIndicator,
  TabList,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';

import DiffTooltip from '@/components/DiffTooltip';
import FieldDisplay from '@/components/FieldDisplay';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PreviewPopup } from '@/components/PreviewContents/Purchase/MaterialRequest';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import {
  checkValuesUnMatched,
  convertHistoriesToOptions,
  transformToSelectOptions,
  getPRTypeLabel
} from '@/helpers/commonHelper';
import {
  usePRDetails,
  usePRLogDetails,
  usePRLogList,
} from '@/services/purchase/purchase-request/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';
import PartDetails from '../Quotation/PartDetails';

const MaterialRequestLogs = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>([]);
  const [selectOptions, setSelectOptions] = useState<any>([]);
  const [selectedHistory, setSelectedHistory] = useState<any>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<string>('tab1');
  const { data: details, isLoading } = usePRDetails(Number(id));
  const { data: logs } = usePRLogList(Number(id));
  const { data: loginfo } = usePRLogDetails(selectedHistory ?? 0);
  const [latestItems, setLatestItems] = useState<any>([]);
  const [logItems, setLogItems] = useState<any>([]);
  const uomList = useUnitOfMeasureList();
  const conditionList = useConditionList();

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  const handleOpenPreview = () => {
    let popupVariables: any = {};
    let PODetails: any = selectedTab === 'tab1' ? details?.data : loginfo?.data;
    popupVariables.conditionOptions = transformToSelectOptions(
      conditionList?.data
    );
    popupVariables.uomOptions = transformToSelectOptions(uomList?.data);
    Object.keys(PODetails).forEach(function (key) {
      popupVariables[key] = PODetails[key];
    });
    popupVariables['remarks'] = PODetails.remark;
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedHistory(event.target.value);
  };

  useEffect(() => {
    console.log(selectedHistory);
  }, [selectedHistory]);

  useEffect(() => {
    if (logs) {
      setSelectOptions(convertHistoriesToOptions(logs.data));
      setLoading(false);
    }
  }, [logs]);

  useEffect(() => {
    if (loginfo) {
      setLogItems(loginfo.data.items);
    }
  }, [loginfo]);

  useEffect(() => {
    if (details) {
      setLatestItems(details.data.items);
    }
  }, [details]);

  useEffect(() => {
    console.log(latestItems, logItems);
  }, [latestItems, logItems]);

  return (
    <SlideIn>
      <Stack pl={2} spacing={2}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Breadcrumb
              fontWeight="medium"
              fontSize="sm"
              separator={<ChevronRightIcon boxSize={6} color="gray.500" />}
            >
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink as={Link} to="/purchase/purchase-request">
                  Material Request List
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Material Request Details</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Material Request Details
            </Heading>
          </Stack>
          <HStack spacing={2}>
            <IconButton
              aria-label="Edit"
              icon={<EditIcon />}
              size="sm"
              variant="outline"
              colorScheme="gray"
              onClick={() => navigate(`/purchase/purchase-request/${id}/edit`)}
            />
            <ResponsiveIconButton
              variant={'@primary'}
              icon={<HiArrowNarrowLeft />}
              size={'sm'}
              fontWeight={'thin'}
              onClick={() => navigate(-1)}
            >
              Back
            </ResponsiveIconButton>
          </HStack>
        </HStack>

        <Box borderRadius={4}>
          <LoadingOverlay isLoading={isLoading || loading}>
            <Stack
              spacing={2}
              p={4}
              bg={'white'}
              borderRadius={'md'}
              boxShadow={'lg'}
            >
              <Flex direction="column">
                <Flex mb={4} align="center" justify="space-between">
                  <Tabs
                    position="relative"
                    variant="unstyled"
                    onChange={(index) => setSelectedTab(`tab${index + 1}`)}
                  >
                    <TabList>
                      <Tab>Active Details</Tab>
                      <Tab isDisabled={!selectedHistory}>Log Details</Tab>
                    </TabList>
                    <TabIndicator
                      mt="-1.5px"
                      height="2px"
                      bg={'brand.600'}
                      borderRadius="1px"
                    />
                  </Tabs>
                  <Select
                    width={'250px'}
                    value={selectedHistory}
                    onChange={handleSelectChange}
                  >
                    <option value="" disabled>
                      Select History
                    </option>
                    {selectOptions.map((option: any) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Flex>

                <Box flex="1">
                  <Stack>
                    {selectedTab === 'tab1' && (
                      <Stack spacing={4}>
                        <Stack
                          spacing={8}
                          direction={{ base: 'column', md: 'row' }}
                        >
                          <FieldDisplay
                            label="User"
                            value={details?.data?.user.username || 'N/A'}
                          />
                          <FieldDisplay
                            label="MR Type"
                            value={getPRTypeLabel(details?.data?.type || '')}
                            showTooltip={
                              selectedHistory &&
                              loginfo?.data &&
                              !checkValuesUnMatched(
                                getPRTypeLabel(details?.data?.type ?? ''),
                                getPRTypeLabel(loginfo?.data?.type ?? '')
                              )
                                ? true
                                : false
                            }
                            tooltipContent={'Value updated'}
                          />

                          <FieldDisplay
                            label="Priority"
                            value={details?.data?.priority.name || 'N/A'}
                            showTooltip={
                              selectedHistory &&
                              loginfo?.data &&
                              !checkValuesUnMatched(
                                details?.data?.priority_id,
                                loginfo?.data?.priority_id
                              )
                                ? true
                                : false
                            }
                            tooltipContent={'Value updated'}
                          />
                          <FieldDisplay
                            label="Due Date"
                            value={details?.data?.due_date || 'N/A'}
                            showTooltip={
                              selectedHistory &&
                              loginfo?.data &&
                              !checkValuesUnMatched(
                                details?.data?.due_date,
                                loginfo?.data?.due_date
                              )
                                ? true
                                : false
                            }
                            tooltipContent={'Value updated'}
                          />
                        </Stack>
                        <Stack
                          spacing={8}
                          direction={{ base: 'column', md: 'row' }}
                        >
                          <FieldDisplay
                            label="Remarks"
                            value={details?.data?.remark || 'N/A'}
                            isHtml={true}
                            showTooltip={
                              selectedHistory &&
                              loginfo?.data &&
                              !checkValuesUnMatched(
                                details?.data?.remark,
                                loginfo?.data?.remark
                              )
                                ? true
                                : false
                            }
                            tooltipContent={'Value updated'}
                          />
                        </Stack>
                        <Stack>
                          <HStack justify={'space-between'}>
                            <Text fontSize="md" fontWeight="700">
                              Items
                              {selectedHistory &&
                                latestItems.length !== logItems.length && (
                                  <DiffTooltip label={latestItems.length > logItems.length ? 'New Item added' : (logItems.length > latestItems.length ? 'Item deleted' : '')} />
                                )}
                            </Text>
                          </HStack>
                          {details?.data?.items &&
                            details?.data?.items.length > 0 && (
                              <TableContainer
                                rounded={'md'}
                                overflow={'auto'}
                                border="1px"
                                borderColor="gray.500"
                                borderRadius="md"
                                boxShadow="md"
                              >
                                <Table variant="striped" size={'sm'}>
                                  <Thead bg={'gray.500'}>
                                    <Tr>
                                      <Th color={'white'}>S.NO</Th>
                                      <Th color={'white'}>Part Number</Th>
                                      <Th color={'white'}>Description</Th>
                                      <Th color={'white'}>Condition</Th>
                                      <Th color={'white'}>Quantity</Th>
                                      <Th color={'white'}>UOM</Th>
                                      <Th color={'white'}>Remarks</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {details?.data?.items.map((item, index) => (
                                      <Tr key={item.id}>
                                        <Td>{index + 1}</Td>
                                        <PartDetails
                                          partNumber={item.part_number_id}
                                        />
                                        <Td>
                                          {selectedHistory &&
                                          loginfo?.data &&
                                          !checkValuesUnMatched(
                                            latestItems[index]?.condition_id,
                                            logItems[index]?.condition_id
                                          ) ? (
                                            <DiffTooltip label="Value updated" />
                                          ) : (
                                            ''
                                          )}
                                          {conditionList.data?.items[
                                            item.condition_id
                                          ] || 'N/A'}
                                        </Td>
                                        <Td>
                                          {selectedHistory &&
                                          loginfo?.data &&
                                          !checkValuesUnMatched(
                                            latestItems[index]?.qty,
                                            logItems[index]?.qty
                                          ) ? (
                                            <DiffTooltip label="Value updated" />
                                          ) : (
                                            ''
                                          )}
                                          {item.qty}
                                        </Td>
                                        <Td>
                                          {selectedHistory &&
                                          loginfo?.data &&
                                          !checkValuesUnMatched(
                                            latestItems[index]
                                              ?.unit_of_measure_id,
                                            logItems[index]?.unit_of_measure_id
                                          ) ? (
                                            <DiffTooltip label="Value updated" />
                                          ) : (
                                            ''
                                          )}
                                          {uomList.data?.items[
                                            item.unit_of_measure_id
                                          ] || 'N/A'}
                                        </Td>
                                        <Td>
                                          {selectedHistory &&
                                          loginfo?.data &&
                                          !checkValuesUnMatched(
                                            latestItems[
                                              index
                                            ]?.remark.toString(),
                                            logItems[index]?.remark.toString()
                                          ) ? (
                                            <DiffTooltip label="Value updated" />
                                          ) : (
                                            ''
                                          )}
                                          {item.remark || ' - '}
                                        </Td>
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              </TableContainer>
                            )}
                        </Stack>
                      </Stack>
                    )}

                    {selectedTab === 'tab2' && (
                      <Stack spacing={4}>
                        <Stack
                          spacing={8}
                          direction={{ base: 'column', md: 'row' }}
                        >
                          <FieldDisplay
                            label="User"
                            value={loginfo?.data?.user.username || 'N/A'}
                          />
                          <FieldDisplay
                            label="MR Type"
                            value={getPRTypeLabel(loginfo?.data?.type || '')}
                          />

                          <FieldDisplay
                            label="Priority"
                            value={loginfo?.data?.priority.name || 'N/A'}
                          />
                          <FieldDisplay
                            label="Due Date"
                            value={loginfo?.data?.due_date || 'N/A'}
                          />
                        </Stack>
                        <Stack
                          spacing={8}
                          direction={{ base: 'column', md: 'row' }}
                        >
                          <FieldDisplay
                            label="Remarks"
                            value={loginfo?.data?.remark || 'N/A'}
                            isHtml={true}
                          />
                        </Stack>
                        <Stack>
                          <HStack justify={'space-between'}>
                            <Text fontSize="md" fontWeight="700">
                              Items
                            </Text>
                          </HStack>
                          {loginfo?.data?.items &&
                            loginfo?.data?.items.length > 0 && (
                              <TableContainer
                                rounded={'md'}
                                overflow={'auto'}
                                border="1px"
                                borderColor="gray.500"
                                borderRadius="md"
                                boxShadow="md"
                              >
                                <Table variant="striped" size={'sm'}>
                                  <Thead bg={'gray.500'}>
                                    <Tr>
                                      <Th color={'white'}>S.NO</Th>
                                      <Th color={'white'}>Part Number</Th>
                                      <Th color={'white'}>Description</Th>
                                      <Th color={'white'}>Condition</Th>
                                      <Th color={'white'}>Quantity</Th>
                                      <Th color={'white'}>UOM</Th>
                                      <Th color={'white'}>Remarks</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {loginfo?.data?.items.map((item, index) => (
                                      <Tr key={item.id}>
                                        <Td>{index + 1}</Td>
                                        <PartDetails
                                          partNumber={item.part_number_id}
                                        />
                                        <Td>
                                          {conditionList.data?.items[
                                            item.condition_id
                                          ] || 'N/A'}
                                        </Td>
                                        <Td>{item.qty}</Td>
                                        <Td>
                                          {uomList.data?.items[
                                            item.unit_of_measure_id
                                          ] || 'N/A'}
                                        </Td>
                                        <Td>{item.remark || ' - '}</Td>
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              </TableContainer>
                            )}
                        </Stack>
                      </Stack>
                    )}
                    <Stack
                      direction={{ base: 'column', md: 'row' }}
                      justify={'center'}
                      alignItems={'center'}
                      display={'flex'}
                      mt={4}
                    >
                      <Button colorScheme="brand" onClick={() => navigate(-1)}>
                        Back
                      </Button>
                      <Button
                        onClick={() => handleOpenPreview()}
                        colorScheme="green"
                      >
                        Preview
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              </Flex>
            </Stack>
          </LoadingOverlay>
        </Box>

        <PreviewPopup
          isOpen={isPreviewModalOpen}
          onClose={handleCloseModal}
          data={previewData}
        ></PreviewPopup>
      </Stack>
    </SlideIn>
  );
};

export default MaterialRequestLogs;
