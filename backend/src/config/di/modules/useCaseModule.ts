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
import { IGetStudentCurriculum } from "@/application/ports/use-cases/students/IGetStudentCurriculumUseCase";
import { GetStudentCurriculum } from "@/application/use-cases/students/GetStudentCurriculum";
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
import { IGetTeacherCurriculum } from "@/application/ports/use-cases/teachers/IGetTeacherCurriculumUseCase";
import { GetTeacherCurriculum } from "@/application/use-cases/teachers/GetTeacherCurriculum";
import { IGetTeacherBatches } from "@/application/ports/use-cases/teachers/IGetTeacherBatchesUseCase";
import { GetTeacherBatches } from "@/application/use-cases/teachers/GetTeacherBatches";
import { IGetTeacherSubjects } from "@/application/ports/use-cases/teachers/IGetTeacherSubjectsUseCase";
import { GetTeacherSubjects } from "@/application/use-cases/teachers/GetTeacherSubjects";


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

import { ICreateBatchUseCase } from "@/application/ports/use-cases/batches/ICreateBatchUseCase";
import { IGetBatchesUseCase } from "@/application/ports/use-cases/batches/IGetBatchesUseCase";
import { IUpdateBatchUseCase } from "@/application/ports/use-cases/batches/IUpdateBatchUseCase";
import { IDeleteBatchUseCase } from "@/application/ports/use-cases/batches/IDeleteBatchUseCase";
import { CreateBatch } from "@/application/use-cases/batches/CreateBatch";
import { GetBatches } from "@/application/use-cases/batches/GetBatches";
import { UpdateBatch } from "@/application/use-cases/batches/UpdateBatch";
import { DeleteBatch } from "@/application/use-cases/batches/DeleteBatch";

import { IGetBatchAttendanceUseCase } from "@/application/ports/use-cases/attendance/IGetBatchAttendanceUseCase";
import { GetBatchAttendance } from "@/application/use-cases/attendance/GetBatchAttendance";
import { ICreateBatchAttendanceUseCase } from "@/application/ports/use-cases/attendance/ICreateBatchAttendanceUseCase";
import { CreateBatchAttendance } from "@/application/use-cases/attendance/CreateBatchAttendance";
import { IUpdateBatchAttendanceUseCase } from "@/application/ports/use-cases/attendance/IUpdateBatchAttendanceUseCase";
import { UpdateBatchAttendance } from "@/application/use-cases/attendance/UpdateBatchAttendance";
import { IGetStudentAttendanceUseCase } from "@/application/ports/use-cases/attendance/IGetStudentAttendanceUseCase";
import { GetStudentAttendance } from "@/application/use-cases/attendance/GetStudentAttendance";

import { ICreateHomeworkUseCase } from "@/application/ports/use-cases/homework/ICreateHomeworkUseCase";
import { CreateHomework } from "@/application/use-cases/homework/CreateHomework";
import { IUpdateHomeworkUseCase } from "@/application/ports/use-cases/homework/IUpdateHomeworkUseCase";
import { UpdateHomework } from "@/application/use-cases/homework/UpdateHomework";
import { IGetTeacherHomeworksUseCase } from "@/application/ports/use-cases/homework/IGetTeacherHomeworksUseCase";
import { GetTeacherHomeworks } from "@/application/use-cases/homework/GetTeacherHomeworks";
import { IGetHomeworkSubmissionsUseCase } from "@/application/ports/use-cases/homework/IGetHomeworkSubmissionsUseCase";
import { GetHomeworkSubmissions } from "@/application/use-cases/homework/GetHomeworkSubmissions";
import { IReviewHomeworkSubmissionUseCase } from "@/application/ports/use-cases/homework/IReviewHomeworkSubmissionUseCase";
import { ReviewHomeworkSubmission } from "@/application/use-cases/homework/ReviewHomeworkSubmission";
import { IDeleteHomeworkUseCase } from "@/application/ports/use-cases/homework/IDeleteHomeworkUseCase";
import { DeleteHomework } from "@/application/use-cases/homework/DeleteHomework";
import { IGetStudentHomeworksUseCase } from "@/application/ports/use-cases/homework/IGetStudentHomeworksUseCase";
import { GetStudentHomeworks } from "@/application/use-cases/homework/GetStudentHomeworks";
import { ISubmitHomeworkUseCase } from "@/application/ports/use-cases/homework/ISubmitHomeworkUseCase";
import { SubmitHomework } from "@/application/use-cases/homework/SubmitHomework";
import { IRequestHomeworkExtensionUseCase } from "@/application/ports/use-cases/homework/IRequestHomeworkExtensionUseCase";
import { RequestHomeworkExtension } from "@/application/use-cases/homework/RequestHomeworkExtension";
import { IReviewHomeworkExtensionUseCase } from "@/application/ports/use-cases/homework/IReviewHomeworkExtensionUseCase";
import { ReviewHomeworkExtension } from "@/application/use-cases/homework/ReviewHomeworkExtension";

