import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import {
  IPublishAssessmentResultsUseCase,
  PublishAssessmentResultsRequest,
} from '@/application/ports/use-cases/assessment-results/IPublishAssessmentResultsUseCase';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class PublishAssessmentResults implements IPublishAssessmentResultsUseCase {
  constructor(
    @inject(TYPES.AssessmentRepository)
    private _assessmentRepo: IAssessmentRepository
  ) {}

  async execute(req: PublishAssessmentResultsRequest): Promise<{ id: string; status: string }> {
    const assessment = await this._assessmentRepo.findById(req.assessmentId);
    if (!assessment || assessment.isDeleted) {
      throw new NotFoundError(`Assessment event with id "${req.assessmentId}" not found`);
    }

    const newStatus = req.isPublished ? 'PUBLISHED' : 'DRAFT';
    assessment.updateDetails({ status: newStatus });

    await this._assessmentRepo.update(req.assessmentId, assessment);

    return {
      id: req.assessmentId,
      status: newStatus,
    };
  }
}
