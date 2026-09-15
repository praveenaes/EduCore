import { Response } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface IAuthService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashed: string): Promise<boolean>;
  generateAccessToken(userId: string, email: string, role: string): string;
  generateRefreshToken(userId: string, email: string, role: string): string;
  generateResetToken(email: string, role: string): string;
  generateEmailChangeToken(userId: string, email: string): string;
  verifyToken(token: string): JwtPayload | null;
  setCookies(res: Response, accessToken: string, refreshToken: string): void;
  clearCookies(res: Response): void;
}
