import React from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody
} from '@chakra-ui/react';

// TypeScript interface for component props
interface ConfirmationPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  headerText?: string;
  bodyText?: string;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  headerText = 'Confirmation',
  bodyText = 'Are you sure you want to proceed with this action?'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnOverlayClick={false}  closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{headerText}</ModalHeader>
        <ModalBody>
          {bodyText}
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} mr={3} size={'sm'} variant="outline">
            Cancel
          </Button>
          <Button colorScheme="blue" size={'sm'} onClick={onConfirm}>
            Confirm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ConfirmationPopup;