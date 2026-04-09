# Teams LMS Authentication Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build authentication foundation with educational profile setup for Vietnamese Teams LMS

**Architecture:** Supabase SSR authentication + NestJS backend + React Query + Progressive educational profile wizard

**Tech Stack:** Next.js 16+ App Router, Supabase Auth, React Query, Zustand, Radix UI, Tailwind CSS, Zod validation

---

## File Structure Overview

This implementation will create or modify the following files:

**Dependencies & Configuration:**
- Modify: `apps/web/package.json` - Add auth dependencies
- Create: `apps/web/lib/supabase/server.ts` - Server-side Supabase client
- Create: `apps/web/lib/supabase/client.ts` - Client-side Supabase client
- Create: `apps/web/middleware.ts` - Route protection middleware
- Create: `apps/web/lib/api/client.ts` - Axios API client with React Query
- Create: `apps/web/lib/stores/auth-store.ts` - Zustand auth state store

**Authentication Pages:**
- Create: `apps/web/app/(auth)/layout.tsx` - Auth layout (centered, no nav)
- Create: `apps/web/app/(auth)/login/page.tsx` - Login page
- Create: `apps/web/app/(auth)/signup/page.tsx` - Signup page 
- Create: `apps/web/app/(auth)/verify/page.tsx` - Email verification
- Create: `apps/web/app/(auth)/reset-password/page.tsx` - Password reset

**Protected Pages & Setup:**
- Create: `apps/web/app/(protected)/layout.tsx` - Protected layout with nav
- Create: `apps/web/app/(protected)/setup/organization/page.tsx` - Step 1: Organization
- Create: `apps/web/app/(protected)/setup/department/page.tsx` - Step 2: Department  
- Create: `apps/web/app/(protected)/setup/major/page.tsx` - Step 3: Major
- Create: `apps/web/app/(protected)/setup/complete/page.tsx` - Step 4: Complete profile
- Create: `apps/web/app/(protected)/dashboard/page.tsx` - Main dashboard

**Components:**
- Create: `apps/web/components/auth/login-form.tsx` - Login form component
- Create: `apps/web/components/auth/signup-form.tsx` - Signup form component
- Create: `apps/web/components/setup/organization-selector.tsx` - Organization dropdown
- Create: `apps/web/components/setup/department-selector.tsx` - Department dropdown
- Create: `apps/web/components/setup/major-selector.tsx` - Major dropdown
- Create: `apps/web/components/setup/setup-wizard.tsx` - Progressive setup stepper
- Create: `apps/web/components/ui/error-boundary.tsx` - Error boundary wrapper

**Types & Schemas:**
- Create: `apps/web/lib/types/auth.ts` - Authentication type definitions
- Create: `apps/web/lib/schemas/auth.ts` - Zod validation schemas
- Create: `apps/web/lib/types/educational.ts` - Educational entity types

---

## Task 1: Dependencies & Core Setup

**Files:**
- Modify: `apps/web/package.json`
- Create: `apps/web/lib/supabase/server.ts`
- Create: `apps/web/lib/supabase/client.ts`

- [ ] **Step 1: Install authentication dependencies**

```bash
cd apps/web
pnpm add @supabase/ssr @supabase/supabase-js zod axios @tanstack/react-query zustand
pnpm add @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-select @radix-ui/themes
pnpm add react-hook-form @hookform/resolvers tailwindcss
pnpm add -D @types/node
```

- [ ] **Step 2: Create server-side Supabase client**

```typescript
// apps/web/lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()
  
  return createServerComponentClient({
    cookies: () => cookieStore,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })
}
```

- [ ] **Step 3: Create client-side Supabase client**

```typescript
// apps/web/lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/ssr'

export const createClient = () => {
  return createClientComponentClient({
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })
}
```

- [ ] **Step 4: Commit dependencies setup**

```bash
git add apps/web/package.json apps/web/lib/supabase/ pnpm-lock.yaml
git commit -m "feat(auth): add authentication dependencies and supabase clients"
```

---

## Task 2: Type Definitions & Schemas

