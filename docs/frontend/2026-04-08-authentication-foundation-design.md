# Teams LMS Authentication Foundation Design

**Date**: April 8, 2026  
**Author**: AI Assistant  
**Status**: Design Approved  
**Scope**: Authentication & Authorization Foundation for Vietnamese Teams LMS

## Overview

This document specifies the authentication foundation for the Vietnamese Teams LMS project. The foundation provides secure authentication flows, educational profile setup, and admin management capabilities as a handoff point for other team members to build upon.

**Project Context**: Comprehensive Teams clone LMS targeting Vietnamese educational institutions with support for Organizations → Departments → Majors → Courses architecture.

## Requirements Summary

### Core Requirements

- **Authentication Foundation Only**: Login/signup/logout with educational profile management
- **Progressive Profile Setup**: Step-by-step educational context collection after signup
- **Role-Based Access**: Students (self-register), Teachers/Admins (admin-created only)
- **Vietnamese Education Support**: Organization/Department/Major hierarchy with "Other" requests
- **Admin Management Foundation**: CRUD operations for academic entities and user management
- **Team Handoff Ready**: Clean architecture for other developers to extend

### User Flow Requirements

1. **Email/password signup** → Email verification → **Educational profile setup** → Active student account
2. **Progressive disclosure**: Organization → Department → Major → Complete profile (4 steps)
3. **Admin-only teacher/admin creation**: No self-registration for elevated roles
4. **Missing entity requests**: Students can request new organizations/departments/majors

## Architecture

### Full-Stack Overview

**Frontend (Next.js 16+ App Router)**:

- `@supabase/ssr` for server-side auth state management
- Server Components for protected pages and auth checks
- Client Components for auth forms and interactive elements
- Middleware for route protection and redirects
- **API Layer**: Axios with React Query for server state management
- **Client State**: Zustand for local UI state management
- **UI Components**: Radix UI + Radix Themes for accessible component library
- **Styling**: Tailwind CSS for utility-first styling
- **Validation**: Zod for schema validation and type safety

**Backend (NestJS API)**:

- Existing Supabase Auth integration with `SupabaseAuthGuard`
- Educational authorization guards (`RolesGuard`, `ClassMemberGuard`, etc.)
- Prisma service with RLS context support
- Protected endpoints for educational profile management

**Database**:

- Supabase Postgres with existing RLS policies
- Hybrid auth: Supabase Auth + custom educational authorization
- Automatic data filtering based on user's educational context

**Integration Points**:

- Frontend calls NestJS API endpoints with Supabase JWT tokens
- Backend validates JWT and loads educational profile context
- RLS policies automatically filter data based on user's educational context
- Frontend redirects based on profile completion status from backend

## Authentication Components & Pages

### Page Structure

```
app/
├── (auth)/
│   ├── login/page.tsx           # Server Component with login form
│   ├── signup/page.tsx          # Server Component with signup form
│   ├── verify/page.tsx          # Email verification landing
│   ├── reset-password/page.tsx  # Password reset form
│   └── layout.tsx               # Auth-specific layout (centered, no nav)
└── (protected)/
    ├── setup/
    │   ├── organization/page.tsx    # Step 1: Choose organization
    │   ├── department/page.tsx      # Step 2: Choose department
    │   ├── major/page.tsx           # Step 3: Choose major
    │   └── complete/page.tsx        # Step 4: Final profile details
    ├── dashboard/page.tsx           # Post-setup landing page
    └── layout.tsx                   # Protected layout (nav, auth checks)
```

### Supabase Client Setup

- `lib/supabase/server.ts` - Server-side client for SSR
- `lib/supabase/client.ts` - Client-side client for forms
- `middleware.ts` - Route protection and profile completion checks

### Key Components

- `LoginForm` - Email/password with validation, loading states
- `SignupForm` - Email/password + basic info, student role only
- `EducationalSetupWizard` - Progressive disclosure stepper
- `OrganizationSelector` - Dropdown with search, "Other" + request form

## Route Protection & Middleware

### Middleware Logic (`middleware.ts`)

```typescript
// Route protection with uniform error handling:
1. Public routes: /login, /signup, /verify (bypass all checks)
2. Unauthenticated → redirect to /login
3. API errors → redirect to /error page with retry mechanism
4. Profile incomplete → redirect to appropriate setup step
5. Complete profile → allow access to protected routes
```

### Standardized API Response Format

```typescript
// All NestJS API responses follow this structure:
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string; // "AUTH_REQUIRED", "PROFILE_INCOMPLETE", etc.
    message: string; // User-friendly message
    timestamp: string;
  };
}
```

### Uniform Error Handling UI

- `ErrorBoundary` component for unexpected React errors
- `ApiErrorPage` for API failures with retry/contact support options
- `NetworkErrorBanner` for connection issues with auto-retry
- `ValidationErrorInline` for form field validation
- All errors logged to backend with sanitized context (no sensitive data)

### Security-First Error Responses

