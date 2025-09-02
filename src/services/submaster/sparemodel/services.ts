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

type UseSpareModelListQueryOptions = UseQueryOptions<ListPayload>;
type UseSpareModelIndexQueryOptions = UseQueryOptions<IndexPayload>;

export const useSpareModelList = (
  queryOptions: UseSpareModelListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'spareModelList',
    queryFn: () => fetchData( endPoints.list.spare_model, zListPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useSpareModelIndex = (
  queryOptions: UseSpareModelIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: 'spareModelIndex',
    queryFn: () => fetchData( endPoints.index.spare_model, zIndexPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useCreateSpareModel = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
    }
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterMutation( endPoints.create.spare_model, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('spareModelIndex');
        queryClient.invalidateQueries('spareModelList');
      }
    },
  });
};

interface UpdateSpareModelVariables {
  id: number; // Assuming id is a number
  name: string;
}

export const useUpdateSpareModel = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdateSpareModelVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdateSpareModelVariables>(
    ({ id }) => endPoints.update.spare_model.replace(":id", id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('spareModelIndex');
          queryClient.invalidateQueries('spareModelList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
