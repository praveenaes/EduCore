import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IEmailService } from "../../ports/services/IEmailService";
import { NotFoundError, BadRequestError } from "../../error/AppError";

@injectable()
export class SendEmailChangeOtp {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.EmailService) private _emailSvc: IEmailService
  ) {}

  async execute(userId: string): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    if (!user.email) {
      throw new BadRequestError("User email is not configured");
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute expiration

    await this._userRepo.saveEmailChangeOtp(user.email, otp, expiresAt);
    await this._emailSvc.sendEmailChangeOtp(user.email, otp);
  }
}
