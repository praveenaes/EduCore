import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ITeacherRepository, TeacherBatchFilters } from "@/domain/repositories/ITeacherRepository";
import { IBatchRepository, BatchPagination } from "@/domain/repositories/IBatchRepository";
import { IGetTeacherBatches } from "../../ports/use-cases/teachers/IGetTeacherBatchesUseCase";
import { TeacherBatchListResultDTO } from "../../dto/teachers/teacherBatchDtos";
import { NotFoundError } from "@/shared/errors/AppError";

@injectable()
export class GetTeacherBatches implements IGetTeacherBatches {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository
  ) {}

  async execute(
    filters: TeacherBatchFilters,
    pagination: BatchPagination
  ): Promise<TeacherBatchListResultDTO> {
    const teacher = await this._teacherRepo.findByUserId(filters.userId);
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found.");
    }

    const result = await this._batchRepo.findTeacherBatches(
      { teacherId: teacher.id!, search: filters.search },
      pagination
    );

    return {
      batches: result.batches.map((b) => ({
        id: b.id!,
        name: b.name,
        courseId: b.courseId,
        courseName: b.courseName ?? "N/A",
        courseCode: b.courseCode,
        levelNumber: b.levelNumber,
        levelName: b.levelName,
        centerId: b.centerId,
        centerName: b.centerName ?? "N/A",
        academicYearId: b.academicYearId,
        academicYearName: b.academicYearName ?? "N/A",
      })),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(result.total / pagination.limit) || 1,
    };
  }
}
