import {
  CreateFeeAssignmentsDTO,
  CreateFeeAssignmentsResponseDTO,
} from '@/application/dto/fees/feeDtos';

export interface ICreateFeeAssignmentsUseCase {
  execute(dto: CreateFeeAssignmentsDTO): Promise<CreateFeeAssignmentsResponseDTO>;
}
