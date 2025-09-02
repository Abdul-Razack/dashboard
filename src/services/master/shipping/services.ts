import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  CreateMasterShippingPayload,
  CreateShippingBlukPayload,
  ShippingAddressIndexPayload,
  ShippingAddressListPayload,
  ShippingDetailsPayload,
  zCreateMasterShippingPayload,
  zCreateShippingBlukPayload,
  zShippingAddressIndexPayload,
  zShippingAddressListPayload,
  zShippingDetailsPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type UseShippingAddressIndexQueryOptions =
  UseQueryOptions<ShippingAddressIndexPayload>;
type UseShippingAddressListQueryOptions =
  UseQueryOptions<ShippingAddressListPayload>;
type UseShippingDetailsQueryOptions = UseQueryOptions<ShippingDetailsPayload>;

interface QueryParams {
  page?: number;
  customer_id?: string;
  search?: {
    business_name?: string;
    code?: string;
    business_type_id?: number;
    customer_id?: number;
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

export const useShippingAddressIndex = (
  queryParams?: QueryParams,
  queryOptions: UseShippingAddressIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['shippingAddressIndex', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.index.customer_shipping_address,
        zShippingAddressIndexPayload,
        queryParams
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!queryParams,
    ...queryOptions,
  });

export const useShippingAddressList = (
  queryOptions: UseShippingAddressListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'shippingAddressList',
    queryFn: () =>
      fetchData(
        endPoints.list.customer_shipping_address,
        zShippingAddressListPayload
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useShippingAddressDetails = (
  id: number | string | undefined,
  queryOptions: UseShippingDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['shippingDetails', id],
    queryFn: () =>
      fetchData(
        endPoints.info.customer_shipping_address.replace(':id', id),
        zShippingDetailsPayload
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: id !== undefined && id !== '' && id !== 0,
    ...queryOptions,
  });

export const fetchShippingAddressInfo = () => {
  const queryClient = useQueryClient();

  return async (id: number | string) => {
    if (!id || id === 0 || id === '0') return null;

    return queryClient.fetchQuery({
      queryKey: ['ContactDetails', id],
      queryFn: () =>
        fetchData(
          endPoints.info.customer_shipping_address.replace(':id', id),
          zShippingDetailsPayload
        ),
    });
  };
};

type ShippingMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useShippingMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: ShippingMutationConfig<T, Variables>
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

type useCreateShippingBody = {
  customer_id: number;
  attention: string;
  consignee_name: string;
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

export const useCreateShipping = (
  config: ShippingMutationConfig<
    CreateMasterShippingPayload,
    useCreateShippingBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useShippingMutation(
    endPoints.create.customer_shipping_address,
    zCreateMasterShippingPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('shippingAddressIndex');
          queryClient.invalidateQueries('shippingAddressList');
          queryClient.invalidateQueries('shippingDetails');
        }
      },
    }
  );
};

const useShippingPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: ShippingMutationConfig<T, Variables>
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

interface UpdateShippingVariables {
  id: number;
  attention: string;
  consignee_name: string;
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

export const useUpdateShipping = (
  config: ShippingMutationConfig<
    CreateMasterShippingPayload,
    Omit<UpdateShippingVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useShippingPutMutation<
    CreateMasterShippingPayload,
    UpdateShippingVariables
  >(
    ({ id }) => endPoints.update.customer_shipping_address.replace(':id', id),
    zCreateMasterShippingPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('shippingAddressIndex');
          queryClient.invalidateQueries('shippingAddressList');
          queryClient.invalidateQueries('shippingDetails');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};

type UseCreateShippingBulkBody = useCreateShippingBody[];

type ShippingBlukMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useShippingBlukMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: ShippingBlukMutationConfig<T, Variables>
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

export const useCreateShippingBluk = (
  config: ShippingBlukMutationConfig<
    CreateShippingBlukPayload,
    UseCreateShippingBulkBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useShippingBlukMutation(
    endPoints.others.upload_customer_shipping_address_bulk,
    zCreateShippingBlukPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('CreateShippingBluk');
        }
      },
    }
  );
};
