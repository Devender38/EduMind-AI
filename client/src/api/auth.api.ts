import api from "./axios";

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  role: "student" | "admin" | "premium" | "guest" | string;
  avatar?: string;
  bio?: string;
  phone?: string;
  country?: string;
  timezone?: string;
  isVerified: boolean;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  accessToken?: string;
  user: UserProfile;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  name: string;
  username?: string;
  email: string;
  password: string;
  confirmPassword?: string;
}

export interface SessionItem {
  id: string;
  browser: string;
  os: string;
  device: string;
  ipAddress: string;
  lastUsedAt: string;
  createdAt: string;
  isCurrentSession: boolean;
}

export interface LoginHistoryItem {
  ip: string;
  browser: string;
  os: string;
  device: string;
  loginAt: string;
  status: "success" | "failed" | "locked";
}

export interface SessionsResponse {
  success: boolean;
  sessions: SessionItem[];
  loginHistory: LoginHistoryItem[];
}

// ===================================
// Auth API Endpoints
// ===================================

export const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/login", data);
  return res.data;
};

export const registerUser = async (data: RegisterPayload): Promise<AuthResponse> => {
  const res = await api.post<AuthResponse>("/auth/register", data);
  return res.data;
};

export const logoutUser = async (): Promise<void> => {
  await api.post("/auth/logout");
};

export const logoutAllDevices = async (): Promise<void> => {
  await api.post("/auth/logout-all");
};

export const refreshAccessToken = async (): Promise<string> => {
  const res = await api.post<{ success: boolean; accessToken: string }>("/auth/refresh");
  return res.data.accessToken;
};

export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post("/auth/forgot-password", { email });
  return res.data;
};

export const resetPassword = async (data: {
  token: string;
  password: string;
  confirmPassword?: string;
}): Promise<{ success: boolean; message: string }> => {
  const res = await api.post("/auth/reset-password", data);
  return res.data;
};

export const verifyEmail = async (token: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post("/auth/verify-email", { token });
  return res.data;
};

export const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
  const res = await api.post("/auth/resend-verification", { email });
  return res.data;
};

export const getActiveSessions = async (): Promise<SessionsResponse> => {
  const res = await api.get<SessionsResponse>("/auth/sessions");
  return res.data;
};

export const revokeSession = async (sessionId: string): Promise<void> => {
  await api.delete(`/auth/sessions/${sessionId}`);
};

export const deleteAccount = async (password?: string): Promise<void> => {
  await api.delete("/auth/account", { data: { password } });
};
