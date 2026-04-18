import { apiClient } from "./client";
import type {
    Organization,
    Department,
    Major,
    EntityRequest,
} from "@/lib/types/educational";

export interface CompleteEducationalProfilePayload {
    organizationId: string;
    departmentId: string;
    majorId: string;
    firstName: string;
    lastName: string;
    studentId: string;
    phone?: string;
    year?: number;
    termsAccepted: boolean;
}

export interface EntityRequestPayload {
    type: "organization" | "department" | "major";
    name: string;
    description?: string;
    parentId?: string;
    requesterEmail: string;
}

export const getOrganizations = async (): Promise<Organization[]> => {
    const response = await apiClient.get<Organization[]>("/organizations");
    return response.data;
};

export const getDepartmentsByOrganization = async (
    organizationId: string,
): Promise<Department[]> => {
    const response = await apiClient.get<Department[]>(
        `/organizations/${organizationId}/departments`,
    );
    return response.data;
};

export const getMajorsByDepartment = async (
    departmentId: string,
): Promise<Major[]> => {
    const response = await apiClient.get<Major[]>(
        `/departments/${departmentId}/majors`,
    );
    return response.data;
};

export const submitEntityRequest = async (
    payload: EntityRequestPayload,
): Promise<EntityRequest> => {
    const response = await apiClient.post<EntityRequest>("/requests/entities", payload);
    return response.data;
};

export const completeEducationalProfile = async (
    payload: CompleteEducationalProfilePayload,
): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(
        "/auth/complete-profile",
        payload,
    );
    return response.data;
};