import { z } from 'zod';

export type AdminUserIndexPayload = z.infer<
  ReturnType<typeof zAdminUserIndexPayload>
>;
export type AdminUserListPayload = z.infer<
  ReturnType<typeof zAdminUserListPayload>
>;
export type AdminUserDataColumn = z.infer<
  ReturnType<typeof zAdminUserDataColumn>
>;
export type CreateAdminUserPayload = z.infer<
  ReturnType<typeof zCreateAdminUserPayload>
>;
export type AdminUserDetailsPayload = z.infer<
  ReturnType<typeof zAdminUserDetailsPayload>
>;

export type DataColumn = z.infer<ReturnType<typeof zDataColumn>>;

export const admiUserSchema = z.object({
  created_at: z.string(),
  department: z
    .object({
      created_at: z.string(),
      id: z.number(),
      modified_at: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  department_id: z.number().nullable(),
  email: z.string(),
  first_name: z.string().nullable(),
  id: z.number(),
  last_name: z.string().nullable(),
  modified_at: z.string(),
  phone: z.string().nullable(),
  role: z
    .object({
      id: z.number(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  role_id: z.number().nullable(),
  username: z.string().nullable(),
});

export const zAdminUserListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

export const zDataColumn = () => {
  return z.object({
    created_at: z.string(),
    id: z.number(),
    modified_at: z.string(),
    name: z.string(),
    emails: z.string(),
    actions: z.optional(z.string()),
  });
};

export const zAdminUserIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(admiUserSchema),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zAdminUserDataColumn = () => {
  return z.object({
    ...admiUserSchema.shape,
    actions: z.string().optional(),
  });
};

export const AdminUserSchema = admiUserSchema.optional();

export const zCreateAdminUserPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zAdminUserDetailsPayload = () => {
  return z.object({
    data: AdminUserSchema,
    status: z.boolean(),
  });
};

export const ProfilePayload = z.object({
  data: AdminUserSchema,
  status: z.boolean(),
});

export const zCreatePayload = () => {
  return z.object({ message: z.string(), status: z.boolean() });
};
