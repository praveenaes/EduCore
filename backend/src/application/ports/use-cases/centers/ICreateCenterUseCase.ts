import { CreateCenterDTO, CenterResponseDTO } from '../../../dto/centers/centerDtos';

export interface ICreateCenterUseCase {
  execute(dto: CreateCenterDTO): Promise<CenterResponseDTO>;
}
