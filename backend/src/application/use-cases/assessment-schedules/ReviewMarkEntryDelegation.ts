import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IReviewMarkEntryDelegationUseCase } from '@/application/ports/use-cases/assessment-schedules/IReviewMarkEntryDelegationUseCase';
import {
  AssessmentScheduleResponseDTO,
  ReviewDelegationDTO,
} from '@/application/dto/assessments/assessmentScheduleDtos';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class ReviewMarkEntryDelegation implements IReviewMarkEntryDelegationUseCase {
  constructor(
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(
    scheduleId: string,
    dto: ReviewDelegationDTO
  ): Promise<AssessmentScheduleResponseDTO> {
    const schedule = await this._scheduleRepo.findById(scheduleId);
    if (!schedule || schedule.isDeleted) {
      throw new NotFoundError(`Assessment schedule with id "${scheduleId}" not found`);
    }

    if (schedule.delegationStatus !== 'REQUESTED') {
      throw new ValidationError(
        'Only pending delegation requests can be reviewed'
      );
    }

    if (dto.status !== 'APPROVED' && dto.status !== 'REJECTED') {
      throw new ValidationError('Status must be either APPROVED or REJECTED');
    }

    schedule.reviewDelegation(dto.status);
    await this._scheduleRepo.update(scheduleId, schedule);

    const updated = await this._scheduleRepo.findById(scheduleId);

    return {
      id: updated!.id!,
      assessmentId: updated!.assessmentId,
      assessmentName: updated!.assessmentName,
      assessmentStatus: updated!.assessmentStatus,
      courseId: updated!.courseId,
      courseName: updated!.courseName,
      courseCode: updated!.courseCode,
      levelNumber: updated!.levelNumber,
      levelName: updated!.levelName,
      criteriaId: updated!.criteriaId,
      criteriaName: updated!.criteriaName,
      subjectId: updated!.subjectId,
      subjectName: updated!.subjectName,
      subjectCode: updated!.subjectCode,
      batchId: updated!.batchId,
      batchName: updated!.batchName,
      centerId: updated!.centerId,
      centerName: updated!.centerName,
      centerCode: updated!.centerCode,
      examDate: updated!.examDate,
      startTime: updated!.startTime,
      endTime: updated!.endTime,
      isCompleted: updated!.isCompleted,
      isGraded: updated!.isGraded,
      isPublished: updated!.isPublished,
      delegationStatus: updated!.delegationStatus,
      delegationReason: updated!.delegationReason,
      delegatedAt: updated!.delegatedAt,
      delegationReviewedAt: updated!.delegationReviewedAt,
      isDeleted: updated!.isDeleted,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    };
  }
}
