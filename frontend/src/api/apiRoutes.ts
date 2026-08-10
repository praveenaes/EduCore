export const API_ROUTES = {
  AUTH: {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    ME: "/auth/me",
    FORGOT_PASSWORD: "/auth/forgot-password",
    VERIFY_OTP: "/auth/verify-otp",
    RESET_PASSWORD: "/auth/reset-password",
  },
  SETTINGS: {
    ORGANIZATION: "/settings/organization",
    PROFILE: "/settings/profile",
    CHANGE_PASSWORD: "/settings/change-password",
    SEND_EMAIL_OTP: "/settings/change-email/send-otp",
    VERIFY_EMAIL_OTP: "/settings/change-email/verify-otp",
    UPDATE_EMAIL: "/settings/change-email/update",
  },
  STUDENTS: {
    BASE: "/students",
    STATUS: (id: string) => `/students/${id}/status`,
    DETAIL: (id: string) => `/students/${id}`,
    EXPORT: "/students/export/csv",
  },
  TEACHERS: {
    BASE: "/teachers",
    DETAIL: (id: string) => `/teachers/${id}`,
    STATUS: (id: string) => `/teachers/${id}/status`,
    EXPORT: "/teachers/export/csv",
  },
} as const;
