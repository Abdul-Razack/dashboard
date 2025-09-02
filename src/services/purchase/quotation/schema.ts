import { z } from 'zod';
import { CustomerSchema } from  '../../apiService/Schema/CustomerSchema'

export type QuotationIndexPayload = z.infer<
  ReturnType<typeof zQuotationIndexPayload>
>;
export type QuotationDataColumn = z.infer<
  ReturnType<typeof zQuotationDataColumn>
>;
export type QuotationItemsDataColumn = z.infer<
  ReturnType<typeof zQuotationItemsDataColumn>
>;
export type QuotationListPayload = z.infer<
  ReturnType<typeof zQuotationListPayload>
>;
export type QuotationDetailsPayload = z.infer<
  ReturnType<typeof zQuotationDetailsPayload>
>;
export type QuotationItemsByRFQPayload = z.infer<
  ReturnType<typeof zQuotationItemsByRFQPayload>
>;
export type QuotationListByRFQCustomerPayload = z.infer<
  ReturnType<typeof zQuotationListByRFQCustomerPayload>
>;
export type QuotationRelatedListPayload = z.infer<
  ReturnType<typeof zQuotationRelatedListPayload>
>;
export type QuotationsByRFQPayload = z.infer<
  ReturnType<typeof zQuotationsByRFQPayload>
>;
export type CreateQuotationPayload = z.infer<
  ReturnType<typeof zCreateQuotationPayload>
>;
export type CreateQuotationItemPayload = z.infer<
  ReturnType<typeof zCreateQuotationItemPayload>
>;

export type QuotationItemNQPayload = z.infer<ReturnType<typeof zQuotationItemNQPayload>>;

export const zQuotationItemNQPayload = () => {
  return z.object({
    message: z.string(),
    status: z.boolean(),
  });
};

