import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ITeacherRepository, TeacherBatchFilters } from "@/domain/repositories/ITeacherRepository";
import { ISubjectAssignmentRepository, SubjectAssignmentPagination } from "@/domain/repositories/ISubjectAssignmentRepository";
import { IGetTeacherSubjects } from "../../ports/use-cases/teachers/IGetTeacherSubjectsUseCase";
import { TeacherSubjectListResultDTO } from "../../dto/teachers/teacherSubjectDtos";
import { NotFoundError } from "@/shared/errors/AppError";

@injectable()
export class GetTeacherSubjects implements IGetTeacherSubjects {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.SubjectAssignmentRepository) private _subjectAssignmentRepo: ISubjectAssignmentRepository
  ) {}

  async execute(
    filters: TeacherBatchFilters,
    pagination: SubjectAssignmentPagination
  ): Promise<TeacherSubjectListResultDTO> {
    const teacher = await this._teacherRepo.findByUserId(filters.userId);
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found.");
    }

    const result = await this._subjectAssignmentRepo.findAll(
      {
        teacherId: teacher.id!,
        search: filters.search,
      },
      pagination
    );

    return {
      subjects: result.assignments.map((a) => ({
        id: a.id!,
        subjectId: a.subjectId,
        subjectName: a.subjectName ?? "N/A",
        subjectCode: a.subjectCode ?? "N/A",
        courseId: a.courseId,
        courseName: a.courseName ?? "N/A",
        courseCode: a.courseCode,
        levelNumber: a.levelNumber,
        levelName: a.levelName,
      })),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(result.total / pagination.limit) || 1,
    };
  }
}
