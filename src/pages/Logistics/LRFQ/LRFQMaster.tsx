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
import dayjs from 'dayjs';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

import { DataTable } from '@/components/DataTable';
import LoadingOverlay from '@/components/LoadingOverlay';
import Pagination from '@/components/Pagination';
import PreviewPopup from '@/components/PreviewContents/Logistics/LRFQ';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { LRFQSearch } from '@/components/SearchBars/Logistics/RFQ';
import { SlideIn } from '@/components/SlideIn';
import {
  convertToOptions,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import { getAPICall } from '@/services/apiService';
import { ContactManagerInfoSchema } from '@/services/apiService/Schema/CustomerSchema';
import { LRFQInfoPayload } from '@/services/apiService/Schema/LRFQSchema';
import { InfoPayload } from '@/services/apiService/Schema/LRSchema';
import { useCustomerList } from '@/services/master/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { usePriorityList } from '@/services/submaster/priority/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { useShipViaList } from '@/services/submaster/ship-via/services';
import { useUnitOfMeasureIndex } from '@/services/submaster/unitofmeasure/services';
import { PageLimit } from '@/components/PageLimit';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

const PRFQMaster = () => {
  const navigate = useNavigate();
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
  const [popupLoading, setPopupLoader] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewData, setPreviewData] = useState<TODO>([]);
  const [lrfqid, setLRFQID] = useState<number | null>(null);
  const [uniqueLRIds, setuniqueLRIds] = useState<any>([]);
  const [lrid, setLRID] = useState<number | null>(null);
  const [activeLRInfo, setActiveLRInfo] = useState<any | null>(null);
  const [lrfqInfo, setLRFQInfo] = useState<any | null>(null);
  const [items, setItems] = useState<any>({});
  const [packageItems, setPackageItems] = useState<any>([]);
  const [rows, setRows] = useState<TODO>([]);
  const [tableItems, setTableItems] = useState<any>([]);

  const priorityList = usePriorityList();
  const priorityOptions = transformToSelectOptions(priorityList.data);
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const shipViaList = useShipViaList();
  const shipViaOptions = transformToSelectOptions(shipViaList.data);
  const packageTypeList = usePackageTypeList();
  const packageTypeOptions = transformToSelectOptions(packageTypeList.data);
  const conditionList = useConditionList();
  const conditionOptions = transformToSelectOptions(conditionList?.data);
  const customerList = useCustomerList({
    type: 'freight',
  });
  const unitOfMeasureList = useUnitOfMeasureIndex();
  const shipTypeList = useShipTypesList();
  const shipTypeOptions = transformToSelectOptions(shipTypeList.data);
  const [relatedLRIds, setRelatedLRIds] = useState<number[]>([]);
  const customerOptions = transformToSelectOptions(customerList.data);

  const goodsTypes = [
    { value: 'true', label: 'DG' },
    { value: 'false', label: 'Non-DG' },
  ];

  const lrTypes = [
    // { value: 'so', label: 'SO' },
    { value: 'po', label: 'PO' },
    // { value: 'wo', label: 'WO' },
    // { value: 'open', label: 'Open' },
  ];

  const changePageLimit = (limit: number) => {
    setItemsPerPage(limit);
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      per_page: limit,
      page: 1,
    }));
  };

  const handleCloseModal = () => {
    setIsPreviewModalOpen(false);
    setItems({});
    setuniqueLRIds([]);
    setActiveLRInfo(null);
    setLRFQInfo(null);
    setLRFQID(null);
    setLRID(null);
    setTableItems([]);
    setRelatedLRIds([]);
    setPackageItems([]);
    setRows([]);
  };

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  useEffect(() => {
    if (uniqueLRIds.length > 0) {
      setLRID(uniqueLRIds[0]);
    }
  }, [uniqueLRIds]);

  useEffect(() => {
    if (lrid) {
      getLRInfo(lrid);
    }
  }, [lrid]);

  const getLRInfo = async (lrID: any) => {
    try {
      const data = await getAPICall(
        endPoints.info.logistic_request.replace(':id', lrID),
        InfoPayload
      );
      setActiveLRInfo(data.data);
      const key: any = lrfqid;
      setItems((prevItems: any) => ({
        ...prevItems,
        [key]: data.data,
      }));
      let packages: any = [];
      let tableItems: any = [];
      data.data.packages.forEach((pItem: any) => {
        packages.push(pItem);
      });
      data.data.items.forEach((tItem: any) => {
        tableItems.push(tItem);
      });
      setPackageItems(packages);
      setTableItems(tableItems);
    } catch (err) {
      console.log(err);
      setPopupLoader(false);
    }
  };

  const getLRFQInfo = async (lrfqid: any) => {
    try {
      const data = await getAPICall(
        endPoints.info.lrfq.replace(':id', lrfqid),
        LRFQInfoPayload
      );
      setLRFQInfo(data.data);
      let newRows: any = [];
      let lrids: any = [];
      let related_lrids: any = [];
      data.data.lr_customers.forEach((customer: any) => {
        let obj: any = customer;
        obj.selectedContact = null;
        newRows.push(obj);
        lrids.push(customer.logistic_request_id);
        related_lrids.push(customer.logistic_request_id);
      });
      setRelatedLRIds(related_lrids);
      setuniqueLRIds(lrids);
      updateContactInfo(newRows);
    } catch (err) {
      console.log(err);
      setPopupLoader(false);
    }
  };

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
    setRows(updatedArray);
  };

  useEffect(() => {
    if (Object.keys(items).length > 0) {
      relatedLRIds.forEach((item: number) => {
        if (!items.hasOwnProperty(item)) {
          getLRInfo(item);
        }
      });
    }
  }, [relatedLRIds]);

  useEffect(() => {
    if (activeLRInfo) {
      openPopup();
    }
  }, [activeLRInfo]);

  const handleOpenPreview = (data: any) => {
    // setPopupLoader(true);
    setLRFQID(data.id);
    getLRFQInfo(data.id);
    // setCustomerId(data?.logistic_quotation?.customer_id);
  };

  // useEffect(() => {
  //   console.log(items)
  //   let packages: any = [];
  //   let tableItems: any = [];
  //   Object.keys(items).forEach(function (key) {
  //     items[key].packages.forEach((pItem: any) => {
  //       packages.push(pItem);
  //     });
  //     items[key].items.forEach((tItem: any) => {
  //       tableItems.push(tItem);
  //     });
  //   });
  //   setPackageItems(packages);
  //   setTableItems(tableItems);
  // }, [items]);

  const openPopup = () => {
    let popupVariables: any = {};
    popupVariables.lrInfo = activeLRInfo;
    popupVariables.id = activeLRInfo?.id;
    popupVariables.packageItems = packageItems;
    popupVariables.packageTypeOptions = packageTypeOptions;
    popupVariables.conditionOptions = conditionOptions;
    popupVariables.customerOptions = customerOptions;
    popupVariables.packageTypeList = packageTypeList;
    popupVariables.priorityOptions = priorityOptions;
    popupVariables.shipTypeOptions = shipTypeOptions;
    popupVariables.shipViaOptions = shipViaOptions;
    popupVariables.uomOptions = convertToOptions(unitOfMeasureOptions);
    popupVariables.uomItems = unitOfMeasureOptions;
    popupVariables.goodsTypes = goodsTypes;
    popupVariables.priority_id = lrfqInfo?.priority_id;
    popupVariables.ship_type_id = lrfqInfo?.ship_type_id;
    popupVariables.ship_via_id = lrfqInfo?.ship_via_id;
    popupVariables.no_of_package = lrfqInfo?.no_of_package;
    popupVariables.volumetric_weight = lrfqInfo?.volumetric_weight;
    popupVariables.is_dg = lrfqInfo?.is_dg;
    popupVariables.lr_type = activeLRInfo?.type;
    popupVariables.due_date = dayjs(activeLRInfo?.due_date);
    popupVariables.lrTypes = lrTypes;
    popupVariables.no_of_pcs = activeLRInfo?.pcs;
    popupVariables.uomList = unitOfMeasureList;
    popupVariables.rows = rows;
    popupVariables.forVendor = false;
    popupVariables.rowId = null;
    popupVariables.related_ref_no = [...new Set(uniqueLRIds)];
    popupVariables.tableItems = tableItems;
    setPopupLoader(false);
    setPreviewData(popupVariables);
    setIsPreviewModalOpen(true);
    console.log(popupVariables);
  };

  const [columns, setColumns] = useState<TODO>([]);
  const [listData, setListData] = useState<TODO>({});
  const [data, setData] = useState<TODO>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<number>(0);
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
    setQueryParams((prevState: TODO) => ({
      ...prevState,
      is_closed: selectedTab === 0 ? '' : selectedTab === 1 ? 0 : 1,
      page: 1,
    }));
  }, [selectedTab]);

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

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Logistics RFQ
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/logistics/lrfq/create')}
          >
            Add RFQ
          </ResponsiveIconButton>
        </HStack>
        <LRFQSearch
          onSearchFinished={handleResponse}
          setModuleLoading={handleLoader}
          additionalParams={queryParams}
          onPreviewClicked={handleOpenPreview}
          isModal={false}
        />
<Box borderRadius={4}>
  {/* Table goes here */}
  <Box display="flex" justifyContent="space-between" alignItems="center">
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
