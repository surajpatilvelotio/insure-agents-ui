import { z } from 'zod';

export const loginSchema = z.object({
  memberId: z
    .string()
    .min(1, 'Member ID or Email is required')
    .refine(
      (value) => {
        // Accept either Member ID format (INS + 7 digits) or valid email
        const memberIdPattern = /^INS\d{7}$/;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return memberIdPattern.test(value) || emailPattern.test(value);
      },
      { message: 'Enter a valid Member ID (INS1234567) or email address' }
    ),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name is too long'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
