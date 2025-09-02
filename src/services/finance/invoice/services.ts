import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  CreateInvoicePayload,
  InvoiceDetailsPayload,
  InvoiceIndexPayload,
  InvoiceListPayload,
  ListInvoiceByOrderIDPayload,
  zCreateInvoicePayload,
  zInvoiceDetailsPayload,
  zInvoiceIndexPayload,
  zInvoiceListPayload,
  zListInvoiceByOrderIDPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type UseInvoiceIndexQueryOptions = UseQueryOptions<InvoiceIndexPayload>;
type UseInvoiceListQueryOptions = UseQueryOptions<InvoiceListPayload>;
type UseInvoiceDetailsQueryOptions = UseQueryOptions<InvoiceDetailsPayload>;

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
    return parser().parse(response.data);
  } catch (error) {
    console.error('API call failed', error);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

export const useInvoiceIndex = (
  queryParams?: QueryParams,
  queryOptions: UseInvoiceIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['invoiceIndex', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.index.invoice,
        zInvoiceIndexPayload,
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

export const useInvoiceList = (
  queryParams?: QueryParams,
  queryOptions: UseInvoiceListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['invoiceList', queryParams],
    queryFn: () =>
      fetchData(endPoints.list.purchase_request, zInvoiceListPayload, queryParams),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

export const useInvoiceDetails = (
  id: number,
  queryOptions: UseInvoiceDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['invoiceDetails', id],
    queryFn: () =>
      fetchData(
        endPoints.info.invoice.replace(':id', id),
        zInvoiceDetailsPayload
      ),
    enabled: !!id,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });

type InvoiceMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useInvoiceMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: InvoiceMutationConfig<T, Variables>
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

type useCreateInvoiceBody = {
  purchase_order_id?: number;
  logistic_order_id?: number;
  payment_term_id: number;
  currency_id: number;
  customer_bank_id: number;
  invoice_type: string;
  invoice_amount: string;
  payment_done_date: string;
  payment_done_by: string;
  remarks?: string;
  file?: string;
  tax_invoice_date: string;
  tax_invoice_no: string;
};

export const useCreateInvoice = (
  config: InvoiceMutationConfig<CreateInvoicePayload, useCreateInvoiceBody> = {}
) => {
  const queryClient = useQueryClient();

  return useInvoiceMutation(
    endPoints.create.invoice,
    zCreateInvoicePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('invoiceIndex');
          queryClient.invalidateQueries('invoiceList');
          queryClient.invalidateQueries('invoiceDetails');
          queryClient.invalidateQueries('invoiceLogList');
        }
      },
    }
  );
};

const useInvoicePutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: InvoiceMutationConfig<T, Variables>
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
        queryClient.invalidateQueries('invoiceIndex');
        queryClient.invalidateQueries('invoiceList');
        queryClient.invalidateQueries('invoiceDetails');
        queryClient.invalidateQueries('invoiceLogList');
      },
    }
  );
};

interface updateItem {
  id: number;
  invoice_number: string;
  invoice_date: string;
  invoice_value: number;
  due_date: string;
  payment_term_id: number;
  narration?: string;
};

interface UpdateInvoiceVariables {
  id: number;
  type: string;
  purchase_order_id?: number;
  logistic_order_id?: number;
  date: string;
  remarks?: string;
  items: updateItem[];
}

export const useUpdateInvoice = (
  config: InvoiceMutationConfig<
    CreateInvoicePayload,
    Omit<UpdateInvoiceVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useInvoicePutMutation<CreateInvoicePayload, UpdateInvoiceVariables>(
    ({ id }) => endPoints.update.invoice.replace(':id', id),
    zCreateInvoicePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('invoiceIndex');
          queryClient.invalidateQueries('invoiceList');
          queryClient.invalidateQueries('invoiceDetails');
          queryClient.invalidateQueries('invoiceLogList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};


type useGetListInvoiceByOrderIDQueryOptions = UseQueryOptions<ListInvoiceByOrderIDPayload>;
export const useGetInvoiceListByOrderID = (
  queryParams: QueryParams,
  queryOptions: useGetListInvoiceByOrderIDQueryOptions = {}
) =>
  useQuery({
    queryKey: ['invoiceListByOrderID', queryParams],
    queryFn: () =>
    fetchData(endPoints.others.invoice_by_order_id , zListInvoiceByOrderIDPayload, queryParams),
    enabled: !!queryParams && ((queryParams.purchase_order_id ?? 0) > 0 || (queryParams.logistic_order_id ?? 0) > 0),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });
