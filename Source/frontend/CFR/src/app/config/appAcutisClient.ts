export const GATEWAY_ACUTIS_API_PATH = '/acutis/api/v1/';
export const API_BASE_URL = import.meta.env.VITE_APP_REST_API_BASE_URL || 'https://localhost:5050';

function resolveUrl(endpoint: string): string {
  const origin = String(API_BASE_URL).replace(/\/+$/, '') || 'https://localhost:5050';
  return `${origin}${GATEWAY_ACUTIS_API_PATH}${endpoint.replace(/^\/+/, '')}`;
}

function readField(source: Record<string, unknown>, ...keys: string[]): unknown {
  for (const key of keys) {
    if (source[key] !== undefined && source[key] !== null) return source[key];
  }
  return undefined;
}

function toApiEnvelope(body: unknown, fallbackStatus = 200): Record<string, unknown> {
  if (!body || typeof body !== 'object') {
    return { statusCode: fallbackStatus, statusMessage: '', resultData: body ?? null };
  }
  const source = body as Record<string, unknown>;
  return {
    ...source,
    statusCode: Number(readField(source, 'statusCode', 'StatusCode') ?? fallbackStatus),
    statusMessage: String(readField(source, 'statusMessage', 'StatusMessage') ?? ''),
    resultData: readField(source, 'resultData', 'ResultData') ?? null,
  };
}

async function parseResponse(response: Response): Promise<any> {
  if (response.status === 204) {
    return { statusCode: 204, statusMessage: 'No record found.', resultData: [] };
  }

  const text = await response.text();
  let body: unknown = null;
  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  const envelope = toApiEnvelope(body, response.status);
  if (!response.ok) {
    throw String(envelope.statusMessage || `API error: ${response.status}`);
  }
  return envelope;
}

export async function getApi(endpoint: string, params?: Record<string, string>): Promise<any> {
  const url = new URL(resolveUrl(endpoint), 'https://localhost:5050');
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) url.searchParams.append(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  });

  return parseResponse(response);
}

export async function postApi(endpoint: string, payload: any): Promise<any> {
  const url = new URL(resolveUrl(endpoint), 'https://localhost:5050').toString();

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return parseResponse(response);
}

const appAcutisClient = {
  get: getApi,
  post: postApi,
};

export default appAcutisClient;
