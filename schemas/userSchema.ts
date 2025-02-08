import { z } from 'zod';

const isLeapYear = (year: number) =>
  (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;

export const userSchema = z.object({
  loginId: z
    .string()
    .min(6, '아이디는 최소 6자 이상이어야 합니다.')
    .max(16, '아이디는 최대 16자 이하로 입력해야 합니다.')
    .regex(/^[a-zA-Z0-9]+$/, '아이디는 영문 또는 영문+숫자 조합만 가능합니다.'),

  password: z
    .string()
    .min(6, '비밀번호는 최소 6자 이상이어야 합니다.')
    .max(16, '비밀번호는 최대 16자 이하로 입력해야 합니다.')
    .regex(
      /^(?=.*[a-zA-Z])(?=.*\d)|(?=.*[a-zA-Z])(?=.*[\W_])|(?=.*\d)(?=.*[\W_])/,
      '비밀번호는 영문, 숫자, 특수문자 중 2가지 이상을 조합해야 합니다.'
    )
    .regex(/^[a-zA-Z0-9\W_]+$/, '비밀번호는 공백을 포함할 수 없습니다.'),

  name: z
    .string()
    .min(1, '이름은 최소 1자 이상이어야 합니다.')
    .max(12, '이름은 최대 12자까지 입력할 수 있습니다.')
    .regex(/^[가-힣a-zA-Z]+$/, '이름은 한글 또는 영문만 입력할 수 있습니다.'),

  email: z.string().email('유효한 이메일 주소를 입력하세요.'),

  phone: z
    .string()
    .min(10, '휴대폰 번호는 최소 10자 이상이어야 합니다.')
    .max(11, '휴대폰 번호는 최대 11자까지 입력할 수 있습니다.')
    .regex(/^\d{10,11}$/, '휴대폰 번호는 숫자로만 입력해야 합니다.'),

  address: z.object({
    main: z.string().min(1, '주소를 입력하세요.'),
    detail: z.string().optional(),
  }),

  birthdate: z
    .object({
      year: z
        .string()
        .length(4, '태어난 년도 4자리를 정확하게 입력해주세요.')
        .regex(/^\d{4}$/, '태어난 년도는 숫자 4자리여야 합니다.')
        .refine(
          (val) => {
            const year = Number(val);
            return (
              year >= new Date().getFullYear() - 300 &&
              year <= new Date().getFullYear()
            );
          },
          {
            message: '생년월일을 다시 확인해주세요.',
          }
        ),

      month: z
        .string()
        .regex(/^(0?[1-9]|1[0-2])$/, '태어난 월을 정확하게 입력해주세요.'),

      day: z.string().regex(/^\d{1,2}$/, '태어난 일을 정확하게 입력해주세요.'),
    })
    .superRefine((data, ctx) => {
      const year = Number(data.year);
      const month = Number(data.month);
      const day = Number(data.day);
      const daysInMonth = {
        1: 31,
        2: isLeapYear(year) ? 29 : 28,
        3: 31,
        4: 30,
        5: 31,
        6: 30,
        7: 31,
        8: 31,
        9: 30,
        10: 31,
        11: 30,
        12: 31,
      };

      if (!(month >= 1 && month <= 12)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '태어난 월을 정확하게 입력해주세요.',
          path: ['month'],
        });
      }

      if (
        !(day >= 1 && day <= daysInMonth[month as keyof typeof daysInMonth])
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: '태어난 일을 정확하게 입력해주세요.',
          path: ['day'],
        });
      }
    }),

  gender: z.enum(['male', 'female', 'none']).default('none'),

  extraCheckPoint: z.object({
    type: z.enum(['referrer', 'event']).optional(),
    referrerId: z
      .string()
      .min(6, '추천인 아이디는 최소 6자 이상이어야 합니다.')
      .max(16, '추천인 아이디는 최대 16자 이하로 입력해야 합니다.')
      .regex(
        /^[a-zA-Z0-9]+$/,
        '추천인 아이디는 영문 또는 영문+숫자 조합만 가능합니다.'
      )
      .optional(),
    eventName: z
      .string()
      .max(20, '이벤트명은 최대 20자까지 입력할 수 있습니다.')
      .optional(),
  }),

  agree: z
    .object({
      all: z.boolean().default(false),
      service: z.boolean().refine((value) => value === true, {
        message: '이용약관에 동의해야 가입할 수 있습니다.',
      }),
      privacy: z.boolean().refine((value) => value === true, {
        message: '개인정보 수집·이용에 동의해야 가입할 수 있습니다.',
      }),
      age: z.boolean().refine((value) => value === true, {
        message: '14세 이상이어야 가입할 수 있습니다.',
      }),
      marketing: z
        .object({
          subscribe: z.boolean().default(false),
          sms: z.boolean().default(false),
          email: z.boolean().default(false),
        })
        .superRefine((data) => {
          if (data.sms || data.email) {
            data.subscribe = true;
          }
          if (!data.sms && !data.email) {
            data.subscribe = false;
          }
        }),
    })
    .superRefine((data) => {
      const allChecked =
        data.service && data.privacy && data.age && data.marketing.subscribe;

      if (!allChecked) {
        data.all = false;
      } else {
        data.all = true;
      }
    }),
});

export type UserSchema = z.infer<typeof userSchema>;
