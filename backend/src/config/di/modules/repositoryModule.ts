import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { IUserRepository } from "../../../application/ports/repositories/IUserRepository";
import { MongoUserRepository } from "../../../infra/db/MongoUserRepository";
import { IStudentRepository } from "../../../application/ports/repositories/IStudentRepository";
import { MongoStudentRepository } from "../../../infra/db/MongoStudentRepository";
import { ITeacherRepository } from "../../../application/ports/repositories/ITeacherRepository";
import { MongoTeacherRepository } from "../../../infra/db/MongoTeacherRepository";

export const repositoryModule = new ContainerModule((bind) => {
  bind<IUserRepository>(TYPES.UserRepository)
    .to(MongoUserRepository)
    .inSingletonScope();

  bind<IStudentRepository>(TYPES.StudentRepository)
    .to(MongoStudentRepository)
    .inSingletonScope();

  bind<ITeacherRepository>(TYPES.TeacherRepository)
    .to(MongoTeacherRepository)
    .inSingletonScope();
});
