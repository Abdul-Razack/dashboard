import { z } from 'zod';

export type LogisticsRequestDetailsPayload = z.infer<
  ReturnType<typeof zLogisticsRequestDetailsPayload>
>;
export type LogisticsRequestListByPOPayload = z.infer<
  ReturnType<typeof zLogisticsRequestListByPOPayload>
>;
export type CreateLogisticsRequestPayload = z.infer<
  ReturnType<typeof zCreateLogisticsRequestPayload>
>;
export type ReceiveLogisticsRequestPayload = z.infer<
  ReturnType<typeof zReceiveLogisticsRequestPayload>
>;
export type LogisticRequestDataColumn = z.infer<
  ReturnType<typeof zLogisticRequestDataColumn>
>;
export type ListPayload = z.infer<ReturnType<typeof zListPayload>>;
export type IndexPayload = z.infer<ReturnType<typeof zIndexPayload>>;

export type StockQtytDetailsPayload = z.infer<
  ReturnType<typeof zStockQtytDetailsPayload>
>;

export const detailSchema = z.object({
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

export const zLogisticRequestDataColumn = () => {
  return z.object({
    ...detailSchema.shape,
    actions: z.string().optional(),
  });
};

export const zIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(detailSchema),
    total: z.number(),
    total_pages: z.number(),
    customer_ids: z.array(z.number()).optional().nullable(),
    max_date: z.string().optional().nullable(),
    min_date: z.string().optional().nullable(),
    purchase_request_ids: z.array(z.number()).optional().nullable(),
    receiver_customer_ids: z.array(z.number()).optional().nullable(),
    purchase_order_ids: z.array(z.number()).optional().nullable(),
  });
};

export const zListPayload = () => {
  return z.object({
    items: z.record(z.number()),
    status: z.boolean(),
  });
};

export const LogisticRequestInfo = z.object({
      awb_number: z.string().nullable(),
      created_at: z.string(),
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
      customer_id: z.number(),
      customer_shipping_address: z.object({
        address: z.string(),
        attention: z.string(),
        city: z.string(),
        consignee_name: z.string(),
        country: z.string(),
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
        customer_id: z.number(),
        email: z.string().nullable(),
        fax: z.string().nullable(),
        id: z.number(),
        phone: z.string(),
        remarks: z.string().nullable(),
        state: z.string(),
        zip_code: z.string(),
      }),
      customer_shipping_address_id: z.number(),
      due_date: z.string(),
      id: z.number(),
      is_dg: z.boolean(),
      is_received: z.boolean(),
      items: z
        .array(
          z.object({
            condition_id: z.number(),
            id: z.number(),
            logistic_request_id: z.number(),
            logistic_request_package_id: z.number().nullable(),
            part_number_id: z.number(),
            purchase_order_id: z.number().nullable(),
            qty: z.number(),
          })
        )
        .optional(),
      modified_at: z.string(),
      no_of_package: z.number(),
      pcs: z.number(),
      packages: z.array(
        z.object({
          description: z.string(),
          height: z.number(),
          id: z.number(),
          is_dg: z.boolean(),
          is_obtained: z.boolean(),
          items: z
            .array(
              z.object({
                condition_id: z.number(),
                id: z.number(),
                logistic_request_id: z.number(),
                logistic_request_package_id: z.number().nullable(),
                part_number_id: z.number(),
                purchase_order_id: z.number().nullable(),
                qty: z.number(),
              })
            )
            .optional(),
          length: z.number(),
          logistic_request_id: z.number(),
          package_number: z.string(),
          package_type_id: z.number(),
          unit_of_measurement_id: z.number(),
          volumetric_weight: z.number(),
          weight: z.number(),
          weight_unit_of_measurement_id: z.number(),
          width: z.number(),
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
      quotations: z.any().nullable().optional(),
      received_user_id: z.number().nullable(),
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
      receiver_customer_id: z.number(),
      receiver_shipping_address: z.object({
        address: z.string(),
        attention: z.string(),
        city: z.string(),
        consignee_name: z.string(),
        country: z.string(),
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
        customer_id: z.number(),
        email: z.string().nullable(),
        fax: z.string().nullable(),
        id: z.number(),
        phone: z.string(),
        remarks: z.string().nullable(),
        state: z.string(),
        zip_code: z.string(),
      }),
      receiver_shipping_address_id: z.number(),
      remark: z.string().nullable(),
      ship_type_id: z.number(),
      ship_via_id: z.number(),
      type: z.string(),
      user_id: z.number().optional(),
      volumetric_weight: z.number(),
    });

export const zLogisticsRequestDetailsPayload = () => {
  return z.object({
    data: LogisticRequestInfo,
    status: z.boolean(),
  });
};

export const zLogisticsRequestListByPOPayload = () => {
  return z.object({
    data: z.array(
      z.object({
        awb_number: z.string().nullable(),
        created_at: z.string(),
        customer_id: z.number(),
        customer_shipping_address_id: z.number(),
        due_date: z.string(),
        id: z.number(),
        is_dg: z.boolean(),
        is_received: z.boolean(),
        pcs: z.number(),
        items: z
          .array(
            z.object({
              condition_id: z.number(),
              id: z.number(),
              logistic_request_id: z.number(),
              logistic_request_package_id: z.number().nullable(),
              part_number_id: z.number(),
              purchase_order_id: z.number().nullable(),
              qty: z.number(),
            })
          )
          .nullable(),
        modified_at: z.string(),
        no_of_package: z.number(),
        packages: z
          .array(
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
            })
          )
          .optional(),
        logistic_order_ids: z.array(z.number()),
        stf_type: z.string().nullable(),
        priority_id: z.number(),
        purchase_orders: z
          .array(
            z.object({
              id: z.number(),
              logistic_request_id: z.number(),
              purchase_order_id: z.number(),
            })
          )
          .optional(),
        received_user_id: z.number().nullable(),
        receiver_customer_id: z.number(),
        receiver_shipping_address_id: z.number(),
        remark: z.string().nullable(),
        ship_type_id: z.number(),
        ship_via_id: z.number(),
        type: z.string(),
        volumetric_weight: z.number(),
      })
    ),
    status: z.boolean(),
  });
};

export const zCreateLogisticsRequestPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zReceiveLogisticsRequestPayload = () => {
  return z.object({
    message: z.string(),
    status: z.boolean(),
  });
};

export const zStockQtytDetailsPayload = () => {
  return z.object({
    data: z.object({
      added_qty: z.number(),
      backorder_qty: z.number(),
      prev_received_qty: z.number(),
      total_po_qty: z.number(),
      total_received_qty: z.number(),
    }),
    status: z.boolean(),
  });
};
