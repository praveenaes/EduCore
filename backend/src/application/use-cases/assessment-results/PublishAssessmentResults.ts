import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import {
  IPublishAssessmentResultsUseCase,
  PublishAssessmentResultsRequest,
} from '@/application/ports/use-cases/assessment-results/IPublishAssessmentResultsUseCase';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class PublishAssessmentResults implements IPublishAssessmentResultsUseCase {
  constructor(
    @inject(TYPES.AssessmentRepository)
    private _assessmentRepo: IAssessmentRepository,
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(
    req: PublishAssessmentResultsRequest
  ): Promise<{ id: string; status: string; isPublished: boolean }> {
    if (req.scheduleId) {
      const schedule = await this._scheduleRepo.findById(req.scheduleId);
      if (!schedule || schedule.isDeleted) {
        throw new NotFoundError(`Assessment schedule with id "${req.scheduleId}" not found`);
      }

      schedule.updateDetails({ isPublished: req.isPublished });
      await this._scheduleRepo.update(req.scheduleId, schedule);

      // Check all active schedules under the parent event to update parent event status if applicable
      const assessmentId = schedule.assessmentId;
      const allSchedules = await this._scheduleRepo.findByAssessmentId(assessmentId);
      const activeSchedules = allSchedules.filter((s) => !s.isDeleted);
      const allPublished =
        activeSchedules.length > 0 && activeSchedules.every((s) => s.isPublished);

      const assessment = await this._assessmentRepo.findById(assessmentId);
      if (assessment && !assessment.isDeleted) {
        if (allPublished) {
          assessment.updateDetails({ status: 'PUBLISHED' });
          await this._assessmentRepo.update(assessmentId, assessment);
        } else if (assessment.status === 'PUBLISHED' && !req.isPublished) {
          assessment.updateDetails({ status: 'COMPLETED' });
          await this._assessmentRepo.update(assessmentId, assessment);
        }
      }

      return {
        id: req.scheduleId,
        status: req.isPublished ? 'PUBLISHED' : schedule.isGraded ? 'GRADED' : 'COMPLETED',
        isPublished: req.isPublished,
      };
    }

    if (req.assessmentId) {
      const assessment = await this._assessmentRepo.findById(req.assessmentId);
      if (!assessment || assessment.isDeleted) {
        throw new NotFoundError(`Assessment event with id "${req.assessmentId}" not found`);
      }

      const newStatus = req.isPublished ? 'PUBLISHED' : 'COMPLETED';
      assessment.updateDetails({ status: newStatus });
      await this._assessmentRepo.update(req.assessmentId, assessment);

      // Update all schedules under this assessment
      const schedules = await this._scheduleRepo.findByAssessmentId(req.assessmentId);
      for (const s of schedules) {
        if (!s.isDeleted && (req.isPublished ? s.isGraded : true)) {
          s.updateDetails({ isPublished: req.isPublished });
          await this._scheduleRepo.update(s.id!, s);
        }
      }

      return {
        id: req.assessmentId,
        status: newStatus,
        isPublished: req.isPublished,
      };
    }

    throw new NotFoundError('Either assessmentId or scheduleId must be provided');
  }
}
