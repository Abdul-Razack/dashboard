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

type UseSpareTypeListQueryOptions = UseQueryOptions<ListPayload>;
type UseSpareTypeIndexQueryOptions = UseQueryOptions<IndexPayload>;

export const useSpareTypeList = (
  queryOptions: UseSpareTypeListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'spareTypeList',
    queryFn: () => fetchData(endPoints.list.spare_type, zListPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useSpareTypeIndex = (
  queryOptions: UseSpareTypeIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: 'spareTypeIndex',
    queryFn: () => fetchData(endPoints.index.spare_type, zIndexPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useCreateSpareType = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
    }
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterMutation(endPoints.create.spare_type, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('spareTypeIndex');
        queryClient.invalidateQueries('spareTypeList');
      }
    },
  });
};

interface UpdateSpareTypeVariables {
  id: number; // Assuming id is a number
  name: string;
}

export const useUpdateSpareType = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdateSpareTypeVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdateSpareTypeVariables>(
    ({ id }) => endPoints.update.spare_type.replace(":id", id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('spareTypeIndex');
          queryClient.invalidateQueries('spareTypeList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
