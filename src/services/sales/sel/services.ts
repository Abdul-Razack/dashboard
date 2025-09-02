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
  CreateSelPayload,
  SelDetailsPayload,
  SelIndexPayload,
  SelListPayload,
  zCreateSelPayload,
  zSelDetailsPayload,
  zSelIndexPayload,
  zSelListPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

interface QueryParams {
  page?: number;
  customer_id?: string;
  attention?: string;
  consignee_name?: string;
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

type SelMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useSelMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: SelMutationConfig<T, Variables>
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

type RFQItem = {
  part_number_id: number;
  condition_id: number;
  qty: number;
  unit_of_measure_id: number;
  remark: string;
};

type useCreateSelBody = {
  mode_of_receipt_id: number;
  customer_id: number;
  priority_id: number;
  customer_contact_manager_id: number;
  customer_shipping_address_id: number;
  currency_id: number;
  due_date: string;
  cust_rfq_no: string;
  cust_rfq_date: string;
  fob_id: number;
  payment_mode_id: number;
  payment_terms_id: number;
  remarks: string;
  items: RFQItem[];
};

export const useCreateSel = (
  config: SelMutationConfig<CreateSelPayload, useCreateSelBody> = {}
) => {
  const queryClient = useQueryClient();
  return useSelMutation(endPoints.create.sel, zCreateSelPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('selList');
        queryClient.invalidateQueries('selIndex');
      }
    },
  });
};

type UseSelIndexQueryOptions = UseQueryOptions<SelIndexPayload>;
export const useSelIndex = (
  queryParams?: QueryParams,
  queryOptions: UseSelIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['selIndex', queryParams],
    queryFn: () =>
      fetchData(endPoints.index.sel, zSelIndexPayload, queryParams),
    enabled: !!queryParams, // Only run query when queryParams are provided
    keepPreviousData: true, // Useful for pagination
    retry: 2,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    ...queryOptions,
  });

type UseSelListQueryOptions = UseQueryOptions<SelListPayload>;

export const useSelList = (
  queryParams?: QueryParams,
  queryOptions: UseSelListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['selList', queryParams],
    queryFn: () => fetchData(endPoints.list.sel, zSelListPayload, queryParams),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

type UseSelDetailsQueryOptions = UseQueryOptions<SelDetailsPayload>;
export const useSelDetails = (
  id: any,
  queryOptions: UseSelDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['selDetails', id],
    queryFn: () =>
      fetchData(endPoints.info.sel.replace(':id', id), zSelDetailsPayload),
    enabled: !!id, // Only run when id is provided
    retry: 2,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
    ...queryOptions,
  });

export const FetchSELInfo = () => {
  const queryClient = useQueryClient();

  return async (id: number | string) => {
    if (!id || id === 0 || id === '0') return null;

    return queryClient.fetchQuery({
      queryKey: ['selDetails', id],
      queryFn: () =>
        fetchData(endPoints.info.sel.replace(':id', id), zSelDetailsPayload),
    });
  };
};
