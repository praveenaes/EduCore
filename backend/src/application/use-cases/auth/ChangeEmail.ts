import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { NotFoundError, BadRequestError } from "@/shared/errors/AppError";
import { IChangeEmail, ChangeEmailDTO } from "../../ports/use-cases/auth/IChangeEmailUseCase";

@injectable()
export class ChangeEmail implements IChangeEmail {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService
  ) {}

  async execute(
    userId: string,
    data: ChangeEmailDTO
  ): Promise<void> {
    const { newEmail, confirmNewEmail, emailChangeToken } = data;

    if (!newEmail || !confirmNewEmail || !emailChangeToken) {
      throw new BadRequestError("All fields are required");
    }

    if (newEmail.trim().toLowerCase() !== confirmNewEmail.trim().toLowerCase()) {
      throw new BadRequestError("Emails do not match");
    }

    const decoded = this._authSvc.verifyToken(emailChangeToken);
    if (!decoded || decoded.purpose !== "email-change" || decoded.userId !== userId) {
      throw new BadRequestError("Invalid or expired email change token");
    }

    const currentEmail = decoded.email;
    const cleanNewEmail = newEmail.trim().toLowerCase();

    if (cleanNewEmail === currentEmail.trim().toLowerCase()) {
      throw new BadRequestError("New email must be different from current email");
    }

    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const existingUser = await this._userRepo.findByEmail(cleanNewEmail);
    const existingStudent = await this._studentRepo.findByEmail(cleanNewEmail);
    const existingTeacher = await this._teacherRepo.findByEmail(cleanNewEmail);

    if (existingUser || existingStudent || existingTeacher) {
      throw new BadRequestError("Email address already in use");
    }

    user.changeEmail(cleanNewEmail);
    await this._userRepo.update(userId, user);

    if (user.role?.toLowerCase() === "student") {
      const student = await this._studentRepo.findByEmail(currentEmail);
      if (student) {
        try {
          student.changeEmail(cleanNewEmail);
          await this._studentRepo.update(student.id!, student);
        } catch (err) {
          // Rollback user update
          user.changeEmail(currentEmail);
          await this._userRepo.update(userId, user);
          throw err;
        }
      }
    } else if (user.role?.toLowerCase() === "teacher") {
      const teacher = await this._teacherRepo.findByEmail(currentEmail);
      if (teacher) {
        try {
          teacher.changeEmail(cleanNewEmail);
          await this._teacherRepo.update(teacher.id!, teacher);
        } catch (err) {
          user.changeEmail(currentEmail);
          await this._userRepo.update(userId, user);
          throw err;
        }
      }
    }
  }
}
