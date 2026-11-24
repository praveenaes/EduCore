import { createAsyncThunk } from "@reduxjs/toolkit";
import type { UserInfo, UserRole, LoginPayload } from "../types/auth";
import { loginUserApi } from "../api/authApi";
import { axiosInstance } from "../api/axiosInstance";
import { tokenService } from "../utils/tokenService";
import { API_ROUTES } from "../api/apiRoutes";

export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (
    payload: { role: UserRole; credentials: LoginPayload },
    { rejectWithValue }
  ) => {
    try {
      const response = await loginUserApi(payload.role, payload.credentials);
      if (response.success && response.data) {
        const mappedUser: UserInfo = {
          id: response.data.user.id,
          email: response.data.user.email,
          name: response.data.user.name,
          role: response.data.user.role.toLowerCase() as UserRole,
          photo: response.data.user.photo,
        };
        tokenService.setToken(response.data.accessToken);
        return {
          accessToken: response.data.accessToken,
          user: mappedUser,
        };
      } else {
        return rejectWithValue(response.message || "Login failed");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Login failed";
      return rejectWithValue(errorMessage);
    }
  }
);

export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(API_ROUTES.AUTH.ME);
      if (response.data?.success && response.data?.data?.user) {
        const user = response.data.data.user;
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
