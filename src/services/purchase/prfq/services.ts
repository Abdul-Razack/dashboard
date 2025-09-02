import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  CombinePRItemsPayload,
  CreatePRFQPayload,
  PRFQDetailsPayload,
  PRFQIndexPayload,
  PRFQListPayload,
  zCombinePRItemsPayload,
  zCreatePRFQPayload,
  zPRFQDetailsPayload,
  zPRFQIndexPayload,
  zPRFQListPayload
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UsePRFQIndexQueryOptions = UseQueryOptions<PRFQIndexPayload>;
type UsePRFQListQueryOptions = UseQueryOptions<PRFQListPayload>;
type UsePRFQDetailsQueryOptions = UseQueryOptions<PRFQDetailsPayload>;

interface QueryParams {
  page?: number;
  search?: {
    id?: number;
  };
}

const fetchData = async (
  url: string,
  parser: TODO,
  queryParams: QueryParams = {}
) => {
  const queryString = new URLSearchParams();
console.log(url)
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

  try {
    const response = await Axios.get(`${url}?${queryString}`);
    return parser().parse(response.data);
  } catch (error) {
    console.error('API call failed', error);
    console.error('API call failed', url);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

export const usePRFQIndex = (
  queryParams?: QueryParams,
  queryOptions: UsePRFQIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['prfqIndex', queryParams],
    queryFn: () => fetchData(endPoints.index.rfq, zPRFQIndexPayload, queryParams),
    enabled: !!queryParams,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const usePRFQList = (
  queryParams?: QueryParams,
  queryOptions: UsePRFQListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['prfqList', queryParams],
    queryFn: () => fetchData( endPoints.list.rfq, zPRFQListPayload, queryParams),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const usePRFQDetails = (
  id?: any,
  queryOptions: UsePRFQDetailsQueryOptions = {}
) =>
  
  useQuery({
    queryKey: ['prfqDetails', id],
    queryFn: () => fetchData(endPoints.info.rfq.replace(":id", id), zPRFQDetailsPayload),
    enabled: !!id && !isNaN(id) && id !== 0,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

type PRFQMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const usePRFQMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: PRFQMutationConfig<T, Variables>
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
  unit_of_measure_id: number;
  qty: number;
  remark: string;
  purchase_request_item_id: number;
};

type Customer = {
  customer_id: number;
  customer_contact_manager_id: number;
};

type useCreatePRFQBody = {
  priority_id: number;
  need_by_date: string;
  remarks: string;
  items: Item[];
  purchase_request_ids: number[];
  customers: Customer[];
};

export const useCreatePRFQ = (
  config: PRFQMutationConfig<CreatePRFQPayload, useCreatePRFQBody> = {}
) => {
  const queryClient = useQueryClient();
  return usePRFQMutation( endPoints.create.rfq , zCreatePRFQPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('prfqIndex');
        queryClient.invalidateQueries('prfqList');
        queryClient.invalidateQueries('prfqDetails');
      }
    },
  });
};

const usePRFQPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: PRFQMutationConfig<T, Variables>
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
        queryClient.invalidateQueries('prfqIndex');
        queryClient.invalidateQueries('prfqList');
        queryClient.invalidateQueries('prfqDetails');
      },
    }
  );
};

type useUpdateRFQBody = {
  id: number;
  priority_id: number;
  need_by_date: string;
  remarks: string;
  items: Item[];
  purchase_request_ids: number[];
  customers: Customer[];
};

export const useUpdateRFQ = (
  config: PRFQMutationConfig<
    CreatePRFQPayload,
    Omit<useUpdateRFQBody, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return usePRFQPutMutation<CreatePRFQPayload, useUpdateRFQBody>(
    ({ id }) => endPoints.update.rfq.replace(":id", id),
    zCreatePRFQPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('prfqIndex');
          queryClient.invalidateQueries('prfqList');
          queryClient.invalidateQueries('prfqDetails');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};

type useCombinePrItemsBody = {
  ids: number[];
};

export const useCombinePRItems = (
  config: PRFQMutationConfig<CombinePRItemsPayload, useCombinePrItemsBody> = {}
) => {
  return usePRFQMutation( endPoints.others.combine_pr_items,
    zCombinePRItemsPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
        }
      },
    }
  );
};

type useAddCustomerToPRFQBody = {
  rfq_id: string;
  customer_id: string;
  customer_contact_manager_id: string;
};

export const useAddCustomerToPRFQ = (
  config: PRFQMutationConfig<CreatePRFQPayload, useAddCustomerToPRFQBody> = {}
) => {
  return usePRFQMutation( endPoints.others.add_customer_to_rfq,
    zCreatePRFQPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
        }
      },
    }
  );
};
