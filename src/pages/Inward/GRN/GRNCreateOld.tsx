import { useRef, useState } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import debounce from 'lodash.debounce';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';

import FieldDisplay from '@/components/FieldDisplay';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useSTFDetails, useSTFList } from '@/services/purchase/stf/services';
import { transformToSelectOptions } from '@/helpers/commonHelper';

const GRNCreate = () => {
  const navigate = useNavigate();
  // const toastSuccess = useToastSuccess();
  // const toastInfo = useToastInfo();
  // const toastError = useToastError();
  // const queryClient = useQueryClient();
  const [stfId, setSTFId] = useState<number | null>(null);
  // const { isOpen, onOpen, onClose } = useDisclosure();
  // const {
  //   isOpen: fileUploadIsOpen,
  //   onOpen: fileUploadOnOpen,
  //   onClose: fileUploadOnClose,
  // } = useDisclosure();
  const actionRef = useRef<'save' | 'saveAndNew'>('save');
  // const [uploadedFileNames, setUploadedFileNames] = useState<
  //   Array<{ id: number; fileNames: string[] }>
  // >([]);
  // const [stfItems, setSTFItems] = useState<STFItem[]>([]);
  // const [maxQuantity, setMaxQuantity] = useState<number>(0);
  // const [itemSerializedStatus, setItemSerializedStatus] = useState<{
  //   [key: number]: boolean;
  // }>({});
  // const [locationQty, setLocationQty] = useState<string>('');
  // const [locationWarehouse, setLocationWarehouse] = useState<string>('');
  // const [locationRack, setLocationRack] = useState<string>('');
  // const [locationBin, setLocationBin] = useState<string>('');
  // const [locationSerial, setLocationSerial] = useState<string>('');
  // const [currentItemId, setCurrentItemId] = useState<number | null>(null);
  // const [locationsByItemId, setLocationsByItemId] = useState<{
  //   [itemId: number]: Location[];
  // }>({});

  const setSTFIdDebounced = useRef(
    debounce((value: number) => {
      setSTFId(value), 500;
    })
  ).current;

  const stfList = useSTFList();
  const stfOptions = transformToSelectOptions(stfList.data);

  const { data: stfDetails } = useSTFDetails(stfId ? stfId : 0);

  // const shipModeList = useShipModesList();
  // const shipTypeList = useShipTypesList();
  // const shipViaList = useShipViaList();
  // const shipAccList = useShipAccountList();
  // const paymentModeList = usePaymentModeList();
  // const paymentTermList = usePaymentTermsList();
  // const fobList = useFOBList();
  // const packageTypeList = usePackageTypeList();

  // const {
  //   data: conditions,
  //   isLoading: isConditionLoading,
  //   isError: isConditionError,
  // } = useConditionList();
  // const {
  //   data: uomList,
  //   isLoading: isUomLoading,
  //   isError: isUomError,
  // } = useUnitOfMeasureList();

  // Access condition names synchronously without a hook
  // const getConditionName = (conditionId: number) => {
  //   if (isConditionLoading) return 'Loading...';
  //   if (isConditionError) return 'Error';
  //   return conditions?.items[conditionId] ?? 'Unknown Condition';
  // };

  // const getUomName = (uomId: number) => {
  //   if (isUomLoading) return 'Loading...';
  //   if (isUomError) return 'Error';
  //   return uomList?.items[uomId] ?? 'Unknown UOM';
  // };

  // useEffect(() => {
  //   if (stfDetails?.stf.items) {
  //     setSTFItems(stfDetails.stf.items);
  //   }
  // }, [stfDetails]);

  // const itemTypeOptions = [
  //   { value: 'is_quarantine', label: 'Quarantine' },
  //   { value: 'is_non_quarantine', label: 'Non-Quarantine' },
  // ];

  // const serialTypeOptions = [
  //   { value: 'is_serialized', label: 'Serialized' },
  //   { value: 'is_non_serialized', label: 'Non-Serialized' },
  // ];

  // const openUploadModal = (itemId: number) => {
  //   setCurrentItemId(itemId);
  //   fileUploadOnOpen();
  // };

  // const { mutate: uploadFile, isLoading: isUploading } = useFileUpload({
  //   onSuccess: (data) => {
  //     if (currentItemId !== null) {
  //       setUploadedFileNames((prevState) => {
  //         const existingItem = prevState.find(
  //           (item) => item.id === currentItemId
  //         );
  //         if (existingItem) {
  //           return prevState.map((item) =>
  //             item.id === currentItemId
  //               ? { ...item, fileNames: [...item.fileNames, data.file_name] }
  //               : item
  //           );
  //         } else {
  //           return [
  //             ...prevState,
  //             { id: currentItemId, fileNames: [data.file_name] },
  //           ];
  //         }
  //       });
  //     }
  //   },
  //   onError: (error) => {
  //     // Handle upload error
  //     console.error('Error uploading file:', error);
  //     toastError({ title: 'File upload failed', description: error.message });
  //   },
  // });

  // const onDrop = useCallback(
  //   (acceptedFiles: File[]) => {
  //     // Loop through the files and upload them one by one
  //     acceptedFiles.forEach((file: File) => {
  //       const formData = new FormData();
  //       formData.append('file', file); // Adjust this depending on your API's expected parameter
  //       uploadFile(formData); // Trigger the upload
  //     });
  //   },
  //   [uploadFile]
  // );

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   accept: {
  //     'image/*': [],
  //     'application/pdf': [],
  //   },
  //   onDrop,
  // });

  // const openLocationModal = (itemId: number) => {
  //   setCurrentItemId(itemId);
  //   onOpen();
  // };

  // useEffect(() => {
  //   if (currentItemId !== null) {
  //     const currentItem = stfItems.find((item) => item.id === currentItemId);
  //     if (currentItem) {
  //       setMaxQuantity(currentItem.qty); // Assuming 'qty' is the total quantity for the item
  //     }
  //   }
  // }, [currentItemId, stfItems]);

  // const handleSerializedSelectionChange = (
  //   itemId: number,
  //   isSerialized: boolean
  // ) => {
  //   setItemSerializedStatus((prev) => ({
  //     ...prev,
  //     [itemId]: isSerialized,
  //   }));

  //   // If changing to serialized, reset locations for the specific item if they exist
  //   if (
  //     isSerialized &&
  //     locationsByItemId[itemId] &&
  //     locationsByItemId[itemId].length > 0
  //   ) {
  //     setLocationsByItemId((prevLocations) => ({
  //       ...prevLocations,
  //       [itemId]: [], // Reset locations for this item only
  //     }));
  //     toastInfo({ title: 'Reset locations for serialized item.' });
  //   }
  // };

  // const addLocation = () => {
  //   const newQty = parseInt(locationQty, 10);

  //   // Retrieve the current item's locations or initialize to an empty array if none exist
  //   const currentItemLocations = locationsByItemId[currentItemId!] || [];

  //   // Calculate the sum of quantities for the current item's locations
  //   const sumOfExistingQtys = currentItemLocations.reduce(
  //     (sum, loc) => sum + loc.qty,
  //     0
  //   );
  //   const newSumOfQtys = sumOfExistingQtys + newQty;

  //   if (newSumOfQtys > maxQuantity) {
  //     toastError({
  //       title: 'Error',
  //       description: 'Total quantity cannot exceed the max quantity',
  //     });
  //     return;
  //   }

  //   const isSerialized = itemSerializedStatus[currentItemId ?? -1] ?? false;

  //   // Ensure for serialized items, the quantity per location is 1
  //   if (isSerialized && newQty !== 1) {
  //     toastError({
  //       title: 'Error',
  //       description: 'For serialized items, quantity must be 1.',
  //     });
  //     return;
  //   }

  //   const newLocation: Location = {
  //     qty: newQty,
  //     warehouse_id: Number(locationWarehouse),
  //     rack_id: Number(locationRack),
  //     bin_location_id: Number(locationBin),
  //     serial_number: locationSerial,
  //   };

  //   // Update the locations for the current item, adding the new location
  //   setLocationsByItemId((prevLocations) => ({
  //     ...prevLocations,
  //     [currentItemId!]: [...currentItemLocations, newLocation],
  //   }));
  // };

  // const remainingQtyForCurrentItem = useMemo(() => {
  //   const currentLocations = locationsByItemId[currentItemId!] || [];
  //   const usedQty = currentLocations.reduce((sum, loc) => sum + loc.qty, 0);
  //   return maxQuantity - usedQty;
  // }, [currentItemId, locationsByItemId, maxQuantity]);

  // const deleteLocation = (index: number) => {
  //   setLocationsByItemId((prevLocations) => ({
  //     ...prevLocations,
  //     [currentItemId!]: prevLocations[currentItemId!].filter(
  //       (_, i) => i !== index
  //     ),
  //   }));
  // };

  // const createGRN = useCreateGRN({
  //   onSuccess: (data) => {
  //     toastSuccess({
  //       title: `GRN Created - ${data.id}`,
  //       description: data.message,
  //       duration: 5000,
  //     });
  //     if (actionRef.current === 'saveAndNew') {
  //       form.reset();
  //       setSTFId(null);
  //       form.setValues({ stf_id: stfId });
  //       queryClient.refetchQueries();
  //     } else {
  //       navigate('/inward/grn');
  //     }
  //     queryClient.invalidateQueries('grnIndex');
  //   },
  //   onError: (error) => {
  //     toastError({
  //       title: 'GRN Creation Failed',
  //       description: error.response?.data.message || 'Unknown Error',
  //     });
  //   },
  // });

  const form = useForm({
    onValidSubmit: async (values) => {
      // const payload = {
      //   stf_id: Number(stfId),
      //   remarks: values.remarks,
      //   items: stfItems.map((item) => {
      //     return {
      //       part_number_id: item.part_number_id,
      //       condition_id: item.condition_id,
      //       ship_qty: item.ship_qty,
      //       ship_unit_of_measure_id: item.ship_unit_of_measure_id,
      //       qty: item.qty,
      //       unit_of_measure_id: item.unit_of_measure_id,
      //       is_quarantine: values.items[item.id].type === 'is_quarantine',
      //       is_serialized: values.items[item.id].serial === 'is_serialized',
      //       package_no: item.package_number,
      //       upload_files: (
      //         uploadedFileNames.find(
      //           (uploadedItem) => uploadedItem.id === item.id
      //         )?.fileNames || []
      //       ).map(
      //         (fileName) => `${import.meta.env.VITE_PUBLIC_DOC_URL}${fileName}`
      //       ),
      //       remark: item.remark,
      //       locations: locationsByItemId[item.id],
      //     };
      //   }),
      // };

      // Object.keys(payload).forEach(
      //   (key) =>
      //     payload[key as keyof typeof payload] === null &&
      //     delete payload[key as keyof typeof payload]
      // );

      // console.log('Payload:', payload);
      console.log('Values:', values);
      // createGRN.mutate(payload);
    },
  });

  const handleSave = () => {
    actionRef.current = 'save';
    form.submit();
  };

  const handleSaveAndNew = () => {
    actionRef.current = 'saveAndNew';
    form.submit();
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Breadcrumb
              fontWeight="medium"
              fontSize="sm"
              separator={<ChevronRightIcon boxSize={6} color="gray.500" />}
            >
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink as={Link} to={'/inward/grn'}>
                  GRN
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>GRN Create</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              GRN
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
            GRN Create
          </Text>

          <Formiz autoForm connect={form}>
            <Stack spacing={4}>
              <Stack
                spacing={4}
                p={4}
                bg={'white'}
                borderRadius={'md'}
                boxShadow={'md'}
                borderWidth={1}
                borderColor={'gray.200'}
              >
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    name="stf_id"
                    label="STF"
                    options={stfOptions}
                    required="STF is required"
                    placeholder="Select STF"
                    onValueChange={(value) => {
                      setSTFIdDebounced(Number(value));
                      setSTFId(Number(value));
                    }}
                  />
                  {/* <FieldDisplay
                    label="PO No"
                    value={stfDetails?.data.purchase_order_id || 'N/A'}
                  /> */}
                  <FieldDisplay
                    label="CI No Vendor"
                    value={stfDetails?.data.ci_number || 'N/A'}
                  />
                  <FieldDisplay
                    label="CI Date"
                    value={stfDetails?.data.ci_date || 'N/A'}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="Packing Slip No"
                    value={stfDetails?.data.packing_slip_no || 'N/A'}
                  />
                  <FieldDisplay
                    label="PS Date"
                    value={stfDetails?.data.packing_slip_date || 'N/A'}
                  />
                  {/* <FieldDisplay
                    label="LO No"
                    value={stfDetails?.data.lo_no || 'N/A'}
                  /> */}
                  {/* <FieldDisplay
                    label="LO Date"
                    value={stfDetails?.data.lo_date || 'N/A'}
                  /> */}
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  {/* <FieldDisplay
                    label="Vendor (consignor)"
                    value={
                      useCustomerName(stfDetails?.data.customer_id ?? 0) || 'N/A'
                    }
                  /> */}
                  {/* <FieldDisplay
                    label="Vendor Attention"
                    value={
                      useCustomerContact(
                        stfDetails?.data.customer_contact_manager_id ?? 0
                      ) || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Consignee"
                    value={
                      useCustomerName(stfDetails?.data.ship_customer_id ?? 0) ||
                      'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Consignor Address"
                    value={
                      useShippingAddress(
                        stfDetails?.data.ship_customer_shipping_address_id ?? 0
                      ) || 'N/A'
                    }
                  /> */}
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  {/* <FieldDisplay
                    label="Ship Type"
                    value={
                      shipTypeList.data?.items[
                        stfDetails?.data.ship_type_id ?? 0
                      ] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Ship Mode"
                    value={
                      shipModeList.data?.items[
                        stfDetails?.data.ship_mode_id ?? 0
                      ] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Ship Via"
                    value={
                      shipViaList.data?.items[
                        stfDetails?.data.ship_via_id ?? 0
                      ] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Ship A/C"
                    value={
                      shipAccList.data?.items[
                        stfDetails?.data.ship_account_id ?? 0
                      ] || 'N/A'
                    }
                  /> */}
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  {/* <FieldDisplay
                    label="Payment Mode"
                    value={
                      paymentModeList.data?.items[
                        stfDetails?.data.payment_mode_id ?? 0
                      ] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Payment Term"
                    value={
                      paymentTermList.data?.items[
                        stfDetails?.data.payment_term_id ?? 0
                      ] || 'N/A'
                    }
                  /> */}
                  <FieldDisplay
                    label="AWB/BL"
                    value={stfDetails?.data.awb_number || 'N/A'}
                  />
                  {/* <FieldDisplay
                    label="FOB"
                    value={
                      fobList.data?.items[stfDetails?.data.fob_id ?? 0] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Total Freight Value"
                    value={stfDetails?.data.total_freight_value || 'N/A'}
                  /> */}
                  <FieldDisplay
                    label="Total CI Value"
                    value={stfDetails?.data.total_ci_value || 'N/A'}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldDisplay
                    label="No of Package"
                    value={stfDetails?.data.packages.length || 'N/A'}
                  />
                  {/* <FieldDisplay
                    label="Package Type"
                    value={
                      packageTypeList.data?.items[
                        stfDetails?.data.package_type_id ?? 0
                      ] || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Dimension (LxWxH)"
                    value={stfDetails?.data.dimension || 'N/A'}
                  />
                  <FieldDisplay
                    label="UOM Dimension"
                    value={
                      getUomName(stfDetails?.data.dimension_uom_id ?? 0) || 'N/A'
                    }
                  />
                  <FieldDisplay
                    label="Weight"
                    value={stfDetails?.data.weight || 'N/A'}
                  />
                  <FieldDisplay
                    label="UOM Weight"
                    value={
                      getUomName(stfDetails?.data.weight_uom_id ?? 0) || 'N/A'
                    }
                  /> */}
                </Stack>
              </Stack>

              {/* {stfDetails && stfDetails?.data.items.length > 0 && (
                <TableContainer rounded={'md'} overflow={'auto'} my={4}>
                  <Table variant="striped" size={'sm'}>
                    <Thead bg={'gray'}>
                      <Tr>
                        <Th color={'white'}>ID</Th>
                        <Th color={'white'}>Part Number</Th>
                        <Th color={'white'}>Description</Th>
                        <Th color={'white'}>Condition</Th>
                        <Th color={'white'}>Quantity</Th>
                        <Th color={'white'}>UOM</Th>
                        <Th color={'white'}>Shipped Recd Qty</Th>
                        <Th color={'white'}>UOM</Th>
                        <Th color={'white'}>Back Ord Qty</Th>
                        <Th color={'white'}>UOM</Th>
                        <Th color={'white'}>Rate</Th>
                        <Th color={'white'}>UOM</Th>
                        <Th color={'white'}>Package No#</Th>
                        <Th color={'white'}>Remark</Th>
                        <Th color={'white'}>Upload</Th>
                        <Th color={'white'} minW={'120px'}>
                          Type
                        </Th>
                        <Th color={'white'} minW={'120px'}>
                          Serial
                        </Th>
                        <Th color={'white'} isNumeric>
                          Action
                        </Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {stfDetails?.stf.items.map((item) => (
                        <Tr key={item.id}>
                          <Td>{item.id}</Td>
                          <PartDetails partNumber={item.part_number_id} />
                          <Td>{getConditionName(item.condition_id)}</Td>
                          <Td>{item.ship_qty}</Td>
                          <Td>{getUomName(item.ship_unit_of_measure_id)}</Td>
                          <Td>{item.qty}</Td>
                          <Td>{getUomName(item.unit_of_measure_id)}</Td>
                          <Td>{item.back_qty}</Td>
                          <Td>{getUomName(item.back_unit_of_measure_id)}</Td>
                          <Td>{item.rate}</Td>
                          <Td>{getUomName(item.rate_unit_of_measure_id)}</Td>
                          <Td>{item.package_number}</Td>
                          <Td>{item.remark}</Td>
                          <Td>
                            <IconButton
                              aria-label="Upload"
                              icon={<HiUpload />}
                              size="sm"
                              colorScheme="brand"
                              onClick={() => openUploadModal(item.id)}
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              name={`items[${item.id}].type`}
                              options={itemTypeOptions}
                              menuPortalTarget={document.body}
                              size={'sm'}
                              required="Required"
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              name={`items[${item.id}].serial`}
                              options={serialTypeOptions}
                              menuPortalTarget={document.body}
                              size={'sm'}
                              required="Required"
                              onValueChange={(value) => {
                                handleSerializedSelectionChange(
                                  item.id,
                                  value === 'is_serialized'
                                );
                              }}
                            />
                          </Td>
                          <Td isNumeric>
                            <Button
                              size="sm"
                              colorScheme="brand"
                              isDisabled={
                                itemSerializedStatus[item.id] === undefined
                              }
                              onClick={() => openLocationModal(item.id)}
                            >
                              Location
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              )} */}

              <>
                {/* <Modal
                  isOpen={isOpen}
                  onClose={onClose}
                  size={'5xl'}
                  scrollBehavior={
                    locationsByItemId[currentItemId!]?.length > 0
                      ? 'inside'
                      : undefined
                  }
                >
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Add Location</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <HStack spacing={4}>
                        <FieldInput
                          name="qty"
                          label="Quantity"
                          size={'sm'}
                          required="Quantity is required"
                          onValueChange={(value) =>
                            setLocationQty(String(value || ''))
                          }
                        />
                        <Stack minW={'100px'} spacing={2}>
                          <Text>Max Qty</Text>
                          <Text
                            py={1}
                            borderRadius={'md'}
                            textAlign={'center'}
                            border={'1px solid'}
                            borderColor={'gray.200'}
                          >
                            {remainingQtyForCurrentItem}
                          </Text>
                        </Stack>
                        <FieldSelect
                          name="warehouse_id"
                          label="WH"
                          options={warehouseOptions}
                          size={'sm'}
                          required="Warehouse is required"
                          onValueChange={(value) =>
                            setLocationWarehouse(String(value || ''))
                          }
                        />
                        <FieldSelect
                          name="rack_id"
                          label="Rack"
                          options={rackOptions}
                          size={'sm'}
                          required="Rack is required"
                          onValueChange={(value) =>
                            setLocationRack(String(value || ''))
                          }
                        />
                        <FieldSelect
                          name="bin_location_id"
                          label="Bin"
                          options={binLocationOptions}
                          size={'sm'}
                          required="Bin is required"
                          onValueChange={(value) =>
                            setLocationBin(String(value || ''))
                          }
                        />
                        <FieldInput
                          name="serial_number"
                          label={
                            itemSerializedStatus[currentItemId!]
                              ? 'Serial No'
                              : 'Batch No'
                          }
                          size={'sm'}
                          required="Batch No is required"
                          onValueChange={(value) =>
                            setLocationSerial(String(value || ''))
                          }
                        />
                        <IconButton
                          aria-label="Add"
                          icon={<HiPlus />}
                          colorScheme="brand"
                          size={'sm'}
                          mt={8}
                          onClick={() => addLocation()}
                        />
                      </HStack>

                      {locationsByItemId[currentItemId!] &&
                        locationsByItemId[currentItemId!].length > 0 && (
                          <TableContainer
                            rounded={'md'}
                            overflow={'auto'}
                            my={4}
                          >
                            <Table variant="striped" size={'sm'}>
                              <Thead bg={'gray'}>
                                <Tr>
                                  <Th color={'white'}>Qty</Th>
                                  <Th color={'white'}>Warehouse</Th>
                                  <Th color={'white'}>Rack</Th>
                                  <Th color={'white'}>Bin</Th>
                                  <Th color={'white'}>Serial</Th>
                                  <Th color={'white'} isNumeric>
                                    Action
                                  </Th>
                                </Tr>
                              </Thead>
                              <Tbody>
                                {locationsByItemId[currentItemId!].map(
                                  (item, index) => (
                                    <Tr key={index}>
                                      <Td>{item.qty}</Td>
                                      <Td>{item.warehouse_id}</Td>
                                      <Td>{item.rack_id}</Td>
                                      <Td>{item.bin_location_id}</Td>
                                      <Td>{item.serial_number}</Td>
                                      <Td isNumeric>
                                        <IconButton
                                          aria-label="Delete"
                                          icon={<DeleteIcon />}
                                          colorScheme="red"
                                          size={'sm'}
                                          onClick={() => deleteLocation(index)}
                                        />
                                      </Td>
                                    </Tr>
                                  )
                                )}
                              </Tbody>
                            </Table>
                          </TableContainer>
                        )}
                    </ModalBody>

                    <ModalFooter>
                      <Button colorScheme="red" mr={3} onClick={onClose}>
                        Close
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal> */}
              </>

              <>
                {/* <Modal isOpen={fileUploadIsOpen} onClose={fileUploadOnClose}>
                  <ModalOverlay />
                  <ModalContent>
                    <ModalHeader>Upload Files</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                      <Stack spacing={4}>
                        <Box
                          {...getRootProps()}
                          p={5}
                          border="2px dashed"
                          borderColor="gray.200"
                          bg={isDragActive ? 'gray.100' : 'white'}
                          cursor={'pointer'}
                        >
                          <input {...getInputProps()} />
                          {isDragActive ? (
                            <p>Drop the files here ...</p>
                          ) : (
                            <p>
                              Drag 'n' drop some files here, or click to select
                              files
                            </p>
                          )}
                          {isUploading && (
                            <Progress size="xs" isIndeterminate mt={4} />
                          )}
                        </Box>
                        <Stack mt={4}>
                          <Text fontWeight="semibold">
                            Selected Files for Current Item:
                          </Text>
                          {uploadedFileNames
                            .find((item) => item.id === currentItemId)
                            ?.fileNames.map((fileName, index) => (
                              <Text key={index}>{fileName}</Text>
                            ))}
                        </Stack>
                      </Stack>
                    </ModalBody>

                    <ModalFooter>
                      <Button
                        colorScheme="red"
                        mr={3}
                        onClick={fileUploadOnClose}
                      >
                        Close
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal> */}
              </>

              <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                <FieldTextarea
                  label={'Remarks'}
                  name={'remarks'}
                  placeholder="Enter Remarks"
                />
              </Stack>

              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify={'center'}
                mt={4}
              >
                <Button onClick={handleSave} colorScheme="brand">
                  Save
                </Button>
                <Button onClick={handleSaveAndNew} colorScheme="brand">
                  Save & New
                </Button>
              </Stack>
            </Stack>
          </Formiz>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default GRNCreate;
