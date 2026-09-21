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
    CURRICULUM: "/students/me/curriculum",
    STATUS: (id: string) => `/students/${id}/status`,
    DETAIL: (id: string) => `/students/${id}`,
    EXPORT: "/students/export/csv",
  },
  TEACHERS: {
    BASE: "/teachers",
    CURRICULUM: "/teachers/me/curriculum",
    DETAIL: (id: string) => `/teachers/${id}`,
    STATUS: (id: string) => `/teachers/${id}/status`,
    EXPORT: "/teachers/export/csv",
  },
   PROGRAMS: {
    BASE: "/academics/programs",
    DETAIL: (id: string) => `/academics/programs/${id}`,
  },
  COURSES: {
    BASE: "/academics/courses",
    DETAIL: (id: string) => `/academics/courses/${id}`,
  },
  SUBJECTS: {
    BASE: "/academics/subjects",
    DETAIL: (id: string) => `/academics/subjects/${id}`,
  },
  CENTERS: {
    BASE: "/centers",
    DETAIL: (id: string) => `/centers/${id}`,
  },
  ACADEMIC_YEARS: {
    BASE: "/centers/academic-years",
    DETAIL: (id: string) => `/centers/academic-years/${id}`,
  },
  SUBJECT_ASSIGNMENTS: {
    BASE: "/academics/subject-assignments",
    DETAIL: (id: string) => `/academics/subject-assignments/${id}`,
  },
  BATCHES: {
    BASE: "/batches",
    DETAIL: (id: string) => `/batches/${id}`,
  },
} as const;
