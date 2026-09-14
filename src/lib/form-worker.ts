export const FORM_WORKER_URL = (
  process.env.NEXT_PUBLIC_CLOUDFLARE_WORKER_URL || 'https://form.shainwaiyan.com'
).replace(/\/+$/, '');
