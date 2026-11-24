import { Request, Response } from "express";
import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IGetOrganizationSettings } from "@/application/ports/use-cases/settings/IGetOrganizationSettingsUseCase";
import { IUpdateOrganizationSettings } from "@/application/ports/use-cases/settings/IUpdateOrganizationSettingsUseCase";
import { IGetMySettings } from "@/application/ports/use-cases/settings/IGetMySettingsUseCase";
import { IUpdateMyProfilePhoto } from "@/application/ports/use-cases/settings/IUpdateMyProfilePhotoUseCase";
import { ChangePassword } from "@/application/use-cases/auth/ChangePassword";
import { SendEmailChangeOtp } from "@/application/use-cases/auth/SendEmailChangeOtp";
import { VerifyEmailChangeOtp } from "@/application/use-cases/auth/VerifyEmailChangeOtp";
import { ChangeEmail } from "@/application/use-cases/auth/ChangeEmail";
import { UnauthorizedError, ValidationError } from "@/shared/errors/AppError";
import { HTTP_STATUS } from "@/presentation/constants/httpStatus";
import { ERROR_MESSAGES } from "@/presentation/constants/messages";
import {
  updateOrganizationSchema,
  changePasswordSchema,
  changeEmailSchema,
  verifyEmailChangeOtpSchema,
} from "@/presentation/validators/settingsValidators";
import { ResponseHelper } from "@/presentation/helpers/ResponseHelper";

@injectable()
export class SettingsController {
  constructor(
    @inject(TYPES.GetOrganizationSettingsUseCase) private _getOrgUseCase: IGetOrganizationSettings,
    @inject(TYPES.UpdateOrganizationSettingsUseCase) private _updateOrgUseCase: IUpdateOrganizationSettings,
    @inject(TYPES.GetMySettingsUseCase) private _getMySettingsUseCase: IGetMySettings,
    @inject(TYPES.UpdateMyProfilePhotoUseCase) private _updateMyPhotoUseCase: IUpdateMyProfilePhoto,
    @inject(TYPES.ChangePasswordUseCase) private _changePasswordUseCase: ChangePassword,
    @inject(TYPES.SendEmailChangeOtpUseCase) private _sendEmailOtpUseCase: SendEmailChangeOtp,
    @inject(TYPES.VerifyEmailChangeOtpUseCase) private _verifyEmailOtpUseCase: VerifyEmailChangeOtp,
    @inject(TYPES.ChangeEmailUseCase) private _changeEmailUseCase: ChangeEmail
  ) {}

  getOrganization = async (req: Request, res: Response): Promise<void> => {
    const data = await this._getOrgUseCase.execute();
    ResponseHelper.success(res, "Organization settings retrieved successfully", data);
  };


  updateOrganization = async (req: Request, res: Response): Promise<void> => {
    const result = updateOrganizationSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }


    const file = req.file ? {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
    } : undefined;

    const data = await this._updateOrgUseCase.execute(result.data, file);
    ResponseHelper.success(res, "Organization settings updated successfully", data);
  };


  getMySettings = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId || !role) {
      throw new UnauthorizedError(ERROR_MESSAGES.AUTH_FAILED);
    }

    const data = await this._getMySettingsUseCase.execute(userId, role);
    ResponseHelper.success(res, "User settings retrieved successfully", data);
  };


  updateMyProfilePhoto = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId || !role) {
      throw new UnauthorizedError("Authentication required");
    }

    const removePhoto = req.body.removePhoto === "true" || req.body.removePhoto === true;
    const file = req.file ? {
      buffer: req.file.buffer,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
    } : undefined;

    const data = await this._updateMyPhotoUseCase.execute(userId, role, removePhoto, file);
    ResponseHelper.success(res, "Profile photo updated successfully", data, HTTP_STATUS.OK);
  };


  changePassword = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const result = changePasswordSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    await this._changePasswordUseCase.execute(userId, result.data);
    ResponseHelper.success(res, "Password changed successfully", null, HTTP_STATUS.OK);
  };


  sendEmailChangeOtp = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    await this._sendEmailOtpUseCase.execute(userId);
    ResponseHelper.success(res, "OTP sent successfully to your current email address", null, HTTP_STATUS.OK);
  };


  verifyEmailChangeOtp = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const result = verifyEmailChangeOtpSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    const token = await this._verifyEmailOtpUseCase.execute(userId, result.data.otp);
    ResponseHelper.success(res, "OTP verified successfully", { emailChangeToken: token }, HTTP_STATUS.OK);
  };

  
  changeEmail = async (req: Request, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const result = changeEmailSchema.safeParse(req.body);
    if (!result.success) {
      throw new ValidationError(ERROR_MESSAGES.VALIDATION_ERROR);
    }

    await this._changeEmailUseCase.execute(userId, result.data);
    ResponseHelper.success(res, "Email address changed successfully", null, HTTP_STATUS.OK);
  };
}
