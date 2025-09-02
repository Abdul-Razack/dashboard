import React, { useEffect, useRef, useState } from 'react';

import {
  Box,
  HStack,
  IconButton,
  Input,
  InputGroup,
  InputProps,
  InputRightAddon,
  Progress,
  Text,
  Tooltip,
} from '@chakra-ui/react';
import { FieldProps, useField } from '@formiz/core';
import { HiEye, HiOutlineUpload, HiX } from 'react-icons/hi';

import { FilePreview } from '@/components/FilePreview';
import { FormGroup, FormGroupProps } from '@/components/FormGroup';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { useFileUpload } from '@/services/general/services';

type UsualInputProps = 'placeholder' | 'autoFocus';

export type FieldUploadProps = FieldProps<File, File> &
  FormGroupProps &
  Pick<InputProps, UsualInputProps> & {
    inputProps?: Omit<InputProps, UsualInputProps>;
    existingFileUrl?: any; // Add prop for existing file URL
    onUserInteraction?: (fieldName: string, hasInteracted: boolean) => void;
    size?: InputProps['size'];
    reset?: boolean; // Prop to trigger reset externally
  };

const addonWidthMapping = {
  sm: '75px',
  md: '100px',
  lg: '125px',
};

const getLabelSize = (size: string | number) => {
  const sizeMap: { [key: string]: string } = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
  };
  return sizeMap[size] || 'md';
};

