import { Request, Response, NextFunction } from "express";
import { container } from "@/config/di/container";
import { TYPES } from "@/config/di/types";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { UserRole } from "@/domain/enums/UserRole";
import { TeacherModel } from "@/infra/db/models/TeacherModel";
import { StudentModel } from "@/infra/db/models/StudentModel";

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

  // Real-time active status verification for teachers and students
  const roleUpper = payload.role?.toUpperCase();
  if (roleUpper === UserRole.TEACHER) {
    const teacher = await TeacherModel.findOne({
      userId: payload.userId,
      isDeleted: false,
    })
      .select("isActive")
      .lean();

    if (!teacher || !teacher.isActive) {
      res.clearCookie("refreshToken");
      req.resume();
      res.status(401).json({
        success: false,
        code: "ACCOUNT_DEACTIVATED",
        message: "Your account has been deactivated. Please contact the administrator.",
      });
      return;
    }
  } else if (roleUpper === UserRole.STUDENT) {
    const student = await StudentModel.findOne({
      userId: payload.userId,
      isDeleted: false,
    })
      .select("isActive")
      .lean();

    if (!student || !student.isActive) {
      res.clearCookie("refreshToken");
      req.resume();
      res.status(401).json({
        success: false,
        code: "ACCOUNT_DEACTIVATED",
        message: "Your account has been deactivated. Please contact the administrator.",
      });
      return;
    }
  }

  req.user = {
    id: payload.userId,
    email: payload.email,
    role: payload.role,
  };

  next();
};
