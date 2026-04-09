import type { Metadata } from "next";
import { LoginForm } from "../../../components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign In - EduTech Platform",
  description: "Sign in to your EduTech account",
};

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Sign in to your account to continue learning
        </p>
      </div>
      <LoginForm />
    </div>
  );
}
