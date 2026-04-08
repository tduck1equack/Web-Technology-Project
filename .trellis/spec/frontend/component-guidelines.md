# Component Guidelines

> How React components are built and organized in this project.

---

## Overview

This project uses **React 19** with **Next.js App Router** and follows modern component patterns. We use **Radix UI + Radix Themes** for accessible components and **Tailwind CSS** for styling.

**Component Philosophy:**

- **Composition over Configuration** - Use Radix primitives and compose behavior
- **Accessibility First** - All components must be accessible by default
- **Type Safety** - Comprehensive TypeScript interfaces for all props
- **Consistent API** - Similar prop patterns across components

---

## Component Structure

### Standard File Structure

```typescript
// components/auth/LoginForm.tsx
"use client"; // Only if component uses client features

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@radix-ui/themes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/hooks/use-auth';

// 1. Types and schemas first
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  className?: string;
}

// 2. Component implementation
export const LoginForm = ({ onSuccess, className }: LoginFormProps) => {
  const router = useRouter();
  const { signIn } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      onSuccess?.();
      router.push('/dashboard');
    } catch (error) {
      // Handle error with toast/notification
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={className}>
      {/* Component JSX */}
    </form>
  );
};

// 3. Default export if this is the main component
export default LoginForm;
```

### Component Categories

| Category               | Purpose                   | Example                    | Location                      |
| ---------------------- | ------------------------- | -------------------------- | ----------------------------- |
| **UI Components**      | Reusable primitives       | `Button`, `Card`           | `packages/ui/`                |
| **Feature Components** | Business logic components | `LoginForm`, `UserProfile` | `apps/web/components/`        |
| **Layout Components**  | Page structure            | `Header`, `Sidebar`        | `apps/web/components/layout/` |
| **Page Components**    | Route components          | `app/*/page.tsx`           | `apps/web/app/`               |

---

## Props Conventions

### Interface Design

```typescript
// ✅ Good prop interface design
interface UserCardProps {
  // Required props first
  user: User;

  // Optional props with specific types
  variant?: "default" | "compact" | "detailed";
  showActions?: boolean;

  // Event handlers with descriptive names
  onEdit?: (user: User) => void;
  onDelete?: (userId: string) => void;

  // Standard React props
  className?: string;
  children?: React.ReactNode;
}

// ❌ Avoid generic or unclear props
interface BadProps {
  data?: any; // ❌ Too generic
  onClick?: () => void; // ❌ Unclear what gets clicked
  config?: object; // ❌ Untyped configuration
}
```

### Prop Patterns

#### 1. Extending Radix Components

```typescript
// Extend Radix components with additional props
interface CustomButtonProps extends React.ComponentProps<typeof Button> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const CustomButton = ({
  loading,
  leftIcon,
  rightIcon,
  children,
  disabled,
  ...props
}: CustomButtonProps) => {
  return (
    <Button disabled={disabled || loading} {...props}>
      {leftIcon}
      {loading ? <Spinner /> : children}
      {rightIcon}
    </Button>
  );
};
```

#### 2. Polymorphic Components

```typescript
// Support different HTML elements with same styling
type PolymorphicProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
} & React.ComponentPropsWithoutRef<T>;

export const Text = <T extends React.ElementType = 'span'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) => {
  const Component = as || 'span';
  return <Component className={cn('text-base', className)} {...props} />;
};

// Usage: <Text as="h1">Heading</Text> or <Text>Span text</Text>
```

#### 3. Compound Components

```typescript
// Use compound component pattern for related components
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

const Card = ({ children, className }: CardProps) => (
  <div className={cn('rounded-lg border bg-card', className)}>
    {children}
  </div>
);

const CardHeader = ({ title, description, actions }: CardHeaderProps) => (
  <div className="flex flex-col space-y-1.5 p-6">
    <div className="flex items-center justify-between">
      <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
      {actions}
    </div>
    {description && <p className="text-sm text-muted-foreground">{description}</p>}
  </div>
);

// Export as compound
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export { Card };
```

---

## Styling Patterns

### Tailwind CSS + Radix Themes

```typescript
import { cn } from '@/lib/utils'; // clsx + tailwind-merge utility

// ✅ Use cn() for conditional classes
export const Alert = ({ variant = 'default', className, ...props }) => {
  return (
    <div
      className={cn(
        'relative w-full rounded-lg border p-4',
        {
          'border-red-200 bg-red-50 text-red-900': variant === 'destructive',
          'border-yellow-200 bg-yellow-50 text-yellow-900': variant === 'warning',
          'border-gray-200 bg-gray-50 text-gray-900': variant === 'default',
        },
        className
      )}
      {...props}
    />
  );
};
```

