# State Management Guidelines

> How application state is managed using Zustand, React Query, and React hooks.

---

## Overview

This project uses a **hybrid state management approach** with different tools for different types of state:

- **React Query** - Server state (API data, caching, synchronization)
- **Zustand** - Client-side global state (UI state, user preferences, modal states)
- **React Hooks** - Local component state (`useState`, `useReducer`)
- **Next.js** - URL state (search params, route state)

**State Philosophy:**

- **Server state ≠ Client state** - Handle them differently
- **Minimize global state** - Prefer local state when possible
- **Colocate state** - Keep state close to where it's used
- **Type safety first** - All state must be properly typed

---

## State Categories

### 1. Server State (React Query)

**What is Server State?**

- Data from APIs (users, courses, organizations)
- Cached data with expiration
- Background updates and synchronization
- Loading, error, and optimistic update states

```typescript
// lib/api/queries/user-queries.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../client";

// Query for user profile
export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => apiClient.get<User>(`/users/${userId}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Mutation for updating user profile
export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateUserRequest) =>
      apiClient.put<User>("/users/profile", data),
    onSuccess: (updatedUser) => {
      // Update cache optimistically
      queryClient.setQueryData(["user", updatedUser.id], updatedUser);
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
};
```

### 2. Client State (Zustand)

**What is Client State?**

- UI state (modals, sidebar open/closed, theme)
- User preferences (language, layout settings)
- Form wizard progress
- Temporary client-side data

```typescript
// lib/stores/ui-store.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface UiState {
  // State
  sidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  activeModal: string | null;

  // Actions
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
}

export const useUiStore = create<UiState>()(
  devtools(
    (set) => ({
      // Initial state
      sidebarOpen: true,
      theme: "system",
      activeModal: null,

      // Actions
      toggleSidebar: () =>
        set(
          (state) => ({ sidebarOpen: !state.sidebarOpen }),
          false,
          "toggle-sidebar",
        ),
      setTheme: (theme) => set({ theme }, false, "set-theme"),
      openModal: (modalId) =>
        set({ activeModal: modalId }, false, "open-modal"),
      closeModal: () => set({ activeModal: null }, false, "close-modal"),
    }),
    { name: "ui-store" },
  ),
);
```

### 3. Local Component State (React Hooks)

**What is Local State?**

- Form input values (before submission)
- Component-specific UI state (collapsed/expanded)
- Temporary interaction state
- Short-lived computed values

```typescript
// components/forms/LoginForm.tsx
export const LoginForm = () => {
  // ✅ Local state for form
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>();

  // ✅ Local derived state
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form>
      <input type={isPasswordVisible ? 'text' : 'password'} {...register('password')} />
      <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)}>
        {isPasswordVisible ? 'Hide' : 'Show'}
      </button>
    </form>
  );
};
```

### 4. URL State (Next.js)

**What is URL State?**

- Search filters and pagination
- Tab selection and navigation
- Shareable application state

```typescript
// hooks/use-search-params.ts
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export const useSearchFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  return {
    filters: {
      search: searchParams.get("search") || "",
      category: searchParams.get("category") || "all",
      page: parseInt(searchParams.get("page") || "1", 10),
    },
    updateFilter,
  };
};
```

---

## When to Use Global State

### ✅ Use Zustand for Global State When:

1. **Multiple components** need the same state across different pages
2. **UI state** persists across navigation (sidebar, theme, modal state)
3. **User preferences** that should persist across sessions
4. **Complex form wizards** that span multiple components

```typescript
// ✅ Good use of global state - multi-step form
interface ProfileSetupState {
  currentStep: number;
  formData: Partial<ProfileFormData>;
  isComplete: boolean;

  setStep: (step: number) => void;
  updateFormData: (data: Partial<ProfileFormData>) => void;
  resetForm: () => void;
}

export const useProfileSetupStore = create<ProfileSetupState>()((set) => ({
  currentStep: 1,
  formData: {},
  isComplete: false,

  setStep: (currentStep) => set({ currentStep }),
  updateFormData: (data) =>
    set((state) => ({
      formData: { ...state.formData, ...data },
    })),
  resetForm: () => set({ currentStep: 1, formData: {}, isComplete: false }),
}));
```

### ❌ Don't Use Global State When:

1. **Only one component** uses the state
2. **Server data** that should be cached (use React Query)
3. **Temporary interaction** state (loading spinners, hover states)
4. **Form input values** (use React Hook Form)

---

## Server State Patterns

### Data Fetching with React Query

```typescript
// lib/api/queries/course-queries.ts
export const useCourses = (filters?: CourseFilters) => {
  return useQuery({
    queryKey: ["courses", filters],
    queryFn: () => apiClient.get<Course[]>("/courses", { params: filters }),
    staleTime: 2 * 60 * 1000, // 2 minutes - courses don't change often
    enabled: !!filters, // Only run query when filters are provided
  });
};

export const useCourse = (courseId: string) => {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => apiClient.get<Course>(`/courses/${courseId}`),
    staleTime: 5 * 60 * 1000, // 5 minutes
    throwOnError: true, // Let error boundaries handle errors
  });
};
```

### Mutations with Optimistic Updates

```typescript
export const useDeleteCourse = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => apiClient.delete(`/courses/${courseId}`),

    // Optimistic update
    onMutate: async (courseId) => {
      await queryClient.cancelQueries({ queryKey: ["courses"] });

      const previousCourses = queryClient.getQueryData<Course[]>(["courses"]);

      queryClient.setQueryData<Course[]>(["courses"], (old = []) =>
        old.filter((course) => course.id !== courseId),
      );

      return { previousCourses };
    },

    // Rollback on error
    onError: (err, courseId, context) => {
      if (context?.previousCourses) {
        queryClient.setQueryData(["courses"], context.previousCourses);
      }
    },

    // Refetch on success or error
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
    },
  });
};
```

### Infinite Queries for Pagination

```typescript
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

