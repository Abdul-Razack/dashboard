import { z } from 'zod';

export type InvoiceIndexPayload = z.infer<
  ReturnType<typeof zInvoiceIndexPayload>
>;
export type InvoiceDataColumn = z.infer<ReturnType<typeof zInvoiceDataColumn>>;
export type InvoiceListPayload = z.infer<
  ReturnType<typeof zInvoiceListPayload>
>;
export type InvoiceDetailsPayload = z.infer<
  ReturnType<typeof zInvoiceDetailsPayload>
>;
export type CreateInvoicePayload = z.infer<
  ReturnType<typeof zCreateInvoicePayload>
>;
export type UpdateInvoicePayload = z.infer<
  ReturnType<typeof zCreateInvoicePayload>
>;

export type ListInvoiceByOrderIDPayload = z.infer<
  ReturnType<typeof zListInvoiceByOrderIDPayload>
>;

export const zInvoiceIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(
      z.object({
        created_at: z.string(),
        date: z.string(),
        id: z.number(),
        purchase_order_id: z.number(),
        remarks: z.string().nullable().optional(),
        type: z.string(),
        user_id: z.number(),
        items: z.array(
          z.object({
            id: z.number(),
            invoice_number: z.string(),
            invoice_date: z.string(),
            invoice_value: z.number(),
            due_date: z.string(),
            payment_term_id: z.number(),
            remarks: z.string().nullable().optional(),
          })
        ),
      })
    ),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zInvoiceDataColumn = () => {
  return z.object({
    created_at: z.string(),
    date: z.string(),
    id: z.number(),
    purchase_order_id: z.number(),
    remarks: z.string().nullable().optional(),
    type: z.string(),
    user_id: z.number(),
    actions: z.optional(z.string()),
  });
};

export const zInvoiceListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

export const zInvoiceDetailsPayload = () => {
  return z.object({
    data: z.object({
      created_at: z.string(),
      date: z.string(),
      id: z.number(),
      purchase_order_id: z.number(),
      remarks: z.string().nullable().optional(),
      type: z.string(),
      user_id: z.number(),
      items: z.array(
        z.object({
          id: z.number(),
          invoice_number: z.string(),
          invoice_date: z.string(),
          invoice_value: z.number(),
          due_date: z.string(),
          payment_term_id: z.number(),
          remarks: z.string().nullable().optional(),
        })
      ),
    }),
    status: z.boolean(),
  });
};

export const zCreateInvoicePayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zListInvoiceByOrderIDPayload = () => {
  return z.object({
    data: z
      .array(
        z.object({
          modified_at: z.string(),
          created_at: z.string(),
          id: z.number(),
          currency_id: z.number(),
          inv_entry_no: z.string(),
          invoice_type: z.string(),
          invoice_amount: z.number(),
          customer_bank_id: z.number(),
          payment_term_id: z.number(),
          remarks: z.string().nullable().optional(),
          payment_done_date: z.string(),
          purchase_order_id: z.number(),
          payment_done_by: z.string().nullable().optional(),
          tax_invoice_date: z.string().nullable().optional(),
          tax_invoice_no: z.string().nullable().optional(),
          file: z.string().nullable().optional(),
          user_id: z.number(),
        })
      )
      .nullable()
      .optional(),
    status: z.boolean(),
  });
};
