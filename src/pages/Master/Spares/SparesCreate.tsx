import { useEffect, useState } from 'react';

import { ChevronRightIcon } from '@chakra-ui/icons';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  HStack,
  Heading,
  Stack,
  Text,
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { UseQueryResult } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import { FieldUpload } from '@/components/FieldUpload';
import LoadingOverlay from '@/components/LoadingOverlay';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import {
  convertToOptions,
  transformToSelectOptions,
} from '@/helpers/commonHelper';
import ModalForm from '@/pages/Submaster/HscCode/ModalForm';
import { useCreateSpare } from '@/services/spare/services';
import { useHscCodeList } from '@/services/submaster/hsc-code/services';
// import {
//   useCreateSpareClass,
//   useSpareClassList,
// } from '@/services/submaster/spareclass/services';
import {
  useCreateSpareModel,
  useSpareModelList,
} from '@/services/submaster/sparemodel/services';
import {
  useCreateSpareType,
  useSpareTypeList,
} from '@/services/submaster/sparetype/services';
import {
  useCreateUnitOfMeasure,
  useUnitOfMeasureIndex,
} from '@/services/submaster/unitofmeasure/services';

import UnOptions from './unOptions';

interface Payload {
  [key: string]: any;
}

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};

const SparesCreate = () => {
  let { spare_name } = useParams();
  const navigate = useNavigate();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [spareLoading, setSpareSearchLoading] = useState<boolean>(false);
  const [newHSCCode, setNewHSCCode] = useState<string>('');
  const unitOfMeasureList = useUnitOfMeasureIndex();
  const [hscKey, setHSCKey] = useState(0);
  const spareTypeList: UseQueryResult<QueryData, unknown> = useSpareTypeList();
  const spareTypeOptions = transformToSelectOptions(spareTypeList.data);

  const spareModelList: UseQueryResult<QueryData, unknown> =
    useSpareModelList();
  const spareModelOptions = transformToSelectOptions(spareModelList.data);

  // const spareClassList: UseQueryResult<QueryData, unknown> =
  // useSpareClassList();
  // const spareClassOptions = transformToSelectOptions(spareClassList.data);
  const hscList: UseQueryResult<QueryData, unknown> = useHscCodeList();
  const hscOptions = transformToSelectOptions(hscList.data);

  const allApiDataLoaded = [
    unitOfMeasureList,
    spareTypeList,
    spareModelList,
  ].every((query) => query.isSuccess);

  const createUnitOfMeasure = useCreateUnitOfMeasure({
    onSuccess: ({ message }) => {
      unitOfMeasureList.refetch();
      toastSuccess({
        title: 'Unit of Measure created',
        description: message,
      });
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create unit of measure',
        description: error.response?.data.message,
      });
    },
  });

  const handleUnitOfMeasureCreate = (inputValue: string) => {
    const length = inputValue.length;
    if (length > 4) {
      toastError({
        title: 'Failed to create unit of measure',
        description: 'Character limit is 4',
      });
      return;
    }
    createUnitOfMeasure.mutate({ name: inputValue });
  };


  const createSpareType = useCreateSpareType({
    onSuccess: ({ message }) => {
      spareTypeList.refetch();
      toastSuccess({
        title: 'Spare Type created',
        description: message,
      });
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create spare type',
        description: error.response?.data.message,
      });
    },
  });

  const handleSpareTypeCreate = (inputValue: string) => {
    const length = inputValue.length;
    if (length > 10) {
      toastError({
        title: 'Failed to create spare type',
        description: 'Character limit is 10',
      });
      return;
    }
    createSpareType.mutate({ name: inputValue });
  };

  const createSpareModel = useCreateSpareModel({
    onSuccess: ({ message }) => {
      spareModelList.refetch();
      toastSuccess({
        title: 'Spare Model created',
        description: message,
      });
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create spare model',
        description: error.response?.data.message,
      });
    },
  });

  const handleSpareModelCreate = (inputValue: string) => {
    const length = inputValue.length;
    if (length > 10) {
      toastError({
        title: 'Failed to create spare model',
        description: 'Character limit is 10',
      });
      return;
    }
    createSpareModel.mutate({ name: inputValue });
  };

  
  const handleCreateHSC = (inputValue: string) => {
    setNewHSCCode(inputValue);
    openModal();
  };

  // const createSpareClass = useCreateSpareClass({
  //   onSuccess: ({ message }) => {
  //     spareClassList.refetch();
  //     toastSuccess({
  //       title: 'Spare Class created',
  //       description: message,
  //     });
  //   },
  //   onError: (error) => {
  //     toastError({
  //       title: 'Failed to create spare class',
  //       description: error.response?.data.message,
  //     });
  //   },
  // });

  // const handleSpareClassCreate = (inputValue: string) => {
  //   const length = inputValue.length;
  //   if (length > 4) {
  //     toastError({
  //       title: 'Failed to create spare class',
  //       description: 'Character limit is 4',
  //     });
  //     return;
  //   }
  //   createSpareClass.mutate({ name: inputValue });
  // };

  const createSpare = useCreateSpare({
    onSuccess: ({ id, message }) => {
      toastSuccess({
        title: 'Spare created successfully - ' + id,
        description: message,
      });
      navigate('/spares-master');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to create spare',
        description: error.response?.data.message,
      });
    },
  });

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  const form = useForm({
    onValidSubmit: (values) => {
      // Destructure mandatory fields directly
      const {
        part_number,
        description,
        unit_of_measure_id,
        ata,
        spare_type_id,
        spare_model_id,
        hsc_code_id,
        is_shelf_life,
        total_shelf_life,
        is_llp,
        is_serialized,
        is_dg,
        un_id,
        // spare_class_id,
        msds,
        ipc_ref,
        xref,
        picture,
        remarks,
        manufacturer_name,
        cage_code,
        ...optionalValues
      } = values;

      const initialPayload: Payload = {
        part_number,
        description,
        unit_of_measure_id: Number(unit_of_measure_id),
        unit_of_measure_group_id: Number(unit_of_measure_id),
        ata,
        spare_type_id: Number(spare_type_id),
        spare_model_id: Number(spare_model_id),
        hsc_code_id,
        is_shelf_life: is_shelf_life === 'true' ? true : false,
        total_shelf_life:
          is_shelf_life === 'true' ? Number(total_shelf_life) : null,
        is_llp: is_llp === 'true' ? true : false,
        is_serialized: is_serialized === 'true' ? true : false,
        is_dg: is_dg === 'true' ? true : false,
        un_id: is_dg === 'true' ? un_id : null,
        // spare_class_id: is_dg === 'true' ? Number(spare_class_id) : null,
        msds,
        ipc_ref,
        xref,
        picture,
        remarks,
        manufacturer_name,
        cage_code,
        ...optionalValues,
      };

      const payload = Object.entries(initialPayload).reduce<Payload>(
        (acc, [key, value]) => {
          if (value !== undefined) {
            acc[key] = value;
          }
          return acc;
        },
        {}
      );

      console.log(payload);
      // Assuming you have a function to make the API call
      createSpare.mutate(payload as any);
    },
  });

  const fields = useFormFields({
    connect: form,
  });

  useEffect(() => {
    if (spare_name) {
      form.setValues({ part_number: spare_name });
    }
  }, [spare_name]);

  const [isOpen, toggleModal] = useState(false);

  const openModal = () => {
    toggleModal(true);
  };

  const closeModal = (status?: any) => {
    if(status === true){
      hscList.refetch();
    }
    setHSCKey((prevKey) => prevKey + 1);
    toggleModal(false);
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={2}>
        <HStack justify={'space-between'}>
          <Stack spacing={0}>
            <Breadcrumb
              fontWeight="medium"
              fontSize="sm"
              separator={<ChevronRightIcon boxSize={6} color="gray.500" />}
            >
              <BreadcrumbItem color={'brand.500'}>
                <BreadcrumbLink as={Link} to="/spares-master">
                  Spare Master
                </BreadcrumbLink>
              </BreadcrumbItem>

              <BreadcrumbItem isCurrentPage color={'gray.500'}>
                <BreadcrumbLink>Add New Spare</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Add New spare
            </Heading>
          </Stack>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<HiArrowNarrowLeft />}
            size={'sm'}
            fontWeight={'thin'}
            onClick={() => navigate(-1)}
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
            Spare master
          </Text>

          <Formiz autoForm connect={form}>
            <LoadingOverlay isLoading={!allApiDataLoaded}>
              <Stack spacing={2}>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Part Number'}
                    name={'part_number'}
                    type={'alpha-numeric-with-special'}
                    maxLength={40}
                    required={'Part Number is required'}
                    placeholder="Enter part number"
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Description'}
                    name={'description'}
                    required={'Description is required'}
                    placeholder="Enter description"
                    type={'all-capital'}
                    maxLength={40}
                  />

                  <FieldSelect
                    label={'Unit of Measure'}
                    name={'unit_of_measure_id'}
                    required={'Unit of Measure is required'}
                    placeholder="Select unit of measure"
                    options={convertToOptions(unitOfMeasureOptions)}
                    selectProps={{
                      type: 'creatable',
                      isLoading: createUnitOfMeasure.isLoading,
                      onCreateOption: handleUnitOfMeasureCreate,
                    }}
                    maxLength={6}
                    isCaseSensitive={true}
                    defaultValue={'6'}
                    isDisabled={true}
                    //createUnitOfMeasure.isLoading && !allApiDataLoaded
                    className={'disabled-input'}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'ATA'}
                    name={'ata'}
                    placeholder="Enter ATA"
                    allowedSpecialChars={['-']}
                    type={'integer'}
                    maxLength={12}
                  />
                  <FieldSelect
                    label={'Type'}
                    name={'spare_type_id'}
                    required={'Type is required'}
                    placeholder="Select type"
                    options={spareTypeOptions}
                    selectProps={{
                      type: 'creatable',
                      isLoading: createSpareType.isLoading,
                      onCreateOption: handleSpareTypeCreate,
                    }}
                    maxLength={12}
                    isCaseSensitive={true}
                    isDisabled={createSpareType.isLoading && !allApiDataLoaded}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'Spare Model'}
                    name={'spare_model_id'}
                    required={'Spare Model is required'}
                    placeholder="Select spare model"
                    options={spareModelOptions}
                    selectProps={{
                      type: 'creatable',
                      isLoading: createSpareModel.isLoading,
                      onCreateOption: handleSpareModelCreate,
                    }}
                    maxLength={12}
                    isCaseSensitive={true}
                    isDisabled={createSpareModel.isLoading && !allApiDataLoaded}
                  />
                  <FieldSelect
                    label="HSC Code"
                    key={`hsc_code_id_${hscKey}`}
                    name="hsc_code_id"
                    menuPortalTarget={document.body}
                    required="HSC Code is required"
                    isCaseSensitive={true}
                    options={[
                      ...(hscOptions ?? []),
                      {
                        value: 'add_new',
                        label: (
                          <Text color="brand.500" textDecoration="underline">
                            + Add HSC Code
                          </Text>
                        ),
                      },
                    ]}
                    isClearable
                    onValueChange={(value) => {
                      if (value === 'add_new') {
                        openModal();
                      }
                    }}
                    selectProps={{
                      type: 'creatable',
                      onCreateOption: (inputValue) =>
                      handleCreateHSC(inputValue),
                      noOptionsMessage: () => 'No HSC Code found',
                      isLoading: spareLoading,
                      onInputChange: () => {
                        setSpareSearchLoading(true);
                        setTimeout(() => {
                          setSpareSearchLoading(false);
                        }, 500);
                      },
                    }}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Manufacturer'}
                    name={'manufacturer_name'}
                    placeholder="Enter Manufacturer"
                    type={'alpha-numeric-with-space'}
                    maxLength={40}
                  />
                  <FieldInput
                    label={'Cage Code'}
                    name={'cage_code'}
                    placeholder="Enter Cage Code"
                    type={'alpha-numeric'}
                    maxLength={40}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'Shelf Life'}
                    name={'is_shelf_life'}
                    required={'Shelf Life is required'}
                    placeholder="Select shelf life"
                    options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                    onValueChange={(value) => {
                      if (value === 'false') {
                        form.setValues({ ['total_shelf_life']: '' });
                      }
                    }}
                  />
                  <FieldInput
                    label={'Total Shelf Life'}
                    name={'total_shelf_life'}
                    required={
                      fields.is_shelf_life?.value === 'true'
                        ? 'Total Shelf Life is required'
                        : ''
                    }
                    type="integer"
                    isDisabled={
                      fields.is_shelf_life?.value === 'false' ||
                      !fields.is_shelf_life?.value
                    }
                    placeholder="Enter Total Shelf Life"
                    maxLength={5}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'LLP'}
                    name={'is_llp'}
                    required={'LLP is required'}
                    placeholder="Select LLP"
                    options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                  />
                  <FieldSelect
                    label={'Serialized Item'}
                    name={'is_serialized'}
                    required={'Serialized Item is required'}
                    placeholder="Select"
                    options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                  />
                  <FieldSelect
                    label={'DG'}
                    name={'is_dg'}
                    required={'DG is required'}
                    placeholder="Select DG"
                    options={[
                      { value: 'true', label: 'Yes' },
                      { value: 'false', label: 'No' },
                    ]}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <UnOptions
                    un_id={0}
                    is_llp={fields.is_dg?.value === 'true' ? true : false}
                  />
                </Stack>
                {/* <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'UN'}
                    name={'un'}
                    placeholder="Enter UN"
                    isDisabled={fields.is_dg?.value === 'false' || !fields.is_dg?.value}
                    type={'all-capital'}
                    maxLength={15}
                  />
                  <FieldSelect
                    label={'Class'}
                    name={'spare_class_id'}
                    placeholder="Enter Class"
                    isDisabled={fields.is_dg?.value === 'false' || !fields.is_dg?.value}
                    options={spareClassOptions}
                    required={
                      fields.is_dg?.value === 'true' ? 'Class is required' : ''
                    }
                    selectProps={{
                      type: 'creatable',
                      isLoading: createSpareClass.isLoading,
                      onCreateOption: handleSpareClassCreate,
                    }}
                    maxLength={15}
                    isCaseSensitive={true}
                    onlyAlphabets={true}
                    className={fields.is_dg?.value === 'true' ? '' : 'disabled-input'}
                  />
                </Stack> */}
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldUpload
                    label={'MSDS'}
                    name={'msds'}
                    placeholder="Upload MSDS"
                  />
                  <FieldUpload
                    label={'IPC Reference'}
                    name={'ipc_ref'}
                    placeholder="Upload IPC Reference"
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldUpload
                    label={'Picture'}
                    name={'picture'}
                    placeholder="Upload Picture"
                  />
                  <FieldUpload
                    label={'X-Ref'}
                    name={'xref'}
                    placeholder="Upload X-Ref"
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldTextarea
                    label={'Remarks'}
                    name={'remarks'}
                    placeholder="Enter Remarks"
                    validations={[
                      {
                        handler: (value) => {
                          const strValue =
                            value !== undefined ? value.toString() : '';
                          return strValue.length === 100 ? false : true;
                        },
                        message: 'Character limit is 100',
                      },
                    ]}
                    maxLength={100}
                  />
                </Stack>
                <Button
                  type="submit"
                  colorScheme="brand"
                  mx={'auto'}
                  mt={4}
                  isLoading={createSpare.isLoading}
                  disabled={createSpare.isLoading}
                >
                  Add New Spare
                </Button>
              </Stack>
            </LoadingOverlay>
          </Formiz>
        </Stack>

        <ModalForm
          isOpen={isOpen}
          onClose={closeModal}
          existInfo={null}
          isEdit={false}
          name={newHSCCode}
        />
      </Stack>
    </SlideIn>
  );
};

export default SparesCreate;
