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
    CURRICULUM:'/me/curriculum'
  },
  TEACHERS: {
    ROOT: "/teachers",
    LIST: "/",
    EXPORT: "/export/csv",
    STATUS: "/:id/status",
    CURRICULUM:'/me/curriculum',
    BATCHES:'/batches',
    SUBJECTS:'/subjects'
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
  BATCHES: {
    ROOT: "/batches",
    LIST: "/",
    DETAIL: "/:id",
  },
  ATTENDANCE: {
    ROOT: "/attendance",
    STUDENTS: "/students",
    STUDENT: "/student",
  },
  HOMEWORK: {
    ROOT: "/homework",
    LIST: "/",
    DETAIL: "/:id",
    SUBMISSIONS: "/:id/submissions",
    REVIEW: "/:id/review",
    STUDENT: "/student",
    STUDENT_SUBMIT: "/student/:id/submit",
  },
  LEAVES: {
    ROOT: "/leaves",
    STUDENT: "/student",
    BATCH: "/batch/:batchId",
    REVIEW: "/:id/review",
  },
} as const;
