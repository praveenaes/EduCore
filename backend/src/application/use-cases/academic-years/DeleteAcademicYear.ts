import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { IAcademicYearRepository } from '../../../domain/repositories/IAcademicYearRepository';
import { IDeleteAcademicYearUseCase } from '../../ports/use-cases/academic-years/IDeleteAcademicYearUseCase';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class DeleteAcademicYear implements IDeleteAcademicYearUseCase {
  constructor(
    @inject(TYPES.AcademicYearRepository)
    private _academicYearRepository: IAcademicYearRepository
  ) {}

  async execute(id: string): Promise<void> {
    const academicYear = await this._academicYearRepository.findById(id);
    if (!academicYear) {
      throw new NotFoundError(`Academic Year with id "${id}" not found`);
    }

    await this._academicYearRepository.softDelete(id);
  }
}
