import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  UseQueryOptions,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from 'react-query';
import { ZodError } from 'zod';

import {
  CreateSparePayload,
  CreateBulkSparePayload,
  AssignAltSpareRespPayload,
  FindByPartNumberIdBulkPayload,
  FindByPartNumberIdPayload,
  PartNumberBySpareIdPayload,
  SearchPartNumberPayload,
  SpareDetailsPayload,
  SpareIndexPayload,
  SpareListPayload,
  UploadedPartsPayload,
  zCreateSparePayload,
  zBulkCreateSparePayload,
  zAssignAltSparePartsRespPayload,
  zFindByPartNumberIdBulkPayload,
  zFindByPartNumberIdPayload,
  zPartNumberBySpareIdPayload,
  zSearchPartNumberPayload,
  zSpareDetailsPayload,
  zSpareIndexPayload,
  zSpareListPayload,
  zUploadedPartsPayload
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

type UseSpareIndexQueryOptions = UseQueryOptions<SpareIndexPayload>;
type UseSpareListQueryOptions = UseQueryOptions<SpareListPayload>;
type UseSearchPartNumberQueryOptions = UseQueryOptions<SearchPartNumberPayload>;
type UseFindByPartNumberIdQueryOptions =
  UseQueryOptions<FindByPartNumberIdPayload>;
type UsePartNumberBySpareIdQueryOptions =
  UseQueryOptions<PartNumberBySpareIdPayload>;
type UseSpareDetailsQueryOptions = UseQueryOptions<SpareDetailsPayload>;
type UseFindByPartNumberIdBulkQueryOptions =
  UseQueryOptions<FindByPartNumberIdBulkPayload>;

interface QueryParams {
  page?: number;
  part_number?: string;
  description?: string;
  query?: string;
  part_number_id?: number[];
}

const fetchData = async (
  url: string,
  parser: TODO,
  queryParams: QueryParams = {}
) => {
  const queryString = new URLSearchParams();

  // Handling both top-level and nested 'search' parameters explicitly
  Object.entries(queryParams).forEach(([key, value]) => {
    if (typeof value === 'object' && value !== null) {
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue !== undefined && nestedValue !== null) {
          queryString.append(`search[${nestedKey}]`, nestedValue.toString());
        }
      });
    } else {
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString());
      }
    }
  });

  try {
    const response = await Axios.get(`${url}?${queryString}`);
    try {
      return parser().parse(response.data);
    } catch (zodError) {
      if (zodError instanceof ZodError) {
        console.error('Zod Validation Error:');
        zodError.issues.forEach((issue) => {
          console.error(`Path: ${issue.path.join('.')}`);
          console.error(`Code: ${issue.code}`);
          console.error(`Message: ${issue.message}`);
          if ('expected' in issue) console.error(`Expected: ${issue.expected}`);
          if ('received' in issue) console.error(`Received: ${issue.received}`);
        });
      }
      throw zodError;
    }
  } catch (error) {
    console.error('API call failed', error);
    throw error;
  }
};

