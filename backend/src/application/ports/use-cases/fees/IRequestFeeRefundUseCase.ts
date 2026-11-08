import {
  RequestFeeRefundDTO,
  RequestFeeRefundResponseDTO,
} from '@/application/dto/fees/feeDtos';

export interface IRequestFeeRefundUseCase {
  execute(dto: RequestFeeRefundDTO): Promise<RequestFeeRefundResponseDTO>;
}
