import { z } from 'zod';

/* ─────── Reusable Subschemas ─────── */
const UserSchema = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
});

const HscCodeSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
});

const UnSchema = z.object({
  id: z.number(),
  name: z.string(),
  classs: z.string(),
  description: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
});

/* ─────── PartNumber & Alternates ─────── */
const PartNumberSchema = z.object({
  id: z.number(),
  part_number: z.string(),
  description: z.string(),
  hsc_code_id: z.number(),
  spare_type_id: z.number(),
  unit_of_measure_id: z.number(),
  user_id: z.number(),

  is_dg: z.boolean(),
  is_llp: z.boolean(),
  is_shelf_life: z.boolean(),
  is_approved: z.boolean(),
  is_alternate: z.boolean(),
  is_serialized: z.boolean().nullable(),

  ata: z.string().nullable(),
  ipc_ref: z.string().nullable(),
  msds: z.string().nullable(),
  remarks: z.string().nullable(),
  picture: z.string().nullable(),
  xref: z.string().nullable(),
  spare_id: z.number().nullable(),
  spare_model_id: z.number().nullable().optional(),
  total_shelf_life: z.number().nullable(),
  un_id: z.number().nullable(),
  manufacturer_name: z.string().nullable(),
  cage_code: z.string().nullable(),
  unit_of_measure_group_id: z.number().nullable(),
  created_at: z.string(),
  modified_at: z.string(),

  user: UserSchema.nullable().optional(),
});

const AlternateSchema = z.object({
  id: z.number(),
  part_number_id: z.number(),
  alternate_part_number_id: z.number(),
  remark: z.string(),
  created_at: z.string(),
  modified_at: z.string(),
  alternate_part_number: PartNumberSchema,
});

const DataItemSchema = PartNumberSchema.extend({
  alternates: z.array(AlternateSchema),
});

/* ─────── Exported Schemas ─────── */
export const zSpareIndexPayload = () =>
  z.object({
    current_page: z.number(),
    total_pages: z.number(),
    total: z.number(),
    data: z.array(DataItemSchema),
  });

export const zSpareDataColumn = () =>
  DataItemSchema.extend({
    actions: z.string().optional(),
  });

export const zSpareDetailsPayload = () => DataItemSchema;

export const zCreateSparePayload = () =>
  z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });

  export const zUploadedPartsPayload = () => 
    z.object({
  data: z.record(z.boolean()), 
  status: z.boolean(),
});


export const zBulkCreateSparePayload = () =>
  z.object({
    created_part_numbers: z.array(
      z.object({ part_number: z.string(), description: z.string() }).optional()
    ).nullable(),
    errors: z.array(
      z.object({ row: z.number(), part_number: z.string(), message: z.string() }).optional()
    ).nullable(),
    status: z.boolean(),
  });

export const zAssignAltSparePartsRespPayload = () =>
  z.object({
    successful_mappings: z.array(
      z.object({
        part_number_id: z.number(),
        alternate_part_number_id: z.number(),
        remark: z.string().nullable().optional(),
      }).optional()
    ).nullable(),
    errors: z.array(
      z.object({
        part_number_id: z.number(),
        alternate_part_number_id: z.number(),
        message: z.string(),
        remarks: z.string().nullable().optional(),
      }).optional()
    ).nullable(),
    status: z.boolean(),
  });

export const zSearchPartNumberPayload = () =>
  z.object({
    status: z.boolean(),
    part_numbers: z.array(PartNumberSchema),
  });

export const zFindByPartNumberIdPayload = () =>
  z.object({
    status: z.boolean(),
    part_number: DataItemSchema,
  });

