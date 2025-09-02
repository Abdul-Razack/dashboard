import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  BankDetailsPayload,
  BankIndexPayload,
  BankListPayload,
  CreateMasterBankPayload,
  CreateMasterBankBulkPayload,
  zBankListPayload,
  zBankDetailsPayload,
  zBankIndexPayload,
  zCreateMasterBankPayload,
  zCreateMasterBankBulkPayload

} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};
type UseBankIndexQueryOptions = UseQueryOptions<BankIndexPayload>;
type UseBankListQueryOptions = UseQueryOptions<BankListPayload>;
type UseBankDetailsQueryOptions = UseQueryOptions<BankDetailsPayload>;

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

export const useBankList = (queryOptions: UseBankListQueryOptions = {}) =>
  useQuery({
    queryKey: 'bankList',
    queryFn: () => fetchData(endPoints.list.customer_bank, zBankListPayload),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useBankDetails = (
  id: number,
  queryOptions: UseBankDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['bankDetails', id],
    queryFn: () => fetchData(endPoints.info.customer_bank.replace(':id', id), zBankDetailsPayload),
    enabled: !!id,
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useBankIndex = (
  queryParams?: QueryParams,
  queryOptions: UseBankIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['bankIndex', queryParams],
    queryFn: () => fetchData(endPoints.index.customer_bank, zBankIndexPayload, queryParams),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!queryParams,
    ...queryOptions,
  });

type BankMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useBankMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: BankMutationConfig<T, Variables>
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

type useCreateMasterBankBody = {
  customer_id: number;
  beneficiary_name: string;
  bank_name: string;
  bank_address: string;
  bank_address_line2: string;
  bank_branch: string;
  bank_ac_iban_no: string;
  type_of_ac: string;
  bank_swift: string;
  aba_routing_no?: string;
  contact_name: string;
  bank_phone?: string;
  bank_fax?: string;
  bank_mobile?: string;
  bank_email?: string;
};

export const useCreateMasterBank = (
  config: BankMutationConfig<
    CreateMasterBankPayload,
    useCreateMasterBankBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useBankMutation(endPoints.create.customer_bank,
    zCreateMasterBankPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('bankList');
          queryClient.invalidateQueries('bankDetails');
          queryClient.invalidateQueries('bankIndex');
        }
      },
    }
  );
};

const useBankPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: BankMutationConfig<T, Variables>
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

interface UpdateBankVariables {
  id: number;
  beneficiary_name: string;
  bank_name: string;
  bank_address: string;
  bank_address_line2: string;
  bank_branch: string;
  bank_ac_iban_no: string;
  type_of_ac: string;
  bank_swift: string;
  aba_routing_no?: string;
  contact_name: string;
  bank_phone?: string;
  bank_fax?: string;
  bank_mobile?: string;
  bank_email?: string;
}

export const useUpdateMasterBank = (
  config: BankMutationConfig<
    CreateMasterBankPayload,
    Omit<UpdateBankVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useBankPutMutation<CreateMasterBankPayload, UpdateBankVariables>(
    ({ id }) => endPoints.update.customer_bank.replace(':id', id),
    zCreateMasterBankPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('bankList');
          queryClient.invalidateQueries('bankDetails');
          queryClient.invalidateQueries('bankIndex');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};

type UseCreateMasterBankBulkBody = useCreateMasterBankBody[];
   
type MasterBankBlukMutationConfig<T, Variables> = UseMutationOptions<
T,
AxiosError<T>,
Variables
>;

const useMasterBankBlukMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: MasterBankBlukMutationConfig<T, Variables>
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

export const useCreateMasterBankBluk = (
  config: MasterBankBlukMutationConfig<
    CreateMasterBankBulkPayload,
    UseCreateMasterBankBulkBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useMasterBankBlukMutation(endPoints.others.upload_customer_bank_bulk ,
    zCreateMasterBankBulkPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('CreateMasterBankBulk');
        }
      },
    }
  );
};
