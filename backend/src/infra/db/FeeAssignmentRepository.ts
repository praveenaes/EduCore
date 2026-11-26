import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IFeeAssignmentRepository,
  FeeAssignmentFilters,
  FeeAssignmentPagination,
  FeeAssignmentListResult,
} from '../../domain/repositories/IFeeAssignmentRepository';
import { FeeAssignment } from '../../domain/entities/FeeAssignment';
import { FeeAssignmentModel, IFeeAssignmentDocument } from './models/FeeAssignmentModel';
import './models/StudentModel';
import './models/BatchModel';
import { FeeAssignmentMapper } from './mappers/FeeAssignmentMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseRepository } from './BaseRepository';

@injectable()
export class FeeAssignmentRepository
  extends BaseRepository<FeeAssignment, IFeeAssignmentDocument>
  implements IFeeAssignmentRepository
{
  protected readonly _model = FeeAssignmentModel;
  protected readonly _mapper = FeeAssignmentMapper;

  async createBulk(entities: FeeAssignment[]): Promise<FeeAssignment[]> {
    if (entities.length === 0) return [];
    const persistenceDocs = entities.map((entity) => FeeAssignmentMapper.toPersistence(entity));
    const insertedDocs = await FeeAssignmentModel.insertMany(persistenceDocs);
    return insertedDocs.map((doc) => FeeAssignmentMapper.toDomain(doc as any));
  }

  async findAll(
    filters: FeeAssignmentFilters,
    pagination: FeeAssignmentPagination
  ): Promise<FeeAssignmentListResult> {
    const query: FilterQuery<IFeeAssignmentDocument> = { isDeleted: false };

    if (filters.studentId && Types.ObjectId.isValid(filters.studentId)) {
      query.studentId = new Types.ObjectId(filters.studentId);
    }

    if (filters.userId && Types.ObjectId.isValid(filters.userId)) {
      query.userId = new Types.ObjectId(filters.userId);
    }

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.search) {
      query.title = { $regex: new RegExp(filters.search, 'i') };
    }

    if (filters.dueDateFrom || filters.dueDateTo) {
      query.dueDate = {};
      if (filters.dueDateFrom) query.dueDate.$gte = filters.dueDateFrom;
      if (filters.dueDateTo) query.dueDate.$lte = filters.dueDateTo;
    }

    if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
      query.amount = {};
      if (filters.amountMin !== undefined) query.amount.$gte = filters.amountMin;
      if (filters.amountMax !== undefined) query.amount.$lte = filters.amountMax;
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      FeeAssignmentModel.find(query)
        .populate({
          path: 'studentId',
          select: 'firstName lastName admissionNumber batchId',
          populate: { path: 'batchId', select: 'name' },
        })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      FeeAssignmentModel.countDocuments(query),
    ]);

    return {
      feeAssignments: docs.map((doc) => FeeAssignmentMapper.toDomain(doc as any)),
      total,
    };
  }

  async findByStudentId(studentId: string): Promise<FeeAssignment[]> {
    if (!Types.ObjectId.isValid(studentId)) return [];
    const docs = await FeeAssignmentModel.find({
      studentId: new Types.ObjectId(studentId),
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return docs.map((doc) => FeeAssignmentMapper.toDomain(doc as any));
  }

  async softDelete(id: string): Promise<boolean> {
    const queryId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
    const result = await FeeAssignmentModel.updateOne(
      { _id: queryId },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
