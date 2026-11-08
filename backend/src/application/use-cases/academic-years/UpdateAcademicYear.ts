import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { IAcademicYearRepository } from '../../../domain/repositories/IAcademicYearRepository';
import { IUpdateAcademicYearUseCase } from '../../ports/use-cases/academic-years/IUpdateAcademicYearUseCase';
import { UpdateAcademicYearDTO, AcademicYearResponseDTO } from '../../dto/academic-years/academicYearDtos';
import { NotFoundError, ConflictError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class UpdateAcademicYear implements IUpdateAcademicYearUseCase {
  constructor(
    @inject(TYPES.AcademicYearRepository)
    private _academicYearRepository: IAcademicYearRepository
  ) {}

  async execute(id: string, dto: UpdateAcademicYearDTO): Promise<AcademicYearResponseDTO> {
    const academicYear = await this._academicYearRepository.findById(id);
    if (!academicYear) {
      throw new NotFoundError(`Academic Year with id "${id}" not found`);
    }

    const { name, code, startDate, endDate, current, centers } = dto;
    const trimmedCode = code.trim().toUpperCase();
    const trimmedName = name.trim();

    if (trimmedCode !== academicYear.code) {
      const existing = await this._academicYearRepository.findByCode(trimmedCode);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Academic Year with code "${trimmedCode}" already exists`);
      }
    }

    if (trimmedName.toLowerCase() !== academicYear.name.toLowerCase()) {
      const existing = await this._academicYearRepository.findByName(trimmedName);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Academic Year with name "${trimmedName}" already exists`);
      }
    }

    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    if (parsedEndDate <= parsedStartDate) {
      throw new ValidationError('End date must be after start date');
    }

    if (current === true && !academicYear.current) {
      await this._academicYearRepository.unsetCurrent();
    }

    academicYear.updateDetails({
      name: trimmedName,
      code: trimmedCode,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      centers: centers ?? [],
      current: current ?? false,
    });

    const updated = await this._academicYearRepository.update(id, academicYear);
    if (!updated) {
      throw new NotFoundError(`Academic Year with id "${id}" could not be updated`);
    }

    return {
      id: updated.id!,
      name: updated.name,
      code: updated.code,
      startDate: updated.startDate.toISOString(),
      endDate: updated.endDate.toISOString(),
      current: updated.current,
      centers: updated.centers,
      isDeleted: updated.isDeleted,
      createdAt: updated.createdAt?.toISOString(),
      updatedAt: updated.updatedAt?.toISOString(),
    };
  }
}
