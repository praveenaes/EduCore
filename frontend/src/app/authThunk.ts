import { createAsyncThunk } from "@reduxjs/toolkit";
import type { UserInfo, UserRole, LoginPayload } from "../types/auth";
import { loginUserApi } from "../api/authApi";
import { axiosInstance } from "../api/axiosInstance";
import { tokenService } from "../utils/tokenService";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    payload: { role: UserRole; credentials: LoginPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await loginUserApi(payload.role, payload.credentials);
      if (response.success) {
        const mappedUser: UserInfo = {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role.toLowerCase() as UserRole,
          photo: response.user.photo,
        };
        tokenService.setToken(response.accessToken);
        return {
          accessToken: response.accessToken,
          user: mappedUser,
        };
      } else {
        return rejectWithValue(response.message || "Login failed");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/auth/me");
      if (response.data?.success && response.data?.user) {
        const user = response.data.user;
        const mappedUser: UserInfo = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role.toLowerCase() as UserRole,
          photo: user.photo,
        };
        return mappedUser;
      } else {
        tokenService.clearToken();
        return rejectWithValue("Session invalid");
      }
    } catch {
      tokenService.clearToken();
      return rejectWithValue("Session invalid");
    }
  }
);
