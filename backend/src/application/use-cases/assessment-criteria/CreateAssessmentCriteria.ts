import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IAssessmentCriteriaRepository } from '@/domain/repositories/IAssessmentCriteriaRepository';
import { ICourseRepository } from '@/domain/repositories/ICourseRepository';
import { ISubjectRepository } from '@/domain/repositories/ISubjectRepository';
import { ICreateAssessmentCriteriaUseCase } from '@/application/ports/use-cases/assessment-criteria/ICreateAssessmentCriteriaUseCase';
import {
  CreateAssessmentCriteriaDTO,
  AssessmentCriteriaResponseDTO,
} from '@/application/dto/assessments/assessmentCriteriaDtos';
import { AssessmentCriteria } from '@/domain/entities/AssessmentCriteria';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class CreateAssessmentCriteria implements ICreateAssessmentCriteriaUseCase {
  constructor(
    @inject(TYPES.AssessmentCriteriaRepository)
    private _criteriaRepo: IAssessmentCriteriaRepository,
    @inject(TYPES.CourseRepository)
    private _courseRepo: ICourseRepository,
    @inject(TYPES.SubjectRepository)
    private _subjectRepo: ISubjectRepository
  ) {}

  async execute(dto: CreateAssessmentCriteriaDTO): Promise<AssessmentCriteriaResponseDTO> {
    const course = await this._courseRepo.findById(dto.courseId);
    if (!course || course.isDeleted) {
      throw new NotFoundError('Selected course not found');
    }

    const level = course.levels.find((l) => l.levelNumber === Number(dto.levelNumber));
    if (!level) {
      throw new ValidationError(`Level ${dto.levelNumber} does not exist in course "${course.name}"`);
    }

    const subject = await this._subjectRepo.findById(dto.subjectId);
    if (!subject || subject.isDeleted) {
      throw new NotFoundError('Selected subject not found');
    }

    if (Number(dto.passMarks) > Number(dto.maxMarks)) {
      throw new ValidationError('Passing marks cannot exceed maximum marks');
    }

    const existing = await this._criteriaRepo.findByNameAndScope(
      dto.name,
      dto.courseId,
      Number(dto.levelNumber),
      dto.subjectId
    );
    if (existing) {
      throw new ConflictError(
        `Criteria "${dto.name}" already exists for this course, level, and subject.`
      );
    }

    const criteria = AssessmentCriteria.createNew({
      name: dto.name,
      courseId: dto.courseId,
      levelNumber: Number(dto.levelNumber),
      subjectId: dto.subjectId,
      assessmentType: dto.assessmentType,
      maxMarks: Number(dto.maxMarks),
      passMarks: Number(dto.passMarks),
      hasCe: Boolean(dto.hasCe),
    });

    const saved = await this._criteriaRepo.create(criteria);

    return {
      id: saved.id!,
      name: saved.name,
      courseId: saved.courseId,
      courseName: course.name,
      courseCode: course.code,
      levelNumber: saved.levelNumber,
      levelName: level.name,
      subjectId: saved.subjectId,
      subjectName: subject.name,
      subjectCode: subject.code,
      assessmentType: saved.assessmentType,
      maxMarks: saved.maxMarks,
      passMarks: saved.passMarks,
      hasCe: saved.hasCe,
      isDeleted: saved.isDeleted,
      createdAt: saved.createdAt,
      updatedAt: saved.updatedAt,
    };
  }
}
