"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getClasses } from "@/lib/api/classes";
import { useAuthStore } from "@/lib/stores/auth-store";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { formatDate } from "@/lib/utils";

export default function DashboardPage() {
    const router = useRouter();
    const { user } = useAuthStore();
    const [hydrated, setHydrated] = useState(false);

    const { data: classes, isLoading: classesLoading } = useQuery({
        queryKey: ["dashboard-classes"],
        queryFn: getClasses,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        setHydrated(true);
    }, []);

    if (!hydrated || classesLoading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <LoadingSpinner size="large" />
            </div>
        );
    }

    const enrolledCount = classes?.length || 0;
    const upcomingClasses = classes
        ?.filter((c) => c.startDate && new Date(c.startDate) > new Date())
        .slice(0, 3) || [];

    const getProgressPercentage = (classItem: any) => {
        if (!classItem.capacity) return 0;
        return Math.round(((classItem.enrolledCount || 0) / classItem.capacity) * 100);
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-10 text-white shadow-lg">
                <div className="max-w-2xl">
                    <h1 className="text-4xl font-bold mb-2">
                        Chào mừng, {user?.firstName || user?.email?.split("@")[0]}! 👋
                    </h1>
                    <p className="text-lg opacity-90">
                        Hôm nay là một ngày tuyệt vời để học tập và phát triển bản thân.
                    </p>
                    <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                            href="/classes"
                            className="inline-block rounded-lg bg-white px-6 py-2 font-semibold text-blue-600 hover:bg-gray-100 transition"
                        >
                            Xem tất cả lớp học
                        </Link>
                        <Link
                            href="/profile"
                            className="inline-block rounded-lg border-2 border-white px-6 py-2 font-semibold text-white hover:bg-white/10 transition"
                        >
                            Cập nhật hồ sơ
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {/* Enrolled Classes */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Lớp đã ghi danh</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {enrolledCount}
                            </p>
                        </div>
                        <div className="text-4xl">📚</div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">
                        Bạn đang theo học {enrolledCount} lớp học
                    </p>
                </div>

                {/* Study Streak */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Chuỗi học liên tiếp</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">12</p>
                        </div>
                        <div className="text-4xl">🔥</div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">
                        Giữ lửa học tập mỗi ngày
                    </p>
                </div>

                {/* Completion Rate */}
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-slate-600">Tỷ lệ hoàn thành</p>
                            <p className="mt-2 text-3xl font-bold text-slate-900">
                                {enrolledCount > 0
                                    ? Math.round(
                                        (classes?.reduce(
                                            (sum: number, c: any) =>
                                                sum + getProgressPercentage(c),
                                            0
                                        ) || 0) / enrolledCount
                                    )
                                    : 0}
                                %
                            </p>
                        </div>
                        <div className="text-4xl">📊</div>
                    </div>
                    <p className="mt-4 text-xs text-slate-500">
                        Tổng tiến độ các lớp học
                    </p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    Hành động nhanh
                </h2>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                    <Link
                        href="/classes"
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-center text-sm font-medium text-blue-700 hover:bg-blue-100 transition"
                    >
                        🔍 Khám phá lớp học
                    </Link>
                    <Link
                        href="/profile"
                        className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-center text-sm font-medium text-green-700 hover:bg-green-100 transition"
                    >
                        👤 Chỉnh sửa hồ sơ
                    </Link>
                    <Link
                        href="/setup/organization"
                        className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-center text-sm font-medium text-purple-700 hover:bg-purple-100 transition"
                    >
                        🧭 Cập nhật học vụ
                    </Link>
                    <button
                        onClick={() => alert("Tính năng sắp có mặt")}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
                    >
                        💬 Liên hệ hỗ trợ
                    </button>
                </div>
            </div>

            {/* Upcoming Classes */}
            {upcomingClasses.length > 0 && (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                        Lớp học sắp diễn ra
                    </h2>
                    <div className="space-y-3">
                        {upcomingClasses.map((classItem: any) => (
                            <Link
                                key={classItem.id}
                                href={`/classes/${classItem.id}`}
                                className="block rounded-lg border border-slate-200 p-4 hover:border-blue-400 hover:bg-blue-50 transition"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-900">
                                            {classItem.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-slate-600">
                                            {classItem.course?.name}
                                        </p>
                                        {classItem.startDate && (
                                            <p className="mt-2 text-xs text-slate-500">
                                                📅 Bắt đầu: {formatDate(classItem.startDate)}
                                            </p>
                                        )}
                                    </div>
                                    <div className="ml-4 text-right">
                                        <div className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                                            Xem chi tiết →
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Current Classes */}
            {classes && classes.length > 0 ? (
                <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-slate-900">
                            Lớp học của tôi
                        </h2>
                        <Link
                            href="/classes"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            Xem tất cả →
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {classes.slice(0, 4).map((classItem: any) => (
                            <Link
                                key={classItem.id}
                                href={`/classes/${classItem.id}`}
                                className="rounded-lg border border-slate-200 p-4 hover:shadow-md transition"
                            >
                                <div className="mb-3 h-3 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500" />
                                <h3 className="font-semibold text-slate-900 line-clamp-1">
                                    {classItem.title}
                                </h3>
                                <p className="mt-1 text-sm text-slate-600 line-clamp-1">
                                    {classItem.course?.name}
                                </p>
                                <div className="mt-3 space-y-2">
                                    <div className="flex justify-between text-xs text-slate-500">
                                        <span>Tiến độ</span>
                                        <span>{getProgressPercentage(classItem)}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all"
                                            style={{
                                                width: `${getProgressPercentage(classItem)}%`,
                                            }}
                                        />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                    <div className="text-5xl mb-4">📚</div>
                    <h2 className="text-2xl font-semibold text-slate-900 mb-2">
                        Chưa có lớp học
                    </h2>
                    <p className="text-slate-600 mb-6">
                        Hãy khám phá và ghi danh vào các lớp học thú vị
                    </p>
                    <Link
                        href="/classes"
                        className="inline-block rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 transition"
                    >
                        Khám phá lớp học
                    </Link>
                </div>
            )}

            {/* Footer Info */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6">
                <p className="text-sm text-slate-600">
                    💡 <strong>Mẹo:</strong> Hãy thường xuyên kiểm tra dashboard để cập nhật
                    tiến độ học tập, nhận thông báo mới, và khám phá các khóa học mới.
                </p>
            </div>
        </div>
    );
}
