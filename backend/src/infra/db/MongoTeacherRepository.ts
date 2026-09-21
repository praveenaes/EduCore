import { injectable } from "inversify";
import { FilterQuery } from "mongoose";
import { ITeacherRepository, TeacherFilters, TeacherPagination, TeacherListResult } from "../../domain/repositories/ITeacherRepository";
import { Teacher } from "../../domain/entities/Teacher";
import { TeacherModel, ITeacherDocument } from "./models/TeacherModel";
import { TeacherMapper } from "../../application/mappers/TeacherMapper";
import { PaginationHelper } from "@/shared/utils/pagination";
import { BaseMongoRepository } from "./BaseMongoRepository";

@injectable()
export class MongoTeacherRepository 
  extends BaseMongoRepository<Teacher, ITeacherDocument> 
  implements ITeacherRepository 
{
  protected readonly _model = TeacherModel;
  protected readonly _mapper = TeacherMapper;

  async findByUserId(userId: string): Promise<Teacher | null> {
    const doc = await TeacherModel.findOne({
      userId,
      isDeleted: false,
    });
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

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === "desc" ? -1 : 1;
      if (sortBy === "firstName") {
        sortOptions = { firstName: order, lastName: order };
      } else {
        sortOptions = { [sortBy]: order };
      }
    }

    const [docs, total] = await Promise.all([
      TeacherModel.find(query).sort(sortOptions).skip(skip).limit(limit),
      TeacherModel.countDocuments(query),
    ]);

    return {
      teachers: docs.map(doc => TeacherMapper.toDomain(doc)),
      total,
    };
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
