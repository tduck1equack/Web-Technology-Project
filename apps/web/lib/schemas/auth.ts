import { z } from "zod";

// Phone number validation regex (supports international formats)
const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    firstName: z.string().min(2, "First name is required"),
    lastName: z.string().min(2, "Last name is required"),
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(30, "Username too long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const profileCompleteSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long"),
  majorId: z.string().min(1, "Major is required"),
  year: z.number().int().min(1).max(6).optional(), // Academic year validation
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms"),
});

// Personal information update schema
export const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username too long"),
});

// Phone number schema with proper validation
export const phoneSchema = z.object({
  phone: z
    .string()
    .regex(phoneRegex, "Invalid phone number format")
    .optional()
    .or(z.literal("")),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileCompleteFormData = z.infer<typeof profileCompleteSchema>;
export type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;
export type PhoneFormData = z.infer<typeof phoneSchema>;
