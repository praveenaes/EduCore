import { GetBatchLeavesDTO, BatchLeavesResponseDTO } from '@/application/dto/leave/leaveDtos';

export interface IGetBatchLeavesUseCase {
  execute(dto: GetBatchLeavesDTO): Promise<BatchLeavesResponseDTO>;
}
