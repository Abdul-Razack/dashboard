import { z } from 'zod';

export const OptionsListPayload = z.object({
  items: z.record(z.string()),
  status: z.boolean(),
});