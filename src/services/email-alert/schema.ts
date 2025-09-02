import { z } from 'zod';

export type EmailAlertIndexPayload = z.infer<
  ReturnType<typeof zEmailAlertIndexPayload>
>;
export type dataColumn = z.infer<ReturnType<typeof zEmailAlertDataColumn>>;
export type UpdatePayload = z.infer<ReturnType<typeof zUpdatePayload>>;
export type ResendPayload = z.infer<ReturnType<typeof zResendPayload>>;


const departmentSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  modified_at: z.string(),
  name: z.string(),
  emails: z.string()
});

export const zEmailAlertIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(
      z.object({
        created_at: z.string(),
        departments: z.array(departmentSchema),
        id: z.number(),
        key: z.string(),
        modified_at: z.string(),
        subject: z.string().nullable().optional(),
        actions: z.optional(z.string()),
      })
    ),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zEmailAlertDataColumn = () => {
  return  z.object({
    created_at: z.string(),
    departments: z.array(departmentSchema),
    emails: z.array(departmentSchema),
    id: z.number(),
    key: z.string(),
    modified_at: z.string(),
    subject: z.string().nullable().optional(),
    actions: z.optional(z.string()),
  });
};

export const zUpdatePayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zResendPayload = () => {
  return z.object({
    message: z.string(),
    status: z.boolean(),
  });
};
