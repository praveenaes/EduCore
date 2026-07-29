import { axiosInstance } from "./axiosInstance";
import type { UserRole, LoginPayload, LoginResponse, LogoutResponse } from "../types/auth";

export const loginUserApi = async (
  role: UserRole,
  payload: LoginPayload
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("/auth/login", {
    email: payload.email,
    password: payload.password,
    role: role.toUpperCase(), 
  });
  return response.data;
};

export const logoutUserApi = async (): Promise<LogoutResponse> => {
  const response = await axiosInstance.post<LogoutResponse>("/auth/logout");
  return response.data;
};

export const forgotPasswordApi = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string }>("/auth/forgot-password", { email });
  return response.data;
};

export const verifyOtpApi = async (email: string, otp: string): Promise<{ success: boolean; message: string; resetToken: string }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string; resetToken: string }>("/auth/verify-otp", { email, otp });
  return response.data;
};

export const resetPasswordApi = async (email: string, passwordHex: string, resetToken: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>("/auth/reset-password", { email, password: passwordHex, resetToken });
  return response.data;
};
