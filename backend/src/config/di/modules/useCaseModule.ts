import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Ports (Interfaces)
import { ILoginUser } from "@/application/ports/use-cases/auth/ILoginUserUseCase";
import { IRefreshToken } from "@/application/ports/use-cases/auth/IRefreshTokenUseCase";
import { IGetMe } from "@/application/ports/use-cases/auth/IGetMeUseCase";
import { IForgotPassword } from "@/application/ports/use-cases/auth/IForgotPasswordUseCase";
import { IVerifyOtp } from "@/application/ports/use-cases/auth/IVerifyOtpUseCase";
import { IResetPassword } from "@/application/ports/use-cases/auth/IResetPasswordUseCase";

// Implementations
import { LoginUser } from "@/application/use-cases/auth/LoginUser";
import { RefreshToken } from "@/application/use-cases/auth/RefreshToken";
import { GetMe } from "@/application/use-cases/auth/GetMe";
import { ForgotPassword } from "@/application/use-cases/auth/ForgotPassword";
import { VerifyOtp } from "@/application/use-cases/auth/VerifyOtp";
import { ResetPassword } from "@/application/use-cases/auth/ResetPassword";
import { GetStudents } from "@/application/use-cases/students/GetStudents";
import { ToggleStudentStatus } from "@/application/use-cases/students/ToggleStudentStatus";
import { ExportStudentsCsv } from "@/application/use-cases/students/ExportStudentsCsv";
import { IGetStudents } from "@/application/ports/use-cases/students/IGetStudentsUseCase";
import { IToggleStudentStatus } from "@/application/ports/use-cases/students/IToggleStudentStatusUseCase";
import { IExportStudentsCsv } from "@/application/ports/use-cases/students/IExportStudentsCsvUseCase";
import { ICreateStudent } from "@/application/ports/use-cases/students/ICreateStudentUseCase";
import { CreateStudent } from "@/application/use-cases/students/CreateStudent";
import { IUpdateStudent } from "@/application/ports/use-cases/students/IUpdateStudentUseCase";
import { UpdateStudent } from "@/application/use-cases/students/UpdateStudent";
import { IDeleteStudent } from "@/application/ports/use-cases/students/IDeleteStudentUseCase";
import { DeleteStudent } from "@/application/use-cases/students/DeleteStudent";
import { ICreateTeacher } from "@/application/ports/use-cases/teachers/ICreateTeacherUseCase";
import { CreateTeacher } from "@/application/use-cases/teachers/CreateTeacher";
import { GetTeachers } from "@/application/use-cases/teachers/GetTeachers";
import { ToggleTeacherStatus } from "@/application/use-cases/teachers/ToggleTeacherStatus";
import { ExportTeachersCsv } from "@/application/use-cases/teachers/ExportTeachersCsv";
import { IUpdateTeacher } from "@/application/ports/use-cases/teachers/IUpdateTeacherUseCase";
import { UpdateTeacher } from "@/application/use-cases/teachers/UpdateTeacher";
import { IDeleteTeacher } from "@/application/ports/use-cases/teachers/IDeleteTeacherUseCase";
import { DeleteTeacher } from "@/application/use-cases/teachers/DeleteTeacher";

// Settings Use Cases
import { GetOrganizationSettings } from "@/application/use-cases/settings/GetOrganizationSettings";
import { UpdateOrganizationSettings } from "@/application/use-cases/settings/UpdateOrganizationSettings";
import { GetMySettings } from "@/application/use-cases/settings/GetMySettings";
import { UpdateMyProfilePhoto } from "@/application/use-cases/settings/UpdateMyProfilePhoto";
import { ChangePassword } from "@/application/use-cases/auth/ChangePassword";
import { SendEmailChangeOtp } from "@/application/use-cases/auth/SendEmailChangeOtp";
import { VerifyEmailChangeOtp } from "@/application/use-cases/auth/VerifyEmailChangeOtp";
import { ChangeEmail } from "@/application/use-cases/auth/ChangeEmail";

