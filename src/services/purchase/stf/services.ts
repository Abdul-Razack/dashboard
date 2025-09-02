import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  CreateSTFPayload,
  STFDetailsPayload,
  STFIndexPayload,
  STFListPayload,
  zCreateSTFPayload,
  zSTFDetailsPayload,
  zSTFIndexPayload,
  zSTFListPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};


type UseSTFIndexQueryOptions = UseQueryOptions<STFIndexPayload>;
type UseSTFListQueryOptions = UseQueryOptions<STFListPayload>;
type UseSTFDetailsQueryOptions = UseQueryOptions<STFDetailsPayload>;

interface QueryParams {
  page?: number;
  search?: {
    type?: string;
  };
}

const fetchData = async (
  url: string,
  parser: TODO,
  queryParams: QueryParams = {}
) => {
  const queryString = new URLSearchParams();

  // Handling both top-level and nested 'search' parameters explicitly
  Object.entries(queryParams).forEach(([key, value]) => {
    // Check if the value is an object indicating it's part of 'search'
    if (typeof value === 'object' && value !== null) {
      // If it's part of 'search', iterate through its properties
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue !== undefined && nestedValue !== null) {
          // Correctly append it as part of 'search[...]'
          queryString.append(`search[${nestedKey}]`, nestedValue.toString());
        }
      });
    } else {
      // Directly append top-level non-object parameters, if any exist
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString());
      }
    }
  });

  // const finalUrl = `${url}?${queryString.toString()}`;
  // console.log(`Final API URL: ${finalUrl}`); // Debugging purposes

  try {
    const response = await Axios.get(`${url}?${queryString}`);
    return parser().parse(response.data);
  } catch (error) {
    console.error('API call failed', error);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

export const useSTFIndex = (
  queryParams?: QueryParams,
  queryOptions: UseSTFIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['stfIndex', queryParams],
    queryFn: () => fetchData(endPoints.index.stf, zSTFIndexPayload, queryParams),
    enabled: !!queryParams,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useSTFList = (
  queryParams?: QueryParams,
  queryOptions: UseSTFListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['stfList', queryParams],
    queryFn: () => fetchData(endPoints.list.stf, zSTFListPayload, queryParams),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useSTFDetails = (
  id: number,
  queryOptions: UseSTFDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['stfId', id],
    queryFn: () => fetchData(endPoints.info.stf.replace(":id", id), zSTFDetailsPayload),
    enabled: id !== 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

type STFMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useSTFMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: STFMutationConfig<T, Variables>
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (variables: Variables) => {
      const response = await Axios.post(endpoint, variables);
      return parseResponse(response.data);
    },
    {
      ...config,
      onSuccess: (data, ...args) => {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('stfIndex');
        queryClient.invalidateQueries('stfList');
        queryClient.invalidateQueries('stfDetails');
      },
    }
  );
};

type CustomsEntry = {
  custom_entry_id: number;
  bill_of_entry: string;
  bill_of_entry_date: string;
  bill_of_entry_file: string;
};

type Package = {
  logistic_request_package_id: number;
  package_type_id: number;
  package_number: string;
  weight: number;
  weight_unit_of_measurement_id: number;
  length: number;
  width: number;
  height: number;
  unit_of_measurement_id: number;
  volumetric_weight: number;
};

type useCreateSTFBody = {
  type: string;
  logistic_request_id: number;
  sft_number: string;
  stf_date: string;
  volumetric_weight: number;
  ci_number: string;
  packing_slip_no: string;
  total_ci_value: number;
  ci_date: string;
  packing_slip_date: string;
  customs: string;
  awb_number: string;
  customs_entries: CustomsEntry[];
  packages: Package[];
};

export const useCreateSTF = (
  config: STFMutationConfig<CreateSTFPayload, useCreateSTFBody> = {}
) => {
  const queryClient = useQueryClient();
  return useSTFMutation(endPoints.create.stf, zCreateSTFPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('stfIndex');
        queryClient.invalidateQueries('stfList');
        queryClient.invalidateQueries('stfDetails');
      }
    },
  });
};
