import { injectable, inject } from 'inversify';
import { TYPES } from '@/config/di/types';
import { IBatchRepository } from '@/domain/repositories/IBatchRepository';
import { IDeleteBatchUseCase } from '@/application/ports/use-cases/batches/IDeleteBatchUseCase';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class DeleteBatch implements IDeleteBatchUseCase {
  constructor(
    @inject(TYPES.BatchRepository) private _batchRepo: IBatchRepository
  ) {}

  async execute(id: string): Promise<void> {
    const batch = await this._batchRepo.findById(id);
    if (!batch || batch.isDeleted) {
      throw new NotFoundError('Batch not found');
    }
    await this._batchRepo.softDelete(id);
  }
}
