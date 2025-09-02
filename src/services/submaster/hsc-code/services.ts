import { UseQueryOptions, useQuery, useQueryClient } from 'react-query';

import {
  CreatePayload,
  IndexPayload,
  ListPayload,
  DetailsPayload,
  zCreatePayload,
  zIndexPayload,
  zListPayload,
  zDetailsPayload
} from '../schema';
import {
  SubMasterMutationConfig,
  fetchData,
  useSubMasterMutation,
  useSubMasterPutMutation,
} from '../service';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type UseHscCodeListQueryOptions = UseQueryOptions<ListPayload>;
type UseHscCodeIndexQueryOptions = UseQueryOptions<IndexPayload>;
type UseHscCodeDetailQueryOptions = UseQueryOptions<DetailsPayload>;

export const useHscCodeList = (queryOptions: UseHscCodeListQueryOptions = {}) =>
  useQuery({
    queryKey: 'hscCodeList',
    queryFn: () => fetchData(endPoints.list.hsc_code, zListPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useHscCodeIndex = (
  queryOptions: UseHscCodeIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: 'hscCodeIndex',
    queryFn: () => fetchData(endPoints.index.hsc_code, zIndexPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

    export const useHscCodeDetails = (
      id: number | string,
      queryOptions: UseHscCodeDetailQueryOptions = {}
    ) =>
      useQuery({
        queryKey: ['unDetails', id],
        queryFn: () => fetchData(endPoints.info.un.replace(":id", id), zDetailsPayload),
        //staleTime: 5 * 60 * 1000, // 5 minutes
        //cacheTime: 10 * 60 * 1000, // 10 minutes
        enabled: !!id,
        retry: 2,
        refetchOnWindowFocus: false,
        ...queryOptions,
      });


export const useCreateHscCode = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
    }
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterMutation(
    endPoints.create.hsc_code,
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('hscCodeIndex');
          queryClient.invalidateQueries('hscCodeList');
        }
      },
    }
  );
};

interface UpdateHscCodeVariables {
  id: number; // Assuming id is a number
  name: string;
}

export const useUpdateHscCode = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdateHscCodeVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdateHscCodeVariables>(
    ({ id }) => endPoints.update.hsc_code.replace(':id', id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('hscCodeIndex');
          queryClient.invalidateQueries('hscCodeList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
