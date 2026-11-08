import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { IAcademicYearRepository } from '@/domain/repositories/IAcademicYearRepository';
import { ICourseRepository } from '@/domain/repositories/ICourseRepository';
import { ICreateAssessmentUseCase } from '@/application/ports/use-cases/assessments/ICreateAssessmentUseCase';
import { CreateAssessmentDTO, AssessmentResponseDTO } from '@/application/dto/assessments/assessmentDtos';
import { Assessment } from '@/domain/entities/Assessment';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class CreateAssessment implements ICreateAssessmentUseCase {
  constructor(
    @inject(TYPES.AssessmentRepository) private _assessmentRepo: IAssessmentRepository,
    @inject(TYPES.AcademicYearRepository) private _academicYearRepo: IAcademicYearRepository,
    @inject(TYPES.CourseRepository) private _courseRepo: ICourseRepository
  ) {}

  async execute(dto: CreateAssessmentDTO): Promise<AssessmentResponseDTO> {
    const academicYear = await this._academicYearRepo.findById(dto.academicYearId);
    if (!academicYear || academicYear.isDeleted) {
      throw new NotFoundError('Academic year not found');
    }

    const course = await this._courseRepo.findById(dto.courseId);
    if (!course || course.isDeleted) {
      throw new NotFoundError('Course not found');
    }

    const selectedLevel = course.levels.find((l) => l.levelNumber === dto.levelNumber);
    if (!selectedLevel) {
      throw new ValidationError(`Level ${dto.levelNumber} is invalid for course "${course.name}"`);
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new ValidationError('Invalid start or end date');
    }

    if (startDate > endDate) {
      throw new ValidationError('End date must be on or after start date');
    }

    const existing = await this._assessmentRepo.findByName(
      dto.name,
      dto.academicYearId,
      dto.courseId,
      dto.levelNumber
    );
    if (existing) {
      throw new ConflictError(
        `Assessment "${dto.name}" already exists for course "${course.name}" (${selectedLevel.name}) in this academic year`
      );
    }

    const assessment = Assessment.createNew({
      name: dto.name,
      academicYearId: dto.academicYearId,
      courseId: dto.courseId,
      levelNumber: dto.levelNumber,
      startDate,
      endDate,
      status: dto.status || 'SCHEDULED',
    });

    const saved = await this._assessmentRepo.create(assessment);

    return {
      id: saved.id!,
      name: saved.name,
      academicYearId: saved.academicYearId,
      courseId: saved.courseId,
      levelNumber: saved.levelNumber,
      startDate: saved.startDate,
      endDate: saved.endDate,
      status: saved.status,
      isDeleted: saved.isDeleted,
      academicYearName: academicYear.name,
      academicYearCode: academicYear.code,
      courseName: course.name,
      courseCode: course.code,
      levelName: selectedLevel.name,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
