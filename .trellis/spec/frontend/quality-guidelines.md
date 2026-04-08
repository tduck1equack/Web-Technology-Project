# Quality Guidelines

> Code quality standards, linting rules, testing requirements, and accessibility standards.

---

## Overview

This project maintains high code quality through **automated tooling**, **comprehensive testing**, and **strict review processes**. Quality is enforced at build time and through CI/CD pipelines.

**Quality Philosophy:**

- **Zero warnings policy** - All ESLint warnings must be resolved
- **Accessibility first** - WCAG 2.1 AA compliance required
- **Type safety** - No `any` types or unsafe operations
- **Performance monitoring** - Core Web Vitals tracking
- **Security scanning** - Dependency vulnerability checks

---

## ESLint Configuration

### Current Configuration

Based on existing `apps/web/eslint.config.js`:

```javascript
import { nextJsConfig } from "@repo/eslint-config/next-js";

/** @type {import("eslint").Linter.Config[]} */
export default nextJsConfig;
```

### Enforced Rules

```javascript
// @repo/eslint-config/next-js.js
export const nextJsConfig = [
  // Base configurations
  ...eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...reactHooks.configs.recommended,

  // Custom rules
  {
    rules: {
      // TypeScript enforcement
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/prefer-optional-chain": "error",

      // React best practices
      "react/jsx-key": "error",
      "react/no-unescaped-entities": "error",
      "react/display-name": "error",
      "react-hooks/exhaustive-deps": "error",

      // Next.js specific
      "@next/next/no-img-element": "error",
      "@next/next/no-page-custom-font": "error",

      // Accessibility
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-role": "error",
      "jsx-a11y/click-events-have-key-events": "error",
      "jsx-a11y/no-static-element-interactions": "error",

      // Import organization
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],

      // Security
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-new-func": "error",
    },
  },
];
```

### Build Integration

```json
// apps/web/package.json
{
  "scripts": {
    "lint": "eslint --max-warnings 0", // Zero warnings policy
    "lint:fix": "eslint --fix",
    "check-types": "next typegen && tsc --noEmit"
  }
}
```

---

## Forbidden Patterns

### ❌ Never Allow These

```typescript
// 1. Any types or unsafe operations
const badData: any = response;  // ❌ FORBIDDEN
const user = response as User;  // ❌ FORBIDDEN - no runtime validation

// 2. Non-null assertions without validation
const name = user!.name;  // ❌ FORBIDDEN

// 3. Ignoring accessibility
<div onClick={handleClick}>Clickable</div>  {/* ❌ FORBIDDEN */}

// 4. Direct DOM manipulation
document.getElementById('my-element').style.display = 'none';  // ❌ FORBIDDEN

// 5. Inline styles instead of Tailwind/CSS modules
<div style={{ marginTop: 16 }}>  {/* ❌ FORBIDDEN */}

// 6. Mutating props or state directly
props.user.name = 'New Name';  // ❌ FORBIDDEN
state.items.push(newItem);     // ❌ FORBIDDEN

// 7. Hardcoded strings for user-facing text
<button>Login</button>  {/* ❌ FORBIDDEN - no i18n */}

// 8. Missing error boundaries
const RiskyComponent = () => {
  throw new Error('Oops');  // ❌ FORBIDDEN without error boundary
};

// 9. Unhandled promises
apiCall();  // ❌ FORBIDDEN - handle errors

// 10. Console logs in production
console.log('Debug info');  // ❌ FORBIDDEN in production
```

### Build-Time Enforcement

```typescript
// eslint-plugin-custom-rules.js
module.exports = {
  rules: {
    "no-console-logs": {
      create(context) {
        return {
          CallExpression(node) {
            if (node.callee.object?.name === "console") {
              context.report({
                node,
                message: "Console logs are not allowed in production code",
              });
            }
          },
        };
      },
    },
  },
};
```

---

## Required Patterns

### ✅ Always Use These

