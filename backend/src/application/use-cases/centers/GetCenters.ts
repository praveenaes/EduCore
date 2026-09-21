import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import {
  ICenterRepository,
  CenterFilters,
  CenterPagination,
} from '../../../domain/repositories/ICenterRepository';
import {
  IGetCentersUseCase,
  GetCentersResult,
} from '../../ports/use-cases/centers/IGetCentersUseCase';

@injectable()
export class GetCenters implements IGetCentersUseCase {
  constructor(
    @inject(TYPES.CenterRepository)
    private _centerRepository: ICenterRepository
  ) {}

  async execute(
    filters: CenterFilters,
    pagination: CenterPagination
  ): Promise<GetCentersResult> {
    const { centers, total } = await this._centerRepository.findAll(
      filters,
      pagination
    );

    return {
      centers: centers.map((c) => ({
        id: c.id!,
        name: c.name,
        code: c.code,
        phone: c.phone,
        email: c.email,
        timezone: c.timezone,
        address: c.address,
        status: c.status,
        createdAt: c.createdAt?.toISOString(),
        updatedAt: c.updatedAt?.toISOString(),
      })),
      total,
    };
  }
}
