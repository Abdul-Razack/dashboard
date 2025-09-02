import { z } from 'zod';

export type RackIndexPayload = z.infer<ReturnType<typeof zRackIndexPayload>>;
export type DataColumn = z.infer<ReturnType<typeof zDataColumn>>;
// export type CreatePayload = z.infer<ReturnType<typeof zCreatePayload>>;
// export type ListPayload = z.infer<ReturnType<typeof zListPayload>>;

export const zRackIndexPayload = () => {
  return z.object({
    items: z.array(
      z.object({
        created_at: z.string(),
        id: z.number(),
        is_quarantine: z.boolean(),
        modified_at: z.string(),
        name: z.string(),
      })
    ),
    status: z.boolean(),
  });
};

export const zDataColumn = () => {
  return z.object({
    created_at: z.string(),
    id: z.number(),
    is_quarantine: z.boolean(),
    modified_at: z.string(),
    name: z.string(),
    actions: z.optional(z.string()),
  });
};

// export const zListPayload = () => {
//   return z.object({
//     items: z.record(z.string()),
//     status: z.boolean(),
//   });
// };

// export const zCreatePayload = () => {
//   return z.object({ message: z.string(), status: z.boolean() });
// };
