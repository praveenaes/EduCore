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
    BATCHES: "/teachers/batches",
    SUBJECTS: "/teachers/subjects",
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
  ATTENDANCE: {
    STUDENTS: "/attendance/students",
    STUDENT: "/attendance/student",
  },
  HOMEWORK: {
    BASE: "/homework",
    DETAIL: (id: string) => `/homework/${id}`,
    SUBMISSIONS: (id: string) => `/homework/${id}/submissions`,
    REVIEW: (id: string) => `/homework/${id}/review`,
    STUDENT: "/homework/student",
    STUDENT_SUBMIT: (id: string) => `/homework/student/${id}/submit`,
    STUDENT_EXTENSION: (id: string) => `/homework/student/${id}/extension-request`,
    REVIEW_EXTENSION: (homeworkId: string, studentId: string) => `/homework/${homeworkId}/submissions/${studentId}/extension`,
  },
  LEAVES: {
    STUDENT: "/leaves/student",//student
    STUDENT_DETAIL: (id: string) => `/leaves/student/${id}`,
    STUDENT_RESCHEDULE: (id: string) => `/leaves/student/${id}/reschedule`,
    BATCH: (batchId: string) => `/leaves/batch/${batchId}`,//teacher
    REVIEW: (id: string) => `/leaves/${id}/review`,//teacher
  },
  ASSESSMENTS: {
    BASE: "/assessments",
    DETAIL: (id: string) => `/assessments/${id}`,
  },
  ASSESSMENT_CRITERIA: {
    BASE: "/assessments/criteria",
    DETAIL: (id: string) => `/assessments/criteria/${id}`,
  },
  ASSESSMENT_SCHEDULES: {
    BASE: "/assessments/schedules",
    DETAIL: (id: string) => `/assessments/schedules/${id}`,
    TOGGLE_STATUS: (id: string) => `/assessments/schedules/${id}/toggle-status`,
  },
  ASSESSMENT_RESULTS: {
    BASE: "/assessments/results",
    SHEET: (scheduleId: string) => `/assessments/results/sheet/${scheduleId}`,
    PUBLISH: "/assessments/results/publish",
    MY_RESULTS: "/assessments/results/my-results",
    MY_REPORT_CARD: (assessmentId: string) => `/assessments/results/my-report-card/${assessmentId}`,
    STUDENT_REPORT_CARD: (assessmentId: string, studentId: string) =>
      `/assessments/results/report-card/${assessmentId}/${studentId}`,
  },
} as const;
