import { NextRequest, NextResponse } from 'next/server';
import { detectLocaleFromHeader, normalizeLocale } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes, static files, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // If already has /zh in path, continue
  if (pathname.startsWith('/zh')) {
    return NextResponse.next();
  }

  // For root path, check for language preference
  if (pathname === '/') {
    const languageCookie = request.cookies.get('NEXT_LOCALE')?.value;
    
    if (languageCookie === 'zh') {
      // User previously selected Chinese
      return NextResponse.redirect(new URL('/zh', request.url));
    }

    // Auto-detect from Accept-Language header
    const acceptLanguage = request.headers.get('accept-language');
    const detectedLocale = detectLocaleFromHeader(acceptLanguage);

    if (detectedLocale === 'zh') {
      // Set cookie and redirect to Chinese version
      const response = NextResponse.redirect(new URL('/zh', request.url));
      response.cookies.set('NEXT_LOCALE', 'zh', {
        maxAge: 365 * 24 * 60 * 60, // 1 year
        path: '/',
      });
      return response;
    }

    // Set English locale cookie
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', 'en', {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
