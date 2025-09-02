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

type UseSpareClassListQueryOptions = UseQueryOptions<ListPayload>;
type UseSpareClassIndexQueryOptions = UseQueryOptions<IndexPayload>;

export const useSpareClassList = (
  queryOptions: UseSpareClassListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'spareClassList',
    queryFn: () => fetchData(endPoints.list.spare_class, zListPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useSpareClassIndex = (
  queryOptions: UseSpareClassIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: 'spareClassIndex',
    queryFn: () => fetchData(endPoints.index.spare_class, zIndexPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useCreateSpareClass = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
    }
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterMutation(endPoints.create.spare_class, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('spareClassIndex');
        queryClient.invalidateQueries('spareClassList');
      }
    },
  });
};

interface UpdateSpareClassVariables {
  id: number; // Assuming id is a number
  name: string;
}

export const useUpdateSpareClass = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdateSpareClassVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdateSpareClassVariables>(
    ({ id }) => endPoints.update.spare_class.replace(":id", id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('spareClassIndex');
          queryClient.invalidateQueries('spareClassList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
