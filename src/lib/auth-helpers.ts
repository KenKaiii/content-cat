import { NextResponse } from "next/server";
import { validateSession } from "./auth";

/**
 * Get authenticated user from session cookie
 * Use this in API routes that need user context
 */
export async function getAuthenticatedUser() {
  try {
    const result = await validateSession();
    if (!result) {
      return null;
    }
    return result.user;
  } catch {
    return null;
  }
}

/**
 * Require authentication for an API route
 * Returns a 401 response if not authenticated
 */
export async function requireAuth() {
  const user = await getAuthenticatedUser();

  if (!user) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      ),
    };
  }

  return { user, error: null };
}

/**
 * Require admin role for an API route
 */
export async function requireAdmin() {
  const { user, error } = await requireAuth();

  if (error) {
    return { user: null, error };
  }

  if (user?.role !== "admin") {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      ),
    };
  }

  return { user, error: null };
}
