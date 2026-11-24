import { inject, injectable } from "inversify";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { TYPES } from "@/config/di/types";
import { UnauthorizedError } from "@/shared/errors/AppError";
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

    return new User({
      id: user.id,
      email: user.email!,
      role: user.role!,
      name: user.name!,
      photo
    });
  }
}
