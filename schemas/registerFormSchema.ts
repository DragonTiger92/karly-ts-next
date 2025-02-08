import { userSchema } from './userSchema';
import { z } from 'zod';

export const registerFormSchema = userSchema
  .extend({
    confirmPassword: z
      .string()
      .min(6, '비밀번호 확인은 최소 6자 이상이어야 합니다.')
      .max(16, '비밀번호 확인은 최대 16자 이하로 입력해야 합니다.'),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: '비밀번호가 일치하지 않습니다.',
        path: ['confirmPassword'],
      });
    }
  });

export type RegisterFormSchema = z.infer<typeof registerFormSchema>;
