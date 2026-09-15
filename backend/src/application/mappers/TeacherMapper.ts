import { Types } from "mongoose";
import { Teacher } from "../../domain/entities/Teacher";

export interface ITeacherPersistenceInput {
  _id: Types.ObjectId |string
  firstName: string;
  lastName: string;
  employeeId: string;
  joiningDate: Date;
  qualifications: string;
  specializations: string;
  experience: number;
  salary: number;
  gender: string;
  dateOfBirth: Date;
  bloodGroup: string;
  nationalId: string;
  photo: string;
  phone: string;
  email: string;
  house: string;
  area: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDeleted: boolean;
  isActive: boolean;
  userId: Types.ObjectId|string
  createdAt?: Date;
  updatedAt?: Date;
}

export class TeacherMapper {
  static toDomain(doc: ITeacherPersistenceInput): Teacher {
    return new Teacher({
      id: doc._id.toString(),
      firstName: doc.firstName,
      lastName: doc.lastName,
      employeeId: doc.employeeId,
      joiningDate: doc.joiningDate,
      qualifications: doc.qualifications,
      specializations: doc.specializations,
      experience: doc.experience,
      salary: doc.salary,
      gender: doc.gender,
      dateOfBirth: doc.dateOfBirth,
      bloodGroup: doc.bloodGroup,
      nationalId: doc.nationalId,
      photo: doc.photo,
      phone: doc.phone,
      email: doc.email,
      house: doc.house,
      area: doc.area,
      city: doc.city,
      state: doc.state,
      postalCode: doc.postalCode,
      country: doc.country,
      isDeleted: doc.isDeleted,
      isActive: doc.isActive,
      userId: doc.userId.toString(),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(teacher: Teacher): {
    firstName: string;
    lastName: string;
    employeeId: string;
    joiningDate: Date;
    qualifications: string;
    specializations: string;
    experience: number;
    salary: number;
    gender: string;
    dateOfBirth: Date;
    bloodGroup: string;
    nationalId: string;
    photo: string;
    phone: string;
    email: string;
    house: string;
    area: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    isDeleted: boolean;
    isActive: boolean;
    userId: string;
  } {
    return {
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      employeeId: teacher.employeeId,
      joiningDate: teacher.joiningDate,
      qualifications: teacher.qualifications,
      specializations: teacher.specializations,
      experience: teacher.experience,
      salary: teacher.salary,
      gender: teacher.gender,
      dateOfBirth: teacher.dateOfBirth,
      bloodGroup: teacher.bloodGroup,
      nationalId: teacher.nationalId,
      photo: teacher.photo,
      phone: teacher.phone,
      email: teacher.email,
      house: teacher.house,
      area: teacher.area,
      city: teacher.city,
      state: teacher.state,
      postalCode: teacher.postalCode,
      country: teacher.country,
      isDeleted: teacher.isDeleted,
      isActive: teacher.isActive,
      userId: teacher.userId,
    };
  }

  static toPersistencePartial(teacher: Partial<Teacher>): {
    firstName?: string;
    lastName?: string;
    joiningDate?: Date;
    qualifications?: string;
    specializations?: string;
    experience?: number;
    salary?: number;
    gender?: string;
    dateOfBirth?: Date;
    bloodGroup?: string;
    nationalId?: string;
    photo?: string;
    phone?: string;
    email?: string;
    house?: string;
    area?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isActive?: boolean;
    isDeleted?: boolean;
  } {
    const updateData: {
      firstName?: string;
      lastName?: string;
      joiningDate?: Date;
      qualifications?: string;
      specializations?: string;
      experience?: number;
      salary?: number;
      gender?: string;
      dateOfBirth?: Date;
      bloodGroup?: string;
      nationalId?: string;
      photo?: string;
      phone?: string;
      email?: string;
      house?: string;
      area?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
      isActive?: boolean;
      isDeleted?: boolean;
    } = {};

    if (teacher.firstName !== undefined) updateData.firstName = teacher.firstName;
    if (teacher.lastName !== undefined) updateData.lastName = teacher.lastName;
    if (teacher.joiningDate !== undefined) updateData.joiningDate = teacher.joiningDate;
    if (teacher.qualifications !== undefined) updateData.qualifications = teacher.qualifications;
    if (teacher.specializations !== undefined) updateData.specializations = teacher.specializations;
    if (teacher.experience !== undefined) updateData.experience = teacher.experience;
    if (teacher.salary !== undefined) updateData.salary = teacher.salary;
    if (teacher.gender !== undefined) updateData.gender = teacher.gender;
    if (teacher.dateOfBirth !== undefined) updateData.dateOfBirth = teacher.dateOfBirth;
    if (teacher.bloodGroup !== undefined) updateData.bloodGroup = teacher.bloodGroup;
    if (teacher.nationalId !== undefined) updateData.nationalId = teacher.nationalId;
    if (teacher.photo !== undefined) updateData.photo = teacher.photo;
    if (teacher.phone !== undefined) updateData.phone = teacher.phone;
    if (teacher.email !== undefined) updateData.email = teacher.email;
    if (teacher.house !== undefined) updateData.house = teacher.house;
    if (teacher.area !== undefined) updateData.area = teacher.area;
    if (teacher.city !== undefined) updateData.city = teacher.city;
    if (teacher.state !== undefined) updateData.state = teacher.state;
    if (teacher.postalCode !== undefined) updateData.postalCode = teacher.postalCode;
    if (teacher.country !== undefined) updateData.country = teacher.country;
    if (teacher.isActive !== undefined) updateData.isActive = teacher.isActive;
    if (teacher.isDeleted !== undefined) updateData.isDeleted = teacher.isDeleted;

    return updateData;
  }
}
