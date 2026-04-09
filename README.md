# Teams LMS - Vietnamese Educational Platform

A comprehensive Learning Management System (LMS) platform designed for Vietnamese educational institutions, built with modern technologies and following best practices.

## Overview

Teams LMS is a full-stack educational platform that enables students, teachers, and administrators to collaborate and manage learning effectively. The platform features organization hierarchies (Organizations → Departments → Majors), course management, class instances, and real-time collaboration tools.

**Current Status:** Authentication Foundation Complete ✅ (7/7 Tasks)

## Project Structure

This is a monorepo using **Turborepo** and **pnpm workspaces**.

```
teams-lms/
├── apps/
│   ├── web/              # Next.js 16+ frontend (App Router)
│   ├── api/              # NestJS backend
│   └── docs/             # Documentation site
├── packages/
│   ├── ui/               # Shared React components
│   ├── eslint-config/    # ESLint configurations
│   └── typescript-config/# TypeScript configurations
├── docs/                 # Project documentation & plans
└── .trellis/            # Development guidelines & workflows
```

## Tech Stack

### Frontend (`apps/web`)

- **Framework:** Next.js 16+ (App Router)
- **Language:** TypeScript
- **Auth:** Supabase Auth (SSR)
- **State Management:** Zustand + React Query
- **Forms:** React Hook Form + Zod
- **Styling:** Tailwind CSS 4
- **UI Components:** Radix UI + Custom components
- **HTTP Client:** Axios

### Backend (`apps/api`)

- **Framework:** NestJS
- **Language:** TypeScript
- **Database:** PostgreSQL (via Supabase)
- **ORM:** Prisma
- **Auth:** Supabase Auth

### Shared Packages

- `@repo/ui` - Reusable React components
- `@repo/eslint-config` - ESLint rules
- `@repo/typescript-config` - TypeScript configurations

## Features

### ✅ Completed: Authentication Foundation

- User registration & login with Supabase Auth
- Email verification flow
- Password reset functionality
- JWT token management with secure cookies
- Route protection middleware
- Form validation with React Hook Form + Zod
- State management with Zustand + React Query
- Dark mode support
- Responsive design

### 📋 Upcoming Features

- Educational setup wizard (profile completion)
- Role-based access control (Student/Teacher/Admin)
- Course management & class instances
- Real-time collaboration tools
- Assignment & grading system
- Progress tracking & analytics

## Quick Start

### Prerequisites

- Node.js 18+ (recommended 20+)
- pnpm 8+
- Supabase account (for authentication)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd teams-lms
```

2. **Install dependencies**

```bash
pnpm install
```

3. **Environment Setup**

Create `.env` files for both apps:

**`apps/web/.env.local`:**

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001
```

**`apps/api/.env`:**

```env
DATABASE_URL=your_database_url
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
JWT_SECRET=your_jwt_secret
```

### Development

#### Start all applications

```bash
pnpm dev
```

This starts:

- Web app: http://localhost:3000
- API: http://localhost:3001
- Docs: http://localhost:3002

#### Start specific application

```bash
# Frontend only
pnpm dev --filter=web

# Backend only
pnpm dev --filter=api

# Documentation only
pnpm dev --filter=docs
```

### Building

#### Build all apps

```bash
pnpm build
```

#### Build specific app

```bash
pnpm build --filter=web
pnpm build --filter=api
```

### Testing

#### Type checking

```bash
pnpm type-check
```

#### Linting

```bash
pnpm lint
```

#### Run tests (API)

```bash
pnpm test --filter=api
```

## Authentication Flow

```
User → Login/Signup Form
  ↓
Supabase Auth
  ↓
JWT Token (secure cookie)
  ↓
Middleware Route Protection
  ↓
Protected Routes / Dashboard
  ↓
Profile Setup (if incomplete)
  ↓
Main Application
```

## Directory Structure

### Frontend (`apps/web`)

