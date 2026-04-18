import { z } from "zod";

const phoneRegex = /^[+]?[0-9]{8,15}$/;

export const organizationStepSchema = z.object({
    organizationId: z.string().min(1, "Vui lòng chọn tổ chức"),
});

export const departmentStepSchema = z.object({
    departmentId: z.string().min(1, "Vui lòng chọn khoa"),
});

export const majorStepSchema = z.object({
    majorId: z.string().min(1, "Vui lòng chọn ngành"),
});

export const completeSetupSchema = z.object({
    firstName: z.string().min(2, "Tên phải có ít nhất 2 ký tự"),
    lastName: z.string().min(2, "Họ phải có ít nhất 2 ký tự"),
    studentId: z.string().min(3, "Mã sinh viên không hợp lệ"),
    phone: z
        .string()
        .regex(phoneRegex, "Số điện thoại không hợp lệ")
        .optional()
        .or(z.literal("")),
    year: z.preprocess(
        (value) => {
            if (value === "" || value === null || value === undefined) return undefined;
            return Number(value);
        },
        z
            .number()
            .int("Năm học phải là số nguyên")
            .min(1, "Năm học tối thiểu là 1")
            .max(6, "Năm học tối đa là 6")
            .optional(),
    ),
    termsAccepted: z.literal(true, {
        errorMap: () => ({ message: "Bạn cần đồng ý điều khoản để tiếp tục" }),
    }),
});

export const entityRequestSchema = z.object({
    name: z.string().min(2, "Tên yêu cầu quá ngắn"),
    description: z.string().max(500, "Mô tả tối đa 500 ký tự").optional(),
});

export type OrganizationStepFormData = z.infer<typeof organizationStepSchema>;
export type DepartmentStepFormData = z.infer<typeof departmentStepSchema>;
export type MajorStepFormData = z.infer<typeof majorStepSchema>;
export type CompleteSetupFormData = z.infer<typeof completeSetupSchema>;
export type EntityRequestFormData = z.infer<typeof entityRequestSchema>;