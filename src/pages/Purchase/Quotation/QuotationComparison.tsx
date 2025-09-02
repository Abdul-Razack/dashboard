import React, { useEffect, useState } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Alert,
  AlertIcon,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Checkbox,
  Flex,
  HStack,
  Heading,
  Spinner,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate, useParams } from 'react-router-dom';
import CurrencyDisplay from '@/components/CurrencyDisplay';
import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldInput } from '@/components/FieldInput';
import FieldDisplay from '@/components/FieldDisplay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import PartDescription from '@/pages/Purchase/Quotation/PartDescription';
import { usePRFQDetails } from '@/services/purchase/prfq/services';
import { useQuotationsByRFQ } from '@/services/purchase/quotation/services';
import { useConditionList } from '@/services/submaster/conditions/services';

const QuotationComparison = () => {
  const form = useForm();
  const navigate = useNavigate();
  const [allQuotationItems, setQuotationItems] = useState<TODO>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const { rfqId } = useParams<{ rfqId: string }>();
  const [mrNo, setMrNo] = useState<number[]>([]);
  const [groupedQuotations, setGroupedQuotations] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleConfirm = () => {
    redirctPage();
    handleClose();
  };

  const handleClose = () => {
    setIsOpen(false); // Close the modal on cancel or outside click
  };

  const conditionList = useConditionList({});

  const {
    data: quotationsData,
    isLoading: isQuotationsLoading,
    isError: isQuotationsError,
  } = useQuotationsByRFQ(Number(rfqId));

  const {
    data: prfqData,
    isLoading: isPrfqLoading,
    isError: isPrfqError,
  } = usePRFQDetails(Number(rfqId));

  useEffect(() => {
    if (prfqData?.data?.purchase_requests) {
      console.log("Purchase Requests:", prfqData.data.purchase_requests);
  
      setMrNo([
        ...new Set(prfqData.data.purchase_requests.map((item: any) => item.id)),
      ]);
    }
  }, [prfqData]);
  

  useEffect(() => {
    console.log(quotationsData)
    if (quotationsData && quotationsData.quotations) {
      const allQuotations = quotationsData.quotations.flatMap((item: TODO) =>
        item.items.map((quotationItem: TODO) => ({
          ...quotationItem,
          customer_id: item.customer_id,
        }))
      );
      setQuotationItems(allQuotations);
      const grouped = quotationsData.quotations.reduce(
        (acc: any, quotation) => {
          quotation.items.forEach((item: any) => {
            const key = item.requested_part_number_id;
            if (!acc[key]) {
              acc[key] = {
                reqPartNumber: item.requested_part_number_id,
                reqCN: item.condition_id,
                reqPrice: item.price,
                reqQty: item.qty,
                quotations: [],
              };
            }
            acc[key].quotations.push({
              id: item.id,
              quotationId: quotation.id,
              currencyId: quotation.currency_id,
              quotationNumber: item.quotation_id,
              vendorName: quotation.customer.business_name,
              vendorId: quotation.customer.id,
              partNumber: item.part_number_id,
              altPartNumber: '', // Add if available in your data
              condition: item.condition_id,
              lastTimePurchasedPrice: 0, // Add if available in your data
              unitPrice: parseFloat(item.price),
              purchase_request: item.purchase_request,
              delivery_options: item.delivery_options,
              recQty: item.qty,
              moq: item.moq,
              mov: item.mov,
              remark: item.remark,
            });
          });
          return acc;
        },
        {}
      );
      

      setGroupedQuotations(Object.values(grouped));
    }
    
  }, [quotationsData]);

  const handleSelectItem = (itemId: number, vendorId: number) => {
    if (selectedVendor === null || selectedVendor === vendorId) {
      setSelectedItems((prev) => {
        const updatedSelectedItems = prev.includes(itemId)
          ? prev.filter((id) => id !== itemId)
          : [...prev, itemId];
        if (updatedSelectedItems.length === 0) {
          setSelectedVendor(null);
        } else {
          setSelectedVendor(vendorId);
        }

        return updatedSelectedItems;
      });
    }
  };

  const isItemSelectable = (quotationId: number) => {
    return selectedVendor === null || selectedVendor === quotationId;
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked && selectedVendor !== null) {
      const allItemIds = groupedQuotations.flatMap((reqPart) =>
        reqPart.quotations
          .filter((quote: any) => quote.vendorId === selectedVendor)
          .map((quote: any) => quote.id)
      );
      console.log(allItemIds)
      setSelectedItems(allItemIds);
    } else {
      setSelectedItems([]);
      setSelectedVendor(null);
    }
  };

  const isAllSelected =
    selectedVendor !== null &&
    groupedQuotations.flatMap((reqPart) =>
      reqPart.quotations.filter(
        (quote: any) => quote.vendorId === selectedVendor
      )
    ).length === selectedItems.length;

  const handleCreatePO = () => {
    if (selectedVendor && selectedItems.length > 0) {
      const selectedQuotations = allQuotationItems.filter((quote: TODO) =>
        selectedItems.includes(quote.id)
      );
      console.log(selectedQuotations);
      const propertiesToCheck = [
        'customer_id',
        'part_number_id',
        'condition_id',
      ];

      const hasSameValues = selectedQuotations.every((quote: TODO) =>
        propertiesToCheck.every(
          (property) => quote[property] === selectedQuotations[0][property]
        )
      );

      if (selectedQuotations.length > 1 && hasSameValues) {
        setIsOpen(true);
      } else {
        redirctPage();
      }
    }
  };

  const redirctPage = () => {
    const itemIds = selectedItems.join(',');
    const selectedQuotations = allQuotationItems.filter((quote: TODO) =>
      selectedItems.includes(quote.id)
    );
    const quotationIds = selectedQuotations.map(
      (quotation: any) => quotation.quotation_id
    );
    const uniqueQuotations = [...new Set(quotationIds)];
    const query = `quotation_id=${uniqueQuotations.join(',')}&item_id=${itemIds}`;
    navigate(`/purchase/purchase-order/create?${query}`);
  };

  if (isQuotationsLoading || isPrfqLoading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner />
      </Flex>
    );
  }

  if (isQuotationsError || isPrfqError) {
    return (
      <Alert status="error">
        <AlertIcon />
        Quotation data not found
      </Alert>
    );
  }

  const getConditionNameById = (condition_id: number): string => {
    const conditionData = conditionList?.data?.items;

    if (typeof conditionData === 'object' && conditionData !== null) {
      return conditionData[condition_id] ?? '';
    }

    return 'N/A';
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
                <BreadcrumbLink as={Link} to={'/'}>
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink as={Link} to={'/purchase/quotation'}>
                  Quotation
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Quotation Comparison</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Quotation Comparison
            </Heading>
          </Stack>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<HiArrowNarrowLeft />}
            size={'sm'}
            fontWeight={'thin'}
            onClick={() => {
              navigate('/purchase/quotation');
            }}
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
            Quotation Comparison
          </Text>
          <Formiz autoForm connect={form}>
            <Stack spacing={2}>
              <Stack
                spacing={8}
                direction={{ base: 'column', md: 'row' }}
                bg={'green.100'}
                p={4}
                rounded={'md'}
                border={'1px solid'}
                borderColor={'green.300'}
              >
                <FieldDisplay
                  label={'MR NO'}
                  value={mrNo.join(',')}
                />
                <FieldDisplay
                  label={'PRFQ'}
                  value={rfqId}
                />
              </Stack>
              <Text fontSize={'md'} fontWeight={'700'}>
                Suggested Dashboard
              </Text>
              <HStack>
                <FieldInput
                  label={'Overall Best Price Quoted Vendor'}
                  name="best"
                  size={'sm'}
                  defaultValue={'N/A'}
                />
                <FieldInput
                  label={'Recommended Fast delivery by Vendor'}
                  name="recc"
                  defaultValue={'N/A'}
                  size={'sm'}
                />
                <FieldInput
                  label={'Most Trustable Vendor'}
                  name="trust"
                  size={'sm'}
                  defaultValue={'N/A'}
                />
              </HStack>
              <Flex justifyContent="flex-end" mt={2}>
                <Button
                  colorScheme="green"
                  size="sm"
                  onClick={handleCreatePO}
                  isDisabled={selectedItems.length === 0}
                >
                  Create PO
                </Button>
              </Flex>
              <TableContainer overflow={'auto'} mt={2}>
                <Table variant="unstyled" size={'sm'} className='comparison-table'>
                  <Thead>
                    <Tr>
                      <Th
                        bg={'green.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        <Checkbox
                          isChecked={isAllSelected}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          isDisabled={selectedVendor === null}
                        />
                      </Th>
                      <Th
                        bg={'green.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        S.NO
                      </Th>
                      <Th
                        bg={'green.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        Q.No
                      </Th>
                      <Th
                        bg={'green.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        MR.No
                      </Th>

                      <Th
                        bg={'green.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        Ven.Name
                      </Th>
                      <Th
                        bg={'green.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        Part.Num
                      </Th>
                      <Th
                        bg={'green.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        Desc.
                      </Th>
                      <Th
                        bg={'green.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        Quo.CN
                      </Th>
                      <Th
                        bg={'green.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        Last Pur.Price
                      </Th>
                      <Th
                        bg={'blue.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        Quo.Unit Price
                      </Th>
                      <Th
                        bg={'blue.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        Rec Qty
                      </Th>
                      <Th
                        bg={'blue.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        MOQ
                      </Th>
                      <Th
                        bg={'blue.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        MOV
                      </Th>
                      <Th
                        bg={'blue.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        Delivery
                      </Th>
                      <Th
                        bg={'blue.500'}
                        color={'black'}
                        borderWidth="1px"
                        borderColor="black"
                      >
                        Remark
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {groupedQuotations.map((reqPart, reqPartIndex) => (
                      <React.Fragment key={reqPartIndex}>
                        <Tr bg="green.200">
                          <Td borderWidth="1px"
                            borderColor="black"></Td>
                          <Td borderWidth="1px"
                            borderColor="black"></Td>
                          <Td borderWidth="1px"
                            borderColor="black"></Td>
                          <Td borderWidth="1px"
                            borderColor="black"></Td>
                          <Td
                            colSpan={2}
                            textAlign="center"
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Req Part.Num:
                            <PartDescription
                                    partNumber={reqPart.reqPartNumber}
                                    size="sm"
                                    isPlain={true}
                                    field='part_number'
                                  />
                          </Td>
                          <Td
                            textAlign="center"
                            borderWidth="1px"
                            borderColor="black"
                          >
                            {/* Req CN: {getConditionNameById(reqPart.reqCN)} */}
                          </Td>
                          <Td
                            textAlign="center"
                            borderWidth="1px"
                            borderColor="black"
                          >
                            Req CN: {getConditionNameById(reqPart.reqCN)}
                            {/* Req Price: ${reqPart.reqPrice} */}
                          </Td>
                          <Td borderWidth="1px" borderColor="black"></Td>
                          <Td borderWidth="1px" borderColor="black"></Td>
                          <Td textAlign="center"
                            borderWidth="1px"
                            borderColor="black">
                          Req Qty: {reqPart.reqQty}
                          </Td>
                          <Td borderWidth="1px"
                            borderColor="black"></Td>
                          <Td borderWidth="1px"
                            borderColor="black"></Td>
                            <Td borderWidth="1px"
                            borderColor="black"></Td>
                          <Td borderWidth="1px"
                            borderColor="black"></Td>
                        </Tr>
                        {reqPart.quotations.map(
                          (quote: any, quoteIndex: number) => {
                            const isDisabled = !isItemSelectable(
                              quote.vendorId
                            );
                            return (
                              <Tr
                                key={`${quoteIndex}_${quote.id}`}
                                bg={isDisabled ? 'gray.100' : 'white'}
                                opacity={isDisabled ? 0.5 : 1}
                              >
                                <Td borderWidth="1px" borderColor="black">
                                  <Checkbox
                                    isChecked={selectedItems.includes(quote.id)}
                                    onChange={() =>
                                      handleSelectItem(quote.id, quote.vendorId)
                                    }
                                    isDisabled={isDisabled}
                                  />
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {quoteIndex + 1}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {quote.quotationNumber}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {quote.purchase_request.id}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {quote.vendorName}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                <PartDescription
                                    partNumber={quote.partNumber}
                                    size="sm"
                                    isPlain={true}
                                    field='part_number'
                                  />
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  <PartDescription
                                    partNumber={quote.partNumber}
                                    size="sm"
                                    isPlain={true}
                                  />
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {getConditionNameById(quote.condition) ||
                                    'Loading...'}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {quote.lastTimePurchasedPrice !== 0 && 
                                  (<CurrencyDisplay currencyId={quote?.currencyId.toString() ?? '' }/>)}
                                  {quote.lastTimePurchasedPrice !== 0
                                    ? `${quote.lastTimePurchasedPrice}`
                                    : ''}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  <CurrencyDisplay currencyId={quote?.currencyId.toString() ?? '' }/>
                                  {quote.unitPrice}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {quote.recQty}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {quote.moq}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {quote.mov}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {quote.delivery_options}
                                </Td>
                                <Td borderWidth="1px" borderColor="black">
                                  {quote.remark ? quote.remark : 'NA'}
                                </Td>
                              </Tr>
                            );
                          }
                        )}
                      </React.Fragment>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            </Stack>
          </Formiz>
        </Stack>
        <ConfirmationPopup
          isOpen={isOpen}
          onClose={handleClose}
          onConfirm={handleConfirm}
          headerText={'Duplicate Entry!!'}
          bodyText={
            'This condition has already been added for this part number. Do you want to continue?'
          }
        />
      </Stack>
    </SlideIn>
  );
};

export default QuotationComparison;
