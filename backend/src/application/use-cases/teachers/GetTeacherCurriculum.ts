import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IGetTeacherCurriculum } from "../../ports/use-cases/teachers/IGetTeacherCurriculumUseCase";
import { 
  TeacherAcademicCurriculumDTO, 
  TeacherAssignedSubjectDTO, 
  TeacherInChargeBatchDTO 
} from "../../dto/teachers/teacherCurriculumDtos";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { ISubjectAssignmentRepository } from "@/domain/repositories/ISubjectAssignmentRepository";
import { IBatchRepository } from "@/domain/repositories/IBatchRepository";
import { ICourseRepository } from "@/domain/repositories/ICourseRepository";
import { IProgramRepository } from "@/domain/repositories/IProgramRepository";
import { NotFoundError } from "@/shared/errors/AppError";

@injectable()
export class GetTeacherCurriculum implements IGetTeacherCurriculum {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.SubjectAssignmentRepository) private _subjectAssignmentRepo: ISubjectAssignmentRepository,
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository,
    @inject(TYPES.CourseRepository) private _courseRepo: ICourseRepository,
    @inject(TYPES.ProgramRepository) private _programRepo: IProgramRepository
  ) {}

  async execute(userId: string): Promise<TeacherAcademicCurriculumDTO> {
    const teacher = await this._teacherRepo.findByUserId(userId);
    if (!teacher) {
      throw new NotFoundError("Teacher profile not found.");
    }

    const [assignments, batches] = await Promise.all([
      this._subjectAssignmentRepo.findByTeacherId(teacher.id!),
      this._batchRepo.findByTeacherId(teacher.id!),
    ]);

    // Cache courses and programs to avoid duplicate DB queries
    const courseCache = new Map<string, any>();
    const programCache = new Map<string, any>();

    const getCourse = async (courseId: string) => {
      if (courseCache.has(courseId)) return courseCache.get(courseId);
      const c = await this._courseRepo.findById(courseId);
      courseCache.set(courseId, c);
      return c;
    };

    const getProgram = async (programId: string) => {
      if (programCache.has(programId)) return programCache.get(programId);
      const p = await this._programRepo.findById(programId);
      programCache.set(programId, p);
      return p;
    };

    // Build Assigned Subjects
    const assignedSubjects: TeacherAssignedSubjectDTO[] = await Promise.all(
      assignments.map(async (a) => {
        let programName = "N/A";
        let programCode: string | undefined;

        const course = await getCourse(a.courseId);
        if (course?.programId) {
          const program = await getProgram(course.programId);
          if (program) {
            programName = program.name;
            programCode = program.code;
          }
        }

        return {
          id: a.id || a.subjectId,
          subjectId: a.subjectId,
          subjectName: a.subjectName || "Subject",
          subjectCode: a.subjectCode || "N/A",
          courseId: a.courseId,
          courseName: a.courseName || course?.name || "N/A",
          courseCode: a.courseCode || course?.code,
          levelNumber: a.levelNumber,
          levelName: a.levelName || `Level ${a.levelNumber}`,
          programName,
          programCode,
        };
      })
    );

    // Build In-Charge Batches
    const inChargeBatches: TeacherInChargeBatchDTO[] = batches.map((b) => ({
      id: b.id!,
      name: b.name,
      courseId: b.courseId,
      courseName: b.courseName || "Course",
      courseCode: b.courseCode,
      levelNumber: b.levelNumber,
      levelName: b.levelName || `Level ${b.levelNumber}`,
      centerId: b.centerId,
      centerName: b.centerName || "Main Center",
      academicYearId: b.academicYearId,
      academicYearName: b.academicYearName || "Academic Year",
    }));

    // Deduplicate scope lists for the 7 features
    const programMap = new Map<string, { id?: string; name: string; code?: string }>();
    const courseMap = new Map<string, { id?: string; name: string; code?: string }>();
    const levelMap = new Map<number, { levelNumber: number; levelName: string }>();
    const centerMap = new Map<string, { id?: string; name: string }>();
    const academicYearMap = new Map<string, { id?: string; name: string }>();

    for (const subj of assignedSubjects) {
      if (subj.programName && subj.programName !== "N/A") {
        programMap.set(subj.programName, { name: subj.programName, code: subj.programCode });
      }
      if (subj.courseId) {
        courseMap.set(subj.courseId, { id: subj.courseId, name: subj.courseName, code: subj.courseCode });
      }
      if (subj.levelNumber) {
        levelMap.set(subj.levelNumber, { levelNumber: subj.levelNumber, levelName: subj.levelName });
      }
    }

    for (const b of inChargeBatches) {
      if (b.courseId) {
        courseMap.set(b.courseId, { id: b.courseId, name: b.courseName, code: b.courseCode });
      }
      if (b.levelNumber) {
        levelMap.set(b.levelNumber, { levelNumber: b.levelNumber, levelName: b.levelName });
      }
      if (b.centerId) {
        centerMap.set(b.centerId, { id: b.centerId, name: b.centerName });
      }
      if (b.academicYearId) {
        academicYearMap.set(b.academicYearId, { id: b.academicYearId, name: b.academicYearName });
      }
    }

    return {
      teacherStatus: teacher.isActive ? "Active" : "Inactive",
      employeeId: teacher.employeeId,
      specialization: teacher.specializations,
      summary: {
        totalSubjects: assignedSubjects.length,
        totalBatches: inChargeBatches.length,
        totalCourses: courseMap.size,
        totalCenters: centerMap.size,
        totalPrograms: programMap.size,
      },
      scope: {
        programs: Array.from(programMap.values()),
        courses: Array.from(courseMap.values()),
        levels: Array.from(levelMap.values()),
        centers: Array.from(centerMap.values()),
        academicYears: Array.from(academicYearMap.values()),
      },
      assignedSubjects,
      inChargeBatches,
    };
  }
}
