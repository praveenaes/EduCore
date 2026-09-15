import { ContainerModule } from "inversify";
import { TYPES } from "../types";

// Ports (Interfaces)
import { ILoginUser } from "@/application/ports/use-cases/auth/ILoginUserUseCase";
import { IRefreshToken } from "@/application/ports/use-cases/auth/IRefreshTokenUseCase";
import { ILogoutUser } from "@/application/ports/use-cases/auth/ILogoutUserUseCase";
import { IGetMe } from "@/application/ports/use-cases/auth/IGetMeUseCase";
import { IForgotPassword } from "@/application/ports/use-cases/auth/IForgotPasswordUseCase";
import { IVerifyOtp } from "@/application/ports/use-cases/auth/IVerifyOtpUseCase";
import { IResetPassword } from "@/application/ports/use-cases/auth/IResetPasswordUseCase";
import { IChangePassword } from "@/application/ports/use-cases/auth/IChangePasswordUseCase";
import { ISendEmailChangeOtp } from "@/application/ports/use-cases/auth/ISendEmailChangeOtpUseCase";
import { IVerifyEmailChangeOtp } from "@/application/ports/use-cases/auth/IVerifyEmailChangeOtpUseCase";
import { IChangeEmail } from "@/application/ports/use-cases/auth/IChangeEmailUseCase";

// Implementations
import { LoginUser } from "@/application/use-cases/auth/LoginUser";
import { RefreshToken } from "@/application/use-cases/auth/RefreshToken";
import { LogoutUser } from "@/application/use-cases/auth/LogoutUser";
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
import { IGetTeachers } from "@/application/ports/use-cases/teachers/IGetTeachersUseCase";
import { IToggleTeacherStatus } from "@/application/ports/use-cases/teachers/IToggleTeacherStatusUseCase";
import { IExportTeachersCsv } from "@/application/ports/use-cases/teachers/IExportTeachersCsvUseCase";
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

import { ICreateProgram } from "@/application/ports/use-cases/programs/ICreateProgramUseCase";
import { IGetPrograms } from "@/application/ports/use-cases/programs/IGetProgramsUseCase";
import { IUpdateProgram } from "@/application/ports/use-cases/programs/IUpdateProgramUseCase";
import { IDeleteProgram } from "@/application/ports/use-cases/programs/IDeleteProgramUseCase";
import { CreateProgram } from "@/application/use-cases/Programs/CreateProgram";
import { GetPrograms } from "@/application/use-cases/Programs/GetPrograms";
import { UpdateProgram } from "@/application/use-cases/Programs/UpdateProgram";
import { DeleteProgram } from "@/application/use-cases/Programs/DeleteProgram";

import { ICreateCourse } from "@/application/ports/use-cases/courses/ICreateCourseUseCase";
import { IGetCourses } from "@/application/ports/use-cases/courses/IGetCoursesUseCase";
import { IUpdateCourse } from "@/application/ports/use-cases/courses/IUpdateCourseUseCase";
import { IDeleteCourse } from "@/application/ports/use-cases/courses/IDeleteCourseUseCase";
import { CreateCourse } from "@/application/use-cases/courses/CreateCourse";
import { GetCourses } from "@/application/use-cases/courses/GetCourses";
import { UpdateCourse } from "@/application/use-cases/courses/UpdateCourse";
import { DeleteCourse } from "@/application/use-cases/courses/DeleteCourse";

import { ICreateSubject } from "@/application/ports/use-cases/subjects/ICreateSubjectUseCase";
import { IGetSubjects } from "@/application/ports/use-cases/subjects/IGetSubjectsUseCase";
import { IUpdateSubject } from "@/application/ports/use-cases/subjects/IUpdateSubjectUseCase";
import { IDeleteSubject } from "@/application/ports/use-cases/subjects/IDeleteSubjectUseCase";
import { CreateSubject } from "@/application/use-cases/subjects/CreateSubject";
import { GetSubjects } from "@/application/use-cases/subjects/GetSubjects";
import { UpdateSubject } from "@/application/use-cases/subjects/UpdateSubject";
import { DeleteSubject } from "@/application/use-cases/subjects/DeleteSubject";

