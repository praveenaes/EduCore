import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { IStudentRepository } from "../../ports/repositories/IStudentRepository";
import { IUserRepository } from "../../ports/repositories/IUserRepository";
import { IStorageService } from "../../ports/services/IStorageService";
import { Student } from "../../../domain/entities/Student";
import { ValidationError, NotFoundError } from "../../error/AppError";
import { IUpdateStudent } from "../../ports/use-cases/students/IUpdateStudentUseCase";

@injectable()
export class UpdateStudent implements IUpdateStudent {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository,
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.StorageService) private _storageSvc: IStorageService
  ) {}

  async execute(id: string, dto: any, photoFile?: Express.Multer.File): Promise<Student> {
    const existing = await this._studentRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Student not found");
    }

    const newFirstName = dto.firstName !== undefined ? dto.firstName : existing.firstName;
    const newLastName = dto.lastName !== undefined ? dto.lastName : existing.lastName;

    if (newFirstName !== existing.firstName || newLastName !== existing.lastName) {
      const nameTaken = await this._studentRepo.findByName(newFirstName, newLastName);
      if (nameTaken && nameTaken.id !== id) {
        throw new ValidationError("Student with this name already exists.");
      }
    }

    if (dto.email && dto.email !== existing.email) {
      const emailTaken = await this._studentRepo.findByEmail(dto.email);
      const userEmailTaken = await this._userRepo.findByEmail(dto.email);
      if (
        (emailTaken && emailTaken.id !== id) ||
        (userEmailTaken && userEmailTaken.id !== existing.userId)
      ) {
        throw new ValidationError("Email already exists.");
      }
    }

    if (dto.nationalId && dto.nationalId !== existing.nationalId) {
      const nationalIdTaken = await this._studentRepo.findByNationalId(dto.nationalId);
      if (nationalIdTaken && nationalIdTaken.id !== id) {
        throw new ValidationError("National ID already exists.");
      }
    }

    if (dto.admissionNumber && dto.admissionNumber !== existing.admissionNumber) {
      const admissionTaken = await this._studentRepo.findByAdmissionNumber(dto.admissionNumber);
      if (admissionTaken && admissionTaken.id !== id) {
        throw new ValidationError("Admission Number already exists.");
      }
    }

    const updatePayload: any = {};
    if (dto.firstName !== undefined) updatePayload.firstName = dto.firstName;
    if (dto.lastName !== undefined) updatePayload.lastName = dto.lastName;
    if (dto.admissionDate !== undefined) updatePayload.admissionDate = new Date(dto.admissionDate);
    if (dto.gender !== undefined) updatePayload.gender = dto.gender;
    if (dto.dateOfBirth !== undefined) updatePayload.dateOfBirth = new Date(dto.dateOfBirth);
    if (dto.bloodGroup !== undefined) updatePayload.bloodGroup = dto.bloodGroup;
    if (dto.nationalId !== undefined) updatePayload.nationalId = dto.nationalId;
    if (dto.phone !== undefined) updatePayload.phone = dto.phone;
    if (dto.email !== undefined) updatePayload.email = dto.email;
    if (dto.house !== undefined) updatePayload.house = dto.house;
    if (dto.area !== undefined) updatePayload.area = dto.area;
    if (dto.city !== undefined) updatePayload.city = dto.city;
    if (dto.state !== undefined) updatePayload.state = dto.state;
    if (dto.postalCode !== undefined) updatePayload.postalCode = dto.postalCode;
    if (dto.country !== undefined) updatePayload.country = dto.country;

    if (dto.removePhoto === "true") {
      updatePayload.photo = "";
      if (existing.photo) {
        await this._storageSvc.deleteFile(existing.photo).catch(err => {
          console.warn("Failed to delete old S3 photo:", err);
        });
      }
    } else if (photoFile) {
      const photoUrl = await this._storageSvc.uploadFile(
        photoFile.buffer,
        photoFile.originalname,
        photoFile.mimetype,
        "students"
      );
      updatePayload.photo = photoUrl;
      if (existing.photo) {
        await this._storageSvc.deleteFile(existing.photo).catch(err => {
          console.warn("Failed to delete old S3 photo:", err);
        });
      }
    }

    if (dto.firstName || dto.lastName) {
      const newName = `${dto.firstName ?? existing.firstName} ${dto.lastName ?? existing.lastName}`;
      await this._userRepo.update(existing.userId, { name: newName });
    }

    if (dto.email && dto.email !== existing.email) {
      await this._userRepo.update(existing.userId, { email: dto.email });
    }

    const updatedStudent = await this._studentRepo.update(id, updatePayload);
    if (!updatedStudent) {
      throw new ValidationError("Student update failed");
    }

    return updatedStudent;
  }
}
