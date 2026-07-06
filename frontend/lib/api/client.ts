import { ApiError, NetworkError, TimeoutError } from './errors';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
  signal?: AbortSignal;
}

async function apiRequest<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = 'GET', body, timeoutMs = 30000, signal: externalSignal } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  // Merge external signal if provided
  if (externalSignal) {
    externalSignal.addEventListener('abort', () => controller.abort());
  }

  const url = `${BASE_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Future: Add Authorization: Bearer <access_token> here
  // const session = await supabase.auth.getSession();
  // if (session.data.session?.access_token) {
  //   headers['Authorization'] = `Bearer ${session.data.session.access_token}`;
  // }

  try {
    const response = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const errBody = await response.json();
        message = errBody?.detail ?? errBody?.message ?? message;
      } catch {
        // ignore parse error
      }
      throw new ApiError(response.status, message, path);
    }

    return (await response.json()) as T;
  } catch (err) {
    clearTimeout(timer);

    if (err instanceof ApiError) throw err;

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        throw new TimeoutError(`Request to ${path} timed out after ${timeoutMs}ms`);
      }
      if (err.message.includes('fetch') || err.message.includes('network')) {
        throw new NetworkError(err.message);
      }
      throw new NetworkError(err.message);
    }

    throw new NetworkError('Unknown error');
  }
}

export const apiClient = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body: unknown, options?: Omit<RequestOptions, 'method'>) =>
    apiRequest<T>(path, { ...options, method: 'POST', body }),
};
