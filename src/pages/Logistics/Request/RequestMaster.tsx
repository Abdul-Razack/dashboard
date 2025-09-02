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
import { UseQueryResult } from 'react-query';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/DataTable';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import PreviewPopup from '@/components/PreviewContents/Logistics/LogisticRequest';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { LRSearch } from '@/components/SearchBars/Logistics/Request';
import { SlideIn } from '@/components/SlideIn';
import {
  convertToOptions,
  formatShippingAddress,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import {
  useCustomerList,
  useCustomerSupplierList,
} from '@/services/master/services';
import {
  fetchShippingAddressInfo,
  useShippingAddressIndex,
} from '@/services/master/shipping/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';

type QueryData = {
  status: boolean;
  items?: Record<string, string | number>;
};

export const LogisticsRequestMaster = () => {
  const [shipperCustomer, setShipperCustomer] = useState<number>(0);
  const [receiverCustomer, setReceiverCustomer] = useState<number>(0);
  const [uomOptions, setUOMOptions] = useState<any>([]);
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

  const navigate = useNavigate();
  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const shipTypeList = useShipTypesList();
  const shipTypeOptions = transformToSelectOptions(shipTypeList.data);
  const shipViaList = useShipViaList();
  const shipViaOptions = transformToSelectOptions(shipViaList.data);
  const customerList = useCustomerList();
  const customerOptions = transformToSelectOptions(customerList.data);
  const packageTypeList = usePackageTypeList();
  const packageTypeOptions = transformToSelectOptions(packageTypeList.data);
  const conditionList: UseQueryResult<QueryData, unknown> = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList.data);
  const uomList = useUnitOfMeasureIndex();
  const getShippingAddressInfo = fetchShippingAddressInfo();

  const goodsTypes = [
    { value: 'true', label: 'DG' },
    { value: 'false', label: 'Non-DG' },
  ];
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<TODO>({});
  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
  };

  useEffect(() => {
    if (uomList.data?.items) {
      console.log(uomList.data?.items);
      setUOMOptions(uomList.data?.items);
    }
  }, [uomList.isSuccess]);

  useEffect(() => {
    console.log(uomOptions);
  }, [uomOptions]);

  const customerListSupplier = useCustomerSupplierList({
    type: 'suppliers',
  });

  const shipperOptions = customerListSupplier.data?.data.map((customer) => ({
    value: customer.id,
    label: customer.business_name,
  }));

  const { data: consignorShippingIndex } = useShippingAddressIndex(
    {
      search: {
        customer_id: shipperCustomer,
      },
    },
    {
      enabled: shipperCustomer !== 0,
    }
  );

  const consignorShippingOptions = consignorShippingIndex?.data?.map(
    (item) => ({
      value: item.id,
      label: item.address,
    })
  );

  const { data: consigneeShippingIndex } = useShippingAddressIndex(
    {
      search: {
        customer_id: receiverCustomer,
      },
    },
    {
      enabled: receiverCustomer !== 0,
    }
  );

  const consigneeShippingOptions = consigneeShippingIndex?.data?.map(
    (item) => ({
      value: item.id,
      label: item.address,
    })
  );

  useEffect(() => {
    if (consignorShippingIndex) {
      setPreviewData((prevState: any) => ({
        ...prevState, // Spread previous state to preserve other properties
        ['consignorShippingOptions']: consignorShippingOptions, // Update the specific property
      }));
    }
    if (consigneeShippingIndex) {
      setPreviewData((prevState: any) => ({
        ...prevState, // Spread previous state to preserve other properties
        ['consigneeShippingOptions']: consigneeShippingOptions, // Update the specific property
      }));
    }
  }, [consigneeShippingIndex, consignorShippingIndex]);

  const handleOpenPreview = async (data: any) => {
    setPopupLoader(true);
    try {
      let popupVariables: any = {};
      setPreviewData({});
      let shipperContactAddress: string = '';
      let receiverContactAddress: string = '';

      if (data.customer_shipping_address_id > 0) {
        const shippingAddressInfo = await getShippingAddressInfo(
          data.customer_shipping_address_id
        );
        shipperContactAddress = formatShippingAddress(shippingAddressInfo);
      }

      if (data.receiver_shipping_address_id > 0) {
        const receiverAddressInfo = await getShippingAddressInfo(
          data.receiver_shipping_address_id
        );
        receiverContactAddress = formatShippingAddress(receiverAddressInfo);
      }

      let ref_number: any = '';
      if (data?.purchase_orders.length > 0) {
        ref_number = data?.purchase_orders[0].purchase_order_id;
      }
      const isPrevShipperSame = shipperCustomer === data.customer_id;
      const isPrevReceiverSame = receiverCustomer === data.receiver_customer_id;
      setShipperCustomer(data.customer_id);
      setReceiverCustomer(data.receiver_customer_id);
      popupVariables.packageTypeOptions = packageTypeOptions;
      popupVariables.conditionOptions = conditionOptions;
      popupVariables.customerOptions = customerOptions;
      popupVariables.packageTypeList = packageTypeList;
      popupVariables.priorityOptions = priorityOptions;
      popupVariables.shipTypeOptions = shipTypeOptions;
      popupVariables.organizedItems = [];
      popupVariables.shipViaOptions = shipViaOptions;
      popupVariables.shipperOptions = shipperOptions;
      popupVariables.uomOptions = convertToOptions(uomOptions);
      popupVariables.uomItems = uomOptions;
      popupVariables.goodsTypes = goodsTypes;
      popupVariables.uomList = uomList;
      popupVariables.allPoItems = data?.items;
      popupVariables.rows = data?.packages;
      popupVariables.shipperContactAddress = shipperContactAddress;
      popupVariables.receiverContactAddress = receiverContactAddress;
      popupVariables.addedQuantities = data.items.reduce(
        (acc: any, item: any) => {
          acc[item.id] = item.qty; // Use the `id` as the key and `qty` as the value
          return acc;
        },
        {}
      );

      popupVariables.ref_no = ref_number.toString();

      Object.keys(data).forEach((key) => {
        popupVariables[key] = data[key];
      });
      popupVariables.is_dg = popupVariables.is_dg.toString();

      if (isPrevReceiverSame) {
        popupVariables.consignorShippingOptions = consignorShippingOptions;
      }
      if (isPrevShipperSame) {
        popupVariables.consigneeShippingOptions = consigneeShippingOptions;
      }
      setPreviewData(popupVariables);
      setIsPreviewModalOpen(true);
    } catch (error) {
      console.error('Failed to load details:', error);
    } finally {
      setPopupLoader(false);
    }
  };

  const [columns, setColumns] = useState<TODO>([]);
  const [listData, setListData] = useState<TODO>({});
  const [data, setData] = useState<TODO>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [popupLoader, setPopupLoader] = useState(false);

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

  const handleResponse = (data: any, columns: any) => {
    console.log(data);
    setColumns(columns);
    setListData(data);
    setData(data?.data);
    setTimeout(() => {
      handleLoader(false);
    }, 800);
  };

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  const handleLoader = (status: boolean) => {
    setLoading(status);
  };

  useEffect(() => {
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      is_closed: selectedTab === 0 ? '' : selectedTab === 1 ? 0 : 1,
      page: 1,
    }));
  }, [selectedTab]);

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Logistics Requests
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/logistics/request/create')}
          >
            Add Logistics Request
          </ResponsiveIconButton>
        </HStack>

        <LRSearch
          onSearchFinished={handleResponse}
          setModuleLoading={handleLoader}
          additionalParams={queryParams}
          onPreviewClicked={handleOpenPreview}
          isModal={false}
        />
        <LoadingOverlay isLoading={loading || popupLoader}>
          <Box borderRadius={4}>
            {/* Table goes here */}
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
                currentPage={listData.current_page ?? 1}
                totalCount={listData.total ?? 0}
                pageSize={itemsPerPage}
                onPageChange={(page) => {
                  setQueryParams({ ...queryParams, page });
                }}
              />
            </Box>
          </Box>
        </LoadingOverlay>
        <PreviewPopup
          isOpen={isPreviewModalOpen}
          onClose={handleCloseModal}
          data={previewData}
        />
      </Stack>
    </SlideIn>
  );
};

export default LogisticsRequestMaster;
