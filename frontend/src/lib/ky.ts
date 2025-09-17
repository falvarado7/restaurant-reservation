import ky from "ky";

const base =
  (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, "") ||
  "http://localhost:5001";

export const api = ky.create({
  prefixUrl: base,
  retry: 0,
  cache: "no-store",
  headers: { "Cache-Control": "no-cache" },
});


export async function requestJson<T>(p: Promise<Response>): Promise<T> {
  const res = await p;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} ${res.statusText} — ${text}`);
  }
  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => ({}));
  if (json?.error) throw new Error(json.error);
  return (json?.data ?? json) as T;
}