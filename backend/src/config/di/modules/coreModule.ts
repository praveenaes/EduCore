import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Ports (Interfaces)
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { IStorageService } from "@/application/ports/services/IStorageService";

// Implementations
import { MongoUserRepository } from "@/infra/db/MongoUserRepository";
import { JwtAuthService } from "@/infra/auth/JwtAuthService";
import { MongoStudentRepository } from "@/infra/db/MongoStudentRepository";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { MongoTeacherRepository } from "@/infra/db/MongoTeacherRepository";
import { NodemailerEmailService } from "@/infra/services/NodemailerEmailService";
import { S3StorageService } from "@/infra/services/S3StorageService";
import { IOrganizationRepository } from "@/domain/repositories/IOrganizationRepository";
import { MongoOrganizationRepository } from "@/infra/db/MongoOrganizationRepository";
import { ITokenBlacklistService } from "@/application/ports/services/ITokenBlacklistService";
import { MongoTokenBlacklistService } from "@/infra/services/MongoTokenBlacklistService";

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

  bind<ITokenBlacklistService>(TYPES.TokenBlacklistService)
    .to(MongoTokenBlacklistService)
    .inSingletonScope();
});
