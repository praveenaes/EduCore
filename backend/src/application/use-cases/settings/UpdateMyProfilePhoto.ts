import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { IStorageService } from "../../ports/services/IStorageService";
import { NotFoundError, BadRequestError } from "@/shared/errors/AppError";
import { UserRole } from "@/domain/enums/UserRole";

import { IUpdateMyProfilePhoto } from "../../ports/use-cases/settings/IUpdateMyProfilePhotoUseCase";

@injectable()
export class UpdateMyProfilePhoto implements IUpdateMyProfilePhoto {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.StorageService) private _storageSvc: IStorageService
  ) {}

  async execute(
    userId: string,
    role: string,
    removePhoto: boolean,
    file?: { buffer: Buffer; originalname: string; mimetype: string }
  ): Promise<{ photoPath: string }> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    let profile: any = null;
    let repo: any = null;

    if (role.toUpperCase() === UserRole.STUDENT) {
      profile = await this._studentRepo.findByEmail(user.email!);
      repo = this._studentRepo;
    } else if (role.toUpperCase() === UserRole.TEACHER) {
      profile = await this._teacherRepo.findByEmail(user.email!);
      repo = this._teacherRepo;
    }

    if (!profile) {
      throw new NotFoundError("Profile record not found");
    }

    let photoPath = profile.photo || "";

    // Handle photo removal
    if (removePhoto) {
      if (profile.photo) {
        try {
          await this._storageSvc.deleteFile(profile.photo);
        } catch (error) {
          console.error("Failed to delete profile photo from S3:", error);
        }
      }
      photoPath = "";
    }

    // Handle photo upload
    if (file) {
      if (profile.photo) {
        try {
          await this._storageSvc.deleteFile(profile.photo);
        } catch (error) {
          console.error("Failed to delete previous profile photo from S3:", error);
        }
      }
      photoPath = await this._storageSvc.uploadFile(
        file.buffer,
        file.originalname,
        file.mimetype,
        role.toLowerCase() === UserRole.STUDENT ? UserRole.STUDENT : UserRole.TEACHER
      );
    }

    await repo.update(profile.id, { photo: photoPath });

    return { photoPath };
  }
}
