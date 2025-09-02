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
  CreateLogisticsRequestPayload,
  IndexPayload,
  ListPayload,
  LogisticsRequestDetailsPayload,
  LogisticsRequestListByPOPayload,
  ReceiveLogisticsRequestPayload,
  StockQtytDetailsPayload,
  zCreateLogisticsRequestPayload,
  zIndexPayload,
  zListPayload,
  zLogisticsRequestDetailsPayload,
  zLogisticsRequestListByPOPayload,
  zReceiveLogisticsRequestPayload,
  zStockQtytDetailsPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};
type UseListQueryOptions = UseQueryOptions<ListPayload>;
type UseLogisticsRequestListByPOQueryOptions =
  UseQueryOptions<LogisticsRequestListByPOPayload>;
type UseLogisticsRequestDetailsQueryOptions =
  UseQueryOptions<LogisticsRequestDetailsPayload>;
type UseLogisticsRequestIndexQueryOptions = UseQueryOptions<IndexPayload>;
type LogisticsRequestMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;
type UseStockQtyDetailsQueryOptions = UseQueryOptions<StockQtytDetailsPayload>;

interface QueryParams {
  page?: number;
  search?: {
    id?: number;
  };
  purchase_order_id?: number;
  logistic_request_item_id?: number;
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

export const useLogisticsRequestIndex = (
  queryParams?: QueryParams,
  queryOptions: UseLogisticsRequestIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['logisticsRequestIndex', queryParams],
    queryFn: () =>
      fetchData(endPoints.index.logistic_request, zIndexPayload, queryParams),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useLogisticsRequestList = (
  queryParams?: QueryParams,
  queryOptions: UseListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['LogisticsRequestList', queryParams],
    queryFn: () =>
      fetchData(endPoints.list.logistic_request, zListPayload, queryParams),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useLogisticsRequestListByPO = (
  queryParams?: QueryParams,
  queryOptions: UseLogisticsRequestListByPOQueryOptions = {}
) =>
  useQuery({
    queryKey: ['logisticsRequestListByPO', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.others.logistic_request_list_by_po,
        zLogisticsRequestListByPOPayload,
        queryParams
      ),
    enabled: !!queryParams,
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useLogisticsRequestDetails = (
  id?: number | string,
  queryOptions: UseLogisticsRequestDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['logisticsRequestDetails', id],
    queryFn: () =>
      fetchData(
        endPoints.info.logistic_request.replace(':id', id),
        zLogisticsRequestDetailsPayload
      ),
    enabled: id !== 0,
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

  export const useStockQtyDetails = (
    queryParams?: QueryParams,
    queryOptions: UseStockQtyDetailsQueryOptions = {}
  ) =>
    useQuery({
      queryKey: ['logisticsRequestStockQtyDetails', queryParams],
      queryFn: () =>
        fetchData(endPoints.others.get_stock_qty_details , zStockQtytDetailsPayload, queryParams),
      enabled: queryParams?.logistic_request_item_id !== 0,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      //staleTime: 5 * 60 * 1000, // 5 minutes
      //cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      ...queryOptions,
    });

const useLogisticsRequestMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: LogisticsRequestMutationConfig<T, Variables>
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

type Item2 = {
  part_number_id: number;
  condition_id: number;
  qty: number;
  purchase_order_id: number;
  purchase_order_item_id: number;
};

type Package = {
  package_type_id: number;
  package_number: string;
  description: string;
  is_dg: boolean;
  weight: number;
  weight_unit_of_measurement_id: number;
  length: number;
  width: number;
  height: number;
  unit_of_measurement_id: number;
  pcs: number;
  volumetric_weight: number;
  is_obtained: boolean;
  items?: Item2[];
};

type Item = {
  part_number_id: number;
  condition_id: number;
  qty: number;
  purchase_order_id: number;
  purchase_order_item_id: number;
};

type useCreateLogisticsRequestBody = {
  type: string;
  priority_id: number;
  ship_type_id: number;
  ship_via_id: number;
  is_dg: boolean;
  pcs: number;
  due_date: string;
  no_of_package: number;
  volumetric_weight: number;
  customer_id: number;
  customer_shipping_address_id: number;
  receiver_customer_id: number;
  receiver_shipping_address_id: number;
  purchase_order_ids: number[];
  remark: string;
  items: Item[];
  packages: Package[];
};

export const useCreateLogisticsRequest = (
  config: LogisticsRequestMutationConfig<
    CreateLogisticsRequestPayload,
    useCreateLogisticsRequestBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useLogisticsRequestMutation(
    endPoints.create.logistic_request,
    zCreateLogisticsRequestPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('logisticsRequestListByPO');
          queryClient.invalidateQueries('logisticsRequestDetails');
        }
      },
    }
  );
};

type useReceiveLogisticRequestBody = {
  logistic_request_id: number;
  awb_number?: string;
  stf_type?: string;
};

export const useReceiveLogisticRequest = (
  config: LogisticsRequestMutationConfig<
    ReceiveLogisticsRequestPayload,
    useReceiveLogisticRequestBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useLogisticsRequestMutation(
    endPoints.others.logistic_request_receive,
    zReceiveLogisticsRequestPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('logisticsRequestListByPO');
          queryClient.invalidateQueries('logisticsRequestDetails');
        }
      },
    }
  );
};
