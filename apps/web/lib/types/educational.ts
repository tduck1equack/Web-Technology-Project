export interface Organization {
  id: string;
  name: string; // e.g., "Springfield University"
  slug: string; // URL-friendly name
  description?: string | null;
  avatar?: string | null;
  settings: Record<string, unknown>; // JSON field
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string; // e.g., "Computer Science Department"
  slug: string; // URL-friendly name
  description?: string | null;
  avatar?: string | null;
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
}

export interface Major {
  id: string;
  departmentId: string;
  name: string; // e.g., "Software Engineering"
  slug: string; // URL-friendly name
  code: string; // e.g., "SE", "CS"
  description?: string | null;
  department?: Department;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentMember {
  id: string;
  departmentId: string;
  userId: string;
  role: string; // "HEAD", "LECTURER", "ASSISTANT"
  createdAt: string;
}

// For requesting new entities to be added to the system
export interface EntityRequest {
  id: string;
  type: "organization" | "department" | "major";
  name: string;
  description?: string;
  parentId?: string; // organizationId for dept, departmentId for major
  requesterEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
