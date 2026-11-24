import { injectable } from "inversify";
import { FilterQuery } from "mongoose";
import { IStudentRepository, StudentFilters, StudentPagination, StudentListResult } from "../../domain/repositories/IStudentRepository";
import { Student } from "../../domain/entities/Student";
import { StudentModel, IStudentDocument } from "./models/StudentModel";
import { StudentMapper } from "../../application/mappers/StudentMapper";
import { PaginationHelper } from "@/shared/utils/pagination";

@injectable()
export class MongoStudentRepository implements IStudentRepository {
  async create(student: Student): Promise<Student> {
    const doc = new StudentModel(StudentMapper.toPersistence(student));
    await doc.save();
    return StudentMapper.toDomain(doc);
  }

  async findByAdmissionNumber(admissionNumber: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({
      admissionNumber: { $regex: new RegExp(`^${admissionNumber}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return StudentMapper.toDomain(doc);
  }

  async findByEmail(email: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return StudentMapper.toDomain(doc);
  }



  async findByNationalId(nationalId: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({
      nationalId: { $regex: new RegExp(`^${nationalId}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return StudentMapper.toDomain(doc);
  }

  async findByName(firstName: string, lastName: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({
      firstName: { $regex: new RegExp(`^${firstName}$`, "i") },
      lastName: { $regex: new RegExp(`^${lastName}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return StudentMapper.toDomain(doc);
  }

  async findAll(filters: StudentFilters, pagination: StudentPagination): Promise<StudentListResult> {
    const query: FilterQuery<IStudentDocument> = { isDeleted: false };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");// /john/i
      query.$or = [
        { firstName: searchRegex },
        { lastName: searchRegex },
        { admissionNumber: searchRegex },
        { email: searchRegex },
      ];
    }

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }


//     {
//   isDeleted: false,
//   $or: [
//     { firstName: /john/i },
//     { lastName: /john/i },
//     { admissionNumber: /john/i },
//     { email: /john/i }
//   ]
// }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: any = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === "desc" ? -1 : 1;
      if (sortBy === "firstName") {
        sortOptions = { firstName: order, lastName: order };
        //sort by firstName then lastName when first names are the same
      } else {
        sortOptions = { [sortBy]: order };
        //Use the value inside sortBy as the property name.
      }
    }

    const [docs, total] = await Promise.all([
      StudentModel.find(query).sort(sortOptions).skip(skip).limit(limit),
      StudentModel.countDocuments(query),
    ]);

    return {
      students: docs.map(doc => StudentMapper.toDomain(doc)),
      total,
    };
  }

  async updateStatus(id: string, isActive: boolean): Promise<Student | null> {
    const doc = await StudentModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isActive } },
      { new: true }
    )
    if (!doc) return null;
    return StudentMapper.toDomain(doc);
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
    return docs.map(doc => StudentMapper.toDomain(doc));
  }

  async findById(id: string): Promise<Student | null> {
    const doc = await StudentModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;
    return StudentMapper.toDomain(doc);
  }

  async update(id: string, student: Partial<Student>): Promise<Student | null> {
    const updateData = StudentMapper.toPersistencePartial(student);

    const doc = await StudentModel.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updateData },
      { new: true }
    );
    if (!doc) return null;
    return StudentMapper.toDomain(doc);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await StudentModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
