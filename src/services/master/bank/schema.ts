import { z } from 'zod';

export type bankdataColumn = z.infer<ReturnType<typeof zBankDataColumn>>;
export type BankIndexPayload = z.infer<ReturnType<typeof zBankIndexPayload>>;
export type BankListPayload = z.infer<ReturnType<typeof zBankListPayload>>;
export type BankDetailsPayload = z.infer<
  ReturnType<typeof zBankDetailsPayload>
>;
export type CreateMasterBankPayload = z.infer<
  ReturnType<typeof zCreateMasterBankPayload>
>;

const basicBankInfo = {
  aba_routing_no: z.string().optional().nullable(),
  bank_ac_iban_no: z.string().optional(),
  bank_address: z.string().optional(),
  bank_address_line2: z.string().optional().nullable(),
  bank_branch: z.string().optional(),
  bank_email: z.string().optional().nullable(),
  bank_fax: z.string().optional().nullable(),
  bank_mobile: z.string().optional().nullable(),
  bank_name: z.string(),
  bank_phone: z.string().optional().nullable(),
  bank_swift: z.string().optional(),
  beneficiary_name: z.string().optional(),
  contact_name: z.string().optional(),
};

const dateTimeStamps = {
  created_at: z.string(),
  modified_at: z.string(),
};

const id = { id: z.number() };

const basicEntity = {
  ...dateTimeStamps,
  ...id,
  name: z.string(),
};

const paymentInfo = z.object({
  payment_mode: z.object(basicEntity).optional(),
  payment_mode_id: z.number().optional(),
  payment_term: z.object(basicEntity).optional(),
  payment_term_id: z.number().optional(),
  total_credit_amount: z.number().optional(),
  total_credit_period: z.number().optional(),
  type_of_ac: z.string().optional(),
});

const customerInfo = z.object({
  business_name: z.string(),
  business_type: z.object(basicEntity),
  business_type_id: z.number(),
  code: z.string(),
  contact_type: z.object(basicEntity),
  contact_type_id: z.number(),
  currency: z.object({
    code: z.string(),
    ...dateTimeStamps,
    ...id,
    name: z.string(),
  }),
  currency_id: z.number(),
  email: z.union([z.string(), z.null()]),
  is_foreign_entity: z.boolean(),
  license_trade_exp_date: z.union([z.string(), z.null()]),
  license_trade_no: z.union([z.string(), z.null()]),
  license_trade_url: z.union([z.string(), z.null()]),
  nature_of_business: z.string().nullable().optional(),
  remarks: z.union([z.string(), z.null()]),
  vat_tax_id: z.union([z.string(), z.null()]),
  vat_tax_url: z.union([z.string(), z.null()]),
  year_of_business: z.union([z.number(), z.null()]),
  payment_mode: z.object(basicEntity).optional(),
  payment_mode_id: z.number().optional(),
  payment_term: z.object(basicEntity).optional(),
  payment_term_id: z.number().optional(),
  total_credit_amount: z.number().optional(),
  total_credit_period: z.number().optional(),
  type_of_ac: z.string().optional(),
  ...dateTimeStamps,
  ...id,
});

export const zBankListPayload = () => {
  return z.object({
    items: z.record(z.string()),
    status: z.boolean(),
  });
};

// export const zBankIndexPayload = () => {
//   return z.object({
//     current_page: z.number(),
//     data: z.array(
//       z.object({
//         ...basicBankInfo,
//         customer: customerInfo,
//         customer_id: z.number(),
//         id: z.number(),
//         ...dateTimeStamps,
//         ...paymentInfo.shape,
//       })
//     ),
//     total: z.number(),
//     total_pages: z.number(),
//   });
// };

const bankInfoSchema = z.object({
  aba_routing_no: z.string().optional().nullable(),
  bank_ac_iban_no: z.string().optional(),
  bank_address: z.string().optional().nullable(),
  bank_address_line2: z.string().optional().nullable(),
  bank_branch: z.string().optional().nullable(),
  bank_email: z.string().optional().nullable(),
  bank_fax: z.string().optional().nullable(),
  bank_mobile: z.string().optional().nullable(),
  bank_name: z.string(),
  bank_phone: z.string().optional().nullable(),
  bank_swift: z.string().optional().nullable(),
  beneficiary_name: z.string(),
  contact_name: z.string().optional().nullable(),
  type_of_ac: z.string().optional().nullable(),
});

const timestampSchema = z.object({
  created_at: z.string(),
  modified_at: z.string(),
});

export const zBankIndexPayload = () => {
  return z.object({
    current_page: z.number(),
    data: z.array(
      bankInfoSchema.extend({
        customer_id: z.number(),
        customer: customerInfo,
        id: z.number(),
        ...timestampSchema.shape,
      })
    ),
    total: z.number(),
    total_pages: z.number(),
  });
};

export const zBankDataColumn = () => {
  return z.object({
    ...bankInfoSchema.shape,
    customer_id: z.number(),
    customer: customerInfo,
    id: z.number(),
    actions: z.optional(z.string()),
  });
};

export const customerBankSchema = z
  .object({
    ...basicBankInfo,
    customer_id: z.number(),
    id: z.number(),
    ...dateTimeStamps,
    ...paymentInfo.shape,
  })
  .optional();

export const zCreateMasterBankPayload = () => {
  return z.object({
    id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};

export const zBankDetailsPayload = () => {
  return z
    .object({
      ...basicBankInfo,
      customer: customerInfo,
      customer_id: z.number(),
      id: z.number(),
      ...dateTimeStamps,
    })
    .optional();
};

export const zCreateMasterBankBulkPayload = () => {
  return z.object({
    created_banks: z.array(
      z.object({
        beneficiary_name: z.string(),
      })
    ),
    errors: z.array(z.union([
      z.string(), 
      z.object({ code: z.number(), message: z.string() })
    ])),
    status: z.boolean(),
  });
};

export type CreateMasterBankBulkPayload = z.infer<
  ReturnType<typeof zCreateMasterBankBulkPayload>
>;