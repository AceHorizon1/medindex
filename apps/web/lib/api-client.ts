const API_URL = process.env.MEDINDEX_API_URL ?? '/api';

type FetchOptions = RequestInit & { query?: Record<string, string | number | undefined> };

export async function apiFetch<T>(path: string, { query, ...options }: FetchOptions = {}): Promise<T> {
  const url = new URL(`${API_URL}${path}`);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}
