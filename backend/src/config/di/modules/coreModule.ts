import { ContainerModule } from "inversify";
import { INotificationRepository } from "@/domain/repositories/INotificationRepository";
import { NotificationRepository } from "@/infra/db/NotificationRepository";
import { INotificationRecipientRepository } from "@/domain/repositories/INotificationRecipientRepository";
import { NotificationRecipientRepository } from "@/infra/db/NotificationRecipientRepository";
import { INotificationSocketService } from "@/application/ports/services/INotificationSocketService";
import { SocketNotificationService } from "@/infra/services/SocketNotificationService";
import { IChatGroupRepository } from "@/domain/repositories/IChatGroupRepository";
import { ChatGroupRepository } from "@/infra/db/ChatGroupRepository";
import { IChatMessageRepository } from "@/domain/repositories/IChatMessageRepository";
import { ChatMessageRepository } from "@/infra/db/ChatMessageRepository";
import { IAIService } from "@/application/ports/services/IAIService";
import { GeminiAIService } from "@/infra/services/GeminiAIService";
import { IChatSocketService } from "@/application/ports/services/IChatSocketService";
import { SocketChatService } from "@/infra/services/SocketChatService";
import { TYPES } from "../types";

// Ports (Interfaces)
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { IEmailService } from "@/application/ports/services/IEmailService";
import { IStorageService } from "@/application/ports/services/IStorageService";

// Implementations
import { UserRepository } from "@/infra/db/UserRepository";
import { JwtAuthService } from "@/infra/auth/JwtAuthService";
import { StudentRepository } from "@/infra/db/StudentRepository";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { TeacherRepository } from "@/infra/db/TeacherRepository";
import { NodemailerEmailService } from "@/infra/services/NodemailerEmailService";
import { S3StorageService } from "@/infra/services/S3StorageService";
import { IOrganizationRepository } from "@/domain/repositories/IOrganizationRepository";
import { OrganizationRepository } from "@/infra/db/OrganizationRepository";
import { ITokenBlacklistService } from "@/application/ports/services/ITokenBlacklistService";
import { MongoTokenBlacklistService } from "@/infra/services/MongoTokenBlacklistService";
import { IProgramRepository } from "@/domain/repositories/IProgramRepository";
import { ProgramRepository } from "@/infra/db/ProgramRepository";
import { ICourseRepository } from "@/domain/repositories/ICourseRepository";
import { CourseRepository } from "@/infra/db/CourseRepository";
import { ISubjectRepository } from "@/domain/repositories/ISubjectRepository";
import { SubjectRepository } from "@/infra/db/SubjectRepository";
import { ICenterRepository } from "@/domain/repositories/ICenterRepository";
import { CenterRepository } from "@/infra/db/CenterRepository";
import { IAcademicYearRepository } from "@/domain/repositories/IAcademicYearRepository";
import { AcademicYearRepository } from "@/infra/db/AcademicYearRepository";
import { ISubjectAssignmentRepository } from "@/domain/repositories/ISubjectAssignmentRepository";
import { SubjectAssignmentRepository } from "@/infra/db/SubjectAssignmentRepository";
import { IBatchRepository } from "@/domain/repositories/IBatchRepository";
import { BatchRepository } from "@/infra/db/BatchRepository";
import { IAttendanceRepository } from "@/domain/repositories/IAttendanceRepository";
import { AttendanceRepository } from "@/infra/db/AttendanceRepository";
import { IHomeworkRepository } from "@/domain/repositories/IHomeworkRepository";
import { HomeworkRepository } from "@/infra/db/HomeworkRepository";
import { ILeaveRequestRepository } from "@/domain/repositories/ILeaveRequestRepository";
import { LeaveRequestRepository } from "@/infra/db/LeaveRequestRepository";
import { IAssessmentRepository } from "@/domain/repositories/IAssessmentRepository";
import { AssessmentRepository } from "@/infra/db/AssessmentRepository";
import { IAssessmentCriteriaRepository } from "@/domain/repositories/IAssessmentCriteriaRepository";
import { AssessmentCriteriaRepository } from "@/infra/db/AssessmentCriteriaRepository";
import { IAssessmentScheduleRepository } from "@/domain/repositories/IAssessmentScheduleRepository";
import { AssessmentScheduleRepository } from "@/infra/db/AssessmentScheduleRepository";
import { IAssessmentResultRepository } from "@/domain/repositories/IAssessmentResultRepository";
import { AssessmentResultRepository } from "@/infra/db/AssessmentResultRepository";
import { IFeeAssignmentRepository } from "@/domain/repositories/IFeeAssignmentRepository";
import { FeeAssignmentRepository } from "@/infra/db/FeeAssignmentRepository";
import { IFeePaymentRepository } from "@/domain/repositories/IFeePaymentRepository";
import { FeePaymentRepository } from "@/infra/db/FeePaymentRepository";
import { IPaymentService } from "@/application/ports/services/IPaymentService";
import { RazorpayService } from "@/infra/services/RazorpayService";

