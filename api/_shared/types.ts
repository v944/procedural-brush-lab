export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: Record<string, unknown> };
  meta: { requestId: string; timestamp: string };
}

export interface SessionData {
  sessionId: string;
  tier: "free" | "pro" | "lifetime";
  createdAt: string;
  lastActive: string;
}