**Files:**
- Create: `apps/web/lib/types/auth.ts`
- Create: `apps/web/lib/schemas/auth.ts` 
- Create: `apps/web/lib/types/educational.ts`

- [ ] **Step 1: Create authentication types**

```typescript
// apps/web/lib/types/auth.ts
export interface UserProfile {
  id: string
  email: string
  fullName?: string
  studentId?: string
  phone?: string
  profilePhotoUrl?: string
  organizationId?: string
  departmentId?: string
  majorId?: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  isProfileComplete: boolean
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: string | null
}

export interface ProfileSetupStep {
  step: 'organization' | 'department' | 'major' | 'complete'
  completed: boolean
  data?: Record<string, any>
}
```

- [ ] **Step 2: Create Zod validation schemas**

```typescript
// apps/web/lib/schemas/auth.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const profileCompleteSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  fullName: z.string().min(2, 'Full name is required'),
  phone: z.string().optional(),
  organizationId: z.string().min(1, 'Organization is required'),
  departmentId: z.string().min(1, 'Department is required'),
  majorId: z.string().min(1, 'Major is required'),
  termsAccepted: z.boolean().refine((val) => val === true, 'You must accept the terms'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type SignupFormData = z.infer<typeof signupSchema>
export type ProfileCompleteFormData = z.infer<typeof profileCompleteSchema>
```

- [ ] **Step 3: Create educational entity types**

```typescript
// apps/web/lib/types/educational.ts
export interface Organization {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Department {
  id: string
  name: string
  description?: string
  organizationId: string
  organization?: Organization
  createdAt: string
  updatedAt: string
}

export interface Major {
  id: string
  name: string
  description?: string
  departmentId: string
  department?: Department
  createdAt: string
  updatedAt: string
}

export interface EntityRequest {
  id: string
  type: 'organization' | 'department' | 'major'
  name: string
  description?: string
  parentId?: string
  requesterEmail: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}
```

- [ ] **Step 4: Commit type definitions**

```bash
git add apps/web/lib/types/ apps/web/lib/schemas/
git commit -m "feat(auth): add authentication and educational type definitions"
```

---

## Task 3: API Client & State Management

**Files:**
- Create: `apps/web/lib/api/client.ts`
- Create: `apps/web/lib/stores/auth-store.ts`
- Create: `apps/web/lib/providers/query-provider.tsx`

- [ ] **Step 1: Create Axios API client with React Query**

```typescript
// apps/web/lib/api/client.ts
import axios from 'axios'
import { createClient } from '../supabase/client'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(async (config) => {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`
  }
  
  return config
})

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login on 401
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    timestamp: string
  }
}
```

- [ ] **Step 2: Create Zustand auth store**

```typescript
// apps/web/lib/stores/auth-store.ts
import { create } from 'zustand'
import { AuthState, ProfileSetupStep } from '../types/auth'

interface AuthStore extends AuthState {
  setupStep: ProfileSetupStep
  setUser: (user: AuthState['user']) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setSetupStep: (step: ProfileSetupStep) => void
  clearAuth: () => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,
  setupStep: {
    step: 'organization',
    completed: false,
  },
  
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setSetupStep: (setupStep) => set({ setupStep }),
  clearAuth: () => set({ 
    user: null, 
    loading: false, 
    error: null,
    setupStep: { step: 'organization', completed: false }
  }),
}))
```

- [ ] **Step 3: Create React Query provider**

```typescript
// apps/web/lib/providers/query-provider.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 60 * 1000, // 1 minute
          retry: 1,
        },
      },
    })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
