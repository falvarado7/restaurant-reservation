import ky from "ky";

export class ApiError extends Error {
    status: number;
    payload?: any;
    constructor(message: string, status: number, payload?: any) {
        super(message);
        this.name = "Error";
        this.status = status;
        this.payload = payload;
    }
}

const base =
    (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/+$/, "") ||
    "http://localhost:5001";

export const api = ky.create({
    prefixUrl: base,
    retry: 0,
    cache: "no-store",
    headers: { "Cache-Control": "no-cache" },
    throwHttpErrors: false,
});


export async function requestJson<T>(p: Promise<Response>): Promise<T> {
    const res = await p;

    // Try to parse JSON if provided; otherwise capture text (useful for HTML error pages)
    const contentType = res.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");

    let payload: any = {};
    try {
        payload = isJson ? await res.json() : { message: await res.text() };
    } catch {
        payload = {};
    }

    if (!res.ok) {
        const msg = payload?.error || payload?.message || `HTTP ${res.status}`;
        throw new ApiError(msg, res.status, payload);
    }

    if (res.status === 204) return undefined as T;
    return (payload?.data ?? payload) as T;
}