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
  Text
} from '@chakra-ui/react';
import { Formiz, useForm, useFormFields } from '@formiz/core';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { UseQueryResult, useQueryClient } from 'react-query';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';
import { FieldTextarea } from '@/components/FieldTextarea';
import { FieldUpload } from '@/components/FieldUpload';
import { LoaderFull } from '@/components/LoaderFull';
import LoadingOverlay from '@/components/LoadingOverlay';
import { isFormFieldsChanged } from '@/helpers/FormChangeDetector';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';
import { useToastError, useToastSuccess } from '@/components/Toast';
import { convertToOptions, transformToSelectOptions } from '@/helpers/commonHelper';
import UnOptions from '@/pages/Master/Spares/unOptions';
import ModalForm from '@/pages/Submaster/HscCode/ModalForm';
import { useSpareDetails, useUpdateSpare } from '@/services/spare/services';
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

interface Payload {
  [key: string]: any; // Use a more specific type instead of `any` if possible
}

type QueryData = {
  status: boolean;
  items?: Record<string, string>;
};


const SparesEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const toastSuccess = useToastSuccess();
  const toastError = useToastError();
  const queryClient = useQueryClient();
  const [unitOfMeasureOptions, setUOMOptions] = useState<any>([]);
  const [spareLoading, setSpareSearchLoading] = useState<boolean>(false);
  const [initialValues, setInitialValues] = useState<any>(null);

  const { data: details, isLoading: detailsLoading } = useSpareDetails(
    Number(id)
  );

  const unitOfMeasureList = useUnitOfMeasureIndex();
  const spareTypeList: UseQueryResult<QueryData, unknown> = useSpareTypeList();
  const spareTypeOptions = transformToSelectOptions(spareTypeList.data);

  const spareModelList: UseQueryResult<QueryData, unknown> =
    useSpareModelList();
  const spareModelOptions = transformToSelectOptions(spareModelList.data);

  // const spareClassList: UseQueryResult<QueryData, unknown> =
  //   useSpareClassList();
  // const spareClassOptions = transformToSelectOptions(spareClassList.data);

  const hscList: UseQueryResult<QueryData, unknown> = useHscCodeList();
  const hscOptions = transformToSelectOptions(hscList.data);

  const allApiDataLoaded =
    [unitOfMeasureList, spareTypeList, spareModelList].every(
      (query) => query.isSuccess
    ) && !detailsLoading;

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

  const updateSpares = useUpdateSpare({
    onSuccess: ({ message }) => {
      toastSuccess({
        title: 'Spare updated',
        description: message,
      });
      queryClient.invalidateQueries(['spareDetails', Number(id)]);
      navigate('/spares-master');
    },
    onError: (error) => {
      toastError({
        title: 'Failed to update spare',
        description: error.response?.data.message,
      });
    },
  });

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
        id: Number(id),
        part_number,
        description,
        unit_of_measure_id: Number(unit_of_measure_id),
        ata,
        spare_type_id: Number(spare_type_id),
        spare_model_id: Number(spare_model_id),
        hsc_code_id,
        is_shelf_life: is_shelf_life === 'true' ? true : false,
        total_shelf_life:
        is_shelf_life === 'true' ? Number(total_shelf_life) : null,
        is_llp: is_llp === 'true' ? true : false,
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
      updateSpares.mutate(payload as any);
    },
  });

  

  useEffect(() => {
    if (unitOfMeasureList.data?.items) {
      setUOMOptions(unitOfMeasureList.data?.items);
    }
  }, [unitOfMeasureList]);

  const [isOpen, toggleModal] = useState(false);
  const [isEdit, toggleEdit] = useState(false);

  const openModal = (editStatus: boolean) => {
    toggleModal(true);
    toggleEdit(editStatus);
  };
 
  const closeModal = () => {
    toggleModal(false);
    toggleEdit(false);
  };
  
  const fields = useFormFields({
    connect: form,
  });

  const isFormValuesChanged = isFormFieldsChanged({
    fields,
    initialValues,
    keys: [
      'part_number',
      'description',
      'unit_of_measure_id',
      'ata',
      'spare_type_id',
      'spare_model_id',
      'hsc_code_id',
      'is_shelf_life',
      'total_shelf_life',
      'is_llp',
      'is_dg',
      'un_id',
      'msds',
      'ipc_ref',
      'xref',
      'picture',
      'remarks',
      'manufacturer_name',
      'cage_code'
    ],
  });
  useEffect(() => {
    if (details) {
      const init = {
        part_number: details?.part_number ?? '',
        description: details?.description ?? '',
        unit_of_measure_id: details?.unit_of_measure_id ?? '',
        ata: details?.ata ?? '',
        spare_type_id: details?.spare_type_id ?? '',
        spare_model_id: details?.spare_model_id ?? '',
        hsc_code_id: details?.hsc_code_id ?? '',
        is_shelf_life: details?.is_shelf_life ?? '',
        total_shelf_life: details?.total_shelf_life ?? '',
        is_llp: details?.is_llp ?? '',
        is_dg: details?.is_dg ?? '',
        un_id: details?.un_id ?? '',
        msds: details?.msds ?? '',
        ipc_ref: details?.ipc_ref ?? '',
        xref: details?.xref ?? '',
        picture: details?.picture ?? '',
        remarks: details?.remarks ?? '',
        manufacturer_name: details?.manufacturer_name ?? '',
        cage_code: details?.cage_code ?? ''
      };    
      // console.log("init", init)
      setInitialValues(init);
      form.setValues(init); 
    }
  }, [details]);


  if (!allApiDataLoaded) {
    return <LoaderFull />;
  }

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
                <BreadcrumbLink>Update Spare</BreadcrumbLink>
              </BreadcrumbItem>
            </Breadcrumb>

            <Heading as="h4" size={'md'}>
              Update spare
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
                    defaultValue={details?.part_number}
                    isDisabled={true}
                    className={'disabled-input'}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'Description'}
                    type={'all-capital'}
                    maxLength={40}
                    name={'description'}
                    required={'Description is required'}
                    placeholder="Enter description"
                    defaultValue={details?.description}
                  />

                  <FieldSelect
                    label={'Unit of Measure'}
                    name={'unit_of_measure_id'}
                    required={'Unit of Measure is required'}
                    placeholder="Select unit of measure"
                    options={convertToOptions(unitOfMeasureOptions)}
                    defaultValue={'6'}
                    selectProps={{
                      type: 'creatable',
                      isLoading: createUnitOfMeasure.isLoading,
                      onCreateOption: handleUnitOfMeasureCreate,
                    }}
                    isDisabled={true}
                    //createUnitOfMeasure.isLoading && !allApiDataLoaded
                    className={'disabled-input'}
                    maxLength={6}
                    isCaseSensitive={true}
                  />
                </Stack>

                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'ATA'}
                    name={'ata'}
                    placeholder="Enter ATA"
                    defaultValue={details?.ata}
                    allowedSpecialChars={['-']}
                    type={'integer'}
                    maxLength={12}
                  />
                  <FieldSelect
                    label={'Type'}
                    name={'spare_type_id'}
                    required={'Type is required'}
                    placeholder="Select spare type"
                    options={spareTypeOptions}
                    defaultValue={details?.spare_type_id.toString() ?? ''}
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
                    defaultValue={
                      details?.spare_model_id
                        ? details?.spare_model_id.toString()
                        : ''
                    }
                    selectProps={{
                      type: 'creatable',
                      isLoading: createSpareModel.isLoading,
                      onCreateOption: handleSpareModelCreate,
                    }}
                    maxLength={12}
                    isCaseSensitive={true}
                    isDisabled={createSpareModel.isLoading && !allApiDataLoaded}
                  />
                  {/* <FieldInput
                    label={'HSC Code'}
                    name={'hsc_code_id'}
                    required={'HSC Code is required'}
                    placeholder="Enter HSC Code"
                    defaultValue={details?.hsc_code_id}
                    type={'all-capital'}
                    maxLength={12}
                  /> */}
                  <FieldSelect
                    label="HSC Code"
                    key="hsc_code_id"
                    name="hsc_code_id"
                    menuPortalTarget={document.body}
                    required="HSC Code is required"
                    defaultValue={details?.hsc_code_id?.toString()}
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
                        openModal(false);
                      }
                    }}
                    selectProps={{
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
                    defaultValue={details?.manufacturer_name ?? ''}
                  />
                  <FieldInput
                    label={'Cage Code'}
                    name={'cage_code'}
                    placeholder="Enter Cage Code"
                    type={'alpha-numeric'}
                    maxLength={40}
                    defaultValue={details?.cage_code ?? ''}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldSelect
                    label={'Shelf Life'}
                    name={'is_shelf_life'}
                    required={'Shelf Life is required'}
                    placeholder="Select shelf life"
                    defaultValue={details?.is_shelf_life ? 'true' : 'false'}
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
                    maxLength={6}
                    isDisabled={fields.is_shelf_life?.value === 'false'}
                    placeholder="Enter Total Shelf Life"
                    defaultValue={details?.total_shelf_life}
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
                    defaultValue={details?.is_llp ? 'true' : 'false'}
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
                    defaultValue={details?.is_dg ? 'true' : 'false'}
                    onValueChange={(value) => {
                      console.log(value?.toLowerCase());
                    }}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <UnOptions
                    un_id={details?.un_id}
                    is_llp={fields.is_dg?.value === 'true' ? true : false}
                  />
                </Stack>
                {/* <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldInput
                    label={'UN'}
                    name={'un'}
                    placeholder="Enter UN"
                    isDisabled={fields.is_dg?.value === 'false' || !fields.is_dg?.value}
                    defaultValue={details?.un}
                    type={'all-capital'}
                    maxLength={15}
                  />
                  <FieldSelect
                    label={'Class'}
                    name={'spare_class_id'}
                    placeholder="Enter Class"
                    isDisabled={fields.is_dg?.value === 'false' || !fields.is_dg?.value}
                    options={spareClassOptions}
                    defaultValue={details?.spare_class?.id.toString() ?? ''}
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
                    existingFileUrl={details?.msds || ''}
                  />
                  <FieldUpload
                    label={'IPC Reference'}
                    name={'ipc_ref'}
                    placeholder="Upload IPC Reference"
                    existingFileUrl={details?.ipc_ref || ''}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldUpload
                    label={'Picture'}
                    name={'picture'}
                    placeholder="Upload Picture"
                    existingFileUrl={details?.picture || ''}
                  />
                  <FieldUpload
                    label={'X-Ref'}
                    name={'xref'}
                    placeholder="Upload X-Ref"
                    existingFileUrl={details?.xref || ''}
                  />
                </Stack>
                <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                  <FieldTextarea
                    label={'Remarks'}
                    name={'remarks'}
                    placeholder="Enter Remarks"
                    defaultValue={details?.remarks}
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
                <Stack
                  direction={{ base: 'column', md: 'row' }}
                  justify={'center'}
                  alignItems={'center'}
                  display={'flex'}
                  mt={4}
                >
                  <Button
                    type="submit"
                    colorScheme="brand"
                    mx={'auto'}
                    mt={4}
                    isLoading={updateSpares.isLoading}
                    isDisabled={
                      updateSpares.isLoading || !isFormValuesChanged
                    }
                  >
                    Update Spare
                  </Button>
                  <Button
                    type="button"
                    colorScheme="red"
                    mt={4}
                    isDisabled={updateSpares.isLoading}
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </LoadingOverlay>
          </Formiz>
        </Stack>

        <ModalForm
          isOpen={isOpen}
          onClose={closeModal}
          existInfo={null}
          isEdit={isEdit}
        />
      </Stack>
    </SlideIn>
  );
};

export default SparesEdit;
