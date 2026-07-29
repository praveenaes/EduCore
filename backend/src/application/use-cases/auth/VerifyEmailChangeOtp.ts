import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { NotFoundError, BadRequestError } from "../../error/AppError";

@injectable()
export class VerifyEmailChangeOtp {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService
  ) {}

  async execute(userId: string, otp: string): Promise<string> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.emailChangeOtp || user.emailChangeOtp !== otp) {
      throw new BadRequestError("Invalid OTP");
    }

    if (user.emailChangeOtpExpiresAt && user.emailChangeOtpExpiresAt < new Date()) {
      await this._userRepo.clearEmailChangeOtp(user.email!);
      throw new BadRequestError("Expired OTP");
    }

    await this._userRepo.clearEmailChangeOtp(user.email!);

    return this._authSvc.generateEmailChangeToken(user.id!, user.email!);
  }
}
