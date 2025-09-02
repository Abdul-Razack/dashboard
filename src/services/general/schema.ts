import { z } from 'zod';

export type UploadPayload = z.infer<ReturnType<typeof zUploadPayload>>;

export const zUploadPayload = () => {
  return z.object({
    file_name: z.string(),
    message: z.string(),
    status: z.boolean(),
  });
};
