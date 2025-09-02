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
import { useNavigate } from 'react-router-dom';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { DataTable } from '@/components/DataTable';
import LoadingOverlay from '@/components/LoadingOverlay';
import { PageLimit } from '@/components/PageLimit';
import Pagination from '@/components/Pagination';
import { PDFPreviewModal } from '@/components/Popups/PDFPreview';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { POSearch } from '@/components/SearchBars/Purchase/Order';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useResendEmailAlert } from '@/services/email-alert/services';

const PurchaseOrderMaster = () => {
  const navigate = useNavigate();
  const [pdfUrl, setPDFUrl] = useState<string>('');
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

  const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
  const [popupLoading, showPopupLoader] = useState<boolean>(false);
  const [data, setData] = useState<TODO>([]);
  const [selectedTab, setSelectedTab] = useState<number>(0);
  const [columns, setColumns] = useState<TODO>([]);
  const [listData, setListData] = useState<TODO>({});
  const [loading, setLoading] = useState(false);
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const handleCloseModal = () => {
    setPreviewModalOpen(false);
    setPDFUrl('');
  };

  const [emailPOId, setEmailPOId] = useState<any>(null);
  const [openConfirmation, setOpenConfirmation] = useState<boolean>(false);
  const triggerMail = (poID: any) => {
    setEmailPOId(poID);
    setOpenConfirmation(true);
  };

  const handleConfirm = () => {
    setOpenConfirmation(false);
    showPopupLoader(true);
    let obj: any = {};
    obj.email_type = 'purchase_order_created';
    obj.purchase_order_id = emailPOId;
    sendEmailAlert.mutate(obj);
  };

  const handleClose = () => {
    setOpenConfirmation(false);
  };

  const sendEmailAlert = useResendEmailAlert({
    onSuccess: () => {
      setEmailPOId(null);
      showPopupLoader(false);
      toastSuccess({
        title: 'Email alert send successfully',
      });
    },
    onError: (error) => {
      setEmailPOId(null);
      showPopupLoader(false);
      toastError({
        title: 'Error while sending Email alert',
        description: error.response?.data.message,
      });
    },
  });

  const handleResponse = (data: any, columns: any) => {
    setColumns(columns);
    setListData(data);
    setData(data?.data);
    setTimeout(() => {
      setLoading(false);
    }, 800);
  };

  const openModal = (data: any) => {
    console.log(data);
    if (data?.print) {
      console.log(import.meta.env.VITE_PDF_BASE_URL + data?.print);
      setPDFUrl(import.meta.env.VITE_PDF_BASE_URL + data?.print);
      setPreviewModalOpen(true);
    }
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
            Purchase Order Master
          </Heading>
          <ResponsiveIconButton
            type="button"
            variant={'@primary'}
            icon={<LuPlus />}
            w={{ base: 'full', md: 'auto' }}
            ml={'auto'}
            onClick={() => navigate('/purchase/purchase-order/direct')}
          >
            Direct PO
          </ResponsiveIconButton>

          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/purchase/purchase-order/create')}
          >
            Add Purchase Order
          </ResponsiveIconButton>
        </HStack>

        <POSearch
          onSearchFinished={handleResponse}
          setModuleLoading={handleLoader}
          additionalParams={queryParams}
          onPreviewClicked={openModal}
          isModal={false}
          onEmailTriggered={triggerMail}
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
              tableProps={{ variant: 'simple' }}
              enableClientSideSearch={false}
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

        <PDFPreviewModal
          isOpen={isPreviewModalOpen}
          onClose={handleCloseModal}
          pdfUrl={pdfUrl}
        />

        <ConfirmationPopup
          isOpen={openConfirmation}
          onClose={handleClose}
          onConfirm={handleConfirm}
          headerText="Send Email Alert!!"
          bodyText="Are you sure want to send email alert to this purchase order?"
        />
      </Stack>
    </SlideIn>
  );
};

export default PurchaseOrderMaster;
