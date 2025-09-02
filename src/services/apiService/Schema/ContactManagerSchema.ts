import { z } from 'zod';

import { customerBankSchema } from '../../master/bank/schema';
import { ContactManagerSchema } from '../../master/contactmanager/schema';
import { PrincipleOwnerSchema } from '../../master/principleowner/schema';
import { shippingAddressSchema } from '../../master/shipping/schema';
import { TraderRefSchema } from '../../master/tradersref/schema';

export const ListPayload = z.object({
  data: z.array(
    z.object({ business_name: z.string(), code: z.string(), id: z.number() })
  ),
  status: z.boolean(),
});

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
  certificate_type: z.string(),
  created_at: z.string(),
  customer_id: z.number(),
  doc_no: z.string().nullable().optional(),
  doc_url: z.string().nullable().optional(),
  id: z.number(),
  modified_at: z.string(),
  validity_date: z.string().nullable().optional(),
});

export const CustomerInfoSchema = z.object({
  status: z.boolean().nullable().optional(),
  available_credit_limit: z.number().nullable().optional(),
  total_available_credit: z.number().nullable().optional(),
  total_payments: z.number().nullable().optional(),
  total_used_credit: z.number().nullable().optional(),
  data: z.object({
    business_name: z.string(),
    business_type: businessTypeSchema,
    business_type_id: z.number(),
    code: z.string(),
    contact_type: contactTypeSchema,
    contact_type_id: z.number(),
    created_at: z.string(),
    currency: currencySchema,
    customer_group_id: z.number().nullable().optional(),
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
    }),
  }),
});


export const CustomerSchema = z.object({
  business_name: z.string(),
  business_type: businessTypeSchema,
  business_type_id: z.number(),
  code: z.string(),
  contact_type: contactTypeSchema,
  contact_type_id: z.number(),
  created_at: z.string(),
  currency: currencySchema,
  customer_group_id: z.number().nullable().optional(),
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
  }),
});


export const BulkCustomerListSchema = z.object({
  status: z.boolean(),
  data: z.array(
    z.object({
      business_name: z.string(),
      business_type: businessTypeSchema,
      business_type_id: z.number(),
      code: z.string(),
      contact_type: contactTypeSchema,
      contact_type_id: z.number(),
      created_at: z.string(),
      currency: currencySchema,
      customer_group_id: z.number().nullable().optional(),
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
      }),
    })
  ),
});

export const CustomerGroupListSchema = z.object({
  status: z.boolean(),
  data: z.array(
    z.object({
      business_name: z.string(),
      code: z.string(),
      id: z.number()
    })
  ),
});

export const ContactManagerInfoSchema = z.object({
  address: z.string(),
  attention: z.string(),
  city: z.string(),
  country: z.string(),
  created_at: z.string(),
  customer_id: z.number(),
  customer: z.object({
    business_name: z.string(),
    business_type: businessTypeSchema,
    business_type_id: z.number(),
    code: z.string(),
    contact_type: contactTypeSchema,
    contact_type_id: z.number(),
    created_at: z.string(),
    currency: currencySchema,
    currency_id: z.number(),
    email: z.string().email().nullable().optional(),
    id: z.number(),
    modified_at: z.string(),
    nature_of_business: z.string().nullable().optional(),
  }),
  email: z.string().nullable(),
  fax: z.string().nullable(),
  id: z.number(),
  modified_at: z.string(),
  phone: z.string(),
  remarks: z.string().nullable(),
  state: z.string(),
  zip_code: z.string(),
});


export const ContactManagerBulkListSchema = z.object({
    items: z.record(
      z.string(),
      z.array(
        z.object({
          address: z.string(),
          attention: z.string(),
          city: z.string(),
          country: z.string(),
          created_at: z.string(),
          customer_id: z.number(),
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
  })
export type ContactManagerInfoBody = z.infer<typeof ContactManagerInfoSchema>;
export type ContactInfoBody = z.infer<typeof CustomerInfoSchema>;
