import { handleUnauthorizedResponse } from '@/services/auth-redirect';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface HttpRequestOptions extends Omit<RequestInit, 'body' | 'headers' | 'method'> {
  token?: string | null;
  headers?: HeadersInit;
  body?: BodyInit | Record<string, unknown> | null;
}

export interface HttpRequestResult<T> {
  response: Response;
  data: T | null;
  unauthorized: boolean;
}

interface ParsedBodyResult {
  body: BodyInit | undefined;
  contentType: string | undefined;
}

const apiHost = import.meta.env.VITE_API_HOST ?? 'http://localhost:8001/';

export function buildApiUrl(path: string) {
  return new URL(path, apiHost).toString();
}

function parseBody(body: BodyInit | Record<string, unknown> | null | undefined): ParsedBodyResult {
  if (body === null || body === undefined) {
    return { body: undefined, contentType: undefined };
  }

  if (body instanceof FormData || body instanceof URLSearchParams || body instanceof Blob) {
    return { body, contentType: undefined };
  }

  if (typeof body === 'string') {
    return { body, contentType: 'text/plain;charset=UTF-8' };
  }

  return {
    body: JSON.stringify(body),
    contentType: 'application/json',
  };
}

async function parseResponse<T>(response: Response): Promise<T | null> {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) {
    const text = await response.text().catch(() => '');
    return (text ? (text as T) : null) ?? null;
  }

  const text = await response.text().catch(() => '');
  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text) as T;
}

export async function requestJson<T>(
  method: HttpMethod,
  path: string,
  options: HttpRequestOptions = {},
): Promise<HttpRequestResult<T>> {
  const { body: rawBody, token, headers: customHeaders, ...requestOptions } = options;
  const { body, contentType } = parseBody(rawBody);
  const headers = new Headers(customHeaders);
  headers.set('Accept', 'application/json');
  if (contentType) {
    headers.set('Content-Type', contentType);
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const requestInit: RequestInit = {
    ...requestOptions,
    method,
    headers,
  };

  if (body !== undefined) {
    requestInit.body = body;
  }

  const response = await fetch(buildApiUrl(path), requestInit);

  const unauthorized = handleUnauthorizedResponse(response, options.token ?? null);
  const data = await parseResponse<T>(response);

  return { response, data, unauthorized };
}

export const http = {
  get<T>(path: string, options?: HttpRequestOptions) {
    return requestJson<T>('GET', path, options);
  },
  post<T>(path: string, options?: HttpRequestOptions) {
    return requestJson<T>('POST', path, options);
  },
  put<T>(path: string, options?: HttpRequestOptions) {
    return requestJson<T>('PUT', path, options);
  },
  patch<T>(path: string, options?: HttpRequestOptions) {
    return requestJson<T>('PATCH', path, options);
  },
  delete<T>(path: string, options?: HttpRequestOptions) {
    return requestJson<T>('DELETE', path, options);
  },
};
