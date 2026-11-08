import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { IGetAssessmentByIdUseCase } from '@/application/ports/use-cases/assessments/IGetAssessmentByIdUseCase';
import { AssessmentResponseDTO } from '@/application/dto/assessments/assessmentDtos';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class GetAssessmentById implements IGetAssessmentByIdUseCase {
  constructor(
    @inject(TYPES.AssessmentRepository) private _assessmentRepo: IAssessmentRepository
  ) {}

  async execute(id: string): Promise<AssessmentResponseDTO> {
    const assessment = await this._assessmentRepo.findById(id);
    if (!assessment || assessment.isDeleted) {
      throw new NotFoundError(`Assessment with id "${id}" not found`);
    }

    return {
      id: assessment.id!,
      name: assessment.name,
      academicYearId: assessment.academicYearId,
      academicYearName: assessment.academicYearName,
      academicYearCode: assessment.academicYearCode,
      courseId: assessment.courseId,
      courseName: assessment.courseName,
      courseCode: assessment.courseCode,
      levelNumber: assessment.levelNumber,
      levelName: assessment.levelName,
      startDate: assessment.startDate,
      endDate: assessment.endDate,
      status: assessment.status,
      delegationStatus: assessment.delegationStatus,
      delegationReason: assessment.delegationReason,
      delegatedAt: assessment.delegatedAt,
      delegationReviewedAt: assessment.delegationReviewedAt,
      isDeleted: assessment.isDeleted,
      createdAt: assessment.createdAt,
      updatedAt: assessment.updatedAt,
    };
  }
}
