# Hook Guidelines

> Custom hook patterns and data fetching conventions using React Query.

---

## Overview

This project follows React hooks best practices with custom hooks for:

- **Data fetching** with React Query
- **Authentication** state and actions
- **Form handling** with React Hook Form integration
- **Local storage** and browser API interactions
- **Shared stateful logic** across components

**Hook Philosophy:**

- **Single Responsibility** - Each hook has one clear purpose
- **Composable** - Hooks can be combined to create more complex behavior
- **Type Safe** - All hooks have comprehensive TypeScript types
- **Testable** - Hooks can be unit tested in isolation

---

## Custom Hook Patterns

### 1. Data Fetching Hooks

Use React Query for all server state management:

```typescript
// hooks/use-user.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiClient.get<User>(`/users/${userId}`),
    enabled: !!userId,
  });
};

export const useCurrentUser = () => {
  const { user } = useAuthStore();

  return useQuery({
    queryKey: ["user", "current"],
    queryFn: () => apiClient.get<User>("/auth/me"),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) =>
      apiClient.put<User>("/users/profile", data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user", "current"], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
```

### 2. Authentication Hooks

Combine Zustand store with React Query for auth:

```typescript
// hooks/use-auth.ts
import { useAuthStore } from "@/lib/stores/auth-store";
import { useRouter } from "next/navigation";

export const useAuth = () => {
  const { user, isLoading, signIn, signOut } = useAuthStore();
  const router = useRouter();

  const { data: profile } = useCurrentUser();

  const login = async (email: string, password: string) => {
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (error) {
      throw error; // Let component handle error display
    }
  };

  const logout = () => {
    signOut();
    router.push("/login");
  };

  return {
    user: profile || user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };
};

// Simplified hook for components that only need auth status
export const useAuthStatus = () => {
  const user = useAuthStore((state) => state.user);
  return {
    isAuthenticated: !!user,
    userId: user?.id,
  };
};
```

### 3. Form Hooks

Integrate React Hook Form with validation:

```typescript
// hooks/use-form-with-validation.ts
import { useForm, UseFormProps } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

export const useFormWithValidation = <T extends z.ZodType>(
  schema: T,
  options?: UseFormProps<z.infer<T>>,
) => {
  return useForm<z.infer<T>>({
    resolver: zodResolver(schema),
    mode: "onBlur", // Validate on blur for better UX
    ...options,
  });
};

// Specific form hook example
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const useLoginForm = () => {
  return useFormWithValidation(loginSchema, {
    defaultValues: {
      email: "",
      password: "",
    },
  });
};
```

### 4. Local Storage Hooks

Type-safe local storage with serialization:

```typescript
// hooks/use-local-storage.ts
import { useState, useEffect } from "react";

export const useLocalStorage = <T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void] => {
  // Initialize state
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when state changes
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== "undefined") {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
};

// Specific usage hooks
export const useUserPreferences = () => {
  return useLocalStorage("userPreferences", {
    theme: "system" as const,
    language: "vi" as const,
    sidebarCollapsed: false,
  });
};

export const useRecentSearches = () => {
  return useLocalStorage<string[]>("recentSearches", []);
};
```

### 5. Debounced Hooks

For search and input handling:

```typescript
// hooks/use-debounced-value.ts
import { useState, useEffect } from "react";

export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Debounced search hook
export const useDebouncedSearch = (delay: number = 300) => {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebouncedValue(searchTerm, delay);

  return {
    searchTerm,
    debouncedSearchTerm,
    setSearchTerm,
  };
};
```

---

## Data Fetching Patterns

### Query Hooks Organization

```
hooks/
├── api/
│   ├── use-user-queries.ts        # User-related queries
│   ├── use-course-queries.ts      # Course-related queries
│   ├── use-organization-queries.ts # Organization queries
│   └── use-auth-queries.ts        # Authentication queries
├── use-auth.ts                    # Auth state hooks
├── use-form-validation.ts         # Form handling hooks
└── use-local-storage.ts           # Browser API hooks
```

### Query Hook Patterns

```typescript
// hooks/api/use-course-queries.ts
export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => apiClient.get<Course[]>("/courses", { params: filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!filters,
  });
};

export const useCourse = (
  courseId: string,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => apiClient.get<Course>(`/courses/${courseId}`),
    enabled: !!courseId && (options?.enabled ?? true),
  });
};

export const useCreateCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseRequest) =>
      apiClient.post<Course>("/courses", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
```

### Infinite Query Pattern

```typescript
// hooks/api/use-infinite-courses.ts
export const useInfiniteCourses = (filters: CourseFilters) => {
  return useInfiniteQuery({
    queryKey: ["courses", "infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.get<PaginatedResponse<Course>>("/courses", {
        params: { ...filters, page: pageParam },
      }),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.currentPage + 1 : undefined,
    staleTime: 2 * 60 * 1000,
  });
};
```

### Error Handling in Hooks

```typescript
// hooks/use-error-handling.ts
import { toast } from "@/components/ui/toast";

export const useApiError = () => {
  const handleError = (error: ApiError, context?: string) => {
    const message = error.response?.data?.message || "An error occurred";

    if (context) {
      console.error(`Error in ${context}:`, error);
    }

    toast({
      title: "Error",
      description: message,
      variant: "destructive",
    });
  };

  return { handleError };
};

// Usage in query hooks
export const useCoursesWithErrorHandling = (filters?: CourseFilters) => {
  const { handleError } = useApiError();

  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => apiClient.get<Course[]>("/courses", { params: filters }),
    onError: (error) => handleError(error, "fetching courses"),
  });
};
```

---

## Naming Conventions

