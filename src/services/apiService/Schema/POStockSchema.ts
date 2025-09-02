import { z } from 'zod';

export const PurchaseOrderSchema = z.object({
  bank_charge: z.number().nullable(),
  created_at: z.string(), // ISO date string or you could use z.date()
  currency_id: z.number(),
  customer_contact_manager: z.string().nullable(),
  customer_contact_manager_id: z.number(),
  customer_id: z.number(),
  discount: z.number().nullable(),
  fob_id: z.number(),
  freight: z.number().nullable(),
  id: z.number(),
  items: z.any().nullable(), // Adjust as necessary
  miscellaneous_charges: z.any().nullable(), // Adjust as necessary
  modified_at: z.string(), // ISO date string or you could use z.date()
  payment_mode_id: z.number(),
  payment_term_id: z.number(),
  priority_id: z.number(),
  quotation_ids: z.any().nullable(), // Adjust as necessary
  remark: z.string().nullable(),
  ship_account_id: z.number(),
  ship_customer_id: z.number().nullable().optional(),
  ship_customer_shipping_address_id: z.number(),
  ship_mode_id: z.number(),
  ship_type_id: z.number(),
  user_id: z.number(),
  vat: z.any().nullable(), // Adjust as necessary
});

export const BusinessTypeSchema = z.object({
  created_at: z.string(), // Adjust if you want to enforce a specific date format
  id: z.number(),
  modified_at: z.string(), // Adjust if you want to enforce a specific date format
  name: z.string(),
});

export const ContactTypeSchema = z.object({
  created_at: z.string(), // Adjust if you want to enforce a specific date format
  id: z.number(),
  modified_at: z.string(), // Adjust if you want to enforce a specific date format
  name: z.string(),
});

export const CurrencySchema = z.object({
  code: z.string(),
  created_at: z.string(), // Adjust if you want to enforce a specific date format
  id: z.number(),
  modified_at: z.string(), // Adjust if you want to enforce a specific date format
  name: z.string(),
});

const CustomerSchema = z.object({
  business_name: z.string(),
  business_type: BusinessTypeSchema,
  business_type_id: z.number(),
  code: z.string(),
  contact_type: ContactTypeSchema,
  contact_type_id: z.number(),
  created_at: z.string(), // Adjust if you want to enforce a specific date format
  currency: CurrencySchema,
  currency_id: z.number(),
  email: z.string().email().nullable().optional(),
  id: z.number(),
  is_foreign_entity: z.boolean(),
  license_trade_exp_date: z.string().nullable(), // Use z.date() if you prefer date objects
  license_trade_no: z.string().nullable(),
  license_trade_url: z.string().nullable(),
  modified_at: z.string(), // Adjust if you want to enforce a specific date format
  nature_of_business: z.string().nullable().optional(),
  remarks: z.string().nullable(),
  vat_tax_id: z.string().nullable(),
  vat_tax_url: z.string().nullable(),
  year_of_business: z.number().nullable(),
});

export const QuotationSchema = z.object({
  currency_id: z.number(),
  customer: CustomerSchema,
  expiry_date: z.string(), // Use z.date() if you prefer date objects
  remarks: z.string().nullable(),
  vendor_quotation_date: z.string(), // Use z.date() if you prefer date objects
  vendor_quotation_no: z.string(),
});

export const GrnSchema = z.object({
  bin_location_id: z.number(),
  created_at: z.string(), 
  id: z.number(),
  modified_at: z.string(),
  qty: z.number(),
  rack_id: z.number(),
  remark: z.string().optional(),
  stock_id: z.number(),
  user_id: z.number(),
  version: z.number(),
  warehouse_id: z.number(),
});


export const StfSchema = z.object({
  id: z.number(),
  awb_number: z.string(),
  ci_date: z.string(),
  logistic_request_id: z.number(),
  packing_slip_date: z.string(),
  packing_slip_no: z.string(),
  stf_customs: z.array(z.unknown()), 
  total_ci_value: z.number(),
  ship_type_id: z.number(),
});

export const StfPackageSchema = z.object({
  height: z.number(),
  id: z.number(),
  length: z.number(),
  logistic_request_package_id: z.number(),
  package_number: z.string(),
  package_type_id: z.number(),
  stf_id: z.number(),
  unit_of_measurement_id: z.number(),
  volumetric_weight: z.number(),
  weight: z.number(),
  weight_unit_of_measurement_id: z.number(),
  width: z.number(),
});

export const StockSchema = z.object({
  condition_id: z.number(),
  control_id: z.string(),
  created_at: z.string(),
  currency_id: z.number(),
  grn_version: z.number(),
  grns: z.array(GrnSchema),
  id: z.number(),
  inspection_user_id: z.number(),
  is_grn: z.boolean(),
  is_need_location_change: z.boolean(),
  is_quality_check: z.boolean(),
  is_quarantine: z.boolean(),
  llp: z.string(),
  logistic_request_item_id: z.number(),
  logistic_request_package_id: z.number(),
  modified_at: z.string(),
  part_number_id: z.number(),
  purchase_order_price: z.number(),
  qty: z.number(),
  remark: z.string().optional(),
  serial_lot_number: z.string(),
  shelf_life: z.string(),
  stf: StfSchema,
  stf_package: StfPackageSchema,
  tag_by: z.string(),
  tag_date: z.string(),
  trace: z.string(),
  type_of_tag_id: z.number(),
  files: z.array(
    z.object({
      file_name: z.string().nullable().optional(),
      id: z.number().nullable().optional(),
      stock_id: z.number().nullable().optional(),
      url: z.string().nullable().optional(),
      user_id: z.number().nullable().optional()
    })
  )
});

export const POStockResponsePayload = z.object({
  data: z.object({
    purchase_orders: z
      .array(
        z.object({
          condition_id: z.number(),
          id: z.number(),
          note: z.string().nullable(),
          part_number_id: z.union([z.number(), z.string()]),
          price: z.number(),
          purchase_order: PurchaseOrderSchema,
          purchase_order_id: z.number(),
          qty: z.number(),
          quotation_item_id: z.number(),
          unit_of_measure_id: z.number(),
        })
      )
      .optional(),
    quotations: z
      .array(
        z.object({
          condition_id: z.number(),
          created_at: z.string(), // Use z.date() if you prefer date objects
          delivery_options: z.string(),
          id: z.number(),
          modified_at: z.string(), // Use z.date() if you prefer date objects
          moq: z.number(),
          mov: z.any(),
          part_number_id: z.union([z.number(), z.string()]),
          price: z.string(),
          qty: z.number(),
          quotation: QuotationSchema,
          quotation_id: z.number(),
          remark: z.string(),
          requested_part_number_id: z.union([z.number(), z.string()]),
          rfq_item_id: z.number().nullable().optional(),
          unit_of_measure_id: z.number(),
        })
      ).optional(),
    stocks: z.array(StockSchema).optional(),
  }),
  status: z.boolean(),
});

export const PayloadSchema = z.object({
  part_number_id: z.union([z.number(), z.string()]),
});

export type LRFQBody = z.infer<typeof PayloadSchema>;
