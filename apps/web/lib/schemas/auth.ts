import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    fullName: z.string().min(2, "Full name is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const profileCompleteSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().optional(),
  organizationId: z.string().min(1, "Organization is required"),
  departmentId: z.string().min(1, "Department is required"),
  majorId: z.string().min(1, "Major is required"),
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, "You must accept the terms"),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type SignupFormData = z.infer<typeof signupSchema>;
export type ProfileCompleteFormData = z.infer<typeof profileCompleteSchema>;
