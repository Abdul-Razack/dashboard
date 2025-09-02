import { UseQueryOptions, useQuery, useQueryClient } from 'react-query';

import {
  CreatePayload,
  ListPayload,
  ShipACIndexPayload,
  zCreatePayload,
  zListPayload,
  zShipACIndexPayload,
} from '../schema';

import {
  SubMasterMutationConfig,
  fetchData,
  useSubMasterMutation,
  useSubMasterPutMutation,
} from '../service';


const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UseShipAccountListQueryOptions = UseQueryOptions<ListPayload>;
type UseShipAccountIndexQueryOptions = UseQueryOptions<ShipACIndexPayload>;

export const useShipAccountList = (
  queryOptions: UseShipAccountListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'shipAccountList',
    queryFn: () => fetchData(endPoints.list.ship_account, zListPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useShipAccountIndex = (
  queryOptions: UseShipAccountIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: 'shipAccountIndex',
    queryFn: () => fetchData(endPoints.index.ship_account, zShipACIndexPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useCreateShipAccount = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
      account_number: number;
    }
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterMutation(endPoints.create.ship_account, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('shipAccountIndex');
        queryClient.invalidateQueries('shipAccountList');
      }
    },
  });
};

interface UpdateShipAccountVariables {
  id: number; // Assuming id is a number
  name: string;
  account_number: number;
}

export const useUpdateShipAccount = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdateShipAccountVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdateShipAccountVariables>(
    ({ id }) => endPoints.update.ship_account.replace(":id", id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('shipAccountIndex');
          queryClient.invalidateQueries('shipAccountList');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
