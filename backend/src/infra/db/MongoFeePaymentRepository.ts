import { injectable } from 'inversify';
import { FilterQuery, Types } from 'mongoose';
import {
  IFeePaymentRepository,
  PaymentLedgerFilters,
  PaymentLedgerPagination,
  PaymentLedgerResult,
} from '../../domain/repositories/IFeePaymentRepository';
import { FeePayment } from '../../domain/entities/FeePayment';
import { FeePaymentModel, IFeePaymentDocument } from './models/FeePaymentModel';
import './models/StudentModel';
import './models/FeeAssignmentModel';
import { FeePaymentMapper } from './mappers/FeePaymentMapper';
import { BaseMongoRepository } from './BaseMongoRepository';
import { PaginationHelper } from '@/shared/utils/pagination';

@injectable()
export class MongoFeePaymentRepository
  extends BaseMongoRepository<FeePayment, IFeePaymentDocument>
  implements IFeePaymentRepository
{
  protected readonly _model = FeePaymentModel;
  protected readonly _mapper = FeePaymentMapper;

  async findByTransactionId(transactionId: string): Promise<FeePayment | null> {
    const doc = await FeePaymentModel.findOne({
      transactionId,
      isDeleted: false,
    });
    if (!doc) return null;
    return FeePaymentMapper.toDomain(doc as any);
  }

  async findByGatewayOrderId(gatewayOrderId: string): Promise<FeePayment | null> {
    const doc = await FeePaymentModel.findOne({
      gatewayOrderId,
      isDeleted: false,
    });
    if (!doc) return null;
    return FeePaymentMapper.toDomain(doc as any);
  }

  async findByFeeAssignmentId(feeAssignmentId: string): Promise<FeePayment[]> {
    if (!Types.ObjectId.isValid(feeAssignmentId)) return [];
    const docs = await FeePaymentModel.find({
      feeAssignmentId: new Types.ObjectId(feeAssignmentId),
      isDeleted: false,
    }).sort({ createdAt: -1 });

    return docs.map((doc) => FeePaymentMapper.toDomain(doc as any));
  }

  async findAllWithStats(
    filters: PaymentLedgerFilters,
    pagination: PaymentLedgerPagination
  ): Promise<PaymentLedgerResult> {
    const andConditions: FilterQuery<IFeePaymentDocument>[] = [{ isDeleted: false }];

    if (filters.status && filters.status !== 'all') {
      andConditions.push({ status: filters.status });
    }

    if (filters.paymentMethod && filters.paymentMethod !== 'all') {
      if (filters.paymentMethod.toLowerCase() === 'netbanking') {
        andConditions.push({
          $or: [
            { paymentMethod: { $regex: /net.*bank/i } },
            { paymentMethod: { $regex: /^bank$/i } },
            { bank: { $exists: true, $ne: '' } },
          ],
        });
      } else {
        andConditions.push({
          paymentMethod: { $regex: new RegExp(`^${filters.paymentMethod}$`, 'i') },
        });
      }
    }

    if (filters.search) {
      const searchRegex = new RegExp(filters.search, 'i');
      andConditions.push({
        $or: [
          { transactionId: searchRegex },
          { gatewayTransactionId: searchRegex },
          { gatewayRrn: searchRegex },
          { bank: searchRegex },
          { vpa: searchRegex },
          { paymentMethod: searchRegex },
        ],
      });
    }

    if (filters.startDate || filters.endDate) {
      const dateFilter: any = {};
      if (filters.startDate) dateFilter.$gte = filters.startDate;
      if (filters.endDate) dateFilter.$lte = filters.endDate;
      andConditions.push({ paymentDate: dateFilter });
    }

    const query: FilterQuery<IFeePaymentDocument> =
      andConditions.length > 1 ? { $and: andConditions } : andConditions[0] || { isDeleted: false };

    const { page, limit } = pagination;
    const { skip } = PaginationHelper.getSkipAndLimit(page, limit);

    const [docs, total, statsAggregation] = await Promise.all([
      FeePaymentModel.find(query)
        .populate({
          path: 'studentId',
          select: 'firstName lastName admissionNumber',
        })
        .populate({
          path: 'feeAssignmentId',
          select: 'title',
        })
        .sort({ paymentDate: -1 })
        .skip(skip)
        .limit(limit),

      FeePaymentModel.countDocuments(query),

      FeePaymentModel.aggregate([
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            totalCollections: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0],
              },
            },
            totalAttempts: { $sum: 1 },
            successfulPayments: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
              },
            },
            failedPayments: {
              $sum: {
                $cond: [{ $eq: ['$status', 'failed'] }, 1, 0],
              },
            },
          },
        },
      ]),
    ]);

    const statsRaw = statsAggregation[0] || {
      totalCollections: 0,
      totalAttempts: 0,
      successfulPayments: 0,
      failedPayments: 0,
    };

    const successRate =
      statsRaw.totalAttempts > 0
        ? Math.round((statsRaw.successfulPayments / statsRaw.totalAttempts) * 100)
        : 0;

    return {
      transactions: docs.map((doc) => FeePaymentMapper.toDomain(doc as any)),
      total,
      stats: {
        totalCollections: statsRaw.totalCollections,
        totalAttempts: statsRaw.totalAttempts,
        successfulPayments: statsRaw.successfulPayments,
        failedPayments: statsRaw.failedPayments,
        successRate,
      },
    };
  }
}
