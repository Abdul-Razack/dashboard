import { z } from 'zod';

export type ShippingAddressIndexPayload = z.infer<
  ReturnType<typeof zShippingAddressIndexPayload>
>;
export type ShippingAddressListPayload = z.infer<
  ReturnType<typeof zShippingAddressListPayload>
>;
export type ShippingDataColumn = z.infer<
  ReturnType<typeof zShippingDataColumn>
>;
export type CreateMasterShippingPayload = z.infer<
  ReturnType<typeof zCreateMasterShippingPayload>
>;
export type ShippingDetailsPayload = z.infer<
  ReturnType<typeof zShippingDetailsPayload>
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
  year_of_business: z.number().nullable().optional(),
});

export const zShippingAddressIndexPayload = () =>
  z.object({
    current_page: z.number(),
    data: z.array(
      z.object({
        address: z.string(),
        address_line2: z.string().nullable().optional(),
        attention: z.string(),
        city: z.string(),
        consignee_name: z.string(),
        country: z.string(),
        customer: customerSchema.optional(),
        customer_id: z.number(),
        email: z.string().nullable().optional(),
        fax: z.string().nullable().optional(),
        id: z.number(),
        phone: z.string(),
        remarks: z.string().nullable().optional(),
        state: z.string(),
        zip_code: z.string(),
      })
    ),
    total: z.number(),
    total_pages: z.number(),
  });

export const zShippingAddressListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

export const zShippingDataColumn = () =>
  z.object({
    ...zShippingAddressIndexPayload().shape.data.element.shape,
    actions: z.optional(z.string()),
  });

export const shippingAddressSchema =
  zShippingAddressIndexPayload().shape.data.element;

export const zCreateMasterShippingPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zShippingDetailsPayload = () => shippingAddressSchema;


export const zCreateShippingBlukPayload = () => {
  return z.object({
    created_addresses: z.array(
      z.object({
        consignee_name: z.string(),
      })
    ),
    errors: z.array(z.union([
      z.string(), 
      z.object({ code: z.number(), message: z.string() })
    ])),
    status: z.boolean(),
  });
};

export type CreateShippingBlukPayload = z.infer<
  ReturnType<typeof zCreateShippingBlukPayload>
>;
