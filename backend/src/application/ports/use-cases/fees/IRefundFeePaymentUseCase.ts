import {
  RefundFeePaymentDTO,
  RefundFeePaymentResponseDTO,
} from '@/application/dto/fees/feeDtos';

export interface IRefundFeePaymentUseCase {
  execute(dto: RefundFeePaymentDTO): Promise<RefundFeePaymentResponseDTO>;
}
