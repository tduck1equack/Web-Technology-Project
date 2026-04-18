"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    completeEducationalProfile,
    getDepartmentsByOrganization,
    getMajorsByDepartment,
    getOrganizations,
    submitEntityRequest,
} from "@/lib/api/educational";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { SetupProgress } from "./SetupProgress";
import { useAuthStore } from "@/lib/stores/auth-store";
import {
    organizationStepSchema,
    departmentStepSchema,
    majorStepSchema,
    completeSetupSchema,
    entityRequestSchema,
    type OrganizationStepFormData,
    type DepartmentStepFormData,
    type MajorStepFormData,
    type CompleteSetupFormData,
    type EntityRequestFormData,
} from "@/lib/schemas/setup";

type SetupStep = "organization" | "department" | "major" | "complete";

interface EducationalSetupWizardProps {
    currentStep: SetupStep;
}

interface SetupDraft {
    organizationId?: string;
    departmentId?: string;
    majorId?: string;
    firstName?: string;
    lastName?: string;
    studentId?: string;
    phone?: string;
    year?: number;
}

const STORAGE_KEY = "edutech.setup.draft";

const previousStepRoute: Record<SetupStep, string | null> = {
    organization: null,
    department: "/setup/organization",
    major: "/setup/department",
    complete: "/setup/major",
};

const nextStepRoute: Record<SetupStep, string | null> = {
    organization: "/setup/department",
    department: "/setup/major",
    major: "/setup/complete",
    complete: null,
};

