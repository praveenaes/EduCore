import { inject, injectable } from "inversify";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IStudentRepository } from "@/application/ports/repositories/IStudentRepository";
import { ITeacherRepository } from "@/application/ports/repositories/ITeacherRepository";
import { TYPES } from "@/config/di/types";
import { UnauthorizedError } from "@/application/error/AppError";
import { IGetMe } from "@/application/ports/use-cases/auth/IGetMeUseCase";
import { User } from "@/domain/entities/User";
import { UserRole } from "@/domain/enums/UserRole";

@injectable()
export class GetMe implements IGetMe {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    let photo: string | undefined = undefined;
    if (user.role?.toUpperCase() === UserRole.STUDENT) {
      const student = await this._studentRepo.findByEmail(user.email!);
      photo = student?.photo;
    } else if (user.role?.toUpperCase() === UserRole.TEACHER) {
      const teacher = await this._teacherRepo.findByEmail(user.email!);
      photo = teacher?.photo;
    }

    return new User(
      user.id,
      user.email,
      undefined,
      user.role,
      user.name,
      undefined,
      undefined,
      undefined,
      undefined,
      photo
    );
  }
}
