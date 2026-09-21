import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IBatchRepository,
  BatchFilters,
  BatchPagination,
  BatchListResult,
} from '../../domain/repositories/IBatchRepository';
import { Batch } from '../../domain/entities/Batch';
import { BatchModel, IBatchDocument } from './models/BatchModel';
import { BatchMapper } from '../../application/mappers/BatchMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseMongoRepository } from './BaseMongoRepository';

@injectable()
export class MongoBatchRepository
  extends BaseMongoRepository<Batch, IBatchDocument>
  implements IBatchRepository
{
  protected readonly _model = BatchModel;
  protected readonly _mapper = BatchMapper;

  async findById(id: string): Promise<Batch | null> {
    const doc = await BatchModel.findOne({ _id: id, isDeleted: false })
      .populate({ path: 'courseId', match: { isDeleted: false }, select: 'name code' })
      .populate({ path: 'centerId', match: { isDeleted: false }, select: 'name' })
      .populate({ path: 'academicYearId', match: { isDeleted: false }, select: 'name code' })
      .populate({ path: 'teacherId', match: { isDeleted: false }, select: 'firstName lastName employeeId' });
    if (!doc) return null;
    return BatchMapper.toDomain(doc);
  }

  async findByName(
    name: string,
    courseId: string,
    levelNumber: number,
    centerId: string,
    academicYearId: string
  ): Promise<Batch | null> {
    const doc = await BatchModel.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      courseId,
      levelNumber,
      centerId,
      academicYearId,
      isDeleted: false,
    });
    if (!doc) return null;
    return BatchMapper.toDomain(doc);
  }

  async findByCourseId(courseId: string): Promise<Batch[]> {
    const docs = await BatchModel.find({
      courseId,
      isDeleted: false,
    });
    return docs.map((doc) => BatchMapper.toDomain(doc));
  }

  async findByCenterId(centerId: string): Promise<Batch[]> {
    const docs = await BatchModel.find({
      centerId,
      isDeleted: false,
    });
    return docs.map((doc) => BatchMapper.toDomain(doc));
  }

  async findByTeacherId(teacherId: string): Promise<Batch[]> {
    const docs = await BatchModel.find({
      teacherId,
      isDeleted: false,
    })
      .populate({ path: 'courseId', match: { isDeleted: false }, select: 'name code' })
      .populate({ path: 'centerId', match: { isDeleted: false }, select: 'name' })
      .populate({ path: 'academicYearId', match: { isDeleted: false }, select: 'name code' });
    return docs.map((doc) => BatchMapper.toDomain(doc));
  }

  async findAll(filters: BatchFilters, pagination: BatchPagination): Promise<BatchListResult> {
    const query: FilterQuery<IBatchDocument> = { isDeleted: false };

    if (filters.courseId) query.courseId = new Types.ObjectId(filters.courseId);
    if (filters.levelNumber !== undefined) query.levelNumber = filters.levelNumber;
    if (filters.centerId) query.centerId = new Types.ObjectId(filters.centerId);
    if (filters.academicYearId) query.academicYearId = new Types.ObjectId(filters.academicYearId);
    if (filters.isActive !== undefined) query.isActive = filters.isActive;
    if (filters.search) {
      query.$or = [{ name: new RegExp(filters.search, 'i') }];
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);
    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [docs, total] = await Promise.all([
      BatchModel.find(query)
        .populate({ path: 'courseId', match: { isDeleted: false }, select: 'name code' })
        .populate({ path: 'centerId', match: { isDeleted: false }, select: 'name' })
        .populate({ path: 'academicYearId', match: { isDeleted: false }, select: 'name code' })
        .populate({ path: 'teacherId', match: { isDeleted: false }, select: 'firstName lastName employeeId' })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      BatchModel.countDocuments(query),
    ]);

    return {
      batches: docs.map((doc) => BatchMapper.toDomain(doc)),
      total,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await BatchModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