import { ICreateCenterUseCase } from "@/application/ports/use-cases/centers/ICreateCenterUseCase";
import { IGetCentersUseCase } from "@/application/ports/use-cases/centers/IGetCentersUseCase";
import { IUpdateCenterUseCase } from "@/application/ports/use-cases/centers/IUpdateCenterUseCase";
import { IDeleteCenterUseCase } from "@/application/ports/use-cases/centers/IDeleteCenterUseCase";
import { CreateCenter } from "@/application/use-cases/centers/CreateCenter";
import { GetCenters } from "@/application/use-cases/centers/GetCenters";
import { UpdateCenter } from "@/application/use-cases/centers/UpdateCenter";
import { DeleteCenter } from "@/application/use-cases/centers/DeleteCenter";

import { ICreateAcademicYearUseCase } from "@/application/ports/use-cases/academic-years/ICreateAcademicYearUseCase";
import { IGetAcademicYearsUseCase } from "@/application/ports/use-cases/academic-years/IGetAcademicYearsUseCase";
import { IUpdateAcademicYearUseCase } from "@/application/ports/use-cases/academic-years/IUpdateAcademicYearUseCase";
import { IDeleteAcademicYearUseCase } from "@/application/ports/use-cases/academic-years/IDeleteAcademicYearUseCase";
import { CreateAcademicYear } from "@/application/use-cases/academic-years/CreateAcademicYear";
import { GetAcademicYears } from "@/application/use-cases/academic-years/GetAcademicYears";
import { UpdateAcademicYear } from "@/application/use-cases/academic-years/UpdateAcademicYear";
import { DeleteAcademicYear } from "@/application/use-cases/academic-years/DeleteAcademicYear";

