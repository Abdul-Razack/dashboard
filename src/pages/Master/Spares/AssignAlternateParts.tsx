import { useEffect, useMemo, useState } from 'react';

import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  ButtonGroup,
  Checkbox,
  HStack,
  Heading,
  Icon,
  IconButton,
  Stack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  TableContainer,
  Tabs,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import debounce from 'lodash.debounce';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { FiPackage } from 'react-icons/fi';
import { HiArrowNarrowLeft, HiBadgeCheck, HiOutlineStar } from 'react-icons/hi';
import { LuPin, LuPlus } from 'react-icons/lu';
import { Link, useNavigate, useParams } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import SpareCreateModal from '@/components/Modals/SpareMaster';
import { AltPartsResponseModal } from '@/components/Modals/SpareMaster/AltPartsResponse';
import { PartNumberButtons } from '@/components/PartNumberButtons';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  fetchSpareDetails,
  useAssignAltParts,
  useSearchPartNumber,
  useSpareDetails,
} from '@/services/spare/services';

interface PartNumberItem {
  part_number_id: number;
  alternate_part_number_id: number;
  remark: string;
}

const AssignAlternateParts = () => {
  let { id } = useParams();
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const [responseData, setResponseData] = useState<TODO | null>(null);
  const {
    data: details,
    isLoading,
    refetch: refreshPartdetails,
  } = useSpareDetails(Number(id));

  const {
    isOpen: isNewSpareModalOpen,
    onOpen: onNewSpareModalOpen,
    onClose: onNewSpareModalClose,
  } = useDisclosure();
  const [searchInput, setSearchInput] = useState('');
  const [debouncedInput, setDebouncedInput] = useState('');
  const [queryParams, setQueryParams] = useState<any>({});
  const [mainPartInfo, setMainPartInfo] = useState<any>({});
  const [spareOptions, setSpareOptions] = useState<any>([]);
  const {
    data: listData,
    isLoading: loadingSearch,
    refetch: refreshSpares,
  } = useSearchPartNumber(queryParams);
  const [loaderStatus, setLoader] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState(0);
  const [viewedTabs, setViewedTabs] = useState<number[]>([0]);
  const [newAlternateCount, setCount] = useState<number>(0);
  const [tabs, setTabs] = useState<TODO>([]);
  const [resetKey, setResetKey] = useState(0);
  const [alternateParts, setAlternateParts] = useState<any>([]);
  const [uploadedAlternateParts, setUploadedAlternateParts] = useState<any>([]);
  const [isConfirm, toggleConfirmation] = useState<boolean>(false);
  const [respModalStatus, toggleRespModal] = useState<boolean>(false);
  const [exceptPartNos, setExceptPartNos] = useState<string[]>([]);
  const getSpareDetails = fetchSpareDetails();
  const [loader, setLoading] = useState(true);
  const [newSpareName, setSpareName] = useState<string>('');
  const [existingPartNos, setExistingPartNos] = useState<string>('');
  const [recentlyCreatedSpares, setRecentlyCreatedSpares] = useState<any>([]);

  const defaultConfirmTitle = 'Alternate Part Numbers';
  const defaultConfirmationContent = 'Are you sure you want to proceed?';
  const [deleteItemId, setDeleteItemId] = useState<null | number>(null);
  const [confirmationType, setConfirmationType] = useState<null | number>(null);
  const [confirmationTitle, setConfirmationTitle] =
    useState<string>(defaultConfirmTitle);
  const [confirmationContent, setConfirmationContent] = useState<string>(
    defaultConfirmationContent
  );

  const rearrangeProperties = (data: any[]): PartNumberItem[] => {
    // Define the desired property order
    const propertyOrder: (keyof PartNumberItem)[] = [
      'part_number_id',
      'alternate_part_number_id',
      'remark',
    ];

    return data.map((item) => {
      const orderedItem: Partial<PartNumberItem> = {};

      // Add properties in the desired order
      propertyOrder.forEach((prop) => {
        if (item.hasOwnProperty(prop)) {
          orderedItem[prop] = item[prop];
        }
      });

      return orderedItem as PartNumberItem;
    });
  };

  const handleSpareCreate = (inputValue: string) => {
    openSpareCreateModal(inputValue);
  };

  const openSpareCreateModal = (inputValue?: string) => {
    setSpareName(inputValue?.toUpperCase() ?? '');
    onNewSpareModalOpen();
  };

  useEffect(() => {
    if (recentlyCreatedSpares.length > 0) {
      setExistingPartNos(recentlyCreatedSpares.join(','));
    } else {
      setExistingPartNos('');
    }
  }, [recentlyCreatedSpares]);

  useEffect(() => {
    if (existingPartNos) {
      setQueryParams({ exist_ids: existingPartNos });
    }
  }, [existingPartNos]);

  const handleCloseSpareModal = (status: boolean, id: any) => {
    setResetKey((prevKey) => prevKey + 1);
    if (status === true) {
      setRecentlyCreatedSpares((prevNumbers: any) => [...prevNumbers, id]);
      setTimeout(() => {
        form.setValues({ ['part_number']: id.toString() });
        if (id) {
          refreshSpares();
        }
      }, 1000);
    } else {
      setTimeout(() => {
        form.setValues({ ['part_number']: '' });
      }, 1000);
    }
    setSpareName('');
    setSearchInput('');
    onNewSpareModalClose();
  };

  const debouncedHandleInputChange = useMemo(
    () =>
      debounce(
        (index: number, property: string, value: any, tabIndex: number) => {
          handleInputChange(index, property, value, tabIndex);
        },
        500
      ),
    []
  );

  const handleTabChange = (index: number) => {
    const shouldEnforceRule = index >= 2;
    const canNavigate = !shouldEnforceRule || viewedTabs.includes(index - 1);

    if (canNavigate) {
      setActiveTab(index);
      if (!viewedTabs.includes(index)) {
        setViewedTabs([...viewedTabs, index]);
      }
    }
  };

  const handleNext = () => {
    const nextTab = Math.min(activeTab + 1, tabs.length - 1);
    handleTabChange(nextTab);
  };

  const handlePrevious = () => {
    const prevTab = Math.max(activeTab - 1, 0);
    handleTabChange(prevTab);
  };

  const isTabDisabled = (index: number) => {
    return index >= 2 && !viewedTabs.includes(index - 1);
  };

  useEffect(() => {
    return () => debouncedHandleInputChange.cancel();
  }, []);

  const handleInputChange = (
    index: number,
    property: string,
    value: any,
    tabIndex: number
  ) => {
    setTabs((prevTabs: any) => {
      const updatedTabs = [...prevTabs];
      const updatedAlternate = {
        ...updatedTabs[index].alternates[tabIndex],
        [property]: value,
      };
      if (property === 'ischecked' && value === false) {
        updatedAlternate.remark = '';
        form.setValues({ [`remark_${tabIndex}`]: '' });
      }
      updatedTabs[index].alternates[tabIndex] = updatedAlternate;

      return updatedTabs;
    });
  };

  const form = useForm({
    onValidSubmit: async (values) => {
      setLoading(true);
      try {
        const spareInfo = await getSpareDetails(Number(values.part_number));

        const altSpares = spareInfo.alternates
          ? await Promise.all(
              spareInfo.alternates.map((spareDetail: any) => ({
                id: spareDetail.id,
                part_number: spareDetail.alternate_part_number.part_number,
                description: spareDetail.alternate_part_number.description,
                part_number_id: spareDetail.id,
                alternate_part_number_id: spareDetail.alternate_part_number.id,
                isMain: false,
                ischecked: true,
                remark: spareDetail.remark || '',
                isExists: true,
              }))
            )
          : [];

        // Create the new tab
        let newTab: any = {
          id: spareInfo.id,
          part_number_id: Number(id),
          part_number: spareInfo.part_number,
          description: spareInfo.description,
          alternate_part_number_id: spareInfo.id,
          remark: values.remark,
          isMain: false,
          isExists: false,
          ischecked: true,
        };

        const exists = altSpares.some(
          (item: any) => item.id === mainPartInfo.id
        );

        if (!exists) {
          const copyiedMainTab = { ...mainPartInfo };
          copyiedMainTab.remark = '';
          copyiedMainTab.ischecked = true;
          copyiedMainTab.alternate_part_number_id = mainPartInfo.id;
          copyiedMainTab.part_number_id = spareInfo.id;
          copyiedMainTab.isMain = false;
          copyiedMainTab.isExists = false;
          altSpares.push(copyiedMainTab);
        }
        // Update alternate parts state
        const newAlternateParts = [...alternateParts, newTab];
        setAlternateParts(newAlternateParts);
        newTab.alternates = altSpares;

        // Get all non-existing alternates (excluding current tab)
        const filteredAlternates = newAlternateParts
          .filter((alt: any) => {
            return (
              alt.isExists === false && alt.alternate_part_number_id !== spareInfo.id
            );
          })
          .map(({ alternates, ...rest }) => ({
            ...rest,
            part_number_id: spareInfo.id,
            remark: '',
            ischecked: true,
          }));

        newTab.alternates = [...altSpares, ...filteredAlternates];

        // Update existing tabs with new alternates
        const updatedTabs = tabs.map((tab: any) => {
          const copyiedTab = { ...newTab };
          copyiedTab.part_number_id = tab.id;
          copyiedTab.remark = '';
          delete copyiedTab.alternates;

          const alternateExists = tab.alternates.some((alternate: any) => {
            const isMatch = alternate.alternate_part_number_id === copyiedTab.part_number_id;
            return isMatch;
          });

          return {
            ...tab,
            alternates: alternateExists
              ? [...tab.alternates]
              : [...tab.alternates, copyiedTab],
          };
        });

        setTabs([...updatedTabs, newTab]);
        setExceptPartNos((prev) => [...prev, spareInfo.id]);

        // Reset form
        form.setValues({ part_number: '', remark: '' });
        setResetKey((prevKey) => prevKey + 1);
      } catch (error) {
        console.error('Error fetching spare details:', error);
      } finally {
        setLoading(false);
      }
    },
  });

  const assignAlternateParts = useAssignAltParts({
    onSuccess: ({ successful_mappings, errors }) => {
      toastSuccess({
        title: 'Alternate Parts',
        description: `No of alternate parts uploaded: ${uploadedAlternateParts.length} Successful: ${successful_mappings?.length} Failed: ${errors?.length}`,
      });
      const response: any = {
        successfulItems: successful_mappings,
        erroredItems: errors,
      };
      setResponseData(response);
      toggleRespModal(true);
      setLoading(false);
    },
    onError: (error) => {
      console.log(error); // Log any error that occurs during the upload process
      toastError({
        title: 'Oops!!!',
        description: 'Some errors when assign alternates',
      });
      setLoading(false);
    },
  });

  const closeRespModal = () => {
    toggleRespModal(false);
    setResponseData(null);
    refreshPartdetails();
  };

  const fields = useFormFields({
    connect: form,
  });

  const deleteItem = (id: number) => {
    setDeleteItemId(id);
    setConfirmationType(1);
    setConfirmationTitle('Confirmation !!');
    setConfirmationContent(
      'Are you sure you want to delete this tab. You may lose saved alternate parts inside tabs?'
    );
    toggleConfirmation(true);
  };

  const saveAltParts = () => {
    setConfirmationType(2);
    setConfirmationTitle(defaultConfirmTitle);
    setConfirmationContent(defaultConfirmationContent);
    toggleConfirmation(true);
  };

  const handleConfirm = async () => {
    if (confirmationType === 1) {
      setTabs((prevTabs: any) =>
        prevTabs
          .filter((tab: any) => tab.id !== deleteItemId)
          .map((tab: any) => ({
            ...tab,
            alternates: tab.alternates?.filter(
              (alt: any) => alt.id !== deleteItemId
            ),
          }))
      );

      // For alternate parts
      setAlternateParts((prevParts: any) =>
        prevParts
          .filter((part: any) => part.id !== deleteItemId)
          .map((part: any) => ({
            ...part,
            alternates: part.alternates?.filter(
              (alt: any) => alt.id !== deleteItemId
            ),
          }))
      );
      setDeleteItemId(null);
    } else if (confirmationType === 2) {
      const mainParts = alternateParts
        .filter((item: any) => !item.isMain && !item.isExists)
        .map(
          ({
            id,
            part_number,
            isMain,
            isExists,
            ischecked,
            alternates,
            description,
            ...rest
          }: any) => rest
        );

      const otherTabs = tabs.slice(1);
      const subParts = otherTabs
        .flatMap((tab: any) => tab.alternates || [])
        .filter((item: any) => item.ischecked && !item.isExists)
        .map(
          ({
            id,
            part_number,
            isMain,
            isExists,
            ischecked,
            alternates,
            description,
            ...rest
          }: any) => rest
        );

      const allAlternateParts = [...mainParts, ...subParts];
      setUploadedAlternateParts(allAlternateParts);
      setLoading(true);
      const orderedAlternates = rearrangeProperties(allAlternateParts);
      console.log('Ordered tabs', orderedAlternates);
      console.log('All tabs', tabs);
      assignAlternateParts.mutate(orderedAlternates);
    }
    toggleConfirmation(false);
  };

  useEffect(() => {
    setLoader(true);
    const timerId = setTimeout(() => {
      setDebouncedInput(searchInput);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timerId);
    };
  }, [searchInput]);

  // Trigger search when debounced input changes
  useEffect(() => {
    searchPartNumber(debouncedInput);
  }, [debouncedInput]);

  useEffect(() => {
    console.log(exceptPartNos);
    if (exceptPartNos) {
      console.log(exceptPartNos);
      setQueryParams({ except_ids: exceptPartNos.toString() });
    }
  }, [exceptPartNos]);

  useEffect(() => {
    if (!details) return;

    const fetchAlternates = async () => {
      try {
        let mainPart: any = {
          id: details.id,
          part_number: details.part_number,
          description: details.description,
          part_number_id: details.id,
          isMain: true,
          alternates: [],
          remark: '',
        };
        setMainPartInfo(mainPart);
        const exceptIds: any = [details.id];

        // Process alternates asynchronously
        const alternates = await Promise.all(
          details.alternates?.map(async (item) => {
            exceptIds.push(item.alternate_part_number.id);
            const spareInfo = await getSpareDetails(
              item.alternate_part_number.id
            );

            // Process nested alternates
            const altSpares = spareInfo.alternates
              ? await Promise.all(
                  spareInfo.alternates.map(async (spareDetail: any) => ({
                    id: spareDetail.id,
                    part_number: spareDetail.alternate_part_number.part_number,
                    description: spareDetail.alternate_part_number.description,
                    part_number_id: spareDetail.id,
                    alternate_part_number_id: spareDetail.alternate_part_number_id,
                    isMain: false,
                    ischecked: true,
                    remark: spareDetail.remark || '',
                    isExists: true,
                  }))
                )
              : [];

            return {
              id: item.alternate_part_number.id,
              part_number: item.alternate_part_number.part_number,
              description: item.alternate_part_number.description,
              part_number_id: item.part_number_id,
              alternate_part_number_id: item.alternate_part_number_id,
              isMain: false,
              remark: item.remark || '',
              isExists: true,
              alternates: altSpares,
            };
          }) || []
        );

        setExceptPartNos(exceptIds);
        const allParts = [mainPart, ...alternates];
        setAlternateParts(allParts);
        setTabs(allParts);
      } catch (error) {
        console.error('Error fetching alternates:', error);
        // Handle error as needed
      } finally {
        setLoading(false); // Stop loading regardless of success/error
      }
    };

    fetchAlternates();
  }, [details]);

  useEffect(() => {
    const count = alternateParts.filter(
      (item: any) => item.isExists === false
    ).length;
    setCount(count);
  }, [alternateParts]);

  useEffect(() => {
    console.log(tabs);
  }, [tabs]);

  const searchPartNumber = (partnumber: string) => {
    setLoader(true);
    setQueryParams({
      query: partnumber,
      ...(exceptPartNos.length > 0 && { except_ids: exceptPartNos.toString() }),
    });
  };

  useEffect(() => {
    const options =
      listData?.part_numbers?.map((spare) => ({
        value: spare.id.toString(),
        label: spare.part_number,
      })) ?? [];
    setSpareOptions(options);
    setLoader(false);
  }, [listData?.part_numbers]);

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
                <BreadcrumbLink as={Link} to="/spares-master">
                  Spares Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Assign Alternate PartNumbers</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Assign Alternate PartNumbers
            </Heading>
          </Stack>
          <HStack spacing={2}>
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
          <LoadingOverlay isLoading={isLoading || loader}>
            <Stack
              spacing={2}
              p={4}
              bg={'white'}
              borderRadius={'md'}
              boxShadow={'lg'}
            >
              <Heading as="h3" size={'lg'} textAlign={'left'}>
                {details?.part_number}
              </Heading>
              <Formiz autoForm connect={form}>
                <Box>
                  <Stack
                    spacing={8}
                    direction={{ base: 'column', md: 'row' }}
                    display={{ base: 'none', md: 'flex' }}
                    bg={'gray.100'}
                    p={4}
                    rounded={'md'}
                    border={'1px solid'}
                    borderColor={'gray.300'}
                    align={'flex-start'}
                    justify={'flex-start'}
                    mb={2}
                  >
                    <FieldSelect
                      key={`part_number_${resetKey}`}
                      name={`part_number`}
                      label={'Alt. Part Number'}
                      id={`part_number`}
                      size={'sm'}
                      isCaseSensitive={true}
                      menuPortalTarget={document.body}
                      options={[
                        {
                          value: 'add_new',
                          label: (
                            <Text
                              color={'brand.500'}
                              textDecoration={'underline'}
                            >
                              + Add New
                            </Text>
                          ),
                        },
                        ...(spareOptions ?? []),
                      ]}
                      isClearable={false}
                      onValueChange={(value) => {
                        if (value) {
                          if (value === 'add_new') {
                            openSpareCreateModal();
                          }
                        }
                      }}
                      selectProps={{
                        type: 'creatable',
                        noOptionsMessage: () => 'No parts found',
                        isLoading: loadingSearch || loaderStatus,
                        onCreateOption: (inputValue) =>
                          handleSpareCreate(inputValue),
                        onInputChange: (newValue) => {
                          setSearchInput(newValue);
                        },
                      }}
                      isDisabled={activeTab > 0}
                      w={{ base: 'full', md: '20%' }}
                    />
                    <FieldInput
                      key={`remark_${resetKey}`}
                      name={'remark'}
                      label={'Remarks for Alt. Part'}
                      placeholder="Remarks"
                      id={`remark`}
                      size={'sm'}
                      w={{ base: 'full', md: '70%' }}
                      isDisabled={activeTab > 0}
                    />
                    <Stack>
                      <Text fontSize="sm">&nbsp;</Text>
                      <Button
                        type="submit"
                        size={'sm'}
                        variant="@primary"
                        leftIcon={<LuPlus />}
                        w={{ base: 'full', md: 'auto' }}
                        isDisabled={
                          !fields.remark?.value ||
                          !fields.part_number?.value ||
                          activeTab > 0
                        }
                      >
                        Add as Alt PN
                      </Button>
                    </Stack>
                  </Stack>
                </Box>

                <Box overflowX="auto" maxWidth="100%" whiteSpace="nowrap">
                  <Tabs
                    position="relative"
                    variant="unstyled"
                    mt={4}
                    index={activeTab}
                    onChange={handleTabChange}
                    isLazy={false}
                  >
                    <Box overflowX="auto" maxWidth="100%" whiteSpace="nowrap">
                      <TabList display="inline-flex" minWidth="max-content">
                        {tabs.map((item: any, index: number) => (
                          <Tab
                            key={`tab-${index}`}
                            minWidth="120px"
                            bg={activeTab === index ? '#0C2556' : 'gray.200'}
                            color={activeTab === index ? 'white' : 'black'}
                            isDisabled={isTabDisabled(index)}
                          >
                            {item.isMain === true && <HiOutlineStar />}
                            {item.isExists === true && <LuPin />}

                            <Text
                              as="span"
                              ml={
                                item.isMain === true || item.isExists === true
                                  ? 2
                                  : 0
                              }
                            >
                              {item.part_number}
                            </Text>
                          </Tab>
                        ))}
                      </TabList>
                    </Box>
                    <TabPanels>
                      {tabs.map((tab: any, index: number) => (
                        <TabPanel key={`panel-${index}-${tab.id}`} p={0}>
                          <Box position="relative">
                            {/* Table for each tab */}
                            <TableContainer
                              boxShadow={'md'}
                              borderWidth={1}
                              borderColor={'gray.200'}
                              minH="50vh"
                              maxH="50vh"
                              overflowY="auto"
                            >
                              <Table variant="striped" size={'sm'}>
                                <Thead bg={'#0C2556'}>
                                  <Tr>
                                    <Th color={'white'} px={4} py={2}>
                                      #
                                    </Th>
                                    <Th color={'white'} px={4} py={2}>
                                      Alt. Part Number
                                    </Th>
                                    <Th color={'white'} px={4} py={2}>
                                      Description
                                    </Th>
                                    <Th color={'white'} px={4} py={2}>
                                      Remarks
                                    </Th>
                                    <Th color={'white'} px={4} py={2}>
                                      {activeTab > 0
                                        ? 'Set As Alternate'
                                        : 'Action'}
                                    </Th>
                                  </Tr>
                                </Thead>
                                <Tbody>
                                  {alternateParts &&
                                    alternateParts.length > 0 &&
                                    (() => {
                                      const filteredParts =
                                        index === 0
                                          ? alternateParts.filter(
                                              (row: any) =>
                                                row.id !== tabs[activeTab].id
                                            )
                                          : tabs[activeTab].alternates;

                                      return filteredParts.length > 0 ? (
                                        filteredParts.map(
                                          (row: any, rowIndex: number) => (
                                            <Tr
                                              key={`row-${rowIndex}-${row?.id}`}
                                            >
                                              <Td px={4} py={2}>
                                                {rowIndex + 1}
                                              </Td>
                                              <Td px={4} py={2}>
                                                <Text
                                                  display="inline-flex"
                                                  alignItems="center"
                                                  whiteSpace="nowrap"
                                                >
                                                  {row.isExists === true && (
                                                    <HiBadgeCheck
                                                      color={'green'}
                                                    />
                                                  )}

                                                  <Text
                                                    as="span"
                                                    ml={index === 0 ? 2 : 0}
                                                  >
                                                    <PartNumberButtons
                                                      partNumber={
                                                        row.alternate_part_number_id
                                                      }
                                                      showStock={false}
                                                      partName={row.part_number}
                                                    />
                                                  </Text>
                                                </Text>
                                              </Td>
                                              <Td px={4} py={2}>
                                                {row.description}
                                              </Td>
                                              <Td px={4} py={2}>
                                                {index === 0 ? (
                                                  <Text>{row.remark}</Text>
                                                ) : (
                                                  <FieldInput
                                                    key={`remark_${activeTab}_${rowIndex}`}
                                                    name={`remark_${rowIndex}`}
                                                    placeholder="Remarks"
                                                    id={`remark`}
                                                    size={'sm'}
                                                    defaultValue={row.remark}
                                                    onValueChange={(value) => {
                                                      debouncedHandleInputChange(
                                                        index,
                                                        'remark',
                                                        value,
                                                        rowIndex
                                                      );
                                                    }}
                                                    isDisabled={
                                                      row.isExists ||
                                                      !row.ischecked
                                                    }
                                                  />
                                                )}
                                              </Td>
                                              <Td px={4} py={2}>
                                                {index === 0 && (
                                                  <IconButton
                                                    aria-label="Minimal button"
                                                    icon={<DeleteIcon />}
                                                    variant="ghost"
                                                    colorScheme="red"
                                                    p={1}
                                                    m={0}
                                                    onClick={() =>
                                                      deleteItem(row.id)
                                                    }
                                                    background={'transparent'}
                                                    boxShadow={'none'}
                                                    height={'auto'}
                                                    isDisabled={
                                                      row.isExists === true
                                                    }
                                                  />
                                                )}
                                                {index > 0 && (
                                                  <Checkbox
                                                    variant="subtle"
                                                    colorScheme="red"
                                                    isChecked={row.ischecked}
                                                    isDisabled={row.isExists}
                                                    sx={{
                                                      '& .chakra-checkbox__control':
                                                        {
                                                          bg: 'red.100',
                                                          borderColor:
                                                            'red.300',
                                                          borderWidth: '2px',
                                                          _checked: {
                                                            bg: 'green.100',
                                                            borderColor:
                                                              'green.300',
                                                            color: 'green.500',
                                                          },
                                                        },
                                                      '&:hover .chakra-checkbox__control:not([data-checked])':
                                                        {
                                                          bg: 'red.50',
                                                        },
                                                      '&:hover .chakra-checkbox__control[data-checked]':
                                                        {
                                                          bg: 'green.50',
                                                        },
                                                    }}
                                                    size="lg"
                                                    onChange={(e) => {
                                                      debouncedHandleInputChange(
                                                        index,
                                                        'ischecked',
                                                        e.target.checked,
                                                        rowIndex
                                                      );
                                                    }}
                                                  />
                                                )}
                                              </Td>
                                            </Tr>
                                          )
                                        )
                                      ) : (
                                        <Tr>
                                          <Td
                                            colSpan={5}
                                            textAlign="center"
                                            p={8}
                                          >
                                            <VStack spacing={2}>
                                              <Icon
                                                as={FiPackage}
                                                boxSize={8}
                                                color="gray.400"
                                              />
                                              <Text color="gray.500">
                                                No alternate parts available
                                              </Text>
                                            </VStack>
                                          </Td>
                                        </Tr>
                                      );
                                    })()}
                                </Tbody>
                              </Table>
                            </TableContainer>
                            <Box
                              mt={4}
                              position="sticky"
                              bottom={0}
                              bg="white"
                              zIndex={1}
                            >
                              <Stack
                                direction={{ base: 'column', md: 'row' }}
                                mt={4}
                              >
                                {alternateParts.length > 0 && (
                                  <ButtonGroup
                                    isAttached
                                    variant="outline"
                                    spacing="0"
                                  >
                                    <Button
                                      size="sm"
                                      leftIcon={<Icon as={FiChevronLeft} />}
                                      isDisabled={activeTab === 0}
                                      onClick={handlePrevious}
                                      borderRightRadius="0"
                                    >
                                      Previous
                                    </Button>
                                    <Button
                                      size="sm"
                                      rightIcon={<Icon as={FiChevronRight} />}
                                      isDisabled={activeTab >= tabs.length - 1}
                                      onClick={handleNext}
                                      borderLeftRadius="0"
                                    >
                                      Next
                                    </Button>
                                  </ButtonGroup>
                                )}
                                {alternateParts.length > 1 &&
                                  activeTab === tabs.length - 1 && (
                                    <Button
                                      colorScheme="brand"
                                      size={'sm'}
                                      isDisabled={newAlternateCount === 0}
                                      onClick={saveAltParts}
                                    >
                                      Save Alternates
                                    </Button>
                                  )}
                              </Stack>
                            </Box>
                          </Box>
                        </TabPanel>
                      ))}
                    </TabPanels>
                  </Tabs>
                </Box>
              </Formiz>
            </Stack>
            <ConfirmationPopup
              isOpen={isConfirm}
              onClose={() => {
                toggleConfirmation(false);
              }}
              onConfirm={handleConfirm}
              headerText={confirmationTitle}
              bodyText={confirmationContent}
            />

            <AltPartsResponseModal
              isOpen={respModalStatus}
              onClose={closeRespModal}
              response={responseData}
            />

            <SpareCreateModal
              isOpen={isNewSpareModalOpen}
              onClose={handleCloseSpareModal}
              spareName={newSpareName}
            />
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default AssignAlternateParts;

{
  /* 
   //   Input,
  //   InputGroup,
  //   InputLeftElement,
  //   InputRightElement,
  //   Button,
  // 
  // <InputGroup size="sm">
                  <Input
                    size="sm"
                    placeholder="Search Partnumbers..."
                    pr="4.5rem"
                    onChange={(e) => {
                      setKeyword(e.target.value);
                      setDebouncedKeyword(e.target.value);
                    }}
                  />
                  <InputLeftElement pointerEvents="none">
                    <HiOutlineSearch color="gray.400" />
                  </InputLeftElement>
                  <InputRightElement width="4.5rem" mr={0}>
                    <Button
                      variant="@primary"
                      size="sm"
                      h="full"
                      w="full"
                      borderRadius="md"
                      borderLeftRadius={0}
                      isLoading={loadingSearch}
                    >
                      Search
                    </Button>
                  </InputRightElement>
                </InputGroup>
                
                
  //   const toggleItem = (status: boolean, item: string) => {
  //     setAlternateParts((prevItems) => {
  //       if (status) {
  //         return prevItems.includes(item) ? prevItems : [...prevItems, item];
  //       } else {
  //         return prevItems.filter((i) => i !== item);
  //       }
  //     });
  //   };
  // */
}
