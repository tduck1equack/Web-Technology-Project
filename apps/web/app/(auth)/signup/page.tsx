import type { Metadata } from "next";
import { SignupForm } from "../../../components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create Account - EduTech Platform",
  description: "Create your EduTech student account",
};

export default function SignupPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Join EduTech
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Create an account to start your learning journey
        </p>
      </div>
      <SignupForm />
    </div>
  );
}
