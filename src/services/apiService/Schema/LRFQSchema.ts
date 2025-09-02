import { z } from 'zod';

export const logisticRequestSchema = z.object({
  is_closed: z.boolean(),
  awb_number: z.string().nullable(),
  created_at: z.string(),
  customer_id: z.number(),
  customer_shipping_address_id: z.number(),
  due_date: z.string(),
  id: z.number(),
  is_dg: z.boolean(),
  is_received: z.boolean(),
  pcs: z.number(),
  items: z.array(
    z.object({
      condition_id: z.number(),
      id: z.number(),
      logistic_request_id: z.number(),
      logistic_request_package_id: z.number().nullable(),
      part_number_id: z.number(),
      purchase_order_id: z.number().nullable(),
      qty: z.number(),
    })
  ),
  modified_at: z.string(),
  no_of_package: z.number(),
  packages: z.array(
    z.object({
      description: z.string(),
      height: z.number(),
      id: z.number(),
      is_dg: z.boolean(),
      is_obtained: z.boolean(),
      length: z.number(),
      logistic_request_id: z.number(),
      package_number: z.string(),
      package_type_id: z.number(),
      unit_of_measurement_id: z.number(),
      volumetric_weight: z.number(),
      weight: z.number(),
      weight_unit_of_measurement_id: z.number(),
      width: z.number(),
      pcs: z.number(),
    })
  ),
  priority_id: z.number(),
  purchase_orders: z.array(
    z.object({
      id: z.number(),
      logistic_request_id: z.number(),
      purchase_order_id: z.number(),
    })
  ),
  received_user_id: z.number().nullable(),
  receiver_customer_id: z.number(),
  receiver_shipping_address_id: z.number(),
  remark: z.string().nullable(),
  ship_type_id: z.number(),
  ship_via_id: z.number(),
  type: z.string(),
  volumetric_weight: z.number(),
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
    license_trade_url: z.string().nullable().optional(),
    modified_at: z.string(),
    nature_of_business: z.string().nullable().optional(),
    remarks: z.string().nullable(),
    vat_tax_id: z.string().nullable(),
    vat_tax_url: z.string().nullable(),
    year_of_business: z.number().nullable(),
  }),
  receiver_customer: z.object({
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
    license_trade_url: z.string().nullable().optional(),
    modified_at: z.string(),
    nature_of_business: z.string().nullable().optional(),
    remarks: z.string().nullable(),
    vat_tax_id: z.string().nullable(),
    vat_tax_url: z.string().nullable(),
    year_of_business: z.number().nullable(),
  }),
  user: z.object({
    created_at: z.string(),
    email: z.string(),
    id: z.number(),
    modified_at: z.string(),
    username: z.string(),
  }).nullable().optional()
});

export const IndexPayload = z.object({
  current_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
  data: z.array(
    z.object({
      purchase_order_ids: z.array(z.number()).optional().nullable(),
      logistic_request: logisticRequestSchema.optional().nullable(),
      created_at: z.string(),
      due_date: z.string(),
      id: z.number(),
      is_dg: z.boolean(),
      is_closed: z.boolean(),
      modified_at: z.string(),
      no_of_package: z.number(),
      priority_id: z.number(),
      remark: z.string().nullable(),
      ship_type_id: z.number(),
      ship_via_id: z.number(),
      user_id: z.number(),
      volumetric_weight: z.number(),
      lr_customers: z.array(
        z.object({
          customer_contact_manager_id: z.number(),
          customer_id: z.number(),
          id: z.number(),
          logistic_request_id: z.number(),
          lrfq_id: z.number(),
        })
      ),
    })
  ),
  customer_ids: z.array(z.number()).optional().nullable(),
  lrfq_customer_ids: z.array(z.number()).optional().nullable(),
  max_date: z.string().optional().nullable(),
  min_date: z.string().optional().nullable(),
  purchase_request_ids: z.array(z.number()).optional().nullable(),
  receiver_customer_ids: z.array(z.number()).optional().nullable(),
  purchase_order_ids: z.array(z.number()).optional().nullable(),
});

export const ListPayload = z.object({
  items: z.record(z.number()),
  status: z.boolean(),
});

export const LRFQInfoPayload = z.object({
  data: z.object({
    created_at: z.string(),
    due_date: z.string(),
    id: z.number(),
    is_dg: z.boolean(),
    lr_customers: z
      .array(
        z.object({
          customer_contact_manager_id: z.number(),
          customer_id: z.number(),
          id: z.number(),
          logistic_request_id: z.number(),
          lrfq_id: z.number(),
        })
      )
      .optional(),
    modified_at: z.string(),
    no_of_package: z.number(),
    priority_id: z.number().optional(),
    remark: z.string().nullable(),
    ship_type_id: z.number(),
    ship_via_id: z.number(),
    user_id: z.number(),
    volumetric_weight: z.number().nullable(),
  }),
  status: z.boolean(),
});

export const CreateResponsePayload = z.object({
  id: z.number().optional(),
  message: z.string(),
  status: z.boolean(),
});

export const PayloadSchema = z.object({
  priority_id: z.number(),
  ship_type_id: z.number(),
  ship_via_id: z.number(),
  is_dg: z.boolean(),
  due_date: z.string(),
  no_of_package: z.number(),
  volumetric_weight: z.number(),
  remark: z.string().nullable(),
  lr_customers: z.array(
    z.object({
      logistic_request_id: z.number(),
      customer_id: z.number(),
      customer_contact_manager_id: z.number(),
    })
  ),
});

const LRFQDataColumn = z.object({
  logistic_request: logisticRequestSchema.optional().nullable(),
  purchase_order_ids: z.array(z.number()).optional().nullable(),
  created_at: z.string(),
  lr_customers: z.array(
    z.object({
      customer_contact_manager_id: z.number(),
      customer_id: z.number(),
      id: z.number(),
      logistic_request_id: z.number(),
      lrfq_id: z.number(),
    })
  ),
  id: z.number(),
  due_date: z.string(),
  is_dg: z.boolean(),
  is_closed: z.boolean(),
  modified_at: z.string(),
  no_of_package: z.number(),
  volumetric_weight: z.number(),
  priority_id: z.number(),
  remarks: z.string().nullable(),
  ship_type_id: z.number(),
  ship_via_id: z.number(),
  user_id: z.number(),
  actions: z.optional(z.string()),
});

export type LRFQBody = z.infer<typeof PayloadSchema>;
export type DataColumn = z.infer<typeof LRFQDataColumn>;