### CSS Modules for Complex Styles

```typescript
// Use CSS modules for animations or complex styles
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner = ({ size = 'medium' }) => {
  return (
    <div
      className={cn(styles.spinner, styles[size])}
      aria-label="Loading"
    />
  );
};
```

```css
/* LoadingSpinner.module.css */
.spinner {
  @apply inline-block animate-spin rounded-full border-2 border-solid border-current border-r-transparent;
}

.small {
  @apply h-4 w-4;
}
.medium {
  @apply h-6 w-6;
}
.large {
  @apply h-8 w-8;
}
```

---

## Accessibility Standards

### Required Patterns

#### 1. Semantic HTML + ARIA

```typescript
// ✅ Proper semantic HTML and ARIA labels
export const SearchInput = ({ onSearch, placeholder = "Search..." }) => {
  return (
    <div role="search">
      <label htmlFor="search-input" className="sr-only">
        Search
      </label>
      <input
        id="search-input"
        type="search"
        placeholder={placeholder}
        aria-describedby="search-help"
        onChange={(e) => onSearch(e.target.value)}
      />
      <div id="search-help" className="sr-only">
        Type to search through available items
      </div>
    </div>
  );
};
```

#### 2. Keyboard Navigation

```typescript
// ✅ Support keyboard navigation
export const DropdownMenu = ({ items, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex((prev) => (prev + 1) % items.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex((prev) => (prev - 1 + items.length) % items.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (focusedIndex >= 0) onSelect(items[focusedIndex]);
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Dropdown implementation */}
    </div>
  );
};
```

#### 3. Focus Management

```typescript
// ✅ Manage focus for modals and complex interactions
export const Modal = ({ isOpen, onClose, children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50"
    >
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {children}
      </div>
    </div>
  );
};
```

---

## Real Project Examples

### Current Component Analysis

Based on existing code patterns:

```typescript
// apps/web/app/page.tsx - Proper prop typing with Omit utility
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

### Shared Component Pattern

```typescript
// packages/ui/src/button.tsx - Context-aware shared component
"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  className?: string;
  appName: string; // Context for different apps in monorepo
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

## Common Mistakes

### ❌ Anti-Patterns to Avoid

```typescript
// Don't use any for props
interface BadProps {
  data: any; // ❌ No type safety
  config: object; // ❌ Unclear structure
}

// Don't put business logic in shared UI components
// packages/ui/src/user-card.tsx
export const UserCard = () => {
  const user = useAuth(); // ❌ App-specific logic in shared component
  return <div>{user.name}</div>;
};

// Don't mix client and server component features
export default function BadComponent({ data }) {
  const [state, setState] = useState(); // ❌ Client feature

  // This should be either fully client or fully server
  return <div>{data.title}</div>;
}

// Don't use inline styles instead of Tailwind
<div style={{ marginTop: '16px' }}> {/* ❌ Use mt-4 instead */}

// Don't skip accessibility
<div onClick={handleClick}>Clickable</div> {/* ❌ Use button element */}
```

### ✅ Correct Patterns

```typescript
// Use proper TypeScript interfaces
interface UserCardProps {
  user: User;
  onEdit?: (user: User) => void;
}

// Keep shared components generic
// packages/ui/src/user-card.tsx
export const UserCard = ({ user, onEdit }: UserCardProps) => {
  return (
    <Card>
      <Card.Header title={user.name} />
      {onEdit && <Button onClick={() => onEdit(user)}>Edit</Button>}
    </Card>
  );
};

// Use proper "use client" directives
"use client"; // ✅ At top of client components only

export const InteractiveComponent = () => {
  const [state, setState] = useState();
  return <div>{state}</div>;
};

// Use Tailwind classes
<div className="mt-4 p-6 rounded-lg"> {/* ✅ Tailwind classes */}

// Use proper semantic elements
<button onClick={handleClick}>Clickable</button> {/* ✅ Button element */}
```

---

## Performance Considerations

### Code Splitting

```typescript
// ✅ Lazy load heavy components
const HeavyChart = lazy(() => import('./HeavyChart'));

export const Dashboard = () => {
  return (
    <div>
      <Suspense fallback={<Skeleton />}>
        <HeavyChart />
      </Suspense>
    </div>
  );
};
```

### Memo for Expensive Renders

```typescript
// ✅ Memo for components with expensive rendering
export const ExpensiveList = memo(({ items, onItemClick }) => {
  return (
    <div>
      {items.map(item => (
        <ExpensiveItem
          key={item.id}
          item={item}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  );
});
```

This ensures components follow project patterns, maintain accessibility, and integrate well with the Radix UI + Tailwind CSS stack.
