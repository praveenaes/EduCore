import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { AppError } from "@/shared/errors/AppError";
import {
  IToggleStudentStatus,
  ToggleStatusRequest,
} from "../../ports/use-cases/students/IToggleStudentStatusUseCase";

@injectable()
export class ToggleStudentStatus implements IToggleStudentStatus {
  constructor(
    @inject(TYPES.StudentRepository) private studentRepository: IStudentRepository
  ) {}

  async execute(req: ToggleStatusRequest): Promise<{ id: string; isActive: boolean }> {
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

    return { id: req.id, isActive: req.isActive };
  }
}
