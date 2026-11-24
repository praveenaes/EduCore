import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { ITokenBlacklistService } from "@/application/ports/services/ITokenBlacklistService";
import { ILogoutUser } from "@/application/ports/use-cases/auth/ILogoutUserUseCase";

@injectable()
export class LogoutUser implements ILogoutUser {
  constructor(
    @inject(TYPES.TokenBlacklistService)
    private readonly _blacklistSvc: ITokenBlacklistService
  ) {}

  async execute(refreshToken: string, expiresAt: Date): Promise<void> {
    if (!refreshToken) {
      return;
    }
    await this._blacklistSvc.addToBlacklist(refreshToken, expiresAt);
  }
}
