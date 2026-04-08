export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  studentId?: string;
  phone?: string;
  profilePhotoUrl?: string;
  organizationId?: string;
  departmentId?: string;
  majorId?: string;
  role: "STUDENT" | "TEACHER" | "ADMIN";
  isProfileComplete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface ProfileSetupStep {
  step: "organization" | "department" | "major" | "complete";
  completed: boolean;
  data?: Record<string, unknown>;
}