```

- [ ] **Step 4: Commit API client and state management**

```bash
git add apps/web/lib/api/ apps/web/lib/stores/ apps/web/lib/providers/
git commit -m "feat(auth): add API client, auth store, and React Query provider"
```

---

## Task 4: Route Protection Middleware

**Files:**
- Create: `apps/web/middleware.ts`

- [ ] **Step 1: Create route protection middleware**

```typescript
// apps/web/middleware.ts
import { createServerComponentClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerComponentClient({
    cookies: () => request.cookies,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  })

  const { pathname } = request.nextUrl
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/verify', '/reset-password']
  const isPublicRoute = publicRoutes.includes(pathname)
  
  try {
    const { data: { session } } = await supabase.auth.getSession()
    
    // Redirect unauthenticated users to login (except on public routes)
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL('/login', request.url)
      redirectUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(redirectUrl)
    }
    
    // Redirect authenticated users away from auth pages
    if (session && isPublicRoute) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    
    // Check profile completion for authenticated users on protected routes
    if (session && !isPublicRoute) {
      // Fetch profile status from API
      const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/profile-status`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (apiResponse.ok) {
        const { data: profile } = await apiResponse.json()
        
        // Redirect to setup if profile incomplete
        if (!profile.isProfileComplete && !pathname.startsWith('/setup')) {
          return NextResponse.redirect(new URL('/setup/organization', request.url))
        }
        
        // Redirect to dashboard if profile complete and on setup pages
        if (profile.isProfileComplete && pathname.startsWith('/setup')) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    }
    
    return response
  } catch (error) {
    // On API error, redirect to login
    console.error('Middleware error:', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

- [ ] **Step 2: Test middleware routing**

Run: `cd apps/web && pnpm dev`
Expected: Server starts without errors, middleware loads

- [ ] **Step 3: Commit middleware**

```bash
git add apps/web/middleware.ts
git commit -m "feat(auth): add route protection middleware with profile completion checks"
```

---

## Task 5: Authentication Layouts

**Files:**
- Create: `apps/web/app/(auth)/layout.tsx`
- Create: `apps/web/app/(protected)/layout.tsx`
- Modify: `apps/web/app/layout.tsx`

- [ ] **Step 1: Update root layout with providers**

```typescript
// apps/web/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { QueryProvider } from '../lib/providers/query-provider'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Teams LMS - Vietnamese Educational Platform',
  description: 'Comprehensive learning management system for Vietnamese educational institutions',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 2: Create auth layout (centered, no navigation)**

```typescript
// apps/web/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Teams LMS</h1>
          <p className="mt-2 text-gray-600">Vietnamese Educational Platform</p>
        </div>
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create protected layout (with navigation)**

```typescript
// apps/web/app/(protected)/layout.tsx
import { createClient } from '../../lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Teams LMS</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{session.user.email}</span>
              <form action="/auth/signout" method="post">
                <button className="text-sm text-red-600 hover:text-red-800">
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 4: Commit layouts**

```bash
git add apps/web/app/layout.tsx apps/web/app/\(auth\)/layout.tsx apps/web/app/\(protected\)/layout.tsx
git commit -m "feat(auth): add authentication and protected layouts with navigation"
```

---

## Task 6: Authentication Forms Components

**Files:**
- Create: `apps/web/components/auth/login-form.tsx`
- Create: `apps/web/components/auth/signup-form.tsx`
- Create: `apps/web/components/ui/error-boundary.tsx`

- [ ] **Step 1: Create login form component**

```typescript
// apps/web/components/auth/login-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '../../lib/supabase/client'
import { loginSchema, type LoginFormData } from '../../lib/schemas/auth'
import Link from 'next/link'

export function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        setError('Invalid email or password')
      } else {
        window.location.href = '/dashboard'
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign up here
          </Link>
        </p>
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Create signup form component**

```typescript
// apps/web/components/auth/signup-form.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClient } from '../../lib/supabase/client'
import { signupSchema, type SignupFormData } from '../../lib/schemas/auth'
import Link from 'next/link'

export function SignupForm() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data: SignupFormData) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: 'STUDENT',
          },
        },
      })

      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <h2 className="mt-6 text-3xl font-bold text-gray-900">Check your email</h2>
        <p className="mt-2 text-sm text-gray-600">
          We've sent you a verification link. Please check your email and click the link to activate your account.
        </p>
        <Link
          href="/login"
          className="mt-4 inline-block font-medium text-indigo-600 hover:text-indigo-500"
        >
          Return to login
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            {...register('fullName')}
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your full name"
          />
          {errors.fullName && (
            <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            {...register('password')}
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <input
            {...register('confirmPassword')}
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Confirm your password"
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div>
        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Sign in here
          </Link>
        </p>
      </div>
    </form>
  )
}
```

- [ ] **Step 3: Create error boundary component**

```typescript
// apps/web/components/ui/error-boundary.tsx
'use client'

