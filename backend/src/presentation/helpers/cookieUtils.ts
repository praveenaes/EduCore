import { Response } from "express";
import {  REFRESH_TOKEN_COOKIE_CONFIG } from "@/config/cookie.config";


export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE_CONFIG.name,
     token, REFRESH_TOKEN_COOKIE_CONFIG.options);
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE_CONFIG.name, {
    path: REFRESH_TOKEN_COOKIE_CONFIG.options.path,
  });
}
