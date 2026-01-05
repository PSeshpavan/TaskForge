export type ApiOptions = {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
};

export class ApiError extends Error {
  status: number;
  data: any;
  constructor(status: number, data: any) {
    super(data?.message || `API Error ${status}`);
    this.status = status;
    this.data = data;
  }
}

const BASE = import.meta.env.VITE_API_BASE_URL || "";

export async function apiFetch<T = any>(path: string, opts: ApiOptions = {}): Promise<T> {
  const url = path.startsWith("http") ? path : `${BASE}${path}`;

  const init: RequestInit = {
    method: opts.method ?? "GET",
    headers: { ...(opts.headers || {}) },
    credentials: "include",
  };

  // only set JSON header when we actually send a body
  if (opts.body !== undefined) {
    (init.headers as Record<string, string>)["Content-Type"] = "application/json";
    init.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, init);

  // safely read response (json if possible, else text)
  const contentType = res.headers.get("content-type") || "";
  let data: any = null;

  try {
    if (res.status !== 204) {
      if (contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        data = text ? { message: text } : null;
      }
    }
  } catch {
    // last resort
    const text = await res.text().catch(() => "");
    data = text ? { message: text } : null;
  }

  if (!res.ok) throw new ApiError(res.status, data);
  return data as T;
}
