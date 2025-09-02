import Axios, { AxiosError } from 'axios';
import { UseMutationOptions, useMutation } from 'react-query';

export const fetchData = async (url: string, parser: TODO) => {
  try {
    const response = await Axios.get(url);
    return parser().parse(response.data);
  } catch (error) {
    console.log(error)
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

export type SubMasterMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

export const useSubMasterMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: SubMasterMutationConfig<T, Variables>
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

export const useSubMasterPutMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: SubMasterMutationConfig<T, Variables>
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


export const useSubMasterPostMutation = <T, Variables>(
  endpoint: (variables: Variables) => string,
  parseResponse: (data: TODO) => T,
  config: SubMasterMutationConfig<T, Variables>
) => {
  return useMutation(
    async (variables: Variables) => {
      const url = endpoint(variables);
      const response = await Axios.post(url, variables);
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
