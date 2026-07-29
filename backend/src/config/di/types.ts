const TYPES = {
  // Repositories
  UserRepository: Symbol.for("UserRepository"),
  StudentRepository: Symbol.for("StudentRepository"),

  // Services
  AuthService: Symbol.for("AuthService"),
  EmailService: Symbol.for("EmailService"),

  // Controllers
  AuthController: Symbol.for("AuthController"),
  StudentController: Symbol.for("StudentController"),
  TeacherController: Symbol.for("TeacherController"),

  // Use Cases
  LoginUserUseCase: Symbol.for("LoginUserUseCase"),
  RefreshTokenUseCase: Symbol.for("RefreshTokenUseCase"),
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
  TeacherRepository: Symbol.for("TeacherRepository"),
  CreateTeacherUseCase: Symbol.for("CreateTeacherUseCase"),
  GetTeachersUseCase: Symbol.for("GetTeachersUseCase"),
  ToggleTeacherStatusUseCase: Symbol.for("ToggleTeacherStatusUseCase"),
  ExportTeachersCsvUseCase: Symbol.for("ExportTeachersCsvUseCase"),
  UpdateTeacherUseCase: Symbol.for("UpdateTeacherUseCase"),
  DeleteTeacherUseCase: Symbol.for("DeleteTeacherUseCase"),

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
};

export { TYPES };
