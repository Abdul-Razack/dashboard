import React, { useState } from 'react';
import {
    HStack,
    Heading,
    Stack,
    Center,
    IconButton,
    Button,
    Text,
    Table,
    TableContainer,
    Tbody,
    Thead,
    Td,
    Tr,
    Th,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalHeader,
    ModalOverlay,
    ModalFooter,
    Flex
} from '@chakra-ui/react';
import { SlideIn } from '@/components/SlideIn';
import { Formiz, useForm } from '@formiz/core';
import { HiOutlineSearch, HiOutlineXCircle } from 'react-icons/hi';
import { HiMiniQueueList } from "react-icons/hi2";
// import { FlowNumberList } from "@/components/FlowNumberList";
import DocumentDownloadButton from '@/components/DocumentDownloadButton';
import { useToastError, useToastSuccess } from '@/components/Toast';

import { STFInfoComponent } from '@/components/STFInfo';
import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { useFindByPartNumberBulkId } from '@/services/spare/services';
import { useCreateQualityCheck, useGetListQuarantineByStf } from '@/services/purchase/stocks/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useSTFDetails, useSTFList } from '@/services/purchase/stf/services';
import { useTypeOfTagList } from '@/services/submaster/type-of-tag/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';
import { generatePackageNumber, transformToSelectOptions, formatDate } from '@/helpers/commonHelper';


