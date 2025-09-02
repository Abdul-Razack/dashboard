import React, { useEffect, useState } from 'react';

import { ChevronDownIcon } from '@chakra-ui/icons';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  HStack,
  Heading,
  Input,
  ListItem,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Stack,
  Text,
  UnorderedList,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { createColumnHelper } from '@tanstack/react-table';
import { format } from 'date-fns';
import { HiEye, HiRefresh } from 'react-icons/hi';
import { LuPlus } from 'react-icons/lu';
import { LuDownload, LuUpload } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { DataTable } from '@/components/DataTable';
import { FieldInput } from '@/components/FieldInput';
import LoadingOverlay from '@/components/LoadingOverlay';
import { AltPartInfoPopup } from '@/components/Modals/SpareMaster/AlternateParts';
import { FileUploadResponseModal } from '@/components/Modals/SpareMaster/FileUploadResponse';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import PreviewPopup from '@/components/PreviewContents/Masters/Spares';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { TableExport } from '@/components/TableExport';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  exportTableAs,
  getDisplayLabel,
  handleDownload,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { highlightSearch } from '@/helpers/highlightSearch';
import { uploadAPICall } from '@/services/apiService';
import { SpareDataColumn } from '@/services/spare/schema';
import { useSpareIndex } from '@/services/spare/services';
import { useHscCodeList } from '@/services/submaster/hsc-code/services';
import { useSpareModelList } from '@/services/submaster/sparemodel/services';
import { useSpareTypeList } from '@/services/submaster/sparetype/services';
import { useUNList } from '@/services/submaster/un/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

