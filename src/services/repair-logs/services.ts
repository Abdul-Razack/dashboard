import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { ZodError } from 'zod';

import {
    CreateRepairLogPayload,
    RepairLogIndexPayload,
    RepairLogDetailsPayload,
    RepairLogListPayload,
    zRepairLogIndexPayload,
    zCreateRepairLogPayload,
    zRepairLogDetailsPayload,
    zRepairLogListPayload
  } from './schema';



const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

  interface QueryParams {
    page?: number;
    customer_id?: string,
    attention?: string,
    consignee_name?: string,
  }
  
const fetchData = async (
    url: string,
    parser: TODO,
    queryParams: QueryParams = {}
  ) => {
    const queryString = new URLSearchParams();
  
    // Handling both top-level and nested 'search' parameters explicitly
    Object.entries(queryParams).forEach(([key, value]) => {
      if (typeof value === 'object' && value !== null) {
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          if (nestedValue !== undefined && nestedValue !== null) {
            queryString.append(`search[${nestedKey}]`, nestedValue.toString());
          }
        });
      } else {
        if (value !== undefined && value !== null) {
          queryString.append(key, value.toString());
        }
      }
    });
  
    try {
      const response = await Axios.get(`${url}?${queryString}`);
      try {
        return parser().parse(response.data);
      } catch (zodError) {
        if (zodError instanceof ZodError) {
          console.error('Zod Validation Error:');
          zodError.issues.forEach((issue) => {
            console.error(`Path: ${issue.path.join('.')}`);
            console.error(`Code: ${issue.code}`);
            console.error(`Message: ${issue.message}`);
            if ('expected' in issue) console.error(`Expected: ${issue.expected}`);
            if ('received' in issue) console.error(`Received: ${issue.received}`);
          });
        }
        throw zodError;
      }
    } catch (error) {
      console.error('API call failed', error);
      throw error;
    }
};

type RepairLogMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useRepairLogMutation = <T, Variables>(
    endpoint: string,
    parseResponse: (data: TODO) => T,
    config: RepairLogMutationConfig<T, Variables>
  ) => {
    return useMutation(
      async (variables: Variables) => {
        const response = await Axios.post(endpoint, variables);
        return parseResponse(response.data);
      },
      {
        ...config,
        onSuccess: (data, ...args) => {
          config?.onSuccess?.(data, ...args);
        },
      }
    );
};

type RepairItem = {
    part_number_id: number;
    condition_id: number;
    qty: number;
    unit_of_measure_id: number;
    remark: string;
    defect: string;
    is_bc: boolean;
    is_rp: boolean;
    is_oh: boolean;
};
  
type useCreateRepairLogBody = {
  type: string;
  priority_id: number;
  due_date: string;
  remark: string;
  enquiry_date: string;
  items: RepairItem[];
  ref_name?: string;
};

export const useCreateRepairLog = (
    config: RepairLogMutationConfig<CreateRepairLogPayload, useCreateRepairLogBody> = {}
  ) => {
    const queryClient = useQueryClient();
    return useRepairLogMutation(endPoints.create.repair, zCreateRepairLogPayload().parse, {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('repairList');
          queryClient.invalidateQueries('repairIndex');
        }
      },
    });
}; 

type UseRepairLogIndexQueryOptions = UseQueryOptions<RepairLogIndexPayload>;
export const useRepairLogIndex = (
  queryParams?: QueryParams,
  queryOptions: UseRepairLogIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['repairIndex', queryParams],
    queryFn: () =>
      fetchData(endPoints.index.repair, zRepairLogIndexPayload, queryParams),
    enabled: !!queryParams, // Only run query when queryParams are provided
    keepPreviousData: false, // Useful for pagination
    retry: 2,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    ...queryOptions,
});

type UseRepairLogDetailsQueryOptions = UseQueryOptions<RepairLogDetailsPayload>;
export const useRepairLogDetails = (
  id: number,
  queryOptions: UseRepairLogDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['repairDetails', id],
    queryFn: () =>
      fetchData(endPoints.info.repair.replace(':id', id), zRepairLogDetailsPayload),
    enabled: !!id, // Only run when id is provided
    retry: 2,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
    ...queryOptions,
  });

  type UseRepairLogListQueryOptions = UseQueryOptions<RepairLogListPayload>;

  export const useRepairLogList = (
    queryParams?: QueryParams,
    queryOptions: UseRepairLogListQueryOptions = {}
  ) =>
    useQuery({
      queryKey: ['RepairLogList', queryParams],
      queryFn: () => fetchData(endPoints.list.repair_log, zRepairLogListPayload, queryParams),
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      //staleTime: 5 * 60 * 1000, // 5 minutes
      //cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      ...queryOptions,
    });