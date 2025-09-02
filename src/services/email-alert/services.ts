import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';

import {
  ResendPayload,
  UpdatePayload,
  EmailAlertIndexPayload,
  zResendPayload,
  zUpdatePayload,
  zEmailAlertIndexPayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type UseEmailAlertIndexQueryOptions = UseQueryOptions<EmailAlertIndexPayload>;

interface QueryParams {
  page?: number;
}

type MutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

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

export const useEmailAlertIndex = (
  queryParams?: QueryParams,
  queryOptions: UseEmailAlertIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['emailAlertIndex', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.index.email_alert,
        zEmailAlertIndexPayload,
        queryParams
      ),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    enabled: !!queryParams,
    ...queryOptions,
  });

interface UpdateParams {
  id: number;
  subject: string;
  department_ids: Array<number>;
}

const usePRPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: MutationConfig<T, Variables>
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
        queryClient.invalidateQueries('emailAlertIndex');
      },
    }
  );
};

interface ResendParams {
  email_type: string;
  rfq_id?: number;
  purchase_order_id?: number;
  customer_contact_manager_ids?: Array<number>;
}



export type EmailAlertMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

export const useEmailAlertMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: EmailAlertMutationConfig<T, Variables>
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


export const useResendEmailAlert = (
  config: EmailAlertMutationConfig<ResendPayload, ResendParams> = {}
) => {
  const queryClient = useQueryClient();
  return useEmailAlertMutation( endPoints.others.email_alert_resend, zResendPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        queryClient.invalidateQueries('emailAlertIndex');
        config?.onSuccess?.(data, ...args);
      }
    },
  });
};


export const useUpdateEmailAlert = (
  config: MutationConfig<UpdatePayload, Omit<UpdateParams, 'id'>> = {}
) => {
  const queryClient = useQueryClient();
  return usePRPutMutation<UpdatePayload, UpdateParams>(
    ({ id }) => endPoints.update.email_alert.replace(':id', id),
    zUpdatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('prIndex');
          queryClient.invalidateQueries('prList');
          queryClient.invalidateQueries('prDetails');
          queryClient.invalidateQueries('prLogList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
