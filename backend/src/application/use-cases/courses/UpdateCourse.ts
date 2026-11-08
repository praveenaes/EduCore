import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ICourseRepository } from "../../../domain/repositories/ICourseRepository";
import { IProgramRepository } from "../../../domain/repositories/IProgramRepository";
import { NotFoundError, ValidationError } from "@/shared/errors/AppError";
import { IUpdateCourse } from "../../ports/use-cases/courses/IUpdateCourseUseCase";
import { UpdateCourseDTO, CourseResponseDTO } from "../../dto/courses/courseDtos";

@injectable()
export class UpdateCourse implements IUpdateCourse {
  constructor(
    @inject(TYPES.CourseRepository) private _courseRepo: ICourseRepository,
    @inject(TYPES.ProgramRepository) private _programRepo: IProgramRepository
  ) {}

  async execute(id: string, dto: UpdateCourseDTO): Promise<CourseResponseDTO> {
    const course = await this._courseRepo.findById(id);
    if (!course || course.isDeleted) {
      throw new NotFoundError("Course not found.");
    }

    const { programId, name, code, description, durationMonths, levelName, levelCount } = dto;
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    let programName = course.programName;
    if (programId !== course.programId) {
      const program = await this._programRepo.findById(programId);
      if (!program || program.isDeleted) {
        throw new NotFoundError("Selected program does not exist or has been deleted.");
      }
      programName = program.name;
    } else if (!programName) {
      const program = await this._programRepo.findById(course.programId);
      if (program) programName = program.name;
    }

    if (trimmedCode !== course.code) {
      const existingByCode = await this._courseRepo.findByCode(trimmedCode);
      if (existingByCode && existingByCode.id !== id) {
        throw new ValidationError("Course with this code already exists.");
      }
    }

    if (trimmedName !== course.name) {
      const existingByName = await this._courseRepo.findByName(trimmedName);
      if (existingByName && existingByName.id !== id) {
        throw new ValidationError("Course with this name already exists.");
      }
    }

    course.updateDetails({
      programId,
      name: trimmedName,
      code: trimmedCode,
      description,
      durationMonths,
      levelName,
      levelCount: Number(levelCount),
    });

    const updated = await this._courseRepo.update(id, course);
    if (!updated) {
      throw new NotFoundError("Failed to update course.");
    }

    return {
      id: updated.id!,
      programId: updated.programId,
      programName,
      name: updated.name,
      code: updated.code,
      description: updated.description,
      durationMonths: updated.durationMonths,
      levelName: updated.levelName,
      levelCount: updated.levelCount,
      levels: updated.levels,
      isDeleted: updated.isDeleted,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
