import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { NotFoundError, BadRequestError } from "@/shared/errors/AppError";
import { IChangePassword, ChangePasswordDTO } from "../../ports/use-cases/auth/IChangePasswordUseCase";

@injectable()
export class ChangePassword implements IChangePassword {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService
  ) {}

  async execute(userId: string, data: ChangePasswordDTO): Promise<void> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const isPasswordValid = await this._authSvc.comparePassword(data.oldPassword!, user.password!);
    if (!isPasswordValid) {
      throw new BadRequestError("Invalid current password");
    }

    const newPasswordHash = await this._authSvc.hashPassword(data.newPassword!);

    user.changePassword(newPasswordHash);
    await this._userRepo.update(user.id!, user);
  }
}
