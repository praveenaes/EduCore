import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { Student } from "../../../domain/entities/Student";
import { AppError } from "@/shared/errors/AppError";

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
    const student = await this.studentRepository.findById(req.id);
    if (!student) {
      throw new AppError("Student not found or deleted");
    }
    if (req.isActive) {
      student.activate();
    } else {
      student.deactivate();
    }
    const updated = await this.studentRepository.update(req.id, student);
    if (!updated) {
      throw new AppError("Failed to update student status");
    }
    return updated;
  }
}
