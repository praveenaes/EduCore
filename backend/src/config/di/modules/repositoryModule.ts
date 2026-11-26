import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { UserRepository } from "../../../infra/db/UserRepository";
import { IStudentRepository } from "../../../domain/repositories/IStudentRepository";
import { StudentRepository } from "../../../infra/db/StudentRepository";
import { ITeacherRepository } from "../../../domain/repositories/ITeacherRepository";
import { TeacherRepository } from "../../../infra/db/TeacherRepository";
import { IProgramRepository } from "@/domain/repositories/IProgramRepository";
import { ProgramRepository } from "@/infra/db/ProgramRepository";

export const repositoryModule = new ContainerModule((bind) => {
  bind<IUserRepository>(TYPES.UserRepository)
    .to(UserRepository)
    .inSingletonScope();

  bind<IStudentRepository>(TYPES.StudentRepository)
    .to(StudentRepository)
    .inSingletonScope();

  bind<ITeacherRepository>(TYPES.TeacherRepository)
    .to(TeacherRepository)
    .inSingletonScope();
  bind<IProgramRepository>(TYPES.ProgramRepository)
    .to(ProgramRepository)
    .inSingletonScope();
  bind<IProgramRepository>(TYPES.ProgramRepository)
    .to(ProgramRepository)
    .inSingletonScope();
});
