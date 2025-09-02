
import Axios, {AxiosError} from 'axios';
import { 
    CustomerGroupListPayload,
    CustomerGroupMasterPayload,
    CustomerGroupIndexPayload,
    CreateCustomerGroupPayload,
    CustomerGroupPayload,
    PutCustomerGroupPayload,
    zCustomerGroupListPayload,
    zCustomerGroupMasterPayload,
    zCustomerGroupIndexPayload,
    zCreateCustomerGroupPayload,
    zPutCustomerGroupPayload,
    zCustomerGroupPayload
} from './schema';
import {
    UseMutationOptions,
    useMutation,
    useQueryClient,
    useQuery,
    UseQueryOptions
} from 'react-query';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

interface QueryParams {
    page?: number;
    group_id?: number;
    id?: number;
};

const fetchData = async (
    url: string,
    parser: TODO,
    queryParams: QueryParams = {}
  ) => {

    console.log(queryParams)
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
    try {
      const response = await Axios.get(`${url}?${queryString}`);
      return parser().parse(response.data);
    } catch (error) {
      console.error('API call failed', error);
      throw new Error(`Failed to fetch data from ${url}.`);
    }
};

type UseCustomerGroupListQueryOptions = UseQueryOptions<CustomerGroupListPayload>;

export const useCustomerGroupList = (
    queryOptions: UseCustomerGroupListQueryOptions = {}
  ) =>
    useQuery({
      queryKey: 'CustomerGroupList',
      queryFn: () =>
        fetchData(endPoints.list.customer_group, zCustomerGroupListPayload),
      //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      ...queryOptions,
});

type UseCustomerGroupMasterQueryOptions = UseQueryOptions<CustomerGroupMasterPayload>;

export const useCustomerGroupMaster = (
    queryParams?: QueryParams,
    queryOptions: UseCustomerGroupMasterQueryOptions = {}
  ) =>
    useQuery({
      queryKey: ['CustomerGroupMaster', queryParams],
      queryFn: () =>
        fetchData(endPoints.list.customer_group, zCustomerGroupMasterPayload, queryParams),
      //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: true, // Don't refetch when window regains focus
      ...queryOptions,
});

type useCustomerGroupIndexQueryOptions = UseQueryOptions<CustomerGroupIndexPayload>;
export const useCustomerGroupIndex = (
   queryParams?: QueryParams,
    queryOptions: useCustomerGroupIndexQueryOptions = {}
  ) =>
    useQuery({
      queryKey: ['customerGroupIndex', queryParams],
      queryFn: () =>
        fetchData(endPoints.index.customer_group,
          zCustomerGroupIndexPayload,
          queryParams
        ),
      enabled: true,  
      //staleTime: 5 * 60 * 1000,
      //cacheTime: 15 * 60 * 1000,
      retry: 2,
      refetchOnWindowFocus: false,
      ...queryOptions,
});

type UseCreateCustomerGroupBody = {
    name: string;
    is_department: boolean;
    customer_ids: number[];
}
  
type CustomerGroupsMutationConfig<T, Variables> = UseMutationOptions<
    T,
    AxiosError<T>,
    Variables
>;
  
const useCreateCustomerGroupMutation = <T, Variables>(
    endpoint: string,
    parseResponse: (data: TODO) => T,
    config: CustomerGroupsMutationConfig<T, Variables>
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
  
export const useCreateCustomerGroup = (
    config: CustomerGroupsMutationConfig<CreateCustomerGroupPayload,UseCreateCustomerGroupBody> = {}
  ) => {
    const queryClient = useQueryClient();
    return useCreateCustomerGroupMutation(endPoints.create.customer_group,
      zCreateCustomerGroupPayload().parse,
      {
        ...config,
        onSuccess: (data, ...args) => {
          if (data.status) {
            config?.onSuccess?.(data, ...args);
            queryClient.invalidateQueries('create_menus');
          }
        },
      }
    );
};

type UseCustomerGroupQueryOptions = UseQueryOptions<CustomerGroupPayload>;

export const useCustomerGroupDetails = (
    id: number | string,  // Ensure id is string-compatible
    queryOptions: UseCustomerGroupQueryOptions = {}
) =>
    useQuery({
        queryKey: ['customerGroupDetails', id],
        queryFn: () =>
            fetchData(endPoints.info.customer_group.replace(':id', String(id)), zCustomerGroupPayload), // ✅ Ensure id is a string
        enabled: Boolean(id), // ✅ Ensure valid id
        //staleTime: 0, // Data is fresh for 5 minutes
        //cacheTime: 0, // Cache the data for 15 minutes
        retry: 2, // Retry failed requests twice
        refetchOnWindowFocus: false, // Don't refetch when window regains focus
        ...queryOptions,
});
    

  type UsePutCustomerGroupBody = {
    id: number;
    customer_ids: number[];
  }

  const usePutCustomerGroupMutation = <T, Variables>(
    endpoint: (variables: Variables) => string,
    parseResponse: (data: TODO) => T,
    config: CustomerGroupsMutationConfig<T, Variables>
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

  export const usePutCustomerGroup = (
    config: CustomerGroupsMutationConfig<
      PutCustomerGroupPayload,
      Omit<UsePutCustomerGroupBody, 'id'>
    > = {}
  ) => {
    const queryClient = useQueryClient();
    return usePutCustomerGroupMutation<PutCustomerGroupPayload, UsePutCustomerGroupBody>(
      ({ id }) => endPoints.update.customer_group.replace(":id", id),
      zPutCustomerGroupPayload().parse,
      {
        ...config,
        onSuccess: (data, ...args) => {
          if (data.status) {
            config?.onSuccess?.(data, ...args);
            queryClient.invalidateQueries('GroupUpadate');
          }
        },
        onMutate: async (variables) => {
          const { id, ...rest } = variables;
          return rest; // Return variables excluding 'id'
        },
      }
    );
  };
