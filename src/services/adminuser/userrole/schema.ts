import { z } from 'zod';

export type IndexPayload = z.infer<ReturnType<typeof zIndexPayload>>;
export type DataColumn = z.infer<ReturnType<typeof zDataColumn>>;
export type CreatePayload = z.infer<ReturnType<typeof zCreatePayload>>;
export type ListPayload = z.infer<ReturnType<typeof zListPayload>>;
export type DetailsPayload = z.infer<ReturnType<typeof zDetailsPayload>>;

export const zIndexPayload = () => {
  return z.object({
    items: z.array(
      z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
        actions: z.optional(z.string()),
      })
    ),
    status: z.boolean(),
  });
};


export const zDataColumn = () => {
  return z.object({
    created_at: z.string(),
    id: z.number(),
    modified_at: z.string(),
    name: z.string(),
    actions: z.optional(z.string()),
  });
};

export const zListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

export const zDetailsPayload = () => {
  return z.object({
    data: z.object({
      created_at: z.string(),
      id: z.number(),
      modified_at: z.string(),
      name: z.string(),
      days: z.number(),
      actions: z.optional(z.string()),
    }),
    status: z.boolean(),
  });
};

export const zCreatePayload = () => {
  return z.object({ message: z.string(), status: z.boolean() });
};
