import { CenterListQueryDTO, CenterResponseDTO } from '../../../dto/centers/centerDtos';

export interface GetCentersResult {
  centers: CenterResponseDTO[];
  total: number;
}

export interface IGetCentersUseCase {
  execute(query: CenterListQueryDTO): Promise<GetCentersResult>;
}