import { IGetOrganizationSettings } from "@/application/ports/use-cases/settings/IGetOrganizationSettingsUseCase";
import { IUpdateOrganizationSettings } from "@/application/ports/use-cases/settings/IUpdateOrganizationSettingsUseCase";
import { IGetMySettings } from "@/application/ports/use-cases/settings/IGetMySettingsUseCase";
import { IUpdateMyProfilePhoto } from "@/application/ports/use-cases/settings/IUpdateMyProfilePhotoUseCase";

export const useCaseModule = new ContainerModule((bind) => {
  bind<IGetOrganizationSettings>(TYPES.GetOrganizationSettingsUseCase)
    .to(GetOrganizationSettings)
    .inSingletonScope();

  bind<IUpdateOrganizationSettings>(TYPES.UpdateOrganizationSettingsUseCase)
    .to(UpdateOrganizationSettings)
    .inSingletonScope();

  bind<IGetMySettings>(TYPES.GetMySettingsUseCase)
    .to(GetMySettings)
    .inSingletonScope();

  bind<IUpdateMyProfilePhoto>(TYPES.UpdateMyProfilePhotoUseCase)
    .to(UpdateMyProfilePhoto)
    .inSingletonScope();

  bind<ChangePassword>(TYPES.ChangePasswordUseCase)
    .to(ChangePassword)
    .inSingletonScope();

  bind<SendEmailChangeOtp>(TYPES.SendEmailChangeOtpUseCase)
    .to(SendEmailChangeOtp)
    .inSingletonScope();

  bind<VerifyEmailChangeOtp>(TYPES.VerifyEmailChangeOtpUseCase)
    .to(VerifyEmailChangeOtp)
    .inSingletonScope();

  bind<ChangeEmail>(TYPES.ChangeEmailUseCase)
    .to(ChangeEmail)
    .inSingletonScope();

  bind<ILoginUser>(TYPES.LoginUserUseCase)
    .to(LoginUser)
    .inSingletonScope();

  bind<IRefreshToken>(TYPES.RefreshTokenUseCase)
    .to(RefreshToken)
    .inSingletonScope();

  bind<IGetMe>(TYPES.GetMeUseCase)
    .to(GetMe)
    .inSingletonScope();

  bind<IForgotPassword>(TYPES.ForgotPasswordUseCase)
    .to(ForgotPassword)
    .inSingletonScope();

  bind<IVerifyOtp>(TYPES.VerifyOtpUseCase)
    .to(VerifyOtp)
    .inSingletonScope();

  bind<IResetPassword>(TYPES.ResetPasswordUseCase)
    .to(ResetPassword)
    .inSingletonScope();

  bind<IGetStudents>(TYPES.GetStudentsUseCase)
    .to(GetStudents)
    .inSingletonScope();

  bind<IToggleStudentStatus>(TYPES.ToggleStudentStatusUseCase)
    .to(ToggleStudentStatus)
    .inSingletonScope();

  bind<IExportStudentsCsv>(TYPES.ExportStudentsCsvUseCase)
    .to(ExportStudentsCsv)
    .inSingletonScope();

  bind<ICreateStudent>(TYPES.CreateStudentUseCase)
    .to(CreateStudent)
    .inSingletonScope();

  bind<IUpdateStudent>(TYPES.UpdateStudentUseCase)
    .to(UpdateStudent)
    .inSingletonScope();

  bind<IDeleteStudent>(TYPES.DeleteStudentUseCase)
    .to(DeleteStudent)
    .inSingletonScope();

  bind<ICreateTeacher>(TYPES.CreateTeacherUseCase)
    .to(CreateTeacher)
    .inSingletonScope();

  bind<GetTeachers>(TYPES.GetTeachersUseCase)
    .to(GetTeachers)
    .inSingletonScope();

  bind<ToggleTeacherStatus>(TYPES.ToggleTeacherStatusUseCase)
    .to(ToggleTeacherStatus)
    .inSingletonScope();

  bind<ExportTeachersCsv>(TYPES.ExportTeachersCsvUseCase)
    .to(ExportTeachersCsv)
    .inSingletonScope();

  bind<IUpdateTeacher>(TYPES.UpdateTeacherUseCase)
    .to(UpdateTeacher)
    .inSingletonScope();

  bind<IDeleteTeacher>(TYPES.DeleteTeacherUseCase)
    .to(DeleteTeacher)
    .inSingletonScope();
});
