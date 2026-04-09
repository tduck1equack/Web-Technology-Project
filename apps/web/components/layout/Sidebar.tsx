"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: "🏠" },
  { name: "Courses", href: "/courses", icon: "📚" },
  { name: "Calendar", href: "/calendar", icon: "📅" },
  { name: "Assignments", href: "/assignments", icon: "📝" },
  { name: "Grades", href: "/grades", icon: "📊" },
  { name: "Messages", href: "/messages", icon: "💬" },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  return (
    <div
      className={`bg-slate-800 text-white transition-all duration-300 ${isCollapsed ? "w-16" : "w-64"}`}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        {!isCollapsed && <h2 className="text-xl font-bold">EduTech</h2>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 rounded-lg hover:bg-slate-700 transition-colors"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span className="text-lg">{isCollapsed ? "→" : "←"}</span>
        </button>
      </div>

      {/* User Info */}
      {!isCollapsed && user && (
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm font-semibold">
              {user.firstName
                ? user.firstName[0].toUpperCase()
                : user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">
                {user.firstName
                  ? `${user.firstName} ${user.lastName}`
                  : user.email}
              </p>
              <p className="text-xs text-slate-400 capitalize">
                {user.role.toLowerCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="mt-4 px-2">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <span className="text-lg mr-3">{item.icon}</span>
                  {!isCollapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-4 left-2 right-2">
        <Link
          href="/profile"
          className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-700 hover:text-white transition-colors ${
            pathname === "/profile" ? "bg-blue-600 text-white" : ""
          }`}
          title={isCollapsed ? "Profile" : undefined}
        >
          <span className="text-lg mr-3">👤</span>
          {!isCollapsed && <span>Profile</span>}
        </Link>
      </div>
    </div>
  );
}
