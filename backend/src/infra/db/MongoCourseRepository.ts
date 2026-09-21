import { injectable } from "inversify";
import mongoose, { FilterQuery } from "mongoose";
import {
  ICourseRepository,
  CourseFilters,
  CoursePagination,
  CourseListResult,
} from "../../domain/repositories/ICourseRepository";
import { Course } from "../../domain/entities/Course";
import { CourseModel, ICourseDocument } from "./models/CourseModel";
import { CourseMapper } from "../../application/mappers/CourseMapper";
import { PaginationHelper } from "@/shared/utils/pagination";
import { BaseMongoRepository } from "./BaseMongoRepository";

@injectable()
export class MongoCourseRepository
  extends BaseMongoRepository<Course, ICourseDocument>
  implements ICourseRepository
{
  protected readonly _model = CourseModel;
  protected readonly _mapper = CourseMapper;

  async findByCode(code: string): Promise<Course | null> {
    const doc = await CourseModel.findOne({
      code: { $regex: new RegExp('^' + code + '$', "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return CourseMapper.toDomain(doc);
  }

  async findByName(name: string): Promise<Course | null> {
    const doc = await CourseModel.findOne({
      name: { $regex: new RegExp('^' + name + '$', "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return CourseMapper.toDomain(doc);
  }

  async findByProgramId(programId: string): Promise<Course[]> {
    const docs = await CourseModel.find({
      programId: programId,
      isDeleted: false,
    });
    return docs.map((doc) => CourseMapper.toDomain(doc));
  }

  async findAll(filters: CourseFilters, pagination: CoursePagination): Promise<CourseListResult> {
    const query: FilterQuery<ICourseDocument> = { isDeleted: false };

    if (filters.programId) {
      query.programId = new mongoose.Types.ObjectId(filters.programId);
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
      ];
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions:Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === "desc" ? -1 : 1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      CourseModel.find(query)
        .populate({ path: 'programId', match: { isDeleted: false }, select: 'name code' })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      CourseModel.countDocuments(query),
    ]);

    return {
      courses: docs.map((doc) => CourseMapper.toDomain(doc)),
      total,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await CourseModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
