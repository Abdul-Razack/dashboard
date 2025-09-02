import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  CreateMasterPayload,
  CustomerDetailsPayload,
  CustomerIndexPayload,
  CustomerListPayload,
  CustomerListSupplierPayload,
  CreateCustomerBlukPayload,
  UploadedCustomerNamesPayload,
  zCreateMasterPayload,
  zCustomerDetailsPayload,
  zCustomerIndexPayload,
  zCustomerListPayload,
  zCustomerListSupplierPayload,
  zCreateCustomerBlukPayload,
  zUploadedCustomerNamesPayload
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type UseCustomerIndexQueryOptions = UseQueryOptions<CustomerIndexPayload>;
type UseCustomerListQueryOptions = UseQueryOptions<CustomerListPayload>;
type UseCustomerListSupplierQueryOptions =
  UseQueryOptions<CustomerListSupplierPayload>;
type UseCustomerDetailsQueryOptions = UseQueryOptions<CustomerDetailsPayload>;

interface QueryParams {
  page?: number;
  customer_id?: any;
  business_name?: any;
  contact_type_id?: any;
  search?: {
    id?: number;
    business_name?: string;
    code?: string;
    business_type_id?: number;
    contact_type_id?: number;
  };
  type?: 'suppliers' | 'customers' | 'freight';
  field?: string;
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

export const useCustomerIndex = (
  queryParams?: QueryParams,
  queryOptions: UseCustomerIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['customerIndex', queryParams],
    queryFn: () =>
      fetchData(endPoints.index.customer, zCustomerIndexPayload, queryParams),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!queryParams,
    ...queryOptions,
  });

export const useCustomerList = (
  queryParams?: QueryParams,
  queryOptions: UseCustomerListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['customerList', queryParams],
    queryFn: () =>
      fetchData(endPoints.list.customer, zCustomerListPayload, queryParams),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useCustomerListCode = (
  queryParams?: QueryParams,
  queryOptions: UseCustomerListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['customerListCode', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.list.customer_code,
        zCustomerListPayload,
        queryParams
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useCustomerSupplierList = (
  queryParams?: QueryParams,
  queryOptions: UseCustomerListSupplierQueryOptions = {}
) =>
  useQuery({
    queryKey: ['customerListSupplier', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.list.customer_contacts,
        zCustomerListSupplierPayload,
        queryParams
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!queryParams,
    ...queryOptions,
  });

export const useCustomerDetails = (
  id: number | string,
  queryOptions: UseCustomerDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['customerDetails', id],
    queryFn: () =>
      fetchData(
        endPoints.info.customer.replace(':id', id),
        zCustomerDetailsPayload
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!id,
    ...queryOptions,
  });

    export const FetchCustomerInfo = () => {
      const queryClient = useQueryClient();
      
      return async (id: number | string) => {
        if (!id || id === 0 || id === '0') return null;
        
        return queryClient.fetchQuery({
          queryKey: ['customerInfo', id],
          queryFn: () => fetchData(
            endPoints.info.customer.replace(':id', id),
            zCustomerDetailsPayload
          )
        });
      }
    }

type MasterMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useMasterMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: MasterMutationConfig<T, Variables>
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

type QualityCertificate = {
  certificate_type?: string;
  doc_no?: string;
  validity_date?: string;
  issue_date?: string;
  doc_url?: string;
};

type useCreateMasterBody = {
  business_name: string;
  business_type_id: number;
  year_of_business?: number;
  contact_type_id: number;
  // customer_group_id: number;
  is_foreign_entity: boolean;
  nature_of_business?: string;
  license_trade_no?: string;
  license_trade_exp_date?: string;
  license_trade_url?: string;
  vat_tax_id?: string;
  vat_tax_url?: string;
  email?: string;
  currency_id: number;
  remarks?: string;
  quality_certificates?: QualityCertificate[];
  mode_of_payment_id: number;
  payment_term_id: number;
  total_credit_amount: number;
  total_credit_period: number;
};

export const useCreateMaster = (
  config: MasterMutationConfig<CreateMasterPayload, useCreateMasterBody> = {}
) => {
  const queryClient = useQueryClient();
  return useMasterMutation(
    endPoints.create.customer,
    zCreateMasterPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('customerIndex');
          queryClient.invalidateQueries('customerList');
          queryClient.invalidateQueries('customerDetails');
        }
      },
    }
  );
};

const useMasterPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: MasterMutationConfig<T, Variables>
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

interface UpdateMasterVariables {
  id: number;
  business_name: string;
  business_type_id: number;
  year_of_business?: number;
  contact_type_id: number;
  is_foreign_entity: boolean;
  nature_of_business?: string;
  license_trade_no?: string;
  license_trade_exp_date?: string;
  // customer_group_id: number;
  license_trade_url?: string;
  vat_tax_id?: string;
  vat_tax_url?: string;
  email?: string;
  currency_id: number;
  remarks?: string;
  quality_certificates?: QualityCertificate[];
  mode_of_payment_id: number | string;
  payment_term_id: number | string;
  total_credit_amount: number;
  total_credit_period: number;
}

export const useUpdateMaster = (
  config: MasterMutationConfig<
    CreateMasterPayload,
    Omit<UpdateMasterVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useMasterPutMutation<CreateMasterPayload, UpdateMasterVariables>(
    ({ id }) => endPoints.update.customer.replace(':id', id),
    zCreateMasterPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('customerIndex');
          queryClient.invalidateQueries('customerList');
          queryClient.invalidateQueries('customerDetails');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};

type uploadedCustomerNames = {
  customer_names: string[];
};

export const checkUploadedCustomerNamesExists = (
  config: MasterMutationConfig<UploadedCustomerNamesPayload, uploadedCustomerNames> = {}
) => {
  const queryClient = useQueryClient();
  return useMasterMutation(endPoints.others.check_customer_name_exist, zUploadedCustomerNamesPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('customerIndex');
        queryClient.invalidateQueries('customerList');
        queryClient.invalidateQueries('customerDetails');
      }
    },
  });
};

