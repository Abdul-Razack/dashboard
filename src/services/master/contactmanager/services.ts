import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  ContactDetailsPayload,
  ContactManagerBulkListPayload,
  ContactManagerIndexPayload,
  ContactManagerListPayload,
  CreateContactManagerBlukPayload,
  CreateMasterContactPayload,
  zContactDetailsPayload,
  zContactManagerBulkListPayload,
  zContactManagerIndexPayload,
  zContactManagerListPayload,
  zCreateContactManagerBlukPayload,
  zCreateMasterContactPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type UseContactManagerIndexQueryOptions =
  UseQueryOptions<ContactManagerIndexPayload>;
type UseContactManagerListQueryOptions =
  UseQueryOptions<ContactManagerListPayload>;
type UseContactDetailsQueryOptions = UseQueryOptions<ContactDetailsPayload>;
type UseContactManagerBulkListQueryOptions =
  UseQueryOptions<ContactManagerBulkListPayload>;

interface QueryParams {
  page?: number;
  search?: {
    business_name?: string;
    code?: string;
    business_type_id?: number;
    customer_id?: number;
  };
  customer_ids?: string;
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

export const useContactManagerIndex = (
  queryParams?: QueryParams,
  queryOptions: UseContactManagerIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['contactManagerIndex', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.index.customer_contact_manager,
        zContactManagerIndexPayload,
        queryParams
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!queryParams,
    ...queryOptions,
  });

export const useContactManagerList = (
  queryOptions: UseContactManagerListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'ContactManagerList',
    queryFn: () =>
      fetchData(
        endPoints.list.customer_contact_manager,
        zContactManagerListPayload
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useContactManagerListById = (
  id: number,
  queryOptions: UseContactManagerListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['ContactManagerList', id],
    queryFn: () =>
      fetchData(
        `${endPoints.list.customer_contact_manager}/${id}`,
        zContactManagerListPayload
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!id,
    ...queryOptions,
  });

export const useContactManagerBulkList = (
  queryParams?: QueryParams,
  queryOptions: UseContactManagerBulkListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['contactManagerBulkList', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.bulk.contact_manager_bulk_list,
        zContactManagerBulkListPayload,
        queryParams
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!queryParams,
    ...queryOptions,
  });

export const useContactManagerDetails = (
  id: number | string | undefined,
  queryOptions: UseContactDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['ContactDetails', id],
    queryFn: () =>
      fetchData(
        endPoints.info.customer_contact_manager.replace(':id', id),
        zContactDetailsPayload
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled:
      id !== undefined &&
      id !== '' &&
      id !== 0 &&
      id !== '0' &&
      id !== 'undefined',
    ...queryOptions,
  });

export const fetchContactManagerInfo = () => {
  const queryClient = useQueryClient();

  return async (id: number | string) => {
    if (!id || id === 0 || id === '0') return null;

    return queryClient.fetchQuery({
      queryKey: ['ContactDetails', id],
      queryFn: () =>
        fetchData(
          endPoints.info.customer_contact_manager.replace(':id', id),
          zContactDetailsPayload
        ),
    });
  };
};

type ContactMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useContactMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: ContactMutationConfig<T, Variables>
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

type useCreateContactBody = {
  customer_id: number;
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

export const useCreateContact = (
  config: ContactMutationConfig<
    CreateMasterContactPayload,
    useCreateContactBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useContactMutation(
    endPoints.create.customer_contact_manager,
    zCreateMasterContactPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('contactManagerIndex');
          queryClient.invalidateQueries('contactManagerList');
          queryClient.invalidateQueries('contactDetails');
        }
      },
    }
  );
};

const useContactPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: ContactMutationConfig<T, Variables>
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

interface UpdateContactVariables {
  id: number;
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

export const useUpdateContact = (
  config: ContactMutationConfig<
    CreateMasterContactPayload,
    Omit<UpdateContactVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useContactPutMutation<
    CreateMasterContactPayload,
    UpdateContactVariables
  >(
    ({ id }) => endPoints.update.customer_contact_manager.replace(':id', id),
    zCreateMasterContactPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('contactManagerIndex');
          queryClient.invalidateQueries('contactManagerList');
          queryClient.invalidateQueries('contactDetails');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};

type UseCreateContactManagerBulkBody = useCreateContactBody[];

type ContactManagerBlukMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useContactManagerBlukMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: ContactManagerBlukMutationConfig<T, Variables>
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

export const useCreateContactManagerBluk = (
  config: ContactManagerBlukMutationConfig<
    CreateContactManagerBlukPayload,
    UseCreateContactManagerBulkBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useContactManagerBlukMutation(
    endPoints.others.upload_customer_contact_manager_bulk,
    zCreateContactManagerBlukPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('CreateContactManagerBluk');
        }
      },
    }
  );
};
