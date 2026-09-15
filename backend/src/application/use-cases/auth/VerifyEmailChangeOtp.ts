import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { NotFoundError, BadRequestError } from "@/shared/errors/AppError";
import { IVerifyEmailChangeOtp } from "../../ports/use-cases/auth/IVerifyEmailChangeOtpUseCase";

@injectable()
export class VerifyEmailChangeOtp implements IVerifyEmailChangeOtp {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService
  ) {}

  async execute(userId: string, otp: string): Promise<string> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    try {
      user.verifyAndClearEmailChangeOtp(otp);
      await this._userRepo.update(userId, user);
    } catch (err) {
      await this._userRepo.update(userId, user);
      throw new BadRequestError((err as Error).message);
    }

    return this._authSvc.generateEmailChangeToken(user.id!, user.email!);
  }
}
