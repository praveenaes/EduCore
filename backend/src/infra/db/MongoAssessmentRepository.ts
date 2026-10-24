import { injectable } from 'inversify';
import { FilterQuery } from 'mongoose';
import {
  IAssessmentRepository,
  AssessmentFilters,
  AssessmentPagination,
  AssessmentListResult,
} from '../../domain/repositories/IAssessmentRepository';
import { Assessment } from '../../domain/entities/Assessment';
import { AssessmentModel, IAssessmentDocument } from './models/AssessmentModel';
import { AssessmentMapper } from './mappers/AssessmentMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseMongoRepository } from './BaseMongoRepository';

@injectable()
export class MongoAssessmentRepository
  extends BaseMongoRepository<Assessment, IAssessmentDocument>
  implements IAssessmentRepository
{
  protected readonly _model = AssessmentModel;
  protected readonly _mapper = AssessmentMapper;

  async findById(id: string): Promise<Assessment | null> {
    const doc = await AssessmentModel.findOne({ _id: id, isDeleted: false })
      .populate({ path: 'academicYearId', select: 'name code' });
    if (!doc) return null;
    return AssessmentMapper.toDomain(doc);
  }

  async findByName(name: string, academicYearId: string): Promise<Assessment | null> {
    const doc = await AssessmentModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      academicYearId,
      isDeleted: false,
    });
    if (!doc) return null;
    return AssessmentMapper.toDomain(doc);
  }

  async findByAcademicYearId(academicYearId: string): Promise<Assessment[]> {
    const docs = await AssessmentModel.find({
      academicYearId,
      isDeleted: false,
    })
      .populate({ path: 'academicYearId', select: 'name code' })
      .sort({ startDate: 1 });

    return docs.map((doc) => AssessmentMapper.toDomain(doc));
  }

  async findAll(
    filters: AssessmentFilters,
    pagination: AssessmentPagination
  ): Promise<AssessmentListResult> {
    const query: FilterQuery<IAssessmentDocument> = { isDeleted: false };

    if (filters.search) {
      query.name = new RegExp(filters.search, 'i');
    }

    if (filters.academicYearId) {
      query.academicYearId = filters.academicYearId;
    }

    if (filters.status) {
      query.status = filters.status;
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { startDate: -1 };
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      AssessmentModel.find(query)
        .populate({ path: 'academicYearId', select: 'name code' })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      AssessmentModel.countDocuments(query),
    ]);

    return {
      assessments: docs.map((doc) => AssessmentMapper.toDomain(doc)),
      total,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await AssessmentModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