import { IApplyLeaveUseCase } from "@/application/ports/use-cases/leave/IApplyLeaveUseCase";
import { ApplyLeave } from "@/application/use-cases/leave/ApplyLeave";
import { IGetStudentLeavesUseCase } from "@/application/ports/use-cases/leave/IGetStudentLeavesUseCase";
import { GetStudentLeaves } from "@/application/use-cases/leave/GetStudentLeaves";
import { IGetBatchLeavesUseCase } from "@/application/ports/use-cases/leave/IGetBatchLeavesUseCase";
import { GetBatchLeaves } from "@/application/use-cases/leave/GetBatchLeaves";
import { IReviewLeaveUseCase } from "@/application/ports/use-cases/leave/IReviewLeaveUseCase";
import { ReviewLeave } from "@/application/use-cases/leave/ReviewLeave";
import { IUpdateStudentLeaveUseCase } from "@/application/ports/use-cases/leave/IUpdateStudentLeaveUseCase";
import { UpdateStudentLeave } from "@/application/use-cases/leave/UpdateStudentLeave";
import { ICancelStudentLeaveUseCase } from "@/application/ports/use-cases/leave/ICancelStudentLeaveUseCase";
import { CancelStudentLeave } from "@/application/use-cases/leave/CancelStudentLeave";
import { IRescheduleStudentLeaveUseCase } from "@/application/ports/use-cases/leave/IRescheduleStudentLeaveUseCase";
import { RescheduleStudentLeave } from "@/application/use-cases/leave/RescheduleStudentLeave";

import { ICreateAssessmentUseCase } from "@/application/ports/use-cases/assessments/ICreateAssessmentUseCase";
import { CreateAssessment } from "@/application/use-cases/assessments/CreateAssessment";
import { IGetAssessmentsUseCase } from "@/application/ports/use-cases/assessments/IGetAssessmentsUseCase";
import { GetAssessments } from "@/application/use-cases/assessments/GetAssessments";
import { IUpdateAssessmentUseCase } from "@/application/ports/use-cases/assessments/IUpdateAssessmentUseCase";
import { UpdateAssessment } from "@/application/use-cases/assessments/UpdateAssessment";
import { IDeleteAssessmentUseCase } from "@/application/ports/use-cases/assessments/IDeleteAssessmentUseCase";
import { DeleteAssessment } from "@/application/use-cases/assessments/DeleteAssessment";

