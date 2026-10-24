import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  IAssessmentCriteriaRepository,
  AssessmentCriteriaFilters,
  AssessmentCriteriaPagination,
} from '@/domain/repositories/IAssessmentCriteriaRepository';
import { IGetAssessmentCriteriaUseCase } from '@/application/ports/use-cases/assessment-criteria/IGetAssessmentCriteriaUseCase';
import { AssessmentCriteriaListResultDTO } from '@/application/dto/assessments/assessmentCriteriaDtos';

@injectable()
export class GetAssessmentCriteria implements IGetAssessmentCriteriaUseCase {
  constructor(
    @inject(TYPES.AssessmentCriteriaRepository)
    private _criteriaRepo: IAssessmentCriteriaRepository
  ) {}

  async execute(
    filters: AssessmentCriteriaFilters,
    pagination: AssessmentCriteriaPagination
  ): Promise<AssessmentCriteriaListResultDTO> {
    const result = await this._criteriaRepo.findAll(filters, pagination);

    return {
      criteria: result.criteria.map((c) => ({
        id: c.id!,
        name: c.name,
        courseId: c.courseId,
        courseName: c.courseName,
        courseCode: c.courseCode,
        levelNumber: c.levelNumber,
        levelName: c.levelName,
        subjectId: c.subjectId,
        subjectName: c.subjectName,
        subjectCode: c.subjectCode,
        assessmentType: c.assessmentType,
        maxMarks: c.maxMarks,
        passMarks: c.passMarks,
        hasCe: c.hasCe,
        isDeleted: c.isDeleted,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      total: result.total,
    };
  }
}
