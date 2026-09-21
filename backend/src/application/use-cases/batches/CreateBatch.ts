import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { ICourseRepository } from '@/domain/repositories/ICourseRepository';
import { ICenterRepository } from '@/domain/repositories/ICenterRepository';
import { IAcademicYearRepository } from '@/domain/repositories/IAcademicYearRepository';
import { ITeacherRepository } from '@/domain/repositories/ITeacherRepository';
import { ICreateBatchUseCase } from '@/application/ports/use-cases/batches/ICreateBatchUseCase';
import { CreateBatchDTO, BatchResponseDTO } from '@/application/dto/batches/batchDtos';
import { Batch } from '@/domain/entities/Batch';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class CreateBatch implements ICreateBatchUseCase {
  constructor(
    @inject(TYPES.BatchRepository)  private _batchRepo: IBatchRepository,
    @inject(TYPES.CourseRepository)  private _courseRepo: ICourseRepository,
    @inject(TYPES.CenterRepository)  private _centerRepo: ICenterRepository,
    @inject(TYPES.AcademicYearRepository)  private _academicYearRepo: IAcademicYearRepository,
    @inject(TYPES.TeacherRepository)  private _teacherRepo: ITeacherRepository
  ) {}

  async execute(dto: CreateBatchDTO): Promise<BatchResponseDTO> {

    const course = await this._courseRepo.findById(dto.courseId);
    if (!course || course.isDeleted) {     
       throw new NotFoundError('Course not found');
    }

    const level = course.levels.find((l) => l.levelNumber === dto.levelNumber);
    if (!level) {
      throw new ValidationError(`Level ${dto.levelNumber} does not exist in course "${course.name}"`);
    }

    const center = await this._centerRepo.findById(dto.centerId);
    if (!center || center.status === 'inactive') {
      throw new NotFoundError('Center not found');
    }

    const academicYear = await this._academicYearRepo.findById(dto.academicYearId);
    if (!academicYear || academicYear.isDeleted) {
      throw new NotFoundError('Academic year not found');
    }

    if (dto.teacherId) {
      const teacher = await this._teacherRepo.findById(dto.teacherId);
      if (!teacher || teacher.isDeleted) {
        throw new NotFoundError('Teacher not found');
      }
    }

    const existing = await this._batchRepo.findByName(
      dto.name,
      dto.courseId,
      dto.levelNumber,
      dto.centerId,
      dto.academicYearId
    );
    if (existing) {
      throw new ConflictError(
        `A batch named "${dto.name}" already exists for this course level, center, and academic year`
      );
    }

    const batch = Batch.createNew({
      name: dto.name,
      courseId: dto.courseId,
      levelNumber: dto.levelNumber,
      levelName: level.name,
      centerId: dto.centerId,
      academicYearId: dto.academicYearId,
      teacherId: dto.teacherId || undefined,
    });

    const saved = await this._batchRepo.create(batch);

    return {
      id: saved.id!,
      name: saved.name,
      courseId: saved.courseId,
      courseName: course.name,
      courseCode: course.code,
      levelNumber: saved.levelNumber,
      levelName: level.name,
      centerId: saved.centerId,
      centerName: center.name,
      academicYearId: saved.academicYearId,
      academicYearName: academicYear.name,
      teacherId: saved.teacherId,
      teacherName: saved.teacherName,
      teacherEmployeeId: saved.teacherEmployeeId,
      isActive: saved.isActive,
      isDeleted: saved.isDeleted,
      createdAt: saved.createdAt?.toISOString(),
      updatedAt: saved.updatedAt?.toISOString(),
    };
  }
}
