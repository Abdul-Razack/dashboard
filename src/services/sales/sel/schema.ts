import { z } from 'zod';
import { CustomerSchema } from  '../../apiService/Schema/CustomerSchema';
export type CreateSelPayload = z.infer<ReturnType<typeof zCreateSelPayload>>;
export type SelIndexPayload = z.infer<ReturnType<typeof zSelIndexPayload>>;
export type SelDataColumn = z.infer<ReturnType<typeof zSelDataColumn>>;
export type SelDetailsPayload = z.infer<ReturnType<typeof zSelDetailsPayload>>;
export type SelListPayload = z.infer<ReturnType<typeof zSelListPayload>>;

export const zCreateSelPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zSelListPayload = () => {
  return z.object({
    items: z.record(z.any()),
    status: z.boolean(),
  });
};

export const zSelIndexPayload = () => {
  return z.object({
    current_page: z.number().optional().nullable(),
    data: z.array(
      z.object({
        id: z.number(),
        created_at: z.string(),
        modified_at: z.string(),
        currency_id: z.number(),
        code: z.string().optional().nullable(),
        cust_rfq_date: z.string(),
        cust_rfq_no: z.string(),
        customer_contact_manager_id: z.number(),
        customer_id: z.number(),
        is_closed: z.boolean(),
        customer_shipping_address_id: z.number(),
        due_date: z.string(),
        fob_id: z.number(),
        mode_of_receipt_id: z.number(),
        payment_mode_id: z.number(),
        payment_terms_id: z.number(),
        priority_id: z.number(),
        remarks: z.string().nullable(),
        customer: CustomerSchema,
        user: z.object({
          created_at: z.string(),
          email: z.string(),
          id: z.number(),
          modified_at: z.string(),
          username: z.string(),
        }),
        user_id: z.number(),
        items: z.array(
          z.object({
            id: z.number(),
            part_number_id: z.number(),
            condition_id: z.number(),
            qty: z.number(),
            remark: z.string().nullable(),
            sales_log_id: z.number(),
            unit_of_measure_id: z.number(),
            is_closed: z.boolean(),
          })
        ),
        actions: z.string().optional(),
      })
    ),
    customers: z.array(z.number()).optional().nullable(),
    mode_of_receipts: z.array(z.number()).optional().nullable(),
    max_date: z.string().optional().nullable(),
    min_date: z.string().optional().nullable(),
    part_numbers: z.array(z.number()).optional().nullable(),
    total: z.number(),
    total_pages: z.number().optional().nullable(),
  });
};

export const zSelDataColumn = () => {
  return z.object({
    id: z.number(),
    created_at: z.string(),
    modified_at: z.string(),
    currency_id: z.number(),
    cust_rfq_date: z.string(),
    cust_rfq_no: z.string(),
    customer_contact_manager_id: z.number(),
    customer_id: z.number(),
    is_closed: z.boolean(),
    customer_shipping_address_id: z.number(),
    due_date: z.string(),
    fob_id: z.number(),
    mode_of_receipt_id: z.number(),
    payment_mode_id: z.number(),
    payment_terms_id: z.number(),
    priority_id: z.number(),
    remarks: z.string().nullable(),
    code: z.string().optional().nullable(),
    user: z.object({
      created_at: z.string(),
      email: z.string(),
      id: z.number(),
      modified_at: z.string(),
      username: z.string(),
    }),
    customer: CustomerSchema,
    user_id: z.number(),
    items: z.array(
      z.object({
        id: z.number(),
        part_number_id: z.number(),
        condition_id: z.number(),
        qty: z.number(),
        remark: z.string().nullable(),
        sales_log_id: z.number(),
        unit_of_measure_id: z.number(),
        is_closed: z.boolean(),
      })
    ),
    actions: z.optional(z.string()),
  });
};

export const zSelDetailsPayload = () => {
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
      code: z.string().optional().nullable(),
      due_date: z.string(),
      fob_id: z.number(),
      mode_of_receipt_id: z.number(),
      payment_mode_id: z.number(),
      payment_terms_id: z.number(),
      priority_id: z.number(),
      remarks: z.string().nullable(),
      items: z.array(
        z.object({
          id: z.number(),
          part_number_id: z.number(),
          condition_id: z.number(),
          qty: z.number(),
          remark: z.string(),
          sales_log_id: z.number(),
          unit_of_measure_id: z.number(),
        })
      ),
    }),
    status: z.boolean(),
  });
};
