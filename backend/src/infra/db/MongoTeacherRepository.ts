import { injectable } from "inversify";
import { FilterQuery } from "mongoose";
import { ITeacherRepository, TeacherFilters, TeacherPagination, TeacherListResult } from "../../application/ports/repositories/ITeacherRepository";
import { Teacher } from "../../domain/entities/Teacher";
import { TeacherModel, ITeacherDocument } from "./models/TeacherModel";

@injectable()
export class MongoTeacherRepository implements ITeacherRepository {
  private mapToDomain(doc: ITeacherDocument): Teacher {
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

  async create(teacher: Teacher): Promise<Teacher> {
    const doc = new TeacherModel({
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
    });
    await doc.save();
    return this.mapToDomain(doc);
  }

  async findById(id: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findByEmployeeId(employeeId: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({
      employeeId: { $regex: new RegExp(`^${employeeId}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findByEmail(email: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findByNationalId(nationalId: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({
      nationalId: { $regex: new RegExp(`^${nationalId}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findByName(firstName: string, lastName: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({
      firstName: { $regex: new RegExp(`^${firstName}$`, "i") },
      lastName: { $regex: new RegExp(`^${lastName}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findAll(filters: TeacherFilters, pagination: TeacherPagination): Promise<TeacherListResult> {
    const query: FilterQuery<ITeacherDocument> = { isDeleted: false };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
      ];
    }

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      TeacherModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      TeacherModel.countDocuments(query),
    ]);

    return {
      teachers: docs.map(doc => this.mapToDomain(doc)),
      total,
    };
  }

  async update(id: string, teacher: Partial<Teacher>): Promise<Teacher | null> {
    const updateData: any = {};
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

    const doc = await TeacherModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    );
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Teacher | null> {
    const doc = await TeacherModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isActive } },
      { new: true }
    );
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await TeacherModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }

  async exportAll(filters: TeacherFilters): Promise<Teacher[]> {
    const query: FilterQuery<ITeacherDocument> = { isDeleted: false };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { employeeId: searchRegex },
        { email: searchRegex },
      ];
    }

    const docs = await TeacherModel.find(query).sort({ createdAt: -1 });
    return docs.map(doc => this.mapToDomain(doc));
  }
}
