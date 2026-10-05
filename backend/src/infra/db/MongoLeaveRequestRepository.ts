import { injectable } from 'inversify';
import { ILeaveRequestRepository } from '../../domain/repositories/ILeaveRequestRepository';
import { LeaveRequest } from '../../domain/entities/LeaveRequest';
import { LeaveRequestModel, ILeaveRequestDocument } from './models/LeaveRequestModel';
import { LeaveRequestMapper } from './mappers/LeaveRequestMapper';
import { BaseMongoRepository } from './BaseMongoRepository';

@injectable()
export class MongoLeaveRequestRepository
  extends BaseMongoRepository<LeaveRequest, ILeaveRequestDocument>
  implements ILeaveRequestRepository
{
  protected readonly _model = LeaveRequestModel;
  protected readonly _mapper = LeaveRequestMapper;

  async findByStudentId(studentId: string): Promise<LeaveRequest[]> {
    const docs = await LeaveRequestModel.find({
      studentId,
      isDeleted: false,
    })
      .sort({ appliedAt: -1 })
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('batchId', 'name')
      .populate('reviewedBy', 'name');

    return docs.map((doc) => LeaveRequestMapper.toDomain(doc));
  }

  async findByBatchId(batchId: string, status?: string): Promise<LeaveRequest[]> {
    const query: Record<string, any> = {
      batchId,
      isDeleted: false,
    };
    if (status && status !== 'all') {
      query.status = status;
    }

    const docs = await LeaveRequestModel.find(query)
      .sort({ appliedAt: -1 })
      .populate('studentId', 'firstName lastName admissionNumber')
      .populate('batchId', 'name')
      .populate('reviewedBy', 'name');

    return docs.map((doc) => LeaveRequestMapper.toDomain(doc));
  }
}
