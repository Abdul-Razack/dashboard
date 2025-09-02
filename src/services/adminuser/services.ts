import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  AdminUserDetailsPayload,
  AdminUserIndexPayload,
  AdminUserListPayload,
  CreateAdminUserPayload,
  zAdminUserDetailsPayload,
  zAdminUserIndexPayload,
  zAdminUserListPayload,
  zCreateAdminUserPayload,
} from './schema';


type UseAdminUserIndexQueryOptions =
  UseQueryOptions<AdminUserIndexPayload>;
type UseAdminUserListQueryOptions =
  UseQueryOptions<AdminUserListPayload>;
type UseAdminUserDetailsQueryOptions = UseQueryOptions<AdminUserDetailsPayload>;

interface QueryParams {
  page?: number;
  search?: {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    department_id?: number;
    role_id?: number;
  };
}

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};
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

export const useAdminUserIndex = (
  queryParams?: QueryParams,
  queryOptions: UseAdminUserIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['adminUserIndex', queryParams],
    queryFn: () =>
      fetchData(endPoints.index.user,
        zAdminUserIndexPayload,
        queryParams
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!queryParams,
    ...queryOptions,
  });

export const useAdminUserList = (
  queryOptions: UseAdminUserListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'AdminUserList',
    queryFn: () =>
      fetchData(endPoints.list.user, zAdminUserListPayload),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });


export const useAdminUserDetails = (
  id: number | string,
  queryOptions: UseAdminUserDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['AdminUserDetails', id],
    queryFn: () =>
      fetchData(endPoints.info.user.replace(':id', id), zAdminUserDetailsPayload),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!id,
    ...queryOptions,
  });

type AdminUserMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useAdminUserMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: AdminUserMutationConfig<T, Variables>
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

type useCreateAdminUserBody = {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: number;
  role_id: number;
  password: string;
};

export const useCreateAdminUser = (
  config: AdminUserMutationConfig<
    CreateAdminUserPayload,
    useCreateAdminUserBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useAdminUserMutation(endPoints.create.user,
    zCreateAdminUserPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('adminUserIndex');
          queryClient.invalidateQueries('adminUserList');
          queryClient.invalidateQueries('adminUserDetails');
        }
      },
    }
  );
};

const useAdminUserPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: AdminUserMutationConfig<T, Variables>
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

interface UpdateAdminUserVariables {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: number;
  role_id: number;
  password?: string;
}

export const useUpdateAdminUser = (
  config: AdminUserMutationConfig<
    CreateAdminUserPayload,
    Omit<UpdateAdminUserVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useAdminUserPutMutation<
    CreateAdminUserPayload,
    UpdateAdminUserVariables
  >(
    ({ id }) => endPoints.update.user.replace(':id', id),
    zCreateAdminUserPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('adminUserIndex');
          queryClient.invalidateQueries('adminUserList');
          queryClient.invalidateQueries('adminUserDetails');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
