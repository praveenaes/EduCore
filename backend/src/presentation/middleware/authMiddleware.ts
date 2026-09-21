import { Request, Response, NextFunction } from "express";
import { container } from "@/config/di/container";
import { TYPES } from "@/config/di/types";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { UserRole } from "@/domain/enums/UserRole";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

// admin role check
export const authenticateAdmin = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : req.cookies?.accessToken;

  if (!token) {
    req.resume();
    res.status(401).json({ success: false, message: "Authentication required. Please log in." });
    return;
  }

  const authService = container.get<IAuthService>(TYPES.AuthService);
  const payload = authService.verifyToken(token);

  if (!payload) {
    req.resume();
    res.status(401).json({ success: false, message: "Invalid or expired access token." });
    return;
  }

  if (payload.role?.toUpperCase() !== UserRole.ADMIN) {
    req.resume();
    res.status(403).json({ success: false, message: "Access forbidden. Admins only." });
    return;
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  next();
};

export const authenticateUser = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers.authorization?.startsWith("Bearer ")
    ? req.headers.authorization.split(" ")[1]
    : req.cookies?.accessToken;

  if (!token) {
    req.resume();
    res.status(401).json({ success: false, message: "Authentication required. Please log in." });
    return;
  }

  const authService = container.get<IAuthService>(TYPES.AuthService);
  const payload = authService.verifyToken(token);

  if (!payload) {
    req.resume();
    res.status(401).json({ success: false, message: "Invalid or expired access token." });
    return;
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  next();
};