export const FieldUpload = ({
  existingFileUrl,
  onUserInteraction,
  size = 'md',
  reset = false,
  ...props
}: FieldUploadProps) => {
  const field = useField(props);
  const { inputProps, children, placeholder, autoFocus, ...rest } =
    field.otherProps;
  const labelSize = getLabelSize(size?.toString() || 'md') as
    | 'sm'
    | 'md'
    | 'lg'
    | undefined;

  const toastSuccess = useToastSuccess();
  const toastError = useToastError();

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [fileType, setFileType] = useState<'image' | 'pdf' | 'ppt'>('image');
  const [fileUrl, setFileUrl] = useState<string>('');

  const closeModal = () => {
    setFileUrl('');
    setOpenModal(false);
  };

  const clickView = () => {
    if (uploadedFile) {
      const fileExtension = uploadedFile.split('.').pop()?.toLowerCase();
      if (fileExtension) {
        if (['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          setFileType('image');
          setFileUrl(`${import.meta.env.VITE_PUBLIC_DOC_URL}${uploadedFile}`);
        } else if (fileExtension === 'pdf') {
          setFileType('pdf');
          setFileUrl(`${import.meta.env.VITE_PUBLIC_DOC_URL}${uploadedFile}`);
        } else if (
          ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(fileExtension)
        ) {
          setFileType('ppt');
          setFileUrl(`${import.meta.env.VITE_PUBLIC_DOC_URL}${uploadedFile}`);
        }
      }
    }
  };

  useEffect(() => {
    if (fileUrl != '') {
      setOpenModal(true);
    }
  }, [fileUrl]);

  const formGroupProps = {
    ...rest,
    errorMessage: field.errorMessage,
    id: field.id,
    isRequired: field.isRequired,
    showError: field.shouldDisplayError,
    labelSize,
  };

  const [fileName, setFileName] = useState(
    existingFileUrl ? existingFileUrl : ''
  );
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(!!existingFileUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<any>('');
  const allowedExtensions = '.png, .jpg, .jpeg, .gif, .pdf';

  useEffect(() => {
    if (existingFileUrl) {
      setUploadedFile(existingFileUrl);
      field.setValue(existingFileUrl as TODO);
      setUploadComplete(true);
    }
  }, [existingFileUrl]);

  const { mutate: uploadFile } = useFileUpload({
    onSuccess: (data) => {
      if (data.status && data.file_name) {
        setUploadedFile(data.file_name);
        field.setValue(data.file_name as TODO);
        setFileName(data.file_name);
        setUploading(false);
        setUploadComplete(true);
        toastSuccess({
          title: 'File uploaded successfully',
        });
      }
    },
    onError: () => {
      field.setValue('' as TODO);
      setFileName('');
      setUploading(false);
      setUploadComplete(false);
      toastError({
        title: 'Error uploading file',
      });
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setFileName(file.name);
      setUploading(true);
      setUserInteracted(true);
      setUploadComplete(false);
      const formData = new FormData();
      formData.append('file', file);
      uploadFile(formData);
      event.target.value = '';
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!uploadComplete || !uploadedFile) {
      fileInputRef.current?.click();
    }
  };

  const handleDeleteExistingFile = () => {
    field.setValue('' as TODO); // Indicate document should be dropped
    setFileName('');
    setUserInteracted(true);
    setUploadComplete(false);
    toastSuccess({
      title: 'Existing document marked for deletion',
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle external reset prop to trigger reset
  useEffect(() => {
    if (reset) {
      resetFile();
    }
  }, [reset]);

  useEffect(() => {
    if (userInteracted) {
      setTimeout(() => setUserInteracted(false), 2000);
    }
  }, [userInteracted]);

  // Reset the file selection
  const resetFile = () => {
    setFileName('');
    setUploading(false);
    setUploadComplete(false);
    field.setValue('' as TODO); // Reset field value
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear file input
    }
  };

  useEffect(() => {
    if (!userInteracted && existingFileUrl) {
      field.setValue(existingFileUrl as TODO);
    }
  }, [userInteracted, existingFileUrl, field]);

  const addonWidth =
    addonWidthMapping[size as 'sm' | 'md' | 'lg'] || addonWidthMapping.md;

  return (
    <FormGroup {...formGroupProps} className="uploader">
      <InputGroup size={size}>
        <Input
          {...inputProps}
          readOnly
          // value={fileName}
          placeholder={placeholder || 'No file chosen'}
          onClick={handleClick}
          autoFocus={autoFocus}
          cursor={'pointer'}
        />
        <InputRightAddon
  width={addonWidth}
  bg={uploading || fileName ? 'gray.300' : 'brand.900'}
  color={'white'}
  borderRightRadius={'md'}
  _hover={{
    bg: uploading ? 'gray.300' : (uploadComplete && !uploading ? '' : 'brand.800'),
    cursor: uploading ? 'not-allowed' : 'pointer',
  }}
  onClick={uploading ? undefined : handleClick}
  pointerEvents={uploading ? 'none' : 'auto'}
  opacity={uploading ? 0.7 : 1}
>
  <Box as="button" w={'100%'}>
    <Tooltip
      hasArrow
      label={'Delete Existing file to upload newly'}
      placement="top"
      isDisabled={!fileName || uploading}
    >
      <HStack spacing={1}>
        <HiOutlineUpload />
        <Text fontWeight={'thin'}>Upload</Text>
      </HStack>
    </Tooltip>
  </Box>
</InputRightAddon>
        <input
          type="file"
          hidden
          disabled={field.otherProps.isDisabled}
          onChange={handleFileChange}
          ref={fileInputRef}
          accept={allowedExtensions}
        />
      </InputGroup>
      {fileName && uploadComplete && (
        <HStack
          spacing={2}
          w="100%"
          justifyContent="space-between"
          alignItems="center"
          mt={2}
        >
          <Text isTruncated maxW="70%" fontSize="sm">
            <Text as="span" fontSize="sm" fontWeight={'bold'} display="inline">
              {`Uploaded: `}{' '}
            </Text>
            <Text as="span" fontSize="sm" color="green.500" display="inline">
              {fileName}
            </Text>
          </Text>
          <HStack spacing={2}>
            <IconButton
              aria-label="View"
              colorScheme="blue"
              icon={<HiEye />}
              size={'xs'}
              onClick={clickView}
            />
            <IconButton
              aria-label="Delete"
              colorScheme="red"
              icon={<HiX />}
              size={'xs'}
              onClick={handleDeleteExistingFile}
            />
          </HStack>
        </HStack>
      )}

      {uploading && <Progress size="xs" isIndeterminate />}
      {/* {uploadComplete && !uploading && userInteracted && (
        <Text color="green.500" mt={2}>
          File uploaded successfully
        </Text>
      )} */}
      {children}

      <FilePreview
        open={openModal}
        onClose={() => closeModal()}
        fileType={fileType}
        fileUrl={fileUrl}
      />
    </FormGroup>
  );
};
