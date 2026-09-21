//is TYPES object gives every dependency a unique identifier
//at runtime, TypeScript interfaces don't exist
//  because they are removed when TypeScript is compiled.

// // So tsyringe needs another way to identify the dependency.
const TYPES = {
  // Repositories
  UserRepository: Symbol.for("UserRepository"),
  StudentRepository: Symbol.for("StudentRepository"),

  // Services
  AuthService: Symbol.for("AuthService"),
  EmailService: Symbol.for("EmailService"),
  TokenBlacklistService: Symbol.for("TokenBlacklistService"),

  // Controllers
  AuthController: Symbol.for("AuthController"),
  StudentController: Symbol.for("StudentController"),
  TeacherController: Symbol.for("TeacherController"),

  // Use Cases
  LoginUserUseCase: Symbol.for("LoginUserUseCase"),
  RefreshTokenUseCase: Symbol.for("RefreshTokenUseCase"),
  LogoutUserUseCase: Symbol.for("LogoutUserUseCase"),
  GetMeUseCase: Symbol.for("GetMeUseCase"),
  ForgotPasswordUseCase: Symbol.for("ForgotPasswordUseCase"),
  VerifyOtpUseCase: Symbol.for("VerifyOtpUseCase"),
  ResetPasswordUseCase: Symbol.for("ResetPasswordUseCase"),
  GetStudentsUseCase: Symbol.for("GetStudentsUseCase"),
  ToggleStudentStatusUseCase: Symbol.for("ToggleStudentStatusUseCase"),
  ExportStudentsCsvUseCase: Symbol.for("ExportStudentsCsvUseCase"),
  StorageService: Symbol.for("StorageService"),
  CreateStudentUseCase: Symbol.for("CreateStudentUseCase"),
  UpdateStudentUseCase: Symbol.for("UpdateStudentUseCase"),
  DeleteStudentUseCase: Symbol.for("DeleteStudentUseCase"),
  GetStudentCurriculumUseCase: Symbol.for("GetStudentCurriculumUseCase"),
  TeacherRepository: Symbol.for("TeacherRepository"),
  CreateTeacherUseCase: Symbol.for("CreateTeacherUseCase"),
  GetTeachersUseCase: Symbol.for("GetTeachersUseCase"),
  ToggleTeacherStatusUseCase: Symbol.for("ToggleTeacherStatusUseCase"),
  ExportTeachersCsvUseCase: Symbol.for("ExportTeachersCsvUseCase"),
  UpdateTeacherUseCase: Symbol.for("UpdateTeacherUseCase"),
  DeleteTeacherUseCase: Symbol.for("DeleteTeacherUseCase"),
  GetTeacherCurriculumUseCase: Symbol.for("GetTeacherCurriculumUseCase"),

  // Settings
  OrganizationRepository: Symbol.for("OrganizationRepository"),
  GetOrganizationSettingsUseCase: Symbol.for("GetOrganizationSettingsUseCase"),
  UpdateOrganizationSettingsUseCase: Symbol.for("UpdateOrganizationSettingsUseCase"),
  GetMySettingsUseCase: Symbol.for("GetMySettingsUseCase"),
  UpdateMyProfilePhotoUseCase: Symbol.for("UpdateMyProfilePhotoUseCase"),
  ChangePasswordUseCase: Symbol.for("ChangePasswordUseCase"),
  SendEmailChangeOtpUseCase: Symbol.for("SendEmailChangeOtpUseCase"),
  VerifyEmailChangeOtpUseCase: Symbol.for("VerifyEmailChangeOtpUseCase"),
  ChangeEmailUseCase: Symbol.for("ChangeEmailUseCase"),
  SettingsController: Symbol.for("SettingsController"),

    // Programs
  ProgramRepository: Symbol.for("ProgramRepository"),
  CreateProgramUseCase: Symbol.for("CreateProgramUseCase"),
  GetProgramsUseCase: Symbol.for("GetProgramsUseCase"),
  UpdateProgramUseCase: Symbol.for("UpdateProgramUseCase"),
  DeleteProgramUseCase: Symbol.for("DeleteProgramUseCase"),
  ProgramController: Symbol.for("ProgramController"),
  // Courses
  CourseRepository: Symbol.for("CourseRepository"),
  CreateCourseUseCase: Symbol.for("CreateCourseUseCase"),
  GetCoursesUseCase: Symbol.for("GetCoursesUseCase"),
  UpdateCourseUseCase: Symbol.for("UpdateCourseUseCase"),
  DeleteCourseUseCase: Symbol.for("DeleteCourseUseCase"),
  CourseController: Symbol.for("CourseController"),
  // Subjects
  SubjectRepository: Symbol.for("SubjectRepository"),
  CreateSubjectUseCase: Symbol.for("CreateSubjectUseCase"),
  GetSubjectsUseCase: Symbol.for("GetSubjectsUseCase"),
  UpdateSubjectUseCase: Symbol.for("UpdateSubjectUseCase"),
  DeleteSubjectUseCase: Symbol.for("DeleteSubjectUseCase"),
  SubjectController: Symbol.for("SubjectController"),
  // Centers
  CenterRepository: Symbol.for("CenterRepository"),
  CreateCenterUseCase: Symbol.for("CreateCenterUseCase"),
  GetCentersUseCase: Symbol.for("GetCentersUseCase"),
  UpdateCenterUseCase: Symbol.for("UpdateCenterUseCase"),
  DeleteCenterUseCase: Symbol.for("DeleteCenterUseCase"),
  CenterController: Symbol.for("CenterController"),
  // Academic Years
  AcademicYearRepository: Symbol.for("AcademicYearRepository"),
  CreateAcademicYearUseCase: Symbol.for("CreateAcademicYearUseCase"),
  GetAcademicYearsUseCase: Symbol.for("GetAcademicYearsUseCase"),
  UpdateAcademicYearUseCase: Symbol.for("UpdateAcademicYearUseCase"),
  DeleteAcademicYearUseCase: Symbol.for("DeleteAcademicYearUseCase"),
  AcademicYearController: Symbol.for("AcademicYearController"),
  // Subject Assignments
  SubjectAssignmentRepository: Symbol.for("SubjectAssignmentRepository"),
  CreateSubjectAssignmentUseCase: Symbol.for("CreateSubjectAssignmentUseCase"),
  GetSubjectAssignmentsUseCase: Symbol.for("GetSubjectAssignmentsUseCase"),
  UpdateSubjectAssignmentUseCase: Symbol.for("UpdateSubjectAssignmentUseCase"),
  DeleteSubjectAssignmentUseCase: Symbol.for("DeleteSubjectAssignmentUseCase"),
  SubjectAssignmentController: Symbol.for("SubjectAssignmentController"),
  // Batches
  BatchRepository: Symbol.for("BatchRepository"),
  CreateBatchUseCase: Symbol.for("CreateBatchUseCase"),
  GetBatchesUseCase: Symbol.for("GetBatchesUseCase"),
  UpdateBatchUseCase: Symbol.for("UpdateBatchUseCase"),
  DeleteBatchUseCase: Symbol.for("DeleteBatchUseCase"),
  BatchController: Symbol.for("BatchController"),
};

export { TYPES };
