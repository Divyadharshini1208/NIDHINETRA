import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected internal operational routes that require official authentication
const PROTECTED_PREFIXES = [
  '/map',
  '/ai-monitoring',
  '/alerts',
  '/reports',
  '/projects',
  '/ministry',
  '/state',
  '/district',
  '/mp',
  '/dashboard',
  '/simulation',
  '/agencies',
  '/admin',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtected) {
    const token = request.cookies.get('mplads_token')?.value;

    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/map/:path*',
    '/ai-monitoring/:path*',
    '/alerts/:path*',
    '/reports/:path*',
    '/projects/:path*',
    '/ministry/:path*',
    '/state/:path*',
    '/district/:path*',
    '/mp/:path*',
    '/dashboard/:path*',
    '/simulation/:path*',
    '/agencies/:path*',
    '/admin/:path*',
  ],
};
