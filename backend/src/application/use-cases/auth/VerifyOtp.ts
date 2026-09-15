import { inject, injectable } from "inversify";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { TYPES } from "@/config/di/types";
import { NotFoundError, BadRequestError } from "@/shared/errors/AppError";
import { IVerifyOtp } from "@/application/ports/use-cases/auth/IVerifyOtpUseCase";

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

    try {
      user.verifyPasswordResetOtp(otp);
    } catch (err) {
      throw new BadRequestError((err as Error).message);
    }

    return this._authSvc.generateResetToken(user.email!, user.role!);
  }
}
