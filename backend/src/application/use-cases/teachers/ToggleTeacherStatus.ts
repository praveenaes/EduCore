import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { NotFoundError } from "@/shared/errors/AppError";
import {
  IToggleTeacherStatus,
  ToggleTeacherStatusRequest,
} from "../../ports/use-cases/teachers/IToggleTeacherStatusUseCase";

@injectable()
export class ToggleTeacherStatus implements IToggleTeacherStatus {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(req: ToggleTeacherStatusRequest): Promise<{ id: string; isActive: boolean }> {
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

    return { id: req.id, isActive: req.isActive };
  }
}
