import {
  RejectFeeRefundDTO,
  RejectFeeRefundResponseDTO,
} from '@/application/dto/fees/feeDtos';

export interface IRejectFeeRefundUseCase {
  execute(dto: RejectFeeRefundDTO): Promise<RejectFeeRefundResponseDTO>;
}
