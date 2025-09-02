import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions, 
  UseQueryOptions, 
  useMutation,
  useQueryClient,
  useQuery } from 'react-query';

import {
  LODetailsPayload,
  ListPayload,
  zLODetailsPayload,
  zListPayload,
  CreateLogesticOrderItemPayload,
  zCreateLogesticOrderItemPayload
} from '../schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UseLREFQListQueryOptions = UseQueryOptions<ListPayload>;
type UseLREFQDetailsQueryOptions = UseQueryOptions<LODetailsPayload>;

interface QueryParams {
  page?: number;
  search?: {
    type?: string;
  };
  customer_id?: number;
}

type LogesticOrderMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

type useCreateLogesticOrderBody = {
  logistic_quotation_id: number;
};

const useLogesticOrderMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: LogesticOrderMutationConfig<T, Variables>
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


export const useCreateLogesticOrderItem = (
  config: LogesticOrderMutationConfig<
    CreateLogesticOrderItemPayload,
    useCreateLogesticOrderBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useLogesticOrderMutation('/logistic-order/create' ,
    zCreateLogesticOrderItemPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('stockByStf');
        }
      },
    }
  );
};

const fetchData = async (
  url: string,
  parser: TODO,
  queryParams: QueryParams = {}
) => {
  const queryString = new URLSearchParams();

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
    return parser().parse(response.data);
  } catch (error) {
    console.error('API call failed', error);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};


export const useLogisticOrderList = (
  queryParams?: QueryParams,
  queryOptions: UseLREFQListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['LoList', queryParams],
    queryFn: () => fetchData( endPoints.list.logistic_order , zListPayload, queryParams),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useLogisticOrderDetails = (
  id: number,
  queryOptions: UseLREFQDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['loId', id],
    queryFn: () => fetchData(endPoints.info.logistic_order.replace(":id", id), zLODetailsPayload),
    enabled: id !== 0,
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });


