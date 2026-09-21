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
import { IProgramRepository } from "@/domain/repositories/IProgramRepository";
import { MongoProgramRepository } from "@/infra/db/MongoProgramRepository";
import { ICourseRepository } from "@/domain/repositories/ICourseRepository";
import { MongoCourseRepository } from "@/infra/db/MongoCourseRepository";
import { ISubjectRepository } from "@/domain/repositories/ISubjectRepository";
import { MongoSubjectRepository } from "@/infra/db/MongoSubjectRepository";
import { ICenterRepository } from "@/domain/repositories/ICenterRepository";
import { MongoCenterRepository } from "@/infra/db/MongoCenterRepository";
import { IAcademicYearRepository } from "@/domain/repositories/IAcademicYearRepository";
import { MongoAcademicYearRepository } from "@/infra/db/MongoAcademicYearRepository";
import { ISubjectAssignmentRepository } from "@/domain/repositories/ISubjectAssignmentRepository";
import { MongoSubjectAssignmentRepository } from "@/infra/db/MongoSubjectAssignmentRepository";
import { IBatchRepository } from "@/domain/repositories/IBatchRepository";
import { MongoBatchRepository } from "@/infra/db/MongoBatchRepository";

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
  bind<IProgramRepository>(TYPES.ProgramRepository)
    .to(MongoProgramRepository)
    .inSingletonScope();
  bind<ICourseRepository>(TYPES.CourseRepository)
    .to(MongoCourseRepository)
    .inSingletonScope();
  bind<ISubjectRepository>(TYPES.SubjectRepository)
    .to(MongoSubjectRepository)
    .inSingletonScope();
  bind<ICenterRepository>(TYPES.CenterRepository)
    .to(MongoCenterRepository)
    .inSingletonScope();
  bind<IAcademicYearRepository>(TYPES.AcademicYearRepository)
    .to(MongoAcademicYearRepository)
    .inSingletonScope();
  bind<ISubjectAssignmentRepository>(TYPES.SubjectAssignmentRepository)
    .to(MongoSubjectAssignmentRepository)
    .inSingletonScope();
  bind<IBatchRepository>(TYPES.BatchRepository)
    .to(MongoBatchRepository)
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
