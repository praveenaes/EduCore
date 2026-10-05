import { injectable } from 'inversify';
import {
  IHomeworkRepository,
  HomeworkPagination,
  TeacherHomeworkFilters,
  StudentHomeworkFilters,
  HomeworkListResult,
} from '../../domain/repositories/IHomeworkRepository';
import { Homework, HomeworkSubmissionProps } from '../../domain/entities/Homework';
import { HomeworkModel, IHomeworkDocument } from './models/HomeworkModel';
import './models/SubjectModel';
import { HomeworkMapper } from './mappers/HomeworkMapper';
import { BaseMongoRepository } from './BaseMongoRepository';
import { PaginationHelper } from '../../shared/utils/pagination';

@injectable()
export class MongoHomeworkRepository
  extends BaseMongoRepository<Homework, IHomeworkDocument>
  implements IHomeworkRepository
{
  protected readonly _model = HomeworkModel;
  protected readonly _mapper = HomeworkMapper;

  async findById(id: string): Promise<Homework | null> {
    const doc = await HomeworkModel.findOne({ _id: id, isDeleted: false })
      .populate('batchId', 'name')
      .populate('subjectId', 'name code')
      .populate('assignedBy', 'firstName lastName')
      .populate('submissions.studentId', 'firstName lastName admissionNumber');

    if (!doc) return null;
    return HomeworkMapper.toDomain(doc);
  }

  async findTeacherHomeworks(
    filters: TeacherHomeworkFilters,
    pagination: HomeworkPagination
  ): Promise<HomeworkListResult> {
    const query: Record<string, any> = {
      assignedBy: filters.teacherId,
      isDeleted: false,
    };

    if (filters.batchId) {
      query.batchId = filters.batchId;
    }

    if (filters.search) {
      query.title = { $regex: new RegExp(filters.search, 'i') };
    }

    const { page, limit } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    const [docs, total] = await Promise.all([
      HomeworkModel.find(query)
        .populate('batchId', 'name')
        .populate('subjectId', 'name code')
        .populate('assignedBy', 'firstName lastName')
        .sort({ dueDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      HomeworkModel.countDocuments(query),
    ]);

    return {
      homeworks: docs.map((doc) => HomeworkMapper.toDomain(doc)),
      total,
    };
  }

  async findStudentHomeworks(
    filters: StudentHomeworkFilters,
    pagination: HomeworkPagination
  ): Promise<HomeworkListResult> {
    const query: Record<string, any> = {
      'submissions.studentId': filters.studentId,
      isDeleted: false,
    };

    if (filters.status) {
      query.submissions = {
        $elemMatch: {
          studentId: filters.studentId,
          status: filters.status,
        },
      };
    }

    const { page, limit } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    const [docs, total] = await Promise.all([
      HomeworkModel.find(query)
        .populate('batchId', 'name')
        .populate('subjectId', 'name code')
        .populate('assignedBy', 'firstName lastName')
        .populate('submissions.studentId', 'firstName lastName admissionNumber')
        .sort({ dueDate: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      HomeworkModel.countDocuments(query),
    ]);

    return {
      homeworks: docs.map((doc) => HomeworkMapper.toDomain(doc)),
      total,
    };
  }

  async updateSubmission(
    homeworkId: string,
    studentId: string,
    submissionUpdate: Partial<HomeworkSubmissionProps>
  ): Promise<Homework | null> {
    const setFields: Record<string, any> = {};
    if (submissionUpdate.status !== undefined) setFields['submissions.$.status'] = submissionUpdate.status;
    if (submissionUpdate.submittedAt !== undefined) setFields['submissions.$.submittedAt'] = submissionUpdate.submittedAt;
    if (submissionUpdate.verifiedAt !== undefined) setFields['submissions.$.verifiedAt'] = submissionUpdate.verifiedAt;
    if (submissionUpdate.remarks !== undefined) setFields['submissions.$.remarks'] = submissionUpdate.remarks;
    if (submissionUpdate.attachments !== undefined) setFields['submissions.$.attachments'] = submissionUpdate.attachments;

    const doc = await HomeworkModel.findOneAndUpdate(
      { _id: homeworkId, 'submissions.studentId': studentId, isDeleted: false },
      { $set: setFields },
      { new: true }
    )
      .populate('batchId', 'name')
      .populate('subjectId', 'name code')
      .populate('assignedBy', 'firstName lastName')
      .populate('submissions.studentId', 'firstName lastName admissionNumber');

    if (!doc) return null;
    return HomeworkMapper.toDomain(doc);
  }

  async softDelete(id: string): Promise<boolean> {
    const result = await HomeworkModel.updateOne(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } }
    );
    return result.modifiedCount > 0;
  }
}
