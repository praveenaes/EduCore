import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ITeacherRepository } from "../../ports/repositories/ITeacherRepository";
import { Teacher } from "../../../domain/entities/Teacher";
import { NotFoundError } from "../../error/AppError";

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
    const updated = await this._teacherRepo.updateStatus(req.id, req.isActive);
    if (!updated) {
      throw new NotFoundError("Teacher not found");
    }
    return updated;
  }
}