```typescript
// 1. Runtime validation for external data
const getUserData = (response: unknown): User => {
  const result = userSchema.safeParse(response);
  if (!result.success) {
    throw new ValidationError('Invalid user data');
  }
  return result.data;
};

// 2. Proper error handling
const handleApiCall = async () => {
  try {
    const result = await apiClient.get('/users');
    return getUserData(result.data);
  } catch (error) {
    if (isApiError(error)) {
      handleApiError(error);
    }
    throw error;
  }
};

// 3. Accessible components
<button
  onClick={handleClick}
  aria-label="Close dialog"
  type="button"
>
  <Icon name="close" aria-hidden="true" />
</button>

// 4. Semantic HTML structure
<main>
  <h1>Page Title</h1>
  <article>
    <h2>Section Title</h2>
    <p>Content...</p>
  </article>
</main>

// 5. Loading and error states
const UserProfile = ({ userId }: { userId: string }) => {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorMessage error={error} />;
  if (!user) return <EmptyState message="User not found" />;

  return <UserCard user={user} />;
};

// 6. Proper form handling
const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <input
        {...register('email')}
        type="email"
        aria-invalid={!!errors.email}
        aria-describedby={errors.email ? 'email-error' : undefined}
      />
      {errors.email && (
        <div id="email-error" role="alert">
          {errors.email.message}
        </div>
      )}
    </form>
  );
};

// 7. Internationalization support
import { useTranslation } from 'next-i18next';

const WelcomeMessage = () => {
  const { t } = useTranslation('common');
  return <h1>{t('welcome.title')}</h1>;
};
```

---

## Testing Requirements

### Testing Strategy

| Component Type      | Test Requirements               | Tools                                    |
| ------------------- | ------------------------------- | ---------------------------------------- |
| **UI Components**   | Unit tests + Visual regression  | Jest + React Testing Library + Storybook |
| **Hooks**           | Unit tests with mock providers  | Jest + React Hooks Testing Library       |
| **API Integration** | Integration tests with MSW      | Jest + MSW                               |
| **Pages**           | E2E tests for critical flows    | Playwright                               |
| **Forms**           | Validation and submission tests | Jest + user-event                        |

### Required Tests

```typescript
// components/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  // ✅ REQUIRED: Accessibility tests
  it('should be accessible', async () => {
    render(<LoginForm />);

    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  // ✅ REQUIRED: Validation tests
  it('should show validation errors', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('Email is required');
  });

  // ✅ REQUIRED: Success flow tests
  it('should submit valid data', async () => {
    const onSubmit = jest.fn();
    const user = userEvent.setup();

    render(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByRole('textbox', { name: /email/i }), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});
```

### Test Coverage Requirements

```javascript
// jest.config.js
module.exports = {
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{ts,tsx}",
  ],
  coverageThreshold: {
    global: {
      branches: 80, // ✅ REQUIRED: 80% branch coverage
      functions: 80, // ✅ REQUIRED: 80% function coverage
      lines: 80, // ✅ REQUIRED: 80% line coverage
      statements: 80, // ✅ REQUIRED: 80% statement coverage
    },
  },
};
```

### E2E Testing

```typescript
// e2e/auth.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  // ✅ REQUIRED: Critical path E2E tests
  test("should complete login flow", async ({ page }) => {
    await page.goto("/login");

    await page.fill('[name="email"]', "student@example.com");
    await page.fill('[name="password"]', "password123");
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL("/dashboard");
    await expect(page.locator("h1")).toContainText("Dashboard");
  });

  // ✅ REQUIRED: Accessibility E2E tests
  test("should be accessible", async ({ page }) => {
    await page.goto("/login");

    const accessibilityResults = await injectAxe(page);
    expect(accessibilityResults.violations).toHaveLength(0);
  });
});
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

```typescript
// Required accessibility patterns

// 1. Semantic HTML elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
    <li><a href="/courses">Courses</a></li>
  </ul>
</nav>

// 2. Proper form labels and descriptions
<div>
  <label htmlFor="email-input">Email Address</label>
  <input
    id="email-input"
    type="email"
    aria-describedby="email-help"
    aria-required="true"
  />
  <div id="email-help">We'll never share your email</div>
</div>