const SparesMaster = () => {
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const initialFormData = {
    part_number: '',
    description: '',
    page: 1,
    per_page: itemsPerPage,
  };
  const [queryParams, setQueryParams] = useState<TODO>(initialFormData);
  const navigate = useNavigate();

  const spareModelList = useSpareModelList();
  const spareTypeList = useSpareTypeList();
  const uomList = useUnitOfMeasureList();
  const hscCodeList = useHscCodeList();
  const unList = useUNList();
  const spareModelOptions = transformToSelectOptions(spareModelList.data);
  const spareTypeOptions = transformToSelectOptions(spareTypeList.data);
  const hscCodeOptions = transformToSelectOptions(hscCodeList.data);
  const uomOptions = transformToSelectOptions(uomList.data);
  const unOptions = transformToSelectOptions(unList.data);
  const form = useForm({
    onValidSubmit: (values) => {
      setQueryParams(values);
    },
  });

  const mobileForm = useForm({
    onValidSubmit: (values) => {
      setQueryParams(values);
    },
  });

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  const {
    data: listData,
    isLoading: sparesLoading,
    refetch: refreshSpares,
  } = useSpareIndex(queryParams);

  const [data, setData] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [altPartNos, setAltPartNos] = useState<any>([]);
  const [fileKey, setFileKey] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<TODO>(null);
  const [responseData, setResponseData] = useState<TODO | null>(null);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const [isRespModalOpen, setIsRespModalOpen] = useState(false);
  const [showAltPartNosModal, setAltPartNosModal] = useState(false);
  const [exportStatus, triggerExport] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf' | undefined>(
    undefined
  );
  const toastError = useToastError();
  const toastSuccess = useToastSuccess();
  const [exportStatusTrigger, setExportStatusTrigger] = useState(0);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [previewData, setPreviewData] = useState<TODO>({});
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [downloadPerPage, setDownloadPerPage] = useState<string>('any');

  const exportTableData = (type: any, activePage: any) => {
    setDownloadPerPage(activePage);
    setTimeout(() => {
      setExportType(type);
      triggerExport(true);
      setExportStatusTrigger((prev) => prev + 1);
    }, 1000);
  };

  const { data: downloadData, refetch: downloadDataReload } = useSpareIndex(
    {
      ...queryParams,
      per_page: downloadPerPage,
    },
    { enabled: false }
  );

  useEffect(() => {
    if (downloadData?.data && exportStatus) {
      triggerExport(false);
      exportTableAs(exportColumns, downloadData?.data, 'spares', exportType);
      toastSuccess({
        title: 'Report exported Successfully!',
      });
      setExportType(undefined);
    }
  }, [downloadData?.data, exportStatusTrigger]);

  useEffect(() => {
    if (exportStatus) {
      downloadDataReload();
    }
  }, [exportStatusTrigger]);

  useEffect(() => {
    if (listData?.data) {
      console.log(listData?.data);
      setData(listData?.data);
      setLoading(false);
    }
  }, [listData]);

  let debounceTimeout: any;
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setUploadedFile(selectedFile);
      setOpenConfirmation(true);
    }
    setFileKey((prevKey) => prevKey + 1);
  };

  const handleConfirm = () => {
    setLoading(true);
    confirmFileUpload();
    setOpenConfirmation(false);
  };

  const handleCloseModal = () => {
    setIsRespModalOpen(false);
    setAltPartNosModal(false);
    setIsPreviewModalOpen(false);
    setPreviewData({});
    setAltPartNos([]);
  };

  const handleInputChange = (value: any, field: string) => {
    setLoading(true);
    const updatedData: any = { ...queryParams };
    updatedData[field] = value;
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      setQueryParams(updatedData);
    }, 500);
  };

  useEffect(() => {
    setLoading(false);
  }, [data]);

  const openPartNos = (part_numbers: any) => {
    console.log(part_numbers);
    setAltPartNos(part_numbers);
    setAltPartNosModal(true);
    console.log(part_numbers);
  };

  const confirmFileUpload = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', uploadedFile);
      const response = await uploadAPICall(
        endPoints.others.upload_spare_bulk,
        formData
      );
      if (response.status === true) {
        toastSuccess({
          title: 'Uploaded Successfully!!!',
          description: response.message,
        });
        setResponseData(response);
        setIsRespModalOpen(true);
        refreshSpares();
      } else {
        toastError({
          title: 'Oops!!!',
          description: response?.message,
        });
      }
      setLoading(false);
    } catch (err: TODO) {
      console.error('File upload error:', err);
      setLoading(false);
      toastError({
        title: 'Oops!!!',
        description: err?.message,
      });
    }
  };

  const handleClose = () => {
    setOpenConfirmation(false); // Close the modal on cancel or outside click
  };

  const handleSortChange = (columnId: string, direction: 'asc' | 'desc') => {
    setSortDirection((prevDirection) => {
      return prevDirection !== direction ? direction : prevDirection;
    });

    setSortBy((prevSortBy) => {
      return prevSortBy !== columnId ? columnId : prevSortBy;
    });

    setQueryParams((prevParams: TODO) => {
      if (
        prevParams.sort_field !== columnId ||
        prevParams.sort_order !== direction
      ) {
        setLoading(true);
        return {
          ...prevParams,
          sort_field: columnId,
          sort_order: direction,
          page: 1,
        };
      }
      return prevParams;
    });
  };

  const columnHelper = createColumnHelper<SpareDataColumn>();

  const columns = [
    columnHelper.display({
      cell: (info) => {
        const currentPage = listData?.current_page ?? 1;
        return (currentPage - 1) * 10 + info.row.index + 1;
      },
      header: '#',
      id: 'sNo',
      size: 60, // Optional: set a fixed width for the serial number column
    }),
    // columnHelper.accessor('id', {
    //   cell: (info) => 'SPA-' + info.getValue(),
    //   meta: {
    //     sortable: true,
    //     isNumeric: true,
    //     sortParam: 'id',
    //   },
    //   header: 'Spare ID',
    //   id: 'SpareID',
    //   size: 60, // Optional: set a fixed width for the serial number column
    // }),
    columnHelper.accessor('part_number', {
      cell: (info) => {
        return (
          <Text size={'sm'} padding={2} textAlign="left" pl={0} pr={0}>
            {highlightSearch(info.getValue() ?? '', queryParams?.part_number)}
          </Text>
        );
      },
      meta: {
        sortable: true,
        isNumeric: true,
        sortParam: 'part_number',
      },
      header: 'Part Number',
    }),
    columnHelper.accessor('description', {
      cell: (info) => {
        return (
          <Text size={'sm'} padding={2} textAlign="left" pl={0} pr={0}>
            {highlightSearch(info.getValue(), queryParams?.description)}
          </Text>
        );
      },
      meta: {
        sortable: true,
        sortParam: 'description',
      },
      header: 'Description',
    }),
    columnHelper.accessor('alternates', {
      header: 'Alternate Part Nos',
      cell: (info) => {
        return (
          <React.Fragment>
            <UnorderedList marginInlineStart={0} styleType="none">
              {info.getValue()?.map((item, index) => {
                return (
                  <ListItem
                    key={index}
                    display={`${queryParams?.part_number !== '' && item?.alternate_part_number.part_number.toLowerCase().includes(queryParams?.part_number.toLowerCase()) ? 'show' : 'none'}`}
                    width={'auto'}
                    mb={1}
                  >
                    <Text>
                      {highlightSearch(
                        item?.alternate_part_number?.part_number,
                        queryParams?.part_number
                      )}
                    </Text>
                  </ListItem>
                );
              })}
            </UnorderedList>
            <Button
              leftIcon={<HiEye />}
              colorScheme="blue"
              as="label"
              size={'sm'}
              isDisabled={info.getValue()?.length === 0}
              onClick={() => openPartNos(info.getValue())}
            >
              View
            </Button>
          </React.Fragment>
        );
      },
    }),

    columnHelper.accessor('unit_of_measure_id', {
      cell: (info) => getDisplayLabel(uomOptions, info.getValue(), 'uom'),
      header: 'UOM',
    }),
    columnHelper.accessor('spare_type_id', {
      cell: (info) =>
        getDisplayLabel(spareTypeOptions, info.getValue(), 'type'),
      header: 'Type',
      meta: {
        sortable: true,
        sortParam: 'spare_type',
      },
    }),
    columnHelper.accessor('spare_model_id', {
      cell: (info) =>
        getDisplayLabel(spareModelOptions, info.getValue(), 'model'),
      header: 'Model',
      meta: {
        sortable: true,
        sortParam: 'spare_model',
      },
    }),
    columnHelper.accessor('hsc_code_id', {
      cell: (info) =>
        info.getValue()
          ? getDisplayLabel(hscCodeOptions, info.getValue(), 'un')
          : ' - ',
      header: 'HSC.Code',
      meta: {
        sortable: false,
      },
    }),
    columnHelper.accessor('un_id', {
      cell: (info) =>
        info.getValue()
          ? getDisplayLabel(unOptions, info.getValue(), 'un')
          : ' - ',
      header: 'UN',
      meta: {
        sortable: true,
        sortParam: 'un',
      },
    }),
    columnHelper.accessor('is_shelf_life', {
      cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      header: 'Shelf Life',
    }),
    columnHelper.accessor('is_llp', {
      cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      header: 'LLP',
    }),
    columnHelper.accessor('is_serialized', {
      cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      header: 'Serial Item',
    }),
    columnHelper.accessor('is_dg', {
      cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      header: 'DG',
    }),
    columnHelper.accessor('user.username', {
      cell: (info) => info.getValue(),
      header: 'Created User',
    }),
    columnHelper.accessor('created_at', {
      cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
      header: 'Created Date',
      id: 'created_at',
      meta: {
        sortable: true,
        sortParam: 'created_at',
      },
    }),
    columnHelper.accessor('actions', {
      cell: (info) => {
        return (
          <Menu>
            <MenuButton
              as={Button}
              size={'sm'}
              bg="#0C2556"
              color="white"
              _hover={{ color: '#0C2556', bg: '#fff' }}
              _active={{ color: '#0C2556', bg: '#fff' }}
              rightIcon={<ChevronDownIcon />}
            >
              Actions
            </MenuButton>
            <MenuList
              width="150px"
              maxW="150px"
              minW="150px"
              boxShadow="md"
              sx={{ overflow: 'hidden', padding: '4px' }}
            >
              <MenuItem
                width="170px"
                onClick={() =>
                  navigate(`/spares-master/${info.row.original.id}/edit`)
                }
              >
                Edit
              </MenuItem>
              <MenuItem
                width="170px"
                onClick={() => triggerPreview(info.row.original)}
              >
                Preview
              </MenuItem>
              <MenuItem
                width="170px"
                onClick={() =>
                  navigate(`/spares-master/${info.row.original.id}`)
                }
              >
                View
              </MenuItem>

              <MenuItem
                width="170px"
                onClick={() =>
                  navigate(
                    `/spares-master/${info.row.original.id}/assign-alternate`
                  )
                }
              >
                Assign Alternates
              </MenuItem>
            </MenuList>
          </Menu>
        );
      },
      header: () => <Text textAlign="end">Actions</Text>,
      meta: {
        isNumeric: true,
      },
    }),
  ];

  const exportColumns = [
    columnHelper.display({
      cell: (info) => {
        const currentPage = listData?.current_page ?? 1;
        return (currentPage - 1) * 10 + info.row.index + 1;
      },
      header: '#',
      id: 'sNo',
      size: 60, // Optional: set a fixed width for the serial number column
    }),
    columnHelper.accessor('part_number', {
      cell: (info) => info.getValue(),
      header: 'Part Number',
    }),
    columnHelper.accessor('description', {
      cell: (info) => info.getValue(),
      header: 'Description',
    }),
    columnHelper.accessor('alternates', {
      header: 'Alt Part Nos',
      cell: (info) => {
        const altParts = info.getValue();
        return (
          altParts
            ?.map((alt: any) => alt.alternate_part_number?.part_number)
            .join(', ') || '-'
        );
      },
    }),

    columnHelper.accessor('unit_of_measure_id', {
      cell: (info) => getDisplayLabel(uomOptions, info.getValue(), 'uom'),
      header: 'UOM',
    }),
    columnHelper.accessor('spare_type_id', {
      cell: (info) =>
        getDisplayLabel(spareTypeOptions, info.getValue(), 'type'),
      header: 'Type',
      meta: {
        sortable: true,
        sortParam: 'spare_type',
      },
    }),
    columnHelper.accessor('spare_model_id', {
      cell: (info) =>
        getDisplayLabel(spareModelOptions, info.getValue(), 'model'),
      header: 'Model',
      meta: {
        sortable: true,
        sortParam: 'spare_model',
      },
    }),
    columnHelper.accessor('hsc_code_id', {
      cell: (info) =>
        info.getValue()
          ? getDisplayLabel(hscCodeOptions, info.getValue(), 'un')
          : ' - ',
      header: 'HSC.Code',
      meta: {
        sortable: false,
      },
    }),
    columnHelper.accessor('un_id', {
      cell: (info) =>
        info.getValue()
          ? getDisplayLabel(unOptions, info.getValue(), 'un')
          : ' - ',
      header: 'UN',
      meta: {
        sortable: true,
        sortParam: 'un',
      },
    }),
    columnHelper.accessor('is_shelf_life', {
      cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      header: 'Shel Life',
    }),
    columnHelper.accessor('is_llp', {
      cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      header: 'LLP',
    }),
    columnHelper.accessor('is_serialized', {
      cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      header: 'Seri Item',
    }),
    columnHelper.accessor('is_dg', {
      cell: (info) => (info.getValue() ? 'Yes' : 'No'),
      header: 'DG',
    }),
    columnHelper.accessor('user.username', {
      cell: (info) => info.getValue(),
      header: 'Created User',
    }),
    columnHelper.accessor('created_at', {
      cell: (info) => format(new Date(info.getValue()), 'dd/MM/yy'),
      header: 'Created Date',
      id: 'created_at',
    }),
    columnHelper.accessor('actions', {
      cell: (info) => {
        return (
          <Menu>
            <MenuButton
              as={Button}
              size={'sm'}
              bg="#0C2556"
              color="white"
              _hover={{ color: '#0C2556', bg: '#fff' }}
              _active={{ color: '#0C2556', bg: '#fff' }}
              rightIcon={<ChevronDownIcon />}
            >
              Actions
            </MenuButton>
            <MenuList
              width="150px"
              maxW="150px"
              minW="150px"
              boxShadow="md"
              sx={{ overflow: 'hidden', padding: '4px' }}
            >
              <MenuItem
                width="170px"
                onClick={() =>
                  navigate(`/spares-master/${info.row.original.id}/edit`)
                }
              >
                Edit
              </MenuItem>
              <MenuItem
                width="170px"
                onClick={() => triggerPreview(info.row.original)}
              >
                Preview
              </MenuItem>
              <MenuItem
                width="170px"
                onClick={() =>
                  navigate(`/spares-master/${info.row.original.id}`)
                }
              >
                View
              </MenuItem>

              <MenuItem
                width="170px"
                onClick={() =>
                  navigate(
                    `/spares-master/${info.row.original.id}/assign-alternate`
                  )
                }
              >
                Assign Alternates
              </MenuItem>
            </MenuList>
          </Menu>
        );
      },
      header: 'Actions',
      meta: {
        isNumeric: true,
      },
    }),
  ];

  const triggerPreview = async (spareDetails: any) => {
    console.log('Spare Details', spareDetails);
    let popupVariables: any = {};
    popupVariables.spareModelOptions = spareModelOptions;
    popupVariables.spareTypeOptions = spareTypeOptions;
    popupVariables.hscCodeOptions = hscCodeOptions;
    popupVariables.uomOptions = uomOptions;
    popupVariables.unOptions = unOptions;
    Object.keys(spareDetails).forEach(function (key) {
      popupVariables[key] = spareDetails[key];
    });
    console.log(popupVariables);
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Spares Master
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/spares-master/create')}
          >
            Add New spare
          </ResponsiveIconButton>
        </HStack>

        <Formiz autoForm connect={mobileForm}>
          <Box width="100%" display={{ base: 'flex', md: 'none' }}>
            <Accordion defaultIndex={[]} allowToggle w={'100%'}>
              <AccordionItem border="none">
                {({ isExpanded }) => (
                  <>
                    <AccordionButton
                      px={4}
                      py={2}
                      bg="white"
                      borderRadius="md"
                      _expanded={{
                        bg: 'white',
                        borderBottomEndRadius: 0,
                        borderBottomStartRadius: 0,
                      }}
                      width="100%"
                    >
                      <Box flex="1" textAlign="left">
                        Filter Options
                      </Box>
                      <AccordionIcon />
                    </AccordionButton>
                    <AccordionPanel p={0}>
                      <Stack
                        direction={{ base: 'column', md: 'row' }}
                        bg={'white'}
                        p={6}
                        borderRadius={4}
                        spacing={4}
                        align={'flex-start'}
                        justify={'flex-start'}
                      >
                        <FieldInput
                          name="part_number"
                          placeholder="Part Number"
                          w={{ base: 'full', md: '20%' }}
                          onValueChange={(value) =>
                            handleInputChange(value, 'part_number')
                          }
                        />
                        <FieldInput
                          name="description"
                          placeholder="Description"
                          w={{ base: 'full', md: '20%' }}
                          onValueChange={(value) =>
                            handleInputChange(value, 'description')
                          }
                        />
                        <Text>tatatata</Text>
                        <Button
                          type="reset"
                          bg={'gray.200'}
                          variant="@primary"
                          size={'sm'}
                          leftIcon={<HiRefresh />}
                          w={{ base: 'full', md: 'auto' }}
                          onClick={() => {
                            mobileForm.reset();
                            setQueryParams(initialFormData);
                            mobileForm.setValues({
                              part_number: '',
                              description: '',
                            });
                          }}
                        >
                          Reset Form
                        </Button>
                      </Stack>
                    </AccordionPanel>
                    {!isExpanded && (
                      <Box display={{ md: 'none' }} p={6}>
                        {/* Placeholder box to maintain space when accordion is collapsed */}
                      </Box>
                    )}
                  </>
                )}
              </AccordionItem>
            </Accordion>
          </Box>
        </Formiz>

        <Formiz autoForm connect={form}>
          <Box>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              display={{ base: 'none', md: 'flex' }}
              bg={'white'}
              p={6}
              borderRadius={4}
              spacing={4}
              align={'flex-start'}
              justify={'flex-start'}
              mt={2}
            >
              <FieldInput
                name="part_number"
                placeholder="Part Number"
                label="Part Number"
                w={{ base: 'full', md: '20%' }}
                size={'sm'}
                onValueChange={(value) =>
                  handleInputChange(value, 'part_number')
                }
              />
              <FieldInput
                name="description"
                size={'sm'}
                placeholder="Description"
                label="Description"
                w={{ base: 'full', md: '20%' }}
                onValueChange={(value) =>
                  handleInputChange(value, 'description')
                }
              />
              <Stack>
                <Text fontSize="sm">&nbsp;</Text>
                <Button
                  type="reset"
                  size={'sm'}
                  variant="@primary"
                  leftIcon={<HiRefresh />}
                  w={{ base: 'full', md: 'auto' }}
                  onClick={() => {
                    mobileForm.reset();
                    form.setValues({ part_number: '', description: '' });
                    setQueryParams(initialFormData);
                  }}
                >
                  Reset Form
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Formiz>
        <LoadingOverlay isLoading={exportStatus}>
          <Box borderRadius={4}>
            {/* Table goes here */}

            <HStack
              bg={'white'}
              justify={'space-between'}
              mb={4}
              p={4}
              borderTopRadius={4}
            >
              <Heading as="h4" size={'md'}>
                Spares Master List
              </Heading>
              <Input
                type="file"
                accept=".csv" // Add file types you want to accept
                display="none" // Hide the default input file
                id="file-upload-input"
                key={fileKey}
                onChange={handleFileChange}
              />
              <HStack ml="auto">
                <Button
                  leftIcon={<LuDownload />}
                  colorScheme="blue"
                  as="label"
                  size={'sm'}
                  isDisabled={loading}
                  onClick={() =>
                    handleDownload(import.meta.env.VITE_SPARES_SAMPLE_CSV)
                  }
                >
                  Download Sample
                </Button>

                <Button
                  leftIcon={<LuUpload />}
                  colorScheme="green"
                  size={'sm'}
                  onClick={() => navigate('/spares-master/bulk/upload')}
                >
                  Upload Spares
                </Button>

                <Box ml="auto" display="flex" alignItems="center">
                  <TableExport
                    loading={loading}
                    showPerPage={true}
                    exportTableData={(format: string, perpage?: any) =>
                      exportTableData(format, perpage ?? -1)
                    }
                  />
                </Box>
                <Box ml="auto" display="flex" alignItems="center">
                  <PageLimit
                    currentLimit={itemsPerPage}
                    loading={sparesLoading}
                    changeLimit={changePageLimit}
                  />
                </Box>
              </HStack>
            </HStack>
            <DataTable
              columns={columns}
              data={data}
              loading={sparesLoading || loading}
              tableProps={{ variant: 'simple' }}
              onSortChange={handleSortChange}
              sortDirection={sortDirection}
              sortBy={sortBy}
            />
            <Box p={4} mt={4} display="flex" justifyContent="space-between">
              {listData && listData?.total && (
                <Text fontSize="sm" color="gray.500">
                  {`Showing ${(listData?.current_page - 1) * itemsPerPage + 1} to ${Math.min(listData?.current_page * itemsPerPage, listData?.total)} of ${listData?.total} records`}
                </Text>
              )}
              <Pagination
                currentPage={listData?.current_page ?? 1}
                totalCount={listData?.total ?? 0}
                pageSize={itemsPerPage}
                onPageChange={(page) => {
                  setQueryParams({ ...queryParams, page });
                }}
              />
            </Box>
            <ConfirmationPopup
              isOpen={openConfirmation}
              onClose={handleClose}
              onConfirm={handleConfirm}
              headerText="Upload File"
              bodyText="Are you sure you want to upload this file?"
            />
            <FileUploadResponseModal
              isOpen={isRespModalOpen}
              onClose={handleCloseModal}
              response={responseData}
            />

            <AltPartInfoPopup
              isOpen={showAltPartNosModal}
              onClose={handleCloseModal}
              altPartNos={altPartNos}
            />
          </Box>
        </LoadingOverlay>
      </Stack>
      <PreviewPopup
        isOpen={isPreviewModalOpen}
        onClose={handleCloseModal}
        data={previewData}
      />
    </SlideIn>
  );
};

export default SparesMaster;
