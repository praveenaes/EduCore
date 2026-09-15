import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICenterRepository } from '../../../domain/repositories/ICenterRepository';
import {
  IGetCentersUseCase,
  GetCentersResult,
} from '../../ports/use-cases/centers/IGetCentersUseCase';
import { CenterListQueryDTO } from '../../dto/centers/centerDtos';

@injectable()
export class GetCenters implements IGetCentersUseCase {
  constructor(
    @inject(TYPES.CenterRepository)
    private readonly _centerRepository: ICenterRepository
  ) {}

  async execute(query: CenterListQueryDTO): Promise<GetCentersResult> {
    const { page = 1, limit = 10, search, status, sortBy, sortOrder } = query;

    const { centers, total } = await this._centerRepository.findAll(
      { search, status },
      { page, limit, sortBy, sortOrder }
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
