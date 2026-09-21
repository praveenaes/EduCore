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

    const courseId = dto.courseId ?? batch.courseId;
    const levelNumber =
      dto.levelNumber !== undefined ? Number(dto.levelNumber) : batch.levelNumber;
    let levelName = batch.levelName;

    const isCourseOrLevelChanged =
      (dto.courseId && dto.courseId !== batch.courseId) ||
      (dto.levelNumber !== undefined && Number(dto.levelNumber) !== batch.levelNumber);

    if (isCourseOrLevelChanged) {
      const course = await this._courseRepo.findById(courseId);
      if (!course || course.isDeleted) {
        throw new NotFoundError('Associated course not found');
      }

      const level = course.levels.find((l) => l.levelNumber === levelNumber);
      if (!level) {
        throw new ValidationError(
          `Level ${levelNumber} does not exist in course "${course.name}"`
        );
      }
      levelName = level.name;
    }

    const centerId = dto.centerId ?? batch.centerId;
    if (dto.centerId && dto.centerId !== batch.centerId) {
      const center = await this._centerRepo.findById(dto.centerId);
      if (!center || center.status === 'inactive') {
        throw new NotFoundError('Selected center not found or is inactive');
      }
    }

    const academicYearId = dto.academicYearId ?? batch.academicYearId;
    if (dto.academicYearId && dto.academicYearId !== batch.academicYearId) {
      const academicYear = await this._academicYearRepo.findById(dto.academicYearId);
      if (!academicYear || academicYear.isDeleted) {
        throw new NotFoundError('Selected academic year not found');
      }
    }

    const name = dto.name !== undefined ? dto.name.trim() : batch.name;
    const isNameOrScopeChanged =
      (dto.name && dto.name.trim().toLowerCase() !== batch.name.toLowerCase()) ||
      isCourseOrLevelChanged ||
      (dto.centerId && dto.centerId !== batch.centerId) ||
      (dto.academicYearId && dto.academicYearId !== batch.academicYearId);

    if (isNameOrScopeChanged) {
      const existing = await this._batchRepo.findByName(
        name,
        courseId,
        levelNumber,
        centerId,
        academicYearId
      );
      if (existing && existing.id !== id) {
        throw new ConflictError(
          `Batch with name "${name}" already exists for this course level, center, and academic year`
        );
      }
    }

    if (dto.teacherId && dto.teacherId !== batch.teacherId) {
      const teacher = await this._teacherRepo.findById(dto.teacherId);
      if (!teacher || teacher.isDeleted) {
        throw new NotFoundError('Selected teacher not found');
      }
    }

    batch.updateDetails({
      name: dto.name,
      courseId: dto.courseId,
      levelNumber: dto.levelNumber !== undefined ? Number(dto.levelNumber) : undefined,
      levelName,
      centerId: dto.centerId,
      academicYearId: dto.academicYearId,
      ...('teacherId' in dto && { teacherId: dto.teacherId }),
      isActive: dto.isActive,
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
