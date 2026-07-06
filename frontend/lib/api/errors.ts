export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly operation?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Network request failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message = 'Request timed out') {
    super(message);
    this.name = 'TimeoutError';
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError;
}

export function isNetworkError(err: unknown): err is NetworkError {
  return err instanceof NetworkError;
}

export function isTimeoutError(err: unknown): err is TimeoutError {
  return err instanceof TimeoutError;
}

export function classifyError(err: unknown): 'api' | 'network' | 'timeout' | 'unknown' {
  if (isApiError(err)) return 'api';
  if (isTimeoutError(err)) return 'timeout';
  if (isNetworkError(err)) return 'network';
  if (err instanceof Error && err.name === 'AbortError') return 'timeout';
  return 'unknown';
}
