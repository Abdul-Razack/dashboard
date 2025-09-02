import { z } from 'zod';

// Common Schemas
const Timestamp = z.string();
const NullableString = z.string().nullable();
const NullableNumber = z.number().nullable();

// User
const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  created_at: Timestamp,
  modified_at: Timestamp,
});

// Lookup Types
const BusinessTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: Timestamp,
  modified_at: Timestamp,
});

const CurrencySchema = z.object({
  id: z.number(),
  name: z.string(),
  code: z.string(),
  created_at: Timestamp,
  modified_at: Timestamp,
});

const ContactTypeSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: Timestamp,
  modified_at: Timestamp,
});

// Customer
const CustomerSchema = z.object({
  id: z.number(),
  code: z.string(),
  business_name: z.string(),
  business_type_id: z.number(),
  contact_type_id: z.number(),
  currency_id: z.number(),
  is_foreign_entity: z.boolean(),
  email: NullableString,
  remarks: NullableString,
  vat_tax_id: NullableString,
  vat_tax_url: NullableString,
  year_of_business: NullableNumber,
  license_trade_no: NullableString,
  license_trade_exp_date: NullableString,
  license_trade_url: NullableString.optional(),
  nature_of_business: NullableString.optional(),
  created_at: Timestamp,
  modified_at: Timestamp,
  business_type: BusinessTypeSchema,
  contact_type: ContactTypeSchema,
  currency: CurrencySchema,
});

const ReqUserSchema =  z
    .object({
      created_at: z.string(),
      email: z.string(),
      id: z.number(),
      modified_at: z.string(),
      username: z.string(),
    });

// Package
const PackageSchema = z.object({
  id: z.number(),
  logistic_request_id: z.number(),
  package_number: z.string(),
  package_type_id: z.number(),
  unit_of_measurement_id: z.number(),
  weight_unit_of_measurement_id: z.number(),
  length: z.number(),
  width: z.number(),
  height: z.number(),
  weight: z.number(),
  volumetric_weight: z.number(),
  pcs: z.number(),
  is_dg: z.boolean(),
  is_obtained: z.boolean(),
  description: z.string(),
});

// Item
const LogisticItemSchema = z.object({
  id: z.number(),
  condition_id: z.number(),
  part_number_id: z.number(),
  qty: z.number(),
  logistic_request_id: z.number(),
  logistic_request_package_id: NullableNumber,
  purchase_order_id: NullableNumber,
});

// Purchase Order Mapping
const PurchaseOrderMapSchema = z.object({
  id: z.number(),
  logistic_request_id: z.number(),
  purchase_order_id: z.number(),
});

// Logistic Request
export const logisticRequestSchema = z.object({
  id: z.number(),
  customer_id: z.number(),
  receiver_customer_id: z.number(),
  customer_shipping_address_id: z.number(),
  receiver_shipping_address_id: z.number(),
  priority_id: z.number(),
  ship_type_id: z.number(),
  ship_via_id: z.number(),
  pcs: z.number(),
  no_of_package: z.number(),
  volumetric_weight: z.number(),
  is_closed: z.boolean(),
  is_dg: z.boolean(),
  is_received: z.boolean(),
  remark: NullableString,
  awb_number: NullableString,
  received_user_id: NullableNumber,
  type: z.string(),
  created_at: Timestamp,
  modified_at: Timestamp,
  due_date: Timestamp,
  customer: CustomerSchema,
  receiver_customer: CustomerSchema,
  packages: z.array(PackageSchema),
  items: z.array(LogisticItemSchema),
  purchase_orders: z.array(PurchaseOrderMapSchema),
  user: UserSchema.nullable().optional(),
});

// Quotation
const LogisticQuotationSchema = z.object({
  id: z.number(),
  quotation_number: z.string(),
  carrier_name: z.string(),
  price: z.number(),
  min_weight: z.number().optional().nullable(),
  max_weight: z.number().optional().nullable(),
  currency_id: z.number(),
  customer_id: z.number(),
  user_id: z.number(),
  ship_type_id: z.number(),
  ship_via_id: z.number(),
  transit_day: z.number(),
  is_closed: z.boolean(),
  is_dg: z.boolean(),
  remark: NullableString,
  quotation_date: Timestamp,
  expiry_date: Timestamp,
  created_at: Timestamp,
  modified_at: Timestamp,
  customer: CustomerSchema,
});

export const LRFQSchema = z.object({
  id: z.number(),
  created_at: Timestamp,
  modified_at: Timestamp,
  due_date: Timestamp,
  is_dg: z.boolean(),
  no_of_package: z.number(),
  priority_id: z.number(),
  remark: NullableString,
  ship_type_id: z.number(),
  ship_via_id: z.number(),
  user_id: z.number(),
  volumetric_weight: z.number(),
});

// Index Payload
export const IndexPayload = z.object({
  current_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
  data: z.array(
    z.object({
      id: z.number(),
      user_id: z.number(),
      logistic_quotation_id: z.number(),
      purchase_order_ids: z.array(z.number()).optional().nullable(),
      logistic_quotation: LogisticQuotationSchema.optional().nullable(),
      logistic_request: logisticRequestSchema,
      lrfq: LRFQSchema.optional().nullable(),
      created_at: Timestamp,
      modified_at: Timestamp,
      user: ReqUserSchema.optional().nullable()
    })
  ),
  customer_ids: z.array(z.number()).optional().nullable(),
  lrfq_customer_ids: z.array(z.number()).optional().nullable(),
  receiver_customer_ids: z.array(z.number()).optional().nullable(),
  purchase_request_ids: z.array(z.number()).optional().nullable(),
  purchase_order_ids: z.array(z.number()).optional().nullable(),
  min_date: Timestamp.optional().nullable(),
  max_date: Timestamp.optional().nullable(),
});

// Flat Record Schema for Row Rendering
const LogisticsOrderDataColumn = z.object({
  id: z.number(),
  user_id: z.number(),
  logistic_quotation_id: z.number(),
  created_at: Timestamp,
  modified_at: Timestamp,
  purchase_order_ids: z.array(z.number()).optional().nullable(),
  logistic_quotation: LogisticQuotationSchema,
  logistic_request: logisticRequestSchema,
  lrfq: LRFQSchema,
  user: ReqUserSchema.optional().nullable(),
  actions: z.string().optional(),
});

export type DataColumn = z.infer<typeof LogisticsOrderDataColumn>;
