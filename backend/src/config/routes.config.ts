export const API_ROUTES = {
  BASE: "/",
  AUTH: {
    ROOT: "/auth",
    LOGIN: "/login",
    LOGOUT: "/logout",
    FORGOT_PASSWORD: "/forgot-password",
    VERIFY_OTP: "/verify-otp",
    RESET_PASSWORD: "/reset-password",
    REFRESH:'/refresh',
    ME:'/me'
  },
  STUDENTS: {
    ROOT: "/students",
    LIST: "/",
    EXPORT: "/export/csv",
    STATUS: "/:id/status",
  },
  TEACHERS: {
    ROOT: "/teachers",
    LIST: "/",
    EXPORT: "/export/csv",
    STATUS: "/:id/status",
  },
  SETTINGS: {
    ROOT: "/settings",
    ORGANIZATION: "/organization",
    PROFILE: "/profile",
    CHANGE_PASSWORD: "/change-password",
    CHANGE_EMAIL_SEND_OTP: "/change-email/send-otp",
    CHANGE_EMAIL_VERIFY_OTP: "/change-email/verify-otp",
    CHANGE_EMAIL_UPDATE: "/change-email/update",
  },
   PROGRAMS: {
    ROOT: "/academics/programs",
    LIST: "/",
    DETAIL: "/:id",
  },
  COURSES: {
    ROOT: "/academics/courses",
    LIST: "/",
    DETAIL: "/:id",
  },
  SUBJECTS: {
    ROOT: "/academics/subjects",
    LIST: "/",
    DETAIL: "/:id",
  },
  CENTERS: {
    ROOT: "/centers",
    LIST: "/",
    DETAIL: "/:id",
  },
  ACADEMIC_YEARS: {
    ROOT: "/centers/academic-years",
    LIST: "/",
    DETAIL: "/:id",
  },
  SUBJECT_ASSIGNMENTS: {
    ROOT: "/academics/subject-assignments",
    LIST: "/",
    DETAIL: "/:id",
  },
} as const;
