"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

interface HomePageProps {
  user: User | null;
}

export default function HomePage({ user }: HomePageProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to classes if already logged in
  useEffect(() => {
    if (user && !isLoading) {
      router.push("/classes");
    }
  }, [user, router, isLoading]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-blue-200 bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold text-blue-600">EduTech</div>
            {user ? (
              <Link
                href="/profile"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Trang cá nhân
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {user ? (
          // Logged In State
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl font-bold text-gray-900">
                Chào mừng, {user.email?.split("@")[0]}! 👋
              </h1>
              <p className="text-xl text-gray-600">
                Hãy khám phá các lớp học tuyệt vời của chúng tôi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {/* Class Card Placeholder */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="h-12 w-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-2xl">📚</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Các lớp học
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Khám phá và tham gia các lớp học thú vị
                </p>
                <Link
                  href="/classes"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xem tất cả →
                </Link>
              </div>

              {/* Profile Card */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="h-12 w-12 bg-green-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-2xl">👤</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Trang cá nhân</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Xem và chỉnh sửa thông tin cá nhân của bạn
                </p>
                <Link
                  href="/profile"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xem trang cá nhân →
                </Link>
              </div>

              {/* Stats Card */}
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="h-12 w-12 bg-purple-100 rounded-lg mb-4 flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Tiến độ học tập
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Theo dõi tiến độ và thành tựu của bạn
                </p>
                <Link
                  href="/classes"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xem chi tiết →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Not Logged In State
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900">
                Chào mừng đến với EduTech
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Nền tảng học tập trực tuyến hiện đại với các khóa học chất lượng cao
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link
                href="/login"
                className="px-8 py-4 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition shadow-md"
              >
                Đăng nhập
              </Link>
              <Link
                href="/signup"
                className="px-8 py-4 rounded-lg bg-white text-blue-600 font-semibold hover:bg-gray-50 transition shadow-md border-2 border-blue-600"
              >
                Đăng ký
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-12 w-12 bg-blue-100 rounded-lg mb-4 flex items-center justify-center mx-auto">
                  <span className="text-2xl">🎓</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center">
                  Học tập linh hoạt
                </h3>
                <p className="text-gray-600 text-sm text-center">
                  Học bất cứ lúc nào, bất cứ nơi đâu với tốc độ của riêng bạn
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-12 w-12 bg-green-100 rounded-lg mb-4 flex items-center justify-center mx-auto">
                  <span className="text-2xl">👨‍🏫</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center">
                  Giảng viên chất lượng
                </h3>
                <p className="text-gray-600 text-sm text-center">
                  Học từ những GV tận tâm và có kinh nghiệm
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="h-12 w-12 bg-purple-100 rounded-lg mb-4 flex items-center justify-center mx-auto">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2 text-center">
                  Giải pháp đầy đủ
                </h3>
                <p className="text-gray-600 text-sm text-center">
                  Tất cả công cụ cần thiết cho thành công của bạn
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-blue-200 bg-white/80 backdrop-blur-sm mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">EduTech</h3>
              <p className="text-gray-600 text-sm">
                Nền tảng học tập trực tuyến hiện đại
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Nhanh chóng</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Trang chủ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Các lớp học
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Công ty</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Về chúng tôi
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Liên hệ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Hỗ trợ</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Trợ giúp
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900">
                    Điều khoản
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2026 EduTech. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
