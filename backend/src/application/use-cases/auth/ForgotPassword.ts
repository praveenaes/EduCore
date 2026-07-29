import { inject, injectable } from "inversify";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { TYPES } from "@/config/di/types";
import { NotFoundError, UnauthorizedError } from "@/application/error/AppError";
import { IForgotPassword } from "@/application/ports/use-cases/auth/IForgotPasswordUseCase";
import { UserRole } from "@/domain/enums/UserRole";

@injectable()
export class ForgotPassword implements IForgotPassword {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.EmailService) private _emailSvc: IEmailService
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this._userRepo.findByEmail(email);
    if (!user) return

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 60 * 1000); 

    await this._userRepo.savePasswordResetOtp(email, otp, expiresAt);
    await this._emailSvc.sendPasswordResetOtp(email, otp);
  }
}
