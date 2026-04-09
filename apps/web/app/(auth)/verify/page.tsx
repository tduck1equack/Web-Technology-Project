"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function VerifyPage() {
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if there's an email verification token in the URL
    const type = searchParams.get("type");

    if (type === "email_change" || type === "recovery") {
      // Email verification was successful
      setLoading(false);
    } else {
      // Just show the verification page
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verifying your email...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we verify your email address
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <div className="mx-auto mb-6 flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Email Verified Successfully!
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        Your email has been verified. You can now complete your educational
        profile or start learning.
      </p>

      <div className="flex flex-col gap-3">
        <Link
          href="/setup/organization"
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Complete Your Profile
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
