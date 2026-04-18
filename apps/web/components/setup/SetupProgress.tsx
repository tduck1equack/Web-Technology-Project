"use client";

import { cn } from "@/lib/utils";

interface SetupProgressProps {
    currentStep: "organization" | "department" | "major" | "complete";
}

const steps = [
    { key: "organization", label: "Tổ chức" },
    { key: "department", label: "Khoa" },
    { key: "major", label: "Ngành" },
    { key: "complete", label: "Hoàn tất" },
] as const;

export function SetupProgress({ currentStep }: SetupProgressProps) {
    const currentIndex = steps.findIndex((step) => step.key === currentStep);

    return (
        <div className="w-full">
            <ol className="grid grid-cols-4 gap-2">
                {steps.map((step, index) => {
                    const isDone = index < currentIndex;
                    const isActive = index === currentIndex;

                    return (
                        <li key={step.key} className="flex flex-col items-center">
                            <div
                                className={cn(
                                    "h-9 w-9 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                                    isDone && "bg-emerald-600 text-white",
                                    isActive && "bg-blue-600 text-white",
                                    !isDone && !isActive && "bg-slate-200 text-slate-700",
                                )}
                            >
                                {isDone ? "✓" : index + 1}
                            </div>
                            <span
                                className={cn(
                                    "mt-2 text-xs text-center",
                                    isActive ? "text-blue-700 font-semibold" : "text-slate-500",
                                )}
                            >
                                {step.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}