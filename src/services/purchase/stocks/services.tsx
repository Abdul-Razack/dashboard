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
  CreateInspectionItemPayload,
  CreateQualityCheckPayload,
  ListStockByStfIdPayload,
  ListStockByStfPayload,
  zCreateInspectionItemPayload,
  zCreateQualityCheckPayload,
  zListStockByStfIdPayload,
  zListStockByStfPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type useCreateInspectionItemBody = {
  stf_id: number;
  logistic_request_item_id: number | null | undefined;
  logistic_request_package_id: number;
  serial_lot_number: string;
  part_number_id: number;
  condition_id: number;
  qty: number;
  type_of_tag_id: number;
  tag_date: string;
  llp: string;
  tag_by: string | null;
  trace: string | null;
  shelf_life: string;
  is_quarantine: boolean;
  remark: string;
  files: {
    name: string;
    url: string;
  }[];
};

type useCreateQualityCheckBody = {
  id: number;
  remark: string;
  is_approved: boolean;
};

type InspectionMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useInspectionMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: InspectionMutationConfig<T, Variables>
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

export const useCreateInspectionItem = (
  config: InspectionMutationConfig<
    CreateInspectionItemPayload,
    useCreateInspectionItemBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useInspectionMutation( endPoints.create.stock_inspection ,
    zCreateInspectionItemPayload().parse,
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

export const useCreateQualityCheck = (
  config: InspectionMutationConfig<
    CreateQualityCheckPayload,
    useCreateQualityCheckBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useInspectionMutation(endPoints.create.stock_quality_check,
    zCreateQualityCheckPayload().parse,
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

interface QueryParams {
  stf_id?: number;
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
type useGetListStockByStfQueryOptions = UseQueryOptions<ListStockByStfPayload>;
export const useGetListStockByStf = (
  queryParams?: QueryParams,
  queryOptions: useGetListStockByStfQueryOptions = {}
) =>
  useQuery({
    queryKey: ['stockByStf', queryParams],
    queryFn: () =>
      fetchData(endPoints.others.stock_by_stf , zListStockByStfPayload, queryParams),
    enabled: !!queryParams,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

type useGetListStockByStfIdQueryOptions =
  UseQueryOptions<ListStockByStfIdPayload>;
export const useGetListStockByStfId = (
  queryParams?: QueryParams,
  queryOptions: useGetListStockByStfIdQueryOptions = {}
) =>
  useQuery({
    queryKey: ['stockByStfId', queryParams],
    queryFn: () =>
      fetchData(endPoints.others.stock_by_stf, zListStockByStfIdPayload, queryParams),
    enabled: !!queryParams,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });
  

  type useGetListStockByStfQueryOptions2 = UseQueryOptions<ListStockByStfPayload>;
export const useGetListQuarantineByStf = (
  queryParams?: QueryParams,
  queryOptions: useGetListStockByStfQueryOptions2 = {}
) =>
  useQuery({
    queryKey: ['stockByStf', queryParams],
    queryFn: () =>
      fetchData(endPoints.others.quarantine_by_stf, zListStockByStfPayload, queryParams),
    enabled: !!queryParams,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000,
    //cacheTime: 10 * 60 * 1000,
    retry: 2,
    ...queryOptions,
  });