import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  useQuery
} from 'react-query';
import {
    CreateAssignMenusPayload,
    GetAssignMenuyPayload,
    CreateMenuPayload,
    zCreateAssignMenusPayload,
    zGetAssignMenuyPayload,
    zCreateMenuPayload
} from './schema';


const endPoints = import.meta.env.VITE_API_ENDPOINTS
  ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS)
  : {};

interface QueryParams {
  user_id?: number;
}

type UseCreateAssignMenusBody = {
    user_id: number;
    menu_ids: number[];
};

type AssignMenusMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useAssignMenusMutation = <T, Variables>(
    endpoint: string,
    parseResponse: (data: TODO) => T,
    config: AssignMenusMutationConfig<T, Variables>
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

export const useCreateAssignMenus = (
    config: AssignMenusMutationConfig<
      CreateAssignMenusPayload,
      UseCreateAssignMenusBody
    > = {}
  ) => {
    const queryClient = useQueryClient();
    return useAssignMenusMutation(endPoints.create.assign_menus,
      zCreateAssignMenusPayload().parse,
      {
        ...config,
        onSuccess: (data, ...args) => {
          if (data.status) {
            config?.onSuccess?.(data, ...args);
            queryClient.invalidateQueries('assign_menus');
          }
        },
      }
    );
};

type UseCreateMenuBody = {
  name: string;
  icon: string;
  link: string;
  parent_id: number;
}

type CreateMenuMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useCreateMenuMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: CreateMenuMutationConfig<T, Variables>
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

export const useCreateMenu = (
  config: AssignMenusMutationConfig<
    CreateMenuPayload,
    UseCreateMenuBody
  > = {}
) => {
  const queryClient = useQueryClient();
  return useCreateMenuMutation(endPoints.create.menu,
    zCreateMenuPayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
          queryClient.invalidateQueries('create_menus');
        }
      },
    }
  );
};

const fetchData = async (
  url: string,
  parser: TODO,
  queryParams: QueryParams = {}
) => {
  const queryString = new URLSearchParams();

  // Handling both top-level and nested 'search' parameters explicitly
  Object.entries(queryParams).forEach(([key, value]) => {
    // Check if the value is an object indicating it's part of 'search'
    if (typeof value === 'object' && value !== null) {
      // If it's part of 'search', iterate through its properties
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        if (nestedValue !== undefined && nestedValue !== null) {
          // Correctly append it as part of 'search[...]'
          queryString.append(`search[${nestedKey}]`, nestedValue.toString());
        }
      });
    } else {
      // Directly append top-level non-object parameters, if any exist
      if (value !== undefined && value !== null) {
        queryString.append(key, value.toString());
      }
    }
  });

  // const finalUrl = `${url}?${queryString.toString()}`;
  // console.log(`Final API URL: ${finalUrl}`); // Debugging purposes
  try {
    //const response = await Axios.get(`${url}${Object.keys(queryParams).length > 0 ? '?' : ''}${queryString}`);
    const response = await Axios.get(`${url}?${queryString}`);
    console.log(response)
    return parser().parse(response.data);
  } catch (error) {
    console.error('API call failed', error);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

type UseGetAssignMenuOptions = UseQueryOptions<GetAssignMenuyPayload>;

export const useGetAssignMenu = (
  queryParams?: QueryParams,
  queryOptions: UseGetAssignMenuOptions = {}
) =>
  useQuery({
    queryKey: ['get_assigned_menu', queryParams],
    queryFn: () =>
      fetchData(
        endPoints.list.user_menu,
        zGetAssignMenuyPayload,
        queryParams
      ),
    enabled: queryParams?.user_id !== 0,
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    //staleTime: 0, // 5 minutes
    //cacheTime: 0, // 10 minutes
    retry: 2,
    ...queryOptions,
  });
