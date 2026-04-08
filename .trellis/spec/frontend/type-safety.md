# Type Safety Guidelines

> TypeScript patterns and runtime validation with Zod.

---

## Overview

This project enforces **strict type safety** with TypeScript and **runtime validation** with Zod. We prioritize type safety over convenience and use comprehensive typing throughout the application.

**Type Safety Philosophy:**

- **No `any` types** - Use proper typing or `unknown` with type guards
- **Runtime validation** - Use Zod schemas for all external data
- **Type inference** - Let TypeScript infer when possible, be explicit when needed
- **Strict configuration** - `strictNullChecks` enabled, strict mode on

**Current TypeScript Configuration:**

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "strictNullChecks": true
  }
}
```

---

## Type Organization

### Directory Structure

```
apps/web/types/
├── api.ts                 # Backend API types
├── auth.ts                # Authentication types
├── ui.ts                  # UI component prop types
├── database.ts            # Database model types
└── forms.ts               # Form data types

apps/web/lib/validations/
├── auth.ts                # Authentication schemas
├── user.ts                # User profile schemas
├── course.ts              # Course-related schemas
└── organization.ts        # Organization schemas
```

### Type Sharing Strategy

| Type Category       | Location                | Purpose                         |
| ------------------- | ----------------------- | ------------------------------- |
| **API Types**       | `types/api.ts`          | Backend response/request types  |
| **Database Types**  | `types/database.ts`     | Prisma-generated types          |
| **Component Props** | Inline or `types/ui.ts` | Component interfaces            |
| **Form Schemas**    | `lib/validations/`      | Zod schemas with inferred types |
| **Shared Types**    | `packages/types/`       | Cross-app shared types          |

### API Types Pattern

```typescript
// types/api.ts
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    timestamp: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
}

// User-related API types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId: string;
  departmentId?: string;
  majorId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  organizationId: string;
  departmentId?: string;
  majorId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  departmentId?: string;
  majorId?: string;
}

// Authentication types
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}
```

---

## Runtime Validation with Zod

### Schema Organization

```typescript
// lib/validations/user.ts
import { z } from "zod";

export const createUserSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  organizationId: z.string().uuid("Invalid organization ID"),
  departmentId: z.string().uuid("Invalid department ID").optional(),
  majorId: z.string().uuid("Invalid major ID").optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),
  departmentId: z.string().uuid("Invalid department ID").optional(),
  majorId: z.string().uuid("Invalid major ID").optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

// Type inference from schemas
export type CreateUserData = z.infer<typeof createUserSchema>;
export type UpdateUserData = z.infer<typeof updateUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;
```

### Advanced Schema Patterns

```typescript
// lib/validations/course.ts
import { z } from "zod";

// Enum validation
export const courseStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

// Object with nested validation
export const courseSchema = z.object({
  name: z
    .string()
    .min(3, "Course name must be at least 3 characters")
    .max(100, "Course name is too long"),
  description: z.string().max(500, "Description is too long").optional(),
  status: courseStatusSchema.default("DRAFT"),
  departmentId: z.string().uuid(),

  // Nested object validation
  settings: z
    .object({
      allowSelfEnrollment: z.boolean().default(false),
      maxStudents: z
        .number()
        .min(1, "Must allow at least 1 student")
        .max(500, "Too many students")
        .optional(),
      enrollmentEndDate: z.date().optional(),
    })
    .optional(),

  // Array validation
  tags: z.array(z.string().min(2).max(20)).max(10, "Too many tags").optional(),
});

// Partial schemas for updates
export const updateCourseSchema = courseSchema.partial();

// Transform data during validation
export const courseFormSchema = courseSchema.extend({
  enrollmentEndDate: z
    .string()
    .optional()
    .transform((str) => (str ? new Date(str) : undefined)),
});
```

### API Response Validation

```typescript
// lib/api/validation.ts
import { z } from "zod";

// Generic API response validator
export const createApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z
      .object({
        code: z.string(),
        message: z.string(),
        timestamp: z.string(),
      })
      .optional(),
  });

// Usage in API client
export const userResponseSchema = createApiResponseSchema(
  z.object({
    id: z.string(),
    email: z.string().email(),
    name: z.string(),
    role: z.enum(["STUDENT", "TEACHER", "ADMIN"]),
    // ... other user fields
  }),
);

// Validate API responses
const validateApiResponse = <T>(data: unknown, schema: z.ZodSchema<T>): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new Error(`API response validation failed: ${result.error.message}`);
  }
  return result.data;
};
```

---

## TypeScript Patterns

### Utility Types

```typescript
// types/utilities.ts

// Make specific properties optional
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Make specific properties required
export type RequiredBy<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>;

// Extract array element type
export type ArrayElement<T> = T extends readonly (infer U)[] ? U : never;

// Deep partial type
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Strict omit (prevents omitting non-existent keys)
export type StrictOmit<T, K extends keyof T> = Omit<T, K>;

// Usage examples
type UserWithoutDates = StrictOmit<User, "createdAt" | "updatedAt">;
type UserFormData = PartialBy<User, "id" | "createdAt" | "updatedAt">;
```

### Component Prop Patterns

```typescript
// Extend HTML element props
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

// Polymorphic component props
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

// Generic component with constrained props
interface SelectProps<T extends string | number> {
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}

// Forward ref component typing
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <div>
        {label && <label>{label}</label>}
        <input ref={ref} {...props} />
        {error && <span className="error">{error}</span>}
      </div>
    );
  }
);
```

### Type Guards and Narrowing

```typescript
// Type guards for runtime type checking
export const isUser = (value: unknown): value is User => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'email' in value &&
    'name' in value
  );
};

