import { UpdateCenterDTO, CenterResponseDTO } from '../../../dto/centers/centerDtos';

export interface IUpdateCenterUseCase {
  execute(id: string, dto: UpdateCenterDTO): Promise<CenterResponseDTO>;
}
