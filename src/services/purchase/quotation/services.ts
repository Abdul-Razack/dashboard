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
  CreateQuotationItemPayload,
  CreateQuotationPayload,
  QuotationDetailsPayload,
  QuotationIndexPayload,
  QuotationItemsByRFQPayload,
  QuotationListByRFQCustomerPayload,
  QuotationListPayload,
  QuotationRelatedListPayload,
  QuotationsByRFQPayload,
  QuotationItemNQPayload,
  zCreateQuotationItemPayload,
  zCreateQuotationPayload,
  zQuotationDetailsPayload,
  zQuotationIndexPayload,
  zQuotationItemsByRFQPayload,
  zQuotationListByRFQCustomerPayload,
  zQuotationListPayload,
  zQuotationRelatedListPayload,
  zQuotationsByRFQPayload,
  zQuotationItemNQPayload
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UseQuotationIndexQueryOptions = UseQueryOptions<QuotationIndexPayload>;
type UseQuotationListQueryOptions = UseQueryOptions<QuotationListPayload>;
type UseQuotationDetailsQueryOptions = UseQueryOptions<QuotationDetailsPayload>;
type UseQuotationItemsByRFQQueryOptions =
  UseQueryOptions<QuotationItemsByRFQPayload>;
type UseQuotationListByRFQCustomerQueryOptions =
  UseQueryOptions<QuotationListByRFQCustomerPayload>;
type UseQuotationRelatedListQueryOptions =
  UseQueryOptions<QuotationRelatedListPayload>;
type UseQuotationsByRFQQueryOptions = UseQueryOptions<QuotationsByRFQPayload>;

interface QueryParams {
  page?: number;
  search?: {
    type?: string;
  };
  rfq_id?: number;
  requested_part_number_id?: number;
  customer_id?: number;
  quotation_id?: number;
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

export const useQuotationIndex = (
  queryParams?: QueryParams,
  queryOptions: UseQuotationIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['quotationIndex', queryParams],
    queryFn: () =>
      fetchData(endPoints.index.quotation , zQuotationIndexPayload, queryParams),
    enabled: !!queryParams,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useQuotationList = (
  queryParams?: QueryParams,
  queryOptions: UseQuotationListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['quotationList', queryParams],
    queryFn: () =>
      fetchData(endPoints.list.quotation, zQuotationListPayload, queryParams),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useQuotationRelatedList = (
  queryParams?: QueryParams,
  queryOptions: UseQuotationRelatedListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['quotationRelatedList', queryParams],
    queryFn: () =>
      fetchData( endPoints.others.list_related_quotations,
        zQuotationRelatedListPayload,
        queryParams
      ),
    enabled: !!queryParams && queryParams.quotation_id !== 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useQuotationDetails = (
  id: number,
  queryOptions: UseQuotationDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['quotationDetails', id],
    queryFn: () => fetchData( endPoints.info.quotation.replace(":id", id), zQuotationDetailsPayload),
    enabled: id !== 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000,
    //cacheTime: 10 * 60 * 1000,
    retry: 2,
    ...queryOptions,
  });

export const useQuotationItemsByRFQ = (
  queryParams?: QueryParams,
  queryOptions: UseQuotationItemsByRFQQueryOptions = {}
) =>
  useQuery({
    queryKey: ['quotationItemsByRFQ', queryParams],
    queryFn: () =>
      fetchData( endPoints.others.items_by_rfq,
        zQuotationItemsByRFQPayload,
        queryParams
      ),
    enabled: !!queryParams && queryParams.rfq_id !== 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

  
export const useQuotationListByRFQCustomer = (
  queryParams?: QueryParams,
  queryOptions: UseQuotationListByRFQCustomerQueryOptions = {}
) =>
  useQuery({
    queryKey: ['quotationListByRFQCustomer', queryParams],
    queryFn: () =>
      fetchData( endPoints.others.list_by_rfq_and_customer,
        zQuotationListByRFQCustomerPayload,
        queryParams
      ),
    enabled: !!queryParams,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useQuotationsByRFQ = (
  rfqId: number,
  queryOptions: UseQuotationsByRFQQueryOptions = {}
) =>
  useQuery({
    queryKey: ['quotationsByRFQ', rfqId],
    queryFn: () =>
      fetchData( endPoints.others.quotation_by_rfq.replace(":id", rfqId) , zQuotationsByRFQPayload),
    enabled: !!rfqId,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

type QuotationMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useQuotationMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: QuotationMutationConfig<T, Variables>
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
        queryClient.invalidateQueries('quotationIndex');
        queryClient.invalidateQueries('quotationList');
        queryClient.invalidateQueries('quotationDetails');
      },
    }
  );
};

type useCreateQuotationBody = {
  rfq_id: number;
  customer_id: number;
  currency_id: number;
  vendor_quotation_no: string;
  vendor_quotation_date?: string | null;
  expiry_date?: string | null;
  remarks?: string | null;
  quotation_file: string;
};

export const useCreateQuotation = (
  config: QuotationMutationConfig<
    CreateQuotationPayload,
    useCreateQuotationBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useQuotationMutation(
    endPoints.create.quotation, 
    zCreateQuotationPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('quotationIndex');
          queryClient.invalidateQueries('quotationList');
          queryClient.invalidateQueries('quotationDetails');
        }
      },
    }
  );
};

type useCreateQuotationItemBody = {
  quotation_id: number;
  part_number_id: number;
  requested_part_number_id: number;
  condition_id: number;
  unit_of_measure_id: number;
  qty: number;
  price: number;
  remark: string;
  delivery_options: string;
  moq: number;
  mov: number;
  rfq_item_id: number;
};

export const useCreateQuotationItem = (
  config: QuotationMutationConfig<
    CreateQuotationItemPayload,
    useCreateQuotationItemBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useQuotationMutation( endPoints.others.quotation_create_item,
    zCreateQuotationItemPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('quotationIndex');
          queryClient.invalidateQueries('quotationList');
          queryClient.invalidateQueries('quotationDetails');
        }
      },
    }
  );
};

