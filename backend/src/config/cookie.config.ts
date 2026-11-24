import { ENV } from "./env.config";

export const REFRESH_TOKEN_COOKIE_CONFIG = {
  name: "refreshToken",
  options: {
    httpOnly: true,
    secure: ENV.NODE_ENV === "production",
    sameSite: (ENV.NODE_ENV === "production" ? "none" : "lax") as "none" | "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, 
    path: "/",
  },
} as const;



