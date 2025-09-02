import Axios, { AxiosError } from 'axios';
import {
  UseMutationOptions,
  useMutation,
  useQuery,
} from 'react-query';

import {
  UpdateResponsePayload,
  zProfileDetailsPayload,
  zUpdateResponsePayload,
} from './schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

const fetchData = async (url: string, parser: TODO) => {
  try {
    const response = await Axios.get(`${url}`);
    return parser().parse(response.data);
  } catch (error) {
    console.error('API call failed', error);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

export const useProfileInfo = () =>
  useQuery({
    queryKey: ['ProfileInfo'],
    queryFn: () =>
      fetchData(
        endPoints.others.myprofile,
        zProfileDetailsPayload
      ),
      keepPreviousData: true,
      refetchOnWindowFocus: false,
      //staleTime: 5 * 60 * 1000, // 5 minutes
      //cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
  });

type ProfileMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useProfilePutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: ProfileMutationConfig<T, Variables>
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

interface UserProfileVariables {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  department_id: number;
  role_id: number;
}

export const useUpdateProfile = (
  config: ProfileMutationConfig<
    UpdateResponsePayload,
    UserProfileVariables
  > = {}
) => {
  return useProfilePutMutation<UpdateResponsePayload, UserProfileVariables>(
    ({}) => endPoints.others.profile_update,
    zUpdateResponsePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
        }
      },
      onMutate: async (variables) => {
        const { ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};

interface UserPasswordVariables {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const useUpdatePassword = (
  config: ProfileMutationConfig<
    UpdateResponsePayload,
    UserPasswordVariables
  > = {}
) => {
  return useProfilePutMutation<UpdateResponsePayload, UserPasswordVariables>(
    ({}) => endPoints.others.password_update,
    zUpdateResponsePayload().parse,
    {
      ...config,
      onSuccess: (data, ...args) => {
        if (data.status) {
          config?.onSuccess?.(data, ...args);
        }
      },
      onMutate: async (variables) => {
        const { ...rest } = variables;
        return rest; // Return variables excluding 'id'
      },
    }
  );
};
