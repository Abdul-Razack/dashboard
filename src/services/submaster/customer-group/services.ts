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

type UseCustomerGroupListQueryOptions = UseQueryOptions<ListPayload>;
type UseCustomerGroupIndexQueryOptions = UseQueryOptions<IndexPayload>;

export const useCustomerGroupList = (
  queryOptions: UseCustomerGroupListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'customerGroupList',
    queryFn: () => fetchData( endPoints.list.customer_group , zListPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
    onError: (error) => {
      console.error('Error fetching bin location list:', error);
      queryOptions.onError?.(error);
    },
  });

export const useCustomerGroupIndex = (
  queryOptions: UseCustomerGroupIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: 'customerGroupIndex',
    queryFn: () => fetchData( endPoints.index.customer_group, zIndexPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
    onError: (error) => {
      console.error('Error fetching bin location list:', error);
      queryOptions.onError?.(error);
    },
  });

export const useCreateCustomerGroup = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
    }
  > = {}
) => {
  const queryClient = useQueryClient();
  return useSubMasterMutation( endPoints.create.customer_group, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        queryClient.invalidateQueries('customerGroupList');
        queryClient.invalidateQueries('customerGroupIndex');
        config?.onSuccess?.(data, ...args);
      }
    },
  });
};

interface UpdateCustomerGroupVariables {
  id: number; // Assuming id is a number
  name: string;
}

export const useUpdateCustomerGroup = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdateCustomerGroupVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdateCustomerGroupVariables>(
    ({ id }) => endPoints.update.customer_group.replace(":id", id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          queryClient.invalidateQueries('customerGroupList');
          queryClient.invalidateQueries('customerGroupIndex');
          config?.onSuccess?.(data, ...args);
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
