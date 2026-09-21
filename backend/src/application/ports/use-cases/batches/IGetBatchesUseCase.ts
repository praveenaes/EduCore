import { BatchListResultDTO } from '@/application/dto/batches/batchDtos';
import { BatchFilters, BatchPagination } from '@/domain/repositories/IBatchRepository';

export interface IGetBatchesUseCase {
  execute(filters: BatchFilters, pagination: BatchPagination): Promise<BatchListResultDTO>;
}
