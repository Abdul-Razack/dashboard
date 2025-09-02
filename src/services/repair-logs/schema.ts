import { z } from 'zod';
export type CreateRepairLogPayload = z.infer<ReturnType<typeof zCreateRepairLogPayload>>;
export type RepairLogIndexPayload = z.infer<ReturnType<typeof zRepairLogIndexPayload>>;
export type RepairLogDataColumn = z.infer<ReturnType<typeof zRepairLogDataColumn>>;
export type RepairLogDetailsPayload = z.infer<ReturnType<typeof zRepairLogDetailsPayload>>;
export type RepairLogListPayload = z.infer<ReturnType<typeof zRepairLogListPayload>>;

const repairItemSchema = z.object({
  condition_id: z.number(),
  defect: z.string().nullable().optional(),
  id: z.number(),
  is_bc: z.boolean(),
  is_oh: z.boolean(),
  is_rp: z.boolean(),
  part_number_id: z.number(),
  purchase_order_item_id: z.nullable(z.number()),
  purchase_request_item_id: z.nullable(z.number()),
  qty: z.number(),
  remark: z.string().nullable().optional(),
  repair_log_id: z.number(),
  sales_log_item_id: z.nullable(z.number()),
  unit_of_measure_id: z.number()
});

// Schema for each repair log entry
const repairLogSchema = z.object({
  created_at: z.string(),
  ref_name: z.string().nullable().optional(),
  due_date: z.string(), // Could refine to date format if needed
  id: z.number(),
  is_closed: z.boolean(),
  items: z.array(repairItemSchema),
  modified_at: z.string(),
  priority_id: z.number(),
  project_date: z.nullable(z.string()), // Could refine to date format
  project_ref: z.nullable(z.string()),
  purchase_order_id: z.nullable(z.number()),
  purchase_request_id: z.nullable(z.number()),
  remark: z.string().nullable().optional(),
  sales_log_id: z.nullable(z.number()),
  type: z.string(),
  user_id: z.number(),
  version: z.number(),
  user: z.object({
            created_at: z.string(),
            email: z.string(),
            id: z.number(),
            modified_at: z.string(),
            username: z.string(),
          }).optional().nullable(),
});


export const zCreateRepairLogPayload = () => {
    return z.object({
      id: z.number().optional(),
      message: z.string(),
      status: z.boolean(),
    });
};

export const zRepairLogIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(repairLogSchema),
    total: z.number(),
    total_pages: z.number().optional().nullable(),
    max_date: z.string().optional().nullable(),
    min_date: z.string().optional().nullable(),
    part_numbers: z.array(z.number()).optional().nullable(),
  });
};

export const zRepairLogDataColumn = () => {
  return repairLogSchema.extend({
    actions: z.optional(z.string())
  });
};

export const zRepairLogDetailsPayload = () => {
  return z.object({
    data: z.object({
      id: z.number(),
      created_at: z.string(),
      modified_at: z.string(),
      currency_id: z.number(),
      cust_rfq_date: z.string(),
      cust_rfq_no: z.string(),
      customer_contact_manager_id: z.number(),
      customer_id: z.number(),
      customer_shipping_address_id: z.number(),
      due_date: z.string(),
      fob_id: z.number(),
      mode_of_receipt_id: z.number(),
      payment_mode_id: z.number(),
      payment_terms_id: z.number(),
      priority_id: z.number(),
      remarks: z.string().nullable().optional(),
      items: z.array(
        z.object({
          id: z.number(),
          part_number_id: z.number(),
          condition_id: z.number(),
          qty: z.number(),
          remark: z.string(),
          sales_log_id: z.number(),
          unit_of_measure_id: z.number()
        })
      )
    }),
    status: z.boolean()
  });
};

export const zRepairLogListPayload = () => {
  return z.object({
    items: z.record(z.any()),
    status: z.boolean(),
  });
};