const fetchData2 = async (url: string, schema: any, params?: any) => {
  const queryString = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .join(',');
  try {
    const response = await Axios.get(`${url}?${queryString}`);
    const data = response.data;
    return schema.parse(data);
  } catch (error) {
    console.error('API call failed', error);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

export const useSpareList = (queryOptions: UseSpareListQueryOptions = {}) =>
  useQuery({
    queryKey: 'spareList',
    queryFn: () => fetchData(endPoints.list.spare, zSpareListPayload),
    retry: 2,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    ...queryOptions,
  });

export const useSpareIndex = (
  queryParams?: QueryParams,
  queryOptions: UseSpareIndexQueryOptions = {}
) =>
  useQuery({
    queryKey: ['spareIndex', queryParams],
    queryFn: () =>
      fetchData(endPoints.index.spare, zSpareIndexPayload, queryParams),
    enabled: !!queryParams, // Only run query when queryParams are provided
    keepPreviousData: true, // Useful for pagination
    retry: 2,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    ...queryOptions,
  });

export const useSearchPartNumber = (
  queryParam?: QueryParams,
  queryOptions: UseSearchPartNumberQueryOptions = {}
) =>
  useQuery({
    queryKey: ['searchPartNumber', queryParam],
    queryFn: () =>
      fetchData(
        endPoints.search.spare_by_partnumber,
        zSearchPartNumberPayload,
        queryParam
      ),
    keepPreviousData: true,
    retry: 2,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    ...queryOptions,
  });

export const useFindByPartNumberId = (
  id: number | null,
  queryOptions: UseFindByPartNumberIdQueryOptions = {}
) =>
  useQuery({
    queryKey: ['findByPartNumberId', id],
    queryFn: () =>
      fetchData(
        endPoints.find.spare_by_partnumber.replace(':id', id),
        zFindByPartNumberIdPayload
      ),
    enabled: !!id, // Only run when id is provided
    retry: 2,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
    ...queryOptions,
  });

export const usePartNumberDetails = (
  partNumbers: number[],
  queryOptions: UseFindByPartNumberIdQueryOptions = {}
) => {
  const results = useQueries(
    partNumbers.map((partNumber) => {
      return {
        queryKey: ['partDetails', partNumber],
        queryFn: () =>
          fetchData(
            endPoints.find.spare_by_partnumber.replace(':id', partNumber),
            zFindByPartNumberIdPayload
          ),
        enabled: !!partNumber, // Only run when partNumber is provided
        retry: 2,
        refetchOnWindowFocus: false,
        //staleTime: 5 * 60 * 1000, // 5 minutes
        //cacheTime: 15 * 60 * 1000, // 15 minutes
        keepPreviousData: true,
        ...queryOptions,
      };
    })
  );
  const isLoading = results.some((result) => result.isLoading);
  const isError = results.some((result) => result.isError);
  const data = results.map((result) => result.data);
  return { data, isLoading, isError };
};

export const usePartNumberBySpareId = (
  id: number,
  queryOptions: UsePartNumberBySpareIdQueryOptions = {}
) =>
  useQuery({
    queryKey: ['partNumberBySpareId', id],
    queryFn: () =>
      fetchData(
        endPoints.search.partnumber_by_spare.replace(':id', id),
        zPartNumberBySpareIdPayload
      ),
    enabled: !!id, // Only run when id is provided
    retry: 2,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
    ...queryOptions,
  });

export const useSpareDetails = (
  id: number,
  queryOptions: UseSpareDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['spareDetails', id],
    queryFn: () =>
      fetchData(endPoints.info.spare.replace(':id', id), zSpareDetailsPayload),
    enabled: !!id, // Only run when id is provided
    retry: 2,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000, // 5 minutes
    //cacheTime: 15 * 60 * 1000, // 15 minutes
    keepPreviousData: true,
    ...queryOptions,
  });

    export const fetchSpareDetails = () => {
      const queryClient = useQueryClient();
      
      return async (id: number | string) => {
        if (!id || id === 0 || id === '0') return null;
        
        return queryClient.fetchQuery({
          queryKey: ['SpareDetails', id],
          queryFn: () => fetchData(
            endPoints.info.spare.replace(':id', id),
            zSpareDetailsPayload
          )
        });
      }
    }

type SpareMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useSpareMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: SpareMutationConfig<T, Variables>
) => {
  return useMutation(
    async (variables: Variables) => {
      const response = await Axios.post(endpoint, variables);
      return parseResponse(response.data);
    },
    {
      ...config,
      onSuccess: (data, ...args) => {
        config?.onSuccess?.(data, ...args);
      },
    }
  );
};

type useCreateSpareBody = {
  part_number: string;
  description: string;
  unit_of_measure_id: number;
  unit_of_measure_group_id?: number
  ata?: string;
  spare_type_id: number;
  spare_model_id: number;
  hsc_code_id: string;
  is_serialized: boolean;
  is_shelf_life: boolean;
  total_self_life?: number;
  is_llp: boolean;
  is_dg: boolean;
  un_id?: string;
  // spare_class_id?: number;
  msds?: string;
  ipc_ref?: string;
  xref?: string;
  picture?: string;
  remarks: string;
  manufacturer_name?: string;
  cage_code?: string;
};


type useCreateAltSpareBody = {
  part_number_id: number;
  alternate_part_number_id: number;
  remark: string;
};

export const useCreateSpare = (
  config: SpareMutationConfig<CreateSparePayload, useCreateSpareBody> = {}
) => {
  const queryClient = useQueryClient();
  return useSpareMutation(endPoints.create.spare, zCreateSparePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('spareList');
        queryClient.invalidateQueries('spareIndex');
      }
    },
  });
};

type uploadedPartNums = {
  part_numbers: string[];
};

