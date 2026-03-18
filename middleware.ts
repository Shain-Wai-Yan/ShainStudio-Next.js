import { NextRequest, NextResponse } from 'next/server';
import { detectLocaleFromHeader, normalizeLocale } from '@/lib/i18n';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const searchParams = request.nextUrl.searchParams;

  // Skip middleware for API routes, static files, and favicon
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // ============================================
  // BLOG REDIRECT: /blog-post?slug=xxx → /blog/xxx
  // ============================================
  if (pathname === '/blog-post' && searchParams.has('slug')) {
    const slug = searchParams.get('slug');
    const url = request.nextUrl.clone();
    url.pathname = `/blog/${slug}`;
    url.searchParams.delete('slug'); // Remove slug param, PRESERVE utm params
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // MARKETING PROJECT REDIRECT: /marketing-project?slug=xxx → /portfolio/marketing-in-motion/xxx
  // ============================================
  if (pathname === '/marketing-project' && searchParams.has('slug')) {
    const slug = searchParams.get('slug');
    const url = request.nextUrl.clone();
    url.pathname = `/portfolio/marketing-in-motion/${slug}`;
    url.searchParams.delete('slug'); // Remove slug param, PRESERVE utm params
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // CHINESE BLOG REDIRECT: /zh/blog-post?slug=xxx → /zh/blog/xxx
  // ============================================
  if (pathname === '/zh/blog-post' && searchParams.has('slug')) {
    const slug = searchParams.get('slug');
    const url = request.nextUrl.clone();
    url.pathname = `/zh/blog/${slug}`;
    url.searchParams.delete('slug'); // Remove slug param, PRESERVE utm params
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // CHINESE MARKETING PROJECT REDIRECT: /zh/marketing-project?slug=xxx → /zh/portfolio/marketing-in-motion/xxx
  // ============================================
  if (pathname === '/zh/marketing-project' && searchParams.has('slug')) {
    const slug = searchParams.get('slug');
    const url = request.nextUrl.clone();
    url.pathname = `/zh/portfolio/marketing-in-motion/${slug}`;
    url.searchParams.delete('slug'); // Remove slug param, PRESERVE utm params
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // STRIP ONLY PROBLEMATIC SLUG PARAM (Keep UTM tracking!)
  // ============================================
  // Only remove the "slug" query param that causes double-slug issue
  // PRESERVE utm_source, utm_medium, utm_campaign, etc. for marketing tracking
  if (searchParams.has('slug') && (pathname.startsWith('/blog') || pathname.startsWith('/portfolio') || pathname.startsWith('/zh/blog') || pathname.startsWith('/zh/portfolio'))) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('slug'); // Only delete the problematic slug param
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // LEGACY ROUTE REDIRECTS - ENGLISH (handled here instead of vercel.json)
  // ============================================
  
  // /marketing-plan → /portfolio/marketing-plans
  if (pathname === '/marketing-plan') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/marketing-plans';
    // PRESERVE query params (utm_source, utm_medium, etc.)
    return NextResponse.redirect(url, { status: 301 });
  }

  // /business-plan → /portfolio/business-plans
  if (pathname === '/business-plan') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/business-plans';
    // PRESERVE query params (utm_source, utm_medium, etc.)
    return NextResponse.redirect(url, { status: 301 });
  }

  // /coding-projects → /portfolio/coding-projects
  if (pathname === '/coding-projects') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/coding-projects';
    return NextResponse.redirect(url, { status: 301 });
  }

  // /photography → /portfolio/photography
  if (pathname === '/photography') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/photography';
    return NextResponse.redirect(url, { status: 301 });
  }

  // /amv-editing → /portfolio/amv-editing
  if (pathname === '/amv-editing') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/amv-editing';
    return NextResponse.redirect(url, { status: 301 });
  }

  // /marketing-in-motion → /portfolio/marketing-in-motion
  if (pathname === '/marketing-in-motion') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/marketing-in-motion';
    return NextResponse.redirect(url, { status: 301 });
  }

  // /marketing-in-motion/:slug → /portfolio/marketing-in-motion/:slug
  if (pathname.startsWith('/marketing-in-motion/')) {
    const slug = pathname.replace('/marketing-in-motion/', '');
    const url = request.nextUrl.clone();
    url.pathname = `/portfolio/marketing-in-motion/${slug}`;
    // PRESERVE query params (utm_source, utm_medium, etc.)
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // LEGACY ROUTE REDIRECTS - CHINESE /zh/ (handled here instead of vercel.json)
  // ============================================
  
  // /zh/marketing-plan → /zh/portfolio/marketing-plans
  if (pathname === '/zh/marketing-plan') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/marketing-plans';
    // PRESERVE query params (utm_source, utm_medium, etc.)
    return NextResponse.redirect(url, { status: 301 });
  }

  // /zh/business-plan → /zh/portfolio/business-plans
  if (pathname === '/zh/business-plan') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/business-plans';
    // PRESERVE query params (utm_source, utm_medium, etc.)
    return NextResponse.redirect(url, { status: 301 });
  }

  // /zh/coding-projects → /zh/portfolio/coding-projects
  if (pathname === '/zh/coding-projects') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/coding-projects';
    return NextResponse.redirect(url, { status: 301 });
  }

  // /zh/photography → /zh/portfolio/photography
  if (pathname === '/zh/photography') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/photography';
    return NextResponse.redirect(url, { status: 301 });
  }

  // /zh/amv-editing → /zh/portfolio/amv-editing
  if (pathname === '/zh/amv-editing') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/amv-editing';
    return NextResponse.redirect(url, { status: 301 });
  }

  // /zh/marketing-in-motion → /zh/portfolio/marketing-in-motion
  if (pathname === '/zh/marketing-in-motion') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/marketing-in-motion';
    return NextResponse.redirect(url, { status: 301 });
  }

  // /zh/marketing-in-motion/:slug → /zh/portfolio/marketing-in-motion/:slug
  if (pathname.startsWith('/zh/marketing-in-motion/')) {
    const slug = pathname.replace('/zh/marketing-in-motion/', '');
    const url = request.nextUrl.clone();
    url.pathname = `/zh/portfolio/marketing-in-motion/${slug}`;
    // PRESERVE query params (utm_source, utm_medium, etc.)
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // CHINESE LOCALE ROUTING
  // ============================================
  
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
        sameSite: 'lax',
      });
      return response;
    }

    // Set English locale cookie
    const response = NextResponse.next();
    response.cookies.set('NEXT_LOCALE', 'en', {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
      sameSite: 'lax',
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