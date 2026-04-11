"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  getClassById,
  enrollClass,
  leaveClass,
  ClassInstance,
} from "@/lib/api/classes";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ClassDetailPageProps {
  classId: string;
}

export default function ClassDetailPage({ classId }: ClassDetailPageProps) {
  const router = useRouter();
  const [isEnrolled, setIsEnrolled] = useState(false);

  const {
    data: classData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["class", classId],
    queryFn: () => getClassById(classId),
    staleTime: 5 * 60 * 1000,
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollClass(classId),
    onSuccess: () => {
      setIsEnrolled(true);
      refetch();
    },
  });

  const leaveMutation = useMutation({
    mutationFn: () => leaveClass(classId),
    onSuccess: () => {
      setIsEnrolled(false);
      refetch();
    },
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Lỗi khi tải lớp học
            </h2>
            <p className="text-red-700">
              {error instanceof Error
                ? error.message
                : "Có lỗi xảy ra khi tải thông tin lớp học"}
            </p>
            <Link
              href="/classes"
              className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-yellow-900 mb-2">
              Không tìm thấy lớp học
            </h2>
            <p className="text-yellow-700">
              Lớp học bạn tìm kiếm không tồn tại.
            </p>
            <Link
              href="/classes"
              className="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
            >
              Quay lại danh sách
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-gray-600">
          <Link href="/" className="hover:text-gray-900">
            Trang chủ
          </Link>
          <span>/</span>
          <Link href="/classes" className="hover:text-gray-900">
            Lớp học
          </Link>
          <span>/</span>
          <span className="text-gray-900">{classData.title}</span>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h1 className="text-4xl font-bold mb-2">{classData.title}</h1>
                {classData.course && (
                  <p className="text-lg opacity-90">{classData.course.name}</p>
                )}
              </div>
              <div className="text-right">
                {classData.classCode && (
                  <div className="font-mono text-sm opacity-75 mb-2">
                    Mã lớp: {classData.classCode}
                  </div>
                )}
                <div className="text-sm">
                  {classData.enrolledCount}/{classData.capacity} sinh viên
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Main Info */}
              <div className="md:col-span-2 space-y-8">
                {/* Description */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Mô tả
                  </h2>
                  <p className="text-gray-600 leading-relaxed">
                    {classData.description ||
                      "Không có mô tả cho lớp học này."}
                  </p>
                </section>

                {/* Instructor */}
                {classData.instructor && (
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Giảng viên
                    </h2>
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-gray-900 font-semibold">
                        {classData.instructor}
                      </p>
                    </div>
                  </section>
                )}

                {/* Schedule */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Lịch trình
                  </h2>
                  <div className="space-y-3">
                    {classData.startDate && (
                      <div className="flex gap-4 items-center">
                        <span className="text-gray-600 w-32">Bắt đầu:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(classData.startDate).toLocaleDateString(
                            "vi-VN",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                    {classData.endDate && (
                      <div className="flex gap-4 items-center">
                        <span className="text-gray-600 w-32">Kết thúc:</span>
                        <span className="font-semibold text-gray-900">
                          {new Date(classData.endDate).toLocaleDateString(
                            "vi-VN",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </section>

                {/* Enrollment Progress */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    Tình trạng ghi danh
                  </h2>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Sinh viên đã ghi danh</span>
                      <span className="font-semibold text-gray-900">
                        {classData.enrolledCount || 0} /{" "}
                        {classData.capacity || "Không giới hạn"}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all"
                        style={{
                          width: classData.capacity
                            ? `${
                                ((classData.enrolledCount || 0) /
                                  classData.capacity) *
                                100
                              }%`
                            : "0%",
                        }}
                      ></div>
                    </div>
                  </div>
                </section>

                {/* Course Details */}
                {classData.course && (
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      Thông tin khóa học
                    </h2>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2 border border-gray-200">
                      {classData.course.name && (
                        <div>
                          <span className="text-gray-600">Tên khóa học:</span>
                          <p className="font-semibold text-gray-900">
                            {classData.course.name}
                          </p>
                        </div>
                      )}
                      {classData.course.code && (
                        <div>
                          <span className="text-gray-600">Mã khóa học:</span>
                          <p className="font-mono text-gray-900">
                            {classData.course.code}
                          </p>
                        </div>
                      )}
                      {classData.course.credits && (
                        <div>
                          <span className="text-gray-600">Tín chỉ:</span>
                          <p className="font-semibold text-gray-900">
                            {classData.course.credits}
                          </p>
                        </div>
                      )}
                      {classData.course.description && (
                        <div>
                          <span className="text-gray-600">Mô tả:</span>
                          <p className="text-gray-900">
                            {classData.course.description}
                          </p>
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <div className="md:col-span-1">
                {/* Action Buttons */}
                <div className="space-y-3 mb-8">
                  {!isEnrolled ? (
                    <button
                      onClick={() => enrollMutation.mutate()}
                      disabled={enrollMutation.isPending}
                      className="w-full px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
                    >
                      {enrollMutation.isPending ? "Đang xử lý..." : "Ghi danh"}
                    </button>
                  ) : (
                    <button
                      onClick={() => leaveMutation.mutate()}
                      disabled={leaveMutation.isPending}
                      className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition"
                    >
                      {leaveMutation.isPending ? "Đang xử lý..." : "Hủy ghi danh"}
                    </button>
                  )}
                  <Link
                    href="/classes"
                    className="block text-center px-4 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition"
                  >
                    Quay lại
                  </Link>
                </div>

                {/* Status Box */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Thông tin ghi danh
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Trạng thái:</span>
                      <p className="font-semibold text-green-600">
                        {isEnrolled ? "✓ Đã ghi danh" : "⊗ Chưa ghi danh"}
                      </p>
                    </div>
                    {classData.startDate && (
                      <div>
                        <span className="text-gray-600">Bắt đầu:</span>
                        <p className="font-semibold text-gray-900">
                          {new Date(classData.startDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    )}
                    {classData.endDate && (
                      <div>
                        <span className="text-gray-600">Kết thúc:</span>
                        <p className="font-semibold text-gray-900">
                          {new Date(classData.endDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
