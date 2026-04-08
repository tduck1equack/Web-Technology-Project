export interface Organization {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  organizationId: string;
  organization?: Organization;
  createdAt: string;
  updatedAt: string;
}

export interface Major {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  department?: Department;
  createdAt: string;
  updatedAt: string;
}

export interface EntityRequest {
  id: string;
  type: "organization" | "department" | "major";
  name: string;
  description?: string;
  parentId?: string;
  requesterEmail: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}
