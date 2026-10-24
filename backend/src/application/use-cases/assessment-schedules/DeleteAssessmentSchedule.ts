import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IDeleteAssessmentScheduleUseCase } from '@/application/ports/use-cases/assessment-schedules/IDeleteAssessmentScheduleUseCase';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class DeleteAssessmentSchedule implements IDeleteAssessmentScheduleUseCase {
  constructor(
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(id: string): Promise<void> {
    const schedule = await this._scheduleRepo.findById(id);
    if (!schedule || schedule.isDeleted) {
      throw new NotFoundError(`Assessment schedule with id "${id}" not found`);
    }

    await this._scheduleRepo.softDelete(id);
  }
}
