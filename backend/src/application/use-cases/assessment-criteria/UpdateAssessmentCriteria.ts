import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentCriteriaRepository } from '@/domain/repositories/IAssessmentCriteriaRepository';
import { IAssessmentScheduleRepository } from '@/domain/repositories/IAssessmentScheduleRepository';
import { ICourseRepository } from '@/domain/repositories/ICourseRepository';
import { ISubjectRepository } from '@/domain/repositories/ISubjectRepository';
import { IUpdateAssessmentCriteriaUseCase } from '@/application/ports/use-cases/assessment-criteria/IUpdateAssessmentCriteriaUseCase';
import {
  UpdateAssessmentCriteriaDTO,
  AssessmentCriteriaResponseDTO,
} from '@/application/dto/assessments/assessmentCriteriaDtos';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class UpdateAssessmentCriteria implements IUpdateAssessmentCriteriaUseCase {
  constructor(
    @inject(TYPES.AssessmentCriteriaRepository)
    private _criteriaRepo: IAssessmentCriteriaRepository,
    @inject(TYPES.AssessmentScheduleRepository)
    private _scheduleRepo: IAssessmentScheduleRepository,
    @inject(TYPES.CourseRepository)
    private _courseRepo: ICourseRepository,
    @inject(TYPES.SubjectRepository)
    private _subjectRepo: ISubjectRepository
  ) {}

  async execute(id: string, dto: UpdateAssessmentCriteriaDTO): Promise<AssessmentCriteriaResponseDTO> {
    const criteria = await this._criteriaRepo.findById(id);
    if (!criteria || criteria.isDeleted) {
      throw new NotFoundError(`Assessment criteria with id "${id}" not found`);
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
        `Cannot edit "${criteria.name}" because it is linked to completed exam schedules.`
      );
    }

    const courseId = dto.courseId ?? criteria.courseId;
    const levelNumber =
      dto.levelNumber !== undefined ? Number(dto.levelNumber) : criteria.levelNumber;
    const subjectId = dto.subjectId ?? criteria.subjectId;
    const name = dto.name !== undefined ? dto.name.trim() : criteria.name;

    const maxMarks = dto.maxMarks !== undefined ? Number(dto.maxMarks) : criteria.maxMarks;
    const passMarks = dto.passMarks !== undefined ? Number(dto.passMarks) : criteria.passMarks;

    if (passMarks > maxMarks) {
      throw new ValidationError('Passing marks cannot exceed maximum marks');
    }

    if (dto.courseId && dto.courseId !== criteria.courseId) {
      const course = await this._courseRepo.findById(courseId);
      if (!course || course.isDeleted) {
        throw new NotFoundError('Selected course not found');
      }
      const level = course.levels.find((l) => l.levelNumber === levelNumber);
      if (!level) {
        throw new ValidationError(`Level ${levelNumber} does not exist in course "${course.name}"`);
      }
    }

    if (dto.subjectId && dto.subjectId !== criteria.subjectId) {
      const subject = await this._subjectRepo.findById(subjectId);
      if (!subject || subject.isDeleted) {
        throw new NotFoundError('Selected subject not found');
      }
    }

    const targetName = dto.name !== undefined ? dto.name.trim() : criteria.name;
    const targetCourseId = dto.courseId ?? criteria.courseId;
    const targetLevelNumber =
      dto.levelNumber !== undefined ? Number(dto.levelNumber) : criteria.levelNumber;
    const targetSubjectId = dto.subjectId ?? criteria.subjectId;

    const existing = await this._criteriaRepo.findByNameAndScope(
      targetName,
      targetCourseId,
      targetLevelNumber,
      targetSubjectId
    );
    if (existing && existing.id !== id) {
      throw new ConflictError(
        `Criteria "${targetName}" already exists for this course, level, and subject.`
      );
    }

    criteria.updateDetails({
      name: dto.name,
      courseId: dto.courseId,
      levelNumber: dto.levelNumber !== undefined ? Number(dto.levelNumber) : undefined,
      subjectId: dto.subjectId,
      assessmentType: dto.assessmentType,
      maxMarks: dto.maxMarks !== undefined ? Number(dto.maxMarks) : undefined,
      passMarks: dto.passMarks !== undefined ? Number(dto.passMarks) : undefined,
      hasCe: dto.hasCe,
    });

    await this._criteriaRepo.update(id, criteria);
    const updated = await this._criteriaRepo.findById(id);

    return {
      id: updated!.id!,
      name: updated!.name,
      courseId: updated!.courseId,
      courseName: updated!.courseName,
      courseCode: updated!.courseCode,
      levelNumber: updated!.levelNumber,
      levelName: updated!.levelName,
      subjectId: updated!.subjectId,
      subjectName: updated!.subjectName,
      subjectCode: updated!.subjectCode,
      assessmentType: updated!.assessmentType,
      maxMarks: updated!.maxMarks,
      passMarks: updated!.passMarks,
      hasCe: updated!.hasCe,
      isDeleted: updated!.isDeleted,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    };
  }
}
