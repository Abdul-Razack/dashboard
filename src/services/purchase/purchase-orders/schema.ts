import { z } from 'zod';

import { CustomerSchema } from '../../apiService/Schema/CustomerSchema';

export type PurchaseOrderIndexPayload = z.infer<
  ReturnType<typeof zPurchaseOrderIndexPayload>
>;
export type PurchaseOrderDataColumn = z.infer<
  ReturnType<typeof zPurchaseOrderDataColumn>
>;
export type PurchaseOrderListPayload = z.infer<
  ReturnType<typeof zPurchaseOrderListPayload>
>;
export type RelatedPurchaseOrderListPayload = z.infer<
  ReturnType<typeof zRelatedPurchaseOrderListPayload>
>;
export type PurchaseOrderDetailsPayload = z.infer<
  ReturnType<typeof zPurchaseOrderDetailsPayload>
>;
export type CreatePurchaseOrderPayload = z.infer<
  ReturnType<typeof zCreatePurchaseOrderPayload>
>;

export type UpdatePurchaseOrderPayload = z.infer<
  ReturnType<typeof zCreatePurchaseOrderPayload>
>;

export const zPurchaseOrderIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(
      z.object({
        quotations: z.array(
          z.object({
            expiry_date: z.string().nullable().optional(),
            id: z.number(),
            vendor_quotation_date: z.string().nullable().optional(),
            vendor_quotation_no: z.string().nullable().optional(),
          })
        ),
        rfq_ids: z.array(z.number()),
        bank_charge: z.number().nullable().optional(),
        created_at: z.string(),
        currency_id: z.number(),
        customer_contact_manager_id: z.number(),
        customer_id: z.number().nullable().optional(),
        discount: z.number().nullable().optional(),
        fob_id: z.number(),
        freight: z.number().nullable().optional(),
        id: z.number(),
        customer: CustomerSchema,
        version: z.number().nullable().optional(),
        token: z.string().nullable().optional(),
        items: z.array(
          z.object({
            condition_id: z.number(),
            id: z.number(),
            note: z.string().nullable().optional(),
            part_number_id: z.number(),
            price: z.number(),
            purchase_order_id: z.number(),
            qty: z.number(),
            unit_of_measure_id: z.number(),
          })
        ),
        print: z.string(),
        miscellaneous_charges: z.number().nullable().optional(),
        modified_at: z.string(),
        payment_mode_id: z.number(),
        payment_term_id: z.number(),
        priority_id: z.number(),
        remark: z.string().nullable().optional(),
        ship_account_id: z.number(),
        ship_customer_id: z.number().nullable().optional(),
        ship_customer_shipping_address_id: z.number(),
        ship_mode_id: z.number(),
        ship_type_id: z.number(),
        user_id: z.number(),
        vat: z.number().nullable().optional(),
        total_price: z.number().nullable().optional(),
        is_closed: z.boolean(),
        is_editable: z.boolean().nullable().optional(),
        user: z.object({
          created_at: z.string(),
          email: z.string(),
          id: z.number(),
          modified_at: z.string(),
          username: z.string(),
        }),
        purchase_requests: z.array(
          z.object({
            id: z.number(),
            ref: z.string().optional().nullable(),
            type: z.string(),
          })
        ),
      })
    ),
    customer_ids: z.array(z.number()).optional().nullable(),
    max_date: z.string().optional().nullable(),
    min_date: z.string().optional().nullable(),
    part_numbers: z.array(z.number()).optional().nullable(),
    purchase_request_ids: z.array(z.number()).optional().nullable(),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zPurchaseOrderDataColumn = () => {
  return z.object({
    is_closed: z.boolean(),
    is_editable: z.boolean().nullable().optional(),
    quotations: z.array(
      z.object({
        expiry_date: z.string(),
        id: z.number(),
        vendor_quotation_date: z.string(),
        vendor_quotation_no: z.string().nullable().optional(),
      })
    ),
    rfq_ids: z.array(z.number()),
    bank_charge: z.number().nullable().optional(),
    created_at: z.string(),
    currency_id: z.number(),
    customer_contact_manager_id: z.number(),
    customer_id: z.number().nullable().optional(),
    customer: CustomerSchema,
    discount: z.number().nullable().optional(),
    fob_id: z.number(),
    freight: z.number().nullable().optional(),
    id: z.number(),
    version: z.number().nullable().optional(),
    token: z.string().nullable().optional(),
    items: z.array(
      z.object({
        condition_id: z.number(),
        id: z.number(),
        note: z.string().nullable().optional(),
        part_number_id: z.number(),
        price: z.number(),
        purchase_order_id: z.number(),
        qty: z.number(),
        unit_of_measure_id: z.number(),
      })
    ),
    miscellaneous_charges: z.number().nullable().optional(),
    modified_at: z.string(),
    payment_mode_id: z.number(),
    payment_term_id: z.number(),
    priority_id: z.number(),
    remark: z.string().nullable().optional(),
    ship_account_id: z.number(),
    ship_customer_id: z.number().nullable().optional(),
    ship_customer_shipping_address_id: z.number(),
    ship_mode_id: z.number(),
    ship_type_id: z.number(),
    user_id: z.number(),
    vat: z.number().nullable().optional(),
    total_price: z.number().nullable().optional(),
    actions: z.optional(z.string()),
    user: z.object({
      created_at: z.string(),
      email: z.string(),
      id: z.number(),
      modified_at: z.string(),
      username: z.string(),
    }),
    purchase_requests: z.array(
      z.object({
        id: z.number(),
        ref: z.string().optional().nullable(),
        type: z.string(),
      })
    ),
  });
};

