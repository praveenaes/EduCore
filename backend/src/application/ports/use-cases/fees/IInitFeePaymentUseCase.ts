import {
  InitFeePaymentDTO,
  InitFeePaymentResponseDTO,
} from '@/application/dto/fees/feeDtos';

export interface IInitFeePaymentUseCase {
  execute(dto: InitFeePaymentDTO): Promise<InitFeePaymentResponseDTO>;
}
