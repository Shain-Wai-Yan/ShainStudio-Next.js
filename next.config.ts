import type { NextConfig } from "next";

const DEFAULT_FORM_WORKER_ORIGIN = 'https://form.shainwaiyan.com';
const isDevelopment = process.env.NODE_ENV === 'development';

function getFormWorkerOrigin() {
  const configuredUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL;
  if (!configuredUrl) return DEFAULT_FORM_WORKER_ORIGIN;

  try {
    const url = new URL(configuredUrl);
    const isLocalDevelopment = isDevelopment
      && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
    return url.protocol === 'https:' || isLocalDevelopment
      ? url.origin
      : DEFAULT_FORM_WORKER_ORIGIN;
  } catch {
    return DEFAULT_FORM_WORKER_ORIGIN;
  }
}

const formWorkerOrigin = getFormWorkerOrigin();

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
  // Enforced CSP. Inline script/style support remains necessary for the current
  // Next.js static output and component-level styles; eval is development-only.
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDevelopment ? " 'unsafe-eval'" : ''} https://www.googletagmanager.com https://www.clarity.ms https://cdn.clarity.ms https://cdn.jsdelivr.net https://cdnjs.cloudflare.com`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://res.cloudinary.com https://www.shainwaiyan.com https://api.shainwaiyan.com https://backend-cms-89la.onrender.com https://personal-cms-backup.onrender.com https://i.ytimg.com https://yt3.googleusercontent.com https://yt3.ggpht.com https://via.placeholder.com",
      `connect-src 'self'${isDevelopment ? ' ws: wss:' : ''} https://api.shainwaiyan.com https://backend-cms-89la.onrender.com https://personal-cms-backup.onrender.com https://res.cloudinary.com ${formWorkerOrigin} https://*.google-analytics.com https://*.analytics.google.com https://*.clarity.ms`,
      "frame-src 'self' https://www.youtube.com",
      "media-src 'self' blob:",
      "worker-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
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

  images: {
    qualities: [65, 75, 88],
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
