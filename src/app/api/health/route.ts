export const dynamic='force-dynamic';

/** Liveness only: no CMS request, visitor data or private configuration. */
export async function GET() {
  return Response.json({status:'ok',release:process.env.RELEASE_ID||process.env.VERCEL_GIT_COMMIT_SHA||'unknown'},
    {headers:{'Cache-Control':'no-store','X-Robots-Tag':'noindex'}});
}
