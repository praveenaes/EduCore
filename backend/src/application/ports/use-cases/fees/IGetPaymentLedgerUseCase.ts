import {
  PaymentLedgerQueryDTO,
  PaymentLedgerResponseDTO,
} from '@/application/dto/fees/feeDtos';

export interface IGetPaymentLedgerUseCase {
  execute(query: PaymentLedgerQueryDTO): Promise<PaymentLedgerResponseDTO>;
}
