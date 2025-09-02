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
import { PreviewPopup } from '@/components/PreviewContents/Purchase/PRFQ';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { PRFQSearch } from '@/components/SearchBars/Purchase/RFQ';
import { SlideIn } from '@/components/SlideIn';
import { transformToSelectOptions } from '@/helpers/commonHelper';
import { getAPICall } from '@/services/apiService';
import { ContactManagerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import { useConditionList } from '@/services/submaster/conditions/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

const PRFQMaster = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [popupLoading, showPopupLoader] = useState<boolean>(false);
  const [data, setData] = useState<TODO>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [sortBy, setSortBy] = useState<string>('id');
  const [previewData, setPreviewData] = useState<any>([]);
  const [columns, setColumns] = useState<TODO>([]);
  const [listData, setListData] = useState<TODO>({});
  const conditionList = useConditionList();
  const uomList = useUnitOfMeasureList();
  const priorityList = usePriorityList();

  const [searchParams] = useSearchParams();
  const hasQueryParams = searchParams.toString() !== '';

  const updateContactInfo = async (rows: any) => {
    const updatedArray = await Promise.all(
      rows.map(async (item: any) => {
        const detailResponse = await getAPICall(
          `/customer-contact-manager/${item.customer_contact_manager_id}`,
          ContactManagerInfoSchema
        );
        return { ...item, selectedContact: detailResponse };
      })
    );
    setPreviewData((prevData: TODO) => ({
      ...prevData,
      rows: updatedArray,
    }));
    console.log(updatedArray);
    showPopupLoader(false);
    setIsPreviewModalOpen(true);
  };
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [queryParams, setQueryParams] = useState<TODO>({
    is_closed: 0,
    page: 1,
    sort_field: sortBy,
    sort_order: sortDirection,
    per_page: itemsPerPage,
  });

  useEffect(() => {
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      is_closed: selectedTab === 0 ? '' : selectedTab === 1 ? 0 : 1,
      page: 1,
    }));
  }, [selectedTab]);

  useEffect(() => {
    console.log(previewData);
  }, [previewData]);

  const handleOpenPreview = (
    previewContent: any,
    forVendor?: boolean,
    customerId?: number
  ) => {
    showPopupLoader(true);
    let customers: any = previewContent.customers;
    let purchase_request_ids = previewContent.purchase_requests?.map(
      (item: any) => item.id
    );
    let newRows: any = [];
    console.log(previewContent, customerId, customers);
    customers.forEach((customer: any, index: number) => {
      let obj = {
        id: Number(index + 1),
        customer_id: customer.customer_id,
        purchase_request_ids: purchase_request_ids,
        customer_contact_manager_id: customer.customer_contact_manager_id,
        selectedContact: null,
      };
      newRows.push(obj);
    });
    updateContactInfo(newRows);
    let popupVariables: any = {};
    popupVariables.prfq_id = previewContent.id;
    popupVariables.created_at = previewContent.created_at;
    popupVariables.user = previewContent.user;
    popupVariables.items = previewContent.items;
    popupVariables.priority_id = previewContent.priority_id;
    popupVariables.need_by_date = previewContent.need_by_date;
    popupVariables.purchase_request_ids = purchase_request_ids;
    popupVariables.conditionOptions = transformToSelectOptions(
      conditionList?.data
    );
    popupVariables.uomOptions = transformToSelectOptions(uomList?.data);
    popupVariables.priorityOptions = transformToSelectOptions(
      priorityList?.data
    );
    popupVariables.rows = [];
    popupVariables.forVendor = forVendor;
    popupVariables.rowId = 0;
    if (customerId) {
      popupVariables.rowId = customers.findIndex(
        (customer: any) => customer.customer_id === customerId
      );
    }
    popupVariables.remarks = previewContent.remarks;
    console.log(popupVariables);
    setPreviewData(popupVariables);
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
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
    console.log(columnId, direction);
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
            Purchase RFQ
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/purchase/prfq/create')}
          >
            Add RFQ
          </ResponsiveIconButton>
        </HStack>

        <PRFQSearch
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
          <LoadingOverlay isLoading={loading || popupLoading}>
            <DataTable
              columns={columns}
              data={data}
              loading={loading}
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
                totalCount={listData?.total ?? 0}
                pageSize={itemsPerPage}
                onPageChange={(page) => {
                  setQueryParams({ ...queryParams, page });
                }}
              />
            </Box>
          </LoadingOverlay>
        </Box>

        <PreviewPopup
          isOpen={isPreviewModalOpen}
          onClose={handleCloseModal}
          data={previewData}
        />
      </Stack>
    </SlideIn>
  );
};

export default PRFQMaster;
