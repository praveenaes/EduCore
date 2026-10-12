import { inject, injectable } from "inversify";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { ITokenBlacklistService } from "@/application/ports/services/ITokenBlacklistService";
import { TYPES } from "@/config/di/types";
import { UnauthorizedError } from "@/shared/errors/AppError";
import { IRefreshToken } from "@/application/ports/use-cases/auth/IRefreshTokenUseCase";
import { UserRole } from "@/domain/enums/UserRole";
import { TeacherModel } from "@/infra/db/models/TeacherModel";
import { StudentModel } from "@/infra/db/models/StudentModel";

@injectable()
export class RefreshToken implements IRefreshToken {
  constructor(
    @inject(TYPES.AuthService) private _authSvc: IAuthService,
    @inject(TYPES.TokenBlacklistService) private _blacklistSvc: ITokenBlacklistService
  ) {}

  async execute(refreshToken: string): Promise<string> {
    const decoded = this._authSvc.verifyToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    const isRevoked = await this._blacklistSvc.isBlacklisted(refreshToken);
    if (isRevoked) {
      throw new UnauthorizedError("Token has been revoked. Please login again.");
    }

    // Verify active status before renewing session
    const roleUpper = decoded.role?.toUpperCase();
    if (roleUpper === UserRole.TEACHER) {
      const teacher = await TeacherModel.findOne({ userId: decoded.userId, isDeleted: false })
        .select("isActive")
        .lean();
      if (!teacher || !teacher.isActive) {
        throw new UnauthorizedError("Your account has been deactivated. Please contact the administrator.");
      }
    } else if (roleUpper === UserRole.STUDENT) {
      const student = await StudentModel.findOne({ userId: decoded.userId, isDeleted: false })
        .select("isActive")
        .lean();
      if (!student || !student.isActive) {
        throw new UnauthorizedError("Your account has been deactivated. Please contact the administrator.");
      }
    }

    return this._authSvc.generateAccessToken(
      decoded.userId,
      decoded.email,
      decoded.role
    );
  }
}
