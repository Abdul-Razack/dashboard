import { UseQueryOptions, useQuery, useQueryClient } from 'react-query';

import {
  CreatePayload,
  IndexPayload,
  ListPayload,
  zCreatePayload,
  zIndexPayload,
  zListPayload,
} from '../schema';
import {
  SubMasterMutationConfig,
  fetchData,
  useSubMasterMutation,
  useSubMasterPutMutation,
} from '../service';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UsePaymentModeListQueryOptions = UseQueryOptions<ListPayload>;
type UsePaymentModeIndexQueryOptions = UseQueryOptions<IndexPayload>;

export const usePaymentModeList = (
  queryOptions: UsePaymentModeListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'paymentModeList',
    queryFn: () => fetchData(endPoints.list.payment_mode, zListPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const usePaymentModeIndex = (
  queryOptions: UsePaymentModeIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: 'paymentModeIndex',
    queryFn: () => fetchData(endPoints.index.payment_mode, zIndexPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useCreatePaymentMode = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
    }
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterMutation(endPoints.create.payment_mode, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
      }
    },
    onSettled: (data, error, variables, context) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries('paymentModeList');
      queryClient.invalidateQueries('paymentModeIndex');
      config?.onSettled?.(data, error, variables, context);
    },
  });
};

interface UpdatePaymentModeVariables {
  id: number; // Assuming id is a number
  name: string;
}

export const useUpdatePaymentMode = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdatePaymentModeVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdatePaymentModeVariables>(
    ({ id }) => endPoints.update.payment_mode.replace(":id", id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
        }
      },
      onSettled: (data, error, variables, context) => {
        // Invalidate and refetch related queries
        queryClient.invalidateQueries('paymentModeList');
        queryClient.invalidateQueries('paymentModeIndex');
        config?.onSettled?.(data, error, variables, context);
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
