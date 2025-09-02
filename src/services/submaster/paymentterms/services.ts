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

type UsePaymentTermsListQueryOptions = UseQueryOptions<ListPayload>;
type UsePaymentTermsIndexQueryOptions = UseQueryOptions<IndexPayload>;

export const usePaymentTermsList = (
  queryOptions: UsePaymentTermsListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'paymentTermsList',
    queryFn: () => fetchData(endPoints.list.payment_term, zListPayload),
    ...queryOptions,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

export const usePaymentTermsIndex = (
  queryOptions: UsePaymentTermsIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: 'paymentTermsIndex',
    queryFn: () => fetchData(endPoints.index.payment_term, zIndexPayload),
    ...queryOptions,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

export const useCreatePaymentTerms = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
     
    }
  > = {}
) => {
  const queryClient = useQueryClient();
  return useSubMasterMutation(endPoints.create.payment_term, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        queryClient.invalidateQueries('paymentTermsList');
        queryClient.invalidateQueries('paymentTermsIndex');
        config?.onSuccess?.(data, ...args);
      }
    },
  });
};

interface UpdatePaymentTermsVariables {
  id: number; // Assuming id is a number
  name: string;
 
}

export const useUpdatePaymentTerms = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdatePaymentTermsVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdatePaymentTermsVariables>(
    ({ id }) => endPoints.update.payment_term.replace(":id", id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('paymentTermsList');
          queryClient.invalidateQueries('paymentTermsIndex');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
