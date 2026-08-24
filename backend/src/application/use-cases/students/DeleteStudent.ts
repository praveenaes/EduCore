import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IStorageService } from "../../ports/services/IStorageService";
import { NotFoundError, ValidationError } from "@/shared/errors/AppError";
import { IDeleteStudent } from "../../ports/use-cases/students/IDeleteStudentUseCase";

@injectable()
export class DeleteStudent implements IDeleteStudent {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.StorageService) private _storageSvc: IStorageService
  ) {}

  async execute(id: string): Promise<void> {
    const student = await this._studentRepo.findById(id);
    if (!student) {
      throw new NotFoundError("Student not found");
    }

    const deleted = await this._studentRepo.softDelete(id);
    if (!deleted) {
      throw new ValidationError("Failed to delete student");
    }

    await this._userRepo.delete(student.userId);

    if (student.photo) {
      await this._storageSvc.deleteFile(student.photo).catch(err => {
        console.warn("Failed to delete student S3 photo on deletion:", err);
      });
    }
  }
}
