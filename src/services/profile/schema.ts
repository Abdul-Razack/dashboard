import { z } from 'zod';

export type UpdateResponsePayload = z.infer<
  ReturnType<typeof zUpdateResponsePayload>
>;
export type ProfileDetailsPayload = z.infer<
  ReturnType<typeof zProfileDetailsPayload>
>;

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

export const zUpdateResponsePayload = () => {
  return z.object({
    message: z.string(),
    status: z.boolean(),
  });
};

export const zProfileDetailsPayload = () => {
  return z.object({
    data: z.object({
      created_at: z.string(),
      department: z.object({
        created_at: z.string(),
        emails: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
      }).nullable(), // ✅ Allow `null` for department
      department_id: z.number().nullable(),
      email: z.string().email(),
      first_name: z.string(),
      id: z.number(),
      last_name: z.string(),
      menu: z.array(
        z.object({
          icon: z.string(),
          id: z.number(),
          link: z.string().nullable(),
          name: z.string(),
          submenu: z.array(
            z.object({
              icon: z.string(),
              id: z.number(),
              link: z.string(),
              name: z.string(),
            })
          ).optional(),
        })
      ),
      modified_at: z.string(),
      phone: z.string().nullable(), // ✅ Allow `null` for phone
      role: z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
      }),
      role_id: z.number(),
      username: z.string(),
    }),
    status: z.boolean(),
  });
};

export const ProfilePayload =  z.object({
    data: AdminUserSchema,
    status: z.boolean(),
  });