export const zPartNumberBySpareIdPayload = () =>
  z.object({
    status: z.boolean(),
    part_numbers: z.array(
      z.object({
        id: z.number(),
        part_number: z.string(),
        is_alternate: z.boolean(),
        is_approved: z.boolean(),
        created_at: z.string(),
        modified_at: z.string(),
        spare_id: z.number(),
        spare: z.object({
          id: z.number(),
          description: z.string(),
          spare_type_id: z.number(),
          unit_of_measure_id: z.number(),
          is_dg: z.boolean(),
          is_llp: z.boolean(),
          is_shelf_life: z.boolean(),
          is_serialized: z.boolean().nullable().optional(),
          hsc_code_id: z.number().nullable().optional(),
          spare_model_id: z.number().nullable().optional(),
          spare_class_id: z.number().nullable().optional(),
          total_shelf_life: z.number().nullable(),
          manufacturer_name: z.string().nullable(),
          cage_code: z.string().nullable(),
          msds: z.string().nullable().optional(),
          remarks: z.string().nullable().optional(),
          ipc_ref: z.string().nullable().optional(),
          ata: z.string().nullable().optional(),
          picture: z.string().nullable().optional(),
          xref: z.string().nullable().optional(),
          hsc_code: HscCodeSchema.nullable().optional(),
          un: UnSchema.nullable().optional(),
          created_at: z.string(),
          modified_at: z.string(),
        }),
      })
    ),
  });

export const zFindByPartNumberIdBulkPayload = () =>
  z.record(
    z.string(),
    z.object({
      status: z.boolean(),
      message: z.string().optional(),
      part_number: PartNumberSchema.optional(),
    })
  );

/* ─────── Simplified zSpareListPayload ─────── */
const MiniPartNumberSchema = z.object({
  id: z.number(),
  part_number: z.string(),
  is_alternate: z.boolean(),
  created_at: z.string(),
  modified_at: z.string(),
  spare_id: z.number(),
});

const SpareListItemSchema = z.object({
  id: z.number(),
  description: z.string(),
  spare_type_id: z.number(),
  unit_of_measure_id: z.number(),
  is_dg: z.boolean(),
  is_llp: z.boolean(),
  is_shelf_life: z.boolean(),
  is_serialized: z.boolean().nullable().optional(),
  spare_model_id: z.number().nullable().optional(),
  spare_class_id: z.string().nullable().optional(),
  total_shelf_life: z.number().nullable().optional(),
  manufacturer_name: z.string().nullable(),
  cage_code: z.string().nullable(),
  msds: z.string().nullable().optional(),
  remarks: z.string().nullable().optional(),
  ipc_ref: z.string().nullable().optional(),
  ata: z.string().nullable().optional(),
  picture: z.string().nullable().optional(),
  xref: z.string().nullable().optional(),
  hsc_code_id: z.number().nullable().optional(),
  hsc_code: HscCodeSchema.nullable().optional(),
  un: UnSchema.nullable().optional(),
  created_at: z.string(),
  modified_at: z.string(),

  alternate_part_numbers: z.array(MiniPartNumberSchema).nullable().optional(),
  part_number: MiniPartNumberSchema.omit({ spare_id: true }).nullable().optional(),
});

export const zSpareListPayload = () =>
  z.object({
    spares: z.array(SpareListItemSchema),
    status: z.boolean(),
  });

/* ─────── Type Inference ─────── */
export type SpareIndexPayload = z.infer<ReturnType<typeof zSpareIndexPayload>>;
export type SpareListPayload = z.infer<ReturnType<typeof zSpareListPayload>>;
export type SpareDataColumn = z.infer<ReturnType<typeof zSpareDataColumn>>;
export type SpareDetailsPayload = z.infer<ReturnType<typeof zSpareDetailsPayload>>;
export type CreateSparePayload = z.infer<ReturnType<typeof zCreateSparePayload>>;
export type CreateBulkSparePayload = z.infer<ReturnType<typeof zBulkCreateSparePayload>>;
export type AssignAltSpareRespPayload = z.infer<ReturnType<typeof zAssignAltSparePartsRespPayload>>;
export type UpdateSparePayload = z.infer<ReturnType<typeof zCreateSparePayload>>;
export type SearchPartNumberPayload = z.infer<ReturnType<typeof zSearchPartNumberPayload>>;
export type FindByPartNumberIdPayload = z.infer<ReturnType<typeof zFindByPartNumberIdPayload>>;
export type PartNumberBySpareIdPayload = z.infer<ReturnType<typeof zPartNumberBySpareIdPayload>>;
export type FindByPartNumberIdBulkPayload = z.infer<ReturnType<typeof zFindByPartNumberIdBulkPayload>>;

export type UploadedPartsPayload = z.infer<ReturnType<typeof zUploadedPartsPayload>>;
