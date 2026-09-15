import { injectable } from "inversify";
import { FilterQuery } from "mongoose";
import {
  ISubjectRepository,
  SubjectFilters,
  SubjectPagination,
  SubjectListResult,
} from "../../domain/repositories/ISubjectRepository";
import { Subject } from "../../domain/entities/Subject";
import { SubjectModel, ISubjectDocument } from "./models/SubjectModel";
import { SubjectMapper } from "../../application/mappers/SubjectMapper";
import { PaginationHelper } from "@/shared/utils/pagination";
import { BaseMongoRepository } from "./BaseMongoRepository";

@injectable()
export class MongoSubjectRepository
  extends BaseMongoRepository<Subject, ISubjectDocument>
  implements ISubjectRepository
{
  protected readonly _model = SubjectModel;
  protected readonly _mapper = SubjectMapper;

  async findByCode(code: string): Promise<Subject | null> {
    const doc = await SubjectModel.findOne({
      code: { $regex: new RegExp(`^${code}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return SubjectMapper.toDomain(doc);
  }

  async findByName(name: string): Promise<Subject | null> {
    const doc = await SubjectModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return SubjectMapper.toDomain(doc);
  }

  async findAll(filters: SubjectFilters, pagination: SubjectPagination): Promise<SubjectListResult> {
    const query: FilterQuery<ISubjectDocument> = { isDeleted: false };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, "i");
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
      ];
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === "desc" ? -1 : 1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      SubjectModel.find(query).sort(sortOptions).skip(skip).limit(limit),
      SubjectModel.countDocuments(query),
    ]);

    return {
      subjects: docs.map((doc) => SubjectMapper.toDomain(doc)),
      total,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await SubjectModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
