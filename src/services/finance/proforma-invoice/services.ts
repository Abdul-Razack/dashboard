import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  CreateProformaInvoicePayload,
  ProformaInvoiceDetailsPayload,
  ProformaInvoiceIndexPayload,
  ProformaInvoiceListPayload,
  ListProformaInvoiceByOrderIDPayload,
  zCreateProformaInvoicePayload,
  zProformaInvoiceDetailsPayload,
  zProformaInvoiceIndexPayload,
  zProformaInvoiceListPayload,
  zListProformaInvoiceByOrderIDPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type UseProformaInvoiceIndexQueryOptions = UseQueryOptions<ProformaInvoiceIndexPayload>;
type UseProformaInvoiceListQueryOptions = UseQueryOptions<ProformaInvoiceListPayload>;
type UseProformaInvoiceDetailsQueryOptions = UseQueryOptions<ProformaInvoiceDetailsPayload>;

interface QueryParams {
  page?: number;
  search?: {
    type?: string;
  };
  purchase_order_id?: number;
  logistic_order_id?: number;
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
    //const response = await Axios.get(`${url}${Object.keys(queryParams).length > 0 ? '?' : ''}${queryString}`);
    const response = await Axios.get(`${url}?${queryString}`);
    console.log(response)
    return parser().parse(response.data);
  } catch (error) {
    console.error('API call failed', error);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

export const useProformaInvoiceIndex = (
  queryParams?: QueryParams,
  queryOptions: UseProformaInvoiceIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['proformaInvoiceIndex', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.index.proforma_invoice,
        zProformaInvoiceIndexPayload,
        queryParams
      ),
    enabled: !!queryParams,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useProformaInvoiceList = (
  queryParams?: QueryParams,
  queryOptions: UseProformaInvoiceListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['proformaInvoiceList', queryParams],
    queryFn: () =>
      fetchData(endPoints.list.purchase_request, zProformaInvoiceListPayload, queryParams),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useProformaInvoiceDetails = (
  id: number,
  queryOptions: UseProformaInvoiceDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['proformaInvoiceDetails', id],
    queryFn: () =>
      fetchData(
        endPoints.info.proforma_invoice.replace(':id', id),
        zProformaInvoiceDetailsPayload
      ),
    enabled: !!id,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

type ProformaInvoiceMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useProformaInvoiceMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: ProformaInvoiceMutationConfig<T, Variables>
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

type useCreateProformaInvoiceBody = {
  invoice_number: string;
  purchase_order_id?: number;
  logistic_order_id?: number;
  payment_term_id: number;
  customer_bank_id: number;
  due_date: string;
  invoice_amount: string;
  invoice_date: string;
  narration?: string;
  file?: string;
};

export const useCreateProformaInvoice = (
  config: ProformaInvoiceMutationConfig<CreateProformaInvoicePayload, useCreateProformaInvoiceBody> = {}
) => {
  const queryClient = useQueryClient();

  return useProformaInvoiceMutation(
    endPoints.create.proforma_invoice,
    zCreateProformaInvoicePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('proformaInvoiceIndex');
          queryClient.invalidateQueries('proformaInvoiceList');
          queryClient.invalidateQueries('proformaInvoiceDetails');
          queryClient.invalidateQueries('proformaInvoiceLogList');
        }
      },
    }
  );
};

const useProformaInvoicePutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: ProformaInvoiceMutationConfig<T, Variables>
) => {
  const queryClient = useQueryClient();
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
        queryClient.invalidateQueries('proformaInvoiceIndex');
        queryClient.invalidateQueries('proformaInvoiceList');
        queryClient.invalidateQueries('proformaInvoiceDetails');
        queryClient.invalidateQueries('proformaInvoiceLogList');
      },
    }
  );
};

interface UpdateProformaInvoiceVariables {
  id: number;
  invoice_number: string;
  purchase_order_id?: number;
  logistic_order_id?: number;
  payment_term_id: number;
  customer_bank_id: number;
  due_date: string;
  invoice_amount: string;
  invoice_date: string;
  narration?: string;
  file?: string;
}

export const useUpdateProformaInvoice = (
  config: ProformaInvoiceMutationConfig<
    CreateProformaInvoicePayload,
    Omit<UpdateProformaInvoiceVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useProformaInvoicePutMutation<CreateProformaInvoicePayload, UpdateProformaInvoiceVariables>(
    ({ id }) => endPoints.update.proforma_invoice.replace(':id', id),
    zCreateProformaInvoicePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('proformaInvoiceIndex');
          queryClient.invalidateQueries('proformaInvoiceList');
          queryClient.invalidateQueries('proformaInvoiceDetails');
          queryClient.invalidateQueries('proformaInvoiceLogList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};


type useGetListProformaInvoiceByOrderIDQueryOptions = UseQueryOptions<ListProformaInvoiceByOrderIDPayload>;
export const useGetProformaInvoiceListByOrderID = (
  queryParams: QueryParams,
  queryOptions: useGetListProformaInvoiceByOrderIDQueryOptions = {}
) =>
  useQuery({
    queryKey: ['proformaInvoiceListByOrderID', queryParams],
    queryFn: () =>
    fetchData(endPoints.others.proforma_invoice_by_order_id , zListProformaInvoiceByOrderIDPayload, queryParams),
    enabled: !!queryParams && ((queryParams.purchase_order_id ?? 0) > 0 || (queryParams.logistic_order_id ?? 0) > 0),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });
