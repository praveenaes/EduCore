import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import {
  IAssessmentCriteriaRepository,
  AssessmentCriteriaFilters,
  AssessmentCriteriaPagination,
} from '@/domain/repositories/IAssessmentCriteriaRepository';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IGetAssessmentCriteriaUseCase } from '@/application/ports/use-cases/assessment-criteria/IGetAssessmentCriteriaUseCase';
import { AssessmentCriteriaListResultDTO } from '@/application/dto/assessments/assessmentCriteriaDtos';

@injectable()
export class GetAssessmentCriteria implements IGetAssessmentCriteriaUseCase {
  constructor(
    @inject(TYPES.AssessmentCriteriaRepository)
    private _criteriaRepo: IAssessmentCriteriaRepository,
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(
    filters: AssessmentCriteriaFilters,
    pagination: AssessmentCriteriaPagination
  ): Promise<AssessmentCriteriaListResultDTO> {
    const result = await this._criteriaRepo.findAll(filters, pagination);

    const criteriaWithStatus = await Promise.all(
      result.criteria.map(async (c) => {
        const schedules = await this._scheduleRepo.findByCriteriaId(c.id!);
        const hasCompletedSchedule = schedules.some(
          (s) =>
            !s.isDeleted &&
            (s.isCompleted ||
              s.isGraded ||
              s.assessmentStatus === 'COMPLETED' ||
              s.assessmentStatus === 'PUBLISHED')
        );

        return {
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
          hasCompletedSchedule,
          isDeleted: c.isDeleted,
          createdAt: c.createdAt,
          updatedAt: c.updatedAt,
        };
      })
    );

    return {
      criteria: criteriaWithStatus,
      total: result.total,
    };
  }
}
