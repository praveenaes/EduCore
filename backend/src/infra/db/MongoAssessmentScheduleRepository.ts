import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IAssessmentScheduleRepository,
  AssessmentScheduleFilters,
  AssessmentSchedulePagination,
  AssessmentScheduleListResult,
} from '../../domain/repositories/IAssessmentScheduleRepository';
import { AssessmentSchedule } from '../../domain/entities/AssessmentSchedule';
import {
  AssessmentScheduleModel,
  IAssessmentScheduleDocument,
} from './models/AssessmentScheduleModel';
import { BatchModel } from './models/BatchModel';
import { AssessmentCriteriaModel } from './models/AssessmentCriteriaModel';
import { CenterModel } from './models/CenterModel';
import { AssessmentScheduleMapper } from './mappers/AssessmentScheduleMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseMongoRepository } from './BaseMongoRepository';

@injectable()
export class MongoAssessmentScheduleRepository
  extends BaseMongoRepository<AssessmentSchedule, IAssessmentScheduleDocument>
  implements IAssessmentScheduleRepository
{
  protected readonly _model = AssessmentScheduleModel;
  protected readonly _mapper = AssessmentScheduleMapper;

  private populateOptions = [
    { path: 'assessmentId', select: 'name startDate endDate' },
    { path: 'courseId', select: 'name code levelName' },
    {
      path: 'criteriaId',
      select: 'name maxMarks passMarks assessmentType subjectId',
      populate: { path: 'subjectId', select: 'name code' },
    },
    { path: 'batchId', select: 'name' },
    { path: 'centerId', select: 'name code' },
  ];

  async findById(id: string): Promise<AssessmentSchedule | null> {
    const doc = await AssessmentScheduleModel.findOne({ _id: id, isDeleted: false })
      .populate(this.populateOptions);

    if (!doc) return null;
    return AssessmentScheduleMapper.toDomain(doc);
  }

  async findByEventBatchCriteria(
    assessmentId: string,
    batchId: string,
    criteriaId: string
  ): Promise<AssessmentSchedule | null> {
    const doc = await AssessmentScheduleModel.findOne({
      assessmentId: new Types.ObjectId(assessmentId),
      batchId: new Types.ObjectId(batchId),
      criteriaId: new Types.ObjectId(criteriaId),
      isDeleted: false,
    });

    if (!doc) return null;
    return AssessmentScheduleMapper.toDomain(doc);
  }

  async findByAssessmentId(assessmentId: string): Promise<AssessmentSchedule[]> {
    const docs = await AssessmentScheduleModel.find({
      assessmentId: new Types.ObjectId(assessmentId),
      isDeleted: false,
    })
      .populate(this.populateOptions)
      .sort({ examDate: 1, startTime: 1 });

    return docs.map((doc) => AssessmentScheduleMapper.toDomain(doc));
  }

  async findByBatchId(batchId: string): Promise<AssessmentSchedule[]> {
    const docs = await AssessmentScheduleModel.find({
      batchId: new Types.ObjectId(batchId),
      isDeleted: false,
    })
      .populate(this.populateOptions)
      .sort({ examDate: 1, startTime: 1 });

    return docs.map((doc) => AssessmentScheduleMapper.toDomain(doc));
  }

  async findByCriteriaId(criteriaId: string): Promise<AssessmentSchedule[]> {
    const docs = await AssessmentScheduleModel.find({
      criteriaId: new Types.ObjectId(criteriaId),
      isDeleted: false,
    })
      .populate(this.populateOptions)
      .sort({ examDate: 1, startTime: 1 });

    return docs.map((doc) => AssessmentScheduleMapper.toDomain(doc));
  }

  async findByBatchAndDate(batchId: string, examDate: Date): Promise<AssessmentSchedule[]> {
    const startOfDay = new Date(examDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(examDate);
    endOfDay.setHours(23, 59, 59, 999);

    const docs = await AssessmentScheduleModel.find({
      batchId: new Types.ObjectId(batchId),
      examDate: { $gte: startOfDay, $lte: endOfDay },
      isDeleted: false,
    })
      .populate(this.populateOptions)
      .sort({ startTime: 1 });

    return docs.map((doc) => AssessmentScheduleMapper.toDomain(doc));
  }

  async findAll(
    filters: AssessmentScheduleFilters,
    pagination: AssessmentSchedulePagination
  ): Promise<AssessmentScheduleListResult> {
    const query: FilterQuery<IAssessmentScheduleDocument> = { isDeleted: false };

    if (filters.search) {
      const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');

      const [matchingBatches, matchingCriteria, matchingCenters] = await Promise.all([
        BatchModel.find({ name: searchRegex, isDeleted: false }).select('_id'),
        AssessmentCriteriaModel.find({ name: searchRegex, isDeleted: false }).select('_id'),
        CenterModel.find({ name: searchRegex, isDeleted: false }).select('_id'),
      ]);

      query.$or = [
        { batchId: { $in: matchingBatches.map((b) => b._id) } },
        { criteriaId: { $in: matchingCriteria.map((c) => c._id) } },
        { centerId: { $in: matchingCenters.map((cn) => cn._id) } },
      ];
    }

    if (filters.assessmentId) {
      query.assessmentId = new Types.ObjectId(filters.assessmentId);
    }

    if (filters.courseId) {
      query.courseId = new Types.ObjectId(filters.courseId);
    }

    if (filters.levelNumber !== undefined) {
      query.levelNumber = Number(filters.levelNumber);
    }

    if (filters.criteriaId) {
      query.criteriaId = new Types.ObjectId(filters.criteriaId);
    }

    if (filters.batchId) {
      query.batchId = new Types.ObjectId(filters.batchId);
    }

    if (filters.centerId) {
      query.centerId = new Types.ObjectId(filters.centerId);
    }

    if (filters.isCompleted !== undefined) {
      query.isCompleted = filters.isCompleted;
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { examDate: 1, startTime: 1 };
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      AssessmentScheduleModel.find(query)
        .populate(this.populateOptions)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      AssessmentScheduleModel.countDocuments(query),
    ]);

    return {
      schedules: docs.map((doc) => AssessmentScheduleMapper.toDomain(doc)),
      total,
    };
  }

  async toggleCompleted(id: string): Promise<AssessmentSchedule | null> {
    const doc = await AssessmentScheduleModel.findOne({ _id: id, isDeleted: false });
    if (!doc) return null;

    doc.isCompleted = !doc.isCompleted;
    await doc.save();

    const populated = await AssessmentScheduleModel.findById(id).populate(this.populateOptions);
    return populated ? AssessmentScheduleMapper.toDomain(populated) : null;
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await AssessmentScheduleModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
