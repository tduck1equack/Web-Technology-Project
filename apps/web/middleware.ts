import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Next.js middleware for route protection using Supabase Auth
 *
 * Handles:
 * - Redirecting unauthenticated users to login
 * - Preventing authenticated users from accessing auth pages
 * - Excluding API routes from auth checks (they handle auth independently)
 * - Profile completion checks (deferred until API is available)
 *
 * @param request - Next.js request object
 * @returns Response or redirect
 */
export async function middleware(request: NextRequest) {
  // Create response object
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing required Supabase environment variables");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Create Supabase client for middleware
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        // Set cookie on both request and response
        request.cookies.set({ name, value, ...options });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        // Remove cookie from both request and response
        request.cookies.set({ name, value: "", ...options });
        response.cookies.set({ name, value: "", ...options });
      },
    },
  });

  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/verify", "/reset-password"];
  const isPublicRoute = publicRoutes.includes(pathname);

  // Skip auth checks for API routes - they should handle auth independently
  const isApiRoute = pathname.startsWith("/api/");
  if (isApiRoute) {
    return response;
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    // Redirect unauthenticated users to login (except on public routes)
    if (!session && !isPublicRoute) {
      const redirectUrl = new URL("/login", request.url);
      redirectUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Redirect authenticated users away from auth pages
    if (session && isPublicRoute) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Note: Profile completion checks will be added when API endpoint is available
    // For now, allow all authenticated users to access protected routes

    return response;
  } catch (error) {
    // On error, redirect to login for safety
    console.error("Middleware auth error:", {
      pathname,
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    });
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
