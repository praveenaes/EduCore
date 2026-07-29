import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { UserInfo } from "../../types/auth";
import { tokenService } from "../../utils/tokenService";
import { loginUser, loadUser } from "../authThunk";

interface AuthState {
  user: UserInfo | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  accessToken: tokenService.getToken(),
  isAuthenticated: false,
  isLoading: true,
  loading: false,
  error: null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserInfo>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.loading = false;
      state.error = null;
    },
    clearUser: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.loading = false;
      state.error = null;
      tokenService.clearToken();
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
      state.loading = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateUserEmail: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.email = action.payload;
      }
    },
    updateUserProfilePhoto: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.photo = action.payload;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.accessToken;
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(loadUser.pending, (state) => {
        state.isLoading = true;
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.accessToken = tokenService.getToken();
        state.error = null;
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.accessToken = null;
      });
  },
});

export const { setUser, clearUser, setLoading, clearError, updateUserEmail, updateUserProfilePhoto } = authSlice.actions;
export default authSlice.reducer;