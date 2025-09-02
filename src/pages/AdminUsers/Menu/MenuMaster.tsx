import {
    HStack,
    Heading,
    Stack,
    Box
} from '@chakra-ui/react';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';
import { SlideIn } from '@/components/SlideIn';
import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';

const MenuMaster = () => {

    const navigate = useNavigate();

    return(
        <SlideIn>
            <Stack pl={2} spacing={4}>
                <HStack justify={'space-between'}>
                <Heading as="h4" size={'md'}>
                    Menu Master
                </Heading>
                    <ResponsiveIconButton
                        variant={'@primary'}
                        icon={<LuPlus />}
                        size={{ base: 'sm', md: 'md' }}
                        onClick={() => navigate('/menu/create')}
                    >
                        Add New menu
                    </ResponsiveIconButton>
                </HStack>
            </Stack>
            <Stack pl={2} spacing={4} mt={'1rem'}>
                <Box borderRadius={4}>
                    {/* Table goes here */}
                    <HStack
                        bg={'white'}
                        justify={'space-between'}
                        mb={4}
                        p={4}
                        borderTopRadius={4}
                    >
                        <Heading as="h4" size={'md'}>Menu List</Heading>
                         
                    </HStack>
                </Box>  
            </Stack>  
        </SlideIn>    
    )
};

export default MenuMaster;