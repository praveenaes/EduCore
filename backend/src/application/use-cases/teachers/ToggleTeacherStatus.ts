import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { Teacher } from "../../../domain/entities/Teacher";
import { NotFoundError } from "@/shared/errors/AppError";

export interface ToggleTeacherStatusRequest {
  id: string;
  isActive: boolean;
}

@injectable()
export class ToggleTeacherStatus {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(req: ToggleTeacherStatusRequest): Promise<Teacher> {
    const teacher = await this._teacherRepo.findById(req.id);
    if (!teacher) {
      throw new NotFoundError("Teacher not found");
    }
    if (req.isActive) {
      teacher.activate();
    } else {
      teacher.deactivate();
    }
    const updated = await this._teacherRepo.update(req.id, teacher);
    if (!updated) {
      throw new NotFoundError("Failed to update teacher status");
    }
    return updated;
  }
}
