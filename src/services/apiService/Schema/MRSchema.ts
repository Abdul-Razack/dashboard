import { z } from 'zod';

export const MRItemPayload = z.object({
    condition_id: z.number(),
    id: z.number(),
    part_number_id: z.number(),
    //purchase_request_history_id: z.number(),
    qty: z.number(),
    remark: z.string().nullable().optional(),
    unit_of_measure_id: z.number()
  });

  export type MRItemBody = z.infer<typeof MRItemPayload>;