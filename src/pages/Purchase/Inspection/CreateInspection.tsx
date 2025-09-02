    import React, { useEffect, useMemo, useRef, useState } from 'react';

    import { ChevronRightIcon, DeleteIcon } from '@chakra-ui/icons';
    import {
        Box,
        Breadcrumb,
        BreadcrumbItem,
        BreadcrumbLink,
        Button,
        Center,
        HStack,
        Heading,
        IconButton,
        Modal,
        ModalBody,
        ModalCloseButton,
        ModalContent,
        ModalFooter,
        ModalHeader,
        ModalOverlay,
        Stack,
        Tab,
        TabList,
        TabPanel,
        TabPanels,
        Table,
        TableContainer,
        Tabs,
        Tbody,
        Td,
        Text,
        Th,
        Thead,
        Tr,
        FormLabel,
        FormControl
    } from '@chakra-ui/react';
    import { Formiz, useForm } from '@formiz/core';
    import { format } from 'date-fns';
    import dayjs from 'dayjs';
    import { HiArrowNarrowLeft } from 'react-icons/hi';
    import { HiMiniQueueList } from "react-icons/hi2";
    import { LuPlus } from 'react-icons/lu';
    import { Link, useNavigate } from 'react-router-dom';
    import { FieldHTMLEditor } from '@/components/FieldHTMLEditor';
    import { FieldDayPicker } from '@/components/FieldDayPicker';
    import FieldDisplay from '@/components/FieldDisplay';
    import { FieldInput } from '@/components/FieldInput';
    import { FieldSelect } from '@/components/FieldSelect';
    import { FieldUpload } from '@/components/FieldUpload';
    import LoadingOverlay from '@/components/LoadingOverlay';
    import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
    import { SlideIn } from '@/components/SlideIn';
    import DocumentDownloadButton from '@/components/DocumentDownloadButton';
    import { useToastError, useToastSuccess } from '@/components/Toast';
    import { useLogisticsRequestDetails, useStockQtyDetails } from '@/services/logistics/request/services';
    import { useSTFDetails, useSTFList } from '@/services/purchase/stf/services';
    import { useCreateInspectionItem, useGetListStockByStf } from '@/services/purchase/stocks/services';
    import { useSearchPartNumber } from '@/services/spare/services';
    import { useFindByPartNumberBulkId } from '@/services/spare/services';
    import { useConditionList } from '@/services/submaster/conditions/services';
    import { usePackageTypeList } from '@/services/submaster/packagetype/services';
    import { useTypeOfTagList } from '@/services/submaster/type-of-tag/services';
    import { useUnitOfMeasureList } from '@/services/submaster/unitofmeasure/services';

    import PartDescription from '../../Purchase/Quotation/PartDescription';
    import { generatePackageNumber, transformToSelectOptions, formatDate } from '@/helpers/commonHelper';

    type SelectOption = {
        value: string | number;
        label: string | number;
    };

    interface Item {
        condition_id?: number;
        condition_name?: string;
        id?: number;
        logistic_request_id?: number;
        logistic_request_package_id?: number | null;
        part_number_id?: number;
        purchase_order_id?: number | null;
        qty?: number;
        packageTypeId?: string;
        packageNumber?: string;
        isDeleteBtn?: boolean;
    }

    interface ItemWithData extends Item {
        description: string;
        isDg: boolean;
        isSerialized: boolean;
        part_number: string;
        is_llp: boolean;
        uom_id: number;
    }

    type File = {
        id: number;
        file_name: string;
        url: string;
        stock_id: number;
        user_id: number;
    };

    type AllFiles = File[];

    type InspectionFile = {
        name: string;
        url: string;
    };

    interface StockItem {
        condition_id: number;
        control_id: string;
        created_at: string;
        files: File[];
        id: number;
        inspection_user_id: number;
        is_grn: boolean;
        is_quality_check: boolean;
        is_quarantine: boolean;
        llp: string;
        tag_by: string | null;
        trace: string | null;
        logistic_request_item_id: number | null;
        logistic_request_package_id: number;
        modified_at: string;
        part_number_id: number;
        qty: number;
        quality_checks: any[];
        remark: string;
        serial_lot_number: string;
        shelf_life: string;
        tag_date: string;
        type_of_tag_id: number;
    }

    interface FormData {
        serialOrLotNumber: string;
        llpValue: string;
        remark: string;
        tagDate: string;
        shelfLife: string;
        trace: string;
        tagBy: string;
        tagId: number | null;
        quarantineStatus: number | null;
        loadPackageId: string;
        LoadPackageData: ItemWithData | null;
        fileName: string;
        files: AllFiles;
    }

    type FormDataArray = FormData[];
    
    interface StockQtyDetails {
        added_qty: number;
        backorder_qty: number;
        prev_received_qty: number;
        total_po_qty: number;
        total_received_qty: number;
    }

    // const createPartNumberLookup = (items: ItemWithData[]): SelectOption[] => {
    //     return [
    //         { value: '', label: 'Select...' },
    //         ...items.map((item) => ({
    //             value: item.id ?? '',
    //             label: item.part_number ?? '',
    //         })),
    //     ];
    // };
    
    // const createPartNumberLookup = (items: ItemWithData[], items2: StockItem[]): SelectOption[] => {
    //     const uniqIds = items2.map(item2 => item2.logistic_request_item_id);
        
    //     const hasMatchingQuantity = (itemId: number): number => {
    //         const matchingItems = items2.filter(item2 => item2.logistic_request_item_id === itemId);
    //         return matchingItems.reduce((acc, mItem) => {
    //             if (mItem?.qty !== undefined) {
    //                 return acc + mItem.qty;
    //             }
    //             return acc;
    //         }, 0);
    //     };

    //     if (items2.length === 0) {
    //         return items.map(item => ({
    //             value: item.id ?? '',
    //             label: item.part_number ?? '',
    //         }));
    //     }

    //     return items
    //     .filter(item => {
    //         const itemQty = item.qty ?? 0;
    //         if (itemQty === hasMatchingQuantity(item.id ?? 0) && uniqIds.includes(item.id ?? 0)) {
    //             return false;
    //         }
    //         return true;
    //     })
    //     .map(item => ({
    //         value: item.id ?? '',
    //         label: item.part_number ?? '',
    //     }));
    // };
    
    const createPartNumberLookup = (items: ItemWithData[], items2: StockItem[]): SelectOption[] => {
        const usedQtyMap = items2.reduce((acc, item) => {
            if (item.logistic_request_item_id !== null) { // Ensure ID is not null
                acc[item.logistic_request_item_id] = (acc[item.logistic_request_item_id] || 0) + (item.qty ?? 0);
            }
            return acc;
        }, {} as Record<number, number>);
    
        const seen = new Set<string>();
        const result: { value: number; label: string }[] = [];
    
        for (const item of items) {
            const itemId = item.id ?? 0;
            const itemQty = item.qty ?? 0;
            const usedQty = usedQtyMap[itemId] || 0;
            const remainingQty = itemQty - usedQty;
    
            if (remainingQty > 0 && item.part_number && !seen.has(item.part_number)) {
                result.push({
                    value: itemId,
                    label: item.part_number,
                });
                seen.add(item.part_number);
            }
        }
        return result;
    };
    

    type HandleTabChangeAction = (name: string, key: number) => void;

    const CreateInspection = () => {
        const navigate = useNavigate();
        const toastSuccess = useToastSuccess();
        const toastError = useToastError();
        const fakeForm = useForm({});
        const popupForm = useForm({});
        const extraForm = useForm({});
        const initialRef = React.useRef(null);

        const itemForm = useForm({
            onValidSubmit: async (values) => {
            if (values) {
                if (!values?.qty || isNaN(values?.qty)) {
                    toastError({
                        title: 'Please enter a valid number.',
                        description: 'Quantity feild not allow to enter string value!',
                    });
                    return;
                }
                let newId = allItems.length + 1;
                const extraObject: Item = {
                    condition_id: values?.condition,
                    id: newId,
                    logistic_request_id: 3,
                    logistic_request_package_id: null,
                    part_number_id: values?.part_number,
                    purchase_order_id: null,
                    qty: values?.qty,
                    packageTypeId: 'Non obtain',
                    packageNumber: 'Non obtain',
                    isDeleteBtn: true,
                };
                setAddExtraItemsObject((prev) => {
                  return [...prev, extraObject];
                });
                setAddMismatchItem(!addMismatchItem);
                setQtyFeildsValue(null);
                toastSuccess({
                  title: `Mismatch Item Created`,
                });
            } else {
                toastError({
                    title: 'Mismatch Item Creation Failed',
                    description: 'Unknown Error',
                });
            }
            },
        });
        const [formKey, setFormKey] = useState(0);
        const form = useForm({
            onSubmit: async () => {
                const payload = {
                    stf_id: Number(stfId),
                    logistic_request_item_id: formData[tabIndex]?.LoadPackageData?.isDeleteBtn
                    ? null
                    : formData[tabIndex]?.LoadPackageData?.id,
                    logistic_request_package_id:
                    stfPackage?.[tabIndex]?.logistic_request_package_id,
                    serial_lot_number: formData[tabIndex]?.serialOrLotNumber ?? '',
                    part_number_id: Number(formData[tabIndex]?.LoadPackageData?.part_number_id),
                    condition_id: Number(formData[tabIndex]?.LoadPackageData?.condition_id),
                    qty: formData[tabIndex]?.LoadPackageData?.isSerialized ? 1 : Number(addPartNoBasedQty),
                    type_of_tag_id: Number(formData[tabIndex]?.tagId),
                    tag_date: formatDate(formData[tabIndex]?.tagDate) ?? '',
                    tag_by: formData[tabIndex]?.tagBy ?? '',
                    trace: formData[tabIndex]?.trace ?? '',
                    llp: formData[tabIndex]?.llpValue ?? '',
                    shelf_life: formatDate(formData[tabIndex]?.shelfLife) ?? '',
                    is_quarantine: formData[tabIndex]?.quarantineStatus == 1 ? true : false,
                    remark: formData[tabIndex]?.remark ?? '',
                    files: transformedFiles,
                };
                if (
                    formData[tabIndex]?.serialOrLotNumber &&
                    addPartNoBasedQty &&
                    formData[tabIndex]?.llpValue &&
                    formData[tabIndex]?.shelfLife &&
                    formData[tabIndex]?.tagId &&
                    formData[tabIndex]?.tagDate &&
                    formData[tabIndex]?.quarantineStatus
                ) {
                    setIsLoading(true);
                    createInspect.mutate(payload);
                }
            },
        });

        const [stfId, setStfId] = useState<number>(0);
        const [tabIndex, setTabIndex] = useState<number>(0);
        const [totalPartNoBasedQty, setTotalPartNoBasedQty] = useState<number>(0);
        const [addPartNoBasedQty, setAddPartNoBasedQty] = useState<number>(0);
        const [addMismatchItem, setAddMismatchItem] = useState<boolean>(true);
        const [addExtraItemsObject, setAddExtraItemsObject] = useState<Item[]>([]);
        const [uploadPopUp, setUploadPopUp] = useState<boolean>(false);
        const [uploadPopUp2, setUploadPopUp2] = useState<boolean>(false);
        // const [viewImageDetails, setViewImageDetails] = useState<InspectionFile>();
        const [styleCss, setStyleCss] = useState<boolean>(false);
        const [isLoading, setIsLoading] = useState<boolean>(false);
        const [isTableLoading, setIsTableLoading] = useState<boolean>(true);
        // AddMistach Form value
        const [isPartNumber, setIsPartNumber] = useState<number>(0);
        const prevPartNumber = useRef<number>(isPartNumber);
        const [qtyFeildsValue, setQtyFeildsValue] = useState<number | null>(null);

        const [stockQtyDetails, setStockQtyDetails] = useState<StockQtyDetails>({
            added_qty: 0,
            backorder_qty: 0,
            prev_received_qty: 0,
            total_po_qty: 0,
            total_received_qty: 0,
        });
        // End
        // Form 2 
        const [newItemId, setNewItemId] = useState<number | null>(null)
        const [extraPopup, setExtraPopup] = useState<boolean>(false);
        const [extraFileId, setExtraFileId] = useState<number | null>(null);
        // End
        const conditionList = useConditionList({});
        const conditionOptions = transformToSelectOptions(conditionList.data);

        const stockByStfData = useGetListStockByStf({ stf_id: stfId });
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
        
        const handleUpdateAllState = () => {
            updatePartNo(Number(0)),
            updateFormData(tabIndex, 'loadPackageId', '');
            updateFormData(tabIndex, 'LoadPackageData', null);
            setAddMismatchItem(false);
            setTimeout(() => {
                setIsTableLoading(false)
            }, 1000);
        };

        const packageTypeList = usePackageTypeList();
        const listData = useSearchPartNumber({});
        const sparelistData = listData.data?.part_numbers;
        const spareOptions = sparelistData?.map((spare) => ({
            value: spare.id,
            label: spare.part_number,
        }));

        const typeOfTagList = useTypeOfTagList({});
        const typeOfTagOptions = transformToSelectOptions(typeOfTagList.data);

        const unitOfMeasureData = useUnitOfMeasureList({});

        const stfListData = useSTFList({});
        const stfOptions = transformToSelectOptions(stfListData.data);
        const stfData = useSTFDetails(Number(stfId));
        const stfDetails = stfData.data?.data;
        const stfPackage = stfData.data?.data?.packages || [];
        const lrIpData = useLogisticsRequestDetails(stfDetails?.logistic_request_id || 0);
        const lrPackage = lrIpData.data?.data?.packages || [];
        const lrItems = lrIpData.data?.data?.items || [];
        const shipperDetails = lrIpData?.data?.data?.customer;
        const poDetails = lrIpData?.data?.data?.purchase_orders;

        const poIds: string =
            poDetails && poDetails.length > 0
            ? poDetails.map((po) => po.id).join(', ')
            : 'N/A';

        const unitIp =
            unitOfMeasureData?.data?.items[
            lrPackage?.[tabIndex]?.unit_of_measurement_id
            ] || 'N/A';
        const weightIp =
            unitOfMeasureData?.data?.items[
            lrPackage?.[tabIndex]?.weight_unit_of_measurement_id
            ] || 'N/A';

        const nonPackageItems = lrItems.map((item) => ({
            ...item,
            packageTypeId: item?.logistic_request_package_id ? 'Obtain' : 'Non obtain',
            packageNumber: item?.logistic_request_package_id ? 'Obtain' : 'Non obtain',
            isDeleteBtn: false,
        }));
        
        const allItems: Item[] = [...nonPackageItems, ...addExtraItemsObject];

        // const partNumberIds: number[] = allItems.length > 0 ? Array.from(new Set(allItems.map(item => item.part_number_id))) : [0];
        const partNumberIds: number[] =
            allItems.length > 0
            ? Array.from(
                new Set(
                    allItems
                    .map((item) => item.part_number_id)
                    .filter((id): id is number => id !== undefined)
                )
                )
            : [0];

        const spareIpData = useFindByPartNumberBulkId(partNumberIds);

        const itemsWithData: ItemWithData[] = allItems.map((item) => {
            const partNumberData = spareIpData?.data?.[item.part_number_id || 0];
            const conditionData = conditionList?.data?.items;
            const description = partNumberData?.part_number?.description || '';
            const isDg = partNumberData?.part_number?.is_dg;
            const isSerialized = partNumberData?.part_number?.is_serialized;
            const partNumber = partNumberData?.part_number?.part_number || '';
            const conditionName = conditionData?.[item.condition_id || ''] || '';
            const llp = partNumberData?.part_number?.is_llp || false;
            const uom = partNumberData?.part_number?.unit_of_measure_id;
            return {
                ...item,
                description: description,
                isDg: isDg,
                isSerialized: isSerialized,
                part_number: partNumber,
                condition_name: conditionName,
                is_llp: llp,
                uom_id: uom,
            } as ItemWithData;
        });

        const handleTabChangeAction: HandleTabChangeAction = (name, key) => {
            console.log('tab clicked', name);
            setTabIndex(Number(key));
        };
    
        const partNumberLookup = createPartNumberLookup(itemsWithData, stockByStfArray);

        const updatePartNo = (value: number | string) => {
            if(value !== 0){
                let returnData = itemsWithData.find((item) => item.id === value);
                updateFormData(tabIndex, 'loadPackageId', String(value));
                updateFormData(tabIndex, 'LoadPackageData', Object(returnData));

                const matchingItems1: StockItem[] = stockByStfArray.filter(
                    (item) =>
                        item.logistic_request_item_id === value &&
                        item.logistic_request_item_id !== null
                    );
                    let matchingItems2 = itemsWithData.filter((item) => item.id === value);
        
                    if (matchingItems1.length > 0 || matchingItems2.length > 0) {
                        const totalQty1 = matchingItems1.reduce((sum, item) => sum + item.qty, 0);
                        const totalQty2 = matchingItems2.reduce(
                            (sum, item) => sum + (item.qty ?? 0),
                            0
                        );
                        const difference = Math.abs(Number(totalQty1) - Number(totalQty2));
                        setTotalPartNoBasedQty(difference);
                        setAddPartNoBasedQty(difference);
                    } else {
                        setTotalPartNoBasedQty(Number(returnData?.qty));
                    }
            }
        };

        const updatePartQty = (value: number) => {
            setAddPartNoBasedQty(value);
        };

        const handleMismatchItem = () => {
            setAddMismatchItem(!addMismatchItem);
        };

        const allApiDataLoaded = [stfListData, conditionList].every(
            (query) => query.isSuccess
        );

        const createInspect = useCreateInspectionItem({
            onSuccess: (data) => {
                setNewItemId(Number(data?.id))
                updateFormData(tabIndex, 'loadPackageId', '');
                updateFormData(tabIndex, 'LoadPackageData', null);
                
                setIsLoading(false);
               
                setTimeout(() => setNewItemId(null), 10000);
                setFormKey((prevKey) => prevKey + 1);
                form.reset();
                stockByStfData.refetch();

                toastSuccess({
                    title: `Package Item Created ${data.id}`,
                });
            },
            onError: (error) => {
                setIsLoading(false);
                toastError({
                    title: 'Package Item Creation Failed',
                    description: error.response?.data.message || 'Unknown Error',
                });
            },
        });

        const isDisabled = (
            addPartNoBasedQty: number,
            totalPartNoBasedQty: number
        ): boolean => {
            return addPartNoBasedQty <= totalPartNoBasedQty;
        };

        const handleAddMismatchItem = () => {
            itemForm.submit();
        };

        const handlePartNumberChange = (value: number) => {
            setIsPartNumber(value);
        };

        const partDescriptionMemo = useMemo(() => {
            if (isPartNumber !== 0) {
            prevPartNumber.current = isPartNumber;
            }
            const partNumberToUse =
            isPartNumber !== 0 ? isPartNumber : prevPartNumber.current;
            return <PartDescription partNumber={Number(partNumberToUse)} size="sm" />;
        }, [isPartNumber]);

        const handleDeleteItem = (id: number) => {
            setAddExtraItemsObject((prev) => {
            return prev.filter((item) => item.id !== id);
            });
            console.log('Deleted item ID:', id);
        };

        const getPackageId = (id: number) => {
            const packageType = stfPackage.find((pkg) => pkg.logistic_request_package_id === id);
            return packageType?.package_type_id;
        };

        const addFile = (newFile: File) => {
            updateFormData(tabIndex, 'files', [...(formData[tabIndex]?.files || []), newFile]);
        };

        const handleAddExtraFile = () => {
            addFile({
                id: formData[tabIndex]?.files.length + 1,
                file_name: formData[tabIndex]?.fileName,
                url: '',
                stock_id: 1,
                user_id: 1,
            });
            updateFormData(tabIndex, 'fileName', '')
            handleOpenDocument('popUpExtra');
        };

        const handleDeleteFileItem = (id: number) => {
            updateFormData(tabIndex, 'files', formData[tabIndex]?.files.filter(file => file.id !== id) || []);
        };

        const handleAddFileDetails = (value: string, id: number) => {
            const updatedFileName = formData[tabIndex]?.files.map((item) =>
            item.id === id ? { ...item, url: value } : item
            );
            updateFormData(tabIndex, 'files', updatedFileName);
        };

        const handleOpenDocument = (type: string) => {
            if (type === 'popUpOpen') {
               setUploadPopUp(!uploadPopUp);
            } else {
                setUploadPopUp(!uploadPopUp);
                setUploadPopUp2(!uploadPopUp2);
            }
        };

        const handleRemarksChange = (newValue: string) => {
            setFormData((prevData) =>
                prevData.map((item, idx) =>
                    idx === tabIndex ? { ...item, [`remark`]: newValue } : item
                )
            );
        };

        // AddPackage Form value
        const initialFormData =
            stfPackage && stfPackage.length > 0
            ? stfPackage.map(() => ({
                serialOrLotNumber: '',
                llpValue: '',
                remark: '',
                tagDate: '',
                shelfLife: '',
                trace: '',
                tagBy: '',
                tagId: null,
                quarantineStatus: null,
                loadPackageId: '',
                LoadPackageData: null,
                fileName: '',
                files: [
                    {
                    id: 1,
                    file_name: 'Upload Part',
                    url: '',
                    stock_id: 1,
                    user_id: 1,
                    },
                    {
                    id: 2,
                    file_name: 'Tags',
                    url: '',
                    stock_id: 1,
                    user_id: 1,
                    },
                    {
                    id: 3,
                    file_name: 'Trace Docs',
                    url: '',
                    stock_id: 1,
                    user_id: 1,
                    },
                    {
                    id: 4,
                    file_name: 'Other Docs',
                    url: '',
                    stock_id: 1,
                    user_id: 1,
                    },
                ]
              }))
            : [];
        const [formData, setFormData] = useState<FormDataArray>(initialFormData);
        // End
        const updateFormData = (index: number, key: keyof FormData, value: any) => {
            setFormData((prevData) =>
                prevData.map((item, idx) =>
                    idx === index ? { ...item, [key]: value } : item
                )
            );
        };
        
        const transformedFiles: InspectionFile[] = formData[tabIndex]?.files.map((file) => ({
            name: file.file_name,
            url: file.url,
        }));

        useEffect(() => {
            if (stfPackage && stfPackage.length > 0) {
                const updatedFormData = stfPackage.map(() => ({
                    serialOrLotNumber: '',
                    llpValue: '',
                    remark: '',
                    tagDate: '',
                    shelfLife: '',
                    trace: '',
                    tagBy: '',
                    tagId: null,
                    quarantineStatus: null,
                    loadPackageId: '',
                    LoadPackageData: null,
                    fileName: '',
                    files: [
                        {
                        id: 1,
                        file_name: 'Upload Part',
                        url: '',
                        stock_id: 1,
                        user_id: 1,
                        },
                        {
                        id: 2,
                        file_name: 'Tags',
                        url: '',
                        stock_id: 1,
                        user_id: 1,
                        },
                        {
                        id: 3,
                        file_name: 'Trace Docs',
                        url: '',
                        stock_id: 1,
                        user_id: 1,
                        },
                        {
                        id: 4,
                        file_name: 'Other Docs',
                        url: '',
                        stock_id: 1,
                        user_id: 1,
                        },
                    ]
                }));
                setFormData(updatedFormData);
            }
        }, [stfPackage]);

        // console.clear();
        // console.log("stockByStfArrayOptimze", stockByStfArrayOptimze, 'partNumberLookup', partNumberLookup)
        const stockQtyDetailsData = useStockQtyDetails({ logistic_request_item_id: formData[tabIndex]?.LoadPackageData?.id || 0 });

        const updateStockQtyDetails = (details?: StockQtyDetails) => {
            const fallbackData: StockQtyDetails = {
              added_qty: 0,
              backorder_qty: 0,
              prev_received_qty: 0,
              total_po_qty: 0,
              total_received_qty: 0,
            };
          
            setStockQtyDetails(details || fallbackData);
        };

        useEffect(() => {
            if (stockQtyDetailsData?.data?.status === true) {
              updateStockQtyDetails(stockQtyDetailsData?.data?.data);
            }
        }, [stockQtyDetailsData]);

        const spareIpDetails = spareIpData?.data?.[formData[tabIndex]?.LoadPackageData?.part_number_id || 0]?.part_number;

        // console.log("spareIpData", spareIpData?.data?.[formData[tabIndex]?.LoadPackageData?.part_number_id || 0]?.spare, allItems, formData[tabIndex]?.LoadPackageData)
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
                                <BreadcrumbLink as={Link} to="/inspection/dashboard">
                                Inspection
                                </BreadcrumbLink>
                            </BreadcrumbItem>

                            <BreadcrumbItem isCurrentPage color={'gray.500'}>
                                <BreadcrumbLink>Create</BreadcrumbLink>
                            </BreadcrumbItem>
                            </Breadcrumb>
                            <Heading as="h4" size={'md'}>
                            New Inspection
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
                            Inspection Create
                        </Text>
                        <Formiz autoForm connect={fakeForm}>
                            <LoadingOverlay isLoading={!allApiDataLoaded}>
                            <Stack spacing={4} mb={4}>
                                <Stack
                                    spacing={4}
                                    p={4}
                                    bg={'gray.100'}
                                    borderRadius={'md'}
                                    boxShadow={'md'}
                                    borderWidth={1}
                                    borderColor={'gray.200'}
                                >
                                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                                    <FieldSelect
                                        label="STF No"
                                        name="stf_no"
                                        options={stfOptions}
                                        size={'sm'}
                                        onValueChange={(value) => {
                                           setStfId(Number(value)), handleUpdateAllState();
                                        }}
                                        required={true}
                                    />
                                    <FieldInput
                                        key={`stf_date_${stfDetails?.stf_date}`}
                                        label="STF Date"
                                        name="stf_date"
                                        size={'sm'}
                                        defaultValue={
                                            stfDetails?.stf_date
                                            ? format(new Date(stfDetails?.stf_date), 'yyyy-MM-dd')
                                            : 'N/A'
                                        }
                                        isReadOnly={true}
                                    />
                                    <FieldInput
                                        key={`ref_${stfId}`}
                                        label="REF"
                                        name="ref"
                                        size={'sm'}
                                        defaultValue={stfId !== 0 ? 'Against PO' : 'N/A'}
                                        isReadOnly={true}
                                    />
                                    <FieldInput
                                        key={`ref_no_${poIds}`}
                                        label="REF NO"
                                        name="ref_no"
                                        size={'sm'}
                                        defaultValue={poIds}
                                        isReadOnly={true}
                                    />
                                </Stack>
                                <Stack
                                    spacing={8}
                                    direction={{ base: 'column', md: 'row' }}
                                    marginTop={'1rem'}
                                >
                                    <FieldInput
                                    key={`shipper_name_${shipperDetails?.business_name}`}
                                    label="Shipper Name"
                                    name="shipper_name"
                                    size={'sm'}
                                    defaultValue={shipperDetails?.business_name ?? 'N/A'}
                                    isReadOnly={true}
                                    />
                                    <FieldInput
                                    key={`shipper_code_${shipperDetails?.code}`}
                                    label="Shipper Code"
                                    name="shipper_code"
                                    size={'sm'}
                                    defaultValue={shipperDetails?.code ?? 'N/A'}
                                    isReadOnly={true}
                                    />
                                    <FieldInput
                                    key={`lr_no_${stfDetails?.logistic_request_id}`}
                                    label="LR No"
                                    name="lr_no"
                                    size={'sm'}
                                    defaultValue={stfDetails?.logistic_request_id ?? 'N/A'}
                                    isReadOnly={true}
                                    />
                                    <FieldInput
                                    key={`lr_date_${lrIpData?.data?.data?.created_at}`}
                                    label="LR Date"
                                    name="lr_date"
                                    size={'sm'}
                                    defaultValue={
                                        lrIpData?.data?.data?.created_at
                                        ? format(
                                            new Date(lrIpData?.data?.data?.created_at),
                                            'yyyy-MM-dd'
                                            )
                                        : 'N/A'
                                    }
                                    isReadOnly={true}
                                    />
                                    <FieldInput
                                        key={`total_package_${lrPackage?.length}_${stfId}`}
                                        label="Total Package"
                                        name="total_package"
                                        size={'sm'}
                                        defaultValue={stfId !== 0 ? lrPackage?.length : 'N/A'}
                                        isReadOnly={true}
                                    />
                                    <FieldInput
                                        key={`total_item_${lrItems?.length}_${stfId}`}
                                        label="Total Item"
                                        name="total_item"
                                        size={'sm'}
                                        defaultValue={stfId !== 0 ? lrItems.length : 'N/A'}
                                        isReadOnly={true}
                                    />
                                </Stack>
                                </Stack>
                            </Stack>
                            {stfId !== 0 && (
                                <Stack
                                    spacing={4}
                                    p={4}
                                    bg={'white'}
                                    borderRadius={'md'}
                                    boxShadow={'md'}
                                    borderWidth={1}
                                    borderColor={'gray.200'}
                                    mb={2}
                                >
                                    <Text fontSize={'md'} fontWeight={'700'}>
                                        Total No Of Items Received
                                    </Text>
                                    <TableContainer
                                        borderRadius={'md'}
                                        boxShadow={'md'}
                                        borderWidth={1}
                                        borderColor={'gray.200'}
                                        overflow={'auto'}
                                    >
                                        <Table variant={'simple'} size={'sm'}>
                                            <Thead bg={'gray'}>
                                                <Tr>
                                                    <Th color={'white'}>Line Item</Th>
                                                    <Th color={'white'}>Part NO#</Th>
                                                    <Th color={'white'}>Description</Th>
                                                    <Th color={'white'}>Condition</Th>
                                                    <Th color={'white'}>Goods Type</Th>
                                                    <Th color={'white'}>Qty</Th>
                                                    <Th color={'white'}>STF Pkg</Th>
                                                    <Th color={'white'}>S/N Status</Th>
                                                    <Th color={'white'}>Action</Th>
                                                </Tr>
                                            </Thead>
                                            <Tbody>
                                                {itemsWithData.length > 0 && (
                                                    itemsWithData.map((item, index) => (
                                                        <Tr key={`stf-item-${item.id}`} bg={item.isDeleteBtn ? 'red.500' : undefined}>
                                                            <Td>{index + 1}</Td>
                                                            <Td>{item.part_number || 'Loading...'}</Td>
                                                            <Td>{item.description || 'Loading...'}</Td>
                                                            <Td>{item.condition_name || 'Loading...'}</Td>
                                                            <Td>{item.isDg ? 'DG' : 'Non-DG'}</Td>
                                                            <Td>{item.qty || 'Loading...'}</Td>
                                                            <Td>{item.packageNumber || 'Loading...'}</Td>
                                                            <Td>
                                                                {item.isSerialized
                                                                ? 'Serialized'
                                                                : 'Non-Serialized'}
                                                            </Td>
                                                            <Td textAlign={'center'}>
                                                                {item.isDeleteBtn && (
                                                                    <IconButton
                                                                        aria-label="Delete Row"
                                                                        colorScheme="red.500"
                                                                        size={'sm'}
                                                                        minWidth={'1.5rem'}
                                                                        h={'1.5rem'}
                                                                        icon={<DeleteIcon />}
                                                                        onClick={() =>
                                                                        handleDeleteItem(Number(item.id))
                                                                        }
                                                                        mr={2}
                                                                    />
                                                                )}
                                                            </Td>
                                                        </Tr>
                                                    ))
                                                )}
                                            </Tbody>
                                        </Table>
                                        {itemsWithData.length === 0 && (
                                            <>
                                                {isTableLoading ? (
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
                                    <Stack>
                                        {addMismatchItem && (
                                        <Formiz autoForm connect={itemForm}>
                                            <Stack
                                                bg={'blue.100'}
                                                borderRadius={'md'}
                                                boxShadow={'md'}
                                                borderWidth={1}
                                                borderColor={'blue.200'}
                                                p={4}
                                                mt={4}
                                                spacing={4}
                                                direction={{ base: 'column', md: 'row' }}
                                            >
                                            <FieldSelect
                                                name={`part_number`}
                                                id={`part_number`}
                                                size={'sm'}
                                                menuPortalTarget={document.body}
                                                label={'Part Number'}
                                                required={'Part Number is required'}
                                                options={spareOptions ?? []}
                                                isClearable={false}
                                                onValueChange={(value) => {
                                                   handlePartNumberChange(Number(value));
                                                }}
                                                selectProps={{
                                                    noOptionsMessage: () => 'No parts found',
                                                    isLoading: listData.isLoading,
                                                    onInputChange: (event: any) => {
                                                        handlePartNumberChange(Number(event));
                                                    },
                                                }}
                                                style={{width: 'auto', minWidth: 160, maxWidth: 'auto'}}
                                            />
                                            {partDescriptionMemo}
                                            <FieldSelect
                                                label="Condition"
                                                name="condition"
                                                options={conditionOptions}
                                                required={'Condition is required'}
                                                size={'sm'}
                                                onValueChange={(value) => {
                                                    console.log('condition', value);
                                                }}
                                            />
                                            <FieldInput
                                                type={'integer'}
                                                label={'Qty'}
                                                name={`qty`}
                                                placeholder="Enter Qty"
                                                size={'sm'}
                                                required={'Qty is required'}
                                                defaultValue={qtyFeildsValue}
                                                onValueChange={(value) => {
                                                   setQtyFeildsValue(Number(value));
                                                }}
                                            />
                                            <Button
                                                colorScheme="brand"
                                                size={'sm'}
                                                px={4}
                                                mt={7}
                                                width="200px"
                                                onClick={() => {
                                                   handleAddMismatchItem();
                                                }}
                                            >
                                                + Add
                                            </Button>
                                            </Stack>
                                        </Formiz>
                                        )}
                                    </Stack>
                                    <Stack direction={{ base: 'column', md: 'row' }}>
                                        <ResponsiveIconButton
                                            variant={'@primary'}
                                            icon={<LuPlus />}
                                            size={'sm'}
                                            onClick={handleMismatchItem}
                                        >
                                        Add Mismatch Item
                                        </ResponsiveIconButton>
                                    </Stack>
                                </Stack>
                            )}
                            </LoadingOverlay>
                        </Formiz>

                        {stfId !== 0 && (
                            <Stack
                                spacing={4}
                                p={4}
                                bg={'gray.100'}
                                borderRadius={'md'}
                                boxShadow={'md'}
                                borderWidth={1}
                                mb={4}
                            >
                                <Tabs variant="enclosed-colored" colorScheme="green" mt={4}>
                                    <TabList flexWrap={'wrap'}>
                                    {stfPackage.map((item, num) => (
                                        <Tab
                                            key={`sftTabs-${num}`}
                                            onClick={() => {
                                                handleTabChangeAction(
                                                String(
                                                    generatePackageNumber(packageTypeList, item.package_type_id, num + 1)
                                                ),
                                                Number(num)
                                                );
                                            }}
                                        >
                                            {generatePackageNumber(packageTypeList, item.package_type_id, num + 1)}
                                        </Tab>
                                    ))}
                                    </TabList>
                                    <TabPanels>
                                        {stfPackage.map((item, num) => (
                                            <TabPanel key={`Tab_${item.id}_${num}`} padding={0}>
                                                <Formiz autoForm connect={form}>
                                                    <Box borderColor={'gray.200'} backgroundColor="white">
                                                        <TableContainer>
                                                            <Table variant="striped" colorScheme="teal">
                                                                <Thead>
                                                                    <Tr>
                                                                    <Th></Th>
                                                                    <Th>Dimension</Th>
                                                                    <Th>UOM</Th>
                                                                    <Th>Weight</Th>
                                                                    <Th>UOM</Th>
                                                                    <Th>Package Type</Th>
                                                                    </Tr>
                                                                </Thead>
                                                                <Tbody>
                                                                    <Tr>
                                                                    <Td>AS PER AWB :</Td>
                                                                    <Td
                                                                        key={`As_Per_Awb_${lrPackage?.[tabIndex]?.length}_${lrPackage?.[tabIndex]?.width}_${lrPackage?.[tabIndex]?.height}`}
                                                                    >{`L: ${lrPackage?.[tabIndex]?.length || 'N/A'}  W : ${lrPackage?.[tabIndex]?.width || 'N/A'}  H : ${lrPackage?.[tabIndex]?.height || 'N/A'}`}</Td>
                                                                    <Td key={`As_Per_Awb_unit_${unitIp}`}>
                                                                        {unitIp}
                                                                    </Td>
                                                                    <Td
                                                                        key={`As_Per_Awb_weight_${lrPackage?.[tabIndex]?.weight}`}
                                                                    >
                                                                        {lrPackage?.[tabIndex]?.weight || 'N/A'}
                                                                    </Td>
                                                                    <Td key={`As_Per_Awb_weight_${weightIp}`}>
                                                                        {weightIp}
                                                                    </Td>
                                                                    <Td key={`As_Per_Awb_${generatePackageNumber(packageTypeList, lrPackage?.[tabIndex]?.package_type_id, 1)}`}>{`Carton Box-${generatePackageNumber(packageTypeList, lrPackage?.[tabIndex]?.package_type_id, 1)}`}</Td>
                                                                    </Tr>
                                                                    <Tr>
                                                                    <Td key={`Actual`}>Actual :</Td>
                                                                    <Td
                                                                        key={`Actual_${stfPackage?.[tabIndex]?.length}_${stfPackage?.[tabIndex]?.width}_${stfPackage?.[tabIndex]?.height}`}
                                                                    >{`L: ${stfPackage?.[tabIndex]?.length || 'N/A'}  W : ${stfPackage?.[tabIndex]?.width || 'N/A'}  H : ${stfPackage?.[tabIndex]?.height || 'N/A'}`}</Td>
                                                                    <Td key={`Actual_unit_${unitIp}`}>
                                                                        {unitIp}
                                                                    </Td>
                                                                    <Td
                                                                        key={`Actual_weight_${stfPackage?.[tabIndex]?.weight}`}
                                                                    >
                                                                        {stfPackage?.[tabIndex]?.weight || 'N/A'}
                                                                    </Td>
                                                                    <Td key={`Actual_weight_${weightIp}`}>
                                                                        {weightIp}
                                                                    </Td>
                                                                    <Td
                                                                        key={`Actual_${generatePackageNumber(packageTypeList, stfPackage?.[tabIndex]?.package_type_id, 1)}`}
                                                                    >{`Carton Box-${generatePackageNumber(packageTypeList, stfPackage?.[tabIndex]?.package_type_id, 1)}`}</Td>
                                                                    </Tr>
                                                                </Tbody>
                                                            </Table>
                                                        </TableContainer>
                                                    </Box>
                                                    <HStack justifyContent={'flex-start'} mt={2}>
                                                        <HStack spacing={2} align="center">
                                                            <FieldSelect
                                                                key={`part_number_${formKey}`}
                                                                name="part_number"
                                                                label="Part Number"
                                                                options={partNumberLookup}
                                                                size="md"
                                                                isDisabled={false}
                                                                required={true}
                                                                width={'15rem'}
                                                                defaultValue={formData[num]?.loadPackageId || ''}
                                                                onValueChange={(value) => {
                                                                    updatePartNo(Number(value));
                                                                }}
                                                            />
                                                        </HStack>
                                                    </HStack>
                                                    {formData[num]?.LoadPackageData !== null && (
                                                        <Stack bg={'blue.100'}
                                                            p={4}
                                                            rounded={'md'}
                                                            border={'1px solid'}
                                                            borderColor={'blue.300'}
                                                            marginTop={'1rem'}
                                                        >
                                                            <Stack
                                                                spacing={8}
                                                                direction={{ base: 'column', md: 'row' }}
                                                                bg={'white'}
                                                                p={'.5rem'}
                                                                borderRadius='0.375rem'
                                                                alignItems={'end'}
                                                            >
                                                                <FieldDisplay
                                                                    label="Description"
                                                                    value={formData[num]?.LoadPackageData?.description || 'N/A'}
                                                                    size={'sm'}
                                                                />
                                                                <FieldDisplay
                                                                label="Condition"
                                                                value={
                                                                    formData[num]?.LoadPackageData?.condition_name || 'N/A'
                                                                }
                                                                size={'sm'}
                                                                />
                                                                <FieldDisplay
                                                                label="Order Qty"
                                                                value={formData[num]?.LoadPackageData?.qty || 'N/A'}
                                                                size={'sm'}
                                                                />
                                                                <FieldDisplay
                                                                label="Prev. Rec. Qty"
                                                                value={stockQtyDetails?.prev_received_qty || 'N/A'}
                                                                size={'sm'}
                                                                />
                                                                <FieldDisplay
                                                                label="Added Qty"
                                                                // value={
                                                                //     formData[num]?.LoadPackageData?.isSerialized
                                                                //     ? 1
                                                                //     : itemsWithData.reduce(
                                                                //         (total, item) =>
                                                                //             total + (item.qty || 0),
                                                                //         0
                                                                //         )
                                                                // }
                                                                value={stockQtyDetails?.added_qty || 'N/A'}
                                                                size={'sm'}
                                                                />
                                                                <FieldDisplay
                                                                label="Back Ord Qty"
                                                                value={stockQtyDetails?.backorder_qty || 'N/A'}
                                                                size={'sm'}
                                                                />
                                                                <FieldDisplay
                                                                    label="Uom"
                                                                    value={
                                                                        formData[num]?.LoadPackageData?.uom_id !== undefined 
                                                                            ? unitOfMeasureData?.data?.items[formData[num]?.LoadPackageData?.uom_id || 0] 
                                                                            : undefined
                                                                    }
                                                                    size="sm"
                                                                />
                                                                <FieldDisplay
                                                                label="Po Number"
                                                                value={formData[num]?.LoadPackageData?.purchase_order_id || 'N/A'}
                                                                size={'sm'}
                                                                />
                                                            </Stack>
                                                            <Stack>
                                                                <Stack
                                                                    spacing={8}
                                                                    direction={{ base: 'column', md: 'row' }}
                                                                    mt={'1rem'}
                                                                    alignItems={'end'}
                                                                >
                                                                    <FieldInput
                                                                        key={`${num}_serial_or_lot_number`}
                                                                        label={formData[num]?.LoadPackageData?.isSerialized ? 'Serial Number' :  'Lot Number'}
                                                                        name="serial_or_lot_number"
                                                                        size={'sm'}
                                                                        required={`${formData[num]?.LoadPackageData?.isSerialized ? 'Serial Number is required' : 'Lot Number is required'}`}
                                                                        isReadOnly={false}
                                                                        defaultValue={
                                                                        formData[num]?.serialOrLotNumber
                                                                        }
                                                                        onValueChange={(value) => {
                                                                            updateFormData(
                                                                                num,
                                                                                'serialOrLotNumber',
                                                                                String(value)
                                                                            );
                                                                        }}
                                                                    />
                                                                    <FieldInput
                                                                        key={`${num}_qty`}
                                                                        label="Qty"
                                                                        name="qty"
                                                                        type={'integer'}
                                                                        size="sm"
                                                                        required={!formData[num]?.LoadPackageData?.isSerialized}
                                                                        defaultValue={formData[num]?.LoadPackageData?.isSerialized ? 1 : addPartNoBasedQty || formData[num]?.LoadPackageData?.qty || 0}
                                                                        isReadOnly={!!formData[num]?.LoadPackageData?.isSerialized}
                                                                        onValueChange={(value) => updatePartQty(Number(value))}
                                                                    />
                                                                    <FieldDayPicker
                                                                        key={`${num}_tag_date`}
                                                                        name="tag_date"
                                                                        label="Tag Date"
                                                                        placeholder="Tag Date"
                                                                        borderColor={'gray.200'}
                                                                        size="sm"
                                                                        required={'Tag date is required'}
                                                                        defaultValue={
                                                                        formData[num]?.tagDate
                                                                            ? dayjs(formData[num]?.tagDate)
                                                                            : undefined
                                                                        }
                                                                        onValueChange={(value) =>
                                                                        updateFormData(
                                                                            num,
                                                                            'tagDate',
                                                                            String(value)
                                                                        )
                                                                        }
                                                                    />
                                                                    <FieldInput
                                                                        key={`${num}_tag_By`}
                                                                        label="Tag By"
                                                                        name="tag_by"
                                                                        size={'sm'}
                                                                        defaultValue={formData[num]?.tagBy}
                                                                        onValueChange={(value) => {
                                                                        updateFormData(
                                                                            num,
                                                                            'tagBy',
                                                                            String(value)
                                                                        );
                                                                        }}
                                                                        isReadOnly={false}
                                                                        // required={'Tag by is required'}
                                                                    />
                                                                    <FieldInput
                                                                        key={`${num}_trace`}
                                                                        label="Trace"
                                                                        name="trace"
                                                                        size={'sm'}
                                                                        defaultValue={formData[num]?.trace}
                                                                        onValueChange={(value) => {
                                                                        updateFormData(
                                                                            num,
                                                                            'trace',
                                                                            String(value)
                                                                        );
                                                                        }}
                                                                        isReadOnly={false}
                                                                        // required={'Trace is required'}
                                                                    />
                                                                </Stack>
                                                                <Stack
                                                                    spacing={8}
                                                                    direction={{ base: 'column', md: 'row' }}
                                                                    marginTop={'1rem'}
                                                                    alignItems={'end'}
                                                                >
                                                                    <FieldSelect
                                                                        key={`${formKey}_${num}_type_of_tag`}
                                                                        name="type_of_tag"
                                                                        label="Type Of Tag"
                                                                        options={typeOfTagOptions}
                                                                        size="sm"
                                                                        isDisabled={false}
                                                                        defaultValue={formData[num]?.tagId}
                                                                        onValueChange={(value) => {
                                                                        updateFormData(
                                                                            num,
                                                                            'tagId',
                                                                            String(value)
                                                                        );
                                                                        }}
                                                                        required={'Type of tag is required'}
                                                                    />
                                                                    {!spareIpDetails?.is_llp &&
                                                                        (<FieldInput
                                                                            key={`${num}_LLP`}
                                                                            label="LLP"
                                                                            name="llp"
                                                                            size={'sm'}
                                                                            defaultValue={formData[num]?.llpValue}
                                                                            onValueChange={(value) => {
                                                                            updateFormData(
                                                                                num,
                                                                                'llpValue',
                                                                                String(value)
                                                                            );
                                                                            }}
                                                                            isReadOnly={!!spareIpDetails?.is_llp}
                                                                            required={!spareIpDetails?.is_llp}
                                                                        />)
                                                                    }    
                                                                    {!spareIpDetails?.is_shelf_life &&
                                                                        (<FieldDayPicker
                                                                            key={`${num}_shelf_life`}
                                                                            name="shelf_life"
                                                                            label="Shelf Life"
                                                                            placeholder="Shelf Life"
                                                                            borderColor={'gray.200'}
                                                                            size="sm"
                                                                            defaultValue={
                                                                                formData[num]?.shelfLife
                                                                                    ? dayjs(formData[num]?.shelfLife)
                                                                                    : undefined
                                                                                }
                                                                            onValueChange={(value) =>
                                                                                updateFormData(
                                                                                    num,
                                                                                    'shelfLife',
                                                                                    String(value)
                                                                                )
                                                                            }
                                                                            isReadOnly={!!spareIpDetails?.is_shelf_life}
                                                                            required={!spareIpDetails?.is_shelf_life}
                                                                        />)
                                                                    }
                                                                    <FieldSelect
                                                                        key={`${formKey}_quarantine_status`}
                                                                        name="quarantine_status"
                                                                        label="Quarantine Status"
                                                                        options={[
                                                                        { label: 'Quarantine', value: 1 },
                                                                        { label: 'Non Quarantine', value: 2 },
                                                                        ]}
                                                                        size="sm"
                                                                        isDisabled={false}
                                                                        defaultValue={
                                                                        formData[num]?.quarantineStatus
                                                                        }
                                                                        onValueChange={(value) => {
                                                                            updateFormData(
                                                                                num,
                                                                                'quarantineStatus',
                                                                                String(value)
                                                                            );
                                                                        }}
                                                                        required={'Quarantine status is required'}
                                                                    />
                                                                    <FormControl>
                                                                        {/* <FormLabel>&nbsp;</FormLabel> */}
                                                                        <FormLabel>
                                                                            <p>
                                                                               {formData[num]?.files.filter(file => file.url !== '').length} files uploaded
                                                                            </p>
                                                                        </FormLabel>
                                                                        <ResponsiveIconButton
                                                                            variant={'@primary'}
                                                                            icon={<LuPlus />}
                                                                            size={'sm'}
                                                                            top={'-5px'}
                                                                            onClick={() => {
                                                                               handleOpenDocument('popUpOpen');
                                                                            }}
                                                                        >
                                                                            Manage Uploads
                                                                        </ResponsiveIconButton>
                                                                        
                                                                    </FormControl>
                                                                </Stack>
                                                                <Stack
                                                                    spacing={8}
                                                                    direction={{ base: 'column', md: 'row' }}
                                                                    marginTop={'1rem'}
                                                                    alignItems={'end'}
                                                                >
                                                                    <FormControl>
                                                                        <FormLabel>Remarks</FormLabel>
                                                                        <FieldInput
                                                                            name={`remark`}
                                                                            size={'sm'}
                                                                            sx={{ display: 'none' }}
                                                                        />
                                                                        <FieldHTMLEditor
                                                                            key={`remarks_${num}_${formKey}`}
                                                                            onValueChange={handleRemarksChange}
                                                                            maxLength={import.meta.env.VITE_ELABORATE_REMARKS_LENGTH}
                                                                            placeHolder={'Enter Remarks Here'}
                                                                        />
                                                                    </FormControl>
                                                                </Stack>
                                                                {/* Button action */}
                                                                <HStack justifyContent={'center'} mt={2}>
                                                                    <HStack
                                                                        spacing={2}
                                                                        align="center"
                                                                        marginTop={'2rem'}
                                                                    >
                                                                        <Button
                                                                            colorScheme="green"
                                                                            size={'sm'}
                                                                            minW={20}
                                                                            type="submit"
                                                                            isLoading={isLoading}
                                                                            isDisabled={
                                                                                !isDisabled(
                                                                                addPartNoBasedQty !== 0
                                                                                    ? addPartNoBasedQty
                                                                                    : formData[num]?.LoadPackageData?.qty ?? 0,
                                                                                totalPartNoBasedQty ?? 0
                                                                                )
                                                                            }
                                                                        >
                                                                        Save
                                                                        </Button>
                                                                        <Button
                                                                            colorScheme="orange"
                                                                            size={'sm'}
                                                                            minW={20}
                                                                            onClick={() => {
                                                                                form.reset(), 
                                                                                updateFormData(num,'LoadPackageData', null)
                                                                                updateFormData(num,'loadPackageId', '')
                                                                                setIsLoading(false)
                                                                            }}
                                                                        >
                                                                        Close
                                                                        </Button>
                                                                    </HStack>
                                                                </HStack>
                                                                {/* End */}
                                                            </Stack>
                                                        </Stack>
                                                    )}

                                                    {formData[num]?.LoadPackageData === null && (
                                                        <Stack spacing={2}>
                                                            <Stack
                                                                spacing={8}
                                                                direction={{ base: 'column', md: 'row' }}
                                                                bg={'blue.100'}
                                                                p={4}
                                                                rounded={'md'}
                                                                border={'1px solid'}
                                                                borderColor={'blue.300'}
                                                                marginTop={'1rem'}
                                                                justifyContent={'center'}
                                                            >
                                                                <Text
                                                                    fontSize="md"
                                                                    fontWeight="400"
                                                                    textAlign={'center'}
                                                                >
                                                                    Please choose a part number and preview data
                                                                </Text>
                                                            </Stack>
                                                        </Stack>
                                                    )}
                                                </Formiz>
                                            </TabPanel>
                                        ))}
                                    </TabPanels>
                                </Tabs>
                            </Stack>
                        )}
                    </Stack>
                    {stockByStfArray.length !== 0 && (
                        <Stack
                            spacing={2}
                            p={4}
                            bg={'white'}
                            borderRadius={'md'}
                            boxShadow={'md'}
                            marginTop={'1rem'}
                        >
                            <HStack justify={'space-between'} mt={2}>
                            <Text fontSize="md" fontWeight="700">
                                Added Items
                            </Text>
                            </HStack>
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
                                        <Th color={'white'}>Remarks</Th>
                                        <Th color={'white'}>Package Info</Th>
                                        <Th color={'white'}>Part Pictures</Th>
                                        <Th color={'white'}>Tags</Th>
                                        <Th color={'white'}>Trace Docs</Th>
                                        <Th color={'white'}>Other Docs</Th>
                                    </Tr>
                                </Thead>
                                <Tbody>
                                    {stockByStfArray.length > 0 ? (
                                        stockByStfArrayOptimze.map((item, index) => {
                                            return (
                                                <Tr 
                                                key={`stf-item-${item.id}`} 
                                                sx={{
                                                    backgroundColor:
                                                    newItemId === item.id
                                                        ? 'yellow'
                                                        : index % 2 === 0
                                                        ? '#ffffff' : 'green.200',
                                                    transition: 'background-color 2s ease',
                                                }}
                                                >
                                                    <Td>{index + 1}</Td>
                                                    <Td>{item.control_id ?? 'Loading...'}</Td>
                                                    <Td>{item.part_number ?? 'Loading...'}</Td>
                                                    <Td>{item.description ?? 'Loading...'}</Td>
                                                    <Td>{item.condition_name ?? 'Loading...'}</Td>
                                                    <Td>{item.serial_lot_number ?? 'Loading...'}</Td>
                                                    <Td>{item.qty ?? 'Loading...'}</Td>
                                                    <Td>
                                                        {item?.uom_id !== undefined &&
                                                        unitOfMeasureData?.data?.items[item.uom_id]
                                                        ? unitOfMeasureData.data.items[item.uom_id]
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
                                                        {generatePackageNumber(packageTypeList,
                                                        Number(getPackageId(
                                                            item.logistic_request_package_id
                                                        )),
                                                        index + 1
                                                        ) ?? 'Loading...'}
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
                                                </Tr>
                                            );
                                        })
                                    ) : (
                                        <Center p="4">
                                        <Text>No data found!</Text>
                                        </Center>
                                    )}
                                </Tbody>
                            </Table>
                            </TableContainer>
                        </Stack>
                    )}
                    <Modal
                        initialFocusRef={initialRef}
                        isOpen={uploadPopUp}
                        size={'5xl'}
                        onClose={() => handleOpenDocument('popUpOpen')}
                        closeOnOverlayClick={false} 
                        closeOnEsc={false}
                    >
                    <ModalOverlay />
                    <ModalContent>
                        <Formiz autoForm connect={popupForm}>
                        <ModalHeader>All Upload Documents</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={12}>
                            {formData[tabIndex]?.files.length > 0 ? (
                                formData[tabIndex]?.files.map((item, index) => {
                                    return (
                                        <HStack justify={'space-between'} mt={2}>
                                            <FieldUpload
                                                key={`inspectionForm1_${item.file_name}_${index}_upload_part`}
                                                label={item.file_name}
                                                name={item.file_name
                                                    .replace(/\s+/g, '_')
                                                    .toLowerCase()}
                                                placeholder="Upload"
                                                existingFileUrl={item?.url || ''}
                                                size={'sm'}
                                                onValueChange={(value) => {
                                                    handleAddFileDetails(String(value), item.id);
                                                }}
                                            />
                                            {index > 3 && (
                                                <Stack marginTop={item?.url ? '0rem' : '1.8rem'} flexDirection={'row'}>
                                                    <IconButton
                                                        aria-label="Delete Row"
                                                        colorScheme="red"
                                                        size={'sm'}
                                                        icon={<DeleteIcon />}
                                                        onClick={() =>
                                                            handleDeleteFileItem(Number(item.id))
                                                        }
                                                        mr={2}
                                                    />
                                                    { 
                                                        item?.url && (
                                                            <Box margin={0} padding={0} mt={'-8px'}>
                                                                <DocumentDownloadButton size={'sm'} mt={2}
                                                                    url={item?.url || ''}
                                                                />
                                                            </Box>
                                                        )
                                                    }
                                                </Stack>
                                            )}
                                            {
                                                index <= 3 && item?.url && (
                                                    <Box margin={0} padding={0} mt={styleCss ? '20px' : '-11px'}>
                                                        <DocumentDownloadButton size={'sm'} mt={2}
                                                            url={item?.url || ''}
                                                        />
                                                    </Box>
                                                )
                                            }
                                        </HStack>
                                    );
                                })
                            ) : (
                                <Center>
                                    <Text>No document found!</Text>
                                </Center>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                colorScheme="teal"
                                mr={3}
                                size={'sm'}
                                onClick={() => handleOpenDocument('popUpExtra')}
                            >
                            Add more files
                            </Button>
                            <Button
                                colorScheme="red"
                                size={'sm'}
                                onClick={() => handleOpenDocument('popUpOpen')}
                            >
                               Close
                            </Button>
                        </ModalFooter>
                        </Formiz>
                    </ModalContent>
                    </Modal>
                    <Modal
                        initialFocusRef={initialRef}
                        isOpen={uploadPopUp2}
                        size={'5xl'}
                        onClose={() => {
                                handleOpenDocument('popUpExtra'),
                                setStyleCss(true)
                            }
                        }    
                    >
                    <ModalOverlay />
                    <ModalContent>
                        <Formiz autoForm connect={extraForm}>
                        <ModalHeader>Extra Documents</ModalHeader>
                        <ModalCloseButton />
                        <ModalBody pb={12}>
                            <FieldInput
                                label="File Name"
                                name="file_name"
                                size={'sm'}
                                required={'File Name is required'}
                                defaultValue={formData[tabIndex]?.fileName}
                                onValueChange={(value) => {
                                    updateFormData(
                                        tabIndex,
                                        'fileName',
                                        String(value)
                                    );
                                }}
                                isReadOnly={false}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                colorScheme="green"
                                mr={3}
                                size={'sm'}
                                onClick={() => {
                                        handleAddExtraFile(), 
                                        setStyleCss(true)
                                    }
                                }
                                isDisabled={formData[tabIndex]?.fileName === '' && true}
                            >
                            Add
                            </Button>
                            <Button
                                colorScheme="red"
                                size={'sm'}
                                onClick={() => {
                                       handleOpenDocument('popUpExtra'),
                                       setStyleCss(true)
                                    }
                                }
                            >
                            Close
                            </Button>
                        </ModalFooter>
                        </Formiz>
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
                </Stack>
            </SlideIn>
        );
    };

    export default CreateInspection;