import React from 'react'

interface Props {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error }>
}

interface State {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback
      return <FallbackComponent error={this.state.error!} />
    }

    return this.props.children
  }
}

function DefaultErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 mb-4">
          An unexpected error occurred. Please try refreshing the page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Refresh Page
        </button>
      </div>
    </div>
  )
}

export { ErrorBoundary }
```

- [ ] **Step 4: Commit authentication components**

```bash
git add apps/web/components/auth/ apps/web/components/ui/
git commit -m "feat(auth): add login form, signup form, and error boundary components"
```

---

## Task 7: Authentication Pages

**Files:**
- Create: `apps/web/app/(auth)/login/page.tsx`
- Create: `apps/web/app/(auth)/signup/page.tsx`
- Create: `apps/web/app/(auth)/verify/page.tsx`
- Create: `apps/web/app/(auth)/reset-password/page.tsx`

- [ ] **Step 1: Create login page**

```typescript
// apps/web/app/(auth)/login/page.tsx
import { LoginForm } from '../../../components/auth/login-form'

export const metadata = {
  title: 'Sign In - Teams LMS',
  description: 'Sign in to your Teams LMS account',
}

export default function LoginPage() {
  return (
    <div>
      <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
        Sign in to your account
      </h2>
      <LoginForm />
    </div>
  )
}
```

- [ ] **Step 2: Create signup page**

```typescript
// apps/web/app/(auth)/signup/page.tsx
import { SignupForm } from '../../../components/auth/signup-form'

export const metadata = {
  title: 'Create Account - Teams LMS',
  description: 'Create your Teams LMS student account',
}

export default function SignupPage() {
  return (
    <div>
      <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
        Create your student account
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Join the Vietnamese educational platform
      </p>
      <SignupForm />
    </div>
  )
}
```

- [ ] **Step 3: Create email verification page**

```typescript
// apps/web/app/(auth)/verify/page.tsx
import Link from 'next/link'

export const metadata = {
  title: 'Email Verification - Teams LMS',
  description: 'Verify your email address',
}

export default function VerifyPage() {
  return (
    <div className="text-center">
      <h2 className="text-3xl font-bold tracking-tight text-gray-900">
        Email Verification
      </h2>
      <div className="mt-6">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Email Verified Successfully!
        </h3>
        <p className="mt-2 text-gray-600">
          Your email has been verified. You can now complete your educational profile.
        </p>
        <Link
          href="/setup/organization"
          className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Complete Your Profile
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create password reset page**

```typescript
// apps/web/app/(auth)/reset-password/page.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '../../../lib/supabase/client'
import Link from 'next/link'

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
})

type ResetFormData = z.infer<typeof resetSchema>

export default function ResetPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  })

  const onSubmit = async (data: ResetFormData) => {
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password/confirm`,
      })

      if (error) {
        setError(error.message)
      } else {
        setSent(true)
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          Check your email
        </h2>
        <p className="mt-4 text-gray-600">
          If an account with that email exists, we've sent you a password reset link.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block font-medium text-indigo-600 hover:text-indigo-500"
        >
          Return to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900">
        Reset your password
      </h2>
      <p className="mt-2 text-center text-sm text-gray-600">
        Enter your email address and we'll send you a reset link
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            {...register('email')}
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </div>

        <div className="text-center">
          <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Back to sign in
          </Link>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: Commit authentication pages**

```bash
git add apps/web/app/\(auth\)/
git commit -m "feat(auth): add login, signup, verification, and password reset pages"
```

---

Plan complete and saved to `docs/superpowers/plans/2026-04-08-authentication-foundation.md`. 

This plan covers the first 7 tasks of authentication foundation implementation. The remaining tasks (educational setup wizard, admin management, and testing) can be added as continuation phases.

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach would you prefer?
