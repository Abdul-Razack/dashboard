import { z } from 'zod';

/**
 * 🔁 Reusable Subschemas
 */
const TimestampSchema = z.object({
  created_at: z.string(),
  modified_at: z.string(),
});

const NameIdSchema = TimestampSchema.extend({
  id: z.number(),
  name: z.string(),
});

const CurrencySchema = NameIdSchema.extend({
  code: z.string(),
});

const UNInfoSchema = NameIdSchema.extend({
  classs: z.string(),
  description: z.string(),
});

const HscCodeSchema = NameIdSchema;

const ContactTypeSchema = NameIdSchema;

const BusinessTypeSchema = NameIdSchema;

const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
});

const CustomerSchema = z.object({
  id: z.number(),
  business_name: z.string(),
  code: z.string(),
  currency_id: z.number(),
  email: z.string().nullable(),
  contact_type_id: z.number(),
  business_type_id: z.number(),
  created_at: z.string(),
  modified_at: z.string(),
  license_trade_exp_date: z.string().nullable(),
  license_trade_no: z.string().nullable(),
  license_trade_url: z.string().nullable(),
  is_foreign_entity: z.boolean(),
  remarks: z.string().nullable(),
  vat_tax_id: z.string().nullable(),
  vat_tax_url: z.string().nullable(),
  year_of_business: z.number().nullable(),
  nature_of_business: z.string().nullable().optional(),
  currency: CurrencySchema,
  contact_type: ContactTypeSchema,
  business_type: BusinessTypeSchema,
});

const QuotationSchema = z.object({
  currency_id: z.number(),
  customer: CustomerSchema,
  expiry_date: z.string().nullable(),
  remarks: z.string().nullable().optional(),
  vendor_quotation_date: z.string(),
  vendor_quotation_no: z.string(),
});

const SpareSchema = z.object({
  id: z.number(),
  ata: z.string().nullable().optional(),
  created_at: z.string(),
  description: z.string(),
  hsc_code_id: z.number().nullable().optional(),
  ipc_ref: z.string().nullable().optional(),
  is_dg: z.boolean(),
  is_llp: z.boolean(),
  is_shelf_life: z.boolean(),
  is_serialized: z.boolean().nullable().optional(),
  modified_at: z.string(),
  msds: z.string().nullable().optional(),
  picture: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  spare_model_id: z.number().nullable().optional(),
  spare_type_id: z.number(),
  total_shelf_life: z.number().nullable().optional(),
  unit_of_measure_id: z.number(),
  xref: z.string().nullable().optional(),
  hsc_code: HscCodeSchema.nullable().optional(),
  un: UNInfoSchema.nullable().optional(),
});

/**
 * 🧩 PartNumber & Alternates
 */
const PartNumberSchema = z.object({
  id: z.number(),
  part_number: z.string(),
  description: z.string(),
  hsc_code_id: z.number(),
  spare_type_id: z.number(),
  unit_of_measure_id: z.number(),
  user_id: z.number(),

  is_dg: z.boolean(),
  is_llp: z.boolean(),
  is_shelf_life: z.boolean(),
  is_approved: z.boolean(),
  is_alternate: z.boolean(),
  is_serialized: z.boolean().nullable(),

  ata: z.string().nullable(),
  ipc_ref: z.string().nullable(),
  msds: z.string().nullable(),
  remarks: z.string().nullable(),
  picture: z.string().nullable(),
  xref: z.string().nullable(),
  spare_id: z.number().nullable(),
  spare_model_id: z.number().nullable().optional(),
  total_shelf_life: z.number().nullable(),
  un_id: z.number().nullable(),
  manufacturer_name: z.string().nullable(),
  cage_code: z.string().nullable(),
  unit_of_measure_group_id: z.number().nullable(),
  created_at: z.string(),
  modified_at: z.string(),

  user: UserSchema.nullable().optional(),
});

const AlternateSchema = z.object({
  id: z.number(),
  part_number_id: z.number(),
  alternate_part_number_id: z.number(),
  remark: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
  alternate_part_number: PartNumberSchema,
});

const PartNumberInfoPayload = PartNumberSchema.extend({
  alternates: z.array(AlternateSchema),
});

export const SpareDetailsPayload =
  z.object({
    status: z.boolean(),
    part_number: PartNumberInfoPayload,
  });

/**
 * 📦 Main Payloads
 */
export const ListPayload = z.object({
  items: z.record(z.number()),
  status: z.boolean(),
});

export const SearchResponsePayload = z.object({
  results: z.array(
    z.object({
      part_number: z.string(),
      id: z.number().nullable().optional(),
      description: z.string().nullable().optional(),
      unit_of_measure_id: z.number().nullable().optional(),
    })
  ),
  status: z.boolean(),
});

export const PayloadSchema = z.object({
  part_numbers: z.array(z.string()),
});

export const QuotationItemsByRFQPayload = z.object({
  items: z.array(
    z.object({
      id: z.number(),
      condition_id: z.number(),
      created_at: z.string(),
      modified_at: z.string(),
      moq: z.number(),
      mov: z.string().nullable(),
      price: z.string(),
      qty: z.number(),
      remark: z.string(),
      part_number_id: z.number(),
      requested_part_number_id: z.number(),
      quotation_id: z.number(),
      unit_of_measure_id: z.number(),
      is_editable: z.boolean().nullable().optional(),
      delivery_options: z.string(),
      quotation: QuotationSchema,
    })
  ),
  status: z.boolean(),
  is_no_quotation: z.boolean(),
  is_show_no_quotation: z.boolean(),
});

export const PartNumbersBySparePayload = z.object({
  part_numbers: z.array(
    z.object({
      id: z.number(),
      part_number: z.string(),
      created_at: z.string(),
      modified_at: z.string(),
      is_alternate: z.boolean(),
      is_approved: z.boolean(),
      spare: SpareSchema,
    })
  ),
  status: z.boolean(),
});

/**
 * 🧾 Type Inference
 */
export type LRFQBody = z.infer<typeof PayloadSchema>;
