import axios from "axios";
import { store } from "../app/store";
import { clearUser } from "../app/slices/authSlice";
import { clearOrganization } from "../app/slices/organizationSlice";

import { tokenService } from "../utils/tokenService";

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error & unauthorized session handling

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as any;

    // If backend returns 401 Unauthorized, try to refresh the token
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.endsWith("/auth/login") &&
      !originalRequest.url?.endsWith("/auth/refresh")
    ) {
      originalRequest._retry = true;

      try {
        // Call the refresh endpoint
        const response = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        tokenService.setToken(accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        store.dispatch(clearUser());
        store.dispatch(clearOrganization());
        tokenService.clearToken();
        return Promise.reject(refreshError);
      }
    }

    const errorMessage =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred.";

    console.error("API Global Error:", errorMessage);

    return Promise.reject(error);
  }
);
export default axiosInstance;
