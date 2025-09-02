import { z } from 'zod';
import { LogisticRequestInfo } from '@/services/logistics/request/schema';

export type ListPayload = z.infer<ReturnType<typeof zListPayload>>;
export type CreatePayload = z.infer<ReturnType<typeof zCreatePayload>>;
export type CreateLOPayload = z.infer<ReturnType<typeof zCreateLOPayload>>;

export type LREFQDetailsPayload = z.infer<ReturnType<typeof zLREFQDetailsPayload>>;
export type LQListPayload = z.infer<ReturnType<typeof zLQListPayload>>;
export type LODetailsPayload = z.infer<ReturnType<typeof zLODetailsPayload>>;

export const zListPayload = () => {
    return z.object({
        items: z.record(z.number()),
        status: z.boolean(),
    });
};
  
export const zCreatePayload = () => {
    return z.object({ 
       id: z.number(), 
       message: z.string(), 
       status: z.boolean() 
    });
};

export const zCreateLOPayload = () => {
    return z.object({ 
        message: z.string(), 
        status: z.boolean() 
    });
};

export const zLREFQDetailsPayload = () => {
    return z.object({
        data: z.object({
            created_at: z.string(),
            due_date: z.string(),
            id: z.number(),
            is_dg: z.boolean(),
            logistic_request: LogisticRequestInfo.optional().nullable(),
            lr_customers: z.array(
              z.object({
                  customer_contact_manager_id: z.number(),
                  customer_id: z.number(),
                  id: z.number(),
                  logistic_request_id: z.number(),
                  lrfq_id: z.number(),
              })
            ).optional(),
            modified_at: z.string(),
            no_of_package: z.number(),
            priority_id: z.number().optional(),
            remark: z.string().nullable(),
            ship_type_id: z.number(),
            ship_via_id: z.number(),
            user_id: z.number(),
            volumetric_weight: z.number().nullable(),
        }),
        status: z.boolean(),
    });
};

export const zLQListPayload = () => {
    return z.object({
      data: z.array(
        z.object({
          carrier_name: z.string(),
          created_at: z.string(),
          currency_id: z.number(),
          id: z.number(),
          is_dg: z.boolean(),
          modified_at: z.string(),
          price: z.number(),
          quotation_date: z.string(),
          quotation_number: z.string(),
          ship_type_id: z.number(),
          ship_via_id: z.number(),
          transit_day: z.number(),
          user_id: z.number(),
          customer_id: z.number(),
          remark: z.string().nullable().optional()
        })
      ),
      status: z.boolean()
    });
};
  