// 3. Focus management
const Modal = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      dialogRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      tabIndex={-1}
    >
      <h2 id="dialog-title">Dialog Title</h2>
      {/* Modal content */}
    </div>
  );
};

// 4. Keyboard navigation
const Dropdown = () => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        // Focus next item
        break;
      case 'ArrowUp':
        e.preventDefault();
        // Focus previous item
        break;
      case 'Escape':
        // Close dropdown
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

### Accessibility Testing

```bash
# Required accessibility checks
npm run test:a11y           # Automated a11y tests
npm run lighthouse:a11y     # Lighthouse accessibility audit
npm run axe:check          # Axe-core validation
```

---

## Performance Standards

### Core Web Vitals Requirements

```typescript
// Required performance monitoring
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

// Track Core Web Vitals
getCLS(console.log); // Cumulative Layout Shift < 0.1
getFID(console.log); // First Input Delay < 100ms
getFCP(console.log); // First Contentful Paint < 1.8s
getLCP(console.log); // Largest Contentful Paint < 2.5s
getTTFB(console.log); // Time to First Byte < 800ms
```

### Performance Patterns

```typescript
// ✅ REQUIRED: Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

// ✅ REQUIRED: Image optimization
import Image from 'next/image';

<Image
  src="/profile.jpg"
  alt="User profile"
  width={100}
  height={100}
  priority={false}
/>

// ✅ REQUIRED: Memo for expensive components
const ExpensiveList = memo(({ items }) => {
  return (
    <div>
      {items.map(item => <ExpensiveItem key={item.id} item={item} />)}
    </div>
  );
});
```

---

## Security Standards

### Security Requirements

```typescript
// ✅ REQUIRED: Input sanitization
import DOMPurify from "dompurify";

const sanitizeHTML = (content: string) => {
  return DOMPurify.sanitize(content);
};

// ✅ REQUIRED: CSP headers
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline';",
          },
        ],
      },
    ];
  },
};

// ✅ REQUIRED: Environment variable validation
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
] as const;

requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
});
```

---

## Code Review Checklist

### Reviewer Must Check

#### ✅ Functionality

- [ ] Code works as intended and meets requirements
- [ ] All edge cases are handled
- [ ] Error states are properly managed
- [ ] Loading states are implemented

#### ✅ Type Safety

- [ ] No `any` types used
- [ ] All external data is validated with Zod
- [ ] Proper error handling with typed exceptions
- [ ] TypeScript strict mode compliance

#### ✅ Accessibility

- [ ] Semantic HTML elements used
- [ ] Proper ARIA labels and descriptions
- [ ] Keyboard navigation works
- [ ] Screen reader compatibility

#### ✅ Performance

- [ ] No unnecessary re-renders
- [ ] Proper memo usage for expensive components
- [ ] Images are optimized
- [ ] Code splitting is used where appropriate

#### ✅ Security

- [ ] No XSS vulnerabilities
- [ ] Input validation and sanitization
- [ ] No sensitive data in logs
- [ ] Proper authentication checks

#### ✅ Testing

- [ ] Unit tests for complex logic
- [ ] Accessibility tests included
- [ ] Edge cases are tested
- [ ] Test coverage meets requirements

#### ✅ Code Quality

- [ ] ESLint passes with zero warnings
- [ ] TypeScript compile with no errors
- [ ] Consistent naming conventions
- [ ] Proper component composition

### Automated Checks

```yaml
# .github/workflows/quality-check.yml
name: Quality Check
on: [pull_request]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      # ✅ REQUIRED: Linting
      - name: Run ESLint
        run: npm run lint

      # ✅ REQUIRED: Type checking
      - name: Type check
        run: npm run check-types

      # ✅ REQUIRED: Testing
      - name: Run tests
        run: npm test -- --coverage --watchAll=false

      # ✅ REQUIRED: Accessibility audit
      - name: Accessibility check
        run: npm run test:a11y

      # ✅ REQUIRED: Security scan
      - name: Security audit
        run: npm audit --audit-level=moderate
```

This quality framework ensures consistent, accessible, performant, and secure code across the entire application.
