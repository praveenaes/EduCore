import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ICourseRepository } from "../../../domain/repositories/ICourseRepository";
import { IProgramRepository } from "../../../domain/repositories/IProgramRepository";
import { Course } from "../../../domain/entities/Course";
import { NotFoundError, ValidationError } from "@/shared/errors/AppError";
import { ICreateCourse } from "../../ports/use-cases/courses/ICreateCourseUseCase";
import { CreateCourseDTO, CourseResponseDTO } from "../../dto/courses/courseDtos";

@injectable()
export class CreateCourse implements ICreateCourse {
  constructor(
    @inject(TYPES.CourseRepository) private _courseRepo: ICourseRepository,
    @inject(TYPES.ProgramRepository) private _programRepo: IProgramRepository
  ) {}

  async execute(dto: CreateCourseDTO): Promise<CourseResponseDTO> {
    const program = await this._programRepo.findById(dto.programId);
    if (!program || program.isDeleted) {
      throw new NotFoundError("Selected program does not exist or has been deleted.");
    }

    const existingByCode = await this._courseRepo.findByCode(dto.code);
    if (existingByCode) {
      throw new ValidationError("Course with this code already exists.");
    }

    const existingByName = await this._courseRepo.findByName(dto.name);
    if (existingByName) {
      throw new ValidationError("Course with this name already exists.");
    }

    const course = Course.createNew({
      programId: dto.programId,
      name: dto.name,
      code: dto.code,
      description: dto.description,
      durationMonths: dto.durationMonths,
      levelName: dto.levelName,
      levelCount: dto.levelCount,
    });

    const saved = await this._courseRepo.create(course);

    return {
      id: saved.id!,
      programId: saved.programId,
      name: saved.name,
      code: saved.code,
      description: saved.description,
      durationMonths: saved.durationMonths,
      levelName: saved.levelName,
      levelCount: saved.levelCount,
      levels: saved.levels,
      isDeleted: saved.isDeleted,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