export const checkUploadedPartNumbersExists = (
  config: SpareMutationConfig<UploadedPartsPayload, uploadedPartNums> = {}
) => {
  const queryClient = useQueryClient();
  return useSpareMutation(endPoints.others.check_part_number_exist, zUploadedPartsPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('spareList');
        queryClient.invalidateQueries('spareIndex');
      }
    },
  });
};

type useCreateBulkSpareBody = useCreateSpareBody[];

export const useBulkSpareUpload = (
  config: SpareMutationConfig<CreateBulkSparePayload, useCreateBulkSpareBody> = {}
) => {
  const queryClient = useQueryClient();
  return useSpareMutation(endPoints.create.spare_bulk, zBulkCreateSparePayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('spareList');
        queryClient.invalidateQueries('spareIndex');
      }
    },
  });
};


type useCreateAltSparePartsBody = useCreateAltSpareBody[];

export const useAssignAltParts = (
  config: SpareMutationConfig<AssignAltSpareRespPayload, useCreateAltSparePartsBody> = {}
) => {
  const queryClient = useQueryClient();
  return useSpareMutation(endPoints.create.spare_alt_parts, zAssignAltSparePartsRespPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
        queryClient.invalidateQueries('spareList');
        queryClient.invalidateQueries('spareIndex');
      }
    },
  });
};

const useSparePutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: SpareMutationConfig<T, Variables>
) => {
  return useMutation(
    async (variables: Variables) => {
      const url = endpoint(variables);
      const response = await Axios.put(url, variables);
      return parseResponse(response.data);
    },
    {
      ...config,
      onSuccess: (data, ...args) => {
        config?.onSuccess?.(data, ...args);
      },
    }
  );
};

interface UpdateSpareVariables {
  id: number;
  part_number: string;
  description: string;
  unit_of_measure_id: number;
  ata?: string;
  spare_type_id: number;
  spare_model_id: number;
  hsc_code_id: string;
  is_shelf_life: boolean;
  total_self_life?: number;
  is_llp: boolean;
  is_dg: boolean;
  un_id?: string;
  // spare_class_id?: number;
  msds?: string;
  ipc_ref?: string;
  xref?: string;
  picture?: string;
  remarks: string;
  manufacturer_name?: string;
  cage_code?: string;
}

export const useUpdateSpare = (
  config: SpareMutationConfig<
    CreateSparePayload,
    Omit<UpdateSpareVariables, 'id'>
  > = {}
) => {
  const queryClient = useQueryClient();
  return useSparePutMutation<CreateSparePayload, UpdateSpareVariables>(
    ({ id }) => endPoints.update.spare.replace(':id', id),
    zCreateSparePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('spareList');
          queryClient.invalidateQueries('spareIndex');
        }
      },
      onMutate: async (variables) => {
        const { id, ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};

export const useFindByPartNumberBulkId = (
  partNumberIds: number[],
  queryOptions: UseFindByPartNumberIdBulkQueryOptions = {}
) =>
  useQuery({
    queryKey: ['searchPartNumber', partNumberIds],
    queryFn: () =>
      fetchData2(
        endPoints.bulk.spare_by_part_number_id_bulk,
        zFindByPartNumberIdBulkPayload(),
        { part_number_id: partNumberIds.join(',') }
      ),
    enabled: partNumberIds?.[0] !== 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 5 * 60 * 1000,
    //cacheTime: 10 * 60 * 1000,
    retry: 2,
    ...queryOptions,
  });

    export const findBulkPartNumbersbyId = () => {
      const queryClient = useQueryClient();
      
      return async (partNumberIds: any,queryOptions: UseFindByPartNumberIdBulkQueryOptions = {}) => {
        if (!partNumberIds || partNumberIds.length === 0 ) return null;
        
        return queryClient.fetchQuery({
          queryKey: ['findBulkPartNumbersbyId', partNumberIds],
          queryFn: () => fetchData2(
            endPoints.bulk.spare_by_part_number_id_bulk,
            zFindByPartNumberIdBulkPayload(),
            { part_number_id: partNumberIds.join(',') }
          ),
          keepPreviousData: true,
          refetchOnWindowFocus: false,
          //staleTime: 5 * 60 * 1000,
          //cacheTime: 10 * 60 * 1000,
          retry: 2,
          ...queryOptions,
        });
      }
    }

export const findByPartNumberId = async (id: number) => {
  return fetchData(endPoints.find.spare_by_partnumber.replace(":id", id),
    zFindByPartNumberIdPayload
  );
};