### Hook Naming Rules

| Pattern             | Purpose                 | Example                                       |
| ------------------- | ----------------------- | --------------------------------------------- |
| `use[Entity]`       | Single entity queries   | `useUser()`, `useCourse()`                    |
| `use[Entities]`     | List/collection queries | `useUsers()`, `useCourses()`                  |
| `useCreate[Entity]` | Creation mutations      | `useCreateUser()`, `useCreateCourse()`        |
| `useUpdate[Entity]` | Update mutations        | `useUpdateUser()`, `useUpdateCourse()`        |
| `useDelete[Entity]` | Deletion mutations      | `useDeleteUser()`, `useDeleteCourse()`        |
| `use[Feature]`      | Feature-specific logic  | `useAuth()`, `useSearch()`                    |
| `useDebounced[X]`   | Debounced values        | `useDebouncedSearch()`, `useDebouncedValue()` |

### Parameter Naming

```typescript
// ✅ Good parameter naming
export const useUser = (userId: string) => {
  /* ... */
};
export const useCourses = (filters?: CourseFilters) => {
  /* ... */
};
export const useUpdateUser = (options?: MutationOptions) => {
  /* ... */
};

// ❌ Avoid generic parameter names
export const useData = (id: string) => {
  /* ... */
}; // Too generic
export const useFetch = (params: any) => {
  /* ... */
}; // No type safety
```

---

## Composition Patterns

### Combining Multiple Hooks

```typescript
// hooks/use-course-management.ts
export const useCourseManagement = (courseId: string) => {
  // Combine multiple related hooks
  const { data: course, isLoading } = useCourse(courseId);
  const { data: students } = useCourseStudents(courseId);
  const { data: assignments } = useCourseAssignments(courseId);

  const updateCourse = useUpdateCourse();
  const deleteCourse = useDeleteCourse();

  const handleUpdateCourse = (data: UpdateCourseRequest) => {
    updateCourse.mutate({ courseId, ...data });
  };

  const handleDeleteCourse = () => {
    deleteCourse.mutate(courseId);
  };

  return {
    course,
    students,
    assignments,
    isLoading,
    updateCourse: handleUpdateCourse,
    deleteCourse: handleDeleteCourse,
    isUpdating: updateCourse.isLoading,
    isDeleting: deleteCourse.isLoading,
  };
};
```

### Hook Composition with State

```typescript
// hooks/use-multi-step-form.ts
export const useMultiStepForm = <T extends Record<string, any>>(
  initialData: Partial<T>,
  totalSteps: number,
) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<T>>(initialData);

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (stepData: Partial<T>) => {
    setFormData((prev) => ({ ...prev, ...stepData }));
  };

  const resetForm = () => {
    setCurrentStep(1);
    setFormData(initialData);
  };

  return {
    currentStep,
    formData,
    nextStep,
    prevStep,
    updateFormData,
    resetForm,
    isFirstStep: currentStep === 1,
    isLastStep: currentStep === totalSteps,
    progress: (currentStep / totalSteps) * 100,
  };
};
```

---

## Performance Optimization

### Selective Re-renders

```typescript
// ✅ Use selectors to prevent unnecessary re-renders
export const useUserName = () => {
  return useAuthStore((state) => state.user?.name);
};

export const useIsAuthenticated = () => {
  return useAuthStore((state) => !!state.user);
};

// ✅ Use React Query select option
export const useUserEmail = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiClient.get<User>(`/users/${userId}`),
    select: (data) => data.email, // Only re-render when email changes
  });
};
```

### Memoized Hooks

```typescript
// hooks/use-filtered-data.ts
import { useMemo } from "react";

export const useFilteredCourses = (courses: Course[], searchTerm: string) => {
  return useMemo(() => {
    if (!searchTerm) return courses;

    return courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [courses, searchTerm]);
};
```

---

## Common Mistakes

### ❌ Anti-Patterns to Avoid

```typescript
// Don't fetch data inside useEffect
const BadComponent = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ❌ Don't do this - use React Query instead
    fetch('/api/user')
      .then(res => res.json())
      .then(setUser);
  }, []);

  return <div>{user?.name}</div>;
};

// Don't ignore hook rules
const BadHook = (shouldFetch: boolean) => {
  if (shouldFetch) {
    // ❌ Conditional hook usage violates rules of hooks
    return useQuery(['user'], fetchUser);
  }
  return null;
};

// Don't create hooks that do too much
const BadMegaHook = () => {
  // ❌ Too many responsibilities in one hook
  const users = useUsers();
  const courses = useCourses();
  const [theme, setTheme] = useState('light');
  const [sidebar, setSidebar] = useState(true);
  // ... 50 more lines
};
```

### ✅ Correct Patterns

```typescript
// Use React Query for data fetching
const GoodComponent = () => {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;

  return <div>{user.name}</div>;
};

// Use enabled option for conditional queries
const GoodHook = (userId?: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId, // ✅ Query only runs when userId exists
  });
};

// Create focused, single-purpose hooks
const useTheme = () => {
  return useUiStore((state) => state.theme);
};

const useSidebar = () => {
  return useUiStore((state) => ({
    isOpen: state.sidebarOpen,
    toggle: state.toggleSidebar,
  }));
};
```

---

## Testing Hooks

### Hook Testing Pattern

```typescript
// __tests__/hooks/use-user.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUser } from '@/hooks/use-user';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useUser', () => {
  it('fetches user data successfully', async () => {
    const { result } = renderHook(() => useUser('123'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(mockUser);
  });
});
```

This hook organization ensures clean, reusable, and testable logic that integrates seamlessly with React Query, Zustand, and the overall application architecture.
