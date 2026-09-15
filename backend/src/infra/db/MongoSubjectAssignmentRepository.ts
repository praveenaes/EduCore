import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  ISubjectAssignmentRepository,
  SubjectAssignmentFilters,
  SubjectAssignmentPagination,
  SubjectAssignmentListResult,
} from '../../domain/repositories/ISubjectAssignmentRepository';
import { SubjectAssignment } from '../../domain/entities/SubjectAssignment';
import { SubjectAssignmentModel, ISubjectAssignmentDocument } from './models/SubjectAssignmentModel';
import { SubjectAssignmentMapper } from '../../application/mappers/SubjectAssignmentMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseMongoRepository } from './BaseMongoRepository';

@injectable()
export class MongoSubjectAssignmentRepository
  extends BaseMongoRepository<SubjectAssignment, ISubjectAssignmentDocument>
  implements ISubjectAssignmentRepository
{
  protected readonly _model = SubjectAssignmentModel;
  protected readonly _mapper = SubjectAssignmentMapper;

  async findById(id: string): Promise<SubjectAssignment | null> {
    const doc = await SubjectAssignmentModel.findOne({ _id: id, isDeleted: false })
      .populate('courseId', 'name code')
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName employeeId');
    if (!doc) return null;
    return SubjectAssignmentMapper.toDomain(doc);
  }

  async findByCourseLevelAndSubject(
    courseId: string,
    levelNumber: number,
    subjectId: string
  ): Promise<SubjectAssignment | null> {
    const doc = await SubjectAssignmentModel.findOne({
      courseId: new Types.ObjectId(courseId),
      levelNumber,
      subjectId: new Types.ObjectId(subjectId),
      isDeleted: false,
    });
    if (!doc) return null;
    return SubjectAssignmentMapper.toDomain(doc);
  }

  async findByCourseId(courseId: string): Promise<SubjectAssignment[]> {
    const docs = await SubjectAssignmentModel.find({
      courseId: new Types.ObjectId(courseId),
      isDeleted: false,
    })
      .populate('subjectId', 'name code')
      .populate('teacherId', 'firstName lastName employeeId')
      .sort({ levelNumber: 1 });
    return docs.map((doc) => SubjectAssignmentMapper.toDomain(doc));
  }

  async findByTeacherId(teacherId: string): Promise<SubjectAssignment[]> {
    const docs = await SubjectAssignmentModel.find({
      teacherId: new Types.ObjectId(teacherId),
      isDeleted: false,
    })
      .populate('courseId', 'name code')
      .populate('subjectId', 'name code');
    return docs.map((doc) => SubjectAssignmentMapper.toDomain(doc));
  }

  async findBySubjectId(subjectId: string): Promise<SubjectAssignment[]> {
    const docs = await SubjectAssignmentModel.find({
      subjectId: new Types.ObjectId(subjectId),
      isDeleted: false,
    }).populate('courseId', 'name code');
    return docs.map((doc) => SubjectAssignmentMapper.toDomain(doc));
  }

  async findAll(
    filters: SubjectAssignmentFilters,
    pagination: SubjectAssignmentPagination
  ): Promise<SubjectAssignmentListResult> {
    const query: FilterQuery<ISubjectAssignmentDocument> = { isDeleted: false };

    if (filters.courseId) {
      query.courseId = new Types.ObjectId(filters.courseId);
    }

    if (filters.levelNumber !== undefined) {
      query.levelNumber = Number(filters.levelNumber);
    }

    if (filters.subjectId) {
      query.subjectId = new Types.ObjectId(filters.subjectId);
    }

    if (filters.teacherId) {
      query.teacherId = new Types.ObjectId(filters.teacherId);
    }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      SubjectAssignmentModel.find(query)
        .populate('courseId', 'name code')
        .populate('subjectId', 'name code')
        .populate('teacherId', 'firstName lastName employeeId')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      SubjectAssignmentModel.countDocuments(query),
    ]);

    return {
      assignments: docs.map((doc) => SubjectAssignmentMapper.toDomain(doc)),
      total,
    };
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await SubjectAssignmentModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
