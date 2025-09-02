import { z } from 'zod';

export type STFIndexPayload = z.infer<ReturnType<typeof zSTFIndexPayload>>;
export type STFDataColumn = z.infer<ReturnType<typeof zSTFDataColumn>>;
export type STFListPayload = z.infer<ReturnType<typeof zSTFListPayload>>;
export type STFDetailsPayload = z.infer<ReturnType<typeof zSTFDetailsPayload>>;
export type CreateSTFPayload = z.infer<ReturnType<typeof zCreateSTFPayload>>;

export const zSTFIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(
      z.object({
        awb_number: z.string(),
        ci_date: z.string(),
        ci_number: z.string(),
        created_at: z.string(),
        customs: z.string(),
        customs_entries: z.array(
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
        ),
        id: z.number(),
        logistic_request_id: z.number(),
        modified_at: z.string(),
        packages: z.array(
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
        ),
        packing_slip_date: z.string(),
        packing_slip_no: z.string(),
        sft_number: z.string(),
        stf_date: z.string(),
        total_ci_value: z.number(),
        type: z.string(),
        user_id: z.number(),
        volumetric_weight: z.number(),
      })
    ),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zSTFDataColumn = () => {
  return z.object({
    awb_number: z.string(),
    ci_date: z.string(),
    ci_number: z.string(),
    created_at: z.string(),
    customs: z.string(),
    customs_entries: z.array(
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
    ),
    id: z.number(),
    logistic_request_id: z.number(),
    modified_at: z.string(),
    packages: z.array(
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
    ),
    packing_slip_date: z.string(),
    packing_slip_no: z.string(),
    sft_number: z.string(),
    stf_date: z.string(),
    total_ci_value: z.number(),
    type: z.string(),
    user_id: z.number(),
    volumetric_weight: z.number(),
    actions: z.optional(z.string()),
  });
};

export const zSTFListPayload = () => {
  return z.object({
    items: z.record(z.number()),
    status: z.boolean(),
  });
};

export const zSTFDetailsPayload = () => {
  return z.object({
    data: z.object({
      awb_number: z.string(),
      ci_date: z.string(),
      ci_number: z.string(),
      created_at: z.string(),
      customs: z.string(),
      customs_entries: z.array(
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
      ),
      id: z.number(),
      logistic_request_id: z.number(),
      modified_at: z.string(),
      packages: z.array(
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
      ),
      packing_slip_date: z.string(),
      packing_slip_no: z.string(),
      sft_number: z.string(),
      stf_date: z.string(),
      total_ci_value: z.number(),
      type: z.string(),
      user_id: z.number(),
      volumetric_weight: z.number(),
    }),
    status: z.boolean(),
  });
};

export const zCreateSTFPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};
