declare var process: { env: Record<string, string | undefined> };

import type { ApiResponse } from "./types.js";

export function jsonResponse<T>(
  data: T,
  status: number = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  const requestId = crypto.randomUUID();
  const body: ApiResponse<T> = {
    success: status < 400,
    data,
    meta: { requestId, timestamp: new Date().toISOString() },
  };

  if (status >= 400) {
    delete (body as unknown as Record<string, unknown>).data;
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "X-Request-ID": requestId,
      ...extraHeaders,
    },
  });
}

export function errorResponse(
  code: string,
  message: string,
  status: number = 500,
  details?: Record<string, unknown>
): Response {
  const requestId = crypto.randomUUID();
  const body: ApiResponse<never> = {
    success: false,
    error: { code, message, details },
    meta: { requestId, timestamp: new Date().toISOString() },
  };

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Request-ID": requestId,
  };

  if (details?.retryAfter) {
    headers["Retry-After"] = String(details.retryAfter);
  }

  return new Response(JSON.stringify(body), { status, headers });
}

export function corsResponse(methods: string): Response {
  const origins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",").map((s) => s.trim())
    : ["http://localhost:5173", "http://localhost:4173"];

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origins[0],
      "Access-Control-Allow-Methods": methods,
      "Access-Control-Allow-Headers": "Content-Type, X-Session-Id",
      "Access-Control-Max-Age": "86400",
    },
  });
}
