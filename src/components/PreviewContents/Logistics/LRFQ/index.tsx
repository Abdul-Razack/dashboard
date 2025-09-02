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
import { format } from 'date-fns';
import debounce from 'lodash/debounce';
import { HiPrinter } from 'react-icons/hi';

import PDFFooter from '@/components/PreviewContents/Blocks/PDFFooter';
import PDFHeader from '@/components/PreviewContents/Blocks/PDFHeader';
import {
  calculateVolumetricWeight,
  countByProperty,
  downloadPDF,
  formatFullAddress,
  getDisplayLabel,
} from '@/helpers/commonHelper';

import HscCodeDetails from '../../HscCodeDetails';
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

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!; // Get the print content
    downloadPDF(input, 'lrfq');
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

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
      updateHeight();
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="60vw">
        <ModalHeader textAlign={'center'}>
          <Text fontSize="lg" fontWeight="bold">
            Preview LRFQ
          </Text>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box borderRadius={4}>
            <Stack spacing={2} bg={'white'} borderRadius={'md'}>
              <Container
                maxW="container.lg"
                p={4}
                id="table-to-export"
                minH="1122px"
              >
                <Box borderWidth="1px" borderRadius="lg" p={6} boxShadow="md">
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
                    <Flex justify="space-between">
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                        width="100%"
                        p={2}
                      >
                        <Text fontSize="lg" fontWeight="bold">
                          LOGISTICS RFQ
                        </Text>
                      </Box>
                    </Flex>

                    <Divider borderColor="black" borderWidth={1} />

                    <Flex mb={3} justify="space-between" p={2}>
                      <Box>
                        <Flex direction="column" gap={1} pt={0}>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              LR ID:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data?.lrInfo ? data?.lrInfo.id : ' - '}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Rel.Ref.No's:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data.related_ref_no
                                ? data.related_ref_no.join(', ')
                                : ' - '}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              LR Date:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data?.lrInfo
                                ? format(
                                    new Date(data?.lrInfo?.created_at),
                                    'dd/MM/yyyy'
                                  )
                                : ''}
                            </Text>
                          </Flex>

                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Priority:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {getDisplayLabel(
                                data.priorityOptions,
                                data.priority_id
                                  ? data.priority_id.toString()
                                  : 0,
                                'Priority'
                              ) || 'N/A'}
                            </Text>
                          </Flex>

                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              LR Type:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {getDisplayLabel(
                                data.lrTypes,
                                data.lr_type ? data.lr_type.toString() : 0,
                                'LR Type'
                              ) || 'N/A'}
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                      <Box>
                        <Flex direction="column" gap={1}>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Ship Type:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {getDisplayLabel(
                                data.shipTypeOptions,
                                data.ship_type_id
                                  ? data.ship_type_id.toString()
                                  : 0,
                                'Ship Type'
                              ) || 'N/A'}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Ship Via:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {getDisplayLabel(
                                data.shipViaOptions,
                                data.ship_via_id ? data.ship_via_id : 0,
                                'Ship Via'
                              ) || 'N/A'}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Goods Type :
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {getDisplayLabel(
                                data.goodsTypes,
                                data.is_dg ? data.is_dg.toString() : 0,
                                'Goods Type'
                              ) || 'N/A'}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              No of Pkgs:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data.no_of_package ? data.no_of_package : 0}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              No of PCs:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data.no_of_pcs ? data.no_of_pcs : 0}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Volumetric Wt:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data.volumetric_weight
                                ? data.volumetric_weight.toString()
                                : '0'}
                              KG
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                      <Box>
                        <Flex direction="column" gap={1}>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Due Date:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data.due_date
                                ? format(new Date(data.due_date), 'dd/MM/yyyy')
                                : ''}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Consignor/Shipper:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data.lrInfo
                                ? data.lrInfo?.customer?.business_name
                                : ''}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Consignor/Shipper Address:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data.lrInfo
                                ? data.lrInfo?.customer_shipping_address
                                    ?.address
                                : ''}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Consignee/Receiver:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data.lrInfo
                                ? data.lrInfo?.receiver_customer?.business_name
                                : ''}
                            </Text>
                          </Flex>
                          <Flex justify="space-between">
                            <Text marginEnd={10} sx={{ fontSize: '13px' }}>
                              Consignee/Receiver Address:
                            </Text>
                            <Text fontWeight="bold" sx={{ fontSize: '13px' }}>
                              {data.lrInfo
                                ? data.lrInfo?.receiver_shipping_address
                                    ?.address
                                : ''}
                            </Text>
                          </Flex>
                        </Flex>
                      </Box>
                    </Flex>

                    <Divider borderColor="black" borderWidth={1} mb={1} />
                    <Box p={0} m={0} border="none" bg="transparent">
                      {data?.packageItems &&
                        data?.packageItems.length > 0 &&
                        data.packageItems.map((item: any, index: number) => (
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
                                {item.package_type_id
                                  ? getDisplayLabel(
                                      data.packageTypeOptions,
                                      item.package_type_id
                                        ? item.package_type_id
                                        : 0,
                                      'Package Type'
                                    )
                                  : ' - '}{' '}
                                -{' '}
                                {item.package_number
                                  ? item.package_number
                                  : ' - '}
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
                                      {item.package_type_id
                                        ? getDisplayLabel(
                                            data.packageTypeOptions,
                                            item.package_type_id
                                              ? item.package_type_id
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
                                      {item.package_number
                                        ? item.package_number
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
                                      {item.description
                                        ? item.description
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
                                      {item.is_dg
                                        ? getDisplayLabel(
                                            data.goodsTypes,
                                            item.is_dg
                                              ? item.is_dg.toString()
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
                                      {item.pcs ? item.pcs : 0}
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
                                      Line Items:
                                    </Text>
                                    <Text
                                      fontWeight="bold"
                                      sx={{ fontSize: '13px' }}
                                    >
                                      {countByProperty(
                                        data?.tableItems,
                                        'logistic_request_package_id',
                                        item.id
                                      )}
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
                                      {item.weight ? item.weight : 0}
                                      {getDisplayLabel(
                                        data.uomOptions,
                                        item.weight_unit_of_measurement_id
                                          ? item.weight_unit_of_measurement_id.toString()
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
                                      {item.length ? item.length : 0}
                                      {getDisplayLabel(
                                        data.uomOptions,
                                        item.unit_of_measurement_id
                                          ? item.unit_of_measurement_id.toString()
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
                                      {item.width ? item.width : 0}
                                      {getDisplayLabel(
                                        data.uomOptions,
                                        item.unit_of_measurement_id
                                          ? item.unit_of_measurement_id.toString()
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
                                      {item.height ? item.height : 0}
                                      {getDisplayLabel(
                                        data.uomOptions,
                                        item.unit_of_measurement_id
                                          ? item.unit_of_measurement_id.toString()
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
                                        parseFloat(item.length) || 0,
                                        parseFloat(item.width) || 0,
                                        parseFloat(item.height) || 0,
                                        item.unit_of_measurement_id || 0,
                                        data.uomItems
                                      )}
                                      KG
                                    </Text>
                                  </Flex>
                                </Flex>
                              </Box>
                            </Flex>
                            <Divider
                              borderColor="black"
                              borderWidth={1}
                              mt={2}
                              mb={1}
                            />
                          </Box>
                        ))}
                    </Box>

                    {data && data.forVendor === true && (
                      <Box p={0} m={0} border="none" bg="transparent" mb={4}>
                        <Flex mb={6} justify="space-between">
                          <Box>
                            <Flex direction="column" gap={1}></Flex>
                          </Box>
                          <Box>
                            <Flex direction="column" gap={1}></Flex>
                          </Box>
                          <Box marginTop={2}>
                            <Flex direction="column" gap={1}>
                              <Text
                                marginEnd={10}
                                sx={{ fontSize: '13px' }}
                                fontWeight={'bold'}
                              >
                                Vendor Info:
                              </Text>
                              <Text sx={{ fontSize: '13px' }}>
                                {data?.rows && data?.rows.length > 0
                                  ? data?.rows[data.rowId]?.selectedContact
                                      ?.customer?.business_name
                                  : ''}
                              </Text>
                              <Text sx={{ fontSize: '13px' }}>
                                {data?.rows && data?.rows.length > 0
                                  ? data?.rows[data.rowId]?.selectedContact
                                      ?.customer?.code
                                  : ''}
                              </Text>
                              <Text sx={{ fontSize: '13px' }}>
                                {data?.rows && data?.rows.length > 0
                                  ? data?.rows[data.rowId]?.selectedContact
                                      ?.attention
                                  : ''}
                              </Text>
                              <Text sx={{ fontSize: '13px' }}>
                                {data?.rows && data?.rows.length > 0
                                  ? data?.rows[data.rowId]?.selectedContact
                                    ? formatFullAddress(
                                        data?.rows[data.rowId]?.selectedContact
                                      )
                                    : ' - '
                                  : ''}
                              </Text>
                            </Flex>
                          </Box>
                        </Flex>
                        <Divider borderColor="black" borderWidth={1} />
                      </Box>
                    )}

                    {data && data.forVendor === false && (
                      <Box p={0} m={0} border="none" bg="transparent" mb={4}>
                        <Table variant="unstyled" size={'sm'}>
                          <Thead>
                            <Tr>
                              <Th
                                sx={{
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                S.No
                              </Th>
                              <Th
                                sx={{
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                Vendor Name
                              </Th>
                              <Th
                                sx={{
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                Vendor Code
                              </Th>
                              <Th
                                sx={{
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                Contact
                              </Th>
                              <Th
                                sx={{
                                  fontSize: '13px',
                                  paddingTop: 1,
                                  paddingBottom: 2,
                                }}
                              >
                                Address
                              </Th>
                            </Tr>
                          </Thead>
                          <Tbody>
                            {data &&
                              data?.rows &&
                              data?.rows.map((item: any, index: number) => (
                                <Tr key={index}>
                                  <Td
                                    sx={{
                                      fontSize: '13px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                  >
                                    {index + 1}
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '13px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                  >
                                    {
                                      item?.selectedContact?.customer
                                        ?.business_name
                                    }
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '13px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                  >
                                    {item?.selectedContact?.customer?.code}
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '13px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                  >
                                    {item?.selectedContact?.attention}
                                  </Td>
                                  <Td
                                    sx={{
                                      fontSize: '13px',
                                      paddingTop: 1,
                                      paddingBottom: 2,
                                    }}
                                  >
                                    {item?.selectedContact
                                      ? formatFullAddress(item.selectedContact)
                                      : ' - '}
                                  </Td>
                                </Tr>
                              ))}
                          </Tbody>
                        </Table>
                        <Divider borderColor="black" borderWidth={1} mb={1} />
                        {data &&
                          data?.lrInfo?.items &&
                          data?.lrInfo?.items.length > 0 && (
                            <Box
                              p={0}
                              m={0}
                              border="none"
                              bg="transparent"
                              textAlign={'center'}
                            >
                              <Text fontSize="md" fontWeight="700">
                                PO Items
                              </Text>
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
                                  Desc
                                </Th>
                                <Th
                                      sx={{
                                        fontSize: '13px',
                                        paddingTop: 2,
                                        paddingBottom: 1,
                                      }}
                                    >
                                      Cond.
                                    </Th>
                                    <Th
                                      sx={{
                                        fontSize: '13px',
                                        paddingTop: 2,
                                        paddingBottom: 1,
                                      }}
                                    >
                                      HSC Code
                                    </Th>
                                    
                                    <Th
                                      sx={{
                                        fontSize: '13px',
                                        paddingTop: 1,
                                        paddingBottom: 0,
                                      }}
                                    >
                                      Good.Tp
                                    </Th>
                                    <Th
                                      sx={{
                                        fontSize: '13px',
                                        paddingTop: 2,
                                        paddingBottom: 1,
                                      }}
                                    >
                                      PO.Id
                                    </Th>
                                    <Th
                                      sx={{
                                        fontSize: '13px',
                                        paddingTop: 2,
                                        paddingBottom: 1,
                                      }}
                                    >
                                      Qty
                                    </Th>
                                  </Tr>
                                </Thead>
                                <Tbody mt={2}>
                                  {data &&
                                    data?.lrInfo?.items &&
                                    data?.lrInfo?.items.map(
                                      (item: any, index: number) => (
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
                                        <PartDetails
                                          partNumber={item.part_number_id}
                                          field={'description'}
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
                                            <HscCodeDetails
                                              partNumber={item.part_number_id}
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
                                              type="goods_type"
                                            />
                                          </Td>
                                          <Td
                                            sx={{
                                              fontSize: '13px',
                                              paddingTop: 1,
                                              paddingBottom: 0,
                                            }}
                                          >
                                            {item.purchase_order_id}
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
                                        </Tr>
                                      )
                                    )}
                                </Tbody>
                              </Table>
                            </Box>
                          )}

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
