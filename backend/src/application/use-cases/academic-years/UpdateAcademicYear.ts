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

    if (dto.code && dto.code.trim().toUpperCase() !== academicYear.code) {
      const existing = await this._academicYearRepository.findByCode(dto.code);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Academic Year with code "${dto.code}" already exists`);
      }
    }

    if (dto.name && dto.name.trim().toLowerCase() !== academicYear.name.toLowerCase()) {
      const existing = await this._academicYearRepository.findByName(dto.name);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Academic Year with name "${dto.name}" already exists`);
      }
    }

    const newStartDate = dto.startDate ? new Date(dto.startDate) : academicYear.startDate;
    const newEndDate = dto.endDate ? new Date(dto.endDate) : academicYear.endDate;

    if (newEndDate <= newStartDate) {
      throw new ValidationError('End date must be after start date');
    }

    if (dto.current === true && !academicYear.current) {
      await this._academicYearRepository.unsetCurrent();
    }

    academicYear.updateDetails({
      name: dto.name,
      code: dto.code,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      centers: dto.centers,
      current: dto.current,
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
