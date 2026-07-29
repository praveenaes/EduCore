import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Controllers
import { AuthController } from "@/presentation/controllers/auth/Auth.controller";
import { StudentController } from "@/presentation/controllers/students/Student.controller";
import { TeacherController } from "@/presentation/controllers/teachers/Teacher.controller";
import { SettingsController } from "@/presentation/controllers/settings/Settings.controller";

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
});
