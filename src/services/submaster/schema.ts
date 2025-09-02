import { z } from 'zod';

export type IndexPayload = z.infer<ReturnType<typeof zIndexPayload>>;
export type DetailsPayload = z.infer<ReturnType<typeof zDetailsPayload>>;
export type ShipACIndexPayload = z.infer<ReturnType<typeof zShipACIndexPayload>>;
export type PriorityIndexPayload = z.infer<ReturnType<typeof zPriorityIndexPayload>>;
export type PriorityDetailPayload = z.infer<ReturnType<typeof zPriorityDetailsPayload>>;
export type DepartmentIndexPayload = z.infer<ReturnType<typeof zDepartmentIndexPayload>>;
export type UOMIndexPayload = z.infer<ReturnType<typeof zUOMIndexPayload>>;
export type DataColumn = z.infer<ReturnType<typeof zDataColumn>>;
export type ShipACDataColumn = z.infer<ReturnType<typeof zShipACDataColumn>>;
export type PriorityDataColumn = z.infer<ReturnType<typeof zPriorityDataColumn>>;
export type CreatePayload = z.infer<ReturnType<typeof zCreatePayload>>;
export type ListPayload = z.infer<ReturnType<typeof zListPayload>>;

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

export const zDetailsPayload = () => {
  return z.object({
    item: 
      z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
      }),
    status: z.boolean(),
  });
};


export const zShipACIndexPayload = () => {
  return z.object({
    items: z.array(
      z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
        account_number: z.string().nullable(),
      })
    ),
    status: z.boolean(),
  });
};

export const zDepartmentIndexPayload = () => {
  return z.object({
    items: z.array(
      z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
        emails: z.string(),
        actions: z.optional(z.string()),
      })
    ),
    status: z.boolean(),
  });
};

export const zUOMIndexPayload = () => {
  return z.object({
    items: z.array(
      z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
        group_id: z.number(),
        actions: z.optional(z.string()),
      })
    ),
    status: z.boolean(),
  });
};

export const zPriorityIndexPayload = () => {
  return z.object({
    items: z.array(
      z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
        days: z.number().nullable().optional(),
        actions: z.optional(z.string()),
      })
    ),
    status: z.boolean(),
  });
};

export const zPriorityDetailsPayload = () => {
  return z.object({
    item: z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
        days: z.number().nullable().optional(),
        actions: z.optional(z.string()),
      }),
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

export const zShipACDataColumn = () => {
  return z.object({
    created_at: z.string(),
    id: z.number(),
    modified_at: z.string(),
    name: z.string(),
    account_number: z.string().nullable(),
    actions: z.optional(z.string()),
  });
};

export const zPriorityDataColumn = () => {
  return z.object({
    created_at: z.string(),
    id: z.number(),
    modified_at: z.string(),
    name: z.string(),
    days: z.number().nullable().optional(),
    actions: z.optional(z.string()),
  });
};

export const zListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

export const zCreatePayload = () => {
  return z.object({ message: z.string(), status: z.boolean() });
};
