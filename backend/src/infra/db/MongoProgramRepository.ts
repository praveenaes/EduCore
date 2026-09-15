import { injectable } from "inversify";
import mongoose, { FilterQuery } from "mongoose";
import {
  IProgramRepository,
  ProgramFilters,
  ProgramPagination,
  ProgramListResult,
} from "../../domain/repositories/IProgramRepository";
import { Program } from "../../domain/entities/Program";
import { ProgramModel, IProgramDocument } from "./models/ProgramModel";
import { ProgramMapper } from "../../application/mappers/ProgramMapper";
import { PaginationHelper } from "@/shared/utils/pagination";
import { BaseMongoRepository } from "./BaseMongoRepository";

@injectable()
export class MongoProgramRepository
  extends BaseMongoRepository<Program, IProgramDocument>
  implements IProgramRepository
{
  protected readonly _model = ProgramModel;
  protected readonly _mapper = ProgramMapper;

  async findByCode(code: string): Promise<Program | null> {
    const doc = await ProgramModel.findOne({
      code: { $regex: new RegExp(`^${code}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return ProgramMapper.toDomain(doc);
  }

  async findByName(name: string): Promise<Program | null> {
    const doc = await ProgramModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      isDeleted: false,
    });
    if (!doc) return null;
    return ProgramMapper.toDomain(doc);
  }

  async findAll(filters: ProgramFilters, pagination: ProgramPagination): Promise<ProgramListResult> {
    const query: FilterQuery<IProgramDocument> = { isDeleted: false };

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
      ProgramModel.find(query).sort(sortOptions).skip(skip).limit(limit),
      ProgramModel.countDocuments(query),
    ]);

    return {
      programs: docs.map((doc) => ProgramMapper.toDomain(doc)),
      total,
    };
  }

  async hasActiveCourses(programId: string): Promise<boolean> {
    try {
      // Safely checks courses collection; returns false if collection or documents don't exist yet
      const coursesCollection = mongoose.connection.collection("courses");
      const count = await coursesCollection.countDocuments({
        programId: new mongoose.Types.ObjectId(programId),
        isDeleted: false,
      });
      return count > 0;
    } catch {
      return false;
    }
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await ProgramModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}