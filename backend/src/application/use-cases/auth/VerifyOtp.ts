import { inject, injectable } from "inversify";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { TYPES } from "@/config/di/types";
import { NotFoundError, BadRequestError } from "@/application/error/AppError";
import { IVerifyOtp } from "@/application/ports/use-cases/auth/IVerifyOtpUseCase";
import { UserRole } from "@/domain/enums/UserRole";

@injectable()
export class VerifyOtp implements IVerifyOtp {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService
  ) {}

  async execute(email: string, otp: string): Promise<string> {
    const user = await this._userRepo.findByEmail(email);
    if (!user) {
      throw new NotFoundError("Admin user not found");
    }

    if ( user.passwordResetOtp !== otp) {
      throw new BadRequestError("Invalid OTP");
    }

    if (user.passwordResetOtpExpiresAt && user.passwordResetOtpExpiresAt < new Date()) {
      throw new BadRequestError("Expired OTP");
    }

    return this._authSvc.generateResetToken(user.email!, user.role!);
  }
}
