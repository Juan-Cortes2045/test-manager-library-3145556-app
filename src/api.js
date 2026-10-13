// Thin client for api-contract.md: Bearer token, JSON, single error body {code, message, details}.
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

export async function api(path, { method = 'GET', token, body } = {}) {
  const res = await fetch(BASE + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error(data?.message ?? `Error ${res.status}`);
  return data;
}
