import Axios from 'axios';
import { ZodError } from 'zod';

export const getAPICall = async (url: string, schema: any, queryParams?: any) => {
  try {
    const queryString = new URLSearchParams();
    if(queryParams){
      Object.entries(queryParams).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length > 0) {
          queryString.append(`${key}`, value.join(','));
        } else {
          if (!Array.isArray(value) && value !== undefined && value !== null && value !== '') {
            queryString.append(key, value.toString());
          }
        }
      });
    }
    const response = await Axios.get(`${url}?${queryString}`);
    const parsed = schema.safeParse(response.data);
    if (!parsed.success) {
      throw new Error('Invalid response schema: ' + parsed.error.message);
    }
    return parsed.data;
  } catch (error: any) {
    console.log(error)
    throw new Error('Error fetching data: ' + error.message);
  }
};

export const postAPICall = async (url: string, payload: any, postPayloadSchema: any, responseSchecma: any) => {
  try {
    postPayloadSchema.parse(payload);
    const response = await Axios.post(`${url}`, payload);
    console.log('API response:', response.data);
    const parsed = responseSchecma.safeParse(response.data);
    if (!parsed.success) {
      throw new Error('Invalid response schema: ' + parsed.error.message);
    }
    return parsed.data;
  } catch (err) {
    if (err instanceof ZodError) {
      console.log(err)
    } else if (Axios.isAxiosError(err)) {
      console.log(err)
    } else {
      console.log(err)
    }
  }
};

export const uploadAPICall = async (url: string, formData: any) => {
  try {
    const response = await Axios.post(`${url}`, formData,{
      headers: {
        'Content-Type': 'multipart/form-data', // Required for file uploads
      }
    });
    console.log('API response:', response.data);
    return response.data;
  } catch (err) {
    if (err instanceof ZodError) {
      console.log(err)
    } else if (Axios.isAxiosError(err)) {
      console.log(err)
      return err?.response?.data;
    } else {
      console.log(err)
      return err;
    }
  }
};
