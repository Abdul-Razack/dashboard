import { useEffect, useRef, useState } from 'react';

import { ChevronRightIcon, PlusSquareIcon } from '@chakra-ui/icons';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Center,
  HStack,
  Heading,
  IconButton,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';

import FieldDisplay from '@/components/FieldDisplay';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  useLogisticsRequestListByPO,
  useReceiveLogisticRequest,
} from '@/services/logistics/request/services';
import {
  usePurchaseOrderDetails,
  usePurchaseOrderList,
} from '@/services/purchase/purchase-orders/services';
import { useShipTypesList } from '@/services/submaster/ship-types/services';
import { transformToSelectOptions } from '@/helpers/commonHelper';

type SelectedRequest = {
  logistic_request_id: number;
  awb_number?: string;
  stf_type?: string;
} | null;

export const LogisticsReceiveMaster = () => {
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [poId, setPoId] = useState<number | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<SelectedRequest>(null);
  const [vendorName, setVendorName] = useState<string | null>(null);

  const { data: poDetails, isLoading: poDetailLoading } =
    usePurchaseOrderDetails(poId ? poId : '', {
      enabled: poId !== null,
    });

  const setPoIdDebounced = useRef(
    debounce((value: number) => {
      setPoId(value), 500;
    })
  ).current;

  const poList = usePurchaseOrderList();
  const poOptions = transformToSelectOptions(poList.data);
  const shipType = useShipTypesList();

  const {
    data: logisticsRequestByPoId,
    isLoading: LRDetailLoading,
    refetch: reloadLRbyPO,
  } = useLogisticsRequestListByPO(
    {
      purchase_order_id: poId || 0,
    },
    {
      enabled: poId !== null,
    }
  );

  const form = useForm({});

  const fields = useFormFields({
    connect: form,
  });

  const receiveLogisticRequest = useReceiveLogisticRequest({
    onSuccess: (data) => {
      toastSuccess({
        title: data.message,
      });
      reloadLRbyPO();
    },
    onError: (error) => {
      toastError({
        title: 'Error',
        description: error.response?.data.message || 'Unknown Error',
      });
    },
  });

  const handleMarkAsReceived = (
    logistic_request_id: number,
    awb_number?: string,
    stf_type?: string
  ) => {
    setSelectedRequest({ logistic_request_id, awb_number, stf_type });
    onOpen();
  };

  const confirmMarkAsReceived = () => {
    if (selectedRequest) {
      receiveLogisticRequest.mutate({
        logistic_request_id: selectedRequest.logistic_request_id,
        awb_number: selectedRequest.awb_number,
        stf_type: selectedRequest.stf_type,
      });
    }
    onClose();
  };

  useEffect(() => {
    if (poDetails?.data) {
      setVendorName(poDetails?.data?.customer?.business_name);
    }
  }, [poDetails?.data]);

  const stfTypeOptions = [
    { value: 'import', label: 'Import' },
    // { value: "transit", label: "Transit" }
  ];

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
                <BreadcrumbLink as={Link} to="/logistics">
                  Logistics Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Receive Shipment</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Receive Shipment
            </Heading>
          </Stack>
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

        <Stack
          spacing={2}
          p={4}
          bg={'white'}
          borderRadius={'md'}
          boxShadow={'md'}
        >
          <Text fontSize={'md'} fontWeight={'700'}>
            Receive Shipment
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay isLoading={poDetailLoading}>
              <Stack spacing={2}>
                <Stack
                  spacing={8}
                  direction={{ base: 'column', md: 'row' }}
                  bg={'purple.100'}
                  p={4}
                  rounded={'md'}
                  border={'1px solid'}
                  borderColor={'gray.300'}
                >
                  <FieldSelect
                    label="PO"
                    name="po_no"
                    options={poOptions}
                    size={'sm'}
                    onValueChange={(value) => {
                      setPoIdDebounced(Number(value));
                      setPoId(Number(value));
                      setVendorName(null);
                    }}
                  />
                  <FieldDisplay
                    label="Vendor Name"
                    value={vendorName || 'N/A'}
                    size={'sm'}
                  />
                </Stack>

                {poId && (
                  <LoadingOverlay
                    isLoading={!poDetailLoading && LRDetailLoading}
                  >
                    <TableContainer overflow={'auto'} mt={2}>
                      <Table variant="simple" size="sm" colorScheme="yellow">
                        <Thead bg={'yellow'}>
                          <Tr bg="yellow.400">
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              #
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              Ven.Name
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              PO.Num
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              LR.Num +
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              LO.Num
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              No.of.Packs
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              Vol.Weight
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              Ship.Type
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              AWB/Track.Num
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              STF Type
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                            >
                              STF Status
                            </Th>
                            <Th
                              bg="yellow.400"
                              borderWidth="1px"
                              borderColor="black"
                              isNumeric
                            >
                              Action
                            </Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {logisticsRequestByPoId?.data.map((item, index) => (
                            <Tr
                              key={item.id}
                              bg={index % 2 === 0 ? 'green.200' : 'green.100'}
                            >
                              <Td borderWidth="1px" borderColor="black">
                                {index + 1}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {vendorName}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {item.purchase_orders
                                  ? item.purchase_orders
                                      .map((po) => po.purchase_order_id)
                                      .join(',')
                                  : ''}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {item.id}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {item?.logistic_order_ids?.length > 1
                                  ? item.logistic_order_ids.join(',')
                                  : item.logistic_order_ids[0]}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {item.no_of_package}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {item.volumetric_weight}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {shipType.data?.items[item.ship_type_id]}
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                <FieldInput
                                  key={`${item.id}-awb_tracking_num`}
                                  name={`${item.id}-awb_tracking_num`}
                                  placeholder="AWB/Tracking Num"
                                  size={'sm'}
                                  isDisabled={item.is_received}
                                  defaultValue={item.awb_number ?? ''}
                                />
                              </Td>
                              <Td
                                borderWidth="1px"
                                borderColor="black"
                                opacity={1}
                              >
                                <FieldSelect
                                  name={`${item.id}-stf_type`}
                                  options={stfTypeOptions}
                                  defaultValue={item?.stf_type || 'import'}
                                  isDisabled={item.is_received}
                                  size={'sm'}
                                  menuPortalTarget={document.body}
                                  width={100}
                                  className={
                                    item.is_received ? 'disabled-input' : ''
                                  }
                                />
                              </Td>
                              <Td borderWidth="1px" borderColor="black">
                                {item.is_received ? (
                                  <Center>
                                    <Text fontWeight={700}>Received</Text>
                                  </Center>
                                ) : (
                                  <Button
                                    size={'sm'}
                                    bg={'white'}
                                    color={'brand.500'}
                                    onClick={() =>
                                      handleMarkAsReceived(
                                        item.id,
                                        fields[`${item.id}-awb_tracking_num`]
                                          ?.value,
                                        fields[`${item.id}-stf_type`]?.value
                                      )
                                    }
                                  >
                                    Mark as Received
                                  </Button>
                                )}
                              </Td>
                              <Td
                                borderWidth="1px"
                                borderColor="black"
                                isNumeric
                              >
                                <IconButton
                                  aria-label="STF"
                                  size={'sm'}
                                  colorScheme={'brand'}
                                  icon={<PlusSquareIcon />}
                                  as={Link}
                                  to={`/purchase/stf/add/new/${item.id}`}
                                  isDisabled={!item.is_received}
                                />
                              </Td>
                            </Tr>
                          ))}
                          {logisticsRequestByPoId?.data?.length === 0 && (
                            <Tr bg={'green.200'}>
                              <Td
                                borderWidth="1px"
                                borderColor="black"
                                colSpan={12}
                                textAlign={'center'}
                              >
                                No records found
                              </Td>
                            </Tr>
                          )}

                          {LRDetailLoading && (
                            <Tr bg={'green.100'}>
                              <Td
                                borderWidth="1px"
                                borderColor="black"
                                colSpan={12}
                                textAlign={'center'}
                              >
                                Loading ...
                              </Td>
                            </Tr>
                          )}
                        </Tbody>
                      </Table>
                    </TableContainer>
                  </LoadingOverlay>
                )}

                <AlertDialog
                  isOpen={isOpen}
                  leastDestructiveRef={cancelRef}
                  onClose={onClose}
                >
                  <AlertDialogOverlay>
                    <AlertDialogContent>
                      <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Confirm Action
                      </AlertDialogHeader>

                      <AlertDialogBody>
                        Are you sure you want to mark this shipment as received?
                      </AlertDialogBody>

                      <AlertDialogFooter>
                        <Button ref={cancelRef} onClick={onClose}>
                          Cancel
                        </Button>
                        <Button
                          colorScheme="green"
                          onClick={confirmMarkAsReceived}
                          ml={3}
                        >
                          Confirm
                        </Button>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialogOverlay>
                </AlertDialog>
              </Stack>
            </LoadingOverlay>
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default LogisticsReceiveMaster;
