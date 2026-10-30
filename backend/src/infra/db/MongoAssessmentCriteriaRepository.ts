import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IAssessmentCriteriaRepository,
  AssessmentCriteriaFilters,
  AssessmentCriteriaPagination,
  AssessmentCriteriaListResult,
} from '../../domain/repositories/IAssessmentCriteriaRepository';
import { AssessmentCriteria } from '../../domain/entities/AssessmentCriteria';
import {
  AssessmentCriteriaModel,
  IAssessmentCriteriaDocument,
} from './models/AssessmentCriteriaModel';
import { SubjectModel } from './models/SubjectModel';
import { AssessmentCriteriaMapper } from './mappers/AssessmentCriteriaMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseMongoRepository } from './BaseMongoRepository';

@injectable()
export class MongoAssessmentCriteriaRepository
  extends BaseMongoRepository<AssessmentCriteria, IAssessmentCriteriaDocument>
  implements IAssessmentCriteriaRepository
{
  protected readonly _model = AssessmentCriteriaModel;
  protected readonly _mapper = AssessmentCriteriaMapper;

  async findById(id: string): Promise<AssessmentCriteria | null> {
    const doc = await AssessmentCriteriaModel.findOne({ _id: id, isDeleted: false })
      .populate({ path: 'courseId', select: 'name code levelName' })
      .populate({ path: 'subjectId', select: 'name code' });

    if (!doc) return null;
    return AssessmentCriteriaMapper.toDomain(doc);
  }

  async findByName(name: string): Promise<AssessmentCriteria | null> {
    const doc = await AssessmentCriteriaModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      isDeleted: false,
    });
    if (!doc) return null;
    return AssessmentCriteriaMapper.toDomain(doc);
  }

  async findByNameAndScope(
    name: string,
    courseId: string,
    levelNumber: number,
    subjectId: string
  ): Promise<AssessmentCriteria | null> {
    const doc = await AssessmentCriteriaModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      courseId: new Types.ObjectId(courseId),
      levelNumber: Number(levelNumber),
      subjectId: new Types.ObjectId(subjectId),
      isDeleted: false,
    });

    if (!doc) return null;
    return AssessmentCriteriaMapper.toDomain(doc);
  }

  async findByCourseAndLevel(courseId: string, levelNumber: number): Promise<AssessmentCriteria[]> {
    const docs = await AssessmentCriteriaModel.find({
      courseId: new Types.ObjectId(courseId),
      levelNumber: Number(levelNumber),
      isDeleted: false,
    })
      .populate({ path: 'courseId', select: 'name code levelName' })
      .populate({ path: 'subjectId', select: 'name code' })
      .sort({ name: 1 });

    return docs.map((doc) => AssessmentCriteriaMapper.toDomain(doc));
  }

  async findBySubjectId(subjectId: string): Promise<AssessmentCriteria[]> {
    const docs = await AssessmentCriteriaModel.find({
      subjectId: new Types.ObjectId(subjectId),
      isDeleted: false,
    })
      .populate({ path: 'courseId', select: 'name code levelName' })
      .populate({ path: 'subjectId', select: 'name code' })
      .sort({ name: 1 });

    return docs.map((doc) => AssessmentCriteriaMapper.toDomain(doc));
  }

  async findAll(
    filters: AssessmentCriteriaFilters,
    pagination: AssessmentCriteriaPagination
  ): Promise<AssessmentCriteriaListResult> {
    const query: FilterQuery<IAssessmentCriteriaDocument> = { isDeleted: false };

    if (filters.search) {
      const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');

      const matchingSubjects = await SubjectModel.find({
        $or: [{ name: searchRegex }, { code: searchRegex }],
        isDeleted: false,
      }).select('_id');

      query.$or = [
        { name: searchRegex },
        { subjectId: { $in: matchingSubjects.map((s) => s._id) } },
      ];
    }

    if (filters.courseId) {
      query.courseId = new Types.ObjectId(filters.courseId);
    }
    
    if (filters.levelNumber !== undefined) {
      query.levelNumber = Number(filters.levelNumber);
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'desc' ? -1 : 1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      AssessmentCriteriaModel.find(query)
        .populate({ path: 'courseId', select: 'name code levelName' })
        .populate({ path: 'subjectId', select: 'name code' })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      AssessmentCriteriaModel.countDocuments(query),
    ]);

    return {
      criteria: docs.map((doc) => AssessmentCriteriaMapper.toDomain(doc)),
      total,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await AssessmentCriteriaModel.updateOne(
      { _id: id },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
