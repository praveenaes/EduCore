import { injectable, inject } from "inversify";
import { randomBytes } from "crypto";
import { TYPES } from "../../../config/di/types";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { IEmailService } from "../../ports/services/IEmailService";
import { IStorageService } from "../../ports/services/IStorageService";
import { Teacher } from "../../../domain/entities/Teacher";
import { User } from "../../../domain/entities/User";
import { UserRole } from "../../../domain/enums/UserRole";
import { ValidationError } from "@/shared/errors/AppError";
import { ICreateTeacher } from "../../ports/use-cases/teachers/ICreateTeacherUseCase";

@injectable()
export class CreateTeacher implements ICreateTeacher {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService,
    @inject(TYPES.EmailService) private _emailSvc: IEmailService,
    @inject(TYPES.StorageService) private _storageSvc: IStorageService
  ) {}

  async execute(dto: any, photoFile?: Express.Multer.File): Promise<Teacher> {
    // 1. Uniqueness Validation
    
    // Employee ID uniqueness check
    const existingByEmployee = await this._teacherRepo.findByEmployeeId(dto.employeeId);
    if (existingByEmployee) {
      throw new ValidationError("Employee ID already exists.");
    }

    // National ID uniqueness check
    const existingByNationalId = await this._teacherRepo.findByNationalId(dto.nationalId);
    if (existingByNationalId) {
      throw new ValidationError("National ID already exists.");
    }

    // Name uniqueness check
    const existingByName = await this._teacherRepo.findByName(dto.firstName, dto.lastName);
    if (existingByName) {
      throw new ValidationError("Teacher with this name already exists.");
    }

    // Email uniqueness check
    const existingByEmail = await this._teacherRepo.findByEmail(dto.email);
    const existingUserByEmail = await this._userRepo.findByEmail(dto.email);
    if (existingByEmail || existingUserByEmail) {
      throw new ValidationError("Email already exists.");
    }

    // 2. Generate secure temporary password
    const tempPassword = randomBytes(8).toString("base64url").substring(0, 12) + "!1Aa";

    // 3. Hash password
    const passwordHash = await this._authSvc.hashPassword(tempPassword);

    const userEntity = User.createNew({
      email: dto.email,
      password: passwordHash,
      role: UserRole.TEACHER,
      name: `${dto.firstName} ${dto.lastName}`
    });

    // 5. Upload profile photo to S3 if provided
    let photoUrl = "";
    if (photoFile) {
      photoUrl = await this._storageSvc.uploadFile(
        photoFile.buffer,
        photoFile.originalname,
        photoFile.mimetype,
        "teachers"
      );
    }

    let savedUser;
    let savedTeacher;

    try {
      savedUser = await this._userRepo.create(userEntity);

      // 6. Create Teacher entity
      const teacherEntity = Teacher.createNew({
        firstName: dto.firstName,
        lastName: dto.lastName,
        employeeId: dto.employeeId,
        joiningDate: new Date(dto.joiningDate),
        qualifications: dto.qualifications,
        specializations: dto.specializations,
        experience: parseInt(dto.experience) || 0,
        salary: parseFloat(dto.salary) || 0,
        gender: dto.gender,
        dateOfBirth: new Date(dto.dateOfBirth),
        bloodGroup: dto.bloodGroup,
        nationalId: dto.nationalId,
        photo: photoUrl,
        phone: dto.phone,
        email: dto.email,
        house: dto.house,
        area: dto.area,
        city: dto.city,
        state: dto.state,
        postalCode: dto.postalCode,
        country: dto.country,
        userId: savedUser.id!
      });

      savedTeacher = await this._teacherRepo.create(teacherEntity);
    } catch (err) {
      // Rollback uploaded S3 photo on failure
      if (photoUrl) {
        await this._storageSvc.deleteFile(photoUrl).catch(delErr => {
          console.warn("Failed to delete uploaded S3 photo during rollback:", delErr);
        });
      }
      throw err;
    }

    // 7. Send credentials email
    await this._emailSvc.sendWelcome(
      dto.email,
      dto.employeeId,
      tempPassword,
      "Educore School"
    ).catch(emailErr => {
      console.warn("Failed to send welcome email to teacher:", emailErr);
    });

    return savedTeacher;
  }
}
