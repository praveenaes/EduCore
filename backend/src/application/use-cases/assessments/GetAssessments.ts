import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  IAssessmentRepository,
  AssessmentFilters,
  AssessmentPagination,
} from '@/domain/repositories/IAssessmentRepository';
import { IGetAssessmentsUseCase } from '@/application/ports/use-cases/assessments/IGetAssessmentsUseCase';
import { AssessmentListResultDTO } from '@/application/dto/assessments/assessmentDtos';

@injectable()
export class GetAssessments implements IGetAssessmentsUseCase {
  constructor(
    @inject(TYPES.AssessmentRepository) private _assessmentRepo: IAssessmentRepository
  ) {}

  async execute(
    filters: AssessmentFilters,
    pagination: AssessmentPagination
  ): Promise<AssessmentListResultDTO> {
    const result = await this._assessmentRepo.findAll(filters, pagination);
    return {
      assessments: result.assessments.map((a) => ({
        id: a.id!,
        name: a.name,
        academicYearId: a.academicYearId,
        academicYearName: a.academicYearName,
        academicYearCode: a.academicYearCode,
        startDate: a.startDate,
        endDate: a.endDate,
        status: a.status,
        isDeleted: a.isDeleted,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
      total: result.total,
    };
  }
}