import { ICreateAssessmentCriteriaUseCase } from "@/application/ports/use-cases/assessment-criteria/ICreateAssessmentCriteriaUseCase";
import { CreateAssessmentCriteria } from "@/application/use-cases/assessment-criteria/CreateAssessmentCriteria";
import { IGetAssessmentCriteriaUseCase } from "@/application/ports/use-cases/assessment-criteria/IGetAssessmentCriteriaUseCase";
import { GetAssessmentCriteria } from "@/application/use-cases/assessment-criteria/GetAssessmentCriteria";
import { IUpdateAssessmentCriteriaUseCase } from "@/application/ports/use-cases/assessment-criteria/IUpdateAssessmentCriteriaUseCase";
import { UpdateAssessmentCriteria } from "@/application/use-cases/assessment-criteria/UpdateAssessmentCriteria";
import { IDeleteAssessmentCriteriaUseCase } from "@/application/ports/use-cases/assessment-criteria/IDeleteAssessmentCriteriaUseCase";
import { DeleteAssessmentCriteria } from "@/application/use-cases/assessment-criteria/DeleteAssessmentCriteria";
import { ICreateAssessmentScheduleUseCase } from "@/application/ports/use-cases/assessment-schedules/ICreateAssessmentScheduleUseCase";
import { CreateAssessmentSchedule } from "@/application/use-cases/assessment-schedules/CreateAssessmentSchedule";
import { IGetAssessmentSchedulesUseCase } from "@/application/ports/use-cases/assessment-schedules/IGetAssessmentSchedulesUseCase";
import { GetAssessmentSchedules } from "@/application/use-cases/assessment-schedules/GetAssessmentSchedules";
import { IUpdateAssessmentScheduleUseCase } from "@/application/ports/use-cases/assessment-schedules/IUpdateAssessmentScheduleUseCase";
import { UpdateAssessmentSchedule } from "@/application/use-cases/assessment-schedules/UpdateAssessmentSchedule";
import { IToggleAssessmentScheduleStatusUseCase } from "@/application/ports/use-cases/assessment-schedules/IToggleAssessmentScheduleStatusUseCase";
import { ToggleAssessmentScheduleStatus } from "@/application/use-cases/assessment-schedules/ToggleAssessmentScheduleStatus";
import { IDeleteAssessmentScheduleUseCase } from "@/application/ports/use-cases/assessment-schedules/IDeleteAssessmentScheduleUseCase";
import { DeleteAssessmentSchedule } from "@/application/use-cases/assessment-schedules/DeleteAssessmentSchedule";
import { ISaveAssessmentMarksUseCase } from "@/application/ports/use-cases/assessment-results/ISaveAssessmentMarksUseCase";
import { SaveAssessmentMarks } from "@/application/use-cases/assessment-results/SaveAssessmentMarks";
import { IGetAssessmentResultsUseCase } from "@/application/ports/use-cases/assessment-results/IGetAssessmentResultsUseCase";
import { GetAssessmentResults } from "@/application/use-cases/assessment-results/GetAssessmentResults";
import { IGetMarkEntrySheetUseCase } from "@/application/ports/use-cases/assessment-results/IGetMarkEntrySheetUseCase";
import { GetMarkEntrySheet } from "@/application/use-cases/assessment-results/GetMarkEntrySheet";
import { IPublishAssessmentResultsUseCase } from "@/application/ports/use-cases/assessment-results/IPublishAssessmentResultsUseCase";
import { PublishAssessmentResults } from "@/application/use-cases/assessment-results/PublishAssessmentResults";
import { IGetStudentResultsUseCase } from "@/application/ports/use-cases/assessment-results/IGetStudentResultsUseCase";
import { GetStudentResults } from "@/application/use-cases/assessment-results/GetStudentResults";
import { IGetStudentReportCardUseCase } from "@/application/ports/use-cases/assessment-results/IGetStudentReportCardUseCase";
import { GetStudentReportCard } from "@/application/use-cases/assessment-results/GetStudentReportCard";

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

  bind<IGetStudentCurriculum>(TYPES.GetStudentCurriculumUseCase)
    .to(GetStudentCurriculum)
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

  bind<IGetTeacherCurriculum>(TYPES.GetTeacherCurriculumUseCase)
    .to(GetTeacherCurriculum)
    .inSingletonScope();

  bind<IGetTeacherBatches>(TYPES.GetTeacherBatchesUseCase)
    .to(GetTeacherBatches)
    .inSingletonScope();

  bind<IGetTeacherSubjects>(TYPES.GetTeacherSubjectsUseCase)
    .to(GetTeacherSubjects)
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

  // Batches
  bind<ICreateBatchUseCase>(TYPES.CreateBatchUseCase)
    .to(CreateBatch)
    .inSingletonScope();
  bind<IGetBatchesUseCase>(TYPES.GetBatchesUseCase)
    .to(GetBatches)
    .inSingletonScope();
  bind<IUpdateBatchUseCase>(TYPES.UpdateBatchUseCase)
    .to(UpdateBatch)
    .inSingletonScope();
  bind<IDeleteBatchUseCase>(TYPES.DeleteBatchUseCase)
    .to(DeleteBatch)
    .inSingletonScope();

  // Attendance
  bind<IGetBatchAttendanceUseCase>(TYPES.GetBatchAttendanceUseCase)
    .to(GetBatchAttendance)
    .inSingletonScope();
  bind<ICreateBatchAttendanceUseCase>(TYPES.CreateBatchAttendanceUseCase)
    .to(CreateBatchAttendance)
    .inSingletonScope();
  bind<IUpdateBatchAttendanceUseCase>(TYPES.UpdateBatchAttendanceUseCase)
    .to(UpdateBatchAttendance)
    .inSingletonScope();
  bind<IGetStudentAttendanceUseCase>(TYPES.GetStudentAttendanceUseCase)
    .to(GetStudentAttendance)
    .inSingletonScope();

  // Homework
  bind<ICreateHomeworkUseCase>(TYPES.CreateHomeworkUseCase)
    .to(CreateHomework)
    .inSingletonScope();
  bind<IUpdateHomeworkUseCase>(TYPES.UpdateHomeworkUseCase)
    .to(UpdateHomework)
    .inSingletonScope();
  bind<IGetTeacherHomeworksUseCase>(TYPES.GetTeacherHomeworksUseCase)
    .to(GetTeacherHomeworks)
    .inSingletonScope();
  bind<IGetHomeworkSubmissionsUseCase>(TYPES.GetHomeworkSubmissionsUseCase)
    .to(GetHomeworkSubmissions)
    .inSingletonScope();
  bind<IReviewHomeworkSubmissionUseCase>(TYPES.ReviewHomeworkSubmissionUseCase)
    .to(ReviewHomeworkSubmission)
    .inSingletonScope();
  bind<IDeleteHomeworkUseCase>(TYPES.DeleteHomeworkUseCase)
    .to(DeleteHomework)
    .inSingletonScope();
  bind<IGetStudentHomeworksUseCase>(TYPES.GetStudentHomeworksUseCase)
    .to(GetStudentHomeworks)
    .inSingletonScope();
  bind<ISubmitHomeworkUseCase>(TYPES.SubmitHomeworkUseCase)
    .to(SubmitHomework)
    .inSingletonScope();
  bind<IRequestHomeworkExtensionUseCase>(TYPES.RequestHomeworkExtensionUseCase)
    .to(RequestHomeworkExtension)
    .inSingletonScope();
  bind<IReviewHomeworkExtensionUseCase>(TYPES.ReviewHomeworkExtensionUseCase)
    .to(ReviewHomeworkExtension)
    .inSingletonScope();

  // Leaves
  bind<IApplyLeaveUseCase>(TYPES.ApplyLeaveUseCase)
    .to(ApplyLeave)
    .inSingletonScope();
  bind<IGetStudentLeavesUseCase>(TYPES.GetStudentLeavesUseCase)
    .to(GetStudentLeaves)
    .inSingletonScope();
  bind<IGetBatchLeavesUseCase>(TYPES.GetBatchLeavesUseCase)
    .to(GetBatchLeaves)
    .inSingletonScope();
  bind<IReviewLeaveUseCase>(TYPES.ReviewLeaveUseCase)
    .to(ReviewLeave)
    .inSingletonScope();
  bind<IUpdateStudentLeaveUseCase>(TYPES.UpdateStudentLeaveUseCase)
    .to(UpdateStudentLeave)
    .inSingletonScope();
  bind<ICancelStudentLeaveUseCase>(TYPES.CancelStudentLeaveUseCase)
    .to(CancelStudentLeave)
    .inSingletonScope();
  bind<IRescheduleStudentLeaveUseCase>(TYPES.RescheduleStudentLeaveUseCase)
    .to(RescheduleStudentLeave)
    .inSingletonScope();

  // Assessments
  bind<ICreateAssessmentUseCase>(TYPES.CreateAssessmentUseCase)
    .to(CreateAssessment)
    .inSingletonScope();
  bind<IGetAssessmentsUseCase>(TYPES.GetAssessmentsUseCase)
    .to(GetAssessments)
    .inSingletonScope();
  bind<IUpdateAssessmentUseCase>(TYPES.UpdateAssessmentUseCase)
    .to(UpdateAssessment)
    .inSingletonScope();
  bind<IDeleteAssessmentUseCase>(TYPES.DeleteAssessmentUseCase)
    .to(DeleteAssessment)
    .inSingletonScope();

  // Assessment Criteria
  bind<ICreateAssessmentCriteriaUseCase>(TYPES.CreateAssessmentCriteriaUseCase)
    .to(CreateAssessmentCriteria)
    .inSingletonScope();
  bind<IGetAssessmentCriteriaUseCase>(TYPES.GetAssessmentCriteriaUseCase)
    .to(GetAssessmentCriteria)
    .inSingletonScope();
  bind<IUpdateAssessmentCriteriaUseCase>(TYPES.UpdateAssessmentCriteriaUseCase)
    .to(UpdateAssessmentCriteria)
    .inSingletonScope();
  bind<IDeleteAssessmentCriteriaUseCase>(TYPES.DeleteAssessmentCriteriaUseCase)
    .to(DeleteAssessmentCriteria)
    .inSingletonScope();

  // Assessment Schedules
  bind<ICreateAssessmentScheduleUseCase>(TYPES.CreateAssessmentScheduleUseCase)
    .to(CreateAssessmentSchedule)
    .inSingletonScope();
  bind<IGetAssessmentSchedulesUseCase>(TYPES.GetAssessmentSchedulesUseCase)
    .to(GetAssessmentSchedules)
    .inSingletonScope();
  bind<IUpdateAssessmentScheduleUseCase>(TYPES.UpdateAssessmentScheduleUseCase)
    .to(UpdateAssessmentSchedule)
    .inSingletonScope();
  bind<IToggleAssessmentScheduleStatusUseCase>(TYPES.ToggleAssessmentScheduleStatusUseCase)
    .to(ToggleAssessmentScheduleStatus)
    .inSingletonScope();
  bind<IDeleteAssessmentScheduleUseCase>(TYPES.DeleteAssessmentScheduleUseCase)
    .to(DeleteAssessmentSchedule)
    .inSingletonScope();

  // Assessment Results
  bind<ISaveAssessmentMarksUseCase>(TYPES.SaveAssessmentMarksUseCase)
    .to(SaveAssessmentMarks)
    .inSingletonScope();
  bind<IGetAssessmentResultsUseCase>(TYPES.GetAssessmentResultsUseCase)
    .to(GetAssessmentResults)
    .inSingletonScope();
  bind<IGetMarkEntrySheetUseCase>(TYPES.GetMarkEntrySheetUseCase)
    .to(GetMarkEntrySheet)
    .inSingletonScope();
  bind<IPublishAssessmentResultsUseCase>(TYPES.PublishAssessmentResultsUseCase)
    .to(PublishAssessmentResults)
    .inSingletonScope();
  bind<IGetStudentResultsUseCase>(TYPES.GetStudentResultsUseCase)
    .to(GetStudentResults)
    .inSingletonScope();
  bind<IGetStudentReportCardUseCase>(TYPES.GetStudentReportCardUseCase)
    .to(GetStudentReportCard)
    .inSingletonScope();
});
