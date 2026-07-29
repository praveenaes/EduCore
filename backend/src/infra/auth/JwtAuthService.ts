import { injectable } from "inversify";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Response } from "express";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { ENV } from "@/config/env.config";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "../web/express/utils/cookieUtils";

@injectable()
export class JwtAuthService implements IAuthService {
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password: string, hashed: string): Promise<boolean> {
    return bcrypt.compare(password, hashed);
  }

  generateAccessToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_ACCESS_EXPIRATION as any,
    });
  }

  generateRefreshToken(userId: string, email: string, role: string): string {
    return jwt.sign({ userId, email, role }, ENV.JWT_SECRET, {
      expiresIn: ENV.JWT_REFRESH_EXPIRATION as any,
    });
  }

  generateResetToken(email: string, role: string): string {
    return jwt.sign({ email, role, purpose: "password-reset" }, ENV.JWT_SECRET, {
      expiresIn: ENV.RESET_PASS_TOKEN_EXPIRY as any,
    });
  }

  generateEmailChangeToken(userId: string, email: string): string {
    return jwt.sign({ userId, email, purpose: "email-change" }, ENV.JWT_SECRET, {
      expiresIn: "15m",
    });
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, ENV.JWT_SECRET);
    } catch {
      return null;
    }
  }

  setCookies(res: Response, accessToken: string, refreshToken: string): void {
    setRefreshTokenCookie(res, refreshToken);
  }

  clearCookies(res: Response): void {
    clearRefreshTokenCookie(res);
  }
}
