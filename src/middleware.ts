import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and auth pages
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/forgot-password') ||
    pathname.startsWith('/reset-password')
  ) {
    return NextResponse.next();
  }

  // Get user info from cookies/headers (simplified for now)
  // In a real implementation, you'd decode the JWT token here
  const userRole = request.cookies.get('user-role')?.value;
  
  // Role-based routing
  if (pathname === '/dashboard' || pathname === '/') {
    if (userRole === 'admin' || userRole === 'admin-test') {
      return NextResponse.redirect(new URL('/admin', request.url)); // Your existing admin page
    } else if (userRole === 'patient') {
      return NextResponse.redirect(new URL('/patient', request.url));
    } else if (userRole === 'doctor' || userRole === 'nurse' || userRole === 'staff') {
      return NextResponse.redirect(new URL('/admin', request.url)); // Medical staff get your existing admin access
    }
  }

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    if (!userRole || !['admin', 'admin-test', 'doctor', 'nurse', 'staff'].includes(userRole)) {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }
  }

  // Protect patient routes
  if (pathname.startsWith('/patient')) {
    if (!userRole || userRole !== 'patient') {
      return NextResponse.redirect(new URL('/login?error=unauthorized', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
