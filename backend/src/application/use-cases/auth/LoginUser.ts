import { inject, injectable } from "inversify";
import { IUserRepository } from "@/application/ports/repositories/IUserRepository";
import { IAuthService } from "@/application/ports/services/IAuthService";
import { TYPES } from "@/config/di/types";
import { BadRequestError, UnauthorizedError } from "@/application/error/AppError";
import { ILoginUser } from "@/application/ports/use-cases/auth/ILoginUserUseCase";
import { LoginUserResponseDTO } from "@/application/dto/auth/authDtos";
import { UserRole } from "@/domain/enums/UserRole";
import { ITeacherRepository } from "@/application/ports/repositories/ITeacherRepository";
import {IStudentRepository} from '@/application/ports/repositories/IStudentRepository'

@injectable()
export class LoginUser implements ILoginUser {
  constructor(
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService,
    @inject(TYPES.StudentRepository) private _studentRepo:IStudentRepository,
    @inject(TYPES.TeacherRepository) private _teacherRepo:ITeacherRepository
  ) { }

  async execute(
    email: string,
    password: string,
    role: string,
  ): Promise<LoginUserResponseDTO> {
    if (!email || !password || !role) {
      throw new BadRequestError("Email, password and role are required");
    }

    const user = await this._userRepo.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.role?.toLowerCase() !== role?.toLowerCase()) {
      throw new UnauthorizedError("Access denied: role mismatch");
    }

    const isMatch = await this._authSvc.comparePassword(password, user.password!);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    let photo: string | undefined = undefined;
    if (role.toUpperCase() === UserRole.STUDENT) {
      const student = await this._studentRepo.findByEmail(email);
      if (student && student.isActive === false) {
        throw new UnauthorizedError("Your account has been deactivated by the administrator.");
      }
      photo = student?.photo;
    } else if (role.toUpperCase() === UserRole.TEACHER) {
      const teacher = await this._teacherRepo.findByEmail(email);
      if (teacher && teacher.isActive === false) {
        throw new UnauthorizedError("Your account has been deactivated by the administrator.");
      }
      photo = teacher?.photo;
    }


    const accessToken = this._authSvc.generateAccessToken(user.id!, user.email!, user.role!);
    const refreshToken = this._authSvc.generateRefreshToken(user.id!, user.email!, user.role!);
    // user.id! - ! means telling that the value is not null


    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id!,
        name: user.name!,
        email: user.email!,
        role: user.role as UserRole,
        photo,
      },
    };
  }
}
