import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IBatchRepository,
  BatchFilters,
  TeacherBatchFilters,
  BatchPagination,
  BatchListResult,
} from '../../domain/repositories/IBatchRepository';
import { Batch } from '../../domain/entities/Batch';
import { BatchModel, IBatchDocument } from './models/BatchModel';
import { CourseModel } from './models/CourseModel';
import { CenterModel } from './models/CenterModel';
import { AcademicYearModel } from './models/AcademicYearModel';
import { TeacherModel } from './models/TeacherModel';
import { BatchMapper } from './mappers/BatchMapper';
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

  async findTeacherBatches(
    filters: TeacherBatchFilters,
    pagination: BatchPagination
  ): Promise<BatchListResult> {
    const query: FilterQuery<IBatchDocument> = {
      teacherId: new Types.ObjectId(filters.teacherId),
      isDeleted: false,
    };

    if (filters.search) {
      const escaped = filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');

      const [matchingCourses, matchingCenters] = await Promise.all([
        CourseModel.find({
          $or: [{ name: searchRegex }, { code: searchRegex }],
          isDeleted: false,
        }).select('_id'),
        CenterModel.find({
          name: searchRegex,
          isDeleted: false,
        }).select('_id'),
      ]);

      query.$or = [
        { name: searchRegex },
        { courseId: { $in: matchingCourses.map((c) => c._id) } },
        { centerId: { $in: matchingCenters.map((c) => c._id) } },
      ];
    }

//     {
//   _id: "batch1",

//   name: "Batch A",

//   teacherId: "teacher1",

//   courseId: {
//     _id: "course1",
//     name: "MERN Development",
//     code: "MERN01"
//   },

//   centerId: {
//     _id: "center1",
//     name: "Thrissur Center"
//   },

//   academicYearId: {
//     _id: "year1",
//     name: "2025-2026",
//     code: "AY25"
//   },

//   // other Batch fields...
// }

    const { page, limit, sortBy, sortOrder } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    const isPopulatedSort =
      sortBy &&
      ['course', 'courseName', 'center', 'centerName'].includes(sortBy);

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
            from: CenterModel.collection.name,
            localField: 'centerId',
            foreignField: '_id',
            as: 'centerId',
          },
        },
        { $unwind: { path: '$centerId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: AcademicYearModel.collection.name,
            localField: 'academicYearId',
            foreignField: '_id',
            as: 'academicYearId',
          },
        },
        { $unwind: { path: '$academicYearId', preserveNullAndEmptyArrays: true } },
      ];

      const sortStage: Record<string, 1 | -1> = {};
      if (sortBy === 'course' || sortBy === 'courseName') {
        sortStage['courseId.name'] = order;
      } else if (sortBy === 'center' || sortBy === 'centerName') {
        sortStage['centerId.name'] = order;
      }
      sortStage._id = 1;

      pipeline.push({ $sort: sortStage });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const [docs, total] = await Promise.all([
        BatchModel.aggregate(pipeline),
        BatchModel.countDocuments(query),
      ]);

      return {
        batches: docs.map((doc) => BatchMapper.toDomain(doc)),
        total,
      };
    }

    let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
    if (sortBy) sortOptions = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [docs, total] = await Promise.all([
      BatchModel.find(query)
        .populate({ path: 'courseId', match: { isDeleted: false }, select: 'name code' })
        .populate({ path: 'centerId', match: { isDeleted: false }, select: 'name' })
        .populate({ path: 'academicYearId', match: { isDeleted: false }, select: 'name code' })
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

    const isPopulatedSort =
      sortBy &&
      ['course', 'courseName', 'center', 'centerName', 'teacher', 'teacherName'].includes(sortBy);

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
            from: CenterModel.collection.name,
            localField: 'centerId',
            foreignField: '_id',
            as: 'centerId',
          },
        },
        { $unwind: { path: '$centerId', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: AcademicYearModel.collection.name,
            localField: 'academicYearId',
            foreignField: '_id',
            as: 'academicYearId',
          },
        },
        { $unwind: { path: '$academicYearId', preserveNullAndEmptyArrays: true } },
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
      } else if (sortBy === 'center' || sortBy === 'centerName') {
        sortStage['centerId.name'] = order;
      } else if (sortBy === 'teacher' || sortBy === 'teacherName') {
        sortStage['teacherId.firstName'] = order;
        sortStage['teacherId.lastName'] = order;
      }
      sortStage._id = 1;

      pipeline.push({ $sort: sortStage });
      pipeline.push({ $skip: skip });
      pipeline.push({ $limit: limit });

      const [docs, total] = await Promise.all([
        BatchModel.aggregate(pipeline),
        BatchModel.countDocuments(query),
      ]);

      return {
        batches: docs.map((doc) => BatchMapper.toDomain(doc)),
        total,
      };
    }

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
