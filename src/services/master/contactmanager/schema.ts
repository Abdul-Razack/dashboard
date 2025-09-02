import { z } from 'zod';

export type ContactManagerIndexPayload = z.infer<
  ReturnType<typeof zContactManagerIndexPayload>
>;
export type ContactManagerListPayload = z.infer<
  ReturnType<typeof zContactManagerListPayload>
>;
export type ContactManagerDataColumn = z.infer<
  ReturnType<typeof zContactManagerDataColumn>
>;
export type CreateMasterContactPayload = z.infer<
  ReturnType<typeof zCreateMasterContactPayload>
>;
export type ContactDetailsPayload = z.infer<
  ReturnType<typeof zContactDetailsPayload>
>;

export type ContactManagerBulkListPayload = z.infer<
  ReturnType<typeof zContactManagerBulkListPayload>
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
  email: z.string().nullable(),
  id: z.number(),
  is_foreign_entity: z.boolean(),
  license_trade_exp_date: z.string().nullable(),
  license_trade_no: z.string().nullable(),
  license_trade_url: z.string().nullable(),
  modified_at: z.string(),
  nature_of_business: z.string().nullable().optional(),
  remarks: z.string().nullable(),
  vat_tax_id: z.string().nullable(),
  vat_tax_url: z.string().nullable(),
  year_of_business: z.number().nullable(),
});

const contactDetailsSchema = z.object({
  address: z.string(),
  address_line2: z.string().optional().nullable(),
  attention: z.string(),
  city: z.string(),
  country: z.string(),
  created_at: z.string(),
  customer_id: z.number(),
  customer: customerSchema.optional(),
  email: z.string().nullable(),
  fax: z.string().nullable(),
  id: z.number(),
  modified_at: z.string(),
  phone: z.string(),
  remarks: z.string().nullable(),
  state: z.string(),
  zip_code: z.string(),
});

export const zContactManagerListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

export const zContactManagerIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(contactDetailsSchema),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zContactManagerDataColumn = () => {
  return z.object({
    ...contactDetailsSchema.shape,
    actions: z.string().optional(),
  });
};

export const ContactManagerSchema = contactDetailsSchema.optional();

export const zCreateMasterContactPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zContactDetailsPayload = () => {
  return ContactManagerSchema;
};

export const zContactManagerBulkListPayload = () => {
  return z.object({
    items: z.record(
      z.string(),
      z.array(
        z.object({
          address: z.string(),
          address_line2: z.string().optional().nullable(),
          attention: z.string(),
          city: z.string(),
          country: z.string(),
          created_at: z.string(),
          customer_id: z.number(),
          customer: customerSchema.optional(),
          email: z.string().nullable(),
          fax: z.string().nullable(),
          id: z.number(),
          modified_at: z.string(),
          phone: z.string(),
          remarks: z.string().nullable(),
          state: z.string(),
          zip_code: z.string(),
        })
      )
    ),
    status: z.boolean(),
  });
};

export const zCreateContactManagerBlukPayload = () => {
  return z.object({
    created_contacts: z.array(
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

export type CreateContactManagerBlukPayload = z.infer<
  ReturnType<typeof zCreateContactManagerBlukPayload>
>;
