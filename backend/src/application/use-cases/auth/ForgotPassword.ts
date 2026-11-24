import { inject, injectable } from "inversify";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { TYPES } from "@/config/di/types";
import { NotFoundError, UnauthorizedError } from "@/shared/errors/AppError";
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

    user.generatePasswordResetOtp();
    await this._userRepo.update(user.id!, user);
    await this._emailSvc.sendPasswordResetOtp(email, user.passwordResetOtp!);
  }
}
