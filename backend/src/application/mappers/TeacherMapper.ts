import { Teacher } from "../../domain/entities/Teacher";
import { ITeacherDocument } from "../../infra/db/models/TeacherModel";

export class TeacherMapper {
  static toDomain(doc: ITeacherDocument): Teacher {
    return new Teacher(
      doc._id.toString(),
      doc.firstName,
      doc.lastName,
      doc.employeeId,
      doc.joiningDate,
      doc.qualifications,
      doc.specializations,
      doc.experience,
      doc.salary,
      doc.gender,
      doc.dateOfBirth,
      doc.bloodGroup,
      doc.nationalId,
      doc.photo,
      doc.phone,
      doc.email,
      doc.house,
      doc.area,
      doc.city,
      doc.state,
      doc.postalCode,
      doc.country,
      doc.isDeleted,
      doc.isActive,
      doc.userId.toString(),
      doc.createdAt,
      doc.updatedAt
    );
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

    return updateData;
  }
}