export default function EducationalSetupWizard({
    currentStep,
}: EducationalSetupWizardProps) {
    const router = useRouter();
    const { user } = useAuthStore();
    const [hydrated, setHydrated] = useState(false);
    const [draft, setDraft] = useState<SetupDraft>({});
    const [requestFeedback, setRequestFeedback] = useState<string | null>(null);

    const organizationForm = useForm<OrganizationStepFormData>({
        resolver: zodResolver(organizationStepSchema),
        defaultValues: { organizationId: "" },
    });

    const departmentForm = useForm<DepartmentStepFormData>({
        resolver: zodResolver(departmentStepSchema),
        defaultValues: { departmentId: "" },
    });

    const majorForm = useForm<MajorStepFormData>({
        resolver: zodResolver(majorStepSchema),
        defaultValues: { majorId: "" },
    });

    const completeForm = useForm<CompleteSetupFormData>({
        resolver: zodResolver(completeSetupSchema),
        defaultValues: {
            firstName: user?.firstName || "",
            lastName: user?.lastName || "",
            studentId: "",
            phone: "",
            year: undefined,
            termsAccepted: false,
        },
    });

    const organizationRequestForm = useForm<EntityRequestFormData>({
        resolver: zodResolver(entityRequestSchema),
        defaultValues: { name: "", description: "" },
    });

    const departmentRequestForm = useForm<EntityRequestFormData>({
        resolver: zodResolver(entityRequestSchema),
        defaultValues: { name: "", description: "" },
    });

    const majorRequestForm = useForm<EntityRequestFormData>({
        resolver: zodResolver(entityRequestSchema),
        defaultValues: { name: "", description: "" },
    });

    const selectedOrganization = organizationForm.watch("organizationId");
    const selectedDepartment = departmentForm.watch("departmentId");
    const selectedMajor = majorForm.watch("majorId");

    const organizationsQuery = useQuery({
        queryKey: ["setup-organizations"],
        queryFn: getOrganizations,
    });

    const departmentsQuery = useQuery({
        queryKey: ["setup-departments", draft.organizationId],
        queryFn: () => getDepartmentsByOrganization(draft.organizationId as string),
        enabled: Boolean(draft.organizationId),
    });

    const majorsQuery = useQuery({
        queryKey: ["setup-majors", draft.departmentId],
        queryFn: () => getMajorsByDepartment(draft.departmentId as string),
        enabled: Boolean(draft.departmentId),
    });

    const requestMutation = useMutation({
        mutationFn: submitEntityRequest,
        onSuccess: () => {
            setRequestFeedback("Đã gửi yêu cầu thành công. Admin sẽ duyệt trong thời gian sớm nhất.");
        },
        onError: (error) => {
            setRequestFeedback(
                error instanceof Error ? error.message : "Gửi yêu cầu thất bại.",
            );
        },
    });

    const completeMutation = useMutation({
        mutationFn: completeEducationalProfile,
        onSuccess: () => {
            localStorage.removeItem(STORAGE_KEY);
            router.push("/classes");
        },
    });

    const saveDraft = (patch: Partial<SetupDraft>) => {
        setDraft((prev) => {
            const next = { ...prev, ...patch };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const clearFromStep = (step: "department" | "major") => {
        setDraft((prev) => {
            const next = { ...prev };
            if (step === "department") {
                delete next.departmentId;
                delete next.majorId;
            }
            if (step === "major") {
                delete next.majorId;
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    useEffect(() => {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as SetupDraft;
            setDraft(parsed);

            organizationForm.reset({
                organizationId: parsed.organizationId || "",
            });

            departmentForm.reset({
                departmentId: parsed.departmentId || "",
            });

            majorForm.reset({
                majorId: parsed.majorId || "",
            });

            completeForm.reset({
                firstName: parsed.firstName || user?.firstName || "",
                lastName: parsed.lastName || user?.lastName || "",
                studentId: parsed.studentId || "",
                phone: parsed.phone || "",
                year: parsed.year,
                termsAccepted: false,
            });
        } else {
            completeForm.reset({
                firstName: user?.firstName || "",
                lastName: user?.lastName || "",
                studentId: "",
                phone: "",
                year: undefined,
                termsAccepted: false,
            });
        }

        setHydrated(true);
    }, [completeForm, departmentForm, majorForm, organizationForm, user]);

    useEffect(() => {
        if (!hydrated) return;

        if (currentStep === "department" && !draft.organizationId) {
            router.replace("/setup/organization");
            return;
        }

        if (currentStep === "major" && (!draft.organizationId || !draft.departmentId)) {
            router.replace("/setup/department");
            return;
        }

        if (
            currentStep === "complete" &&
            (!draft.organizationId || !draft.departmentId || !draft.majorId)
        ) {
            router.replace("/setup/major");
        }
    }, [currentStep, draft, hydrated, router]);

    const stepTitle = useMemo(() => {
        switch (currentStep) {
            case "organization":
                return "Bước 1: Chọn tổ chức";
            case "department":
                return "Bước 2: Chọn khoa";
            case "major":
                return "Bước 3: Chọn ngành";
            case "complete":
                return "Bước 4: Hoàn thiện hồ sơ";
            default:
                return "Thiết lập hồ sơ";
        }
    }, [currentStep]);

    const stepDescription = useMemo(() => {
        switch (currentStep) {
            case "organization":
                return "Chọn trường hoặc tổ chức giáo dục của bạn.";
            case "department":
                return "Chọn khoa tương ứng với tổ chức đã chọn.";
            case "major":
                return "Chọn ngành học của bạn.";
            case "complete":
                return "Điền thông tin cuối cùng để kích hoạt tài khoản học tập.";
            default:
                return "";
        }
    }, [currentStep]);

    const onBack = () => {
        const prev = previousStepRoute[currentStep];
        if (prev) router.push(prev);
    };

    const onSubmitOrganization = (values: OrganizationStepFormData) => {
        if (values.organizationId === "__other__") return;
        saveDraft({ organizationId: values.organizationId });
        clearFromStep("department");
        const next = nextStepRoute.organization;
        if (next) router.push(next);
    };

    const onSubmitDepartment = (values: DepartmentStepFormData) => {
        if (values.departmentId === "__other__") return;
        saveDraft({ departmentId: values.departmentId });
        clearFromStep("major");
        const next = nextStepRoute.department;
        if (next) router.push(next);
    };

    const onSubmitMajor = (values: MajorStepFormData) => {
        if (values.majorId === "__other__") return;
        saveDraft({ majorId: values.majorId });
        const next = nextStepRoute.major;
        if (next) router.push(next);
    };

    const onSubmitComplete = async (values: CompleteSetupFormData) => {
        saveDraft({
            firstName: values.firstName,
            lastName: values.lastName,
            studentId: values.studentId,
            phone: values.phone,
            year: values.year,
        });

        if (!draft.organizationId || !draft.departmentId || !draft.majorId) {
            return;
        }

        await completeMutation.mutateAsync({
            organizationId: draft.organizationId,
            departmentId: draft.departmentId,
            majorId: draft.majorId,
            firstName: values.firstName,
            lastName: values.lastName,
            studentId: values.studentId,
            phone: values.phone || undefined,
            year: values.year,
            termsAccepted: values.termsAccepted,
        });
    };

    if (!hydrated) {
        return (
            <div className="flex min-h-[360px] items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <SetupProgress currentStep={currentStep} />

            <div className="mt-6">
                <h1 className="text-2xl font-bold text-slate-900">{stepTitle}</h1>
                <p className="mt-1 text-sm text-slate-600">{stepDescription}</p>
            </div>

            {requestFeedback && (
                <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                    {requestFeedback}
                </div>
            )}

            {currentStep === "organization" && (
                <form className="mt-6 space-y-4" onSubmit={organizationForm.handleSubmit(onSubmitOrganization)}>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">
                            Tổ chức
                        </label>
                        <select
                            {...organizationForm.register("organizationId")}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">-- Chọn tổ chức --</option>
                            {organizationsQuery.data?.map((org) => (
                                <option key={org.id} value={org.id}>
                                    {org.name}
                                </option>
                            ))}
                            <option value="__other__">Không có trong danh sách</option>
                        </select>
                        {organizationForm.formState.errors.organizationId && (
                            <p className="mt-1 text-sm text-red-600">
                                {organizationForm.formState.errors.organizationId.message}
                            </p>
                        )}
                    </div>

                    {selectedOrganization === "__other__" && (
                        <form
                            className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
                            onSubmit={organizationRequestForm.handleSubmit(async (v) => {
                                await requestMutation.mutateAsync({
                                    type: "organization",
                                    name: v.name,
                                    description: v.description,
                                    requesterEmail: user?.email || "",
                                });
                            })}
                        >
                            <p className="text-sm font-medium text-amber-800">Gửi yêu cầu thêm tổ chức</p>
                            <input
                                {...organizationRequestForm.register("name")}
                                placeholder="Tên tổ chức cần thêm"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                            <textarea
                                {...organizationRequestForm.register("description")}
                                placeholder="Mô tả (tùy chọn)"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                rows={3}
                            />
                            <button
                                type="submit"
                                disabled={requestMutation.isPending}
                                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                            >
                                {requestMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
                            </button>
                        </form>
                    )}

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={organizationsQuery.isLoading || selectedOrganization === "__other__"}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </form>
            )}

            {currentStep === "department" && (
                <form className="mt-6 space-y-4" onSubmit={departmentForm.handleSubmit(onSubmitDepartment)}>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Khoa</label>
                        <select
                            {...departmentForm.register("departmentId")}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">-- Chọn khoa --</option>
                            {departmentsQuery.data?.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                            <option value="__other__">Không có trong danh sách</option>
                        </select>
                        {departmentForm.formState.errors.departmentId && (
                            <p className="mt-1 text-sm text-red-600">
                                {departmentForm.formState.errors.departmentId.message}
                            </p>
                        )}
                    </div>

                    {selectedDepartment === "__other__" && (
                        <form
                            className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
                            onSubmit={departmentRequestForm.handleSubmit(async (v) => {
                                await requestMutation.mutateAsync({
                                    type: "department",
                                    name: v.name,
                                    description: v.description,
                                    parentId: draft.organizationId,
                                    requesterEmail: user?.email || "",
                                });
                            })}
                        >
                            <p className="text-sm font-medium text-amber-800">Gửi yêu cầu thêm khoa</p>
                            <input
                                {...departmentRequestForm.register("name")}
                                placeholder="Tên khoa cần thêm"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                            <textarea
                                {...departmentRequestForm.register("description")}
                                placeholder="Mô tả (tùy chọn)"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                rows={3}
                            />
                            <button
                                type="submit"
                                disabled={requestMutation.isPending}
                                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                            >
                                {requestMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
                            </button>
                        </form>
                    )}

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Quay lại
                        </button>
                        <button
                            type="submit"
                            disabled={departmentsQuery.isLoading || selectedDepartment === "__other__"}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </form>
            )}

            {currentStep === "major" && (
                <form className="mt-6 space-y-4" onSubmit={majorForm.handleSubmit(onSubmitMajor)}>
                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Ngành</label>
                        <select
                            {...majorForm.register("majorId")}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                        >
                            <option value="">-- Chọn ngành --</option>
                            {majorsQuery.data?.map((major) => (
                                <option key={major.id} value={major.id}>
                                    {major.name}
                                </option>
                            ))}
                            <option value="__other__">Không có trong danh sách</option>
                        </select>
                        {majorForm.formState.errors.majorId && (
                            <p className="mt-1 text-sm text-red-600">
                                {majorForm.formState.errors.majorId.message}
                            </p>
                        )}
                    </div>

                    {selectedMajor === "__other__" && (
                        <form
                            className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-4"
                            onSubmit={majorRequestForm.handleSubmit(async (v) => {
                                await requestMutation.mutateAsync({
                                    type: "major",
                                    name: v.name,
                                    description: v.description,
                                    parentId: draft.departmentId,
                                    requesterEmail: user?.email || "",
                                });
                            })}
                        >
                            <p className="text-sm font-medium text-amber-800">Gửi yêu cầu thêm ngành</p>
                            <input
                                {...majorRequestForm.register("name")}
                                placeholder="Tên ngành cần thêm"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            />
                            <textarea
                                {...majorRequestForm.register("description")}
                                placeholder="Mô tả (tùy chọn)"
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                rows={3}
                            />
                            <button
                                type="submit"
                                disabled={requestMutation.isPending}
                                className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-60"
                            >
                                {requestMutation.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
                            </button>
                        </form>
                    )}

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Quay lại
                        </button>
                        <button
                            type="submit"
                            disabled={majorsQuery.isLoading || selectedMajor === "__other__"}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                            Tiếp tục
                        </button>
                    </div>
                </form>
            )}

            {currentStep === "complete" && (
                <form className="mt-6 space-y-4" onSubmit={completeForm.handleSubmit(onSubmitComplete)}>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Tên</label>
                            <input
                                {...completeForm.register("firstName")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Nhập tên"
                            />
                            {completeForm.formState.errors.firstName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {completeForm.formState.errors.firstName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Họ</label>
                            <input
                                {...completeForm.register("lastName")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                placeholder="Nhập họ"
                            />
                            {completeForm.formState.errors.lastName && (
                                <p className="mt-1 text-sm text-red-600">
                                    {completeForm.formState.errors.lastName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-slate-700">Mã sinh viên</label>
                        <input
                            {...completeForm.register("studentId")}
                            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                            placeholder="VD: 22520001"
                        />
                        {completeForm.formState.errors.studentId && (
                            <p className="mt-1 text-sm text-red-600">
                                {completeForm.formState.errors.studentId.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Số điện thoại</label>
                            <input
                                {...completeForm.register("phone")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                placeholder="VD: 0901234567"
                            />
                            {completeForm.formState.errors.phone && (
                                <p className="mt-1 text-sm text-red-600">
                                    {completeForm.formState.errors.phone.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-700">Năm học</label>
                            <input
                                type="number"
                                min={1}
                                max={6}
                                {...completeForm.register("year")}
                                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                                placeholder="1 - 6"
                            />
                            {completeForm.formState.errors.year && (
                                <p className="mt-1 text-sm text-red-600">
                                    {completeForm.formState.errors.year.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <label className="flex items-start gap-2 text-sm text-slate-700">
                        <input
                            type="checkbox"
                            {...completeForm.register("termsAccepted")}
                            className="mt-1"
                        />
                        <span>Tôi đồng ý với điều khoản sử dụng và chính sách bảo mật.</span>
                    </label>
                    {completeForm.formState.errors.termsAccepted && (
                        <p className="text-sm text-red-600">
                            {completeForm.formState.errors.termsAccepted.message}
                        </p>
                    )}

                    {completeMutation.error && (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {completeMutation.error instanceof Error
                                ? completeMutation.error.message
                                : "Không thể hoàn tất hồ sơ. Vui lòng thử lại."}
                        </div>
                    )}

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={onBack}
                            className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                        >
                            Quay lại
                        </button>
                        <button
                            type="submit"
                            disabled={completeMutation.isPending}
                            className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                        >
                            {completeMutation.isPending ? "Đang hoàn tất..." : "Hoàn tất thiết lập"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}