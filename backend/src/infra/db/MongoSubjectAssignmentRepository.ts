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
import { CourseModel } from './models/CourseModel';
import { SubjectModel } from './models/SubjectModel';
import { TeacherModel } from './models/TeacherModel';
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
      .populate({ path: 'courseId', match: { isDeleted: false }, select: 'name code' })
      .populate({ path: 'subjectId', match: { isDeleted: false }, select: 'name code' })
      .populate({ path: 'teacherId', match: { isDeleted: false }, select: 'firstName lastName employeeId' });
    if (!doc) return null;
    return SubjectAssignmentMapper.toDomain(doc);
  }

  async findByCourseLevelAndSubject(
    courseId: string,
    levelNumber: number,
    subjectId: string
  ): Promise<SubjectAssignment | null> {
    const doc = await SubjectAssignmentModel.findOne({
      courseId,
      levelNumber: Number(levelNumber),
      subjectId,
      isDeleted: false,
    });
    if (!doc) return null;
    return SubjectAssignmentMapper.toDomain(doc);
  }

  //
  async findByCourseId(courseId: string): Promise<SubjectAssignment[]> {
    const docs = await SubjectAssignmentModel.find({
      courseId,
      isDeleted: false,
    });
    return docs.map((doc) => SubjectAssignmentMapper.toDomain(doc));
  }

  async findByTeacherId(teacherId: string): Promise<SubjectAssignment[]> {
    const docs = await SubjectAssignmentModel.find({
      teacherId,
      isDeleted: false,
    })
      .populate({ path: 'courseId', match: { isDeleted: false }, select: 'name code' })
      .populate({ path: 'subjectId', match: { isDeleted: false }, select: 'name code' });
    return docs.map((doc) => SubjectAssignmentMapper.toDomain(doc));
  }

  //
  async findBySubjectId(subjectId: string): Promise<SubjectAssignment[]> {
    const docs = await SubjectAssignmentModel.find({
      subjectId,
      isDeleted: false,
    });
    return docs.map((doc) => SubjectAssignmentMapper.toDomain(doc));
  }

  async findAll(
    filters: SubjectAssignmentFilters,
    pagination: SubjectAssignmentPagination
  ): Promise<SubjectAssignmentListResult> {
    const query: FilterQuery<ISubjectAssignmentDocument> = { isDeleted: false };

    if (filters.search) {
      const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');

      const [matchingCourses, matchingSubjects, matchingTeachers] = await Promise.all([
        CourseModel.find({
          $or: [{ name: searchRegex }, { code: searchRegex }],
          isDeleted: false,
        }).select('_id'),
        SubjectModel.find({
          $or: [{ name: searchRegex }, { code: searchRegex }],
          isDeleted: false,
        }).select('_id'),
        TeacherModel.find({
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { employeeId: searchRegex },
          ],
          isDeleted: false,
        }).select('_id'),
      ]);

      query.$or = [
        { courseId: { $in: matchingCourses.map((c) => c._id) } },
        { subjectId: { $in: matchingSubjects.map((s) => s._id) } },
        { teacherId: { $in: matchingTeachers.map((t) => t._id) } },
        { levelName: searchRegex },
      ];
    } 

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

    const isPopulatedSort =
      sortBy &&
      ['course', 'courseName', 'subject', 'subjectName', 'teacher', 'teacherName'].includes(sortBy);

    if (isPopulatedSort) {
      const order = sortOrder === 'asc' ? 1 : -1;
      const pipeline: any[] = [
        { $match: query },
        {
          $lookup: {
            from: CourseModel.collection.name,
            localField: 'courseId',
            foreignField: '_id',
            as: 'courseId',
          },
        },
        { $unwind: { path: '$courseId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: SubjectModel.collection.name,
            localField: 'subjectId',
            foreignField: '_id',
            as: 'subjectId',
          },
        },
        { $unwind: { path: '$subjectId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: TeacherModel.collection.name,
            localField: 'teacherId',
            foreignField: '_id',
            as: 'teacherId',
          },
        },
        { $unwind: { path: '$teacherId', preserveNullAndEmptyArrays: true } },
      ];

      const sortStage: Record<string, 1 | -1> = {};
      if (sortBy === 'course' || sortBy === 'courseName') {
        sortStage['courseId.name'] = order;
      } else if (sortBy === 'subject' || sortBy === 'subjectName') {
        sortStage['subjectId.name'] = order;
      } else if (sortBy === 'teacher' || sortBy === 'teacherName') {
        sortStage['teacherId.firstName'] = order;
        sortStage['teacherId.lastName'] = order;
      }
      sortStage._id = 1;

      pipeline.push({ $sort: sortStage });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const [docs, total] = await Promise.all([
        SubjectAssignmentModel.aggregate(pipeline),
        SubjectAssignmentModel.countDocuments(query),
      ]);

      return {
        assignments: docs.map((doc) => SubjectAssignmentMapper.toDomain(doc)),
        total,
      };
    }

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) {
      const order = sortOrder === 'asc' ? 1 : -1;
      sortOptions = { [sortBy]: order };
    }

    const [docs, total] = await Promise.all([
      SubjectAssignmentModel.find(query)
        .populate({ path: 'courseId', match: { isDeleted: false }, select: 'name code' })
        .populate({ path: 'subjectId', match: { isDeleted: false }, select: 'name code' })
        .populate({ path: 'teacherId', match: { isDeleted: false }, select: 'firstName lastName employeeId' })
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
