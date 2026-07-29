import { inject, injectable } from "inversify";
import { TYPES } from "@/config/di/types";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IStudentRepository } from "../../ports/repositories/IStudentRepository";
import { ITeacherRepository } from "../../ports/repositories/ITeacherRepository";
import { NotFoundError } from "../../error/AppError";
import { UserRole } from "@/domain/enums/UserRole";

import { IGetMySettings } from "../../ports/use-cases/settings/IGetMySettingsUseCase";

@injectable()
export class GetMySettings implements IGetMySettings {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository
  ) {}

  async execute(userId: string, role: string): Promise<any> {
    const user = await this._userRepo.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    let profile: any = null;

    if (role.toUpperCase() === UserRole.STUDENT) {
      profile = await this._studentRepo.findByEmail(user.email!);
    } else if (role.toUpperCase() === UserRole.TEACHER) {
      profile = await this._teacherRepo.findByEmail(user.email!);
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      profile,
    };
  }
}
