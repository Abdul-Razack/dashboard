import React, { useState, useEffect } from 'react';
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
    Tooltip,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Flex
} from '@chakra-ui/react';
import { SlideIn } from '@/components/SlideIn';
import { Formiz, useForm } from '@formiz/core';
import { HiOutlineSearch, HiOutlineXCircle } from 'react-icons/hi';
import { HiMiniQueueList } from "react-icons/hi2";

import { FieldSelect } from '@/components/FieldSelect';
import LoadingOverlay from '@/components/LoadingOverlay';
import { FieldInput } from '@/components/FieldInput';
import { STFInfoComponent } from '@/components/STFInfo';
import { useToastError, useToastSuccess } from '@/components/Toast';
import DocumentDownloadButton from '@/components/DocumentDownloadButton';

import { useFindByPartNumberBulkId } from '@/services/spare/services';
import { useCreateQualityCheck, useGetListStockByStf } from '@/services/purchase/stocks/services';
import { useConditionList } from '@/services/submaster/conditions/services';
import { useSTFDetails, useSTFList } from '@/services/purchase/stf/services';
import { useTypeOfTagList } from '@/services/submaster/type-of-tag/services';
import { usePackageTypeList } from '@/services/submaster/packagetype/services';
import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';
import { generatePackageNumber, transformToSelectOptions, formatDate } from '@/helpers/commonHelper';

type SelectOption = {
    value: string | number;
    label: string | number;
};

interface FieldValue {
   value: string;
}

type Fields = {
   [key: string]: FieldValue;
};

