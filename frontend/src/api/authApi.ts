import { axiosInstance } from "./axiosInstance";
import { API_ROUTES } from "./apiRoutes";
import type { UserRole, LoginPayload, LoginResponse, LogoutResponse } from "../types/auth";

export const loginUserApi = async (
  role: UserRole,
  payload: LoginPayload
): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(API_ROUTES.AUTH.LOGIN, {
    email: payload.email,
    password: payload.password,
    role: role.toUpperCase(), 
  });
  return response.data;
};

export const logoutUserApi = async (): Promise<LogoutResponse> => {
  const response = await axiosInstance.post<LogoutResponse>(API_ROUTES.AUTH.LOGOUT);
  return response.data;
};

export const forgotPasswordApi = async (email: string, role?: string): Promise<{ success: boolean; message: string; data: null }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string; data: null }>(API_ROUTES.AUTH.FORGOT_PASSWORD, {
    email,
    role: role ? role.toUpperCase() : undefined,
  });
  return response.data;
};

export const verifyOtpApi = async (email: string, otp: string, role?: string): Promise<{ success: boolean; message: string; data: { resetToken: string } }> => {
  const response = await axiosInstance.post<{ success: boolean; message: string; data: { resetToken: string } }>(API_ROUTES.AUTH.VERIFY_OTP, {
    email,
    otp,
    role: role ? role.toUpperCase() : undefined,
  });
  return response.data;
};

export const resetPasswordApi = async (email: string, passwordHex: string, resetToken: string, role?: string): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(API_ROUTES.AUTH.RESET_PASSWORD, {
    email,
    password: passwordHex,
    resetToken,
    role: role ? role.toUpperCase() : undefined,
  });
  return response.data;
};
