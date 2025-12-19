import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE_NAME = "session_token";
const CSRF_HEADER = "x-csrf-token";
const CSRF_COOKIE = "csrf_token";

// Security headers for all responses
const SECURITY_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  "/login",
  "/api/auth/login",
  "/api/auth/logout",
  "/api/auth/setup",
  "/api/health",
];

// Routes that should redirect to login if not authenticated
const PROTECTED_PAGE_ROUTES = [
  "/",
  "/image",
  "/video",
  "/workflow",
  "/create-character",
  "/products",
  "/prompts",
];

// API routes that require authentication
const PROTECTED_API_PREFIXES = [
  "/api/images",
  "/api/videos",
  "/api/characters",
  "/api/products",
  "/api/api-keys",
  "/api/generate-image",
  "/api/generate-video",
  "/api/upload",
  "/api/workflows",
];

function addSecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  // Add HSTS in production
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }
  return response;
}

function generateCsrfToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_ROUTES.some((route) => pathname === route)) {
    const response = NextResponse.next();
    return addSecurityHeaders(response);
  }

  // Check for session cookie
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  // Check if this is a protected API route
  const isProtectedApi = PROTECTED_API_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  // Check if this is a protected page route
  const isProtectedPage = PROTECTED_PAGE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  // CSRF protection for state-changing API requests
  const isStateChangingMethod = ["POST", "PUT", "PATCH", "DELETE"].includes(
    request.method
  );
  if (isProtectedApi && isStateChangingMethod) {
    const csrfCookie = request.cookies.get(CSRF_COOKIE)?.value;
    const csrfHeader = request.headers.get(CSRF_HEADER);

    // Verify CSRF token matches (double-submit cookie pattern)
    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      const response = NextResponse.json(
        { error: "Invalid CSRF token" },
        { status: 403 }
      );
      return addSecurityHeaders(response);
    }
  }

  if (!sessionToken) {
    // No session - handle based on route type
    if (isProtectedApi) {
      const response = NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
      return addSecurityHeaders(response);
    }

    if (isProtectedPage) {
      // Redirect to login for page routes
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If user is logged in and trying to access login page, redirect to home
  if (sessionToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Session exists - validate it by checking with the database
  // Note: For performance, we do lightweight validation in middleware
  // and full validation in API routes when needed
  if (sessionToken && (isProtectedApi || isProtectedPage)) {
    // Add session token to request headers for downstream use
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-session-token", sessionToken);

    const response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Ensure CSRF cookie exists for authenticated users
    if (!request.cookies.get(CSRF_COOKIE)?.value) {
      const csrfToken = generateCsrfToken();
      response.cookies.set(CSRF_COOKIE, csrfToken, {
        httpOnly: false, // Must be readable by JS
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
      });
    }

    return addSecurityHeaders(response);
  }

  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
