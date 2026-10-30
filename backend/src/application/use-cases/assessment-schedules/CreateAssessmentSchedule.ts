import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { IAssessmentRepository } from '@/domain/repositories/IAssessmentRepository';
import { ICourseRepository } from '@/domain/repositories/ICourseRepository';
import { IAssessmentCriteriaRepository } from '@/domain/repositories/IAssessmentCriteriaRepository';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { ICenterRepository } from '@/domain/repositories/ICenterRepository';
import { ICreateAssessmentScheduleUseCase } from '@/application/ports/use-cases/assessment-schedules/ICreateAssessmentScheduleUseCase';
import {
  CreateAssessmentScheduleDTO,
  AssessmentScheduleResponseDTO,
} from '@/application/dto/assessments/assessmentScheduleDtos';
import { AssessmentSchedule } from '@/domain/entities/AssessmentSchedule';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class CreateAssessmentSchedule implements ICreateAssessmentScheduleUseCase {
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

  async execute(dto: CreateAssessmentScheduleDTO): Promise<AssessmentScheduleResponseDTO> {
    const assessment = await this._assessmentRepo.findById(dto.assessmentId);
    if (!assessment || assessment.isDeleted) {
      throw new NotFoundError('Selected assessment event not found');
    }

    const course = await this._courseRepo.findById(dto.courseId);
    if (!course || course.isDeleted) {
      throw new NotFoundError('Selected course not found');
    }

    const level = course.levels.find((l) => l.levelNumber === Number(dto.levelNumber));
    if (!level) {
      throw new ValidationError(`Level ${dto.levelNumber} does not exist in course "${course.name}"`);
    }

    const criteria = await this._criteriaRepo.findById(dto.criteriaId);
    if (!criteria || criteria.isDeleted) {
      throw new NotFoundError('Selected assessment criteria not found');
    }

    const batch = await this._batchRepo.findById(dto.batchId);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError('Selected batch not found');
    }

    const center = await this._centerRepo.findById(dto.centerId);
    if (!center || center.status === 'inactive') {
      throw new NotFoundError('Selected exam center not found');
    }

    // Academy / Center consistency: batch must take exams at its assigned academy
    if (batch.centerId && batch.centerId.toString() !== dto.centerId.toString()) {
      throw new ValidationError(
        `Exam center must match the assigned academy for batch "${batch.name}" (${batch.centerName || 'Assigned Center'})`
      );
    }

    const examDate = new Date(dto.examDate);
    if (isNaN(examDate.getTime())) {
      throw new ValidationError('Invalid exam date provided');
    }

    // Validate that examDate falls within the assessment event window
    const eventStart = new Date(assessment.startDate);
    const eventEnd = new Date(assessment.endDate);
    eventStart.setHours(0, 0, 0, 0);
    eventEnd.setHours(23, 59, 59, 999);
    const compareDate = new Date(examDate);
    compareDate.setHours(12, 0, 0, 0);

    if (compareDate < eventStart || compareDate > eventEnd) {
      throw new ValidationError(
        `Exam date must fall within the event window (${eventStart.toLocaleDateString()} to ${eventEnd.toLocaleDateString()})`
      );
    }

    if (dto.startTime >= dto.endTime) {
      throw new ValidationError('End time must be after start time');
    }

    // Check for duplicate schedule for the same batch, criteria, and assessment event
    const existing = await this._scheduleRepo.findByEventBatchCriteria(
      dto.assessmentId,
      dto.batchId,
      dto.criteriaId
    );
    if (existing) {
      throw new ConflictError(
        `A schedule already exists for batch "${batch.name}" and criteria "${criteria.name}" in this assessment event`
      );
    }

    // Check for overlapping exam time for the same batch on the same date
    const sameDaySchedules = await this._scheduleRepo.findByBatchAndDate(dto.batchId, examDate);
    const overlapping = sameDaySchedules.find(
      (s) => dto.startTime < s.endTime && dto.endTime > s.startTime
    );
    if (overlapping) {
      throw new ConflictError(
        `Batch "${batch.name}" already has an exam scheduled on this date from ${overlapping.startTime} to ${overlapping.endTime} ("${overlapping.criteriaName || 'Exam'}"). A batch cannot have overlapping exams on the same day.`
      );
    }

    const schedule = AssessmentSchedule.createNew({
      assessmentId: dto.assessmentId,
      courseId: dto.courseId,
      levelNumber: Number(dto.levelNumber),
      criteriaId: dto.criteriaId,
      batchId: dto.batchId,
      centerId: dto.centerId,
      examDate,
      startTime: dto.startTime.trim(),
      endTime: dto.endTime.trim(),
    });

    const saved = await this._scheduleRepo.create(schedule);

    return {
      id: saved.id!,
      assessmentId: saved.assessmentId,
      assessmentName: assessment.name,
      assessmentStatus: assessment.status,
      courseId: saved.courseId,
      courseName: course.name,
      courseCode: course.code,
      levelNumber: saved.levelNumber,
      levelName: level.name,
      criteriaId: saved.criteriaId,
      criteriaName: criteria.name,
      subjectId: criteria.subjectId,
      subjectName: criteria.subjectName,
      subjectCode: criteria.subjectCode,
      batchId: saved.batchId,
      batchName: batch.name,
      centerId: saved.centerId,
      centerName: center.name,
      centerCode: center.code,
      examDate: saved.examDate,
      startTime: saved.startTime,
      endTime: saved.endTime,
      isCompleted: saved.isCompleted,
      isGraded: false,
      isPublished: false,
      isDeleted: saved.isDeleted,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