---

## Store Organization Patterns

### Feature-Based Store Structure

```
lib/stores/
├── auth-store.ts           # Authentication state
├── ui-store.ts            # Global UI state
├── profile-setup-store.ts # Multi-step form state
└── preferences-store.ts   # User preferences
```

### Store Composition

```typescript
// lib/stores/auth-store.ts
interface AuthState {
  user: User | null;
  isLoading: boolean;

  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  isLoading: false,

  signIn: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await apiClient.post("/auth/signin", {
        email,
        password,
      });
      set({ user: response.data.user, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: () => {
    set({ user: null });
    // Clear React Query cache
    queryClient.clear();
  },

  refreshUser: async () => {
    const currentUser = get().user;
    if (!currentUser) return;

    try {
      const response = await apiClient.get(`/users/${currentUser.id}`);
      set({ user: response.data });
    } catch (error) {
      // Handle refresh error
    }
  },
}));
```

---

## Integration Patterns

### Combining React Query + Zustand

```typescript
// hooks/use-auth.ts - Combining server and client state
export const useAuth = () => {
  const { user, signIn, signOut } = useAuthStore();

  // React Query for fresh user data
  const { data: freshUser, isLoading } = useQuery({
    queryKey: ["user", user?.id],
    queryFn: () => apiClient.get<User>(`/users/${user!.id}`),
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds
    onSuccess: (userData) => {
      // Update Zustand store with fresh data
      useAuthStore.setState({ user: userData });
    },
  });

  return {
    user: freshUser || user,
    isAuthenticated: !!user,
    isLoading: isLoading || useAuthStore((state) => state.isLoading),
    signIn,
    signOut,
  };
};
```

### SSR + Client State Hydration

```typescript
// lib/stores/hydration.ts
import { useEffect } from "react";

export const useHydrateStores = () => {
  useEffect(() => {
    // Hydrate UI preferences from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      useUiStore.getState().setTheme(savedTheme as any);
    }

    const sidebarState = localStorage.getItem("sidebarOpen");
    if (sidebarState) {
      useUiStore.setState({ sidebarOpen: JSON.parse(sidebarState) });
    }
  }, []);

  // Persist changes to localStorage
  useEffect(() => {
    const unsubscribe = useUiStore.subscribe(
      (state) => state.theme,
      (theme) => localStorage.setItem("theme", theme),
    );
    return unsubscribe;
  }, []);
};
```

---

## Common Mistakes

### ❌ Anti-Patterns to Avoid

```typescript
// Don't put server data in Zustand
interface BadAuthState {
  user: User | null;
  courses: Course[]; // ❌ Server data in client state
  organizations: Organization[]; // ❌ Should use React Query
}

// Don't use global state for everything
const BadComponent = () => {
  const { modalOpen, setModalOpen } = useGlobalModalStore(); // ❌ Local state

  // ✅ Should be local state instead
  const [modalOpen, setModalOpen] = useState(false);
};

// Don't mutate Zustand state directly
const badUpdateUser = () => {
  const user = useAuthStore(state => state.user);
  user.name = 'New Name'; // ❌ Direct mutation
};

// Don't ignore React Query loading states
const BadUserProfile = () => {
  const { data: user } = useUser(); // ❌ No loading state handling

  return <div>{user.name}</div>; // ❌ Will crash if user is undefined
};
```

### ✅ Correct Patterns

```typescript
// Use React Query for server data
const useAuth = () => {
  const { user } = useAuthStore(); // ✅ Only auth state
  const { data: profile } = useUserProfile(user?.id); // ✅ Server data
  return { user, profile };
};

// Use local state when appropriate
const GoodComponent = () => {
  const [modalOpen, setModalOpen] = useState(false); // ✅ Local UI state
  return <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} />;
};

// Update Zustand state properly
const goodUpdateUser = () => {
  useAuthStore.setState((state) => ({
    user: { ...state.user, name: 'New Name' } // ✅ Immutable update
  }));
};

// Handle React Query states properly
const GoodUserProfile = () => {
  const { data: user, isLoading, error } = useUser();

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <EmptyState message="User not found" />;

  return <div>{user.name}</div>; // ✅ Safe access
};
```

---

## Performance Considerations

### Query Optimization

```typescript
// ✅ Use select to minimize re-renders
const useUserName = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => apiClient.get<User>(`/users/${userId}`),
    select: (data) => data.name, // ✅ Only re-render when name changes
  });
};

// ✅ Use Zustand selectors to prevent unnecessary re-renders
const UserDisplay = () => {
  const userName = useAuthStore((state) => state.user?.name); // ✅ Specific selector
  return <span>{userName}</span>;
};
```

### Background Updates

```typescript
// ✅ Configure stale time appropriately
export const useOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => apiClient.get<Organization[]>("/organizations"),
    staleTime: 10 * 60 * 1000, // ✅ 10 minutes - rarely change
    cacheTime: 30 * 60 * 1000, // ✅ 30 minutes cache
  });
};
```

This state management approach ensures clean separation of concerns, optimal performance, and excellent developer experience with full TypeScript support.
