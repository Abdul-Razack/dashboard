import { useState } from 'react';
import {
    Accordion,
    AccordionButton,
    AccordionIcon,
    AccordionItem,
    AccordionPanel,
    Box,
    Button,
    HStack,
    Heading,
    Stack,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { HiOutlineXCircle } from 'react-icons/hi';
import { LuPlus } from 'react-icons/lu';

import { SlideIn } from '@/components/SlideIn';
import { FieldSelect } from '@/components/FieldSelect';

import { transformToSelectOptions } from '@/helpers/commonHelper';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useCreateLogesticOrderItem } from '@/services/logistics/order/services';
import { useLogisticQuotationList } from '@/services/logistics/quotation/services';

export const LogisticsOrderCreate = () => {
    
    const toastSuccess = useToastSuccess();
    const toastError = useToastError();

    const [queryParams, setQueryParams] = useState({});
    const [loId, setLoId] = useState(Number(0));

    const form = useForm({
        onValidSubmit: (values) => {
          setQueryParams({ search: values });
          let payload = {
            "logistic_quotation_id": values?.rfq_id
          }
          createLogesticOrder.mutate(payload);
        },
    });
    const mobileForm = useForm({
        onValidSubmit: (values) => {
          setQueryParams({ search: values });
        },
    });

    
    const createLogesticOrder = useCreateLogesticOrderItem({
        onSuccess: (data) => {
            form.reset();
            toastSuccess({
                title: `Logistics Orders Created ${data.existing_order_id}`,
            });
        },
        onError: (error) => {
            toastError({
                title: 'Logistics Orders Creation Failed',
                description: error.response?.data.message || 'Unknown Error',
            });
        },
    });

    console.log("queryParams", queryParams)

    const QuotationList = useLogisticQuotationList();
    const loQuotationOptions = transformToSelectOptions(QuotationList.data);

    return(
        <SlideIn>
            <Stack pl={2} spacing={4}>
            <HStack justify={'space-between'}>
                <Heading as="h4" size={'md'}>
                 Logistics Orders Create
                </Heading>
            </HStack>

            <Formiz autoForm connect={mobileForm}>
                <Box width="100%" mt={2} display={{ base: 'flex', md: 'none' }}>
                <Accordion defaultIndex={[]} allowToggle w={'100%'}>
                    <AccordionItem border="none">
                    {({ isExpanded }) => (
                        <>
                        <AccordionButton
                            px={4}
                            py={2}
                            bg="white"
                            borderRadius="md"
                            _expanded={{
                            bg: 'white',
                            borderBottomEndRadius: 0,
                            borderBottomStartRadius: 0,
                            }}
                            width="100%"
                        >
                            <Box flex="1" textAlign="left">
                            Filter Options
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel p={0}>
                            <Stack
                                direction={{ base: 'column', md: 'row' }}
                                bg={'white'}
                                p={6}
                                borderRadius={4}
                                spacing={4}
                                align={'flex-start'}
                                justify={'flex-start'}
                            >
                                <FieldSelect
                                    name={'rfq_id'}
                                    required={'RFQ ID is required'}
                                    placeholder="Select Quotation ID"
                                    options={loQuotationOptions}
                                    w={{ base: 'full', md: '20%' }}
                                    onValueChange={(value) => {
                                        setLoId(Number(value));
                                    }}
                                />
                                <Button
                                    type="reset"
                                    bg={'gray.200'}
                                    leftIcon={<HiOutlineXCircle />}
                                    w={{ base: 'full', md: 'auto' }}
                                    onClick={() => {
                                        mobileForm.reset();
                                        setQueryParams({});
                                        setLoId(Number(0));
                                    }}
                                >
                                    Clear
                                </Button>
                                

                            </Stack>
                            <Button
                                type="submit"
                                variant="@primary"
                                w={{ base: 'full', md: 'auto' }}
                                leftIcon={<LuPlus />}
                                isDisabled={!(loId !== 0)}
                            >
                                Create LO
                            </Button>
                        </AccordionPanel>
                        {!isExpanded && (
                            <Box display={{ md: 'none' }} p={6}>
                            {/* Placeholder box to maintain space when accordion is collapsed */}
                            </Box>
                        )}
                        </>
                    )}
                    </AccordionItem>
                </Accordion>
                </Box>
            </Formiz>

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
                        name={'rfq_id'}
                        required={'RFQ ID is required'}
                        placeholder="Select Quotation ID"
                        options={loQuotationOptions}
                        w={{ base: 'full', md: '20%' }}
                        onValueChange={(value) => {
                            setLoId(Number(value));
                        }}
                    />
                    <Button
                        type="reset"
                        bg={'gray.200'}
                        leftIcon={<HiOutlineXCircle />}
                        w={{ base: 'full', md: 'auto' }}
                        onClick={() => {
                        mobileForm.reset();
                        setQueryParams({});
                        setLoId(Number(0));
                        }}
                    >
                        Clear
                    </Button>
                    <Stack
                       justify={'flex-end'}
                    >
                        <Button
                            type="submit"
                            variant="@primary"
                            w={{ base: 'full', md: 'auto' }}
                            leftIcon={<LuPlus />}
                            isDisabled={!(loId !== 0)}
                        >
                            Create LO
                        </Button>
                    </Stack>
                </Stack>
                
            </Formiz>

            {/* <Box borderRadius={4}>
                <HStack
                bg={'white'}
                justify={'space-between'}
                mb={4}
                p={4}
                borderTopRadius={4}
                >
                <Heading as="h4" size={'md'}>
                    Supplier Pricing List
                </Heading>
                </HStack>

                <DataTable
                columns={columns}
                data={data}
                loading={listData.isLoading}
                />
                <Box p={4} mt={4} display="flex" justifyContent="space-between">
                <Text fontSize="sm" color="gray.500">
                    Showing {data.length} of {listData.data?.total} entries
                </Text>
                <Pagination
                    currentPage={listData.data?.current_page ?? 1}
                    totalCount={listData.data?.total ?? 0}
                    pageSize={10}
                    onPageChange={(page) => {
                    setQueryParams({ ...queryParams, page });
                    }}
                />
                </Box>
            </Box> */}
            </Stack>
        </SlideIn>
    )
}

export default LogisticsOrderCreate; 