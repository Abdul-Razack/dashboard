import Axios from 'axios';
import { UseQueryOptions, useQuery } from 'react-query';

import {
  LREFQDetailsPayload,
  ListPayload,
  zLREFQDetailsPayload,
  zListPayload,
} from '../schema';

const endPoints = import.meta.env.VITE_API_ENDPOINTS ? JSON.parse(import.meta.env.VITE_API_ENDPOINTS) : {};

type UseListQueryOptions = UseQueryOptions<ListPayload>;
type UseLREFQDetailsQueryOptions = UseQueryOptions<LREFQDetailsPayload>;

interface QueryParams {
  page?: number;
  search?: {
    type?: string;
  };
}

const fetchData = async (
  url: string,
  parser: TODO,
  queryParams: QueryParams = {}
) => {
  const queryString = new URLSearchParams();

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
    return parser().parse(response.data);
  } catch (error) {
    console.error('API call failed', error);
    throw new Error(`Failed to fetch data from ${url}.`);
  }
};

export const useLRFQList = (
  queryParams?: QueryParams,
  queryOptions: UseListQueryOptions = {}
) =>
  useQuery({
    queryKey: ['LrfqList', queryParams],
    queryFn: () => fetchData(endPoints.list.lrfq , zListPayload, queryParams),
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });

export const useLRFQDetails = (
  id: number,
  queryOptions: UseLREFQDetailsQueryOptions = {}
) =>
  useQuery({
    queryKey: ['lrfqId', id],
    queryFn: () => fetchData( endPoints.info.lrfq.replace(":id", id), zLREFQDetailsPayload),
    enabled: id !== 0,
    //staleTime: 5 * 60 * 1000, // Data is fresh for 5 minutes
    //cacheTime: 15 * 60 * 1000, // Cache the data for 15 minutes
    retry: 2, // Retry failed requests twice
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
    ...queryOptions,
  });