- Backend returns identical error format regardless of error type
- No distinction between "user not found" vs "wrong password"
- API enumeration prevention: all protected endpoints return same error structure
- Rate limiting on auth endpoints with consistent error messages
- No stack traces or internal error details exposed to frontend

### Profile Status API

**Endpoint**: `GET /api/auth/profile-status`

- Always returns 200 with standardized response structure
- Error conditions return success:false with generic error codes
- Frontend handles all error codes uniformly through error UI system

## Educational Profile Setup Flow

### Progressive Setup Wizard

**Step 1: Organization Selection**

- Dropdown with search functionality
- "Other" option with custom name + request form
- Backend: `GET /api/organizations` (public endpoint)
- Validation: Required selection to proceed

**Step 2: Department Selection**

- Filtered by selected organization
- Backend: `GET /api/organizations/{id}/departments`
- "Other" option with request form
- Validation: Must belong to selected organization

**Step 3: Major Selection**

- Filtered by selected department
- Backend: `GET /api/departments/{id}/majors`
- "Other" option with request form
- Validation: Must belong to selected department

**Step 4: Complete Profile**

- Student ID, full name, phone (optional)
- Profile photo upload to Supabase Storage
- Terms acceptance checkbox
- Backend: `POST /api/auth/complete-profile`

### Setup State Management

- Server-side session storage for setup progress
- Each step validates previous selections server-side
- Breadcrumb navigation shows progress and allows back navigation
- Auto-save draft data on each step completion
- Setup timeout after 30 minutes, restart from beginning

### "Other" Organization Requests

```typescript
// Request form for missing organizations/departments/majors
interface OrganizationRequest {
  type: "organization" | "department" | "major";
  name: string;
  description?: string;
  parentId?: string; // For departments/majors
  requesterEmail: string;
}
```

### Backend Integration

- Setup wizard calls NestJS APIs with Supabase JWT
- Educational data endpoints use existing Prisma service
- Request submissions stored in database for admin review
- Setup completion triggers user profile creation with RLS context

## Admin Academic Management Foundation

### Admin Dashboard Structure

```
app/(protected)/admin/
├── organizations/
│   ├── page.tsx              # Organizations list with CRUD
│   ├── [id]/page.tsx         # Organization details & departments
│   └── [id]/edit/page.tsx    # Edit organization form
├── departments/
│   ├── page.tsx              # All departments with org filtering
│   └── [id]/majors/page.tsx  # Department's majors management
├── requests/
│   ├── page.tsx              # Pending student requests approval
│   └── [id]/page.tsx         # Review individual request
└── users/
    ├── page.tsx              # User management (role assignments)
    └── bulk-import/page.tsx  # Bulk teacher/admin account creation
```

### Admin API Endpoints (NestJS)

```typescript
// Academic entity management
POST   /api/admin/organizations          # Create organization
PUT    /api/admin/organizations/{id}     # Update organization
DELETE /api/admin/organizations/{id}     # Soft delete organization
GET    /api/admin/organizations          # List with pagination/search

// Department management under organizations
POST   /api/admin/organizations/{id}/departments
PUT    /api/admin/departments/{id}
DELETE /api/admin/departments/{id}

// Major management under departments
POST   /api/admin/departments/{id}/majors
PUT    /api/admin/majors/{id}
DELETE /api/admin/majors/{id}

// Student request approval
GET    /api/admin/requests               # Pending requests
PUT    /api/admin/requests/{id}/approve  # Approve & create entity
PUT    /api/admin/requests/{id}/reject   # Reject with reason
```

### Admin Authorization

- All admin endpoints protected by `AdminGuard` (extends existing auth system)
- RLS policies automatically filter admin actions to their organization scope
- Audit logging for all academic data changes
- Bulk operations with transaction safety

### Admin UX Features

- Hierarchical tree view for org → department → major relationships
- Bulk import via CSV for initial data seeding
- Search and filtering across all academic entities
- Approval queue with batch operations for student requests
- Change history and audit trail viewing

## Data Flow & State Management

### Server-Side Data Flow

```
User Request → Middleware (auth check) → Page Component (server) → NestJS API → Prisma + RLS → Database
                ↓
User sees rendered page with data ← Server Component ← API Response ← Filtered results ← Database
```

### Authentication State Management

- Server Components: Use `createServerComponentClient()` for auth checks
- Client Components: Use `createClientComponentClient()` for auth actions
- **Server State**: React Query for API calls, caching, and synchronization
- **Client State**: Zustand stores for UI state (modals, form steps, etc.)
- **Form State**: React Hook Form with Zod validation

### Educational Profile State

```typescript
// Server-side profile context passed to components
interface UserProfileContext {
  user: SupabaseUser;
  profile: {
    id: string;
    organizationId: string;
    departmentId: string;
    majorId: string;
    role: "STUDENT" | "TEACHER" | "ADMIN";
    isProfileComplete: boolean;
  };
  permissions: string[]; // From RLS context
}
```

### API Integration Pattern

