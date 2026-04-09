"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/auth-store";
import { ProtectedHeader } from "@/components/layout/ProtectedHeader";
import { Sidebar } from "@/components/layout/Sidebar";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const router = useRouter();
  const { user, loading } = useAuthStore();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  // Don't render anything if user is not authenticated (will redirect)
  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <ProtectedHeader />

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto bg-white dark:bg-slate-800 shadow-sm">
            <div className="px-6 py-8">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}
