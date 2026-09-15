import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IEmailService } from "../../ports/services/IEmailService";
import { NotFoundError, BadRequestError } from "@/shared/errors/AppError";
import { ISendEmailChangeOtp } from "../../ports/use-cases/auth/ISendEmailChangeOtpUseCase";

@injectable()
export class SendEmailChangeOtp implements ISendEmailChangeOtp {
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

    user.generateEmailChangeOtp();
    await this._userRepo.update(user.id!, user);
    await this._emailSvc.sendEmailChangeOtp(user.email!, user.emailChangeOtp!);
  }
}
