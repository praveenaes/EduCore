import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IAcademicYearRepository,
  AcademicYearFilters,
  AcademicYearPagination,
  AcademicYearListResult,
} from '../../domain/repositories/IAcademicYearRepository';
import { AcademicYear } from '../../domain/entities/AcademicYear';
import { AcademicYearModel, IAcademicYearDocument } from './models/AcademicYearModel';
import { AcademicYearMapper } from '../../application/mappers/AcademicYearMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseMongoRepository } from './BaseMongoRepository';

@injectable()
export class MongoAcademicYearRepository
  extends BaseMongoRepository<AcademicYear, IAcademicYearDocument>
  implements IAcademicYearRepository
{
  protected readonly _model = AcademicYearModel;
  protected readonly _mapper = AcademicYearMapper;

  async findByCode(code: string): Promise<AcademicYear | null> {
    const doc = await AcademicYearModel.findOne({
      code: { $regex: new RegExp(`^${code}$`, 'i') },
      isDeleted: false,
    });
    if (!doc) return null;
    return AcademicYearMapper.toDomain(doc);
  }

  async findByName(name: string): Promise<AcademicYear | null> {
    const doc = await AcademicYearModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      isDeleted: false,
    });
    if (!doc) return null;
    return AcademicYearMapper.toDomain(doc);
  }

  async findByCenterId(centerId: string): Promise<AcademicYear[]> {
    const docs = await AcademicYearModel.find({
      centers: centerId,
      isDeleted: false,
    });
    return docs.map((doc) => AcademicYearMapper.toDomain(doc));
  }

  async unsetCurrent(): Promise<void> {
    await AcademicYearModel.updateMany(
      { isDeleted: false, current: true },
      { $set: { current: false } }
    );
  }

  async findAll(
    filters: AcademicYearFilters,
    pagination: AcademicYearPagination
  ): Promise<AcademicYearListResult> {
    const query: FilterQuery<IAcademicYearDocument> = { isDeleted: false };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [{ name: searchRegex }, { code: searchRegex }];
    }

    if (filters.centerId) {
      query.centers = new Types.ObjectId(filters.centerId);
    }

    if (filters.current !== undefined) {
      query.current = filters.current;
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { startDate: -1 };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      AcademicYearModel.find(query)
        .populate({ path: 'centers', match: { isDeleted: false }, select: 'name code' })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      AcademicYearModel.countDocuments(query),
    ]);

    return {
      academicYears: docs.map((doc) => AcademicYearMapper.toDomain(doc)),
      total,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await AcademicYearModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true, current: false } }
    );
    return result.modifiedCount > 0;
  }
}