import { ICreateSubjectAssignmentUseCase } from "@/application/ports/use-cases/subject-assignments/ICreateSubjectAssignmentUseCase";
import { IGetSubjectAssignmentsUseCase } from "@/application/ports/use-cases/subject-assignments/IGetSubjectAssignmentsUseCase";
import { IUpdateSubjectAssignmentUseCase } from "@/application/ports/use-cases/subject-assignments/IUpdateSubjectAssignmentUseCase";
import { IDeleteSubjectAssignmentUseCase } from "@/application/ports/use-cases/subject-assignments/IDeleteSubjectAssignmentUseCase";
import { CreateSubjectAssignment } from "@/application/use-cases/subject-assignments/CreateSubjectAssignment";
import { GetSubjectAssignments } from "@/application/use-cases/subject-assignments/GetSubjectAssignments";
import { UpdateSubjectAssignment } from "@/application/use-cases/subject-assignments/UpdateSubjectAssignment";
import { DeleteSubjectAssignment } from "@/application/use-cases/subject-assignments/DeleteSubjectAssignment";

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

  bind<IChangePassword>(TYPES.ChangePasswordUseCase)
    .to(ChangePassword)
    .inSingletonScope();

  bind<ISendEmailChangeOtp>(TYPES.SendEmailChangeOtpUseCase)
    .to(SendEmailChangeOtp)
    .inSingletonScope();

  bind<IVerifyEmailChangeOtp>(TYPES.VerifyEmailChangeOtpUseCase)
    .to(VerifyEmailChangeOtp)
    .inSingletonScope();

  bind<IChangeEmail>(TYPES.ChangeEmailUseCase)
    .to(ChangeEmail)
    .inSingletonScope();

  bind<ILoginUser>(TYPES.LoginUserUseCase)
    .to(LoginUser)
    .inSingletonScope();

  bind<IRefreshToken>(TYPES.RefreshTokenUseCase)
    .to(RefreshToken)
    .inSingletonScope();

  bind<ILogoutUser>(TYPES.LogoutUserUseCase)
    .to(LogoutUser)
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

  bind<IGetTeachers>(TYPES.GetTeachersUseCase)
    .to(GetTeachers)
    .inSingletonScope();

  bind<IToggleTeacherStatus>(TYPES.ToggleTeacherStatusUseCase)
    .to(ToggleTeacherStatus)
    .inSingletonScope();

  bind<IExportTeachersCsv>(TYPES.ExportTeachersCsvUseCase)
    .to(ExportTeachersCsv)
    .inSingletonScope();

  bind<IUpdateTeacher>(TYPES.UpdateTeacherUseCase)
    .to(UpdateTeacher)
    .inSingletonScope();

  bind<IDeleteTeacher>(TYPES.DeleteTeacherUseCase)
    .to(DeleteTeacher)
    .inSingletonScope();
     bind<ICreateProgram>(TYPES.CreateProgramUseCase)
    .to(CreateProgram)
    .inSingletonScope();
  bind<IGetPrograms>(TYPES.GetProgramsUseCase)
    .to(GetPrograms)
    .inSingletonScope();
  bind<IUpdateProgram>(TYPES.UpdateProgramUseCase)
    .to(UpdateProgram)
    .inSingletonScope();
  bind<IDeleteProgram>(TYPES.DeleteProgramUseCase)
    .to(DeleteProgram)
    .inSingletonScope();

  bind<ICreateCourse>(TYPES.CreateCourseUseCase)
    .to(CreateCourse)
    .inSingletonScope();
  bind<IGetCourses>(TYPES.GetCoursesUseCase)
    .to(GetCourses)
    .inSingletonScope();
  bind<IUpdateCourse>(TYPES.UpdateCourseUseCase)
    .to(UpdateCourse)
    .inSingletonScope();
  bind<IDeleteCourse>(TYPES.DeleteCourseUseCase)
    .to(DeleteCourse)
    .inSingletonScope();
  bind<ICreateSubject>(TYPES.CreateSubjectUseCase)
    .to(CreateSubject)
    .inSingletonScope();
  bind<IGetSubjects>(TYPES.GetSubjectsUseCase)
    .to(GetSubjects)
    .inSingletonScope();
  bind<IUpdateSubject>(TYPES.UpdateSubjectUseCase)
    .to(UpdateSubject)
    .inSingletonScope();
  bind<IDeleteSubject>(TYPES.DeleteSubjectUseCase)
    .to(DeleteSubject)
    .inSingletonScope();

  // Centers
  bind<ICreateCenterUseCase>(TYPES.CreateCenterUseCase)
    .to(CreateCenter)
    .inSingletonScope();
  bind<IGetCentersUseCase>(TYPES.GetCentersUseCase)
    .to(GetCenters)
    .inSingletonScope();
  bind<IUpdateCenterUseCase>(TYPES.UpdateCenterUseCase)
    .to(UpdateCenter)
    .inSingletonScope();
  bind<IDeleteCenterUseCase>(TYPES.DeleteCenterUseCase)
    .to(DeleteCenter)
    .inSingletonScope();

  // Academic Years
  bind<ICreateAcademicYearUseCase>(TYPES.CreateAcademicYearUseCase)
    .to(CreateAcademicYear)
    .inSingletonScope();
  bind<IGetAcademicYearsUseCase>(TYPES.GetAcademicYearsUseCase)
    .to(GetAcademicYears)
    .inSingletonScope();
  bind<IUpdateAcademicYearUseCase>(TYPES.UpdateAcademicYearUseCase)
    .to(UpdateAcademicYear)
    .inSingletonScope();
  bind<IDeleteAcademicYearUseCase>(TYPES.DeleteAcademicYearUseCase)
    .to(DeleteAcademicYear)
    .inSingletonScope();

  // Subject Assignments
  bind<ICreateSubjectAssignmentUseCase>(TYPES.CreateSubjectAssignmentUseCase)
    .to(CreateSubjectAssignment)
    .inSingletonScope();
  bind<IGetSubjectAssignmentsUseCase>(TYPES.GetSubjectAssignmentsUseCase)
    .to(GetSubjectAssignments)
    .inSingletonScope();
  bind<IUpdateSubjectAssignmentUseCase>(TYPES.UpdateSubjectAssignmentUseCase)
    .to(UpdateSubjectAssignment)
    .inSingletonScope();
  bind<IDeleteSubjectAssignmentUseCase>(TYPES.DeleteSubjectAssignmentUseCase)
    .to(DeleteSubjectAssignment)
    .inSingletonScope();
});
