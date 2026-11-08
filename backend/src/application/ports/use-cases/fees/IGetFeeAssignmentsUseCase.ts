import { FeeAssignmentListResultDTO } from "@/application/dto/fees/feeDtos";
import {
  FeeAssignmentFilters,
  FeeAssignmentPagination,
} from "@/domain/repositories/IFeeAssignmentRepository";

export interface IGetFeeAssignmentsUseCase {
  execute(
    filters: FeeAssignmentFilters,
    pagination: FeeAssignmentPagination
  ): Promise<FeeAssignmentListResultDTO>;
}
