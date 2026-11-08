import { injectable, inject } from "inversify";
import { TYPES } from "@/config/di/types";
import {
  IFeeAssignmentRepository,
  FeeAssignmentFilters,
  FeeAssignmentPagination,
} from "@/domain/repositories/IFeeAssignmentRepository";
import { IGetFeeAssignmentsUseCase } from "@/application/ports/use-cases/fees/IGetFeeAssignmentsUseCase";
import { FeeAssignmentListResultDTO } from "@/application/dto/fees/feeDtos";

@injectable()
export class GetFeeAssignments implements IGetFeeAssignmentsUseCase {
  constructor(
    @inject(TYPES.FeeAssignmentRepository)
    private _feeRepo: IFeeAssignmentRepository
  ) {}

  async execute(
    filters: FeeAssignmentFilters,
    pagination: FeeAssignmentPagination
  ): Promise<FeeAssignmentListResultDTO> {
    const result = await this._feeRepo.findAll(filters, pagination);

    return {
      feeAssignments: result.feeAssignments.map((assignment) => ({
        id: assignment.id!,
        title: assignment.title,
        studentId: assignment.studentId,
        userId: assignment.userId,
        amount: assignment.amount,
        dueDate: assignment.dueDate,
        status: assignment.status,
        refundStatus: assignment.refundStatus,
        refundReason: assignment.refundReason,
        remarks: assignment.remarks,
        isDeleted: assignment.isDeleted,
        createdAt: assignment.createdAt,
        updatedAt: assignment.updatedAt,
        studentName: assignment.studentName,
        admissionNumber: assignment.admissionNumber,
        batchName: assignment.batchName,
      })),
      total: result.total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(result.total / pagination.limit) || 1,
    };
  }
}
