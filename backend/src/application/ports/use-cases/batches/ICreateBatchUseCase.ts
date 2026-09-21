import { CreateBatchDTO, BatchResponseDTO } from '@/application/dto/batches/batchDtos';

export interface ICreateBatchUseCase {
  execute(dto: CreateBatchDTO): Promise<BatchResponseDTO>;
}
