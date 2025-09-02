import { z } from 'zod';

export type ProformaInvoiceIndexPayload = z.infer<
  ReturnType<typeof zProformaInvoiceIndexPayload>
>;
export type ProformaInvoiceDataColumn = z.infer<
  ReturnType<typeof zProformaInvoiceDataColumn>
>;
export type ProformaInvoiceListPayload = z.infer<
  ReturnType<typeof zProformaInvoiceListPayload>
>;
export type ProformaInvoiceDetailsPayload = z.infer<
  ReturnType<typeof zProformaInvoiceDetailsPayload>
>;
export type CreateProformaInvoicePayload = z.infer<
  ReturnType<typeof zCreateProformaInvoicePayload>
>;
export type UpdateProformaInvoicePayload = z.infer<
  ReturnType<typeof zCreateProformaInvoicePayload>
>;

export type ListProformaInvoiceByOrderIDPayload = z.infer<
  ReturnType<typeof zListProformaInvoiceByOrderIDPayload>
>;

export const zProformaInvoiceIndexPayload = () => {
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
            narration: z.string().nullable().optional(),
          })
        ),
      })
    ),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zProformaInvoiceDataColumn = () => {
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

export const zProformaInvoiceListPayload = () => {
  return z.object({
    items: z.record(z.number()),
    status: z.boolean(),
  });
};

export const zProformaInvoiceDetailsPayload = () => {
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
          narration: z.string().nullable().optional(),
        })
      ),
    }),
    status: z.boolean(),
  });
};

export const zCreateProformaInvoicePayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zListProformaInvoiceByOrderIDPayload = () => {
  return z.object({
    data: z.array(z.object({
      modified_at: z.string(),
      created_at: z.string(),
      id: z.number(),
      invoice_number: z.string(),
      invoice_date: z.string(),
      invoice_amount: z.number(),
      customer_bank_id: z.number(),
      due_date: z.string(),
      payment_term_id: z.number(),
      narration: z.string().nullable().optional(),
      date: z.string(),
      purchase_order_id: z.number(),
      file: z.string().nullable().optional(),
      user_id: z.number(),
    })).nullable().optional(),
    status: z.boolean(),
  });
};