- **API Client**: Axios with interceptors for JWT token attachment
- **Server State**: React Query for caching, background updates, optimistic UI
- **Data Fetching**: React Query queries for GET operations
- **Mutations**: React Query mutations for POST/PUT/DELETE operations
- **SSR Integration**: Initial data fetched in Server Components, hydrated to React Query

### Caching Strategy

- **React Query**: Automatic caching and background refetching for API data
- **Static Data**: Organizations/departments cached with longer stale times
- **User Profile**: Short cache duration with frequent background updates
- **Real-time Data**: WebSocket integration with React Query invalidation

### Form Handling

- **React Hook Form**: Form state management with performance optimization
- **Zod Integration**: Schema validation with TypeScript inference
- **Server Validation**: Backend validation as final security layer
- **Optimistic Updates**: React Query mutations with rollback on failure

## Error Handling & Security Implementation

### Frontend Error Boundaries

```typescript
// Hierarchical error handling
RootLayout → GlobalErrorBoundary (app crashes, API failures)
   ↓
AuthLayout → AuthErrorBoundary (auth failures, session issues)
   ↓
PageLevel → ComponentErrorBoundary (form validation, component errors)
```

### Security Implementation

- **CSRF Protection**: Server Actions with Next.js built-in CSRF tokens
- **Rate Limiting**: Backend middleware on auth endpoints (5 attempts/minute)
- **Input Validation**: Zod schemas shared between frontend forms and backend APIs
- **SQL Injection**: Prisma ORM + parameterized queries only
- **XSS Prevention**: React's built-in escaping + CSP headers
- **Session Security**: HTTP-only cookies, SameSite=Strict, secure flags

### API Security Standards

```typescript
// All protected endpoints follow this pattern:
@UseGuards(SupabaseAuthGuard, RolesGuard)
@ApiResponse({ type: StandardApiResponse })
async endpoint(@CurrentUser() user: UserContext) {
  // Implementation with automatic RLS context
}
```

### Monitoring & Logging

- Frontend errors logged to backend with sanitized context
- Backend API logs: successful operations, failed auth attempts, admin actions
- No sensitive data in logs (emails masked, no passwords, no tokens)
- Error correlation IDs for debugging across frontend/backend
- **External Services**: Integration ready for PostHog, Sentry, or similar logging services

### Development Handoff Features

- TypeScript interfaces for all API contracts
- Comprehensive error type definitions
- Component documentation with Storybook setup ready
- Testing utilities for auth flows and protected routes

### Production Readiness

- Environment-specific Supabase configurations
- Database migrations and seeding scripts
- Docker setup for consistent deployment
- Health check endpoints for monitoring

## Implementation Priorities

### Phase 1: Core Authentication

1. Supabase SSR client setup and middleware
2. Basic auth pages (login, signup, verification)
3. Route protection and error handling
4. Backend API integration for profile status

### Phase 2: Educational Profile Setup

1. Progressive setup wizard (4 steps)
2. Organization/Department/Major selection components
3. "Other" request forms and backend handling
4. Profile completion validation

### Phase 3: Admin Management Foundation

1. Admin dashboard structure and navigation
2. Academic entity CRUD operations
3. Student request approval system
4. Bulk import and audit logging

### Phase 4: Polish & Handoff

1. Comprehensive error handling and UX polish
2. Testing utilities and documentation
3. Performance optimization and caching
4. Team handoff documentation and demos

## Success Criteria

### For Students

- ✅ Can create account with email/password
- ✅ Can complete 4-step educational profile setup
- ✅ Can request missing organizations/departments/majors
- ✅ Can access dashboard after profile completion
- ✅ Cannot access incomplete profile areas

### For Admins

- ✅ Can manage organizations, departments, and majors via UI
- ✅ Can approve/reject student entity requests
- ✅ Can create teacher/admin accounts via admin panel
- ✅ Can view audit trail of academic data changes

### For Developers (Handoff)

- ✅ Clean authentication foundation to build upon
- ✅ Documented API contracts and component interfaces
- ✅ Working examples of protected routes and auth flows
- ✅ Testing utilities for auth-related features
- ✅ Production-ready security and error handling

## Technical Notes

### Dependencies to Add

**Core Dependencies**:

- `@supabase/ssr` - Server-side Supabase client
- `zod` - Schema validation and type safety
- `axios` - HTTP client for API calls
- `@tanstack/react-query` - Server state management
- `zustand` - Client state management

**UI & Styling**:

- `@radix-ui/react-*` - Accessible component primitives
- `@radix-ui/themes` - Design system and theming
- `tailwindcss` - Utility-first CSS framework (if not already installed)

**Form Handling**:

- `react-hook-form` - Form state management and validation
- `@hookform/resolvers` - Zod integration for react-hook-form

### Integration Points

- Uses existing NestJS backend auth system
- Leverages existing Prisma schema and RLS policies
- Integrates with existing Supabase database
- Builds upon established Vietnamese educational data model

### Future Considerations

- Real-time notifications for admin approval workflows
- Multi-language support (Vietnamese/English)
- Mobile-responsive design for educational tablet usage
- Integration with external Vietnamese student information systems
