import { useEffect, useState } from 'react';
import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
} from '@chakra-ui/react';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
}

export const PDFPreviewModal = ({
  isOpen,
  onClose,
  pdfUrl,
}: PDFPreviewModalProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && pdfUrl) {
      setIsLoading(true);
      const timeout = setTimeout(() => setIsLoading(false), 5000);
      return () => clearTimeout(timeout);
    }
  }, [isOpen, pdfUrl]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size="xl"
      closeOnOverlayClick={false}
      motionPreset="none"
    >
      <ModalOverlay />
      <ModalContent
        maxW="850px"
        maxH="60vh"
        display="flex"
        flexDirection="column"
      >
        <ModalCloseButton zIndex={2} />

        <ModalBody
          p={4}
          overflowY="auto"
          display="flex"
          justifyContent="center"
          bg="gray.50"
          position="relative"
        >
          {isLoading && (
            <Flex
              position="absolute"
              top="0"
              left="0"
              right="0"
              bottom="0"
              justify="center"
              align="center"
              bg="white"
              zIndex={1}
            >
              <Spinner size="xl" />
            </Flex>
          )}

          <Box
            width="794px"
            height="1123px"
            bg="white"
            boxShadow="md"
            position="relative"
            zIndex={0}
          >
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
              title="PDF Preview"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              onLoad={() => setIsLoading(false)}
            />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
