import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - EduTech Platform",
  description: "Sign in or create an account",
};

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex min-h-screen">
        {/* Brand/Visual Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-purple-700 relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="max-w-md">
              <h1 className="text-4xl font-bold mb-6">Welcome to EduTech</h1>
              <p className="text-xl leading-relaxed mb-8">
                Transform your learning experience with our modern educational
                platform. Connect, learn, and grow with students and educators
                worldwide.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Interactive Learning Environment</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Real-time Collaboration</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                  <span>Progress Tracking & Analytics</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 right-40 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-60 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
        </div>

        {/* Form Section */}
        <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                EduTech
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Modern Educational Platform
              </p>
            </div>

            {/* Form Content */}
            <div className="bg-white dark:bg-slate-800 py-8 px-6 shadow-xl ring-1 ring-gray-900/5 rounded-xl">
              {children}
            </div>

            {/* Footer Links */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                By continuing, you agree to our{" "}
                <a
                  href="/terms"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Privacy Policy
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
