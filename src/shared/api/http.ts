import type { ZodType } from 'zod';

export type ApiErrorKind = 'network' | 'timeout' | 'unauthenticated' | 'validation' | 'conflict' | 'not-found' | 'server' | 'invalid-response' | 'configuration';
export class ApiError extends Error {
  constructor(public readonly kind: ApiErrorKind, public readonly status?: number) { super(kind); }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  token?: string;
  body?: unknown;
  signal?: AbortSignal;
}

async function request<T>(path: string, options: RequestOptions, consume: (response: Response) => Promise<T>): Promise<T> {
  const base = import.meta.env.VITE_API_BASE_URL;
  if (!base) throw new ApiError('configuration');
  const controller = new AbortController();
  let timedOut = false;
  const forwardAbort = () => controller.abort();
  if (options.signal?.aborted) controller.abort();
  options.signal?.addEventListener('abort', forwardAbort, { once: true });
  const timer = setTimeout(() => { timedOut = true; controller.abort(); }, 10000);
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;
  if (options.body !== undefined) headers['Content-Type'] = 'application/json';
  try {
    const response = await fetch(`${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`, {
      method: options.method ?? 'GET', headers, signal: controller.signal,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      cache: 'no-store', credentials: 'omit',
    });
    if (!response.ok) {
      const kind = response.status === 401 ? 'unauthenticated'
        : response.status === 400 || response.status === 422 ? 'validation'
          : response.status === 404 ? 'not-found' : response.status === 409 ? 'conflict' : 'server';
      throw new ApiError(kind, response.status);
    }
    return await consume(response);
  } catch (error) {
    if (options.signal?.aborted) throw new DOMException('Request cancelled', 'AbortError');
    if (timedOut) throw new ApiError('timeout');
    if (error instanceof ApiError) throw error;
    throw new ApiError(timedOut ? 'timeout' : 'network');
  } finally {
    clearTimeout(timer);
    options.signal?.removeEventListener('abort', forwardAbort);
  }
}

export async function requestJson<T>(path: string, schema: ZodType<T>, options: RequestOptions = {}): Promise<T> {
  return request(path, options, async response => {
    let body: unknown;
    try { body = await response.json(); } catch { throw new ApiError('invalid-response'); }
    const parsed = schema.safeParse(body);
    if (!parsed.success) throw new ApiError('invalid-response');
    return parsed.data;
  });
}

export async function requestVoid(path: string, options: RequestOptions = {}): Promise<void> { await request(path, options, async () => undefined); }

export function connectionMessage(error: unknown): string {
  if (error instanceof ApiError && error.kind === 'timeout') return 'La conexión está tardando más de lo esperado. Vuelve a intentarlo.';
  if (error instanceof ApiError && error.kind === 'validation') return 'No pudimos consultar ese período. Elige otro mes e inténtalo de nuevo.';
  return 'No pudimos cargar tu información. Revisa tu conexión y vuelve a intentarlo.';
}
