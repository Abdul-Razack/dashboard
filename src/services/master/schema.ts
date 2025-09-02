import { z } from 'zod';

import { customerBankSchema } from './bank/schema';
import { ContactManagerSchema } from './contactmanager/schema';
import { PrincipleOwnerSchema } from './principleowner/schema';
import { shippingAddressSchema } from './shipping/schema';
import { TraderRefSchema } from './tradersref/schema';

export type CustomerIndexPayload = z.infer<
  ReturnType<typeof zCustomerIndexPayload>
>;
export type dataColumn = z.infer<ReturnType<typeof zCustomerDataColumn>>;
export type CreateMasterPayload = z.infer<
  ReturnType<typeof zCreateMasterPayload>
>;
export type CustomerListPayload = z.infer<
  ReturnType<typeof zCustomerListPayload>
>;
export type CustomerListSupplierPayload = z.infer<
  ReturnType<typeof zCustomerListSupplierPayload>
>;
export type CustomerDetailsPayload = z.infer<
  ReturnType<typeof zCustomerDetailsPayload>
>;

export type CreateCustomerBlukPayload = z.infer<
  ReturnType<typeof zCreateCustomerBlukPayload>
>;

export type UploadedCustomerNamesPayload = z.infer<ReturnType<typeof zUploadedCustomerNamesPayload>>;

export const zCustomerIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(
      z.object({
        business_name: z.string(),
        business_type: z.object({
          created_at: z.string(),
          id: z.number(),
          modified_at: z.string(),
          name: z.string(),
        }),
        is_active: z.boolean(),
        user: z.object({
          created_at: z.string(),
          email: z.string(),
          id: z.number(),
          modified_at: z.string(),
          username: z.string(),
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
        // customer_group_id: z.number().nullable().optional(),
        created_at: z.string(),
        currency: z.object({
          code: z.string(),
          created_at: z.string(),
          id: z.number(),
          modified_at: z.string(),
          name: z.string(),
        }),
        currency_id: z.number(),
        email: z.union([z.string(), z.null()]),
        id: z.number(),
        is_foreign_entity: z.boolean(),
        license_trade_exp_date: z.union([z.string(), z.null()]),
        license_trade_no: z.union([z.string(), z.null()]),
        license_trade_url: z.union([z.string(), z.null()]),
        modified_at: z.string(),
        nature_of_business: z.string().nullable().optional(),
        remarks: z.union([z.string(), z.null()]),
        vat_tax_id: z.union([z.string(), z.null()]),
        vat_tax_url: z.union([z.string(), z.null()]),
        year_of_business: z.union([z.number(), z.null()]),
        actions: z.optional(z.string()),
      })
    ),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zCustomerListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

export const zUploadedCustomerNamesPayload = () => 
    z.object({
  data: z.record(z.string(), z.boolean()), 
  status: z.boolean(),
});

export const zCustomerListSupplierPayload = () => {
  return z.object({
    data: z.array(
      z.object({ business_name: z.string(), code: z.string(), id: z.number() })
    ),
    status: z.boolean(),
  });
};

export const zCustomerDataColumn = () => {
  return z.object({
    business_name: z.string(),
    business_type: z.object({
      created_at: z.string(),
      id: z.number(),
      modified_at: z.string(),
      name: z.string(),
    }),
    is_active: z.boolean(),
    user: z.object({
      created_at: z.string(),
      email: z.string(),
      id: z.number(),
      modified_at: z.string(),
      username: z.string(),
    }),
    // customer_group_id: z.number().nullable().optional(),
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
    email: z.union([z.string(), z.null()]),
    id: z.number(),
    is_foreign_entity: z.boolean(),
    license_trade_exp_date: z.union([z.string(), z.null()]),
    license_trade_no: z.union([z.string(), z.null()]),
    license_trade_url: z.union([z.string(), z.null()]),
    modified_at: z.string(),
    nature_of_business: z.string().nullable().optional(),
    remarks: z.union([z.string(), z.null()]),
    vat_tax_id: z.union([z.string(), z.null()]),
    vat_tax_url: z.union([z.string(), z.null()]),
    year_of_business: z.union([z.number(), z.null()]),
    actions: z.optional(z.string()),
  });
};

export const zCreateMasterPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

const businessTypeSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  modified_at: z.string(),
  name: z.string(),
});

const contactTypeSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  modified_at: z.string(),
  name: z.string(),
});

const currencySchema = z.object({
  code: z.string(),
  created_at: z.string(),
  id: z.number(),
  modified_at: z.string(),
  name: z.string(),
});

const qualityCertificateSchema = z.object({
  certificate_type: z.string().nullable().optional(),
  created_at: z.string().optional().nullable(),
  customer_id: z.number().optional().nullable(),
  doc_no: z.string().nullable().optional().optional().nullable(),
  doc_url: z.string().nullable().optional().optional().nullable(),
  id: z.number(),
  modified_at: z.string(),
  validity_date: z.string().nullable().optional(),
  issue_date: z.string().nullable().optional(),
}).optional().nullable();

export const zCustomerDetailsPayload = () => {
  return z.object({
    status: z.boolean(),
    available_credit_limit: z.number(),
    total_available_credit: z.number(),
    total_payments: z.number(),
    total_used_credit: z.number(),
    data: z.object({
          business_name: z.string(),
          business_type: businessTypeSchema,
          business_type_id: z.number(),
          code: z.string(),
          contact_type: contactTypeSchema,
          contact_type_id: z.number(),
          created_at: z.string(),
          currency: currencySchema,
          // customer_group_id: z.number().nullable().optional(),
          currency_id: z.number(),
          customer_banks: z.array(customerBankSchema).optional(),
          customer_contact_managers: z.array(ContactManagerSchema).optional(),
          customer_principle_owners: z.array(PrincipleOwnerSchema).optional(),
          customer_shipping_addresses: z.array(shippingAddressSchema).optional(),
          customer_trader_references: z.array(TraderRefSchema).optional(),
          email: z.string().nullable(),
          id: z.number(),
          is_foreign_entity: z.boolean(),
          license_trade_exp_date: z.string().nullable().optional(),
          license_trade_no: z.string().nullable().optional(),
          license_trade_url: z.string().nullable().optional(),
          modified_at: z.string(),
          nature_of_business: z.string().nullable().optional(),
          quality_certificates: z.array(qualityCertificateSchema).optional(),
          remarks: z.string().nullable().optional(),
          vat_tax_id: z.string().nullable().optional(),
          vat_tax_url: z.string().nullable().optional(),
          year_of_business: z.number().nullable().optional(),
          total_credit_amount: z.number().nullable().optional(),
          total_credit_period: z.number().nullable().optional(),
          payment_mode: z.object({
            created_at: z.string(),
            id: z.number(),
            modified_at: z.string(),
            name: z.string(),
          }),
          payment_term: z.object({
            created_at: z.string(),
            id: z.number(),
            modified_at: z.string(),
            name: z.string(),
          }).nullable().optional(),
          })
    });
};

export const zCreateCustomerBlukPayload = () => {
  return z.object({
    created_customers: z.array(
      z.object({
        business_name: z.string(),
      })
    ),
    errors: z.array(
      z.object({ business_name: z.string(), message: z.string() })
    ),
    status: z.boolean(),
  });
};


