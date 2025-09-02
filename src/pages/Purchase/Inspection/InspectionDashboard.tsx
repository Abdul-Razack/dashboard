import { Box, HStack, Heading, Stack, Text } from '@chakra-ui/react';
import {
  ArcElement,
  Chart as ChartJS,
  ChartOptions,
  Legend,
  Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Pie } from 'react-chartjs-2';
import { LuPlus } from 'react-icons/lu';
import { useNavigate } from 'react-router-dom';

import { ResponsiveIconButton } from '@/components/ResponsiveIconButton';
import { SlideIn } from '@/components/SlideIn';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const InspectionDashboard = () => {
  const labels: any[] = ['Regular', 'Emergency', 'Critical'];
  const backgroundColors: any[] = [
    'rgb(59, 92, 128)',
    'rgba(205, 120, 64)',
    'rgba(62, 108, 42)',
  ];
  const borderColors: any[] = [
    'transparent',
    'transparent',
    'transparent',
  ];
  const navigate = useNavigate();

  const options: ChartOptions<'pie'> = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          pointStyle: 'rect',
        },
      },
      datalabels: {
        formatter: (value) => {
          //formatter: (value, context) => {
          return `${value}`;

          //   const dataset = context.chart.data.datasets[context.datasetIndex];
          //   const total = dataset.data.reduce((acc, val) => Number(acc ?? 0) + Number(val ?? 0), 0); // Safeguard against null

          //   if (total === 0) {
          //     return '0%'; // Handle case where total is 0
          //   }

          //const percentage = ((value / Number(total ?? 0)) * 100).toFixed(1) + '%';
          //   return `${value} (${percentage})`;
          return `${value}`;
        },
        color: '#fff',
        font: {
          weight: 'bold', 
          size: 12, 
        },
        anchor: 'center', 
        align: 'center', 
      },
    },
    elements: {
      arc: {
        hoverOffset: 0, 
        borderWidth: 2, 
      },
    },
    animation: {
      duration: 300,
      easing: 'easeInOutQuart',
    },
    hover: {
      mode: 'nearest',
      intersect: true,
    },
  };

  const data1 = {
    labels: labels,
    datasets: [
      {
        label: 'Incoming Status',
        data: [50, 30, 20],
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const data2 = {
    labels: ['Regular', 'Emergency', 'Critical'],
    datasets: [
      {
        label: 'Outgoing Status',
        data: [70, 20, 10],
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  const data3 = {
    labels: ['Regular', 'Emergency', 'Critical'],
    datasets: [
      {
        label: 'Transit Status',
        data: [95, 2, 3],
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  return (
    <SlideIn>
      <Stack pl={2} spacing={4}>
        <HStack justify={'space-between'}>
          <Heading as="h4" size={'md'}>
            Inspection Dashboard
          </Heading>
          <ResponsiveIconButton
            variant={'@primary'}
            icon={<LuPlus />}
            size={{ base: 'sm', md: 'md' }}
            onClick={() => navigate('/inspection/create')}
          >
            Add New Inspection
          </ResponsiveIconButton>
        </HStack>

        <Stack spacing={2} direction={{ base: 'column', md: 'row' }}>
          <Box
            flex="1"
            rounded={'md'}
            border={'1px solid'}
            borderColor={'gray.300'}
            background={'#fff'}
            boxShadow="md"
          >
            <Text textAlign="center" fontSize="lg" fontWeight={'bold'} mt={2}>
              Incoming Status
            </Text>
            <Box
              p={2}
              background={'#fff'}
              height={{ base: '200px', md: '300px', lg: '400px' }} // Responsive heights
              width="100%" // Full width
              display="flex"
              alignItems="center" // Center vertically
              justifyContent="center" // Center horizontally
            >
              <Pie options={options} data={data1} />
            </Box>
          </Box>

          <Box
            flex="1"
            rounded={'md'}
            border={'1px solid'}
            borderColor={'gray.300'}
            background={'#fff'}
            boxShadow="md"
          >
            <Text textAlign="center" fontSize="lg" fontWeight={'bold'} mt={2}>
              Outgoing Status
            </Text>
            <Box
              p={2}
              background={'#fff'}
              height={{ base: '200px', md: '300px', lg: '400px' }} // Responsive heights
              width="100%" // Full width
              display="flex"
              alignItems="center" // Center vertically
              justifyContent="center" // Center horizontally
            >
              <Pie options={options} data={data2} />
            </Box>
          </Box>

          <Box
            flex="1"
            rounded={'md'}
            border={'1px solid'}
            borderColor={'gray.300'}
            background={'#fff'}
            boxShadow="md"
          >
            <Text textAlign="center" fontSize="lg" fontWeight={'bold'} mt={2}>
              Transit Status
            </Text>
            <Box
              p={2}
              background={'#fff'}
              height={{ base: '200px', md: '300px', lg: '400px' }} // Responsive heights
              width="100%" // Full width
              display="flex"
              alignItems="center" // Center vertically
              justifyContent="center" // Center horizontally
            >
              <Pie options={options} data={data3} />
            </Box>
          </Box>
        </Stack>
      </Stack>
    </SlideIn>
  );
};

export default InspectionDashboard;
