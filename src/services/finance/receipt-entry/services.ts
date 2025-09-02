import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  useQuery
} from 'react-query';

import {
    CreateReceiptEntryPayload,
    GetTotalAmountyPayload,
    zCreateReceiptEntryPayload,
    zGetTotalAmountyPayload
} from './schema';


const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

interface QueryParams {
  proforma_invoice_id?: number;
  invoice_id?: number;
}

type useCreateReceiptEntryBody = {
    type: string,
    refer_type: string,
    customer_bank_id: number,
    payment_mode_id: number,
    invoice_id: number | null,
    performa_invoice_id: number | null,
    bank_receipt_number: string,
    payment_value: number,
    payment_receipt_file: string,
    payment_date: string,
    bank_id: number
};

type ReceiptEntryMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;


const useReceiptEntryMutation = <T, Variables>(
    endpoint: string,
    parseResponse: (data: TODO) => T,
    config: ReceiptEntryMutationConfig<T, Variables>
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

export const useCreateReceiptEntry = (
    config: ReceiptEntryMutationConfig<
      CreateReceiptEntryPayload,
      useCreateReceiptEntryBody
    > = {}
  ) => {
    const queryClient = useQueryClient();
    return useReceiptEntryMutation(endPoints.create.create_receipt_entry,
      zCreateReceiptEntryPayload().parse,
      {
        ...config,
        onSuccess: (data, ...args) => {
          if (data.status) {
            config?.onSuccess?.(data, ...args);
            queryClient.invalidateQueries('CreateReceiptEntry');
          }
        },
      }
    );
};

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

type UseGetTotalAmountOptions = UseQueryOptions<GetTotalAmountyPayload>;

export const useGetTotalAmount = (
  queryParams?: QueryParams,
  queryOptions: UseGetTotalAmountOptions = {}
) =>
  useQuery({
    queryKey: ['total_amount', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.others.get_total_amount,
        zGetTotalAmountyPayload,
        queryParams
      ),
      enabled: !!queryParams && ((queryParams?.proforma_invoice_id ?? 0) > 0 || (queryParams?.invoice_id ?? 0) > 0),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    ...queryOptions,
  });
