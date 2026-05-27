const BASE_URL = process.env.INSTANCE_URL;
const USER = process.env.INSTANCE_USER;
const PASS = process.env.INSTANCE_PASSWORD;

let cachedAuth: string | null = null;

function authHeader(): string {
  if (!cachedAuth) {
    if (!USER || !PASS) {
      throw new Error("Credenciais do ServiceNow ausentes (INSTANCE_USER / INSTANCE_PASSWORD)");
    }
    cachedAuth = "Basic " + Buffer.from(`${USER}:${PASS}`).toString("base64");
  }
  return cachedAuth;
}

async function request<T>(method: string, endpoint: string, body?: unknown): Promise<T> {
  if (!BASE_URL) {
    throw new Error("INSTANCE_URL ausente no ambiente");
  }

  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: authHeader(),
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`ServiceNow ${method} ${endpoint} falhou: ${res.status} ${text}`);
  }

  return res.json() as Promise<T>;
}

export interface TableResponse<T> {
  result: T;
}

export const serviceNow = {
  get: <T>(endpoint: string) => request<T>("GET", endpoint),
  post: <T>(endpoint: string, body: unknown) => request<T>("POST", endpoint, body),
  patch: <T>(endpoint: string, body: unknown) => request<T>("PATCH", endpoint, body),
};
