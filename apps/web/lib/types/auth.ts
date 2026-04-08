// Enums matching database schema
export type UserRole = "STUDENT" | "TEACHER" | "ADMIN";
export type UserStatus = "ONLINE" | "AWAY" | "BUSY" | "OFFLINE";

export interface UserProfile {
  id: string;
  // Supabase Auth Integration
  authUserId?: string | null;

  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
  role: UserRole;
  status: UserStatus;
  lastSeen: string;

  // Student-specific fields
  majorId?: string | null; // Only for students
  year?: number | null; // Academic year (1st year, 2nd year, etc.)

  // Auth metadata
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string | null;

  createdAt: string;
  updatedAt: string;

  // Helper computed field for frontend
  fullName?: string; // firstName + lastName computed field
  isProfileComplete?: boolean; // computed based on required fields
}

export interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export interface ProfileSetupStep {
  step: "personal" | "organization" | "department" | "major" | "complete";
  completed: boolean;
  data?: Record<string, unknown>;
}
