import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ISubjectAssignmentRepository } from '../../../domain/repositories/ISubjectAssignmentRepository';
import { ICourseRepository } from '../../../domain/repositories/ICourseRepository';
import { ISubjectRepository } from '../../../domain/repositories/ISubjectRepository';
import { ITeacherRepository } from '../../../domain/repositories/ITeacherRepository';
import { ICreateSubjectAssignmentUseCase } from '../../ports/use-cases/subject-assignments/ICreateSubjectAssignmentUseCase';
import {
  CreateSubjectAssignmentDTO,
  SubjectAssignmentResponseDTO,
} from '../../dto/subject-assignments/subjectAssignmentDtos';
import { SubjectAssignment } from '../../../domain/entities/SubjectAssignment';
import { ConflictError, NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class CreateSubjectAssignment implements ICreateSubjectAssignmentUseCase {
  constructor(
    @inject(TYPES.SubjectAssignmentRepository)
    private _assignmentRepo: ISubjectAssignmentRepository,
    @inject(TYPES.CourseRepository)
    private _courseRepo: ICourseRepository,
    @inject(TYPES.SubjectRepository)
    private _subjectRepo: ISubjectRepository,
    @inject(TYPES.TeacherRepository)
    private _teacherRepo: ITeacherRepository
  ) {}

  async execute(dto: CreateSubjectAssignmentDTO): Promise<SubjectAssignmentResponseDTO> {
    const course = await this._courseRepo.findById(dto.courseId);
    if (!course || course.isDeleted) {
      throw new NotFoundError('Selected course does not exist or has been deleted');
    }

    const level = course.levels.find((l) => l.levelNumber === Number(dto.levelNumber));
    if (!level) {
      throw new ValidationError(`Level ${dto.levelNumber} does not exist in course "${course.name}"`);
    }

    const subject = await this._subjectRepo.findById(dto.subjectId);
    if (!subject || subject.isDeleted) {
      throw new NotFoundError('Selected subject does not exist or has been deleted');
    }

    let teacherName: string | undefined;
    let teacherEmployeeId: string | undefined;
    if (dto.teacherId) {
      const teacher = await this._teacherRepo.findById(dto.teacherId);
      if (!teacher || teacher.isDeleted) {
        throw new NotFoundError('Selected teacher does not exist or has been deleted');
      }
      teacherName = `${teacher.firstName} ${teacher.lastName}`.trim();
      teacherEmployeeId = teacher.employeeId;
    }

    const existing = await this._assignmentRepo.findByCourseLevelAndSubject(
      dto.courseId,
      Number(dto.levelNumber),
      dto.subjectId
    );
    if (existing) {
      throw new ConflictError(
        `Subject "${subject.name}" is already assigned to ${level.name} of "${course.name}"`
      );
    }

    const entity = SubjectAssignment.createNew({
      courseId: dto.courseId,
      levelNumber: Number(dto.levelNumber),
      levelName: level.name,
      subjectId: dto.subjectId,
      teacherId: dto.teacherId || undefined,
    });

    const saved = await this._assignmentRepo.create(entity);

    return {
      id: saved.id!,
      courseId: saved.courseId,
      courseName: course.name,
      courseCode: course.code,
      levelNumber: saved.levelNumber,
      levelName: saved.levelName,
      subjectId: saved.subjectId,
      subjectName: subject.name,
      subjectCode: subject.code,
      teacherId: saved.teacherId,
      teacherName,
      teacherEmployeeId,
      isDeleted: saved.isDeleted,
      createdAt: saved.createdAt?.toISOString(),
      updatedAt: saved.updatedAt?.toISOString(),
    };
  }
}