export const zLODetailsPayload = () => {
    return z.object({
        data: z.object({
          logistic_order: z.object({
            created_at: z.string(),
            id: z.number(),
            logistic_quotation: z.object({
              carrier_name: z.string(),
              created_at: z.string(),
              currency_id: z.number(),
              customer_id: z.number(),
              id: z.number(),
              is_dg: z.boolean(),
              lrfq: z.object({
                created_at: z.string(),
                due_date: z.string(),
                id: z.number(),
                is_dg: z.boolean(),
                lr_customers: z.array(
                  z.object({
                    customer_contact_manager_id: z.number(),
                    customer_id: z.number(),
                    id: z.number(),
                    logistic_request_id: z.number(),
                    lrfq_id: z.number()
                  })
                ),
                modified_at: z.string(),
                no_of_package: z.number(),
                priority_id: z.number(),
                remark: z.string(),
                ship_type_id: z.number(),
                ship_via_id: z.number(),
                user_id: z.number(),
                volumetric_weight: z.number()
              }),
              modified_at: z.string(),
              price: z.number(),
              quotation_date: z.string(),
              quotation_number: z.string(),
              remark: z.string(), // Changed from z.null() to z.string() as it contains an HTML string
              ship_type_id: z.number(),
              ship_via_id: z.number(),
              transit_day: z.number(),
              user_id: z.number()
            }),
            logistic_quotation_id: z.number(),
            modified_at: z.string(),
            user_id: z.number()
          }),
          logistic_requests: z.array(
            z.object({
              awb_number: z.union([z.string(), z.null()]), // Changed from z.null() to z.string() as per the JSON data
              created_at: z.string(),
              customer: z.object({
                business_name: z.string(),
                business_type: z.object({
                  created_at: z.string(),
                  id: z.number(),
                  modified_at: z.string(),
                  name: z.string()
                }),
                business_type_id: z.number(),
                code: z.string(),
                contact_type: z.object({
                  created_at: z.string(),
                  id: z.number(),
                  modified_at: z.string(),
                  name: z.string()
                }),
                contact_type_id: z.number(),
                created_at: z.string(),
                currency: z.object({
                  code: z.string(),
                  created_at: z.string(),
                  id: z.number(),
                  modified_at: z.string(),
                  name: z.string()
                }),
                currency_id: z.number(),
                email: z.string().nullable(), // Changed to allow both string or null
                id: z.number(),
                is_foreign_entity: z.boolean(),
                license_trade_exp_date: z.union([z.string(), z.null()]), // Updated to allow string or null
                license_trade_no: z.union([z.string(), z.null()]), // Updated to allow string or null
                license_trade_url: z.union([z.string(), z.null()]), // Updated to allow string or null
                modified_at: z.string(),
                nature_of_business: z.string(),
                remarks: z.union([z.string(), z.null()]), // Updated to allow string or null
                vat_tax_id: z.union([z.string(), z.null()]), // Updated to allow string or null
                vat_tax_url: z.union([z.string(), z.null()]), // Updated to allow string or null
                year_of_business: z.number().nullable() // Updated to allow number or null
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
                    name: z.string()
                  }),
                  business_type_id: z.number(),
                  code: z.string(),
                  contact_type: z.object({
                    created_at: z.string(),
                    id: z.number(),
                    modified_at: z.string(),
                    name: z.string()
                  }),
                  contact_type_id: z.number(),
                  created_at: z.string(),
                  currency: z.object({
                    code: z.string(),
                    created_at: z.string(),
                    id: z.number(),
                    modified_at: z.string(),
                    name: z.string()
                  }),
                  currency_id: z.number(),
                  email: z.string().nullable(), // Changed to allow both string or null
                  id: z.number(),
                  is_foreign_entity: z.boolean(),
                  license_trade_exp_date: z.union([z.string(), z.null()]), // Updated to allow string or null
                  license_trade_no: z.union([z.string(), z.null()]), // Updated to allow string or null
                  license_trade_url: z.union([z.string(), z.null()]), // Updated to allow string or null
                  modified_at: z.string(),
                  nature_of_business: z.string(),
                  remarks: z.union([z.string(), z.null()]), // Updated to allow string or null
                  vat_tax_id: z.union([z.string(), z.null()]), // Updated to allow string or null
                  vat_tax_url: z.union([z.string(), z.null()]), // Updated to allow string or null
                  year_of_business: z.union([z.number(), z.null()]) // Updated to allow number or null
                }),
                customer_id: z.number(),
                email: z.string().nullable(), // Changed to allow both string or null
                fax: z.union([z.string(), z.null()]), // Updated to allow string or null
                id: z.number(),
                phone: z.string(),
                remarks: z.union([z.string(), z.null()]), // Updated to allow string or null
                state: z.string(),
                zip_code: z.string()
              }),
              customer_shipping_address_id: z.number(),
              due_date: z.string(),
              id: z.number(),
              is_dg: z.boolean(),
              is_received: z.boolean(),
              items: z.array(
                z.union([
                  z.object({
                    condition_id: z.number(),
                    id: z.number(),
                    logistic_request_id: z.number(),
                    logistic_request_package_id: z.null(),
                    part_number_id: z.number(),
                    purchase_order_id: z.number(),
                    qty: z.number()
                  }),
                  z.object({
                    condition_id: z.number(),
                    id: z.number(),
                    logistic_request_id: z.number(),
                    logistic_request_package_id: z.number(),
                    part_number_id: z.number(),
                    purchase_order_id: z.number(),
                    qty: z.number()
                  })
                ])
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
                  pcs: z.number().optional(), // Added pcs field, assuming it's optional since it's in the example
                  unit_of_measurement_id: z.number(),
                  volumetric_weight: z.number(),
                  weight: z.number(),
                  weight_unit_of_measurement_id: z.number(),
                  width: z.number()
                })
              ),
              priority_id: z.number(),
              purchase_orders: z.array(
                z.object({
                  id: z.number(),
                  logistic_request_id: z.number(),
                  purchase_order_id: z.number()
                })
              ),
              received_user_id: z.union([z.number(), z.null()]),
              receiver_customer: z.object({
                business_name: z.string(),
                business_type: z.object({
                  created_at: z.string(),
                  id: z.number(),
                  modified_at: z.string(),
                  name: z.string()
                }),
                business_type_id: z.number(),
                code: z.string(),
                contact_type: z.object({
                  created_at: z.string(),
                  id: z.number(),
                  modified_at: z.string(),
                  name: z.string()
                }),
                contact_type_id: z.number(),
                created_at: z.string(),
                currency: z.object({
                  code: z.string(),
                  created_at: z.string(),
                  id: z.number(),
                  modified_at: z.string(),
                  name: z.string()
                }),
                currency_id: z.number(),
                email: z.string(),
                id: z.number(),
                is_foreign_entity: z.boolean(),
                license_trade_exp_date: z.string(),
                license_trade_no: z.string(),
                license_trade_url: z.string(),
                modified_at: z.string(),
                nature_of_business: z.string(),
                remarks: z.string(),
                vat_tax_id: z.string(),
                vat_tax_url: z.string(),
                year_of_business: z.number()
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
                    name: z.string()
                  }),
                  business_type_id: z.number(),
                  code: z.string(),
                  contact_type: z.object({
                    created_at: z.string(),
                    id: z.number(),
                    modified_at: z.string(),
                    name: z.string()
                  }),
                  contact_type_id: z.number(),
                  created_at: z.string(),
                  currency: z.object({
                    code: z.string(),
                    created_at: z.string(),
                    id: z.number(),
                    modified_at: z.string(),
                    name: z.string()
                  }),
                  currency_id: z.number(),
                  email: z.string(),
                  id: z.number(),
                  is_foreign_entity: z.boolean(),
                  license_trade_exp_date: z.string(),
                  license_trade_no: z.string(),
                  license_trade_url: z.string(),
                  modified_at: z.string(),
                  nature_of_business: z.string(),
                  remarks: z.string(),
                  vat_tax_id: z.string(),
                  vat_tax_url: z.string(),
                  year_of_business: z.number()
                }),
                customer_id: z.number(),
                email: z.string(),
                fax: z.string(),
                id: z.number(),
                phone: z.string(),
                remarks: z.string(),
                state: z.string(),
                zip_code: z.string()
              }),
              receiver_shipping_address_id: z.number(),
              ref_date: z.string(),
              remark: z.string().nullable(),
              ship_type_id: z.number(),
              ship_via_id: z.number(),
              type: z.string(),
              volumetric_weight: z.number()
            })
          )
        }),
        status: z.boolean()
      });
};

export type CreateLogesticOrderItemPayload = z.infer<
  ReturnType<typeof zCreateLogesticOrderItemPayload>
>;

export const zCreateLogesticOrderItemPayload = () => {
  return z.object({
    existing_order_id: z.number().optional(),
    message: z.string(),
    status: z.boolean(),
  });
};