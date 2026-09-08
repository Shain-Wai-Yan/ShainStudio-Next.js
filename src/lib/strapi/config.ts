const DEFAULT_STRAPI_ORIGIN = 'https://api.shainwaiyan.com';

function withoutTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

const configuredApi = process.env.NEXT_PUBLIC_STRAPI_API_URL;
const configuredOrigin = process.env.NEXT_PUBLIC_STRAPI_URL;

export const STRAPI_API_URL = configuredApi
  ? withoutTrailingSlash(configuredApi)
  : `${withoutTrailingSlash(configuredOrigin || DEFAULT_STRAPI_ORIGIN)}/api`;

export const STRAPI_ORIGIN_URL = STRAPI_API_URL.replace(/\/api\/?$/, '');
