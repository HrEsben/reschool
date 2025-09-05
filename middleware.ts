import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { stackServerApp } from "./src/stack";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and auth handlers
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/handler') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  try {
    // Get the user from Stack Auth
    const user = await stackServerApp.getUser();

    // If user is not authenticated and trying to access protected routes, redirect to home
    if (!user && (pathname === '/dashboard' || pathname === '/settings')) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (error) {
    // If there's an error checking authentication, continue normally
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - handler (Stack auth handler)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|handler).*)',
  ],
};