export const zPurchaseOrderListPayload = () => {
  return z.object({
    items: z.record(z.any()),
    status: z.boolean(),
  });
};

export const zRelatedPurchaseOrderListPayload = () => {
  return z.object({
    items: z.record(z.number()),
    status: z.boolean(),
  });
};

export const zPurchaseOrderDetailsPayload = () => {
  return z.object({
    data: z.object({
      bank_charge: z.number().nullable().optional(),
      created_at: z.string(),
      currency_id: z.number(),
      customer_contact_manager: z.object({
        address: z.string(),
        address_line2: z.string().nullable().optional(),
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
      }),
      customer_contact_manager_id: z.number(),
      customer_id: z.number().nullable(),
      discount: z.number().nullable().optional(),
      fob_id: z.number(),
      freight: z.number().nullable().optional(),
      id: z.number(),
      rfq_ids: z.array(z.number()),
      quotations: z.array(
        z.object({
          expiry_date: z.string().nullable().optional(),
          id: z.number(),
          vendor_quotation_date: z.string().nullable().optional(),
          vendor_quotation_no: z.string().nullable().optional(),
        })
      ),
      purchase_requests: z.array(
        z.object({
          id: z.number(),
          ref: z.string().optional().nullable(),
          type: z.string(),
        })
      ),
      items: z
        .array(
          z.object({
            condition_id: z.number(),
            id: z.number(),
            note: z.string().nullable().optional(),
            part_number_id: z.number(),
            price: z.number(),
            purchase_order_id: z.number(),
            qty: z.number(),
            unit_of_measure_id: z.number(),
            quotation_id: z.number().nullable().optional(),
            quotation_item_id: z.number().nullable().optional(),
          })
        ),
      is_editable: z.boolean().nullable().optional(),
      customer: CustomerSchema,
      miscellaneous_charges: z.number().nullable().optional(),
      print: z.string(),
      modified_at: z.string(),
      payment_mode_id: z.number(),
      payment_term_id: z.number(),
      priority_id: z.number(),
      remark: z.string().nullable().optional(),
      ship_account_id: z.number(),
      ship_customer_id: z.number().nullable().optional(),
      ship_customer_shipping_address_id: z.number(),
      ship_mode_id: z.number(),
      ship_type_id: z.number(),
      user_id: z.number(),
      vat: z.number().nullable().optional(),
      version: z.number().nullable().optional(),
      subtotal: z.number().nullable().optional(),
      total_price: z.number().nullable().optional(),
    }),
    status: z.boolean(),
  });
};

export const zCreatePurchaseOrderPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};
