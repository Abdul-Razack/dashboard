import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  CreateGRNPayload,
  GRNByStfIdPayload,
  GRNDetailsPayload,
  GRNIndexPayload,
  UpdateGRNPayload,
  zCreateGRNPayload,
  zGRNByStfIdPayload,
  zGRNDetailsPayload,
  zGRNIndexPayload,
  zUpdateGRNLocationPayload
} from './schema';

type UseGRNIndexQueryOptions = UseQueryOptions<GRNIndexPayload>;
type UseGRNDetailsQueryOptions = UseQueryOptions<GRNDetailsPayload>;
type UseGRNByStfIdQueryOptions = UseQueryOptions<GRNByStfIdPayload>;
const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};
interface QueryParams {
  page?: number;
  search?: {
    type?: string;
  };
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

  // const finalUrl = `${url}?${queryString.toString()}`;
  // console.log(`Final API URL: ${finalUrl}`); // Debugging purposes

  try {
    const response = await Axios.get(`${url}?${queryString}`);
    return parser().parse(response.data);
  } catch (error) {
    console.error('API call failed', error);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

export const useGRNIndex = (
  queryParams?: QueryParams,
  queryOptions: UseGRNIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['grnIndex', queryParams],
    queryFn: () => fetchData(endPoints.index.grn, zGRNIndexPayload, queryParams),
    enabled: !!queryParams,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    ...queryOptions,
  });

export const useGRNDetails = (
  id: number,
  queryOptions: UseGRNDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['grnDetails', id],
    queryFn: () => fetchData(endPoints.info.grn.replace(":id", id), zGRNDetailsPayload),
    enabled: !!id,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useGRNByStfId = (
  queryParams?: QueryParams,
  queryOptions: UseGRNByStfIdQueryOptions = {}
) =>
  useQuery({
    queryKey: ['grnByStfId', queryParams],
    queryFn: () =>
      fetchData(endPoints.others.grn_by_stf_id , zGRNByStfIdPayload, queryParams),
    enabled: !!queryParams && queryParams.stf_id !== 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

type GRNMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useGRNMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: GRNMutationConfig<T, Variables>
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
        queryClient.invalidateQueries('grnIndex');
      },
    }
  );
};

interface Location {
  qty: number;
  warehouse_id: number;
  rack_id: number;
  bin_location_id: number;
  serial_number: string; // Serial number specific to this location
}

interface Item {
  part_number_id: number;
  condition_id: number;
  ship_qty: number;
  ship_unit_of_measure_id: number;
  qty: number;
  unit_of_measure_id: number;
  is_quarantine: boolean;
  is_serialized: boolean;
  package_no: string;
  upload_files: string[]; // Array of file URLs
  remark?: string;
  locations: Location[];
}

type useCreateGRNBody = {
  stf_id: number;
  items: Item[];
};

export const useCreateGRN = (
  config: GRNMutationConfig<CreateGRNPayload, useCreateGRNBody> = {}
) => {
  const queryClient = useQueryClient();
  return useGRNMutation(endPoints.create.grn, zCreateGRNPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('grnIndex');
      }
    },
  });
};

interface GrnDaum {
  stock_id: number;
  warehouse_id: number;
  rack_id: number;
  bin_location_id: number;
  qty: number;
  remark: string;
}

interface GRNItem {
  stock_id: number;
  warehouse_id: number;
  rack_id: number;
  bin_location_id: number;
  qty: number;
  remark?: string;
  id?: number;
}

interface useCreateBulkGRNBody {
  grn_data: GrnDaum[];
}

export const useCreateBulkGRN = (
  config: GRNMutationConfig<CreateGRNPayload, useCreateBulkGRNBody> = {}
) => {
  const queryClient = useQueryClient();
  return useGRNMutation(endPoints.create.grn_bulk, zUpdateGRNLocationPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('grnIndex');
      }
    },
  });
};

interface useUpdateGRNLocationBody {
  stock_id: number;
  grns: GRNItem[];
}

export const useUpdateGRNLocation = (
  config: GRNMutationConfig<UpdateGRNPayload, useUpdateGRNLocationBody> = {}
) => {
  const queryClient = useQueryClient();
  return useGRNMutation(endPoints.update.grn_update_location, zUpdateGRNLocationPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('grnIndex');
      }
    },
  });
};
