import { z } from 'zod';

const fileSchema = z.object({
  file_name: z.string(),
  id: z.number(),
  stock_id: z.number(),
  url: z.string(),
  user_id: z.number(),
});

const dataSchema = z.object({
  condition_id: z.number(),
  control_id: z.string(),
  created_at: z.string(),
  files: z.array(fileSchema),
  id: z.number(),
  inspection_user_id: z.number(),
  is_grn: z.boolean(),
  is_quality_check: z.boolean(),
  is_quarantine: z.boolean(),
  llp: z.string(),
  tag_by: z.string().nullable(),
  trace: z.string().nullable(),
  logistic_request_item_id: z.number().nullable(),
  logistic_request_package_id: z.number(),
  modified_at: z.string(),
  part_number_id: z.number(),
  qty: z.number(),
  quality_checks: z.array(z.unknown()),
  remark: z.string(),
  serial_lot_number: z.string(),
  shelf_life: z.string(),
  tag_date: z.string(),
  type_of_tag_id: z.number(),
});

export type ListStockByStfPayload = z.infer<
  ReturnType<typeof zListStockByStfPayload>
>;
export const zListStockByStfPayload = () => {
  return z.object({
    data: z.array(dataSchema),
    status: z.boolean(),
  });
};

export type ListStockByStfIdPayload = z.infer<
  ReturnType<typeof zListStockByStfIdPayload>
>;
export const zListStockByStfIdPayload = () => {
  return z.object({
    data: z.array(
      z.object({
        condition_id: z.number(),
        control_id: z.string(),
        created_at: z.string(),
        files: z.array(
          z.object({
            file_name: z.string(),
            id: z.number(),
            stock_id: z.number(),
            url: z.string(),
            user_id: z.number(),
          })
        ),
        grns:z.array( z
          .object({
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
          .nullable()).nullable().optional(),
        id: z.number(),
        inspection_user_id: z.number(),
        is_grn: z.boolean(),
        is_quality_check: z.boolean(),
        is_quarantine: z.boolean(),
        llp: z.string(),
        logistic_request_item: z
          .object({
            condition_id: z.number(),
            id: z.number(),
            logistic_request_id: z.number(),
            logistic_request_package_id: z.number().nullable(),
            part_number_id: z.number(),
            purchase_order_id: z.number().nullable(),
            qty: z.number(),
          })
          .nullable(),
        logistic_request_item_id: z.number().nullable(),
        logistic_request_package: z.object({
          description: z.string(),
          height: z.number(),
          id: z.number(),
          is_dg: z.boolean(),
          is_obtained: z.boolean(),
          length: z.number(),
          logistic_request_id: z.number(),
          package_number: z.string(),
          package_type_id: z.number(),
          pcs: z.number().optional(), // Make pcs optional
          unit_of_measurement_id: z.number(),
          volumetric_weight: z.number(),
          weight: z.number(),
          weight_unit_of_measurement_id: z.number(),
          width: z.number(),
        }),
        logistic_request_package_id: z.number(),
        modified_at: z.string(),
        part_number_id: z.number(),
        qty: z.number(),
        quality_checks: z.array(
          z.object({
            id: z.number(),
            inspection_report: z.any().nullable(),
            is_approved: z.boolean(),
            is_quarantine: z.boolean(),
            remark: z.string(),
            stock_id: z.number(),
            user_id: z.number(),
          })
        ),
        remark: z.string(),
        serial_lot_number: z.string(),
        shelf_life: z.string(),
        tag_by: z.any().nullable(),
        tag_date: z.string(),
        trace: z.any().nullable(),
        type_of_tag_id: z.number(),
      })
    ),
    status: z.boolean(),
  });
};

export type CreateInspectionItemPayload = z.infer<
  ReturnType<typeof zCreateInspectionItemPayload>
>;

export const zCreateInspectionItemPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export type CreateQualityCheckPayload = z.infer<
  ReturnType<typeof zCreateQualityCheckPayload>
>;
export const zCreateQualityCheckPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};