const ApprovalMaster = () => {

    const toastError = useToastError();
    const toastSuccess = useToastSuccess();
    const itemForm = useForm({});
    const form = useForm({
        onValidSubmit: (values) => {
            setIsShow(true);
            console.log("form values", values)
        },
    });
    
    const initialRef = React.useRef(null);

    const [stfId, setStfId] = useState<number>(0);
    const [isShow, setIsShow] = useState<boolean>(false);
    const [extraPopup, setExtraPopup] = useState<boolean>(false);
    const [extraFileId, setExtraFileId] = useState<number | null>(null);

    const [clickedItem, setClickedItem] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [uploadPopUp, setUploadPopUp] = useState<boolean>(false);
    const [popupDetails, setPopupDetails] = useState({
        id: 1,
        status: false,
        remark: '',
        type: 'reject'
    });
    
    
    const stfListData = useSTFList({});
    const typeOfTagList = useTypeOfTagList({});
    const conditionList = useConditionList({});
    const packageTypeList = usePackageTypeList();
    const unitOfMeasureData = useUnitOfMeasureList({});
        
    const stfOptions = transformToSelectOptions(stfListData.data);
    
    const typeOfTagOptions = transformToSelectOptions(typeOfTagList.data);
    const allApiDataLoaded = [typeOfTagList].every((query) => query.isSuccess);
    const stfData = useSTFDetails(Number(stfId));
    const stfPackage = stfData.data?.data?.packages || [];

    const getPackageId = (id: number) => {
        const packageType = stfPackage.find((pkg) => pkg.logistic_request_package_id === id);
        return packageType?.package_type_id;
    };
    
    const stockByStfData = useGetListQuarantineByStf({ stf_id: stfId });
    const stockByStfArray = stockByStfData?.data?.data || [];
    const partNumberFinalIds: number[] =
        stockByStfArray.length > 0
        ? Array.from(
            new Set(
                stockByStfArray
                .map((item) => item.part_number_id)
                .filter((id): id is number => id !== undefined)
            )
            )
        : [0];
    const spareIpData2 = useFindByPartNumberBulkId(partNumberFinalIds);
    const stockByStfArrayOptimze = stockByStfArray.map((item) => {
        const partNumberData = spareIpData2?.data?.[item.part_number_id || 0];
        const conditionData = conditionList?.data?.items;
        const conditionName = conditionData?.[item.condition_id || ''] || '';
        return {
            ...item,
            description: partNumberData?.part_number?.description || '',
            part_number: partNumberData?.part_number?.part_number || '',
            uom_id: partNumberData?.part_number?.unit_of_measure_id,
            condition_name: conditionName
        };
    });

    const allApiDataLoaded2 = [stockByStfData].every((query) => query.isSuccess);

    const handleItemSubmit = (id: number, status: boolean, type: string, index: number) => {
        setClickedItem(index)
        setUploadPopUp(true);
        setPopupDetails({
            id: id,
            status: status,
            remark: '',
            type: type
        })
    };

    const handleOpenDocument = () => {
        setUploadPopUp(!uploadPopUp);
    };

    const handleApprovaltoSubmit = () => {
        setIsLoading(true);
        setUploadPopUp(false);
        let payload = {
            id: popupDetails?.id,
            remark: popupDetails?.remark || '',
            is_approved: popupDetails?.status
        };
        createQc.mutate(payload);
    };
    
    const createQc = useCreateQualityCheck({
        onSuccess: (data) => {
            stockByStfData.refetch();
            setIsLoading(false);
            toastSuccess({
                title: `Created Quarantine Approval Check ${data.id}`,
            });
        },
        onError: (error) => {
            setIsLoading(false);
            toastError({
                title: 'Quarantine Approval Creation Failed',
                description: error.response?.data.message || 'Unknown Error',
            });
        },
    });

    return (
        <SlideIn>
            <Stack pl={2} spacing={2}>
                <HStack justify={'space-between'}>
                    <Stack spacing={0}>
                        <Heading as="h4" size={'md'}>Quarantine Approval</Heading>
                    </Stack>
                </HStack>
                <Formiz autoForm connect={form}>
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
                        <FieldSelect
                            name={'purchase_order_id'}
                            required={'STF ID is required'}
                            placeholder="Select STF ID"
                            options={stfOptions}
                            w={{ base: 'full', md: '20%' }}
                            onValueChange={(value) => {
                                setStfId(Number(value))
                            }}
                        />
                        <Button
                            type="submit"
                            variant="@primary"
                            w={{ base: 'full', md: 'auto' }}
                            leftIcon={<HiOutlineSearch />}
                        >
                        Search
                        </Button>
                        <Button
                            type="reset"
                            bg={'gray.200'}
                            leftIcon={<HiOutlineXCircle />}
                            w={{ base: 'full', md: 'auto' }}
                            onClick={() => {
                                form.reset();
                            }}
                        >
                        Clear
                        </Button>
                    </Stack>
                </Formiz>
                {/* Next content */}
                    { (isShow) && 
                        <Stack
                            spacing={2}
                            p={4}
                            bg={'white'}
                            borderRadius={'md'}
                            boxShadow={'md'}
                            mt='2rem'
                        >
                            <LoadingOverlay isLoading={!allApiDataLoaded || !allApiDataLoaded2}>
                                {/* <FlowNumberList /> */}
                                <STFInfoComponent stfId={stfId}/>
                                {/* Table start */}
                                <Stack
                                    bg={'white'}
                                    mt={'1rem'}
                                >
                                    <Text fontSize={'md'} fontWeight={'700'}>Table</Text>
                                    <Formiz autoForm connect={itemForm}>
                                        <TableContainer
                                            borderRadius={'md'}
                                            boxShadow={'md'}
                                            borderWidth={1}
                                            borderColor={'gray.200'}
                                            overflow={'auto'}
                                            mt={2}
                                        >
                                        <Table variant={'unStyle'} size={'sm'}>
                                            <Thead bg={'gray'}>
                                                <Tr>
                                                    <Th color={'white'}>S.No</Th>
                                                    <Th color={'white'}>Ctrl Id</Th>
                                                    <Th color={'white'}>Received CN</Th>
                                                    <Th color={'white'}>Serial / Lot (Number)</Th>
                                                    <Th color={'white'}>Qty</Th>
                                                    <Th color={'white'}>UOM</Th>
                                                    <Th color={'white'}>Quarantine Status</Th>
                                                    <Th color={'white'}>Type Of Tag</Th>
                                                    <Th color={'white'}>Tag Date</Th>
                                                    <Th color={'white'}>Tag By</Th>
                                                    <Th color={'white'}>Trace</Th>
                                                    <Th color={'white'}>LLP</Th>
                                                    <Th color={'white'}>Shelf Life</Th>
                                                    <Th color={'white'}>Remark</Th>
                                                    <Th color={'white'}>Part Pictures</Th>
                                                    <Th color={'white'}>Tags</Th>
                                                    <Th color={'white'}>Trace Docs</Th>
                                                    <Th color={'white'}>Other Docs</Th>
                                                    <Th color={'white'}>Package Info</Th>
                                                    <Th color={'white'}>WH</Th>
                                                    <Th color={'white'}>Rack</Th>
                                                    <Th color={'white'}>Bin loc</Th>
                                                    <Th color={'white'}>QC Remark</Th>
                                                    <Th color={'white'}>Actions</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {(stfId !== 0 && stockByStfArrayOptimze.length > 0) && (
                                                    stockByStfArrayOptimze.map((item, index) => {
                                                        return (
                                                            <Tr 
                                                            key={`stf-item-${item.id}`} 
                                                            sx={{
                                                                backgroundColor:
                                                                index % 2 === 0
                                                                    ? '#ffffff' : 'green.200',
                                                                transition: 'background-color 2s ease',
                                                            }}
                                                            >
                                                                <Td>{index + 1}</Td>
                                                                <Td>{item?.control_id ?? 'Loading...'}</Td>
                                                                <Td>{item?.condition_name ?? 'Loading...'}</Td>
                                                                <Td>{item?.serial_lot_number ?? 'Loading...'}</Td>
                                                                <Td>{item?.qty ?? 'Loading...'}</Td>
                                                                <Td>
                                                                    {item?.uom_id !== undefined &&
                                                                    unitOfMeasureData?.data?.items[item?.uom_id]
                                                                    ? unitOfMeasureData.data.items[item?.uom_id]
                                                                    : 'N/A'}
                                                                </Td>
                                                                <Td>
                                                                    {item.is_quarantine
                                                                    ? 'Quarantine'
                                                                    : 'Non Quarantine'}
                                                                </Td>

                                                                
                                                                
                                                                <Td>
                                                                    {typeOfTagOptions[item.type_of_tag_id - 1].label ??
                                                                    'Loading...'}
                                                                </Td>
                                                                <Td>{formatDate(item.tag_date) ?? 'Loading...'}</Td>
                                                                <Td>{item.tag_by ? item.tag_by : 'N/A'}</Td>
                                                                <Td>{item.trace ? item.trace : 'N/A'}</Td>
                                                                <Td>{item.llp ?? 'Loading...'}</Td>
                                                                <Td>{formatDate(item.shelf_life) ?? 'Loading...'}</Td>
                                                                <Td><Text
                                                                        dangerouslySetInnerHTML={{
                                                                        __html: item?.remark ? item?.remark : ' - ',
                                                                        }}
                                                                    ></Text>
                                                                </Td>
                                                                
                                                                <Td>
                                                                    <DocumentDownloadButton size={'sm'} url={item.files[0]?.url || ''} />
                                                                </Td>
                                                                <Td>
                                                                    <DocumentDownloadButton size={'sm'} url={item.files[1]?.url || ''} />
                                                                </Td>
                                                                <Td>
                                                                    <DocumentDownloadButton size={'sm'} url={item.files[2]?.url || ''} />
                                                                </Td>
                                                                <Td>
                                                                    <Center>
                                                                        <IconButton
                                                                            aria-label="View Other Docs"
                                                                            colorScheme="cyan"
                                                                            variant='outline'
                                                                            size={'sm'}
                                                                            icon={<HiMiniQueueList />}
                                                                            isDisabled={!item.files[3]?.url}
                                                                            onClick={() => {
                                                                                setExtraPopup(true),
                                                                                setExtraFileId(item.id)
                                                                            }}
                                                                            minWidth={'1.5rem'}
                                                                            h={'1.5rem'}
                                                                        />
                                                                    </Center>
                                                                </Td>
                                                                <Td>
                                                                    {generatePackageNumber(packageTypeList,
                                                                    Number(getPackageId(
                                                                        item.logistic_request_package_id
                                                                    )),
                                                                    index + 1)}
                                                                </Td>
                                                                <Td>
                                                                    {'P3-06'}
                                                                </Td>
                                                                <Td>
                                                                    {'Rack No#25'}
                                                                </Td>
                                                                <Td>
                                                                    {'Shelf 22'}
                                                                </Td>
                                                                <Td>
                                                                    {'N/A'}
                                                                </Td>
                                                                <Td 
                                                                    display={'flex'} 
                                                                    gap={'5px'}
                                                                >
                                                                    <Center>
                                                                        <Button
                                                                            aria-label="Rejected Qc"
                                                                            colorScheme="red"
                                                                            size={'sm'}
                                                                            isDisabled={item?.is_quality_check  || isLoading}
                                                                            onClick={() => {
                                                                                handleItemSubmit(item.id, false, 'rejected', index);
                                                                            }}
                                                                            minWidth={'1.5rem'}
                                                                            h={'1.5rem'}
                                                                            isLoading={isLoading && index === clickedItem && popupDetails?.type === 'rejected'}
                                                                        >Reject</Button>
                                                                    </Center>
                                                                    <Center>
                                                                        <Button
                                                                            aria-label="Approval Qc"
                                                                            colorScheme="green"
                                                                            size={'sm'}
                                                                            isDisabled={item?.is_quality_check || isLoading}
                                                                            onClick={() => {
                                                                              handleItemSubmit(item.id, true, 'approval', index);
                                                                            }}
                                                                            minWidth={'1.5rem'}
                                                                            h={'1.5rem'}
                                                                            isLoading={isLoading && index === clickedItem && popupDetails?.type === 'approval'}
                                                                        >Approve</Button>
                                                                    </Center>
                                                                </Td>
                                                            </Tr>
                                                        );
                                                    })
                                                )}
                                            </Tbody>
                                        </Table>
                                        
                                        {(stfId !== 0 && stockByStfArrayOptimze.length === 0) && (
                                            <>
                                                {allApiDataLoaded2 ? (
                                                    <Center p="4">
                                                        <Text>No items to display</Text>
                                                    </Center> 
                                                ) : (
                                                
                                                    <Stack m={'3rem'}>
                                                        <LoadingOverlay isLoading={true} />
                                                    </Stack>
                                                )}
                                            </>
                                        )}
                                        </TableContainer>
                                    </Formiz>
                                </Stack>
                                {/*  End */}
                            </LoadingOverlay>
                        </Stack>   
                    }
                    <Modal
                        initialFocusRef={initialRef}
                        isOpen={extraPopup}
                        size={'5xl'}
                        onClose={() => setExtraPopup(false)}
                        closeOnOverlayClick={false} 
                        closeOnEsc={false}
                    >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Extra Documents</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={12}>
                        {  
                            stockByStfArrayOptimze.length > 0 && (
                                (() => {
                                    const filterStockByStfArrayOptimze = stockByStfArrayOptimze.find((item) => item.id === extraFileId);
                                    if (filterStockByStfArrayOptimze && Array.isArray(filterStockByStfArrayOptimze.files) && filterStockByStfArrayOptimze.files.length > 0) {
                                        return filterStockByStfArrayOptimze?.files.map((file, index) => {
                                        if (index >= 3 && file.url) {
                                            return (
                                                <Center gap={'1rem'} mb='1rem'>
                                                    <DocumentDownloadButton size={'sm'} url={file?.url || ''} />
                                                    <Text> {file?.file_name}</Text>
                                                </Center>
                                            );
                                        }
                                        return null;
                                        });
                                    }
                                    return <Center>No documents found!</Center>;
                                })()
                            )
                        }
                        </ModalBody>
                    </ModalContent>
                </Modal>

                <Modal
                        initialFocusRef={initialRef}
                        isOpen={uploadPopUp}
                        size={'5xl'}
                        onClose={() => handleOpenDocument()}
                    >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader textTransform={'capitalize'}>{`Confirm ${popupDetails.type}`}</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={12}>
                            {/*  this id: ${popupDetails.id} */}
                            <Text fontWeight='bold' mb='1rem'>{`Are you want to ${popupDetails.type}`}</Text>
                            {popupDetails?.remark && (
                                <Flex>
                                    <Text marginEnd={3} fontWeight={'bold'}>Desription:</Text>
                                    <Text
                                    p="1"
                                    dangerouslySetInnerHTML={{
                                        __html: popupDetails?.remark
                                        ? popupDetails?.remark
                                        : ' - ',
                                    }}
                                    ></Text>
                                </Flex>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                colorScheme="teal"
                                mr={3}
                                size={'sm'}
                                onClick={() => handleApprovaltoSubmit()}
                            >
                            Yes
                            </Button>
                            <Button
                                colorScheme="red"
                                size={'sm'}
                                onClick={() => handleOpenDocument()}
                            >
                               No
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                </Modal>
            </Stack>
        </SlideIn>   
    );
};

export default ApprovalMaster;