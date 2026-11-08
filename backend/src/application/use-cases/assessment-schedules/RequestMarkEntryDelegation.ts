import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IRequestMarkEntryDelegationUseCase } from '@/application/ports/use-cases/assessment-schedules/IRequestMarkEntryDelegationUseCase';
import {
  AssessmentScheduleResponseDTO,
  RequestDelegationDTO,
} from '@/application/dto/assessments/assessmentScheduleDtos';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class RequestMarkEntryDelegation implements IRequestMarkEntryDelegationUseCase {
  constructor(
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository
  ) {}

  async execute(
    scheduleId: string,
    dto: RequestDelegationDTO
  ): Promise<AssessmentScheduleResponseDTO> {
    const schedule = await this._scheduleRepo.findById(scheduleId);
    if (!schedule || schedule.isDeleted) {
      throw new NotFoundError(`Assessment schedule with id "${scheduleId}" not found`);
    }

    if (!schedule.isCompleted) {
      throw new ValidationError(
        'Mark entry can only be delegated after the exam has been marked as completed'
      );
    }

    if (schedule.isGraded) {
      throw new ValidationError('Marks have already been entered for this exam');
    }

    const trimmedReason = dto.reason?.trim();
    if (!trimmedReason) {
      throw new ValidationError('A reason must be provided when requesting admin mark entry');
    }

    schedule.requestDelegation(trimmedReason);
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
