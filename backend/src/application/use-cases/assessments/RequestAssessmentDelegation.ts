import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IRequestAssessmentDelegationUseCase } from '@/application/ports/use-cases/assessments/IRequestAssessmentDelegationUseCase';
import {
  AssessmentResponseDTO,
  RequestAssessmentDelegationDTO,
} from '@/application/dto/assessments/assessmentDtos';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class RequestAssessmentDelegation implements IRequestAssessmentDelegationUseCase {
  constructor(
    @inject(TYPES.AssessmentRepository)
    private _assessmentRepo: IAssessmentRepository,
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(
    assessmentId: string,
    dto: RequestAssessmentDelegationDTO
  ): Promise<AssessmentResponseDTO> {
    const assessment = await this._assessmentRepo.findById(assessmentId);
    if (!assessment || assessment.isDeleted) {
      throw new NotFoundError(`Assessment event with id "${assessmentId}" not found`);
    }

    if (assessment.status !== 'COMPLETED') {
      throw new ValidationError(
        'Mark entry can only be delegated once the assessment event is marked as Completed'
      );
    }

    const trimmedReason = dto.reason?.trim();
    if (!trimmedReason) {
      throw new ValidationError('A reason must be provided when requesting admin mark entry');
    }

    // Update event delegation
    assessment.requestDelegation(trimmedReason);
    await this._assessmentRepo.update(assessmentId, assessment);

    // Cascade to all schedules under this assessment
    const linkedSchedules = await this._scheduleRepo.findByAssessmentId(assessmentId);
    for (const schedule of linkedSchedules) {
      if (!schedule.isDeleted) {
        schedule.requestDelegation(trimmedReason);
        await this._scheduleRepo.update(schedule.id!, schedule);
      }
    }

    const updated = await this._assessmentRepo.findById(assessmentId);

    return {
      id: updated!.id!,
      name: updated!.name,
      academicYearId: updated!.academicYearId,
      courseId: updated!.courseId,
      levelNumber: updated!.levelNumber,
      startDate: updated!.startDate,
      endDate: updated!.endDate,
      status: updated!.status,
      isDeleted: updated!.isDeleted,
      academicYearName: updated!.academicYearName,
      academicYearCode: updated!.academicYearCode,
      courseName: updated!.courseName,
      courseCode: updated!.courseCode,
      levelName: updated!.levelName,
      delegationStatus: updated!.delegationStatus,
      delegationReason: updated!.delegationReason,
      delegatedAt: updated!.delegatedAt,
      delegationReviewedAt: updated!.delegationReviewedAt,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    };
  }
}
