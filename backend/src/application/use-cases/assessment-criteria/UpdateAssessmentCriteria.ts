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

    const { name, courseId, levelNumber, subjectId, assessmentType, maxMarks, passMarks, hasCe } = dto;
    const parsedLevelNumber = Number(levelNumber);
    const parsedMaxMarks = Number(maxMarks);
    const parsedPassMarks = Number(passMarks);

    if (parsedPassMarks > parsedMaxMarks) {
      throw new ValidationError('Passing marks cannot exceed maximum marks');
    }

    if (courseId !== criteria.courseId || parsedLevelNumber !== criteria.levelNumber) {
      const course = await this._courseRepo.findById(courseId);
      if (!course || course.isDeleted) {
        throw new NotFoundError('Selected course not found');
      }
      const level = course.levels.find((l) => l.levelNumber === parsedLevelNumber);
      if (!level) {
        throw new ValidationError(`Level ${parsedLevelNumber} does not exist in course "${course.name}"`);
      }
    }

    if (subjectId !== criteria.subjectId) {
      const subject = await this._subjectRepo.findById(subjectId);
      if (!subject || subject.isDeleted) {
        throw new NotFoundError('Selected subject not found');
      }
    }

    const trimmedName = name.trim();
    const existing = await this._criteriaRepo.findByNameAndScope(
      trimmedName,
      courseId,
      parsedLevelNumber,
      subjectId
    );
    if (existing && existing.id !== id) {
      throw new ConflictError(
        `Criteria "${trimmedName}" already exists for this course, level, and subject.`
      );
    }

    criteria.updateDetails({
      name: trimmedName,
      courseId,
      levelNumber: parsedLevelNumber,
      subjectId,
      assessmentType,
      maxMarks: parsedMaxMarks,
      passMarks: parsedPassMarks,
      hasCe: Boolean(hasCe),
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
