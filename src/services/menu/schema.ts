import { z } from 'zod';

export type CreateAssignMenusPayload = z.infer<
  ReturnType<typeof zCreateAssignMenusPayload>
>;

export const zCreateAssignMenusPayload = () => {
    return z.object({
      message: z.string(),
      status: z.boolean(),
    });
};

export type CreateMenuPayload = z.infer<
  ReturnType<typeof zCreateMenuPayload>
>;

export const zCreateMenuPayload = () => {
    return z.object({
      id: z.number(),
      message: z.string(),
      status: z.boolean(),
    });
};

export type GetAssignMenuyPayload = z.infer<
  ReturnType<typeof zGetAssignMenuyPayload>
>;

export const zGetAssignMenuyPayload = () => {
    return z.object({
      status: z.boolean(),
      menus: z.array(z.number())
    });
};

