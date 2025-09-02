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
  CreatePurchaseOrderPayload,
  PurchaseOrderDetailsPayload,
  PurchaseOrderIndexPayload,
  PurchaseOrderListPayload,
  RelatedPurchaseOrderListPayload,
  zCreatePurchaseOrderPayload,
  zPurchaseOrderDetailsPayload,
  zPurchaseOrderIndexPayload,
  zPurchaseOrderListPayload,
  zRelatedPurchaseOrderListPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UsePurchaseOrderIndexQueryOptions =
  UseQueryOptions<PurchaseOrderIndexPayload>;
type UsePurchaseOrderListQueryOptions =
  UseQueryOptions<PurchaseOrderListPayload>;
type UseRelatedPurchaseOrderListQueryOptions =
  UseQueryOptions<RelatedPurchaseOrderListPayload>;
type UsePurchaseOrderDetailsQueryOptions =
  UseQueryOptions<PurchaseOrderDetailsPayload>;

interface QueryParams {
  page?: number;
  search?: {
    id?: number;
  };
  purchase_order_id?: number;
  customer_id?: number;
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

export const usePurchaseOrderIndex = (
  queryParams?: QueryParams,
  queryOptions: UsePurchaseOrderIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['purchaseOrderIndex', queryParams],
    queryFn: () =>
      fetchData(endPoints.index.purchase_order, zPurchaseOrderIndexPayload, queryParams),
    enabled: !!queryParams,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const usePurchaseOrderList = (
  queryParams?: QueryParams,
  queryOptions: UsePurchaseOrderListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['purchaseOrderList', queryParams],
    queryFn: () =>
      fetchData( endPoints.list.purchase_order, zPurchaseOrderListPayload, queryParams),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useRelatedPurchaseOrderList = (
  queryParams?: QueryParams,
  queryOptions: UseRelatedPurchaseOrderListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['relatedPurchaseOrderList', queryParams],
    queryFn: () =>
      fetchData( endPoints.others.related_purchase_orders,
        zRelatedPurchaseOrderListPayload,
        queryParams
      ),
    enabled: !!queryParams && queryParams.purchase_order_id !== 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const usePurchaseOrderDetails = (
  id?: number | string,
  queryOptions: UsePurchaseOrderDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['purchaseOrderDetails', id],
    queryFn: () =>
      fetchData(endPoints.info.purchase_order.replace(":id", id), zPurchaseOrderDetailsPayload),
    enabled: !!id,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

type PurchaseOrderMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const usePurchaseOrderMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: PurchaseOrderMutationConfig<T, Variables>
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

const usePurchaseOrderPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: PurchaseOrderMutationConfig<T, Variables>
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

type Item = {
  part_number_id: number;
  condition_id: number;
  unit_of_measure_id: number;
  qty: number;
  price: number;
  note?: string;
  quotation_item_id?: number | null | undefined;
};

export type useCreatePurchaseOrderBody = {
  quotation_ids?: number[];
  customer_id: number;
  customer_contact_manager_id: number;
  priority_id: number;
  ship_customer_id?: number;
  ship_customer_shipping_address_id?: number;
  payment_mode_id: number;
  payment_term_id: number;
  fob_id: number;
  currency_id: number;
  ship_type_id: number;
  ship_mode_id: number;
  ship_account_id: number;
  remark?: string;
  bank_charge?: number;
  freight?: number;
  discount?: number;
  vat?: number;
  miscellaneous_charges?: string;
  items: Item[];
};


export const useCreatePurchaseOrder = (
  config: PurchaseOrderMutationConfig<
    CreatePurchaseOrderPayload,
    useCreatePurchaseOrderBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return usePurchaseOrderMutation(
    endPoints.create.purchase_order,
    zCreatePurchaseOrderPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('purchaseOrderIndex');
          queryClient.invalidateQueries('purchaseOrderList');
          queryClient.invalidateQueries('purchaseOrderDetails');
        }
      },
    }
  );
};

export type useUpdatePurchaseOrderBody = {
  id: number;
  quotation_ids?: number[];
  customer_id: number;
  customer_contact_manager_id: number;
  priority_id: number;
  ship_customer_id?: number;
  ship_customer_shipping_address_id?: number;
  payment_mode_id: number;
  payment_term_id: number;
  fob_id: number;
  currency_id: number;
  ship_type_id: number;
  ship_mode_id: number;
  ship_account_id: number;
  remark?: string;
  bank_charge?: number;
  freight?: number;
  discount?: number;
  vat?: number;
  miscellaneous_charges?: string;
  items: Item[];
};

export const useUpdatePurchaseOrder = (
  config: PurchaseOrderMutationConfig<
  CreatePurchaseOrderPayload,
    Omit<useUpdatePurchaseOrderBody, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return usePurchaseOrderPutMutation<CreatePurchaseOrderPayload, useUpdatePurchaseOrderBody>(
    ({ id }) => endPoints.update.purchase_order.replace(":id", id),
    zCreatePurchaseOrderPayload().parse,
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