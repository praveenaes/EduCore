import { inject, injectable } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { ICourseRepository } from '@/domain/repositories/ICourseRepository';
import { ICenterRepository } from '@/domain/repositories/ICenterRepository';
import { IAcademicYearRepository } from '@/domain/repositories/IAcademicYearRepository';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { IUpdateBatchUseCase } from '@/application/ports/use-cases/batches/IUpdateBatchUseCase';
import { UpdateBatchDTO, BatchResponseDTO } from '@/application/dto/batches/batchDtos';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class UpdateBatch implements IUpdateBatchUseCase {
  constructor(
    @inject(TYPES.BatchRepository)  private _batchRepo: IBatchRepository,
    @inject(TYPES.CourseRepository)  private _courseRepo: ICourseRepository,
    @inject(TYPES.CenterRepository)  private _centerRepo: ICenterRepository,
    @inject(TYPES.AcademicYearRepository) private _academicYearRepo: IAcademicYearRepository,
    @inject(TYPES.TeacherRepository)  private _teacherRepo: ITeacherRepository
  ) {}

  async execute(id: string, dto: UpdateBatchDTO): Promise<BatchResponseDTO> {
    const batch = await this._batchRepo.findById(id);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError(`Batch with id "${id}" not found`);
    }

    const { name, courseId, levelNumber, centerId, academicYearId, teacherId, isActive } = dto;
    const parsedLevelNumber = Number(levelNumber);
    const trimmedName = name.trim();

    const isCourseOrLevelChanged =
      courseId !== batch.courseId || parsedLevelNumber !== batch.levelNumber;

    let levelName = batch.levelName;

    if (isCourseOrLevelChanged) {
      const course = await this._courseRepo.findById(courseId);
      if (!course || course.isDeleted) {
        throw new NotFoundError('Associated course not found');
      }

      const level = course.levels.find((l) => l.levelNumber === parsedLevelNumber);
      if (!level) {
        throw new ValidationError(
          `Level ${parsedLevelNumber} does not exist in course "${course.name}"`
        );
      }
      levelName = level.name;
    }

    if (centerId !== batch.centerId) {
      const center = await this._centerRepo.findById(centerId);
      if (!center || center.status === 'inactive') {
        throw new NotFoundError('Selected center not found or is inactive');
      }
    }

    if (academicYearId !== batch.academicYearId) {
      const academicYear = await this._academicYearRepo.findById(academicYearId);
      if (!academicYear || academicYear.isDeleted) {
        throw new NotFoundError('Selected academic year not found');
      }
    }

    const isNameOrScopeChanged =
      trimmedName.toLowerCase() !== batch.name.toLowerCase() ||
      isCourseOrLevelChanged ||
      centerId !== batch.centerId ||
      academicYearId !== batch.academicYearId;

    if (isNameOrScopeChanged) {
      const existing = await this._batchRepo.findByName(
        trimmedName,
        courseId,
        parsedLevelNumber,
        centerId,
        academicYearId
      );
      if (existing && existing.id !== id) {
        throw new ConflictError(
          `Batch with name "${trimmedName}" already exists for this course level, center, and academic year`
        );
      }
    }

    if (teacherId && teacherId !== batch.teacherId) {
      const teacher = await this._teacherRepo.findById(teacherId);
      if (!teacher || teacher.isDeleted) {
        throw new NotFoundError('Selected teacher not found');
      }
    }

    batch.updateDetails({
      name: trimmedName,
      courseId,
      levelNumber: parsedLevelNumber,
      levelName,
      centerId,
      academicYearId,
      teacherId,
      isActive,
    });

    await this._batchRepo.update(id, batch);

    const updated = await this._batchRepo.findById(id);
    if (!updated) {
      throw new NotFoundError(`Batch with id "${id}" could not be updated`);
    }

    return {
      id: updated.id!,
      name: updated.name,
      courseId: updated.courseId,
      courseName: updated.courseName,
      courseCode: updated.courseCode,
      levelNumber: updated.levelNumber,
      levelName: updated.levelName,
      centerId: updated.centerId,
      centerName: updated.centerName,
      academicYearId: updated.academicYearId,
      academicYearName: updated.academicYearName,
      teacherId: updated.teacherId,
      teacherName: updated.teacherName,
      teacherEmployeeId: updated.teacherEmployeeId,
      isActive: updated.isActive,
      isDeleted: updated.isDeleted,
      createdAt: updated.createdAt?.toISOString(),
      updatedAt: updated.updatedAt?.toISOString(),
    };
  }
}
