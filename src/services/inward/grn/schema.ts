import { z } from 'zod';

export type GRNIndexPayload = z.infer<ReturnType<typeof zGRNIndexPayload>>;
export type GRNDataColumn = z.infer<ReturnType<typeof zGRNDataColumn>>;
export type GRNDetailsPayload = z.infer<ReturnType<typeof zGRNDetailsPayload>>;
export type GRNByStfIdPayload = z.infer<ReturnType<typeof zGRNByStfIdPayload>>;
export type CreateGRNPayload = z.infer<ReturnType<typeof zCreateGRNPayload>>;
export type UpdateGRNPayload = z.infer<ReturnType<typeof zUpdateGRNLocationPayload>>;

export const zGRNIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(
      z.object({
        created_at: z.string(),
        id: z.number(),
        items: z.array(
          z.object({
            condition_id: z.number(),
            created_at: z.string(),
            grn_id: z.number(),
            id: z.number(),
            is_quarantine: z.boolean().nullable(),
            is_serialized: z.boolean().nullable().optional(),
            locations: z.array(
              z.object({
                bin_location_id: z.number(),
                created_at: z.string(),
                grn_item_id: z.number(),
                id: z.number(),
                is_quarantine: z.boolean().optional().nullable(),
                modified_at: z.string(),
                qty: z.number(),
                rack_id: z.number(),
                serial_number: z.string(),
                warehouse_id: z.number(),
              })
            ),
            modified_at: z.string(),
            package_no: z.string(),
            part_number_id: z.number(),
            qty: z.number(),
            remark: z.string().nullable(),
            ship_qty: z.number(),
            ship_unit_of_measure_id: z.number(),
            unit_of_measure_id: z.number(),
            upload_files: z.array(z.string()),
          })
        ),
        modified_at: z.string(),
        stf_id: z.number(),
      })
    ),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zGRNDataColumn = () => {
  return z.object({
    created_at: z.string(),
    id: z.number(),
    items: z.array(
      z.object({
        condition_id: z.number(),
        created_at: z.string(),
        grn_id: z.number(),
        id: z.number(),
        is_quarantine: z.boolean().nullable(),
        is_serialized: z.boolean().nullable().optional(),
        locations: z.array(
          z.object({
            bin_location_id: z.number(),
            created_at: z.string(),
            grn_item_id: z.number(),
            id: z.number(),
            is_quarantine: z.boolean().optional().nullable(),
            modified_at: z.string(),
            qty: z.number(),
            rack_id: z.number(),
            serial_number: z.string(),
            warehouse_id: z.number(),
          })
        ),
        modified_at: z.string(),
        package_no: z.string(),
        part_number_id: z.number(),
        qty: z.number(),
        remark: z.string().nullable(),
        ship_qty: z.number(),
        ship_unit_of_measure_id: z.number(),
        unit_of_measure_id: z.number(),
        upload_files: z.array(z.string()),
      })
    ),
    modified_at: z.string(),
    stf_id: z.number(),
    actions: z.optional(z.string()),
  });
};

export const zGRNDetailsPayload = () => {
  return z.object({
    grn: z.object({
      created_at: z.string(),
      id: z.number(),
      items: z
        .array(
          z.object({
            condition_id: z.number(),
            created_at: z.string(),
            grn_id: z.number(),
            id: z.number(),
            is_quarantine: z.boolean().nullable(),
            is_serialized: z.boolean().nullable().optional(),
            locations: z.array(
              z.object({
                bin_location_id: z.number(),
                created_at: z.string(),
                grn_item_id: z.number(),
                id: z.number(),
                is_quarantine: z.boolean().nullable(),
                modified_at: z.string(),
                qty: z.number(),
                rack_id: z.number(),
                serial_number: z.string(),
                warehouse_id: z.number(),
              })
            ),
            modified_at: z.string(),
            package_no: z.string(),
            part_number_id: z.number(),
            qty: z.number(),
            remark: z.string().nullable(),
            ship_qty: z.number(),
            ship_unit_of_measure_id: z.number(),
            unit_of_measure_id: z.number(),
            upload_files: z.array(z.string()),
          })
        )
        .nullable(),
      modified_at: z.string(),
      stf_id: z.number(),
    }),
    status: z.boolean(),
  });
};

export const zGRNByStfIdPayload = () => {
  return z.object({
    data: z.array(
      z.object({
        bin_location_id: z.number(),
        created_at: z.string(),
        id: z.number(),
        modified_at: z.string(),
        qty: z.number(),
        rack_id: z.number(),
        remark: z.string(),
        stock_id: z.number(),
        user_id: z.number(),
        warehouse_id: z.number(),
      })
    ),
    status: z.boolean(),
  });
};

export const zCreateGRNPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zUpdateGRNLocationPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