interface StatusUpdateVariables {
  id: string | number;
}

export const useUpdateCustomerStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, isActive }: StatusUpdateVariables & { isActive: boolean }) => {
      const url = isActive 
        ? endPoints.others.customer_activate.replace(':id', id.toString())
        : endPoints.others.customer_deactivate.replace(':id', id.toString());
      
      const response = await Axios.put(url);
      return response.data;
    },
    onSuccess: (data, variables) => {
      if (data.status) {
        // Invalidate relevant queries
        queryClient.invalidateQueries('customerIndex');
        queryClient.invalidateQueries('customerList');
        queryClient.invalidateQueries('customerDetails');
        
        // Optionally: Update specific cache entries immediately
        queryClient.setQueryData(
          ['customerDetails', variables.id],
          (oldData: any) => ({
            ...oldData,
            is_active: variables.isActive
          })
        );
      }
    },
    // Optional: Add optimistic updates
    onMutate: async (variables) => {
      await queryClient.cancelQueries(['customerDetails', variables.id]);
      
      const previousCustomer = queryClient.getQueryData(['customerDetails', variables.id]);
      
      queryClient.setQueryData(
        ['customerDetails', variables.id],
        (oldData: any) => ({
          ...oldData,
          is_active: variables.isActive
        })
      );
      
      return { previousCustomer };
    },
    onError: (error, variables, context) => {
      console.log(error)
      // Rollback optimistic update if error occurs
      if (context?.previousCustomer) {
        queryClient.setQueryData(
          ['customerDetails', variables.id],
          context.previousCustomer
        );
      }
    }
  });
};

type CustomerDetails = {
  business_name: string;
  business_type_id: number;
  year_of_business: number;
  contact_type_id: number;
  is_foreign_entity: boolean;
  nature_of_business: string;
  license_trade_no: string;
  email: string;
  currency_id: number;
  payment_mode_id: number;
  payment_term_id: number;
  total_credit_amount: number;
  total_credit_period: number;
};

type UseCreateCustomerBulkBody = CustomerDetails[];
   
type CustomerBlukMutationConfig<T, Variables> = UseMutationOptions<
T,
AxiosError<T>,
Variables
>;

const useCustomerBulkMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: CustomerBlukMutationConfig<T, Variables>
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

export const useCreateCustomerBluk = (
  config: CustomerBlukMutationConfig<
    CreateCustomerBlukPayload,
    UseCreateCustomerBulkBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useCustomerBulkMutation(endPoints.others.upload_customer_bulk,
    zCreateCustomerBlukPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('CreateCustomerBluk');
        }
      },
    }
  );
};
