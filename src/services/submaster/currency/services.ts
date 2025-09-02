import { UseQueryOptions, useQuery, useQueryClient } from 'react-query';

import {
  CreatePayload,
  ListPayload,
  zCreatePayload,
  zListPayload,
} from '../schema';
import {
  SubMasterMutationConfig,
  fetchData,
  useSubMasterMutation,
  useSubMasterPutMutation,
} from '../service';
import { CurrencyIndexPayload, zCurrencyIndexPayload } from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UseCurrencyListQueryOptions = UseQueryOptions<ListPayload>;
type UseCurrencyIndexQueryOptions = UseQueryOptions<CurrencyIndexPayload>;

export const useCurrencyList = (
  queryOptions: UseCurrencyListQueryOptions = {}
) =>
  useQuery({
    queryKey: 'currencyList',
    queryFn: () => fetchData(endPoints.list.currency, zListPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useCurrencyIndex = (
  queryOptions: UseCurrencyIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: 'currencyIndex',
    queryFn: () => fetchData(endPoints.index.currency, zCurrencyIndexPayload),
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    retry: 2,
    refetchOnWindowFocus: false,
    ...queryOptions,
  });

export const useCreateCurrency = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
      code: string;
    }
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterMutation(endPoints.create.currency, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        queryClient.invalidateQueries('currencyList');
        queryClient.invalidateQueries('currencyIndex');
        config?.onSuccess?.(data, ...args);
      }
    },
  });
};

interface UpdateCurrencyVariables {
  id: number; // Assuming id is a number
  name: string;
  code: string;
}

export const useUpdateCurrency = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdateCurrencyVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdateCurrencyVariables>(
    ({ id }) => endPoints.update.currency.replace(":id", id),
    zCreatePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          queryClient.invalidateQueries('currencyList');
          queryClient.invalidateQueries('currencyIndex');
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
