import React from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button } from '@chakra-ui/react';

interface FilePreviewModalProps {
  open: boolean;
  onClose: () => void;
  fileType: 'image' | 'pdf' | 'ppt';
  fileUrl: string;
}

export const FilePreview: React.FC<FilePreviewModalProps> = ({ open, onClose, fileType, fileUrl }) => {
  return (
    <Modal isOpen={open} onClose={onClose} size="md" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="60vw">
        <ModalHeader>File Preview</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {fileType === 'image' ? (
            <img src={fileUrl} alt="preview" style={{ width: '100%', height: 'auto' }} />
          ) : fileType === 'pdf' ? (
            <iframe
            src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
              width="100%"
              height="500px"
              title="PPT Preview"
            ></iframe>
          ) : fileType === 'ppt' ? (
            <iframe
              src={`https://docs.google.com/viewer?url=${fileUrl}&embedded=true`}
              width="100%"
              height="500px"
              title="PPT Preview"
            ></iframe>
          ) : (
            <div>No preview available for this file type.</div>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default FilePreview;