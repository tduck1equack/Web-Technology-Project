"use client";

import { useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores/auth-store";
import type { UserProfile } from "@/lib/types/auth";

interface AuthStateProviderProps {
  children: React.ReactNode;
}

function createUserProfileFromSession(session: Session): UserProfile {
  return {
    id: session.user.id,
    authUserId: session.user.id,
    email: session.user.email || "",
    username: session.user.email?.split("@")[0] || "",
    firstName: session.user.user_metadata?.firstName || "",
    lastName: session.user.user_metadata?.lastName || "",
    avatar: session.user.user_metadata?.avatar || null,
    role: "STUDENT" as const,
    status: "ONLINE" as const,
    lastSeen: new Date().toISOString(),
    isEmailVerified: session.user.email_confirmed_at != null,
    isActive: true,
    lastLogin: session.user.last_sign_in_at,
    createdAt: session.user.created_at,
    updatedAt: new Date().toISOString(),
  };
}

export function AuthStateProvider({ children }: AuthStateProviderProps) {
  const { setUser, setLoading, setError } = useAuthStore();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    const getInitialSession = async () => {
      setLoading(true);
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Error getting session:", error);
          setError(error.message);
          setUser(null);
        } else if (session?.user) {
          const userProfile = createUserProfileFromSession(session);
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Session initialization error:", error);
        setError("Failed to initialize authentication");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" && session?.user) {
          const userProfile = createUserProfileFromSession(session);
          setUser(userProfile);
          setError(null);
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          setError(null);
        } else if (event === "TOKEN_REFRESHED" && session?.user) {
          const userProfile = createUserProfileFromSession(session);
          setUser(userProfile);
        }
      },
    );

    getInitialSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setLoading, setError]);

  return <>{children}</>;
}