```
app/
├── (auth)/              # Authentication routes
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── verify/page.tsx
│   └── reset-password/page.tsx
├── (protected)/         # Protected routes requiring auth
│   └── [routes]
└── layout.tsx

components/
├── auth/               # Authentication forms
├── layout/             # Layout components
└── ui/                 # Reusable UI components

lib/
├── supabase/          # Supabase clients
├── api/               # API client
├── stores/            # Zustand stores
├── providers/         # React providers
├── types/             # TypeScript types
└── schemas/           # Zod schemas
```

### Backend (`apps/api`)

```
src/
├── auth/              # Authentication module
├── users/             # Users module
├── organizations/     # Organizations module
├── departments/       # Departments module
├── majors/            # Majors module
├── courses/           # Courses module
└── common/            # Shared utilities
```

## Development Guidelines

### Frontend Guidelines

See `.trellis/spec/guides/frontend-guidelines.md` for:

- Component organization
- Styling conventions
- State management patterns
- Form handling best practices
- Accessibility standards

### Backend Guidelines

See `.trellis/spec/guides/backend-guidelines.md` for:

- Module structure
- DTO patterns
- Error handling
- Validation strategies
- Database query optimization

## Implementation Plan

All development follows detailed implementation plans stored in `docs/superpowers/plans/`:

- **Authentication Foundation** (`2026-04-08-authentication-foundation.md`) - ✅ Complete
  - Tasks 1-7: Dependencies, types, API client, middleware, layouts, forms, pages

### Upcoming Plans

- Educational Setup Wizard
- Admin Management System
- Course & Class Management
- Testing & Deployment

## Code Quality

All code follows:

- ✅ TypeScript strict mode
- ✅ ESLint rules
- ✅ Prettier formatting
- ✅ Frontend/Backend guidelines
- ✅ Code reviews (spec compliance + quality)

## Git Workflow

### Recent Commits

```
02cfbd7 feat(auth): add login, signup, verify, and reset-password pages
681739c docs: add environment variable template for Supabase configuration
a4a50f6 feat(auth): add route protection middleware with profile completion checks
7768a9d feat(auth): add API client, auth store, and React Query provider
f48e297 fix(auth): align types with database schema and improve validation
7a89c14 feat(auth): add authentication and educational type definitions
f70cc50 feat(auth): add authentication dependencies and supabase clients
```

## Contributing

1. Create a feature branch from `main`
2. Follow the development guidelines
3. Implement features with proper testing
4. Run linting and type checks
5. Create a pull request with detailed description

## Resources

### Documentation

- [Turborepo Docs](https://turborepo.dev)
- [Next.js 16 Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com)
- [Supabase Docs](https://supabase.io/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Project Resources

- Implementation Plans: `docs/superpowers/plans/`
- Development Guidelines: `.trellis/spec/guides/`
- Database Schema: `docs/database-schema.md`
- Architecture: `AGENTS.md`

## Common Commands

| Command                        | Description                |
| ------------------------------ | -------------------------- |
| `pnpm install`                 | Install all dependencies   |
| `pnpm dev`                     | Start all apps in dev mode |
| `pnpm build`                   | Build all apps             |
| `pnpm lint`                    | Lint all apps              |
| `pnpm type-check`              | Check TypeScript types     |
| `pnpm dev --filter=web`        | Start only web app         |
| `pnpm dev --filter=api`        | Start only API             |
| `turbo run build --filter=web` | Build only web             |

## Troubleshooting

### Port conflicts

If ports 3000, 3001, or 3002 are in use:

```bash
# Specify custom ports
cd apps/web && pnpm dev --port 3005
cd apps/api && npm run dev -- --port 3006
```

### Dependencies not installing

```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Database connection issues

1. Verify `.env` files have correct Supabase credentials
2. Check Supabase project is active
3. Ensure database migrations are run

### TypeScript errors

```bash
# Regenerate types
pnpm type-check

# Clean build
rm -rf apps/web/.next apps/api/dist
pnpm build
```

## License

[Specify your license here]

## Contact & Support

For questions or support:

- Create an issue in the repository
- Contact the development team
- Check project documentation

---

**Last Updated:** April 9, 2026  
**Status:** In Active Development  
**Authentication:** ✅ Complete  
**Next Phase:** Educational Setup Wizard
