import { UpdateBatchDTO, BatchResponseDTO } from '@/application/dto/batches/batchDtos';

export interface IUpdateBatchUseCase {
  execute(id: string, dto: UpdateBatchDTO): Promise<BatchResponseDTO>;
}
