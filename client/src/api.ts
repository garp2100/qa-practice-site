// client/src/api.ts
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function api<T = any>(path: string, opts: RequestInit = {}): Promise<T> {
    // grab token from localStorage
    const token = localStorage.getItem("token");

    // set headers
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(opts.headers as any),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // call backend with timeout and credentials
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${BASE}/api${path}`, { ...opts, headers, credentials: "include", signal: controller.signal });

    clearTimeout(timeout);

    // error handling
    if (!res.ok) {
        let errorBody: any;
        try {
            errorBody = await res.json();
        } catch {
            errorBody = await res.text();
        }
        throw new Error(
            `[API ${opts.method || "GET"} ${path}] ${res.status} ${res.statusText} - ${JSON.stringify(errorBody)}`
        );
    }

    // assume JSON response with fallback to text
    const contentType = res.headers.get("content-type");
    if (contentType?.includes("application/json")) {
        try {
            return await res.json() as T;
        } catch {
            return await res.text() as unknown as T;
        }
    }
    return await res.text() as unknown as T;
}