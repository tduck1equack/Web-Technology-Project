"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores/auth-store";
import { createClient } from "@/lib/supabase/client";
import { useState, useRef, useEffect } from "react";

export function ProtectedHeader() {
  const router = useRouter();
  const { user, setUser } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    router.push("/login");
  };

  return (
    <header className="border-b border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">EduTech</h1>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-6">
          {/* User Menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition"
            >
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email?.split("@")[0]}
                </p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                {(user?.email?.charAt(0) || "U").toUpperCase()}
              </div>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg"
                  onClick={() => setShowMenu(false)}
                >
                  <span className="text-lg mr-2">👤</span> Trang cá nhân
                </Link>
                <Link
                  href="/classes"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowMenu(false)}
                >
                  <span className="text-lg mr-2">📚</span> Lớp học của tôi
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg border-t border-gray-200"
                >
                  <span className="text-lg mr-2">🚪</span> Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
