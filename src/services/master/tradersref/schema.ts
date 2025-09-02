import { z } from 'zod';

export type TraderRefIndexPayload = z.infer<
  ReturnType<typeof zTraderRefIndexPayload>
>;
export type TraderRefListPayload = z.infer<
  ReturnType<typeof zTraderRefListPayload>
>;
export type TraderRefDataColumn = z.infer<
  ReturnType<typeof zTraderRefDataColumn>
>;
export type CreateMasterTraderPayload = z.infer<
  ReturnType<typeof zCreateMasterTraderPayload>
>;
export type TraderDetailsPayload = z.infer<
  ReturnType<typeof zTraderDetailsPayload>
>;

const dateTimeStamps = {
  created_at: z.string(),
  modified_at: z.string(),
};

const id = { id: z.number() };

const basicEntity = {
  ...dateTimeStamps,
  ...id,
  name: z.string(),
};

const customerInfo = z.object({
  business_name: z.string(),
  business_type: z.object(basicEntity),
  business_type_id: z.number(),
  code: z.string(),
  contact_type: z.object(basicEntity),
  contact_type_id: z.number(),
  currency: z.object({
    code: z.string(),
    ...dateTimeStamps,
    ...id,
    name: z.string(),
  }),
  currency_id: z.number(),
  email: z.union([z.string(), z.null()]),
  is_foreign_entity: z.boolean(),
  license_trade_exp_date: z.union([z.string(), z.null()]),
  license_trade_no: z.union([z.string(), z.null()]),
  license_trade_url: z.union([z.string(), z.null()]),
  nature_of_business: z.string().nullable().optional(),
  remarks: z.union([z.string(), z.null()]),
  vat_tax_id: z.union([z.string(), z.null()]),
  vat_tax_url: z.union([z.string(), z.null()]),
  year_of_business: z.union([z.number(), z.null()]),
  ...dateTimeStamps,
  ...id,
});

const traderRefSchema = z.object({
  address: z.string(),
  address_line2: z.string().nullable().optional(),
  attention: z.string(),
  city: z.string(),
  country: z.string(),
  created_at: z.string(),
  customer: customerInfo.optional(),
  customer_id: z.number(),
  email: z.string().nullable().optional(),
  fax: z.string().nullable().optional(),
  id: z.number(),
  modified_at: z.string(),
  phone: z.string(),
  remarks: z.string().nullable().optional(),
  state: z.string(),
  vendor_name: z.string(),
  zip_code: z.string(),
  actions: z.string().optional(),
});

export const zTraderRefListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

export const zTraderRefIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(traderRefSchema),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zTraderRefDataColumn = () => {
  return traderRefSchema;
};

export const TraderRefSchema = traderRefSchema.optional();

export const zCreateMasterTraderPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zTraderDetailsPayload = () => {
  return TraderRefSchema;
};

export const zCreateTraderRefBlukPayload = () => {
  return z.object({
    created_references: z.array(
      z.object({
        customer_id: z.number(),
      })
    ),
    errors: z.array(z.union([
      z.string(), 
      z.object({ customer_id: z.number(), row: z.number(), message: z.string() })
    ])),
    status: z.boolean(),
  });
};

export type CreateTraderRefBlukPayload = z.infer<
  ReturnType<typeof zCreateTraderRefBlukPayload>
>;