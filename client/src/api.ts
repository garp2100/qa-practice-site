// client/src/api.ts
const BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

export async function api(path: string, opts: RequestInit = {}) {
    // grab token from localStorage
    const token = localStorage.getItem("token");

    // set headers
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(opts.headers as any),
    };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    // call backend
    const res = await fetch(`${BASE}/api${path}`, { ...opts, headers });

    // error handling
    if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg);
    }

    // assume JSON response
    return res.json();
}