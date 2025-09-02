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

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UseModeOfReceiptListQueryOptions = UseQueryOptions<ListPayload>;
type UseModeOfReceiptIndexQueryOptions = UseQueryOptions<IndexPayload>;
type UseModeOfReceiptDetailQueryOptions = UseQueryOptions<DetailsPayload>;

export const useModeOfReceiptList = (
    queryOptions: UseModeOfReceiptListQueryOptions = {}
  ) =>
    useQuery({
      queryKey: 'modeOfReceiptList',
      queryFn: () => fetchData( endPoints.list.mode_of_receipt , zListPayload),
      ...queryOptions,
      //staleTime: 5 * 60 * 1000, // 5 minutes
      //cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    });

export const useModeOfReceiptIndex = (
      queryOptions: UseModeOfReceiptIndexQueryOptions = {}
    ) =>
      useQuery({
        queryKey: 'modeOfReceiptIndex',
        queryFn: () => fetchData(endPoints.index.mode_of_receipt, zIndexPayload),
        //staleTime: 5 * 60 * 1000, // 5 minutes
        //cacheTime: 10 * 60 * 1000, // 10 minutes
        retry: 2,
        refetchOnWindowFocus: false,
        ...queryOptions,
      });

export const useHscCodeDetails = (
        id: number | string,
        queryOptions: UseModeOfReceiptDetailQueryOptions = {}
      ) =>
        useQuery({
          queryKey: ['modeOfReceiptDetails', id],
          queryFn: () => fetchData(endPoints.info.mode_of_receipt.replace(":id", id), zDetailsPayload),
          //staleTime: 5 * 60 * 1000, // 5 minutes
          //cacheTime: 10 * 60 * 1000, // 10 minutes
          enabled: !!id,
          retry: 2,
          refetchOnWindowFocus: false,
          ...queryOptions,
        });


      export const useCreateModeOfReceipt = (
        config: SubMasterMutationConfig<
          CreatePayload,
          {
            name: string;
          }
        > = {}
      ) => {
        const queryClient = useQueryClient();
      
        return useSubMasterMutation(
          endPoints.create.mode_of_receipt,
          zCreatePayload().parse,
          {
            ...config,
            onSuccess: (data, ...args) => {
              if (data.status) {
                config?.onSuccess?.(data, ...args);
                queryClient.invalidateQueries('modeOfReceiptIndex');
                queryClient.invalidateQueries('modeOfReceiptList');
              }
            },
          }
        );
      };
      
      interface UpdateModeOfReceiptVariables {
        id: number; // Assuming id is a number
        name: string;
      }
      
      export const useUpdateModeOfReceipt = (
        config: SubMasterMutationConfig<
          CreatePayload,
          Omit<UpdateModeOfReceiptVariables, 'id'>
        > = {}
      ) => {
        const queryClient = useQueryClient();
      
        return useSubMasterPutMutation<CreatePayload, UpdateModeOfReceiptVariables>(
          ({ id }) => endPoints.update.mode_of_receipt.replace(':id', id),
          zCreatePayload().parse,
          {
            ...config,
            onSuccess: (data, ...args) => {
              if (data.status) {
                config?.onSuccess?.(data, ...args);
                queryClient.invalidateQueries('modeOfReceiptIndex');
                queryClient.invalidateQueries('modeOfReceiptList');
              }
            },
            onMutate: async (variables) => {
              const { id, ...rest } = variables;
              return rest; // Return variables excluding 'id'
            },
          }
        );
      };