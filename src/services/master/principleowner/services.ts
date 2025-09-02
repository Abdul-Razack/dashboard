import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  CreateMasterOwnerPayload,
  OwnerDetailsPayload,
  PrincipleOwnerIndexPayload,
  PrincipleOwnerListPayload,
  CreatePrincipleOwnerBlukPayload,
  zCreateMasterOwnerPayload,
  zOwnerDetailsPayload,
  zPrincipleOwnerIndexPayload,
  zPrincipleOwnerListPayload,
  zCreatePrincipleOwnerBlukPayload
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UsePrincipleOwnerIndexQueryOptions =
  UseQueryOptions<PrincipleOwnerIndexPayload>;
type UsePrincipleOwnerListQueryOptions =
  UseQueryOptions<PrincipleOwnerListPayload>;
type UseOwnerDetailsQueryOptions = UseQueryOptions<OwnerDetailsPayload>;

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

export const usePrincipleOwnerIndex = (
  queryParams?: QueryParams,
  queryOptions: UsePrincipleOwnerIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['PrincipleOwnerIndex', queryParams],
    queryFn: () =>
      fetchData(endPoints.index.customer_principle_owner,
        zPrincipleOwnerIndexPayload,
        queryParams
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!queryParams,
    ...queryOptions,
  });

export const usePrincipleOwnerList = (
  queryOptions: UsePrincipleOwnerListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'PrincipleOwnerList',
    queryFn: () =>
      fetchData(endPoints.list.customer_principle_owner, zPrincipleOwnerListPayload),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const usePrincipleOwnerDetails = (
  id: number,
  queryOptions: UseOwnerDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['OwnerDetails', id],
    queryFn: () =>
      fetchData(endPoints.info.customer_principle_owner.replace(":id", id), zOwnerDetailsPayload),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!id,
    ...queryOptions,
  });

type OwnerMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useOwnerMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: OwnerMutationConfig<T, Variables>
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

type useCreateOwnerBody = {
  customer_id: number;
  owner?: string;
  phone: string;
  email?: string;
  id_passport_copy?: string;
  remarks?: string;
};

export const useCreateOwner = (
  config: OwnerMutationConfig<CreateMasterOwnerPayload, useCreateOwnerBody> = {}
) => {
  const queryClient = useQueryClient();
  return useOwnerMutation(endPoints.create.customer_principle_owner,
    zCreateMasterOwnerPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('PrincipleOwnerIndex');
          queryClient.invalidateQueries('OwnerDetails');
          queryClient.invalidateQueries('PrincipleOwnerList');
        }
      },
    }
  );
};

const useOwnerPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: OwnerMutationConfig<T, Variables>
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

interface UpdateOwnerVariables {
  id: number;
  owner?: string;
  phone: string;
  email?: string;
  id_passport_copy?: string;
  remarks?: string;
}

export const useUpdateOwner = (
  config: OwnerMutationConfig<
    CreateMasterOwnerPayload,
    Omit<UpdateOwnerVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useOwnerPutMutation<CreateMasterOwnerPayload, UpdateOwnerVariables>(
    ({ id }) => endPoints.update.customer_principle_owner.replace(":id", id),
    zCreateMasterOwnerPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('PrincipleOwnerIndex');
          queryClient.invalidateQueries('OwnerDetails');
          queryClient.invalidateQueries('PrincipleOwnerList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};

type UseCreatePrincipleOwnerBulkBody = useCreateOwnerBody[];
   
type PrincipleOwnerBlukMutationConfig<T, Variables> = UseMutationOptions<
T,
AxiosError<T>,
Variables
>;

const usePrincipleOwnerBlukMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: PrincipleOwnerBlukMutationConfig<T, Variables>
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

export const useCreatePrincipleOwnerBluk = (
  config: PrincipleOwnerBlukMutationConfig<
    CreatePrincipleOwnerBlukPayload,
    UseCreatePrincipleOwnerBulkBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return usePrincipleOwnerBlukMutation(endPoints.others.upload_customer_principle_owner_bulk,
    zCreatePrincipleOwnerBlukPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('CreatePrincipleOwnerBluk');
        }
      },
    }
  );
};
