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

type UseShipModesListQueryOptions = UseQueryOptions<ListPayload>;
type UseShipModesIndexQueryOptions = UseQueryOptions<IndexPayload>;

export const useShipModesList = (
  queryOptions: UseShipModesListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'shipModesList',
    queryFn: () => fetchData(endPoints.list.ship_mode, zListPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useShipModesIndex = (
  queryOptions: UseShipModesIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: 'shipModesIndex',
    queryFn: () => fetchData(endPoints.index.ship_mode, zIndexPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useCreateShipModes = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
    }
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterMutation(endPoints.create.ship_mode, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('shipModesIndex');
        queryClient.invalidateQueries('shipModesList');
      }
    },
  });
};

interface UpdateShipModesVariables {
  id: number; // Assuming id is a number
  name: string;
}

export const useUpdateShipModes = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdateShipModesVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdateShipModesVariables>(
    ({ id }) => endPoints.update.ship_mode.replace(":id", id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('shipModesIndex');
          queryClient.invalidateQueries('shipModesList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
