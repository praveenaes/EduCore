import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ITeacherRepository } from "@/domain/repositories/ITeacherRepository";
import { IUserRepository } from "@/domain/repositories/IUserRepository";
import { IStorageService } from "../../ports/services/IStorageService";
import { Teacher } from "../../../domain/entities/Teacher";
import { ValidationError, NotFoundError } from "@/shared/errors/AppError";
import { IUpdateTeacher } from "../../ports/use-cases/teachers/IUpdateTeacherUseCase";

import { UpdateTeacherDTO } from "@/application/dto/teachers/teacherDtos";
import { TeacherProps } from "@/domain/entities/Teacher";

@injectable()
export class UpdateTeacher implements IUpdateTeacher {
  constructor(
    @inject(TYPES.TeacherRepository) private _teacherRepo: ITeacherRepository,
    @inject(TYPES.UserRepository) private _userRepo: IUserRepository,
    @inject(TYPES.StorageService) private _storageSvc: IStorageService
  ) {}

  async execute(id: string, dto: UpdateTeacherDTO, photoFile?: Express.Multer.File): Promise<Teacher> {
    const existing = await this._teacherRepo.findById(id);
    if (!existing) {
      throw new NotFoundError("Teacher not found");
    }

    // 1. Uniqueness validation (excluding current record)
    
    // Name check
    const newFirstName = dto.firstName !== undefined ? dto.firstName : existing.firstName;
    const newLastName = dto.lastName !== undefined ? dto.lastName : existing.lastName;

    if (newFirstName !== existing.firstName || newLastName !== existing.lastName) {
      const nameTaken = await this._teacherRepo.findByName(newFirstName, newLastName);
      if (nameTaken && nameTaken.id !== id) {
        throw new ValidationError("Teacher with this name already exists.");
      }
    }

    // Email check
    if (dto.email && dto.email !== existing.email) {
      const emailTaken = await this._teacherRepo.findByEmail(dto.email);
      const userEmailTaken = await this._userRepo.findByEmail(dto.email);
      if (
        (emailTaken && emailTaken.id !== id) ||
        (userEmailTaken && userEmailTaken.id !== existing.userId)
      ) {
        throw new ValidationError("Email already exists.");
      }
    }

    // National ID check
    if (dto.nationalId && dto.nationalId !== existing.nationalId) {
      const nationalIdTaken = await this._teacherRepo.findByNationalId(dto.nationalId);
      if (nationalIdTaken && nationalIdTaken.id !== id) {
        throw new ValidationError("National ID already exists.");
      }
    }

    // Employee ID check
    if (dto.employeeId && dto.employeeId !== existing.employeeId) {
      const employeeIdTaken = await this._teacherRepo.findByEmployeeId(dto.employeeId);
      if (employeeIdTaken && employeeIdTaken.id !== id) {
        throw new ValidationError("Employee ID already exists.");
      }
    }

    // 2. Build update payload
    const updatePayload: Partial<TeacherProps> = {};
    if (dto.employeeId !== undefined) updatePayload.employeeId = dto.employeeId;
    if (dto.firstName !== undefined) updatePayload.firstName = dto.firstName;
    if (dto.lastName !== undefined) updatePayload.lastName = dto.lastName;
    if (dto.joiningDate !== undefined) updatePayload.joiningDate = new Date(dto.joiningDate);
    if (dto.qualifications !== undefined) updatePayload.qualifications = dto.qualifications;
    if (dto.specializations !== undefined) updatePayload.specializations = dto.specializations;
    if (dto.experience !== undefined) updatePayload.experience = typeof dto.experience === "number" ? dto.experience : parseInt(dto.experience, 10) || 0;
    if (dto.salary !== undefined) updatePayload.salary = typeof dto.salary === "number" ? dto.salary : parseFloat(String(dto.salary)) || 0;
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

    // 3. Photo upload / remove logic
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
        "teachers"
      );
      updatePayload.photo = photoUrl;
      if (existing.photo) {
        await this._storageSvc.deleteFile(existing.photo).catch(err => {
          console.warn("Failed to delete old S3 photo:", err);
        });
      }
    }

    // 4. Sync linked User record name
    if (dto.firstName || dto.lastName) {
      const newName = `${dto.firstName ?? existing.firstName} ${dto.lastName ?? existing.lastName}`;
      await this._userRepo.update(existing.userId, { name: newName });
    }

    // 5. Sync linked User record email
    if (dto.email && dto.email !== existing.email) {
      await this._userRepo.update(existing.userId, { email: dto.email });
    }

    // 6. Update teacher database record
    const updatedTeacher = await this._teacherRepo.update(id, updatePayload);
    if (!updatedTeacher) {
      throw new ValidationError("Teacher update failed");
    }

    return updatedTeacher;
  }
}
