import { CenterResponseDTO } from '../../../dto/centers/centerDtos';
import { CenterFilters, CenterPagination } from '../../../../domain/repositories/ICenterRepository';

export interface GetCentersResult {
  centers: CenterResponseDTO[];
  total: number;
}

export interface IGetCentersUseCase {
  execute(filters: CenterFilters, pagination: CenterPagination): Promise<GetCentersResult>;
}
