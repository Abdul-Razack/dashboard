import { UseQueryOptions, useQuery, useQueryClient } from 'react-query';

import {
  CreatePayload,
  DepartmentIndexPayload,
  ListPayload,
  zCreatePayload,
  zDepartmentIndexPayload,
  zListPayload,
} from '../../submaster/schema';
import {
  SubMasterMutationConfig,
  fetchData,
  useSubMasterMutation,
  useSubMasterPutMutation,
} from '../../submaster/service';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UseDepartmentListQueryOptions = UseQueryOptions<ListPayload>;
type UseDepartmentIndexQueryOptions = UseQueryOptions<DepartmentIndexPayload>;

export const useDepartmentList = (queryOptions: UseDepartmentListQueryOptions = {}) =>
  useQuery({
    queryKey: 'departmentList',
    queryFn: () => fetchData( endPoints.list.department, zListPayload),
    ...queryOptions,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

export const useDepartmentIndex = (queryOptions: UseDepartmentIndexQueryOptions = {}) =>
  useQuery({
    queryKey: 'departmentIndex',
    queryFn: () => fetchData( endPoints.index.department, zDepartmentIndexPayload),
    ...queryOptions,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

export const useCreateDepartment = (
  config: SubMasterMutationConfig<
    CreatePayload,
    {
      name: string;
      emails: string;
    }
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterMutation( endPoints.create.department, zCreatePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
      }
    },
    // Add invalidation for related queries
    onSettled: () => {
      queryClient.invalidateQueries('departmentList');
      queryClient.invalidateQueries('departmentIndex');
    },
  });
};

interface UpdateDepartmentVariables {
  id: number; // Assuming id is a number
  name: string;
  emails: string;
}

export const useUpdateDepartment = (
  config: SubMasterMutationConfig<
    CreatePayload,
    Omit<UpdateDepartmentVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();

  return useSubMasterPutMutation<CreatePayload, UpdateDepartmentVariables>(
    ({ id }) => endPoints.update.department.replace(":id", id),
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
        queryClient.invalidateQueries('departmentList');
        queryClient.invalidateQueries('departmentIndex');
      },
    }
  );
};
