import { NextRequest, NextResponse } from 'next/server';


/**
 * Detect locale from Accept-Language header
 */
function detectLocaleFromHeader(acceptLanguage: string | null): string {
  if (!acceptLanguage) return 'en';
  
  const languages = acceptLanguage.toLowerCase().split(',')
    .map(lang => lang.split(';')[0].trim());
  
  for (const lang of languages) {
    if (lang.startsWith('zh')) return 'zh';
  }
  
  return 'en';
}



function localeUrl(request: NextRequest, pathname: string) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  return url;
}

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
  // CLEAN ENGLISH LOCALE REDIRECTS
  // ============================================
  if (pathname === '/en' || pathname.startsWith('/en/')) {
    const newPath = pathname.replace(/^\/en/, '') || '/';
    const url = request.nextUrl.clone();
    url.pathname = newPath;
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // LOCALE-AWARE BLOG & MARKETING REDIRECTS
  // ============================================

  // /blog-post?slug=xxx → /[locale]/blog/xxx
  if (pathname === '/blog-post' && searchParams.has('slug')) {
    const slug = searchParams.get('slug');
    const locale = request.cookies.get('NEXT_LOCALE')?.value === 'zh' ? 'zh' : 'en';
    const url = request.nextUrl.clone();
    url.pathname = locale === 'zh' ? `/zh/blog/${slug}` : `/blog/${slug}`;
    url.searchParams.delete('slug');
    return NextResponse.redirect(url, { status: 301 });
  }

  // /marketing-project?slug=xxx → /[locale]/portfolio/marketing-in-motion/xxx
  if (pathname === '/marketing-project' && searchParams.has('slug')) {
    const slug = searchParams.get('slug');
    const locale = request.cookies.get('NEXT_LOCALE')?.value === 'zh' ? 'zh' : 'en';
    const url = request.nextUrl.clone();
    url.pathname = locale === 'zh' ? `/zh/portfolio/marketing-in-motion/${slug}` : `/portfolio/marketing-in-motion/${slug}`;
    url.searchParams.delete('slug');
    return NextResponse.redirect(url, { status: 301 });
  }

  // LEGACY: /zh/blog-post?slug=xxx → /zh/blog/xxx
  if (pathname === '/zh/blog-post' && searchParams.has('slug')) {
    const slug = searchParams.get('slug');
    const url = request.nextUrl.clone();
    url.pathname = `/zh/blog/${slug}`;
    url.searchParams.delete('slug');
    return NextResponse.redirect(url, { status: 301 });
  }

  // LEGACY: /zh/marketing-project?slug=xxx → /zh/portfolio/marketing-in-motion/xxx
  if (pathname === '/zh/marketing-project' && searchParams.has('slug')) {
    const slug = searchParams.get('slug');
    const url = request.nextUrl.clone();
    url.pathname = `/zh/portfolio/marketing-in-motion/${slug}`;
    url.searchParams.delete('slug');
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // STRIP ONLY PROBLEMATIC SLUG PARAM
  // ============================================
  if (searchParams.has('slug') && (pathname.includes('/blog') || pathname.includes('/portfolio'))) {
    const url = request.nextUrl.clone();
    url.searchParams.delete('slug');
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // LEGACY ROUTE REDIRECTS - ENGLISH
  // ============================================

  if (pathname === '/marketing-plan') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/marketing-plans';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname === '/business-plan') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/business-plans';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname === '/coding-projects') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/coding-projects';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname.startsWith('/coding-projects/')) {
    const slug = pathname.replace('/coding-projects/', '');
    const url = request.nextUrl.clone();
    url.pathname = `/portfolio/coding-projects/${slug}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname === '/photography') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/photography';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname === '/amv-editing') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/amv-editing';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname === '/marketing-in-motion') {
    const url = request.nextUrl.clone();
    url.pathname = '/portfolio/marketing-in-motion';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname.startsWith('/marketing-in-motion/')) {
    const slug = pathname.replace('/marketing-in-motion/', '');
    const url = request.nextUrl.clone();
    url.pathname = `/portfolio/marketing-in-motion/${slug}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // LEGACY ROUTE REDIRECTS - CHINESE /zh/
  // ============================================

  if (pathname === '/zh/marketing-plan') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/marketing-plans';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname === '/zh/business-plan') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/business-plans';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname === '/zh/coding-projects') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/coding-projects';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname.startsWith('/zh/coding-projects/')) {
    const slug = pathname.replace('/zh/coding-projects/', '');
    const url = request.nextUrl.clone();
    url.pathname = `/zh/portfolio/coding-projects/${slug}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname === '/zh/photography') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/photography';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname === '/zh/amv-editing') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/amv-editing';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname === '/zh/marketing-in-motion') {
    const url = request.nextUrl.clone();
    url.pathname = '/zh/portfolio/marketing-in-motion';
    return NextResponse.redirect(url, { status: 301 });
  }

  if (pathname.startsWith('/zh/marketing-in-motion/')) {
    const slug = pathname.replace('/zh/marketing-in-motion/', '');
    const url = request.nextUrl.clone();
    url.pathname = `/zh/portfolio/marketing-in-motion/${slug}`;
    return NextResponse.redirect(url, { status: 301 });
  }

  // ============================================
  // LOCALE ROUTING WITH /[locale]/ STRUCTURE
  // ============================================

  if (pathname === '/zh' || pathname.startsWith('/zh/')) {
    return NextResponse.next();
  }

  // Root path: detect preferred locale
  if (pathname === '/') {
    const languageCookie = request.cookies.get('NEXT_LOCALE')?.value;

    // User has saved preference
    if (languageCookie === 'zh') {
      return NextResponse.redirect(localeUrl(request, '/zh'));
    }

    // Try to detect from browser language
    const acceptLanguage = request.headers.get('accept-language');
    const detectedLocale = detectLocaleFromHeader(acceptLanguage);

    if (languageCookie !== 'en' && detectedLocale === 'zh') {
      const response = NextResponse.redirect(localeUrl(request, '/zh'));
      response.cookies.set('NEXT_LOCALE', 'zh', {
        maxAge: 365 * 24 * 60 * 60,
        path: '/',
        sameSite: 'lax',
      });
      return response;
    }

    return NextResponse.rewrite(localeUrl(request, '/en'));
  }

  // Handle any other non-locale paths
  if (pathname !== '/' && !pathname.startsWith('/.')) {
    return NextResponse.rewrite(localeUrl(request, `/en${pathname}`));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
