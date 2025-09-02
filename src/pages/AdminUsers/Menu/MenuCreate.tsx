import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    HStack,
    Heading,
    Stack,
    Text
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { HiArrowNarrowLeft } from 'react-icons/hi';
import { Link, useNavigate } from 'react-router-dom';
import { Formiz, useForm } from '@formiz/core';

import { SlideIn } from '@/components/SlideIn';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { FieldInput } from '@/components/FieldInput';
import { FieldSelect } from '@/components/FieldSelect';

const MenuCreate = () => {
    const navigate = useNavigate();

    const form = useForm({
        onValidSubmit: (values) => {
            console.log(values)
        }
    });

    return(
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
                            <BreadcrumbLink as={Link} to="/customer-master">
                            Menu Master
                            </BreadcrumbLink>
                        </BreadcrumbItem>

                        <BreadcrumbItem isCurrentPage color={'gray.500'}>
                            <BreadcrumbLink>Add Menu</BreadcrumbLink>
                        </BreadcrumbItem>
                        </Breadcrumb>

                        <Heading as="h4" size={'md'}>
                        Add Menu
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
                        Menu master
                    </Text>

                    <Formiz autoForm connect={form}>
                        <Stack spacing={2}>
                            <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                                <FieldInput
                                    label={'Name'}
                                    name={'name'}
                                    required={'Name is required'}
                                    placeholder="Enter name"
                                />
                            </Stack>    
                            <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                                <FieldInput
                                    label={'Icon'}
                                    name={'icon'}
                                    required={'Icon is required'}
                                    placeholder="Enter icon"
                                />
                            </Stack>    
                            <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                                <FieldInput
                                    label={'Link'}
                                    name={'link'}
                                    required={'Link is required'}
                                    placeholder="Enter link"
                                />
                            </Stack>    
                            <Stack spacing={8} direction={{ base: 'column', md: 'row' }}>
                                <FieldSelect
                                    label={'Parent'}
                                    name={'parent_id'}
                                    required={'Parent id is required'}
                                    placeholder="Select Parent"
                                    options={[]}
                                />
                            </Stack>
                        </Stack>
                    </Formiz>
                </Stack>                
            </Stack>    
        </SlideIn>    
    )
};

export default MenuCreate;