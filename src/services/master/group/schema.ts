import { z } from 'zod';

export const zCustomerGroupListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};
export type CustomerGroupListPayload = z.infer<
  ReturnType<typeof zCustomerGroupListPayload>
>;

export const zCustomerGroupMasterPayload = () => {
  return z.object({
    data: z.array(
      z.object({
        business_name: z.string(),
        code: z.string(),
        id: z.number(),
      })
    ),
    status: z.boolean(),
  });
};

export type CustomerGroupMasterPayload = z.infer<
  ReturnType<typeof zCustomerGroupMasterPayload>
>;

const groupDetailsSchema = z.object({
  created_at: z.string(),
  department_id: z.number().nullable(),
  id: z.number(),
  modified_at: z.string(),
  name: z.string(),
  user_id: z.number(),
  user: z.object({
    created_at: z.string(),
    email: z.string(),
    id: z.number(),
    modified_at: z.string(),
    username: z.string(),
  }).optional().nullable(),
});

export const zCustomerGroupIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(groupDetailsSchema),
    status: z.boolean(),
    total: z.number(),
    total_pages: z.number(),
  });
};
export type CustomerGroupIndexPayload = z.infer<
  ReturnType<typeof zCustomerGroupIndexPayload>
>;

export const CustomerGroupDataColumn = groupDetailsSchema.optional();
export const zCustomerGroupDataColumn = () => {
  return z.object({
    ...groupDetailsSchema.shape,
    actions: z.string().optional(),
  });
};
export type CustomerGroupDataColumn = z.infer<
  ReturnType<typeof zCustomerGroupDataColumn>
>;

export const zCreateCustomerGroupPayload = () => {
  return z.object({
    message: z.string(),
    status: z.boolean(),
  });
};
export type CreateCustomerGroupPayload = z.infer<
  ReturnType<typeof zCreateCustomerGroupPayload>
>;

// Common date-time fields
const dateTimeStamps = z.object({
  created_at: z.string(),
  modified_at: z.string(),
});

const idSchema = z.object({
  id: z.number(),
});

// Basic entity structure
const basicEntity = z.object({
  ...dateTimeStamps.shape,
  ...idSchema.shape,
  name: z.string(),
});

// Customer information schema
const customerInfo = z.object({
  business_name: z.string(),
  business_type: basicEntity,
  business_type_id: z.number(),
  code: z.string(),
  contact_type: basicEntity,
  contact_type_id: z.number(),
  currency: z.object({
    code: z.string(),
    ...dateTimeStamps.shape,
    ...idSchema.shape,
    name: z.string(),
  }),
  currency_id: z.number(),
  email: z.union([z.string(), z.null()]), // Nullable field
  is_foreign_entity: z.boolean(),
  license_trade_exp_date: z.union([z.string(), z.null()]), // Nullable
  license_trade_no: z.union([z.string(), z.null()]), // Nullable
  license_trade_url: z.union([z.string(), z.null()]), // Nullable
  nature_of_business: z.union([z.string(), z.null()]), // Nullable
  remarks: z.union([z.string(), z.null()]), // Nullable
  vat_tax_id: z.union([z.string(), z.null()]), // Nullable
  vat_tax_url: z.union([z.string(), z.null()]), // Nullable
  year_of_business: z.union([z.number(), z.null()]), // Nullable
  total_credit_amount: z.number(),
  total_credit_period: z.number(),
  payment_mode: basicEntity,
  payment_mode_id: z.number(),
  payment_term: basicEntity,
  payment_term_id: z.number(),
  ...dateTimeStamps.shape,
  ...idSchema.shape,
});

// Final schema
export const zCustomerGroupPayload = () => {
  return z.object({
    data: z.object({
      created_at: z.string(),
      customers: z.array(customerInfo),
      department_id: z.union([z.number(), z.null()]),
      id: z.number(),
      modified_at: z.string(),
      name: z.string(),
      user_id: z.number().optional().nullable(),
    }),
    status: z.boolean(),
  });
};

// Infer TypeScript type
export type CustomerGroupPayload = z.infer<
  ReturnType<typeof zCustomerGroupPayload>
>;

export const zPutCustomerGroupPayload = () => {
  return z.object({
    message: z.string(),
    status: z.boolean(),
  });
};
export type PutCustomerGroupPayload = z.infer<
  ReturnType<typeof zPutCustomerGroupPayload>
>;
