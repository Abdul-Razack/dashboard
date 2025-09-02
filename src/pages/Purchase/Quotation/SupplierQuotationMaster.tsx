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
import { useNavigate, useSearchParams } from 'react-router-dom';

import { DataTable } from '@/components/DataTable';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { QuotationSearch } from '@/components/SearchBars/Purchase/Quotation';
import { SlideIn } from '@/components/SlideIn';

const SupplierQuotationMaster = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  // const [popupLoading, showPopupLoader] = useState<boolean>(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('id');
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [queryParams, setQueryParams] = useState<TODO>({
    is_closed: 0,
    page: 1,
    sort_field: sortBy,
    sort_order: sortDirection,
    per_page: itemsPerPage,
  });

  const [columns, setColumns] = useState<TODO>([]);
  const [listData, setListData] = useState<TODO>({});
  const [data, setData] = useState<TODO>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [searchParams] = useSearchParams();
  const hasQueryParams = searchParams.toString() !== '';

  const handleLoader = (status: boolean) => {
    setLoading(status);
  };

  const handleResponse = (data: any, columns: any) => {
    console.log(data, columns);
    setColumns(columns);
    setListData(data);
    setData(data?.data);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const handleOpenPreview = (previewContent: any) => {
    //showPopupLoader(true);
    console.log(previewContent);
  };

  useEffect(() => {
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      is_closed: selectedTab === 0 ? '' : selectedTab === 1 ? 0 : 1,
      page: 1,
    }));
  }, [selectedTab]);

  useEffect(() => {
    const urlParams = Object.fromEntries(searchParams.entries());
    let existingQueryParmas: TODO = queryParams;
    if (urlParams.hasOwnProperty('rfq')) {
      existingQueryParmas.rfq_id = urlParams?.rfq;
    }
    if (urlParams.hasOwnProperty('customer')) {
      existingQueryParmas.customer_id = urlParams?.customer;
    }
    setQueryParams(existingQueryParmas);
  }, [hasQueryParams]);

  const handleSortChange = (columnId: string, direction: 'asc' | 'desc') => {
    // console.log(columnId, direction)
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
            Supplier Pricing
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/purchase/quotation/create')}
          >
            Add Supplier Pricing
          </ResponsiveIconButton>
        </HStack>

        <QuotationSearch
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
            <PageLimit
              currentLimit={itemsPerPage}
              loading={listData.isLoading}
              changeLimit={changePageLimit}
            />
          </Box>
          <LoadingOverlay isLoading={loading}>
            {/* || popupLoading */}
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
              display={loading || data?.length === 0 ? 'none' : 'flex'}
              justifyContent="space-between"
            >
              {listData && listData?.total > 0 && (
                <Text fontSize="sm" color="gray.500">
                  {`Showing ${(listData?.current_page - 1) * itemsPerPage + 1} to ${Math.min(listData?.current_page * itemsPerPage, listData?.total)} of ${listData?.total} records`}
                </Text>
              )}
              <Pagination
                currentPage={listData?.current_page ?? 1}
                totalCount={listData.total ?? 0}
                pageSize={itemsPerPage}
                onPageChange={(page) => {
                  setQueryParams({ ...queryParams, page });
                }}
              />
            </Box>
          </LoadingOverlay>
        </Box>
      </Stack>
    </SlideIn>
  );
};

export default SupplierQuotationMaster;
