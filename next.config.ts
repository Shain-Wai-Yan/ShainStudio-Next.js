import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent clickjacking (Lighthouse: "Mitigate clickjacking with XFO or CSP")
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Prevent MIME-sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Strict referrer for privacy
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions policy
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // Strong HSTS (Lighthouse: "Use a strong HSTS policy")
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // COOP — allow-popups keeps Google OAuth / Analytics working
  // (Lighthouse: "Ensure proper origin isolation with COOP")
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // Basic CSP in report-only mode so 3rd-party scripts (GA, Clarity) are not broken
  // Switch to enforcing once you have verified no violations in DevTools
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://cdn.clarity.ms",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://www.shainwaiyan.com https://api.shainwaiyan.com https://backend-cms-89la.onrender.com https://personal-cms-backup.onrender.com https://i.ytimg.com https://yt3.googleusercontent.com https://yt3.ggpht.com https://via.placeholder.com",
      "connect-src 'self' https://api.shainwaiyan.com https://backend-cms-89la.onrender.com https://personal-cms-backup.onrender.com https://www.google-analytics.com https://www.clarity.ms",
      "frame-src 'self' https://www.youtube.com",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Don't expose source maps in production (Best Practices audit)
  productionBrowserSourceMaps: false,

  turbopack: {},

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/:path((?!en$|en/|zh$|zh/|api/|_next/|images/|favicon.ico)[^/]+.*)',
        destination: '/en/:path',
      },
      {
        source: '/',
        destination: '/en',
      },
    ];
  },

  images: {
    // Next.js built-in optimizer handles local public assets (logo, profile, etc.)
    // Cloudinary images use the custom loader via prop on individual <Image> components.
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'api.shainwaiyan.com' },
      { protocol: 'https', hostname: 'backend-cms-89la.onrender.com' },
      { protocol: 'https', hostname: 'personal-cms-backup.onrender.com' },
      { protocol: 'https', hostname: 'yt3.googleusercontent.com' },
      { protocol: 'https', hostname: 'yt3.ggpht.com' },
      { protocol: 'https', hostname: 'i.ytimg.com' },
      { protocol: 'https', hostname: '*.ytimg.com' },
      { protocol: 'https', hostname: 'via.placeholder.com' },
    ],
  },
};

export default nextConfig;
