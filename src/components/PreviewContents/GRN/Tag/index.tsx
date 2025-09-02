import { useState } from 'react';

import {
  Box,
  Button,
  Container,
  Flex,
  Icon,
  Image,
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
  VStack,
} from '@chakra-ui/react';
import { HiPrinter } from 'react-icons/hi';

import { downloadPDF } from '@/helpers/commonHelper';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: () => void;
};
export const PreviewPopup = ({ isOpen, onClose }: ModalPopupProps) => {
  const [loading, setLoading] = useState<boolean>(false);

  const exportToPDF = () => {
    setLoading(true);
    const input = document.getElementById('table-to-export')!; // Get the print content
    downloadPDF(input, 'grn-tag');
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="60vw">
        <ModalHeader textAlign={'center'}></ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box borderRadius={4}>
            <Stack spacing={2} bg={'white'} borderRadius={'md'}>
              <Container
                maxW="container.lg"
                p={4}
                id="table-to-export"
                minH="722px"
              >
                <Box borderWidth="1px" borderRadius="lg" p={6} boxShadow="md" mx="auto" mt={4}>
                  <Flex justify="space-between" align="center" mb={4}>
                    <VStack spacing={0} align="flex-start">
                      <Image src="/logo.png" alt="Logo" boxSize="120px" w={'auto'}/>
                      <Text fontSize="sm" fontWeight="bold">
                        Yes Technik (FZC)
                      </Text>
                    </VStack>
                    <Text fontSize="lg" fontWeight="bold">
                      IDENTIFICATION TAG
                    </Text>
                    <Image src="/barcode.png" alt="Barcode" boxSize="120px" w={'auto'} />
                  </Flex>

                  {/* Top Table */}
                  <Table
                    size="sm"
                    variant="unstyled"
                    border="1px solid black"
                    mb={4}
                  >
                    <Thead>
                      <Tr>
                        <Th border="1px solid black">REF NO</Th>
                        <Th border="1px solid black">REC DATE</Th>
                        <Th border="1px solid black">INSPECTED BY</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td border="1px solid black">PO-STF-GRN</Td>
                        <Td border="1px solid black">08/06/2024</Td>
                        <Td border="1px solid black">YES040</Td>
                      </Tr>
                    </Tbody>
                  </Table>

                  {/* Main Table */}
                  <Table
                    size="sm"
                    variant="unstyled"
                    border="1px solid black"
                    mb={4}
                  >
                    <Tbody>
                      <Tr>
                        <Td border="1px solid black">CTRL/LOT</Td>
                        <Td colSpan={5} border="1px solid black">
                          YTBB000001
                        </Td>
                      </Tr>
                      <Tr>
                        <Td border="1px solid black">PART NO</Td>
                        <Td border="1px solid black">153215-3521</Td>
                        <Td border="1px solid black">DESCRIPTION</Td>
                        <Td border="1px solid black">Blade</Td>
                        <Td border="1px solid black">SERIAL NO</Td>
                        <Td border="1px solid black">112258</Td>
                      </Tr>
                      <Tr>
                        <Td border="1px solid black">CONDITION</Td>
                        <Td border="1px solid black">New</Td>
                        <Td border="1px solid black">QTY</Td>
                        <Td border="1px solid black">1 EA</Td>
                        <Td border="1px solid black">CURE DATE</Td>
                        <Td border="1px solid black">05/24</Td>
                      </Tr>
                      <Tr>
                        <Td border="1px solid black">EXP</Td>
                        <Td border="1px solid black">03/25</Td>
                        <Td border="1px solid black">VENDOR</Td>
                        <Td border="1px solid black">Aero Components</Td>
                        <Td border="1px solid black">TAG</Td>
                        <Td border="1px solid black">FAA 23/05/2021 JAMES</Td>
                      </Tr>
                    </Tbody>
                  </Table>

                  {/* Location Changes Table */}
                  <Text fontWeight="bold" mb={2}>
                    LOCATION CHANGES
                  </Text>
                  <Table size="sm" variant="unstyled" border="1px solid black">
                    <Thead>
                      <Tr>
                        <Th border="1px solid black">LOCATION</Th>
                        <Th border="1px solid black">UPDATED ON</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr>
                        <Td border="1px solid black">P306-R25-S22</Td>
                        <Td border="1px solid black">08/07/2024</Td>
                      </Tr>
                      <Tr>
                        <Td border="1px solid black">P306-R30-S15</Td>
                        <Td border="1px solid black">28/06/2024</Td>
                      </Tr>
                      <Tr>
                        <Td border="1px solid black">P306-R20-S18</Td>
                        <Td border="1px solid black">22/06/2024</Td>
                      </Tr>
                      <Tr>
                        <Td border="1px solid black">P306-R31-S20</Td>
                        <Td border="1px solid black">09/06/2024</Td>
                      </Tr>
                    </Tbody>
                  </Table>

                  {/* Footer Section */}
                  <Flex justify="space-between" mt={4} fontSize="sm">
                    <Text>Printed On: 08/07/2024 15:50:05</Text>
                    <Text>www.yestechnik.com</Text>
                  </Flex>
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
                  onClick={onClose}
                  isDisabled={loading}
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
