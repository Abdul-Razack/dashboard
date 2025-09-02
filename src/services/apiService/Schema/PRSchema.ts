import { z } from 'zod';

const PartNumberSchema = z.object({
  ata: z.nullable(z.string()),
  created_at: z.string(),
  description: z.string(),
  hsc_code_id: z.number(),
  id: z.number(),
  ipc_ref: z.nullable(z.string()),
  is_alternate: z.boolean(),
  is_approved: z.boolean(),
  is_dg: z.boolean(),
  is_llp: z.boolean(),
  is_serialized: z.boolean(),
  is_shelf_life: z.boolean(),
  modified_at: z.string(),
  msds: z.nullable(z.string()),
  part_number: z.string(),
  picture: z.nullable(z.string()),
  remarks: z.nullable(z.string()),
  spare_id: z.nullable(z.number()),
  spare_model_id: z.number(),
  spare_type_id: z.number(),
  total_shelf_life: z.nullable(z.number()),
  un_id: z.nullable(z.number()),
  unit_of_measure_group_id: z.nullable(z.number()),
  unit_of_measure_id: z.number(),
  user_id: z.number(),
  xref: z.nullable(z.string()),
  user: z
    .object({
      created_at: z.string(),
      email: z.string(),
      id: z.number(),
      modified_at: z.string(),
      username: z.string(),
    })
    .optional()
    .nullable(),
});

const AlternateSchema = z.object({
  alternate_part_number_id: z.number(),
  created_at: z.string(),
  id: z.number(),
  modified_at: z.string(),
  alternate_part_number: PartNumberSchema,
  part_number_id: z.number(),
  remark: z.string(),
});

const DataItemSchema = PartNumberSchema.extend({
  alternates: z.array(AlternateSchema),
});

export const IndexPayload = z.object({
  current_page: z.number(),
  total: z.number(),
  total_pages: z.number(),
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
      type: z.string(),
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
});

export const SpareListPayload = z.object({
  items: z.record(z.number()),
  status: z.boolean(),
});

export const PartNumberSearchPayload = z.object({
  part_numbers: z.array(PartNumberSchema),
  status: z.boolean(),
});

export const FindByPartNumberIdPayload = z.object({
  part_number: DataItemSchema,
  status: z.boolean(),
});

export const PartNumberBulkPayload = z.record(
  z.string(),
  z.object({
    part_number: z
      .object({
        ata: z.nullable(z.string()),
        created_at: z.string(),
        description: z.string(),
        hsc_code_id: z.number(),
        id: z.number(),
        ipc_ref: z.nullable(z.string()),
        is_alternate: z.boolean(),
        is_approved: z.boolean(),
        is_dg: z.boolean(),
        is_llp: z.boolean(),
        is_serialized: z.nullable(z.boolean()),
        is_shelf_life: z.boolean(),
        modified_at: z.string(),
        msds: z.nullable(z.string()),
        part_number: z.string(),
        picture: z.nullable(z.string()),
        remarks: z.nullable(z.string()),
        spare_id: z.nullable(z.number()),
        spare_model_id: z.number().nullable().optional(),
        spare_type_id: z.number(),
        total_shelf_life: z.nullable(z.number()),
        un_id: z.nullable(z.number()),
        manufacturer_name: z.nullable(z.string()),
        cage_code: z.nullable(z.string()),
        unit_of_measure_group_id: z.nullable(z.number()),
        unit_of_measure_id: z.number(),
        user_id: z.number(),
        xref: z.nullable(z.string()),
      })
      .optional(),
    message: z.string().optional(),
    status: z.boolean(),
  })
);

export const PRListPayload = z.object({
  items: z.record(z.number()),
  status: z.boolean(),
});

export const PRTypeListPayload = z.object({
  items: z.record(z.string()),
  status: z.boolean(),
});
