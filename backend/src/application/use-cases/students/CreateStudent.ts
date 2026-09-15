import { injectable, inject } from "inversify";
import { randomBytes } from "crypto";
import { TYPES } from "../../../config/di/types";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IAuthService } from "../../ports/services/IAuthService";
import { IEmailService } from "../../ports/services/IEmailService";
import { IStorageService } from "../../ports/services/IStorageService";
import { Student } from "../../../domain/entities/Student";
import { User } from "../../../domain/entities/User";
import { UserRole } from "../../../domain/enums/UserRole";
import { ValidationError } from "@/shared/errors/AppError";
import { ICreateStudent } from "../../ports/use-cases/students/ICreateStudentUseCase";
import { CreateStudentDTO, CreateStudentResponseDTO } from "../../dto/students/studentDtos";

@injectable()
export class CreateStudent implements ICreateStudent {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.AuthService) private _authSvc: IAuthService,
    @inject(TYPES.EmailService) private _emailSvc: IEmailService,
    @inject(TYPES.StorageService) private _storageSvc: IStorageService
  ) {}

  async execute(dto: CreateStudentDTO, photoFile?: Express.Multer.File): Promise<CreateStudentResponseDTO> {
    const existingByName = await this._studentRepo.findByName(dto.firstName, dto.lastName);
    if (existingByName) {
      throw new ValidationError("Student with this name already exists.");
    }

    const existingByAdmission = await this._studentRepo.findByAdmissionNumber(dto.admissionNumber);
    if (existingByAdmission) {
      throw new ValidationError("Admission Number already exists.");
    }

    const existingByNationalId = await this._studentRepo.findByNationalId(dto.nationalId);
    if (existingByNationalId) {
      throw new ValidationError("National ID already exists.");
    }

    const existingByEmail = await this._studentRepo.findByEmail(dto.email);
    const existingUserByEmail = await this._userRepo.findByEmail(dto.email);
    if (existingByEmail || existingUserByEmail) {
      throw new ValidationError("Email already exists.");
    }

    let photoUrl = "";
    if (photoFile) {
      photoUrl = await this._storageSvc.uploadFile(
        photoFile.buffer,
        photoFile.originalname,
        photoFile.mimetype,
        "students"
      );
    }

    const tempPassword = randomBytes(8).toString("base64url").substring(0, 12) + "!1Aa";

    const passwordHash = await this._authSvc.hashPassword(tempPassword);

    const userEntity = User.createNew({
      email: dto.email,
      password: passwordHash,
      role: UserRole.STUDENT,
      name: `${dto.firstName} ${dto.lastName}`
    });

    const savedUser = await this._userRepo.create(userEntity);

    const studentEntity = Student.createNew({
      firstName: dto.firstName,
      lastName: dto.lastName,
      admissionNumber: dto.admissionNumber,
      admissionDate: new Date(dto.admissionDate),
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

    const savedStudent = await this._studentRepo.create(studentEntity);

  
    await this._emailSvc.sendWelcome(dto.email, dto.email, tempPassword, "EduCore");

    return {
      id: savedStudent.id!,
      firstName: savedStudent.firstName,
      lastName: savedStudent.lastName,
      admissionNumber: savedStudent.admissionNumber,
      admissionDate: savedStudent.admissionDate,
      gender: savedStudent.gender,
      dateOfBirth: savedStudent.dateOfBirth,
      bloodGroup: savedStudent.bloodGroup,
      nationalId: savedStudent.nationalId,
      photo: savedStudent.photo,
      phone: savedStudent.phone,
      email: savedStudent.email,
      house: savedStudent.house,
      area: savedStudent.area,
      city: savedStudent.city,
      state: savedStudent.state,
      postalCode: savedStudent.postalCode,
      country: savedStudent.country,
      userId: savedStudent.userId,
      createdAt: savedStudent.createdAt,
      updatedAt: savedStudent.updatedAt,
    };
  }
}
