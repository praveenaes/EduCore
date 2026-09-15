import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import {
  ICenterRepository,
  CenterFilters,
  CenterPagination,
  CenterListResult,
} from '../../domain/repositories/ICenterRepository';
import { Center } from '../../domain/entities/Center';
import { CenterModel, ICenterDocument } from './models/CenterModel';
import { CenterMapper } from '../../application/mappers/CenterMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseMongoRepository } from './BaseMongoRepository';

@injectable()
export class MongoCenterRepository
  extends BaseMongoRepository<Center, ICenterDocument>
  implements ICenterRepository
{
  protected readonly _model = CenterModel;
  protected readonly _mapper = CenterMapper;

  async findByCode(code: string): Promise<Center | null> {
    const doc = await CenterModel.findOne({
      code: { $regex: new RegExp(`^${code.trim()}$`, 'i') },
      isDeleted: false,
    });
    if (!doc) return null;
    return CenterMapper.toDomain(doc);
  }

  async findByName(name: string): Promise<Center | null> {
    const doc = await CenterModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      isDeleted: false,
    });
    if (!doc) return null;
    return CenterMapper.toDomain(doc);
  }

  async findByEmail(email: string): Promise<Center | null> {
    const doc = await CenterModel.findOne({
      email: { $regex: new RegExp(`^${email.trim()}$`, 'i') },
      isDeleted: false,
    });
    if (!doc) return null;
    return CenterMapper.toDomain(doc);
  }

  async findByPhone(phone: string): Promise<Center | null> {
    const doc = await CenterModel.findOne({
      phone: phone.trim(),
      isDeleted: false,
    });
    if (!doc) return null;
    return CenterMapper.toDomain(doc);
  }

  async findAll(
    filters: CenterFilters,
    pagination: CenterPagination
  ): Promise<CenterListResult> {
    const query: FilterQuery<ICenterDocument> = { isDeleted: false };

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      query.$or = [
        { name: searchRegex },
        { code: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { 'address.city': searchRegex },
        { 'address.state': searchRegex },
      ];
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      CenterModel.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
      CenterModel.countDocuments(query),
    ]);

    const centers = (docs as any[]).map((doc) => CenterMapper.toDomain(doc));

    return { centers, total };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await CenterModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}