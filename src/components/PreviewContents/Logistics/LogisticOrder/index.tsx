import { useEffect, useRef, useState } from 'react';

import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import debounce from 'lodash/debounce';
import { HiPrinter } from 'react-icons/hi';

import PDFFooter from '@/components/PreviewContents/Blocks/PDFFooter';
import PDFHeader from '@/components/PreviewContents/Blocks/PDFHeader';
import {
  calculateVolumetricWeight,
  downloadPDF,
  getDisplayLabel,
  getTableItems,
  transformToSelectOptions
} from '@/helpers/commonHelper';

import PartDetails from '../../PartDetails';
import PartNumberDetails from '../../PartNumberDetails';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  data: any;
};

export const PreviewPopup = ({ isOpen, onClose, data }: ModalPopupProps) => {
  const headerElementRef = useRef<HTMLDivElement | null>(null);
  const footerElementRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(0);
  const [footerHeight, setFooterHeight] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    if (isOpen) {
      const updateHeight = debounce(() => {
        if (headerElementRef.current) {
          setHeaderHeight(headerElementRef.current.offsetHeight);
        }
        if (footerElementRef.current) {
          setFooterHeight(footerElementRef.current.offsetHeight);
        }
      }, 300);

      // Create and observe the content
      const resizeObserver = new ResizeObserver(updateHeight);
      if (headerElementRef.current) {
        resizeObserver.observe(headerElementRef.current);
      }
      if (footerElementRef.current) {
        resizeObserver.observe(footerElementRef.current);
      }

      // Initial height update
      updateHeight();
      // Cleanup on unmount or when `isOpen` changes
      return () => {
        resizeObserver.disconnect();
      };
      
    }
    
  }, [isOpen]);

  const getPackageNumber = (rowId: number) => {
    const packageTypeId = data[`package_type_id_${rowId}`];
    return generatePackageNumber(packageTypeId);
  };


  const generatePackageNumber = (
    packageTypeId: number | string
  ) => {
    const packageTypeLabel = data.packageTypeList.data?.items[Number(packageTypeId)];
    if (!packageTypeLabel) return '';
    const prefix =
      packageTypeLabel
        .match(/\b(\w)/g)
        ?.join('')
        .toUpperCase() || '';
    return `${prefix}`;
  };

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!;
    downloadPDF(input, 'logistic-order');
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="65vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="md" fontWeight="bold">
            Preview Logistic Order
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box borderRadius={4}>
            <Stack spacing={2} bg={'white'} borderRadius={'md'}>
              <Container
                maxW="container.lg"
                p={2}
                id="table-to-export"
                minH="1122px"
              >
                <Box borderWidth="1px" borderRadius="lg" p={2} boxShadow="md">
                  <Box
                    p={0}
                    m={0}
                    border="none"
                    bg="transparent"
                    ref={headerElementRef}
                  >
                    <PDFHeader style={{ fontSize: '13px' }} />
                  </Box>
                  <Box
                    p={0}
                    m={0}
                    border="none"
                    bg="transparent"
                    minH={1122 - (headerHeight + footerHeight) + 'px'}
                  >
                    <Flex justify="space-between" mb={2}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="100%"
                      >
                        <Text fontSize="lg" fontWeight="bold">
                          LOGISTICS ORDER
                        </Text>
                      </Box>
                    </Flex>

                    <Divider borderColor="black" borderWidth={1} />
                      <Flex mb={3} justify="space-between" p={2}>
                        <Box>
                          <Flex direction="column" gap={1} pt={0}>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Logistic Order Id:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.logistic_order_id}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>LPO No:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.lpo_no}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>LPO Date:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.lpo_date}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Goods Type:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.goods_type}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>LR No:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.lr_no}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>LR Date:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.lr_date}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                                <Text marginEnd={10} sx={{ fontSize: '13px' }}>Logistic Vendor:</Text>
                                <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                  {data.logistic_vendor}
                                </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Logistic Vendor Code :</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.log_vendor_code}
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                        <Box>
                          <Flex direction="column" gap={1}>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Transit Days:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.transit_days}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Ship Type:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.ship_type}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Ship via:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.ship_via}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Carrier Name:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.carrier_name}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Price:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.price}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Currency:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.currency}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Contact:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.contact}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Consignor:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.consignor}
                              </Text>
                            </Flex>
                            
                          </Flex>
                        </Box>
                        <Box>
                          <Flex direction="column" gap={1}> 
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Consignee:</Text>
                              <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                                {data.consignee}
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Consignor Address:</Text>
                              <Text 
                                fontWeight="bold" 
                                textAlign={'right'}
                                sx={{ fontSize: '13px' }}
                                dangerouslySetInnerHTML={{
                                  __html: data.consignor_address
                                    ? data.consignor_address
                                    : ' - ',
                                }}
                              >
                              </Text>
                            </Flex>
                            <Flex justify="space-between">
                              <Text marginEnd={10} sx={{ fontSize: '13px' }}>Consignee Address:</Text>
                              <Text 
                                fontWeight="bold" 
                                textAlign={'right'}
                                sx={{ fontSize: '13px' }}
                                dangerouslySetInnerHTML={{
                                  __html: data.consignee_address
                                    ? data.consignee_address
                                    : ' - ',
                                }}
                              >
                              </Text>
                            </Flex>
                          </Flex>
                        </Box>
                      </Flex>
                    <Divider borderColor="black" borderWidth={1} mb={1} />
                    <Box p={0} m={0} border="none" bg="transparent">
                      {data?.rows &&
                        data?.rows.length > 0 &&
                        data.rows.map((item: any, index: number) => (
                          <Box
                            p={0}
                            m={0}
                            border="none"
                            bg="transparent"
                            key={index}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="center"
                              width="100%"
                            >
                              <Text fontSize="md" fontWeight="bold" mb={1}>
                                {data[`package_type_id_${item.id}`]
                                  ? getDisplayLabel(
                                      data.packageTypeOptions,
                                      data[`package_type_id_${item.id}`]
                                        ? data[`package_type_id_${item.id}`]
                                        : 0,
                                      'Package Type'
                                    )
                                  : ' - '}{' '}
                                Items
                              </Text>
                            </Box>
                            <Flex mb={2} justify="space-between" p={2}>
                              <Box>
                                <Flex direction="column" gap={1}>
                                  <Flex justify="space-between">
                                    <Text
                                      marginEnd={10}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      Package Type:
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {data[`package_type_id_${item.id}`]
                                        ? getDisplayLabel(
                                          transformToSelectOptions(data.packageTypeOptions?.data),
                                            data[`package_type_id_${item.id}`]
                                              ? data[
                                                  `package_type_id_${item.id}`
                                                ]
                                              : 0,
                                            'Package Type'
                                          )
                                        : ' - '}
                                    </Text>
                                  </Flex>
                                  <Flex justify="space-between">
                                    <Text
                                      marginEnd={10}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      PKG NO:
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {data[`package_type_id_${item.id}`]
                                        ? getPackageNumber(item.id)
                                        : ' - '}
                                    </Text>
                                  </Flex>
                                  <Flex justify="space-between">
                                    <Text
                                      marginEnd={10}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      Description:
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {data[`description_${item.id}`]
                                        ? data[`description_${item.id}`]
                                        : ' - '}
                                    </Text>
                                  </Flex>
                                  <Flex justify="space-between">
                                    <Text
                                      marginEnd={10}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      Goods Type :
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {data[`is_dg_${item.id}`]
                                        ? getDisplayLabel(
                                            data.goodsTypes,
                                            data[`is_dg_${item.id}`]
                                              ? data[
                                                  `is_dg_${item.id}`
                                                ].toString()
                                              : 0,
                                            'Goods Type'
                                          )
                                        : 'Package N/O'}
                                    </Text>
                                  </Flex>
                                  <Flex justify="space-between">
                                    <Text
                                      marginEnd={10}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      Pcs:
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {data[`pcs_${item.id}`]
                                        ? data[`pcs_${item.id}`]
                                        : 0}
                                    </Text>
                                  </Flex>
                                </Flex>
                              </Box>
                              <Box>
                                <Flex direction="column" gap={1}>
                                  <Flex justify="space-between">
                                    <Text
                                      marginEnd={10}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      Weight:
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {data[`weight_${item.id}`]
                                        ? data[`weight_${item.id}`]
                                        : 0}
                                      {getDisplayLabel(
                                        data.uomOptions,
                                        data[
                                          `weight_unit_of_measurement_id_${item.id}`
                                        ]
                                          ? data[
                                              `weight_unit_of_measurement_id_${item.id}`
                                            ].toString()
                                          : 0,
                                        ' Unit'
                                      ) || 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex justify="space-between">
                                    <Text
                                      marginEnd={10}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      Length:
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {data[`length_${item.id}`]
                                        ? data[`length_${item.id}`]
                                        : 0}
                                      {getDisplayLabel(
                                        data.uomOptions,
                                        data[
                                          `unit_of_measurement_id_${item.id}`
                                        ]
                                          ? data[
                                              `unit_of_measurement_id_${item.id}`
                                            ].toString()
                                          : 0,
                                        ' Unit'
                                      ) || 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex justify="space-between">
                                    <Text
                                      marginEnd={10}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      Width:
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {data[`width_${item.id}`]
                                        ? data[`width_${item.id}`]
                                        : 0}
                                      {getDisplayLabel(
                                        data.uomOptions,
                                        data[
                                          `unit_of_measurement_id_${item.id}`
                                        ]
                                          ? data[
                                              `unit_of_measurement_id_${item.id}`
                                            ].toString()
                                          : 0,
                                        ' Unit'
                                      ) || 'N/A'}
                                    </Text>
                                  </Flex>
                                  <Flex justify="space-between">
                                    <Text
                                      marginEnd={10}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      Height:
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {data[`height_${item.id}`]
                                        ? data[`height_${item.id}`]
                                        : 0}
                                      {getDisplayLabel(
                                        data.uomOptions,
                                        data[
                                          `unit_of_measurement_id_${item.id}`
                                        ]
                                          ? data[
                                              `unit_of_measurement_id_${item.id}`
                                            ].toString()
                                          : 0,
                                        ' Unit'
                                      ) || 'N/A'}
                                    </Text>
                                  </Flex>

                                  <Flex justify="space-between">
                                    <Text
                                      marginEnd={10}
                                      sx={{ fontSize: '13px' }}
                                    >
                                      Volumetric Wt:
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {calculateVolumetricWeight(
                                        parseFloat(data[`length_${item.id}`]) ||
                                          0,
                                        parseFloat(data[`width_${item.id}`]) ||
                                          0,
                                        parseFloat(data[`height_${item.id}`]) ||
                                          0,
                                        data[
                                          `unit_of_measurement_id_${item.id}`
                                        ] || 0,
                                        data.uomItems
                                      )}
                                      KG
                                    </Text>
                                  </Flex>
                                </Flex>
                              </Box>
                            </Flex>
                            {data &&
                              data.packages &&
                                getTableItems(data.packages, getPackageNumber(item.id), 'packageNumber').length > 0 && (
                                  <Table variant="unstyled" size={'sm'}>
                                    <Thead>
                                      <Tr>
                                        <Th
                                          sx={{
                                            fontSize: '13px',
                                            paddingTop: 2,
                                            paddingBottom: 1,
                                          }}
                                        >
                                          S.No
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '13px',
                                            paddingTop: 2,
                                            paddingBottom: 1,
                                          }}
                                        >
                                          Part Num
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '13px',
                                            paddingTop: 2,
                                            paddingBottom: 1,
                                          }}
                                        >
                                          Condition
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '13px',
                                            paddingTop: 2,
                                            paddingBottom: 1,
                                          }}
                                        >
                                          QTY
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '13px',
                                            paddingTop: 2,
                                            paddingBottom: 1,
                                          }}
                                        >
                                          Good.Tp
                                        </Th>
                                        {/* <Th
                                    sx={{
                                      fontSize: '13px',
                                      paddingTop: 1,
                                      paddingBottom: 0,
                                    }}
                                  >
                                    PO Num
                                  </Th> */}
                                        <Th
                                          sx={{
                                            fontSize: '13px',
                                            paddingTop: 2,
                                            paddingBottom: 1,
                                          }}
                                        >
                                          UN#
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '13px',
                                            paddingTop: 2,
                                            paddingBottom: 1,
                                          }}
                                        >
                                          Class
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '13px',
                                            paddingTop: 2,
                                            paddingBottom: 1,
                                          }}
                                        >
                                          MSDS
                                        </Th>
                                        <Th
                                          sx={{
                                            fontSize: '13px',
                                            paddingTop: 2,
                                            paddingBottom: 1,
                                          }}
                                        >
                                          LR Qty
                                        </Th>
                                      </Tr>
                                    </Thead>
                                    <Tbody mt={2}>
                                      {data &&
                                        data.packages &&
                                        getTableItems(
                                          data.packages,
                                          getPackageNumber(item.id),
                                          'packageNumber'
                                        ).map((item: any, index: number) => (
                                          <Tr key={index}>
                                            <Td
                                              sx={{
                                                fontSize: '13px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              {index + 1}
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '13px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              <PartDetails
                                                partNumber={item.part_number_id}
                                                field={'part_number'}
                                              />
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '13px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              {getDisplayLabel(
                                                data.conditionOptions,
                                                item.condition_id.toString() ?? 0,
                                                'Condition'
                                              ) || 'N/A'}
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '13px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              {item.qty}
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '13px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              <PartNumberDetails
                                                part_number={item.part_number_id}
                                                type="goods_type"
                                              />
                                            </Td>
                                            {/* <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 1,
                                          paddingBottom: 0,
                                        }}
                                      >
                                        {item.purchase_order_id}
                                      </Td> */}
                                            <Td
                                              sx={{
                                                fontSize: '13px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              <PartNumberDetails
                                                part_number={item.part_number_id}
                                                type="un_number"
                                              />
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '13px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              <PartNumberDetails
                                                part_number={item.part_number_id}
                                                type="class"
                                              />
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '13px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              <PartNumberDetails
                                                part_number={item.part_number_id}
                                                type="msds"
                                              />
                                            </Td>
                                            <Td
                                              sx={{
                                                fontSize: '13px',
                                                paddingTop: 2,
                                                paddingBottom: 0,
                                              }}
                                            >
                                              {item.lrQuantity}
                                            </Td>
                                          </Tr>
                                        ))}
                                    </Tbody>
                                  </Table>
                                )}
                            <Divider
                              borderColor="black"
                              borderWidth={1}
                              mt={2}
                              mb={1}
                            />
                          </Box>
                        ))}
                      {data && data.packages && (
                        <Box p={0} m={0} border="none" bg="transparent" mt={2}>
                          <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            width="100%"
                          >
                            <Text fontSize="md" fontWeight="bold" mb={1}>
                              Log Quotation Info
                            </Text>
                          </Box>
                          <Table variant="unstyled" size={'sm'}>
                            <Thead>
                              <Tr>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  S.No
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  LVQ NO
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  LRFQ NO
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  LREF NO
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  Desc
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  PKG.Type
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  PKG NO
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  Goods type
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  Wei & UOM
                                </Th>
                                
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  L <p style={{fontSize: '4px'}}>(length)</p>
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  W <p style={{fontSize: '4px'}}>(width)</p>
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  H <p style={{fontSize: '4px'}}>(height)</p>
                                </Th>
                                <Th
                                  sx={{
                                    fontSize: '13px',
                                    paddingTop: 2,
                                    paddingBottom: 1,
                                  }}
                                >
                                  Vol.Wei & UOM
                                </Th>
                              </Tr>
                            </Thead>
                            <Tbody mt={2}>
                              {data &&
                                data.packages.map(
                                  (item: any, index: number) => (
                                    <Tr key={`Log_quotation_info_${index + 1}`}>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {index + 1}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {'LVQ123'}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {/* {logisticQuotation?.lrfq?.id} */}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {'LVQ123'}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {item?.description || 'Loading...'}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {getDisplayLabel(
                                          transformToSelectOptions(data.packageTypeList?.data),
                                          item?.package_type_id,
                                            'Package Type'
                                          )}
                                       
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {item?.package_number || 'Loading...'}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {item?.is_dg
                                          ? 'DG'
                                          : 'NON DG'}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {item?.weight || 'Loading...'} & {getDisplayLabel(
                                          data.uomOptions,
                                          item?.weight_unit_of_measurement_id.toString() ??
                                            0,
                                          ' Unit'
                                        ) || 'N/A'}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {item?.length || 'Loading...'}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {item?.width || 'Loading...'}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {item?.height || 'Loading...'}
                                      </Td>
                                      <Td
                                        sx={{
                                          fontSize: '13px',
                                          paddingTop: 2,
                                          paddingBottom: 1,
                                        }}
                                      >
                                        {item?.volumetric_weight ||
                                          'Loading...'} & {getDisplayLabel(
                                            data.uomOptions,
                                            item?.unit_of_measurement_id.toString() ??
                                              0,
                                            ' Unit'
                                          ) || 'N/A'}
                                      </Td>
                                     
                                    </Tr>
                                  )
                                )}
                            </Tbody>
                          </Table>
                        </Box>
                      )}
                    </Box>
                    {data?.remarks && (
                      <Flex
                        justify="space-between"
                        mb={6}
                        style={{ fontSize: '13px' }}
                      >
                        <Box width="100%" p={2}>
                          <Text marginEnd={10} fontWeight="bold">
                            Remarks:
                          </Text>
                          <Text
                            dangerouslySetInnerHTML={{
                              __html: data?.remarks ? data?.remarks : ' - ',
                            }}
                          ></Text>
                        </Box>
                      </Flex>
                    )}
                  </Box>
                  <Box
                    p={0}
                    m={0}
                    border="none"
                    bg="transparent"
                    ref={footerElementRef}
                  >
                    <PDFFooter style={{ fontSize: '13px' }} />
                  </Box>
                </Box>
              </Container>
              <Stack
                direction={{ base: 'column', md: 'row' }}
                justify={'center'}
                alignItems={'center'}
                display={'flex'}
                mt={4}
              >
                <Button
                  size={'sm'}
                  onClick={exportToPDF}
                  colorScheme="green"
                  leftIcon={<Icon as={HiPrinter} />}
                  isLoading={loading}
                >
                  Export PDF
                </Button>

                <Button
                  colorScheme="red"
                  size={'sm'}
                  isDisabled={loading}
                  onClick={onClose}
                >
                  Close
                </Button>
              </Stack>
            </Stack>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default PreviewPopup;