const ApprovalMaster = () => {
    const itemForm = useForm({});
    // const fakeForm = useForm({});
    const form = useForm({
        onValidSubmit: (values) => {
            setIsShow(true);
            console.log("form values", values)
        },
    });
    
    const toastError = useToastError();
    const toastSuccess = useToastSuccess();
    const initialRef = React.useRef(null);

    const [selectType, setSelectType] = useState<string>('');
    const [refNo, setRefNo] = useState<number>(0);
    const [clickedItem, setClickedItem] = useState<number | null>(null);
    const [isDisable, setIsDisable] = useState<boolean>(true);
    const [isShow, setIsShow] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [uploadPopUp, setUploadPopUp] = useState<boolean>(false);
    const [fields, setFields] = useState<Fields>({});
    const [popupDetails, setPopupDetails] = useState({
        id: 1,
        status: false,
        remark: '',
        type: 'reject'
    });
    const [extraPopup, setExtraPopup] = useState<boolean>(false);
    const [extraFileId, setExtraFileId] = useState<number | null>(null);
    // const [remarkPopup, setRemarkPopup] = useState<boolean>(false);
    // const [remarkFileId, setRemarkFileId] = useState<number | null>(null);
    
    const SEARCH_OPTIONS = [
        { value: 'stf_import', label: 'STF IMPORT' },
        { value: 'po', label: 'PO' },
        { value: 'date_range', label: 'Date range' },
        { value: 'all', label: 'All' },
    ];
    
    const stfListData = useSTFList({});
    const typeOfTagList = useTypeOfTagList({});
    const conditionList = useConditionList({});
    const packageTypeList = usePackageTypeList();
    const unitOfMeasureData = useUnitOfMeasureList({});
        

    let REF_OPTIONS: SelectOption[] = [];
    if (selectType === 'stf_import') {
        REF_OPTIONS = transformToSelectOptions(stfListData.data);
    }
    
    const typeOfTagOptions = transformToSelectOptions(typeOfTagList.data);
    const allApiDataLoaded = [typeOfTagList].every(
        (query) => query.isSuccess
    );
    const stfData = useSTFDetails(Number(refNo));
    const stfPackage = stfData.data?.data?.packages || [];

    const getPackageId = (id: number) => {
        if (refNo !== 0 && selectType === 'stf_import') {
            const packageType = stfPackage.find((pkg) => pkg.logistic_request_package_id === id);
            return packageType?.package_type_id;
        }
    };


    const stockByStfData = useGetListStockByStf({ stf_id: refNo });
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


    useEffect(() => {
        setIsDisable(selectType !== 'stf_import');
    }, [selectType]);

    const handleItemSubmit = (id: number, status: boolean, type: string, index: number) => {
        setClickedItem(index)
        setUploadPopUp(true);
        setPopupDetails({
            id: id,
            status: status,
            remark: fields?.[`remarks_${id}`]?.value || '',
            type: type
        })
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
            setFields({});
            setIsLoading(false);
            toastSuccess({
                title: `Created Quality Check ${data.id}`,
            });
        },
        onError: (error) => {
            setIsLoading(false);
            toastError({
                title: 'Quality Check Creation Failed',
                description: error.response?.data.message || 'Unknown Error',
            });
        },
    });

    // const handleRemarksChange = (value: string) => {
    //     setFields((prevFields) => ({
    //         ...prevFields,
    //         [`remarks_${remarkFileId}`]: { value }
    //     }));
    // };

    const handleOpenDocument = () => {
        setUploadPopUp(!uploadPopUp);
    };
    const allApiDataLoaded2 = [stockByStfData].every((query) => query.isSuccess);

    const handleTextChange = (value: string, id: number) => {
        setFields((prevFields) => ({
            ...prevFields,
            [`remarks_${id}`]: { value }
        }));
    };
    
    return (
        <SlideIn>
            <Stack pl={2} spacing={2}>
                <HStack justify={'space-between'}>
                    <Stack spacing={0}>
                        <Heading as="h4" size={'md'}>Part Inspection Approval</Heading>
                    </Stack>
                </HStack>
                <Stack
                    spacing={2}
                    borderRadius={'md'}
                    boxShadow={'md'}
                >
                    <Formiz autoForm connect={form}>
                        <Stack
                            direction={{ base: 'column', md: 'row' }}
                            display={{ base: 'inherit', md: 'flex' }}
                            bg={'white'}
                            p={6}
                            borderRadius={4}
                            spacing={4}
                            align={'flex-start'}
                            justify={'flex-start'}
                            mt={2}
                        >
                            <FieldSelect
                                name={'type'}
                                placeholder="Select type"
                                options={SEARCH_OPTIONS}
                                defaultValue={selectType}
                                required={'Type is required'}
                                w={{ base: 'full', md: '20%' }}
                                onValueChange={(value) => {
                                    setSelectType(String(value)),
                                    setRefNo(0)
                                }}
                            />
                            <FieldSelect
                                name="ref_no"
                                placeholder="Ref no"
                                options={REF_OPTIONS}
                                defaultValue={''}
                                required={'Ref No is required'}
                                w={{ base: 'full', md: '20%' }}
                                onValueChange={(value) => {
                                    setRefNo(Number(value))
                                }}
                                isDisabled={isDisable}
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
                </Stack>
                {/* Next content */}
                { (isShow && selectType !== '') && 
                    <Stack
                        spacing={2}
                        p={4}
                        bg={'white'}
                        borderRadius={'md'}
                        boxShadow={'md'}
                        mt='2rem'
                    >
                        <LoadingOverlay isLoading={!allApiDataLoaded}>
                            {/* <FlowNumberList /> */}
                            <STFInfoComponent stfId={refNo}/>
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
                                                <Th color={'white'}>Control Id</Th>
                                                <Th color={'white'}>Part Number</Th>
                                                <Th color={'white'}>Description</Th>
                                                <Th color={'white'}>Received CN</Th>
                                                <Th color={'white'}>Serial / Lot Number</Th>
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
                                                <Th color={'white'}>Package Info</Th>
                                                <Th color={'white'}>Part Pictures</Th>
                                                <Th color={'white'}>Tags</Th>
                                                <Th color={'white'}>Trace Docs</Th>
                                                <Th color={'white'}>Other Docs</Th>
                                                <Th color={'white'}>QC Remark</Th>
                                                <Th color={'white'}>Actions</Th>
                                            </Tr>
                                        </Thead>
                                        <Tbody>
                                            {(refNo !== 0 && selectType === 'stf_import' && stockByStfArrayOptimze.length > 0) && (
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
                                                                <Td>{item?.part_number ?? 'Loading...'}</Td>
                                                                <Td>{item?.description ?? 'Loading...'}</Td>
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
                                                                    : 'Non Quarantine' }
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
                                                                    {generatePackageNumber(packageTypeList,
                                                                    Number(getPackageId(
                                                                        item.logistic_request_package_id
                                                                    )),
                                                                    index + 1)}
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
                                                                <Tooltip
                                                                    label={fields?.[`remarks_${item.id}`]?.value || ''}
                                                                    aria-label="Remark tooltip"
                                                                    placement="top"
                                                                    hasArrow
                                                                    color="white"
                                                                    isDisabled={false}
                                                                >
                                                                    <Td>
                                                                        <FieldInput
                                                                            id={`remarks_${item.id}`}
                                                                            name={`remarks_${item.id}`}
                                                                            size={'sm'}
                                                                            inputProps={{
                                                                                maxLength: import.meta.env
                                                                                .VITE_SHORT_REMARKS_LENGTH,
                                                                            }}
                                                                            isDisabled={item?.is_quality_check  || isLoading}
                                                                            defaultValue={fields?.[`remarks_${item.id}`]?.value || 'N/A'}
                                                                            onValueChange={(value) => {
                                                                                handleTextChange(String(value), Number(item.id))
                                                                            }}
                                                                            width={100}
                                                                        />
                                                                    </Td>
                                                                </Tooltip>
                                                                {/* <Td className='reMarksCommanDisplays'>
                                                                {
                                                                    fields?.[`remarks_${item.id}`]?.value && fields[`remarks_${item.id}`].value.trim() !== '' ? (
                                                                            <React.Fragment>
                                                                                <div className='reMarkstextHideShow'>
                                                                                    <Text
                                                                                    dangerouslySetInnerHTML={{
                                                                                        __html: fields?.[`remarks_${item.id}`]?.value,
                                                                                    }}
                                                                                    ></Text>
                                                                                </div>
                                                                                <div className='reMarksButtonHideShow'>
                                                                                    <Center>
                                                                                        <IconButton
                                                                                            aria-label="Write remarks"
                                                                                            variant='outline'
                                                                                            colorScheme='teal'
                                                                                            size={'sm'}
                                                                                            icon={<HiMiniClipboardDocumentList />}
                                                                                            onClick={() => {
                                                                                                setRemarkPopup(true);
                                                                                                setRemarkFileId(item.id);
                                                                                            }}
                                                                                            minWidth={'1.5rem'}
                                                                                            h={'1.5rem'}
                                                                                        />
                                                                                    </Center>
                                                                                </div>
                                                                            </React.Fragment>    
                                                                    ) : (
                                                                        <Center>
                                                                            <IconButton
                                                                                aria-label="Write remarks"
                                                                                variant='outline'
                                                                                colorScheme='teal'
                                                                                size={'sm'}
                                                                                icon={<HiMiniClipboardDocumentList />}
                                                                                onClick={() => {
                                                                                    setRemarkPopup(true);
                                                                                    setRemarkFileId(item.id);
                                                                                }}
                                                                                minWidth={'1.5rem'}
                                                                                h={'1.5rem'}
                                                                            />
                                                                        </Center>
                                                                    )
                                                                    }
                                                                </Td> */}
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
                                    
                                    {(refNo !== 0 && selectType === 'stf_import' && stockByStfArrayOptimze.length === 0) && (
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
                    isOpen={uploadPopUp}
                    size={'5xl'}
                    onClose={() => handleOpenDocument()}
                    closeOnOverlayClick={false} 
                    closeOnEsc={false}
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
                <Modal
                        initialFocusRef={initialRef}
                        isOpen={extraPopup}
                        size={'5xl'}
                        onClose={() => setExtraPopup(false)}
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
                {/* <Modal
                    initialFocusRef={initialRef}
                    isOpen={remarkPopup}
                    size={'5xl'}
                    onClose={() => setRemarkPopup(false)}
                    closeOnOverlayClick={false} 
                    closeOnEsc={false}
                >
                    <ModalOverlay />
                    <ModalContent>
                        <ModalHeader>Write Remarks</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={12}>
                           <FormControl>
                                <Formiz autoForm connect={fakeForm}>
                                    <FormLabel>Remarks</FormLabel>
                                    <FieldInput
                                        name={`remark`}
                                        size={'sm'}
                                        sx={{ display: 'none' }}
                                    />
                                    <FieldHTMLEditor
                                        key={`remarks`}
                                        defaultValue={fields?.[`remarks_${remarkFileId}`]?.value || ''}
                                        onValueChange={handleRemarksChange}
                                        maxLength={import.meta.env.VITE_ELABORATE_REMARKS_LENGTH}
                                        placeHolder={'Enter Remarks Here'}
                                    />
                                </Formiz>
                            </FormControl>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                colorScheme="teal"
                                mr={3}
                                size={'sm'}
                                onClick={() => setRemarkPopup(false)}
                            >
                            Update
                            </Button>
                        </ModalFooter>
                    </ModalContent>
                   
                </Modal> */}
                
            </Stack>
        </SlideIn>   
    );
};

export default ApprovalMaster;