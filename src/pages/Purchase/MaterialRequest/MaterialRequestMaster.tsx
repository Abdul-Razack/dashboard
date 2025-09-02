import { useEffect, useState } from 'react';

import {
  Box,
  HStack,
  Heading,
  Stack,
  Tab,
  TabList,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { DataTable } from '@/components/DataTable';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PDFPreviewModal } from '@/components/PDFPreview';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { MaterialRequestSearch } from '@/components/SearchBars/Purchase/MaterialRequest';
import { SlideIn } from '@/components/SlideIn';
import { TableExport } from '@/components/TableExport';
import { useToastSuccess } from '@/components/Toast';
import { exportTableAs } from '@/helpers/commonHelper';
import { usePRIndex } from '@/services/purchase/purchase-request/services';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

const MaterialRequestMaster = () => {
  const navigate = useNavigate();
  const [routerParams] = useSearchParams();
  const hasQueryParams = routerParams.toString() !== '';
  const location = useLocation();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<TODO>([]);
  const [actualQParams, setActualQParams] = useState<TODO>({});
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [columns, setColumns] = useState<TODO>([]);
  const [listData, setListData] = useState<TODO>({});
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('id');
  const [exportStatus, triggerExport] = useState(false);
  const [exportType, setExportType] = useState<'csv' | 'pdf' | undefined>(
    undefined
  );
  const [exportStatusTrigger, setExportStatusTrigger] = useState(0);
  const toastSuccess = useToastSuccess();
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [queryParams, setQueryParams] = useState<TODO>({
    is_closed: 0,
    page: 1,
    sort_field: sortBy,
    sort_order: sortDirection,
    per_page: itemsPerPage,
  });

  const [pdfUrl, setPDFUrl] = useState<string>('');
  const [pdfTitle, setPDFTitle] = useState<string>('');

  const { data: downloadData, refetch: downloadDataReload } = usePRIndex(
    {
      ...actualQParams,
      per_page: '-1',
    },
    { enabled: false }
  );

  useEffect(() => {
    if (downloadData?.data && exportStatus) {
      triggerExport(false);
      exportTableAs(
        columns,
        downloadData?.data,
        'material-request',
        exportType
      );
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
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      is_closed: selectedTab === 0 ? '' : selectedTab === 1 ? 0 : 1,
      page: 1,
    }));
  }, [selectedTab]);

  const exportTableData = (type: any) => {
    setExportType(type);
    triggerExport(true);
    setExportStatusTrigger((prev) => prev + 1);
  };

  const handleResponse = (data: any, columns: any, currentQueryparams: any) => {
    setActualQParams(currentQueryparams);
    setColumns(columns);
    setListData(data);
    setData(data?.data);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleOpenPreview = async (MRDetails: any) => {
    console.log(MRDetails);
    const title = `Material Request - #${MRDetails.id}`;
    const PDFLink = endPoints.others.mr_pdf_preview.replace(
      ':id',
      MRDetails.id
    );
    setPDFTitle(title);
    setPDFUrl(PDFLink);
    setIsPreviewModalOpen(true);
  };

  const handleLoader = (status: boolean) => {
    setLoading(status);
  };

  const gotoCreate = () => {
    if (!hasQueryParams) {
      navigate('/purchase/purchase-request/create');
    } else {
      navigate(`/purchase/purchase-request/create${location.search}`);
    }
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

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Material Request Master
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={gotoCreate}
          >
            Add Request
          </ResponsiveIconButton>
        </HStack>

        <MaterialRequestSearch
          onSearchFinished={handleResponse}
          setModuleLoading={handleLoader}
          additionalParams={queryParams}
          onPreviewClicked={handleOpenPreview}
          isModal={false}
        />

        <Box borderRadius={4}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Tabs
              position="relative"
              variant="unstyled"
              onChange={(index) => setSelectedTab(index)}
            >
              <TabList>
                <Tab
                  bg={selectedTab === 0 ? '#0C2556' : 'gray.200'}
                  color={selectedTab === 0 ? 'white' : 'black'}
                >
                  All
                </Tab>
                <Tab
                  bg={selectedTab === 1 ? '#0C2556' : 'gray.200'}
                  color={selectedTab === 1 ? 'white' : 'black'}
                >
                  Open
                </Tab>
                <Tab
                  bg={selectedTab === 2 ? '#0C2556' : 'gray.200'}
                  color={selectedTab === 2 ? 'white' : 'black'}
                >
                  Closed
                </Tab>
              </TabList>
            </Tabs>
            <Box ml="auto" display="flex" alignItems="center">
              <TableExport
                loading={loading}
                exportTableData={(format: string) => exportTableData(format)}
              />
              <PageLimit
                currentLimit={itemsPerPage}
                loading={loading}
                changeLimit={changePageLimit}
              />
            </Box>
          </Box>
          <LoadingOverlay isLoading={loading || exportStatus}>
            <DataTable
              columns={columns}
              data={data}
              loading={loading}
              tableProps={{ variant: 'simple' }}
              onSortChange={handleSortChange}
              sortDirection={sortDirection}
              sortBy={sortBy}
            />
            <Box
              p={4}
              mt={4}
              justifyContent="space-between"
              display={loading || data?.length === 0 ? 'none' : 'flex'}
            >
              {listData && listData?.total > 0 && (
                <Text fontSize="sm" color="gray.500">
                  {`Showing ${listData?.current_page * 10 - 9} to ${Math.min(listData?.current_page * 10, listData?.total)} of ${listData?.total} records`}
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
          </LoadingOverlay>
        </Box>

        <PDFPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={() => {
            setIsPreviewModalOpen(false);
          }}
          pdfUrlOrEndpoint={pdfUrl}
          isEndpoint={true}
          title={pdfTitle}
        />
      </Stack>
    </SlideIn>
  );
};

export default MaterialRequestMaster;
