import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IAssessmentResultRepository,
  AssessmentResultFilters,
  AssessmentResultPagination,
  AssessmentResultListResult,
} from '../../domain/repositories/IAssessmentResultRepository';
import { AssessmentResult } from '../../domain/entities/AssessmentResult';
import { AssessmentResultModel, IAssessmentResultDocument } from './models/AssessmentResultModel';
import { AssessmentResultMapper } from './mappers/AssessmentResultMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseMongoRepository } from './BaseMongoRepository';

@injectable()
export class MongoAssessmentResultRepository
  extends BaseMongoRepository<AssessmentResult, IAssessmentResultDocument>
  implements IAssessmentResultRepository
{
  protected readonly _model = AssessmentResultModel;
  protected readonly _mapper = AssessmentResultMapper;

  private readonly populateOptions = [
    { path: 'assessmentId', select: 'name startDate endDate' },
    { path: 'batchId', select: 'name' },
    { path: 'studentId', select: 'firstName lastName admissionNumber email' },
    { path: 'scheduleId', select: 'examDate startTime endTime isCompleted' },
    {
      path: 'criteriaId',
      populate: [
        { path: 'courseId', select: 'name code' },
        { path: 'subjectId', select: 'name code' },
      ],
    },
  ];

  override async findById(id: string): Promise<AssessmentResult | null> {
    const doc = await AssessmentResultModel.findOne({ _id: id, isDeleted: false })
      .populate(this.populateOptions);
    if (!doc) return null;
    return AssessmentResultMapper.toDomain(doc);
  }

  async findByScheduleAndStudent(
    scheduleId: string,
    studentId: string
  ): Promise<AssessmentResult | null> {
    const doc = await AssessmentResultModel.findOne({
      scheduleId: new Types.ObjectId(scheduleId),
      studentId: new Types.ObjectId(studentId),
      isDeleted: false,
    }).populate(this.populateOptions);

    if (!doc) return null;
    return AssessmentResultMapper.toDomain(doc);
  }

  async findByScheduleId(scheduleId: string): Promise<AssessmentResult[]> {
    const docs = await AssessmentResultModel.find({
      scheduleId: new Types.ObjectId(scheduleId),
      isDeleted: false,
    })
      .populate(this.populateOptions)
      .sort({ 'studentId.admissionNumber': 1 });

    return docs.map((doc) => AssessmentResultMapper.toDomain(doc));
  }

  async findByBatchAndCriteria(
    assessmentId: string,
    batchId: string,
    criteriaId: string
  ): Promise<AssessmentResult[]> {
    const docs = await AssessmentResultModel.find({
      assessmentId: new Types.ObjectId(assessmentId),
      batchId: new Types.ObjectId(batchId),
      criteriaId: new Types.ObjectId(criteriaId),
      isDeleted: false,
    }).populate(this.populateOptions);

    return docs.map((doc) => AssessmentResultMapper.toDomain(doc));
  }

  async findByStudentAndAssessment(
    studentId: string,
    assessmentId: string
  ): Promise<AssessmentResult[]> {
    const docs = await AssessmentResultModel.find({
      studentId: new Types.ObjectId(studentId),
      assessmentId: new Types.ObjectId(assessmentId),
      isDeleted: false,
    }).populate(this.populateOptions);

    return docs.map((doc) => AssessmentResultMapper.toDomain(doc));
  }

  async findByStudentId(studentId: string): Promise<AssessmentResult[]> {
    const docs = await AssessmentResultModel.find({
      studentId: new Types.ObjectId(studentId),
      isDeleted: false,
    })
      .populate(this.populateOptions)
      .sort({ createdAt: -1 });

    return docs.map((doc) => AssessmentResultMapper.toDomain(doc));
  }

  async upsertMany(results: AssessmentResult[]): Promise<AssessmentResult[]> {
    const bulkOps = results.map((result) => {
      const persistenceData = AssessmentResultMapper.toPersistence(result);
      return {
        updateOne: {
          filter: {
            scheduleId: persistenceData.scheduleId,
            studentId: persistenceData.studentId,
          },
          update: {
            $set: {
              ...persistenceData,
              updatedAt: new Date(),
            },
            $setOnInsert: {
              createdAt: new Date(),
            },
          },
          upsert: true,
        },
      };
    });

    if (bulkOps.length > 0) {
      await AssessmentResultModel.bulkWrite(bulkOps);
    }

    // Return the updated populated records
    const scheduleId = results[0]?.scheduleId;
    if (!scheduleId) return [];
    return this.findByScheduleId(scheduleId);
  }

  async findAll(
    filters: AssessmentResultFilters,
    pagination: AssessmentResultPagination
  ): Promise<AssessmentResultListResult> {
    const query: FilterQuery<IAssessmentResultDocument> = { isDeleted: false };

    if (filters.assessmentId) {
      query.assessmentId = new Types.ObjectId(filters.assessmentId);
    }

    if (filters.scheduleId) {
      query.scheduleId = new Types.ObjectId(filters.scheduleId);
    }

    if (filters.criteriaId) {
      query.criteriaId = new Types.ObjectId(filters.criteriaId);
    }

    if (filters.batchId) {
      query.batchId = new Types.ObjectId(filters.batchId);
    }

    if (filters.studentId) {
      query.studentId = new Types.ObjectId(filters.studentId);
    }

    if (filters.isAbsent !== undefined) {
      query.isAbsent = filters.isAbsent;
    }

    if (filters.isPassed !== undefined) {
      query.isPassed = filters.isPassed;
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      AssessmentResultModel.find(query)
        .populate(this.populateOptions)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      AssessmentResultModel.countDocuments(query),
    ]);

    return {
      results: docs.map((doc) => AssessmentResultMapper.toDomain(doc)),
      total,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await AssessmentResultModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