export const coreModule = new ContainerModule((bind) => {
  bind<IUserRepository>(TYPES.UserRepository)
    .to(UserRepository)
    .inSingletonScope();

  bind<IOrganizationRepository>(TYPES.OrganizationRepository)
    .to(OrganizationRepository)
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
  bind<ICourseRepository>(TYPES.CourseRepository)
    .to(CourseRepository)
    .inSingletonScope();
  bind<ISubjectRepository>(TYPES.SubjectRepository)
    .to(SubjectRepository)
    .inSingletonScope();
  bind<ICenterRepository>(TYPES.CenterRepository)
    .to(CenterRepository)
    .inSingletonScope();
  bind<IAcademicYearRepository>(TYPES.AcademicYearRepository)
    .to(AcademicYearRepository)
    .inSingletonScope();
  bind<ISubjectAssignmentRepository>(TYPES.SubjectAssignmentRepository)
    .to(SubjectAssignmentRepository)
    .inSingletonScope();
  bind<IBatchRepository>(TYPES.BatchRepository)
    .to(BatchRepository)
    .inSingletonScope();
  bind<IAttendanceRepository>(TYPES.AttendanceRepository)
    .to(AttendanceRepository)
    .inSingletonScope();
  bind<IHomeworkRepository>(TYPES.HomeworkRepository)
    .to(HomeworkRepository)
    .inSingletonScope();
  bind<ILeaveRequestRepository>(TYPES.LeaveRequestRepository)
    .to(LeaveRequestRepository)
    .inSingletonScope();
  bind<IAssessmentRepository>(TYPES.AssessmentRepository)
    .to(AssessmentRepository)
    .inSingletonScope();
  bind<IAssessmentCriteriaRepository>(TYPES.AssessmentCriteriaRepository)
    .to(AssessmentCriteriaRepository)
    .inSingletonScope();
  bind<IAssessmentScheduleRepository>(TYPES.AssessmentScheduleRepository)
    .to(AssessmentScheduleRepository)
    .inSingletonScope();

  bind<IAssessmentResultRepository>(TYPES.AssessmentResultRepository)
    .to(AssessmentResultRepository)
    .inSingletonScope();

  bind<IFeeAssignmentRepository>(TYPES.FeeAssignmentRepository)
    .to(FeeAssignmentRepository)
    .inSingletonScope();

  bind<IFeePaymentRepository>(TYPES.FeePaymentRepository)
    .to(FeePaymentRepository)
    .inSingletonScope();

  bind<IPaymentService>(TYPES.PaymentService)
    .to(RazorpayService)
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

  bind<INotificationRepository>(TYPES.NotificationRepository)
    .to(NotificationRepository)
    .inSingletonScope();

  bind<INotificationRecipientRepository>(TYPES.NotificationRecipientRepository)
    .to(NotificationRecipientRepository)
    .inSingletonScope();

  bind<INotificationSocketService>(TYPES.NotificationSocketService)
    .to(SocketNotificationService)
    .inSingletonScope();

  bind<IChatGroupRepository>(TYPES.ChatGroupRepository)
    .to(ChatGroupRepository)
    .inSingletonScope();

  bind<IChatMessageRepository>(TYPES.ChatMessageRepository)
    .to(ChatMessageRepository)
    .inSingletonScope();

  bind<IAIService>(TYPES.AIService)
    .to(GeminiAIService)
    .inSingletonScope();

  bind<IChatSocketService>(TYPES.ChatSocketService)
    .to(SocketChatService)
    .inSingletonScope();
});
