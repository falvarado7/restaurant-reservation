import ky from "ky";

export const api = ky.create({
    prefixUrl: import.meta.env.VITE_API_BASE || "/api",
    // no afterResponse hook; we'll parse explicitly per request
});

// Generic request that unwraps `{ data }`, and handles 204
export async function requestJson<T>(p: Promise<Response>): Promise<T> {
    const res = await p;
    if (res.status === 204) return undefined as T;
    const json = await res.json().catch(() => ({}));
    if (json?.error) throw new Error(json.error);
    return (json?.data ?? json) as T;
}