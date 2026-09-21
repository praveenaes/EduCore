import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IGetStudentCurriculum } from "../../ports/use-cases/students/IGetStudentCurriculumUseCase";
import { StudentAcademicCurriculumDTO } from "../../dto/students/studentCurriculumDtos";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { IBatchRepository } from "@/domain/repositories/IBatchRepository";
import { ICourseRepository } from "@/domain/repositories/ICourseRepository";
import { IProgramRepository } from "@/domain/repositories/IProgramRepository";
import { ISubjectAssignmentRepository } from "@/domain/repositories/ISubjectAssignmentRepository";
import { NotFoundError } from "@/shared/errors/AppError";

@injectable()
export class GetStudentCurriculum implements IGetStudentCurriculum {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository,
    @inject(TYPES.CourseRepository) private _courseRepo: ICourseRepository,
    @inject(TYPES.ProgramRepository) private _programRepo: IProgramRepository,
    @inject(TYPES.SubjectAssignmentRepository) private _subjectAssignmentRepo: ISubjectAssignmentRepository
  ) {}

  async execute(userId: string): Promise<StudentAcademicCurriculumDTO> {
    const student = await this._studentRepo.findByUserId(userId);
    if (!student) {
      throw new NotFoundError("Student profile not found.");
    }

    if (!student.batchId) {
      throw new NotFoundError("Student is not assigned to any batch.");
    }

    const batch = await this._batchRepo.findById(student.batchId);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError("Batch details not found.");
    }

    const course = await this._courseRepo.findById(batch.courseId);
    let programName = "N/A";
    let programCode = "N/A";
    let programId: string | undefined;

    if (course && course.programId) {
      const program = await this._programRepo.findById(course.programId);
      if (program) {
        programId = program.id;
        programName = program.name;
        programCode = program.code;
      }
    }

    const assignmentsResult = await this._subjectAssignmentRepo.findAll(
      { courseId: batch.courseId, levelNumber: batch.levelNumber },
      { page: 1, limit: 100 }
    );

    const subjects = assignmentsResult.assignments.map((a) => ({
      id: a.subjectId,
      name: a.subjectName || "Unknown Subject",
      code: a.subjectCode || "N/A",
      teacherName: a.teacherName || "Not Assigned",
      teacherEmployeeId: a.teacherEmployeeId,
    }));

    return {
      studentStatus: student.isActive ? "Active" : "Inactive",
      program: {
        id: programId,
        name: programName,
        code: programCode,
      },
      course: {
        id: course?.id,
        name: course?.name || batch.courseName || "N/A",
        code: course?.code || batch.courseCode,
      },
      level: {
        levelNumber: batch.levelNumber,
        levelName: batch.levelName || `Semester ${batch.levelNumber}`,
      },
      batch: {
        id: batch.id,
        name: batch.name,
      },
      center: {
        id: batch.centerId,
        name: batch.centerName || "N/A",
      },
      academicYear: {
        id: batch.academicYearId,
        name: batch.academicYearName || "N/A",
      },
      batchTeacher: {
        id: batch.teacherId,
        name: batch.teacherName || "Not Assigned",
        employeeId: batch.teacherEmployeeId,
      },
      subjects,
    };
  }
}
