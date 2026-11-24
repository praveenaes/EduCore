import { ContainerModule } from "inversify";
import { TYPES } from "../types";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { MongoUserRepository } from "../../../infra/db/MongoUserRepository";
import { IStudentRepository } from "../../../domain/repositories/IStudentRepository";
import { MongoStudentRepository } from "../../../infra/db/MongoStudentRepository";
import { ITeacherRepository } from "../../../domain/repositories/ITeacherRepository";
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
