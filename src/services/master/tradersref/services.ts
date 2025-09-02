import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient
} from 'react-query';

import {
  CreateMasterTraderPayload,
  TraderDetailsPayload,
  TraderRefIndexPayload,
  TraderRefListPayload,
  CreateTraderRefBlukPayload,
  zCreateMasterTraderPayload,
  zTraderDetailsPayload,
  zTraderRefIndexPayload,
  zTraderRefListPayload,
  zCreateTraderRefBlukPayload
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UseTraderRefIndexQueryOptions = UseQueryOptions<TraderRefIndexPayload>;
type UseTraderRefListQueryOptions = UseQueryOptions<TraderRefListPayload>;
type UseTraderDetailsQueryOptions = UseQueryOptions<TraderDetailsPayload>;

interface QueryParams {
  page?: number;
  search?: {
    business_name?: string;
    code?: string;
    business_type_id?: number;
  };
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

export const useTraderRefIndex = (
  queryParams?: QueryParams,
  queryOptions: UseTraderRefIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['TraderRefIndex', queryParams],
    queryFn: () =>
      fetchData(endPoints.index.customer_trader_reference,
        zTraderRefIndexPayload,
        queryParams
      ),
    ...queryOptions,
  });

export const useTraderRefList = (
  queryOptions: UseTraderRefListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'TraderRefList',
    queryFn: () =>
      fetchData(endPoints.list.customer_trader_reference, zTraderRefListPayload),
    ...queryOptions,
  });

export const useTraderRefDetails = (
  id: number,
  queryOptions: UseTraderDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['TraderDetails', id],
    queryFn: () =>
      fetchData(endPoints.info.customer_trader_reference.replace(":id", id), zTraderDetailsPayload),
    ...queryOptions,
  });

type TraderMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useTraderMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: TraderMutationConfig<T, Variables>
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

type useCreateTraderBody = {
  customer_id: number;
  vendor_name: string;
  attention: string;
  address: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  fax?: string;
  email?: string;
  remarks?: string;
};

export const useCreateTrader = (
  config: TraderMutationConfig<
    CreateMasterTraderPayload,
    useCreateTraderBody
  > = {}
) => {
  return useTraderMutation(endPoints.create.customer_trader_reference,
    zCreateMasterTraderPayload().parse,
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

const useTraderPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: TraderMutationConfig<T, Variables>
) => {
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
      },
    }
  );
};

interface UpdateTraderVariables {
  id: number;
  vendor_name: string;
  attention: string;
  address: string;
  address_line2: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  phone: string;
  fax?: string;
  email?: string;
  remarks?: string;
}

export const useUpdateTrader = (
  config: TraderMutationConfig<
    CreateMasterTraderPayload,
    Omit<UpdateTraderVariables, 'id'>
  > = {}
) => {
  return useTraderPutMutation<CreateMasterTraderPayload, UpdateTraderVariables>(
    ({ id }) => endPoints.update.customer_trader_reference.replace(":id", id),
    zCreateMasterTraderPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};

type UseCreateTraderRefBulkBody = useCreateTraderBody[];
   
type TraderRefBlukMutationConfig<T, Variables> = UseMutationOptions<
T,
AxiosError<T>,
Variables
>;

const useTraderRefBlukMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: TraderRefBlukMutationConfig<T, Variables>
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

export const useCreateTraderRefBluk = (
  config: TraderRefBlukMutationConfig<
    CreateTraderRefBlukPayload,
    UseCreateTraderRefBulkBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useTraderRefBlukMutation(endPoints.others.upload_customer_trader_reference_bulk,
    zCreateTraderRefBlukPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('CreateTraderRefBluk');
        }
      },
    }
  );
};
