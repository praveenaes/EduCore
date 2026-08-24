import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IStorageService } from "../../ports/services/IStorageService";
import { NotFoundError, ValidationError } from "@/shared/errors/AppError";
import { IDeleteTeacher } from "../../ports/use-cases/teachers/IDeleteTeacherUseCase";

@injectable()
export class DeleteTeacher implements IDeleteTeacher {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.StorageService) private _storageSvc: IStorageService
  ) {}

  async execute(id: string): Promise<void> {
    const teacher = await this._teacherRepo.findById(id);
    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }

    const deleted = await this._teacherRepo.softDelete(id);
    if (!deleted) {
      throw new ValidationError("Failed to delete teacher");
    }

    await this._userRepo.delete(teacher.userId);

    if (teacher.photo) {
      await this._storageSvc.deleteFile(teacher.photo).catch(err => {
        console.warn("Failed to delete teacher S3 photo on deletion:", err);
      });
    }
  }
}
