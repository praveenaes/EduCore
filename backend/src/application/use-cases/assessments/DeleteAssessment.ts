import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IDeleteAssessmentUseCase } from '@/application/ports/use-cases/assessments/IDeleteAssessmentUseCase';
import { NotFoundError, ConflictError } from '@/shared/errors/AppError';

@injectable()
export class DeleteAssessment implements IDeleteAssessmentUseCase {
  constructor(
    @inject(TYPES.AssessmentRepository) private _assessmentRepo: IAssessmentRepository,
    @inject(TYPES.AssessmentScheduleRepository) private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(id: string): Promise<void> {
    const assessment = await this._assessmentRepo.findById(id);
    if (!assessment || assessment.isDeleted) {
      throw new NotFoundError('Assessment not found');
    }

    const linkedSchedules = await this._scheduleRepo.findByAssessmentId(id);
    if (linkedSchedules.length > 0) {
      throw new ConflictError(
        `Cannot delete "${assessment.name}" because it is linked to ${linkedSchedules.length} scheduled exam.`
      );
    }

    await this._assessmentRepo.softDelete(id);
  }
}
