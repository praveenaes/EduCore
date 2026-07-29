import { inject, injectable } from "inversify";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { TYPES } from "@/config/di/types";
import { UnauthorizedError } from "@/application/error/AppError";
import { IRefreshToken } from "@/application/ports/use-cases/auth/IRefreshTokenUseCase";

@injectable()
export class RefreshToken implements IRefreshToken {
  constructor(
    @inject(TYPES.AuthService) private _authSvc: IAuthService
  ) {}

  async execute(refreshToken: string): Promise<string> {
    const decoded = this._authSvc.verifyToken(refreshToken);
    if (!decoded) {
      throw new UnauthorizedError("Invalid or expired refresh token");
    }

    return this._authSvc.generateAccessToken(
      decoded.userId,
      decoded.email,
      decoded.role
    );
  }
}
