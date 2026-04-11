import { apiClient } from "./client";

export interface UserProfile {
  id: string;
  authUserId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  avatar: string | null;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  role: "STUDENT" | "INSTRUCTOR" | "ADMIN";
  status: "ONLINE" | "OFFLINE" | "AWAY";
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  bio?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
}

// Get current user profile
export const getCurrentUserProfile = async (): Promise<UserProfile> => {
  try {
    const response = await apiClient.get<UserProfile>("/users/profile");
    return response.data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (
  data: UpdateProfileData
): Promise<UserProfile> => {
  try {
    const response = await apiClient.put<UserProfile>("/users/profile", data);
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Get user by ID
export const getUserById = async (userId: string): Promise<UserProfile> => {
  try {
    const response = await apiClient.get<UserProfile>(`/users/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user:", error);
    throw error;
  }
};

// Update user avatar
export const uploadAvatar = async (file: File): Promise<{ url: string }> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<{ url: string }>(
      "/users/upload-avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading avatar:", error);
    throw error;
  }
};
