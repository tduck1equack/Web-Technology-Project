"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getClasses, ClassInstance } from "@/lib/api/classes";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export default function ClassesPage() {
  const { data: classes, isLoading, error } = useQuery({
    queryKey: ["classes"],
    queryFn: getClasses,
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-900 mb-2">
              Lỗi khi tải dữ liệu
            </h2>
            <p className="text-red-700">
              {error instanceof Error
                ? error.message
                : "Có lỗi xảy ra khi tải danh sách lớp học"}
            </p>
            <Link
              href="/classes"
              className="mt-4 inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Thử lại
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Danh sách lớp học
          </h1>
          <p className="text-gray-600">
            Có {classes?.length || 0} lớp học có sẵn
          </p>
        </div>

        {/* Classes Grid */}
        {classes && classes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem: ClassInstance) => (
              <Link key={classItem.id} href={`/classes/${classItem.id}`}>
                <div className="h-full bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden">
                  {/* Card Header */}
                  <div
                    className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white flex flex-col justify-center"
                  >
                    <h3 className="text-xl font-bold mb-1">{classItem.title}</h3>
                    <p className="text-sm opacity-90">{classItem.course?.name}</p>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Class Code */}
                    {classItem.classCode && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Mã lớp:</span>
                        <span className="font-mono font-semibold text-gray-900">
                          {classItem.classCode}
                        </span>
                      </div>
                    )}

                    {/* Instructor */}
                    {classItem.instructor && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600 text-sm">Giảng viên:</span>
                        <span className="text-gray-900">{classItem.instructor}</span>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="space-y-1 text-sm">
                      {classItem.startDate && (
                        <p className="text-gray-600">
                          Bắt đầu:{" "}
                          {new Date(classItem.startDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      )}
                      {classItem.endDate && (
                        <p className="text-gray-600">
                          Kết thúc:{" "}
                          {new Date(classItem.endDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </p>
                      )}
                    </div>

                    {/* Enrollment Status */}
                    {classItem.capacity && (
                      <div className="pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center text-xs text-gray-600 mb-2">
                          <span>Sinh viên</span>
                          <span>
                            {classItem.enrolledCount || 0}/{classItem.capacity}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all"
                            style={{
                              width: `${
                                ((classItem.enrolledCount || 0) /
                                  classItem.capacity) *
                                100
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {classItem.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {classItem.description}
                      </p>
                    )}
                  </div>

                  {/* Card Footer */}
                  <div className="bg-gray-50 p-4 border-t border-gray-100">
                    <div className="text-blue-600 font-semibold text-sm hover:text-blue-700">
                      Xem chi tiết →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Chưa có lớp học
            </h2>
            <p className="text-gray-600 mb-6">
              Hiện tại không có lớp học nào có sẵn. Vui lòng quay lại sau.
            </p>
            <Link
              href="/"
              className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Quay lại trang chủ
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
