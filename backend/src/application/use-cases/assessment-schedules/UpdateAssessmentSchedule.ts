import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { ICourseRepository } from '@/domain/repositories/ICourseRepository';
import { IAssessmentCriteriaRepository } from '@/domain/repositories/IAssessmentCriteriaRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { ICenterRepository } from '@/domain/repositories/ICenterRepository';
import { IUpdateAssessmentScheduleUseCase } from '@/application/ports/use-cases/assessment-schedules/IUpdateAssessmentScheduleUseCase';
import {
  UpdateAssessmentScheduleDTO,
  AssessmentScheduleResponseDTO,
} from '@/application/dto/assessments/assessmentScheduleDtos';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class UpdateAssessmentSchedule implements IUpdateAssessmentScheduleUseCase {
  constructor(
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository,
    @inject(TYPES.AssessmentRepository)
    private _assessmentRepo: IAssessmentRepository,
    @inject(TYPES.CourseRepository)
    private _courseRepo: ICourseRepository,
    @inject(TYPES.AssessmentCriteriaRepository)
    private _criteriaRepo: IAssessmentCriteriaRepository,
    @inject(TYPES.BatchRepository)
    private _batchRepo: IBatchRepository,
    @inject(TYPES.CenterRepository)
    private _centerRepo: ICenterRepository
  ) {}

  async execute(id: string, dto: UpdateAssessmentScheduleDTO): Promise<AssessmentScheduleResponseDTO> {
    const schedule = await this._scheduleRepo.findById(id);
    if (!schedule || schedule.isDeleted) {
      throw new NotFoundError(`Assessment schedule with id "${id}" not found`);
    }

    const assessmentId = dto.assessmentId ?? schedule.assessmentId;
    const courseId = dto.courseId ?? schedule.courseId;
    const levelNumber = dto.levelNumber !== undefined ? Number(dto.levelNumber) : schedule.levelNumber;
    const criteriaId = dto.criteriaId ?? schedule.criteriaId;
    const batchId = dto.batchId ?? schedule.batchId;
    const centerId = dto.centerId ?? schedule.centerId;

    const assessment = await this._assessmentRepo.findById(assessmentId);
    if (!assessment || assessment.isDeleted) {
      throw new NotFoundError('Selected assessment event not found');
    }

    if (dto.courseId && dto.courseId !== schedule.courseId) {
      const course = await this._courseRepo.findById(courseId);
      if (!course || course.isDeleted) {
        throw new NotFoundError('Selected course not found');
      }
      const level = course.levels.find((l) => l.levelNumber === levelNumber);
      if (!level) {
        throw new ValidationError(`Level ${levelNumber} does not exist in course "${course.name}"`);
      }
    }

    if (dto.criteriaId && dto.criteriaId !== schedule.criteriaId) {
      const criteria = await this._criteriaRepo.findById(criteriaId);
      if (!criteria || criteria.isDeleted) {
        throw new NotFoundError('Selected assessment criteria not found');
      }
    }

    const batch = await this._batchRepo.findById(batchId);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError('Selected batch not found');
    }

    if (dto.centerId && dto.centerId !== schedule.centerId) {
      const center = await this._centerRepo.findById(centerId);
      if (!center || center.status === 'inactive') {
        throw new NotFoundError('Selected exam center not found');
      }
    }

    // Academy / Center consistency check: batch must take exams at its assigned academy
    if (batch.centerId && batch.centerId.toString() !== centerId.toString()) {
      throw new ValidationError(
        `Exam center must match the assigned academy for batch "${batch.name}" (${batch.centerName || 'Assigned Center'})`
      );
    }

    let parsedExamDate: Date | undefined;
    if (dto.examDate !== undefined) {
      parsedExamDate = new Date(dto.examDate);
      if (isNaN(parsedExamDate.getTime())) {
        throw new ValidationError('Invalid exam date provided');
      }

      const eventStart = new Date(assessment.startDate);
      const eventEnd = new Date(assessment.endDate);
      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(23, 59, 59, 999);
      const compareDate = new Date(parsedExamDate);
      compareDate.setHours(12, 0, 0, 0);

      if (compareDate < eventStart || compareDate > eventEnd) {
        throw new ValidationError(
          `Exam date must fall within the event window (${eventStart.toLocaleDateString()} to ${eventEnd.toLocaleDateString()})`
        );
      }
    }

    const startTime = dto.startTime ?? schedule.startTime;
    const endTime = dto.endTime ?? schedule.endTime;
    if (startTime >= endTime) {
      throw new ValidationError('End time must be after start time');
    }

    // Check conflict if assessment, batch, or criteria changed
    const isScopeChanged =
      assessmentId !== schedule.assessmentId ||
      batchId !== schedule.batchId ||
      criteriaId !== schedule.criteriaId;

    if (isScopeChanged) {
      const existing = await this._scheduleRepo.findByEventBatchCriteria(
        assessmentId,
        batchId,
        criteriaId
      );
      if (existing && existing.id !== id) {
        throw new ConflictError(
          'A schedule already exists for this batch and criteria in this assessment event'
        );
      }
    }

    // Check for overlapping exam time for the same batch on the same date
    const effectiveExamDate = parsedExamDate ?? schedule.examDate;
    const sameDaySchedules = await this._scheduleRepo.findByBatchAndDate(batchId, effectiveExamDate);
    const overlapping = sameDaySchedules.find(
      (s) => s.id !== id && startTime < s.endTime && endTime > s.startTime
    );
    if (overlapping) {
      throw new ConflictError(
        `Batch "${batch.name}" already has an exam scheduled on this date from ${overlapping.startTime} to ${overlapping.endTime} ("${overlapping.criteriaName || 'Exam'}"). A batch cannot have overlapping exams on the same day.`
      );
    }

    schedule.updateDetails({
      assessmentId: dto.assessmentId,
      courseId: dto.courseId,
      levelNumber: dto.levelNumber !== undefined ? Number(dto.levelNumber) : undefined,
      criteriaId: dto.criteriaId,
      batchId: dto.batchId,
      centerId: dto.centerId,
      examDate: parsedExamDate,
      startTime: dto.startTime?.trim(),
      endTime: dto.endTime?.trim(),
      isCompleted: dto.isCompleted,
    });

    await this._scheduleRepo.update(id, schedule);
    const updated = await this._scheduleRepo.findById(id);

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
      isDeleted: updated!.isDeleted,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    };
  }
}
