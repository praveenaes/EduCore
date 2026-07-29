import { Response } from "express";

export interface IAuthService {
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hashed: string): Promise<boolean>;
  generateAccessToken(userId: string, email: string, role: string): string;
  generateRefreshToken(userId: string, email: string, role: string): string;
  generateResetToken(email: string, role: string): string;
  generateEmailChangeToken(userId: string, email: string): string;
  verifyToken(token: string): any;
  setCookies(res: Response, accessToken: string, refreshToken: string): void;
  clearCookies(res: Response): void;
}