export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as any).response === 'object'
  );
};

// Discriminated unions
type LoadingState = { status: 'loading' };
type SuccessState = { status: 'success'; data: User };
type ErrorState = { status: 'error'; error: string };

type AsyncState = LoadingState | SuccessState | ErrorState;

const handleAsyncState = (state: AsyncState) => {
  switch (state.status) {
    case 'loading':
      return <LoadingSpinner />;
    case 'success':
      return <UserProfile user={state.data} />; // TypeScript knows data exists
    case 'error':
      return <ErrorMessage error={state.error} />; // TypeScript knows error exists
  }
};
```

### Generic Hook Typing

```typescript
// Generic hook with constraints
export const useApi = <T>(
  queryFn: () => Promise<T>,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["api"],
    queryFn,
    enabled: options?.enabled ?? true,
  });
};

// Generic form hook
export const useFormWithSchema = <T extends z.ZodSchema>(
  schema: T,
  defaultValues?: Partial<z.infer<T>>,
) => {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    defaultValues,
  });
};
```

---

## Error Handling Types

### Error Type Hierarchy

```typescript
// types/errors.ts
export interface BaseError {
  name: string;
  message: string;
  timestamp: Date;
}

export interface ApiError extends BaseError {
  name: "ApiError";
  status: number;
  code: string;
  response?: {
    data?: {
      message?: string;
      errors?: Record<string, string[]>;
    };
  };
}

export interface ValidationError extends BaseError {
  name: "ValidationError";
  field: string;
  value: unknown;
}

export interface NetworkError extends BaseError {
  name: "NetworkError";
  url: string;
}

export type AppError = ApiError | ValidationError | NetworkError;

// Error creation functions
export const createApiError = (
  message: string,
  status: number,
  code: string,
): ApiError => ({
  name: "ApiError",
  message,
  status,
  code,
  timestamp: new Date(),
});
```

### Error Boundary Types

```typescript
// components/ErrorBoundary.tsx
interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; errorInfo?: ErrorInfo }>;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}
```

---

## Configuration Types

### Environment Variables

```typescript
// types/env.ts
export interface EnvironmentVariables {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  NEXT_PUBLIC_API_URL: string;
  NODE_ENV: "development" | "production" | "test";
}

// Runtime environment validation
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  NEXT_PUBLIC_API_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "production", "test"]),
});

export const validateEnv = (): EnvironmentVariables => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    throw new Error(`Environment validation failed: ${result.error.message}`);
  }
  return result.data;
};
```

---

## Forbidden Patterns

### ❌ Anti-Patterns to Avoid

```typescript
// Never use 'any'
const badFunction = (data: any) => {
  // ❌
  return data.whatever.you.want;
};

// Don't use type assertions without validation
const badUserData = response as User; // ❌ Unsafe

// Don't ignore null/undefined possibilities
const getName = (user: User | null) => {
  return user.name; // ❌ Might be null
};

// Don't use non-null assertion without good reason
const badAccess = user!.name; // ❌ Dangerous

// Don't skip runtime validation for external data
const processApiData = (data: unknown) => {
  const user = data as User; // ❌ No runtime validation
  return user.email;
};

// Don't use object types without specific shape
interface BadProps {
  config: object; // ❌ Too generic
  metadata: Record<string, any>; // ❌ No structure
}
```

### ✅ Correct Patterns

```typescript
// Use proper typing with unknown
const goodFunction = (data: unknown) => {
  // ✅
  if (isUser(data)) {
    return data.name; // TypeScript knows it's a User
  }
  throw new Error("Invalid user data");
};

// Use runtime validation before type assertion
const getUserData = (response: unknown): User => {
  const result = userResponseSchema.safeParse(response);
  if (!result.success) {
    throw new Error("Invalid user data from API");
  }
  return result.data;
};

// Handle null/undefined properly
const getName = (user: User | null): string => {
  return user?.name ?? "Anonymous"; // ✅ Safe access
};

// Use type guards for conditional access
const getNameSafely = (user: unknown): string => {
  if (isUser(user)) {
    return user.name; // ✅ Type narrowing
  }
  return "Unknown";
};

// Always validate external data
const processApiData = (data: unknown): string => {
  const user = getUserData(data); // ✅ Runtime validation
  return user.email;
};

// Use specific object types
interface GoodProps {
  config: {
    theme: "light" | "dark";
    locale: string;
  };
  metadata: {
    title: string;
    description?: string;
  };
}
```

---

## Development Tools

### Type Debugging

```typescript
// Utility types for debugging
type Expect<T extends true> = T;
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
    ? true
    : false;

// Test type equality
type TestUserType = Expect<
  Equal<User["role"], "STUDENT" | "TEACHER" | "ADMIN">
>;

// Debug complex types
type DebugUser = User; // Hover to see full type
type DebugKeys = keyof User; // See all property names
```

### VSCode Integration

```json
// .vscode/settings.json
{
  "typescript.preferences.inlayHints.parameterNames.enabled": "all",
  "typescript.preferences.inlayHints.propertyDeclarationTypes.enabled": true,
  "typescript.preferences.inlayHints.functionLikeReturnTypes.enabled": true,
  "typescript.preferences.inlayHints.variableTypes.enabled": false
}
```

This type safety approach ensures robust, maintainable code with excellent developer experience and runtime safety through comprehensive validation.
