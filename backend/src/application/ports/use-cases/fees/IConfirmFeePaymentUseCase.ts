import {
  ConfirmFeePaymentDTO,
  ConfirmFeePaymentResponseDTO,
} from '@/application/dto/fees/feeDtos';

export interface IConfirmFeePaymentUseCase {
  execute(dto: ConfirmFeePaymentDTO): Promise<ConfirmFeePaymentResponseDTO>;
}
