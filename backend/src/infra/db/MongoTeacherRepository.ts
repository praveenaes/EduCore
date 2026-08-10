import { injectable } from "inversify";
import { FilterQuery } from "mongoose";
import { ITeacherRepository, TeacherFilters, TeacherPagination, TeacherListResult } from "../../application/ports/repositories/ITeacherRepository";
import { Teacher } from "../../domain/entities/Teacher";
import { TeacherModel, ITeacherDocument } from "./models/TeacherModel";
import { TeacherMapper } from "../../application/mappers/TeacherMapper";

@injectable()
export class MongoTeacherRepository implements ITeacherRepository {
  async create(teacher: Teacher): Promise<Teacher> {
    const doc = new TeacherModel(TeacherMapper.toPersistence(teacher));
    await doc.save();
    return TeacherMapper.toDomain(doc);
  }

  async findById(id: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return TeacherMapper.toDomain(doc);
  }

  async findByEmployeeId(employeeId: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({
      employeeId: { $regex: new RegExp(`^${employeeId}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return TeacherMapper.toDomain(doc);
  }

  async findByEmail(email: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return TeacherMapper.toDomain(doc);
  }

  async findByNationalId(nationalId: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({
      nationalId: { $regex: new RegExp(`^${nationalId}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return TeacherMapper.toDomain(doc);
  }

  async findByName(firstName: string, lastName: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({
      firstName: { $regex: new RegExp(`^${firstName}$`, "i") },
      lastName: { $regex: new RegExp(`^${lastName}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return TeacherMapper.toDomain(doc);
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
      teachers: docs.map(doc => TeacherMapper.toDomain(doc)),
      total,
    };
  }

  async update(id: string, teacher: Partial<Teacher>): Promise<Teacher | null> {
    const updateData = TeacherMapper.toPersistencePartial(teacher);

    const doc = await TeacherModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    );
    if (!doc) return null;
    return TeacherMapper.toDomain(doc);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Teacher | null> {
    const doc = await TeacherModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isActive } },
      { new: true }
    );
    if (!doc) return null;
    return TeacherMapper.toDomain(doc);
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
    return docs.map(doc => TeacherMapper.toDomain(doc));
  }
}
