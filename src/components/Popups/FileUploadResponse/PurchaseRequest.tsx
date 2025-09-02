import { useEffect, useState } from 'react';

import { DeleteIcon } from '@chakra-ui/icons';
import {
  Button,
  IconButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Stack,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tooltip,
  Tr,
} from '@chakra-ui/react';
import { Formiz, useForm } from '@formiz/core';

import ConfirmationPopup from '@/components/ConfirmationPopup';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { convertToOptions, filterUOMoptions } from '@/helpers/commonHelper';

type ModalPopupProps = {
  isOpen: boolean;
  onClose: (data: any) => void;
  rows: any;
  options: any;
};

export const PRCSVUploadModal = ({
  isOpen,
  onClose,
  rows,
  options,
}: ModalPopupProps) => {
  const [openKey, setOpenKey] = useState(0);
  const [items, setItems] = useState<any[]>([]);
  const [openPopupConfirmation, setOpenPopupConfirmation] =
    useState<boolean>(false);
  const [nullCount, setNullCount] = useState<number>(0);

  const modalForm = useForm({
    onValidSubmit: () => {
      const countNullIds = items.filter((part: any) => part.id === null).length;
      if (countNullIds > 0) {
        setNullCount(countNullIds);
        setOpenPopupConfirmation(true);
      }else{
        onClose(items);
        setNullCount(0);
      }
    },
  });

  const handleConfirm = () => {
    onClose(items.filter((part: any) => part.id !== null));
    setNullCount(0);
  };

  const closePopup = () => {
    setOpenPopupConfirmation(false);
    onClose([]);
    setNullCount(0);
  };

  const handleInputChange = (value: any, field: string, index: number) => {
    const updatedData = [...items];
    updatedData[index] = { ...updatedData[index], [field]: value };
    setItems(updatedData);
  };

  const deleteRow = (index: number) => {
    setItems(items.filter((_, rowIndex) => rowIndex !== index));
  };

  useEffect(() => {
    if (isOpen) {
      setOpenKey((prevKey) => prevKey + 1);
      let uploadedItems: any = [];
      rows.forEach((item: any) => {
        let obj: any = {};
        obj.id = item?.id;
        obj.part_number = item?.part_number;
        obj.description = item?.description;
        obj.part_number_id = Number(item?.id);
        obj.condition_id = Number(item?.condition_id);
        obj.quantity = item?.quantity ? Number(item?.quantity) : '';
        obj.unit_of_measure_id = Number(item?.unit_of_measure_id);
        obj.options =
          Number(item?.unit_of_measure_id) === 6
            ? convertToOptions(options?.uoms)
            : filterUOMoptions(options?.uoms, 2);
        obj.disabled = Number(item?.unit_of_measure_id) === 6 ? true : false;
        obj.remark = item.remarks ? item.remarks : '';
        uploadedItems.push(obj);
      });
      setItems(uploadedItems);
      console.log(options);
    }
  }, [isOpen, rows]);

  useEffect(() => {
    console.log(items);
  }, [items]);

  const handleClose = () => {
    onClose([]);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="lg" id="bulk-upload" closeOnOverlayClick={false} closeOnEsc={false}>
      <ModalOverlay />
      <ModalContent maxWidth="70vw">
        <ModalHeader textAlign="center">Uploaded Part Numbers </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Formiz autoForm connect={modalForm}>
            <TableContainer
              rounded="md"
              border="1px"
              borderColor="gray.500"
              borderRadius="md"
              boxShadow="md"
            >
              <Table variant="simple" size="sm">
                <Thead bg="gray.500">
                  <Tr>
                    <Th color="white">#</Th>
                    <Th color="white">Part Number</Th>
                    <Th color="white">Desc.</Th>
                    <Th color="white">Condition</Th>
                    <Th color="white">Quantity</Th>
                    <Th color="white">UOM</Th>
                    <Th color="white">Remarks</Th>
                    <Th color="white" isNumeric>
                      Action
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {items &&
                    items.length > 0 &&
                    items.map((item, index) => (
                      <Tooltip
                        label={'Part number not found..'}
                        aria-label="Username tooltip"
                        placement="top"
                        hasArrow
                        color="white"
                        isDisabled={item?.id === null ? false : true}
                        key={index}
                        bg="red.600"
                      >
                        <Tr
                          marginTop={1}
                          marginBottom={1}
                          bg={item.id === null ? 'red.200' : 'green.200'}
                        >
                          <Td>{index + 1}</Td>
                          <Td>{item.part_number}</Td>
                          <Td>{item.description ?? '-'}</Td>
                          <Td>
                            <FieldSelect
                              key={`condition_${openKey}`}
                              name={`condition_${index + 1}`}
                              size="sm"
                              options={options?.conditions}
                              placeholder="Select Condition"
                              defaultValue={
                                item.condition_id
                                  ? item.condition_id.toString()
                                  : ''
                              }
                              menuPortalTarget={document.body}
                              selectProps={{
                                styles: {
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                },
                              }}
                              onValueChange={(value) =>
                                handleInputChange(value, 'condition_id', index)
                              }
                              required={
                                item.id !== null ? 'Condition is required' : ''
                              }
                              isDisabled={item.id === null}
                            />
                          </Td>
                          <Td>
                            <FieldInput
                              key={`quantity_${openKey}`}
                              name={`quantity_${index + 1}`}
                              size="sm"
                              required="Quantity is required"
                              type="integer"
                              defaultValue={item.quantity ? item.quantity : ''}
                              width="100px"
                              onValueChange={(value) =>
                                handleInputChange(value, 'quantity', index)
                              }
                              isDisabled={item.id === null}
                            />
                          </Td>
                          <Td>
                            <FieldSelect
                              key={`uom_${openKey}`}
                              name={`uom_${index + 1}`}
                              size="sm"
                              options={item?.options}
                              placeholder="Select UOM"
                              defaultValue={
                                item.unit_of_measure_id
                                  ? item.unit_of_measure_id.toString()
                                  : ''
                              }
                              menuPortalTarget={document.body}
                              selectProps={{
                                styles: {
                                  menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 9999,
                                  }),
                                },
                              }}
                              onValueChange={(value) =>
                                handleInputChange(
                                  value,
                                  'unit_of_measure_id',
                                  index
                                )
                              }
                              isDisabled={true}
                              // isDisabled={item?.id === null ? true: item?.disabled}
                              required={
                                item.id !== null ? 'UOM is required' : ''
                              }
                            />
                          </Td>
                          <Td>
                            <FieldInput
                              key={`remarks_${openKey}`}
                              name={`remarks_${index + 1}`}
                              size="sm"
                              defaultValue={item.remark ? item.remark : ''}
                              inputProps={{
                                maxLength: import.meta.env
                                  .VITE_SHORT_REMARKS_LENGTH,
                              }}
                              onValueChange={(value) =>
                                handleInputChange(value, 'remark', index)
                              }
                              maxLength={100}
                              isDisabled={item.id === null}
                            />
                          </Td>
                          <Td isNumeric>
                            <IconButton
                              aria-label="Delete Row"
                              colorScheme="red"
                              size="sm"
                              icon={<DeleteIcon />}
                              onClick={() => deleteRow(index)}
                              isDisabled={items.length < 2}
                            />
                          </Td>
                        </Tr>
                      </Tooltip>
                    ))}
                </Tbody>
              </Table>
            </TableContainer>
            <Stack
              direction={{ base: 'column', md: 'row' }}
              justify="center"
              alignItems="center"
              display="flex"
              mt={4}
            >
              <Button onClick={closePopup} colorScheme="red">
                Close
              </Button>
              <Button type="submit" colorScheme="brand">
                Submit
              </Button>
            </Stack>
          </Formiz>
        </ModalBody>
        <ConfirmationPopup
          isOpen={openPopupConfirmation}
          onClose={handleClose}
          onConfirm={handleConfirm}
          headerText="Confirm!!"
          bodyText={`${nullCount} items not in spare master list and won’t be added. Continue with remaining items?`}
        />
      </ModalContent>
    </Modal>
  );
};

export default PRCSVUploadModal;
