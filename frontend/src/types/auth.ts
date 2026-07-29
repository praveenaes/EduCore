export type UserRole = "admin" | "teacher" | "student";

export const UserRoleEnum = {
  ADMIN: "admin",
  TEACHER: "teacher",
  STUDENT: "student",
} as const;

export type UserRoleEnum = typeof UserRoleEnum[keyof typeof UserRoleEnum];

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  photo?: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string; // Backend returns uppercase "ADMIN" | "TEACHER" | "STUDENT"
    photo?: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}
