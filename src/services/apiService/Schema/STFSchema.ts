import { z } from 'zod';

export const InfoPayload = z.object({
  data: z.object({
    stf: z.object({
      awb_number: z.string(),
      ci_date: z.string(),
      ci_number: z.string(),
      created_at: z.string(),
      customs: z.string(),
      customs_entries: z
        .array(
          z.object({
            bill_of_entry: z.string(),
            bill_of_entry_date: z.string(),
            bill_of_entry_file: z.string(),
            created_at: z.string(),
            custom_entry_id: z.number(),
            id: z.number(),
            modified_at: z.string(),
            stf_id: z.number(),
          })
        )
        .nullable(),
      id: z.number(),
      logistic_request_id: z.number(),
      modified_at: z.string(),
      packages: z
        .array(
          z.object({
            height: z.number(),
            id: z.number(),
            length: z.number(),
            logistic_request_package_id: z.number(),
            package_number: z.string(),
            package_type_id: z.number(),
            stf_id: z.number(),
            unit_of_measurement_id: z.number(),
            volumetric_weight: z.number(),
            weight: z.number(),
            weight_unit_of_measurement_id: z.number(),
            width: z.number(),
          })
        )
        .nullable(),
      packing_slip_date: z.string(),
      packing_slip_no: z.string(),
      sft_number: z.string(),
      stf_date: z.string(),
      total_ci_value: z.number(),
      type: z.string(),
      user_id: z.number(),
      volumetric_weight: z.number(),
    }),
    logistic_orders: z.array(
      z.object({
        id: z.number(),
        logistic_quotation_id: z.number(),
        user_id: z.number(),
        created_at: z.string(),
        modified_at: z.string(),
    }),
    ),purchase_orders: z.array(
        z.object({
          id: z.number(),
          logistic_request_id: z.number(),
          purchase_order_id: z.number()
        })
      )
  }),
  status: z.boolean(),
});