export const zQuotationIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(
      z.object({
        created_at: z.string(),
        currency_id: z.number(),
        customer_id: z.number(),
        id: z.number(),
        rfq_need_by_date: z.string(),
        is_closed: z.boolean().optional().nullable(),
        items: z.array(
          z.object({
            condition_id: z.number(),
            delivery_options: z.string().nullable(),
            id: z.number(),
            moq: z.number(),
            mov: z.string().nullable(),
            part_number_id: z.number(),
            price: z.string(),
            qty: z.number(),
            quotation_id: z.number(),
            remark: z.string(),
            unit_of_measure_id: z.number(),
          })
        ),
        customer: CustomerSchema,
        modified_at: z.string(),
        rfq_id: z.number(),
        vendor_quotation_date: z.string(),
        expiry_date: z.string(),
        vendor_quotation_no: z.string(),
        purchase_requests: z.array(z.object({
          id: z.number(),
          ref: z.string().optional().nullable(),
          type: z.string()
        })),
        user: z.object({
          created_at: z.string(),
          email: z.string(),
          id: z.number(),
          modified_at: z.string(),
          username: z.string(),
        }),
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

export const zQuotationDataColumn = () => {
  return z.object({
    created_at: z.string(),
    currency_id: z.number(),
    customer_id: z.number(),
    id: z.number(),
    is_closed: z.boolean().optional().nullable(),
    items: z.array(
      z.object({
        condition_id: z.number(),
        delivery_options: z.string().nullable(),
        id: z.number(),
        moq: z.number(),
        mov: z.string().nullable(),
        part_number_id: z.number(),
        price: z.string(),
        qty: z.number(),
        quotation_id: z.number(),
        remark: z.string(),
        unit_of_measure_id: z.number(),
      })
    ),
    customer: CustomerSchema,
    modified_at: z.string(),
    rfq_id: z.number(),
    expiry_date: z.string(),
    vendor_quotation_date: z.string(),
    vendor_quotation_no: z.string(),
    purchase_requests: z.array(z.object({
      id: z.number(),
      ref: z.string().optional().nullable(),
      type: z.string()
    })),
    rfq_need_by_date: z.string(),
    actions: z.optional(z.string()),
    user: z.object({
      created_at: z.string(),
      email: z.string(),
      id: z.number(),
      modified_at: z.string(),
      username: z.string(),
    }),
  });
};

export const zQuotationItemsDataColumn = () => {
  return z.object({
    condition_id: z.number(),
    created_at: z.string(),
    delivery_options: z.string(),
    id: z.number(),
    modified_at: z.string(),
    moq: z.number(),
    mov: z.string().nullable(),
    part_number_id: z.number(),
    price: z.string(),
    qty: z.number(),
    quotation: z.object({
      currency_id: z.number(),
      customer: z.object({
        business_name: z.string(),
        business_type: z.object({
          created_at: z.string(),
          id: z.number(),
          modified_at: z.string(),
          name: z.string(),
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
        created_at: z.string(),
        currency: z.object({
          code: z.string(),
          created_at: z.string(),
          id: z.number(),
          modified_at: z.string(),
          name: z.string(),
        }),
        currency_id: z.number(),
        email: z.string().nullable(),
        id: z.number(),
        is_foreign_entity: z.boolean(),
        license_trade_exp_date: z.string().nullable(),
        license_trade_no: z.string().nullable(),
        license_trade_url: z.string().nullable(),
        modified_at: z.string(),
        nature_of_business: z.string().nullable().optional(),
        remarks: z.string().nullable(),
        vat_tax_id: z.string().nullable(),
        vat_tax_url: z.string().nullable(),
        year_of_business: z.number().nullable(),
      }),
      expiry_date: z.string().nullable(),
      remarks: z.string().nullable().optional(),
      vendor_quotation_date: z.string(),
      vendor_quotation_no: z.string(),
    }),
    quotation_id: z.number(),
    remark: z.string(),
    requested_part_number_id: z.number(),
    unit_of_measure_id: z.number(),
  });
};

export const zQuotationListPayload = () => {
  return z.object({
    items: z.record(z.number()),
    status: z.boolean(),
  });
};

export const zQuotationRelatedListPayload = () => {
  return z.object({
    items: z.record(z.number()),
    status: z.boolean(),
  });
};

export const zQuotationDetailsPayload = () => {
  return z.object({
    quotation: z.object({
      created_at: z.string(),
      currency_id: z.number(),
      customer_id: z.number(),
      expiry_date: z.string().nullable(),
      id: z.number(),
      items: z.array(
        z.object({
          condition_id: z.number(),
          delivery_options: z.string().nullable(),
          id: z.number(),
          moq: z.number(),
          mov: z.string().nullable(),
          part_number_id: z.number(),
          price: z.string(),
          qty: z.number(),
          quotation_id: z.number(),
          remark: z.string(),
          requested_part_number_id: z.number(),
          unit_of_measure_id: z.number(),
          is_editable: z.boolean().optional(),
        })
      ),
      modified_at: z.string(),
      quotation_file: z.string().nullable(),
      remarks: z.string().nullable(),
      rfq_id: z.number(),
      user_id: z.number().nullable(),
      vendor_quotation_date: z.string(),
      vendor_quotation_no: z.string(),
      version: z.number(),
    }),
    status: z.boolean(),
  });
};

export const zQuotationItemsByRFQPayload = () => {
  return z.object({
    items: z.array(
      z.object({
        condition_id: z.number(),
        created_at: z.string(),
        delivery_options: z.string(),
        id: z.number(),
        modified_at: z.string(),
        moq: z.number(),
        mov: z.string().nullable(),
        part_number_id: z.number(),
        price: z.string(),
        qty: z.number(),
        quotation: z.object({
          currency_id: z.number(),
          customer: z.object({
            business_name: z.string(),
            business_type: z.object({
              created_at: z.string(),
              id: z.number(),
              modified_at: z.string(),
              name: z.string(),
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
            created_at: z.string(),
            currency: z.object({
              code: z.string(),
              created_at: z.string(),
              id: z.number(),
              modified_at: z.string(),
              name: z.string(),
            }),
            currency_id: z.number(),
            email: z.string().nullable(),
            id: z.number(),
            is_foreign_entity: z.boolean(),
            license_trade_exp_date: z.string().nullable(),
            license_trade_no: z.string().nullable(),
            license_trade_url: z.string().nullable(),
            modified_at: z.string(),
            nature_of_business: z.string().nullable().optional(),
            remarks: z.string().nullable(),
            vat_tax_id: z.string().nullable(),
            vat_tax_url: z.string().nullable(),
            year_of_business: z.number().nullable(),
          }),
          expiry_date: z.string().nullable(),
          remarks: z.string().nullable().optional(),
          vendor_quotation_date: z.string(),
          vendor_quotation_no: z.string(),
        }),
        quotation_id: z.number(),
        remark: z.string(),
        requested_part_number_id: z.number(),
        unit_of_measure_id: z.number(),
      })
    ),
    status: z.boolean(),
  });
};

export const zQuotationListByRFQCustomerPayload = () => {
  return z.object({
    quotations: z.array(
      z.object({
        created_at: z.string(),
        currency_id: z.number(),
        customer_id: z.number(),
        expiry_date: z.string().nullable(),
        id: z.number(),
        items: z.array(
          z.object({
            condition_id: z.number(),
            delivery_options: z.string(),
            id: z.number(),
            moq: z.number(),
            mov: z.string().nullable(),
            part_number_id: z.number(),
            price: z.string(),
            qty: z.number(),
            quotation_id: z.number(),
            remark: z.string().nullable(),
            requested_part_number_id: z.number(),
            unit_of_measure_id: z.number(),
          })
        ),
        modified_at: z.string(),
        quotation_file: z.any().nullable(),
        remarks: z.string().nullable(),
        rfq_id: z.number(),
        user_id: z.number(),
        vendor_quotation_date: z.string(),
        vendor_quotation_no: z.string(),
        version: z.number(),
      })
    ),
    status: z.boolean(),
  });
};

export const zQuotationsByRFQPayload = () => {
  return z.object({
    quotations: z.array(
      z.object({
        created_at: z.string(),
        currency_id: z.number(),
        customer: z.object({
          business_name: z.string(),
          business_type: z.object({
            created_at: z.string(),
            id: z.number(),
            modified_at: z.string(),
            name: z.string(),
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
          created_at: z.string(),
          currency: z.object({
            code: z.string(),
            created_at: z.string(),
            id: z.number(),
            modified_at: z.string(),
            name: z.string(),
          }),
          currency_id: z.number(),
          email: z.string().nullable(),
          id: z.number(),
          is_foreign_entity: z.boolean(),
          license_trade_exp_date: z.string().nullable(),
          license_trade_no: z.string().nullable(),
          license_trade_url: z.string().nullable(),
          modified_at: z.string(),
          nature_of_business: z.string().nullable(),
          remarks: z.string().nullable(),
          vat_tax_id: z.string().nullable(),
          vat_tax_url: z.string().nullable(),
          year_of_business: z.number().nullable(),
        }),
        customer_id: z.number(),
        expiry_date: z.string().nullable(),
        id: z.number(),
        items: z.array(
          z.object({
            condition_id: z.number(),
            created_at: z.string(),
            delivery_options: z.string(),
            id: z.number(),
            modified_at: z.string(),
            moq: z.number(),
            mov: z.string().nullable(),
            part_number_id: z.number(),
            price: z.string(),
            purchase_request: z.object({
                id: z.number(),
                ref: z.string(),
                type: z.string(),
            }),
            qty: z.number(),
            quotation_id: z.number(),
            remark: z.string(),
            requested_part_number_id: z.number(),
            unit_of_measure_id: z.number(),
          })
        ),
        modified_at: z.string(),
        quotation_file: z.string().nullable(),
        remarks: z.string().nullable(),
        rfq_id: z.number(),
        user_id: z.number(),
        vendor_quotation_date: z.string(),
        vendor_quotation_no: z.string(),
        version: z.number(),
      })
    ),
    status: z.boolean(),
  });
};

export const zCreateQuotationPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zCreateQuotationItemPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};
