import Axios, { AxiosError } from 'axios';
import { UseMutationOptions, useMutation } from 'react-query';

import { UploadPayload, zUploadPayload } from './schema';
const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};
type FileUploadMutationConfig<T, Variables> = UseMutationOptions<
  T,
  AxiosError<T>,
  Variables
>;

const useFileUploadMutation = <T, Variables>(
  endpoint: string,
  parseResponse: (data: TODO) => T,
  config: FileUploadMutationConfig<T, Variables>
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

export const useFileUpload = (
  config: FileUploadMutationConfig<UploadPayload, FormData> = {}
) => {
  return useFileUploadMutation(endPoints.others.file_upload, zUploadPayload().parse, {
    ...config,
    onSuccess: (data, ...args) => {
      if (data.status) {
        config?.onSuccess?.(data, ...args);
      }
    },
  });
};
