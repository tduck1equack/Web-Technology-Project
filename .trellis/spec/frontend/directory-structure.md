# Frontend Directory Structure Guidelines

> File and component organization patterns for the Next.js frontend app.

---

## Project Structure Overview

This is a **Turborepo monorepo** with the frontend as one app among multiple.

```
Web-Technology-Project/
├── apps/
│   ├── web/                    # Next.js 16+ frontend (App Router)
│   ├── api/                    # NestJS backend
│   └── docs/                   # Documentation site
├── packages/
│   ├── ui/                     # Shared React components
│   ├── eslint-config/          # Shared ESLint configurations
│   └── typescript-config/      # Shared TypeScript configurations
└── docs/                       # Project documentation
```

---

## Frontend App Structure (`apps/web/`)

### App Router Organization

Following Next.js 13+ App Router conventions:

```
apps/web/
├── app/                        # App Router pages and layouts
│   ├── (auth)/                 # Route group for auth pages
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx          # Auth-specific layout
│   ├── (protected)/            # Route group for authenticated pages
│   │   ├── dashboard/
│   │   ├── profile/
│   │   └── layout.tsx          # Protected pages layout
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Home page
├── components/                 # App-specific components
│   ├── ui/                     # Local UI components (extend @repo/ui)
│   ├── forms/                  # Form components with React Hook Form
│   ├── auth/                   # Authentication-related components
│   └── layout/                 # Layout components (Header, Sidebar, etc.)
├── lib/                        # Utility functions and configurations
│   ├── supabase/               # Supabase client configurations
│   ├── api/                    # API client setup (Axios + React Query)
│   ├── stores/                 # Zustand stores
│   ├── utils.ts                # General utilities
│   └── validations/            # Zod schemas
├── hooks/                      # Custom React hooks
│   ├── use-auth.ts            # Authentication hooks
│   ├── use-api.ts             # API hooks with React Query
│   └── use-local-storage.ts   # Local storage hooks
└── types/                      # TypeScript type definitions
    ├── api.ts                  # Backend API types
    ├── auth.ts                 # Authentication types
    └── ui.ts                   # UI component types
```

---

## Naming Conventions

### Files and Directories

| Type           | Convention                        | Example                                |
| -------------- | --------------------------------- | -------------------------------------- |
| **Pages**      | `page.tsx` in route folders       | `app/dashboard/page.tsx`               |
| **Layouts**    | `layout.tsx` in route folders     | `app/(auth)/layout.tsx`                |
| **Components** | PascalCase with descriptive names | `LoginForm.tsx`, `UserProfileCard.tsx` |
| **Hooks**      | camelCase starting with `use`     | `useAuth.ts`, `useUserProfile.ts`      |
| **Utilities**  | camelCase descriptive names       | `formatDate.ts`, `apiClient.ts`        |
| **Stores**     | camelCase with `Store` suffix     | `authStore.ts`, `uiStore.ts`           |
| **Types**      | PascalCase interfaces/types       | `User.ts`, `ApiResponse.ts`            |

### Component File Organization

Each component should be in its own file with clear, descriptive names:

```
components/
├── auth/
│   ├── LoginForm.tsx           # Main component export
│   ├── SignupForm.tsx
│   └── AuthLayout.tsx
├── forms/
│   ├── ProfileSetupForm.tsx
│   └── OrganizationSelector.tsx
└── ui/
    ├── Button.tsx              # Extending @repo/ui/button
    ├── Modal.tsx
    └── LoadingSpinner.tsx
```

---

## Import Organization

### Import Order (enforced by ESLint)

1. React and Next.js imports
2. External libraries
3. Internal utilities and configurations
4. Relative imports

```typescript
// ✅ Good import order
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@repo/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import "./LoginForm.css";
```

### Path Aliases

Use the configured path alias `@/` for internal imports:

```typescript
// ✅ Use path alias
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/hooks/use-auth";
import { authStore } from "@/lib/stores/auth-store";

// ❌ Don't use relative paths for internal imports
import { apiClient } from "../../../lib/api/client";
```