type useRFQItemNQBody = {
  quotation_id: number;
  rfq_item_id: number;
};

export const useMarkQuotationAsNQ = (
  config: QuotationMutationConfig<QuotationItemNQPayload, useRFQItemNQBody> = {}
) => {
  const queryClient = useQueryClient();
  return useQuotationMutation( endPoints.others.add_no_quotation , zQuotationItemNQPayload().parse, {
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

const useQuotationPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: QuotationMutationConfig<T, Variables>
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
        queryClient.invalidateQueries('quotationIndex');
        queryClient.invalidateQueries('quotationList');
        queryClient.invalidateQueries('quotationDetails');
      },
    }
  );
};

type Item = {
  part_number_id: number;
  condition_id: number;
  qty: number;
  price: number;
  unit_of_measure_id: number;
  remark: string;
  moq: number;
  mov: number;
  delivery_options: string;
  requested_part_number_id: number;
  id?: any;
};

type useUpdateQuotationBody = {
  id: number;
  items: Item[];
  rfq_id: number;
  customer_id: number;
  currency_id: number;
  vendor_quotation_no: string;
  vendor_quotation_date?: string | null;
  expiry_date?: string | null;
  remarks?: string | null;
  quotation_file?: string;
};

export const useUpdateQuotation = (
  config: QuotationMutationConfig<
    CreateQuotationPayload,
    Omit<useUpdateQuotationBody, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useQuotationPutMutation<
    CreateQuotationPayload,
    useUpdateQuotationBody
  >(({ id }) => endPoints.update.quotation.replace(":id", id), zCreateQuotationPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('quotationIndex');
        queryClient.invalidateQueries('quotationList');
        queryClient.invalidateQueries('quotationDetails');
      }
    },
    onMutate: async (variables) => {
      const { id, ...rest } = variables;
      return rest; // Return variables excluding 'id'
    },
  });
};
