import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IStudentRepository } from "../../ports/repositories/IStudentRepository";
import { Student } from "../../../domain/entities/Student";
import { AppError } from "../../error/AppError";

import { IToggleStudentStatus } from "../../ports/use-cases/students/IToggleStudentStatusUseCase";

export interface ToggleStatusRequest {
  id: string;
  isActive: boolean;
}

@injectable()
export class ToggleStudentStatus implements IToggleStudentStatus {
  constructor(
    @inject(TYPES.StudentRepository) private studentRepository: IStudentRepository
  ) {}

  async execute(req: ToggleStatusRequest): Promise<Student> {
    const updated = await this.studentRepository.updateStatus(req.id, req.isActive);
    if (!updated) {
      throw new AppError("Student not found or deleted");
    }
    return updated;
  }
}
