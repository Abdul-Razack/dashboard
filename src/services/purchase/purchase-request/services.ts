import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  CreatePRPayload,
  PRDetailsPayload,
  PRIndexPayload,
  PRListPayload,
  PRLogsDetailsPayload,
  PRLogsListPayload,
  zCreatePRPayload,
  zPRDetailsPayload,
  zPRIndexPayload,
  zPRListPayload,
  zPRLogDetailsPayload,
  zPRLogListPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type UsePRIndexQueryOptions = UseQueryOptions<PRIndexPayload>;
type UsePRListQueryOptions = UseQueryOptions<PRListPayload>;
type UsePRDetailsQueryOptions = UseQueryOptions<PRDetailsPayload>;
type UsePRLogListQueryOptions = UseQueryOptions<PRLogsListPayload>;
type UsePRLogDetailsQueryOptions = UseQueryOptions<PRLogsDetailsPayload>;

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
  Object.entries(queryParams).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null && value !== '') {
      if (Array.isArray(value)) {
        queryString.append(`${key}`, value.toString());
      } else {
        Object.entries(value).forEach(([nestedKey, nestedValue]) => {
          if (nestedValue !== undefined && nestedValue !== null && value !== '') {
            if (Array.isArray(queryParams)) {
              queryString.append(key, value.toString());
            } else {
              queryString.append(
                `search[${nestedKey}]`,
                nestedValue.toString()
              );
            }
          }
        });
      }
    } else {
      // Directly append top-level non-object parameters, if any exist
      if (value !== undefined && value !== null && value !== '') {
        queryString.append(key, value.toString());
      }
    }
  });

  // const finalUrl = `${url}?${queryString.toString()}`;
  // console.log(`Final API URL: ${finalUrl}`); // Debugging purposes
  try {
    //const response = await Axios.get(`${url}${Object.keys(queryParams).length > 0 ? '?' : ''}${queryString}`);
    const response = await Axios.get(`${url}?${queryString}`);
    return parser().parse(response.data);
  } catch (error) {
    console.error('API call failed', error);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

export const usePRIndex = (
  queryParams?: QueryParams,
  queryOptions: UsePRIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['prIndex', queryParams],
    queryFn: () => fetchData(endPoints.index.purchase_request, zPRIndexPayload, queryParams),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const usePRList = (
  queryParams?: QueryParams,
  queryOptions: UsePRListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['prList', queryParams],
    queryFn: () =>
      fetchData(endPoints.list.purchase_request, zPRListPayload, queryParams),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const usePRDetails = (
  id: any,
  queryOptions: UsePRDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['prDetails', id],
    queryFn: () =>
      fetchData(
        endPoints.info.purchase_request.replace(':id', id),
        zPRDetailsPayload
      ),
    enabled: !!id,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

type PRMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const usePRMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: PRMutationConfig<T, Variables>
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

type Item = {
  part_number_id: number;
  condition_id: number;
  qty: number;
  unit_of_measure_id: number;
  remark?: string;
  sales_log_item_id?: number;
};

type useCreatePRBody = {
  type: string;
  priority_id: number;
  sales_log_id?: number;
  due_date: string;
  remark?: string;
  items: Item[];
};

export const useCreatePR = (
  config: PRMutationConfig<CreatePRPayload, useCreatePRBody> = {}
) => {
  const queryClient = useQueryClient();

  return usePRMutation(
    endPoints.create.purchase_request,
    zCreatePRPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('prIndex');
          queryClient.invalidateQueries('prList');
          queryClient.invalidateQueries('prDetails');
          queryClient.invalidateQueries('prLogList');
        }
      },
    }
  );
};

const usePRPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: PRMutationConfig<T, Variables>
) => {
  const queryClient = useQueryClient();
  return useMutation(
    async (variables: Variables) => {
      const url = endpoint(variables);
      const response = await Axios.put(url, variables);
      return parseResponse(response.data);
    },
    {
      ...config,
      onSuccess: (data, ...args) => {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('prIndex');
        queryClient.invalidateQueries('prList');
        queryClient.invalidateQueries('prDetails');
        queryClient.invalidateQueries('prLogList');
      },
    }
  );
};

interface updateItem {
  id: number;
  part_number_id: number;
  condition_id: number;
  qty: number;
  unit_of_measure_id: number;
  remark?: string;
}

interface UpdatePRVariables {
  id: number;
  type: string;
  priority_id: number;
  due_date: string;
  remark?: string;
  items: updateItem[];
}

export const useUpdatePR = (
  config: PRMutationConfig<CreatePRPayload, Omit<UpdatePRVariables, 'id'>> = {}
) => {
  const queryClient = useQueryClient();
  return usePRPutMutation<CreatePRPayload, UpdatePRVariables>(
    ({ id }) => endPoints.update.purchase_request.replace(':id', id),
    zCreatePRPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('prIndex');
          queryClient.invalidateQueries('prList');
          queryClient.invalidateQueries('prDetails');
          queryClient.invalidateQueries('prLogList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};

export const usePRLogList = (
  id: number,
  queryOptions: UsePRLogListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['prLogList', id],
    queryFn: () =>
      fetchData(
        endPoints.history_list.purchase_request.replace(':id', id),
        zPRLogListPayload
      ),
    enabled: !!id,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const usePRLogDetails = (
  id: number,
  queryOptions: UsePRLogDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['prDetails', id],
    queryFn: () =>
      fetchData(
        endPoints.history_info.purchase_request.replace(':id', id),
        zPRLogDetailsPayload
      ),
    enabled: !!id,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });
