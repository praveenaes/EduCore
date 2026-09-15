import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Controllers
import { AuthController } from "@/presentation/controllers/auth/Auth.controller";
import { StudentController } from "@/presentation/controllers/students/Student.controller";
import { TeacherController } from "@/presentation/controllers/teachers/Teacher.controller";
import { SettingsController } from "@/presentation/controllers/settings/Settings.controller";
import { ProgramController } from "@/presentation/controllers/programs/Program.controller";
import { CourseController } from "@/presentation/controllers/courses/Course.controller";
import { SubjectController } from "@/presentation/controllers/subjects/Subject.controller";
import { CenterController } from "@/presentation/controllers/centers/Center.controller";
import { AcademicYearController } from "@/presentation/controllers/academic-years/AcademicYear.controller";
import { SubjectAssignmentController } from "@/presentation/controllers/subject-assignments/SubjectAssignment.controller";

export const controllerModule = new ContainerModule((bind) => {
  bind<SettingsController>(TYPES.SettingsController)
    .to(SettingsController)
    .inSingletonScope();

  bind<AuthController>(TYPES.AuthController)
    .to(AuthController)
    .inSingletonScope();

  bind<StudentController>(TYPES.StudentController)
    .to(StudentController)
    .inSingletonScope();

  bind<TeacherController>(TYPES.TeacherController)
    .to(TeacherController)
    .inSingletonScope();
  bind<ProgramController>(TYPES.ProgramController)
    .to(ProgramController)
    .inSingletonScope();
  bind<CourseController>(TYPES.CourseController)
    .to(CourseController)
    .inSingletonScope();
  bind<SubjectController>(TYPES.SubjectController)
    .to(SubjectController)
    .inSingletonScope();
  bind<CenterController>(TYPES.CenterController)
    .to(CenterController)
    .inSingletonScope();
  bind<AcademicYearController>(TYPES.AcademicYearController)
    .to(AcademicYearController)
    .inSingletonScope();
  bind<SubjectAssignmentController>(TYPES.SubjectAssignmentController)
    .to(SubjectAssignmentController)
    .inSingletonScope();
});
