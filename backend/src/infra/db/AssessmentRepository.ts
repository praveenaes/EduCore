import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IAssessmentRepository,
  AssessmentFilters,
  AssessmentPagination,
  AssessmentListResult,
} from '../../domain/repositories/IAssessmentRepository';
import { Assessment } from '../../domain/entities/Assessment';
import { AssessmentModel, IAssessmentDocument } from './models/AssessmentModel';
import { AssessmentScheduleModel } from './models/AssessmentScheduleModel';
import { AssessmentResultModel } from './models/AssessmentResultModel';
import { AssessmentMapper } from './mappers/AssessmentMapper';
import { PaginationHelper } from '@/shared/utils/pagination';
import { BaseRepository } from './BaseRepository';

@injectable()
export class AssessmentRepository
  extends BaseRepository<Assessment, IAssessmentDocument>
  implements IAssessmentRepository
{
  protected readonly _model = AssessmentModel;
  protected readonly _mapper = AssessmentMapper;

  async findById(id: string): Promise<Assessment | null> {
    const queryId = Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id;
    const doc = await AssessmentModel.findOne({ _id: queryId, isDeleted: false })
      .populate({ path: 'academicYearId', select: 'name code' })
      .populate({ path: 'courseId', select: 'name code levels' });
    if (!doc) return null;

    if (doc.status !== 'PUBLISHED' && doc.status !== 'CANCELLED') {
      const schedules = await AssessmentScheduleModel.find({
        assessmentId: doc._id,
        isDeleted: false,
      });
      if (schedules.length > 0) {
        const scheduleIds = schedules.map((s) => s._id);
        const gradedResults = await AssessmentResultModel.distinct('scheduleId', {
          scheduleId: { $in: scheduleIds },
          isDeleted: false,
        });
        const gradedSet = new Set(gradedResults.map((rId) => rId.toString()));
        const isEveryGraded = schedules.every((s) => s.isGraded || gradedSet.has(s._id.toString()));
        if (isEveryGraded) {
          doc.status = 'GRADED';
          await AssessmentModel.updateOne({ _id: doc._id }, { $set: { status: 'GRADED' } });
        }
      }
    }

    return AssessmentMapper.toDomain(doc);
  }

  async findByName(
    name: string,
    academicYearId: string,
    courseId: string,
    levelNumber: number
  ): Promise<Assessment | null> {
    const doc = await AssessmentModel.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      academicYearId,
      courseId,
      levelNumber,
      isDeleted: false,
    })
      .populate({ path: 'academicYearId', select: 'name code' })
      .populate({ path: 'courseId', select: 'name code levels' });
    if (!doc) return null;
    return AssessmentMapper.toDomain(doc);
  }

  async findByAcademicYearId(academicYearId: string): Promise<Assessment[]> {
    const docs = await AssessmentModel.find({
      academicYearId,
      isDeleted: false,
    })
      .populate({ path: 'academicYearId', select: 'name code' })
      .populate({ path: 'courseId', select: 'name code levels' })
      .sort({ startDate: 1 });

    return docs.map((doc) => AssessmentMapper.toDomain(doc));
  }

  async findByCourseAndLevel(
    courseId: string,
    levelNumber: number,
    academicYearId?: string
  ): Promise<Assessment[]> {
    const query: FilterQuery<IAssessmentDocument> = {
      courseId,
      levelNumber,
      isDeleted: false,
    };
    if (academicYearId) {
      query.academicYearId = academicYearId;
    }

    const docs = await AssessmentModel.find(query)
      .populate({ path: 'academicYearId', select: 'name code' })
      .populate({ path: 'courseId', select: 'name code levels' })
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

    if (filters.courseId) {
      query.courseId = filters.courseId;
    }

    if (filters.levelNumber !== undefined) {
      query.levelNumber = filters.levelNumber;
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
        .populate({ path: 'courseId', select: 'name code levels' })
        .sort(sortOptions)
        .skip(skip)
        .limit(limit),
      AssessmentModel.countDocuments(query),
    ]);

    const assessmentIds = docs
      .filter((d) => d.status !== 'PUBLISHED' && d.status !== 'CANCELLED')
      .map((d) => d._id);

    if (assessmentIds.length > 0) {
      const schedules = await AssessmentScheduleModel.find({
        assessmentId: { $in: assessmentIds },
        isDeleted: false,
      });

      if (schedules.length > 0) {
        const scheduleIds = schedules.map((s) => s._id);
        const gradedResults = await AssessmentResultModel.distinct('scheduleId', {
          scheduleId: { $in: scheduleIds },
          isDeleted: false,
        });
        const gradedSet = new Set(gradedResults.map((rId) => rId.toString()));

        const schedulesByAssessment = new Map<string, typeof schedules>();
        for (const s of schedules) {
          const aId = s.assessmentId.toString();
          if (!schedulesByAssessment.has(aId)) schedulesByAssessment.set(aId, []);
          schedulesByAssessment.get(aId)!.push(s);
        }

        const fullyGradedIds: Types.ObjectId[] = [];
        for (const doc of docs) {
          const aSchedules = schedulesByAssessment.get(doc._id.toString()) || [];
          if (aSchedules.length > 0 && doc.status !== 'PUBLISHED' && doc.status !== 'CANCELLED') {
            const isEveryGraded = aSchedules.every((s) => s.isGraded || gradedSet.has(s._id.toString()));
            if (isEveryGraded) {
              doc.status = 'GRADED';
              fullyGradedIds.push(doc._id);
            }
          }
        }

        if (fullyGradedIds.length > 0) {
          await AssessmentModel.updateMany(
            { _id: { $in: fullyGradedIds }, status: { $nin: ['PUBLISHED', 'CANCELLED'] } },
            { $set: { status: 'GRADED' } }
          );
        }
      }
    }

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
