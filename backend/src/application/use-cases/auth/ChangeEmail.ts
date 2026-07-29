import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IStudentRepository } from "../../ports/repositories/IStudentRepository";
import { ITeacherRepository } from "../../ports/repositories/ITeacherRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { NotFoundError, BadRequestError } from "../../error/AppError";

@injectable()
export class ChangeEmail {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService
  ) {}

  async execute(
    userId: string,
    data: {
      newEmail?: string;
      confirmNewEmail?: string;
      emailChangeToken?: string;
    }
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

    await this._userRepo.update(userId, { email: cleanNewEmail });

    if (user.role?.toLowerCase() === "student") {
      const student = await this._studentRepo.findByEmail(currentEmail);
      if (student) {
        try {
          await this._studentRepo.update(student.id!, { email: cleanNewEmail });
        } catch (err) {
          // Rollback user update
          await this._userRepo.update(userId, { email: currentEmail });
          throw err;
        }
      }
    } else if (user.role?.toLowerCase() === "teacher") {
      const teacher = await this._teacherRepo.findByEmail(currentEmail);
      if (teacher) {
        try {
          await this._teacherRepo.update(teacher.id!, { email: cleanNewEmail });
        } catch (err) {
          await this._userRepo.update(userId, { email: currentEmail });
          throw err;
        }
      }
    }
  }
}
