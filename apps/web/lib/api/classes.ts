import { apiClient } from "./client";

export interface Course {
  id: string;
  name: string;
  description?: string;
  code?: string;
  credits?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClassInstance {
  id: string;
  classCode?: string;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  capacity?: number;
  enrolledCount?: number;
  instructor?: string;
  course: Course;
  courseId: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get all classes
export const getClasses = async (): Promise<ClassInstance[]> => {
  try {
    const response = await apiClient.get<ClassInstance[]>("/classes");
    return response.data;
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

// Get class by ID
export const getClassById = async (id: string): Promise<ClassInstance> => {
  try {
    const response = await apiClient.get<ClassInstance>(`/classes/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching class:", error);
    throw error;
  }
};

// Enroll in a class
export const enrollClass = async (classId: string): Promise<any> => {
  try {
    const response = await apiClient.post(`/classes/${classId}/enroll`, {});
    return response.data;
  } catch (error) {
    console.error("Error enrolling in class:", error);
    throw error;
  }
};

// Leave a class
export const leaveClass = async (classId: string): Promise<any> => {
  try {
    const response = await apiClient.post(`/classes/${classId}/leave`, {});
    return response.data;
  } catch (error) {
    console.error("Error leaving class:", error);
    throw error;
  }
};
