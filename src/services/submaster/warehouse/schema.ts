import { z } from 'zod';

export type WarehouseIndexPayload = z.infer<
  ReturnType<typeof zWarehouseIndexPayload>
>;
export type WarehouseDetailsPayload = z.infer<
  ReturnType<typeof zWarehouseDetailsPayload>
>;
export type WarehouseDataColumn = z.infer<
  ReturnType<typeof zWarehouseDataColumn>
>;
export type CreateWarehousePayload = z.infer<
  ReturnType<typeof zCreateWarehousePayload>
>;
export type WarehouseListPayload = z.infer<
  ReturnType<typeof zWarehouseListPayload>
>;

export const zWarehouseIndexPayload = () => {
  return z.object({
    items: z.array(
      z.object({
        address: z.string(),
        city: z.string(),
        consignee_name: z.string(),
        country: z.string(),
        created_at: z.string(),
        email: z.string().nullable().optional(),
        fax: z.string().nullable().optional(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
        phone: z.string(),
        remarks: z.string().nullable().optional(),
        state: z.string(),
        zip_code: z.string(),
      })
    ),
    status: z.boolean(),
  });
};

export const zWarehouseDetailsPayload = () => {
  return z
    .object({
      item: z.object({
        address: z.string(),
        city: z.string(),
        consignee_name: z.string(),
        country: z.string(),
        created_at: z.string(),
        email: z.string(),
        fax: z.string().nullable().optional(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
        phone: z.string(),
        remarks: z.string().nullable().optional(),
        state: z.string(),
        zip_code: z.string(),
      }),
    })
    .optional();
};

export const zWarehouseDataColumn = () => {
  return z.object({
    address: z.string(),
    city: z.string(),
    consignee_name: z.string(),
    country: z.string(),
    created_at: z.string(),
    email: z.string().nullable().optional(),
    fax: z.string().nullable().optional(),
    id: z.number(),
    modified_at: z.string(),
    name: z.string(),
    phone: z.string(),
    remarks: z.string().nullable().optional(),
    state: z.string(),
    zip_code: z.string(),
    actions: z.optional(z.string()),
  });
};

export const zWarehouseListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

export const zCreateWarehousePayload = () => {
  return z.object({ message: z.string(), status: z.boolean() });
};
