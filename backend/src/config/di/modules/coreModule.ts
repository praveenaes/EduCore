import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Ports (Interfaces)
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { IStudentRepository } from "@/application/ports/repositories/IStudentRepository";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { IStorageService } from "@/application/ports/services/IStorageService";

// Implementations
import { MongoUserRepository } from "@/infra/db/MongoUserRepository";
import { JwtAuthService } from "@/infra/auth/JwtAuthService";
import { MongoStudentRepository } from "@/infra/db/MongoStudentRepository";
import { ITeacherRepository } from "@/application/ports/repositories/ITeacherRepository";
import { MongoTeacherRepository } from "@/infra/db/MongoTeacherRepository";
import { NodemailerEmailService } from "@/infra/services/NodemailerEmailService";
import { S3StorageService } from "@/infra/services/S3StorageService";
import { IOrganizationRepository } from "@/application/ports/repositories/IOrganizationRepository";
import { MongoOrganizationRepository } from "@/infra/db/MongoOrganizationRepository";

export const coreModule = new ContainerModule((bind) => {
  bind<IUserRepository>(TYPES.UserRepository)
    .to(MongoUserRepository)
    .inSingletonScope();

  bind<IOrganizationRepository>(TYPES.OrganizationRepository)
    .to(MongoOrganizationRepository)
    .inSingletonScope();

  bind<IStudentRepository>(TYPES.StudentRepository)
    .to(MongoStudentRepository)
    .inSingletonScope();

  bind<ITeacherRepository>(TYPES.TeacherRepository)
    .to(MongoTeacherRepository)
    .inSingletonScope();

  bind<IAuthService>(TYPES.AuthService)
    .to(JwtAuthService)
    .inSingletonScope();

  bind<IEmailService>(TYPES.EmailService)
    .to(NodemailerEmailService)
    .inSingletonScope();

  bind<IStorageService>(TYPES.StorageService)
    .to(S3StorageService)
    .inSingletonScope();
});
