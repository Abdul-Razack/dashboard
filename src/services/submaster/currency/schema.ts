import { z } from 'zod';

export type CurrencyIndexPayload = z.infer<
  ReturnType<typeof zCurrencyIndexPayload>
>;

export type CurrencyDataColumn = z.infer<
  ReturnType<typeof zCurrencyDataColumn>
>;

export const zCurrencyIndexPayload = () => {
  return z.object({
    items: z.array(
      z.object({
        code: z.string().optional().nullable(),
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        symbol: z.string().optional().nullable(),
        name: z.string(),
        actions: z.optional(z.string()),
      })
    ),
    status: z.boolean(),
  });
};

export const zCurrencyDataColumn = () => {
  return z.object({
    code: z.string().optional().nullable(),
    created_at: z.string(),
    id: z.number(),
    modified_at: z.string(),
    name: z.string(),
    symbol: z.string().optional().nullable(),
    actions: z.optional(z.string()),
  });
};
