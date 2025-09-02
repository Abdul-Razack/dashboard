import { z } from 'zod';

export type PRIndexPayload = z.infer<ReturnType<typeof zPRIndexPayload>>;
export type PRDataColumn = z.infer<ReturnType<typeof zPRDataColumn>>;
export type PRListPayload = z.infer<ReturnType<typeof zPRListPayload>>;
export type PRDetailsPayload = z.infer<ReturnType<typeof zPRDetailsPayload>>;
export type CreatePRPayload = z.infer<ReturnType<typeof zCreatePRPayload>>;
export type UpdatePRPayload = z.infer<ReturnType<typeof zCreatePRPayload>>;
//PRLogs
export type PRLogsListPayload = z.infer<ReturnType<typeof zPRLogListPayload>>;
export type PRLogsDetailsPayload = z.infer<
  ReturnType<typeof zPRLogDetailsPayload>
>;

export const zPRIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(
      z.object({
        created_at: z.string(),
        due_date: z.string(),
        id: z.number(),
        items: z.array(
          z.object({
            condition_id: z.number(),
            id: z.number(),
            part_number_id: z.number(),
            purchase_request_id: z.number(),
            qty: z.number(),
            remark: z.string().nullable().optional(),
            unit_of_measure_id: z.number(),
            is_closed: z.boolean().optional().nullable(),
          })
        ),
        priority: z.object({
          created_at: z.string(),
          id: z.number(),
          modified_at: z.string(),
          name: z.string(),
        }),
        priority_id: z.number(),
        remark: z.string().nullable().optional(),
        sales_log_id: z.number().nullable().optional(),
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
      })
    ),
    sales_log_id: z.number().nullable().optional(),
    max_date: z.string().optional().nullable(),
    min_date: z.string().optional().nullable(),
    part_numbers: z.array(z.number()).optional().nullable(),
    purchase_request_ids: z.array(z.number()).optional().nullable(),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zPRDataColumn = () => {
  return z.object({
    created_at: z.string(),
    due_date: z.string(),
    id: z.number(),
    priority: z.object({
      created_at: z.string(),
      id: z.number(),
      modified_at: z.string(),
      name: z.string(),
    }),
    items: z.array(
      z.object({
        condition_id: z.number(),
        id: z.number(),
        part_number_id: z.number(),
        purchase_request_id: z.number(),
        qty: z.number(),
        remark: z.string().nullable().optional(),
        unit_of_measure_id: z.number(),
        is_closed: z.boolean().optional().nullable(),
      })
    ),
    sales_log_id: z.number().nullable().optional(),
    is_closed: z.boolean().optional().nullable(),
    ref: z.string().optional().nullable(),
    priority_id: z.number(),
    remark: z.string().nullable().optional(),
    type: z.string(),
    user: z.object({
      created_at: z.string(),
      email: z.string(),
      id: z.number(),
      modified_at: z.string(),
      username: z.string(),
    }),
    user_id: z.number(),
    actions: z.optional(z.string()),
  });
};

export const zPRListPayload = () => {
  return z.object({
    items: z.record(z.number()),
    status: z.boolean(),
  });
};

export const zPRDetailsPayload = () => {
  return z.object({
    data: z.object({
      created_at: z.string(),
      due_date: z.string(),
      id: z.number(),
      items: z.array(
        z.object({
          condition_id: z.number(),
          id: z.number(),
          part_number_id: z.number(),
          purchase_request_id: z.number(),
          qty: z.number(),
          remark: z.string().nullable().optional(),
          unit_of_measure_id: z.number(),
        })
      ),
      priority: z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
      }),
      sales_log_id: z.number().nullable().optional(),
      priority_id: z.number(),
      remark: z.string().nullable().optional(),
      type: z.string(),
      user: z.object({
        created_at: z.string(),
        email: z.string(),
        id: z.number(),
        modified_at: z.string(),
        username: z.string(),
      }),
      user_id: z.number(),
    }),
    status: z.boolean(),
  });
};

export const zCreatePRPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zPRLogListPayload = () => {
  return z.object({
    data: z.array(
      z.object({
        id: z.number(),
        user: z.object({
          created_at: z.string(),
          email: z.string(),
          id: z.number(),
          modified_at: z.string(),
          username: z.string(),
        }),
        date: z.string(),
      })
    ),
    status: z.boolean(),
  });
};

export const zPRLogDetailsPayload = () => {
  return z.object({
    data: z.object({
      due_date: z.string(),
      id: z.number(),
      items: z.array(
        z.object({
          condition_id: z.number(),
          id: z.number(),
          part_number_id: z.number(),
          //purchase_request_history_id: z.number(),
          qty: z.number(),
          remark: z.string().nullable().optional(),
          unit_of_measure_id: z.number(),
        })
      ),
      priority: z.object({
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        name: z.string(),
      }),
      //purchase_request_id: z.number(),
      priority_id: z.number(),
      remark: z.string().nullable().optional(),
      type: z.string(),
      user: z.object({
        created_at: z.string(),
        email: z.string(),
        id: z.number(),
        modified_at: z.string(),
        username: z.string(),
      }),
      user_id: z.number(),
    }),
    status: z.boolean(),
  });
};
