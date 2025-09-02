import { UseQueryOptions, useQuery, useQueryClient } from 'react-query';

import {
  CreatePayload,
  IndexPayload,
  ListPayload,
  zCreatePayload,
  zIndexPayload,
  zListPayload,
  zDetailsPayload
} from './schema';
import {
  SubMasterMutationConfig,
  fetchData,
  useSubMasterMutation,
  useSubMasterPutMutation,
} from '../../submaster/service';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UseRoleListQueryOptions = UseQueryOptions<ListPayload>;
type UseRoleIndexQueryOptions = UseQueryOptions<IndexPayload>;
type UseDetailsQueryOptions = UseQueryOptions<IndexPayload>;
export const useRoleList = (queryOptions: UseRoleListQueryOptions = {}) =>
  useQuery({
    queryKey: 'userRoleList',
    queryFn: () => fetchData( endPoints.list.user_role, zListPayload),
    ...queryOptions,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

export const useRoleIndex = (queryOptions: UseRoleIndexQueryOptions = {}) =>
  useQuery({
    queryKey: 'userRoleIndex',
    queryFn: () => fetchData( endPoints.index.user_role, zIndexPayload),
    ...queryOptions,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  export const useRoleDetails = (
    id: number | string,
    queryOptions: UseDetailsQueryOptions = {}
  ) =>
    useQuery({
      queryKey: ['AdminDetails', id],
      queryFn: () =>
        fetchData(endPoints.info.user.replace(':id', id), zDetailsPayload),
      //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
      //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      enabled: !!id,
      ...queryOptions,
    });

export const useCreateRole = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
    }
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterMutation( endPoints.create.user_role, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
      }
    },
    // Add invalidation for related queries
    onSettled: () => {
      queryClient.invalidateQueries('userRoleList');
      queryClient.invalidateQueries('userRoleIndex');
    },
  });
};

interface UpdateRoleVariables {
  id: number; // Assuming id is a number
  name: string;
}

export const useUpdateRole = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdateRoleVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdateRoleVariables>(
    ({ id }) => endPoints.update.user_role.replace(":id", id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
      // Add invalidation for related queries
      onSettled: () => {
        queryClient.invalidateQueries('userRoleList');
        queryClient.invalidateQueries('userRoleIndex');
      },
    }
  );
};
