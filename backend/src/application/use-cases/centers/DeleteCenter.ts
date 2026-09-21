import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ICenterRepository } from '../../../domain/repositories/ICenterRepository';
import { IBatchRepository } from '../../../domain/repositories/IBatchRepository';
import { IAcademicYearRepository } from '../../../domain/repositories/IAcademicYearRepository';
import { IDeleteCenterUseCase } from '../../ports/use-cases/centers/IDeleteCenterUseCase';
import { NotFoundError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class DeleteCenter implements IDeleteCenterUseCase {
  constructor(
    @inject(TYPES.CenterRepository)
    private _centerRepository: ICenterRepository,
    @inject(TYPES.BatchRepository)
    private _batchRepository: IBatchRepository,
    @inject(TYPES.AcademicYearRepository)
    private _academicYearRepository: IAcademicYearRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    const center = await this._centerRepository.findById(id);
    if (!center) {
      throw new NotFoundError(`Center with id "${id}" not found`);
    }

    const [batches, academicYears] = await Promise.all([
      this._batchRepository.findByCenterId(id),
      this._academicYearRepository.findByCenterId(id),
    ]);

    if (batches.length > 0 || academicYears.length > 0) {
      const parts: string[] = [];
      if (batches.length > 0) {
        parts.push(`${batches.length} ${batches.length === 1 ? 'batch' : 'batches'}`);
      }
      if (academicYears.length > 0) {
        parts.push(`${academicYears.length} academic ${academicYears.length === 1 ? 'year' : 'years'}`);
      }

      throw new ValidationError(
        `Cannot delete center, it is actively assigned to ${parts.join(' and ')}`
      );
    }

    return await this._centerRepository.softDelete(id);
  }
}
