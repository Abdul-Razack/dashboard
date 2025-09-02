
import { z } from 'zod';

export type CreateReceiptEntryPayload = z.infer<
  ReturnType<typeof zCreateReceiptEntryPayload>
>;

export const zCreateReceiptEntryPayload = () => {
    return z.object({
      message: z.string(),
      status: z.boolean(),
    });
};

export type GetTotalAmountyPayload = z.infer<
  ReturnType<typeof zGetTotalAmountyPayload>
>;

export const zGetTotalAmountyPayload = () => {
    return z.object({
      status: z.boolean(),
      total_amount: z.number().nullable(),
    });
};