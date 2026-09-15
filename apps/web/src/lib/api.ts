import "server-only";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:3000";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface ApiFetchOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  token?: string | null;
}

// Nest sends an empty body (not the literal "null") for a controller that returns null.
function parseJsonBody(text: string): unknown {
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers["Authorization"] = `Bearer ${options.token}`;
  }

  const response = await fetch(`${BACKEND_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
  });

  const body = parseJsonBody(await response.text()) as Record<string, unknown> | null;

  if (!response.ok) {
    const message =
      (Array.isArray(body?.message) ? body.message.join(", ") : (body?.message as string | undefined)) ??
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return body as T;
}
