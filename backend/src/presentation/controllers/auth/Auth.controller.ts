import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import jwt from "jsonwebtoken";
import { TYPES } from "@/config/di/types";
import { ILoginUser } from "@/application/ports/use-cases/auth/ILoginUserUseCase";
import { IRefreshToken } from "@/application/ports/use-cases/auth/IRefreshTokenUseCase";
import { ILogoutUser } from "@/application/ports/use-cases/auth/ILogoutUserUseCase";
import { IGetMe } from "@/application/ports/use-cases/auth/IGetMeUseCase";
import { IForgotPassword } from "@/application/ports/use-cases/auth/IForgotPasswordUseCase";
import { IVerifyOtp } from "@/application/ports/use-cases/auth/IVerifyOtpUseCase";
import { IResetPassword } from "@/application/ports/use-cases/auth/IResetPasswordUseCase";
import { AUTH_MESSAGES,ERROR_MESSAGES } from "@/presentation/http/constants/messages";
import { UnauthorizedError, ValidationError } from "@/application/error/AppError";
import { HTTP_STATUS } from "@/presentation/http/constants/httpStatus";
import { forgotPasswordSchema, verifyOtpSchema, resetPasswordSchema } from "@/presentation/http/validators/userAuthValidators";
import {
  setRefreshTokenCookie,
  clearRefreshTokenCookie,
} from "@/infra/web/express/utils/cookieUtils";
import { ResponseHelper } from "@/presentation/http/response/ResponseHelper";

@injectable()
export class AuthController {
  constructor(
    @inject(TYPES.LoginUserUseCase) private _loginUseCase: ILoginUser,
    @inject(TYPES.RefreshTokenUseCase) private _refreshUseCase: IRefreshToken,
    @inject(TYPES.GetMeUseCase) private _getMeUseCase: IGetMe,
    @inject(TYPES.ForgotPasswordUseCase) private _forgotUseCase: IForgotPassword,
    @inject(TYPES.VerifyOtpUseCase) private _verifyOtpUseCase: IVerifyOtp,
    @inject(TYPES.ResetPasswordUseCase) private _resetPasswordUseCase: IResetPassword,
    @inject(TYPES.LogoutUserUseCase) private _logoutUseCase: ILogoutUser
  ) {}

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password, role } = req.body;
    const {accessToken,refreshToken,user} = await this._loginUseCase.execute(
      email,
      password,
      role);
    setRefreshTokenCookie(res,refreshToken);

    ResponseHelper.success(res, AUTH_MESSAGES.LOGIN_SUCCESS, {
      accessToken,
      user,
    }, HTTP_STATUS.OK);
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;
   if (!refreshToken) {
       throw new UnauthorizedError(AUTH_MESSAGES.NO_REFRESH_TOKEN);
    }
    const expiresAt: Date = new Date(
      Date.now() + 7 * 24 * 60 * 60 * 1000,//7 days from now
    )
    await this._logoutUseCase.execute(refreshToken, expiresAt);
    clearRefreshTokenCookie(res);

    ResponseHelper.success(res, AUTH_MESSAGES.LOGOUT_SUCCESS, null);
  };

  refresh = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.cookies.refreshToken
    if (!refreshToken) {
       throw new UnauthorizedError(AUTH_MESSAGES.NO_REFRESH_TOKEN);
    }
    const accessToken = await this._refreshUseCase.execute(refreshToken);
    ResponseHelper.success(res, "Token refreshed successfully", { accessToken });
  };

  me = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id//since its a custom req
    if (!userId) {
       throw new UnauthorizedError(ERROR_MESSAGES.AUTH_FAILED)
    }

    const user = await this._getMeUseCase.execute(userId);
    ResponseHelper.success(res, "Profile retrieved successfully", {
      user: {
        id: user.id!,
        name: user.name!,
        email: user.email!,
        role: user.role!,
        photo: user.photo,
      },
    });
  };

  forgotPassword = async (req: Request, res: Response): Promise<void> => {
    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
       throw new ValidationError(ERROR_MESSAGES.INVALID_EMAIL);
    }

    const { email } = result.data;
    await this._forgotUseCase.execute(email);

    ResponseHelper.success(res, "OTP generated successfully", null);
  };

  verifyOtp = async (req: Request, res: Response): Promise<void> => {
    const result = verifyOtpSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError('Invalid otp');
    }

    const { email, otp } = result.data;
    const resetToken = await this._verifyOtpUseCase.execute(email, otp);

    ResponseHelper.success(res, "OTP verified successfully", { resetToken });
  };

  resetPassword = async (req: Request, res: Response): Promise<void> => {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const { email, password, resetToken } = result.data;
    const { accessToken, refreshToken, user } = await this._resetPasswordUseCase.execute(email, password, resetToken);

    setRefreshTokenCookie(res, refreshToken);

    ResponseHelper.success(res, "Password reset successfully", {
      accessToken,
      user,
    });
  };
}