---

## Shared vs App-Specific Code

### When to use `packages/ui/`

- **Reusable across multiple apps** (web, docs, admin)
- **Basic UI primitives** (Button, Card, Input)
- **No business logic** or app-specific styling

Examples: `Button`, `Card`, `Loading`

### When to use `apps/web/components/`

- **App-specific components** with business logic
- **Complex forms** with validation and state
- **Layout components** specific to the web app

Examples: `LoginForm`, `UserDashboard`, `ClassSelector`

---

## Route Groups and Layouts

### Route Group Patterns

Use parentheses for route groups to organize without affecting URLs:

```
app/
├── (auth)/                     # /login, /signup (no auth layout)
│   ├── login/page.tsx         # → /login
│   ├── signup/page.tsx        # → /signup
│   └── layout.tsx             # Auth-specific styling
├── (protected)/               # Requires authentication
│   ├── dashboard/page.tsx     # → /dashboard
│   ├── profile/page.tsx       # → /profile
│   └── layout.tsx             # Protected layout with nav
└── (public)/                  # Public pages
    ├── about/page.tsx         # → /about
    └── layout.tsx             # Public layout
```

### Layout Hierarchy

```
RootLayout (app/layout.tsx)           # Global providers, fonts, metadata
├── AuthLayout (app/(auth)/layout.tsx)    # Centered forms, no navigation
├── ProtectedLayout (app/(protected)/layout.tsx)  # Navigation, auth guards
└── PublicLayout (app/(public)/layout.tsx)    # Public header/footer
```

---

## Real Project Examples

### Current Structure Analysis

Based on existing code in `apps/web/app/`:

```typescript
// apps/web/app/layout.tsx - Root layout with fonts and global styles
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
```

```typescript
// apps/web/app/page.tsx - Type-safe image component pattern
type Props = Omit<ImageProps, "src"> & {
  srcLight: string;
  srcDark: string;
};

const ThemeImage = (props: Props) => {
  const { srcLight, srcDark, ...rest } = props;
  return (
    <>
      <Image {...rest} src={srcLight} className="imgLight" />
      <Image {...rest} src={srcDark} className="imgDark" />
    </>
  );
};
```

### Shared UI Component Pattern

```typescript
// packages/ui/src/button.tsx - Shared component with app context
interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string;  // App-specific context
}

export const Button = ({ children, className, appName }: ButtonProps) => {
  return (
    <button
      className={className}
      onClick={() => alert(`Hello from your ${appName} app!`)}
    >
      {children}
    </button>
  );
};
```

---

## Anti-Patterns to Avoid

### ❌ Don't Do This

```typescript
// Don't put business logic in shared UI components
// packages/ui/src/user-profile.tsx
export const UserProfile = () => {
  const user = useSupabaseAuth(); // ❌ App-specific logic in shared package
  return <div>{user.name}</div>;
};

// Don't use deep relative imports
import { Button } from '../../../packages/ui/src/button'; // ❌

// Don't mix route groups inappropriately
app/
├── login/              # ❌ Mixed with dashboard in same level
├── dashboard/
└── (auth)/
    └── signup/
```

### ✅ Do This Instead

```typescript
// Put business logic in app-specific components
// apps/web/components/auth/UserProfile.tsx
export const UserProfile = () => {
  const user = useAuth(); // ✅ App-specific hook
  return <Card>{user.name}</Card>; // ✅ Use shared UI components
};

// Use workspace imports
import { Button } from '@repo/ui/button'; // ✅

// Consistent route grouping
app/
├── (auth)/
│   ├── login/
│   └── signup/
└── (protected)/
    └── dashboard/
```

---

## TypeScript Configuration

The project uses shared TypeScript configurations:

```json
// apps/web/tsconfig.json
{
  "extends": "@repo/typescript-config/nextjs.json",
  "compilerOptions": {
    "strictNullChecks": true // Enforced for type safety
  }
}
```

This ensures consistent TypeScript settings across the monorepo while allowing app-specific overrides when needed.
