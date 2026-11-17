import { INTELLIGENCE_ENDPOINTS } from '@/lib/intelligence-endpoints';
export const dynamic = 'force-dynamic';
export async function GET(_request: Request, context: { params: Promise<{dataset: string}> }) {
  const { dataset } = await context.params;
  if (!Object.hasOwn(INTELLIGENCE_ENDPOINTS, dataset)) return Response.json({error:'Unknown intelligence dataset'},{status:404});
  const base = process.env.INTELLIGENCE_API_URL;
  const token = process.env.INTELLIGENCE_TOKEN;
  if (!base || !token) return Response.json({error:'Intelligence service is not running. Open the updated J&J Equity desktop app.'},{status:503});
  try {
    const response = await fetch(base + INTELLIGENCE_ENDPOINTS[dataset], { headers:{'x-worldmonitor-local-token':token},cache:'no-store',signal:AbortSignal.timeout(45000) });
    if (!response.ok) return Response.json({error: response.status === 401 || response.status === 403 ? 'This feed requires provider access or credentials.' : 'The upstream feed is temporarily unavailable.'},{status:response.status === 401 || response.status === 403 ? 403 : 502});
    return Response.json({ data:await response.json(), fetchedAt:Date.now() }, {headers:{'cache-control':'no-store'}});
  } catch { return Response.json({error:'Intelligence feed timed out. Existing data will remain visible while it reconnects.'},{status:502}); }
}
