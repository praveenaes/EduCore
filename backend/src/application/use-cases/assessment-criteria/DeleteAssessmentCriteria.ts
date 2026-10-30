import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentCriteriaRepository } from '@/domain/repositories/IAssessmentCriteriaRepository';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IDeleteAssessmentCriteriaUseCase } from '@/application/ports/use-cases/assessment-criteria/IDeleteAssessmentCriteriaUseCase';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';

@injectable()
export class DeleteAssessmentCriteria implements IDeleteAssessmentCriteriaUseCase {
  constructor(
    @inject(TYPES.AssessmentCriteriaRepository)
    private _criteriaRepo: IAssessmentCriteriaRepository,
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(id: string): Promise<void> {
    const criteria = await this._criteriaRepo.findById(id);
    if (!criteria || criteria.isDeleted) {
      throw new NotFoundError('Assessment criteria not found');
    }

    const linkedSchedules = await this._scheduleRepo.findByCriteriaId(id);
    const hasCompletedSchedule = linkedSchedules.some(
      (s) =>
        !s.isDeleted &&
        (s.isCompleted ||
          s.isGraded ||
          s.assessmentStatus === 'COMPLETED' ||
          s.assessmentStatus === 'PUBLISHED')
    );
    if (hasCompletedSchedule) {
      throw new ConflictError(
        `Cannot delete "${criteria.name}" because it is linked to completed exam schedules.`
      );
    }
    if (linkedSchedules.length > 0) {
      throw new ConflictError(
        `Cannot delete "${criteria.name}" because it is active under scheduled exam.`
      );
    }

    await this._criteriaRepo.softDelete(id);
  }
}
