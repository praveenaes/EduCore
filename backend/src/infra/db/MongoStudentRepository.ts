import { injectable } from "inversify";
import { FilterQuery } from "mongoose";
import { IStudentRepository, StudentFilters, StudentPagination, StudentListResult } from "../../application/ports/repositories/IStudentRepository";
import { Student } from "../../domain/entities/Student";
import { StudentModel, IStudentDocument } from "./models/StudentModel";

@injectable()
export class MongoStudentRepository implements IStudentRepository {
  private mapToDomain(doc: IStudentDocument): Student {
    return new Student(
      doc._id.toString(),
      doc.firstName,
      doc.lastName,
      doc.admissionNumber,
      doc.admissionDate,
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

  async create(student: Student): Promise<Student> {
    const doc = new StudentModel({
      firstName: student.firstName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      admissionDate: student.admissionDate,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      bloodGroup: student.bloodGroup,
      nationalId: student.nationalId,
      photo: student.photo,
      phone: student.phone,
      email: student.email,
      house: student.house,
      area: student.area,
      city: student.city,
      state: student.state,
      postalCode: student.postalCode,
      country: student.country,
      isDeleted: student.isDeleted,
      isActive: student.isActive,
      userId: student.userId,
    });
    await doc.save();
    return this.mapToDomain(doc);
  }

  async findByAdmissionNumber(admissionNumber: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({
      admissionNumber: { $regex: new RegExp(`^${admissionNumber}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findByEmail(email: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findByNationalId(nationalId: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({
      nationalId: { $regex: new RegExp(`^${nationalId}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findByName(firstName: string, lastName: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({
      firstName: { $regex: new RegExp(`^${firstName}$`, "i") },
      lastName: { $regex: new RegExp(`^${lastName}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async findAll(filters: StudentFilters, pagination: StudentPagination): Promise<StudentListResult> {
    const query: FilterQuery<IStudentDocument> = { isDeleted: false };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { admissionNumber: searchRegex },
        { email: searchRegex },
      ];
    }

    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      StudentModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      StudentModel.countDocuments(query),
    ]);

    return {
      students: docs.map(doc => this.mapToDomain(doc)),
      total,
    };
  }

  async updateStatus(id: string, isActive: boolean): Promise<Student | null> {
    const doc = await StudentModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isActive } },
      { new: true }
    );
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async exportAll(filters: StudentFilters): Promise<Student[]> {
    const query: FilterQuery<IStudentDocument> = { isDeleted: false };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { admissionNumber: searchRegex },
        { email: searchRegex },
      ];
    }

    const docs = await StudentModel.find(query).sort({ createdAt: -1 });
    return docs.map(doc => this.mapToDomain(doc));
  }

  async findById(id: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async update(id: string, student: Partial<Student>): Promise<Student | null> {
    const updateData: any = {};
    if (student.firstName !== undefined) updateData.firstName = student.firstName;
    if (student.lastName !== undefined) updateData.lastName = student.lastName;
    if (student.admissionDate !== undefined) updateData.admissionDate = student.admissionDate;
    if (student.gender !== undefined) updateData.gender = student.gender;
    if (student.dateOfBirth !== undefined) updateData.dateOfBirth = student.dateOfBirth;
    if (student.bloodGroup !== undefined) updateData.bloodGroup = student.bloodGroup;
    if (student.nationalId !== undefined) updateData.nationalId = student.nationalId;
    if (student.photo !== undefined) updateData.photo = student.photo;
    if (student.phone !== undefined) updateData.phone = student.phone;
    if (student.email !== undefined) updateData.email = student.email;
    if (student.house !== undefined) updateData.house = student.house;
    if (student.area !== undefined) updateData.area = student.area;
    if (student.city !== undefined) updateData.city = student.city;
    if (student.state !== undefined) updateData.state = student.state;
    if (student.postalCode !== undefined) updateData.postalCode = student.postalCode;
    if (student.country !== undefined) updateData.country = student.country;

    const doc = await StudentModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    );
    if (!doc) return null;
    return this.mapToDomain(doc);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await StudentModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
