import Axios, { AxiosError } from 'axios';
import {
    UseMutationOptions,
    UseQueryOptions,
    useMutation,
    useQuery,
} from 'react-query';
import {
  LQListPayload,
  CreatePayload,
  CreateLOPayload,
  ListPayload,
  zCreateLOPayload,
  zCreatePayload,
  zListPayload,
  zLQListPayload
} from '../schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UseLQListQueryOptions = UseQueryOptions<LQListPayload>;
type MutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const usePostMutation = <T, Variables>(
    endpoint: string,
    parseResponse: (data: TODO) => T,
    config: MutationConfig<T, Variables>
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

interface QueryParams {
  lrfq?: number;
}

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

export const useListByLREFQ = (
  queryParams?: QueryParams,
  queryOptions: UseLQListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['lrfq', queryParams],
    queryFn: () => fetchData( endPoints.others.logistic_quotation_list_by_lrfq, zLQListPayload, queryParams),
    enabled: queryParams?.lrfq !== 0,
    //staleTime: 5 * 60 * 1000,
    //cacheTime: 15 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
});

type useCreateLRFQBody = {
    lrfq_id: number
    quotation_number: string
    quotation_date: string
    customer_id: number
    ship_type_id: number
    ship_via_id: number
    is_dg: boolean
    transit_day: number
    carrier_name: string
    price: number
    currency_id: number
    min_weight: number
    max_weight: number
    expiry_date: string
    remark: string
    
};  
export const useLRQuotationItem = (
    config: MutationConfig<CreatePayload, useCreateLRFQBody> = {}
  ) => {
    return usePostMutation( endPoints.create.logistic_quotation, zCreatePayload().parse, {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
        }
      },
    });
};

type useCreateLOBody = {
  logistic_quotation_ids: number[];
};
export const useCreateLogisticOrder = (
  config: MutationConfig<CreateLOPayload, useCreateLOBody> = {}
) => {
  return usePostMutation(endPoints.create.logistic_quotation_bulk , zCreateLOPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
      }
    },
  });
};

type UseLogisticQuotationListQueryOptions = UseQueryOptions<ListPayload>;
export const useLogisticQuotationList = (
  queryParams?: QueryParams,
  queryOptions: UseLogisticQuotationListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['LoList', queryParams],
    queryFn: () => fetchData( endPoints.list.logistic_quotation , zListPayload, queryParams),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });