import { z } from 'zod';

export type PRFQIndexPayload = z.infer<ReturnType<typeof zPRFQIndexPayload>>;
export type PRFQDataColumn = z.infer<ReturnType<typeof PRFQDataColumn>>;
export type PRFQListPayload = z.infer<ReturnType<typeof zPRFQListPayload>>;
export type CombinePRItemsPayload = z.infer<
  ReturnType<typeof zCombinePRItemsPayload>
>;
export type PRFQDetailsPayload = z.infer<
  ReturnType<typeof zPRFQDetailsPayload>
>;
export type CreatePRFQPayload = z.infer<ReturnType<typeof zCreatePRFQPayload>>;
export type UpdatePRFQPayload = z.infer<ReturnType<typeof zCreatePRFQPayload>>;

export const zPRFQIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(
      z.object({
        created_at: z.string(),
        customers: z.array(
          z.object({
            customer_contact_manager_id: z.number(),
            customer_id: z.number(),
            quotation_fulfillment: z.number().nullable(),
            token: z.string().nullable().optional()
          })
        ),
        id: z.number(),
        is_closed: z.boolean().optional().nullable(),
        items: z.array(
          z.object({
            condition_id: z.number(),
            id: z.number(),
            part_number_id: z.number(),
            qty: z.number(),
            remark: z.string().nullable(),
            rfq_id: z.number(),
            unit_of_measure_id: z.number(),
            purchase_request_item_id: z.number(),
            purchase_request_id: z.number(),
          })
        ),
        modified_at: z.string(),
        need_by_date: z.string(),
        priority_id: z.number(),
        purchase_requests: z.array(z.object({
          created_at: z.string(),
          due_date: z.string(),
          id: z.number(),
          priority: z.object({
            created_at: z.string(),
            id: z.number(),
            modified_at: z.string(),
            name: z.string(),
          }),
          priority_id: z.number(),
          remark: z.string().nullable().optional(),
          type: z.string(),
          is_closed: z.boolean().optional().nullable(),
          ref: z.string().optional().nullable(),
          user: z.object({
            created_at: z.string(),
            email: z.string(),
            id: z.number(),
            modified_at: z.string(),
            username: z.string(),
          }),
          user_id: z.number(),
        })),
        user: z.object({
          created_at: z.string(),
          email: z.string(),
          id: z.number(),
          modified_at: z.string(),
          username: z.string(),
        }),
        remarks: z.string().nullable(),
        total_fulfillment: z.number().nullable(),
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

export const PRFQDataColumn = () => {
  return z.object({
    created_at: z.string(),
    customers: z.array(
      z.object({
        customer_contact_manager_id: z.number(),
        customer_id: z.number(),
        quotation_fulfillment: z.number().nullable(),
        token: z.string().nullable().optional(),
      })
    ),
    id: z.number(),
    is_closed: z.boolean().optional().nullable(),
    items: z.array(
      z.object({
        condition_id: z.number(),
        id: z.number(),
        part_number_id: z.number(),
        qty: z.number(),
        remark: z.string().nullable(),
        rfq_id: z.number(),
        unit_of_measure_id: z.number(),
        purchase_request_item_id: z.number(),
        purchase_request_id: z.number(),
      })
    ),
    modified_at: z.string(),
    need_by_date: z.string(),
    priority_id: z.number(),
    purchase_requests: z.array(z.object({
      created_at: z.string(),
      due_date: z.string(),
      id: z.number(),
      priority: z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
      }),
      priority_id: z.number(),
      remark: z.string().nullable().optional(),
      type: z.string(),
      is_closed: z.boolean().optional().nullable(),
      ref: z.string().optional().nullable(),
      user: z.object({
        created_at: z.string(),
        email: z.string(),
        id: z.number(),
        modified_at: z.string(),
        username: z.string(),
      }),
      user_id: z.number(),
    })),
    user: z.object({
      created_at: z.string(),
      email: z.string(),
      id: z.number(),
      modified_at: z.string(),
      username: z.string(),
    }),
    remarks: z.string().nullable(),
    total_fulfillment: z.number().nullable(),
    actions: z.optional(z.string()),
  });
};

export const zPRFQListPayload = () => {
  return z.object({
    items: z.record(z.number()),
    status: z.boolean(),
  });
};

export const zCombinePRItemsPayload = () => {
  return z.object({
    combined_items: z.array(
      z.object({
        condition_id: z.number(),
        part_number: z.string(),
        part_number_id: z.number(),
        qty: z.number(),
        remarks: z.array(z.string()).nullable().optional(),
        unit_of_measure_id: z.number(),
        purchase_request_ids: z.array(z.number()),
        purchase_request_item_id: z.number().nullable().optional(),
      })
    ),
    status: z.boolean(),
  });
};

export const zCreatePRFQPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};


export const zPRFQDetailsPayload = () => {
  return z.object({
    data: z.object({
      created_at: z.string(),
      customers: z.array(
        z.object({
          customer_contact_manager_id: z.number(),
          customer_id: z.number(),
          quotation_fulfillment: z.number().nullable(),
          token: z.string().nullable().optional(),
        })
      ),
      id: z.number(),
      items: z.array(
        z.object({
          condition_id: z.number(),
          id: z.number(),
          part_number_id: z.number(),
          qty: z.number(),
          remark: z.string().nullable().optional(),
          rfq_id: z.number(),
          unit_of_measure_id: z.number(),
          purchase_request_item_id: z.number(),
          is_no_quotation: z.boolean().nullable().optional(),
          no_quotation_added_datetime: z.string().nullable().optional(),
          no_quotation_added_user: z.number().nullable().optional(),
          purchase_request_id: z.number(),
        })
      ),
      modified_at: z.string(),
      need_by_date: z.string(),
      priority_id: z.number(),
      purchase_requests: z.array(z.object({
        created_at: z.string(),
        due_date: z.string(),
        id: z.number(),
        priority: z.object({
          created_at: z.string(),
          id: z.number(),
          modified_at: z.string(),
          name: z.string(),
        }),
        priority_id: z.number(),
        remark: z.string().nullable().optional(),
        type: z.string(),
        is_closed: z.boolean().optional().nullable(),
        ref: z.string().optional().nullable(),
        user: z.object({
          created_at: z.string(),
          email: z.string(),
          id: z.number(),
          modified_at: z.string(),
          username: z.string(),
        }),
        user_id: z.number(),
      })),
      remarks: z.string().nullable().optional(),
      total_fulfillment: z.number().nullable(),
    }),
    status: z.boolean(),
  });
};
