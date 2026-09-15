import { inject, injectable } from "inversify";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { TYPES } from "@/config/di/types";
import { BadRequestError, NotFoundError } from "@/shared/errors/AppError";
import { IResetPassword } from "@/application/ports/use-cases/auth/IResetPasswordUseCase";
import { User } from "@/domain/entities/User";

@injectable()
export class ResetPassword implements IResetPassword {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService
  ) {}

  async execute(email: string, passwordHex: string, resetToken: string): Promise<{ accessToken: string; refreshToken: string; user: User }> {
   
    const payload = this._authSvc.verifyToken(resetToken);
    if (!payload ) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    const user = await this._userRepo.findByEmail(email);
    if (!user) {
    throw new NotFoundError("User not found");
    }

    const hashedPassword = await this._authSvc.hashPassword(passwordHex);

    user.changePassword(hashedPassword);
    await this._userRepo.update(user.id!, user);

    const accessToken = this._authSvc.generateAccessToken(user.id!, user.email!, user.role!);
    const refreshToken = this._authSvc.generateRefreshToken(user.id!, user.email!, user.role!);

    return {
      accessToken,
      refreshToken,
      user,
    };
  }
}
