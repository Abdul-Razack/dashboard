import { z } from 'zod';

export type PrincipleOwnerIndexPayload = z.infer<
  ReturnType<typeof zPrincipleOwnerIndexPayload>
>;
export type PrincipleOwnerListPayload = z.infer<
  ReturnType<typeof zPrincipleOwnerListPayload>
>;
export type PrincipleOwnerDataColumn = z.infer<
  ReturnType<typeof zPrincipleOwnerDataColumn>
>;
export type CreateMasterOwnerPayload = z.infer<
  ReturnType<typeof zCreateMasterOwnerPayload>
>;
export type OwnerDetailsPayload = z.infer<
  ReturnType<typeof zOwnerDetailsPayload>
>;

const customerSchema = z.object({
  business_name: z.string(),
  business_type: z.object({
    created_at: z.string(),
    id: z.number(),
    modified_at: z.string(),
    name: z.string(),
  }),
  business_type_id: z.number(),
  code: z.string(),
  contact_type: z.object({
    created_at: z.string(),
    id: z.number(),
    modified_at: z.string(),
    name: z.string(),
  }),
  contact_type_id: z.number(),
  created_at: z.string(),
  currency: z.object({
    code: z.string(),
    created_at: z.string(),
    id: z.number(),
    modified_at: z.string(),
    name: z.string(),
  }),
  currency_id: z.number(),
  email: z.string(),
  id: z.number(),
  is_foreign_entity: z.boolean(),
  license_trade_exp_date: z.string().nullable().optional(),
  license_trade_no: z.string().nullable().optional(),
  license_trade_url: z.string().nullable().optional(),
  modified_at: z.string(),
  nature_of_business: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  vat_tax_id: z.string().nullable().optional(),
  vat_tax_url: z.string().nullable().optional(),
  year_of_business: z.number().nullable().optional(),
});

const ownerDetailsSchema = z.object({
  created_at: z.string(),
  customer: customerSchema.optional(),
  customer_id: z.number(),
  email: z.string().nullable(),
  id: z.number(),
  id_passport_copy: z.string().nullable(),
  modified_at: z.string(),
  owner: z.string().nullable(),
  phone: z.string(),
  remarks: z.string().nullable(),
});

export const zPrincipleOwnerListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

export const zPrincipleOwnerIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(ownerDetailsSchema),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zPrincipleOwnerDataColumn = () => {
  return z.object({
    ...ownerDetailsSchema.shape,
    actions: z.string().optional(),
  });
};

export const PrincipleOwnerSchema = ownerDetailsSchema.optional();

export const zCreateMasterOwnerPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zOwnerDetailsPayload = () => {
  return PrincipleOwnerSchema;
};

export const zCreatePrincipleOwnerBlukPayload = () => {
  return z.object({
    created_owners: z.array(
      z.object({
        customer_id: z.number(),
      })
    ),
    errors: z.array(z.union([
      z.string(), 
      z.object({ code: z.number(), message: z.string() })
    ])),
    status: z.boolean(),
  });
};

export type CreatePrincipleOwnerBlukPayload = z.infer<
  ReturnType<typeof zCreatePrincipleOwnerBlukPayload>
>;
