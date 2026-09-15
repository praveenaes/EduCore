import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICenterRepository } from '../../../domain/repositories/ICenterRepository';
import { IDeleteCenterUseCase } from '../../ports/use-cases/centers/IDeleteCenterUseCase';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class DeleteCenter implements IDeleteCenterUseCase {
  constructor(
    @inject(TYPES.CenterRepository)
    private readonly _centerRepository: ICenterRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    const center = await this._centerRepository.findById(id);
    if (!center) {
      throw new NotFoundError(`Center with id "${id}" not found`);
    }

    return await this._centerRepository.softDelete(id);
  }
}
