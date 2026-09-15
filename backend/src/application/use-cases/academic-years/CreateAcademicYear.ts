import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { IAcademicYearRepository } from '../../../domain/repositories/IAcademicYearRepository';
import { ICreateAcademicYearUseCase } from '../../ports/use-cases/academic-years/ICreateAcademicYearUseCase';
import { CreateAcademicYearDTO, AcademicYearResponseDTO } from '../../dto/academic-years/academicYearDtos';
import { AcademicYear } from '../../../domain/entities/AcademicYear';
import { ConflictError, ValidationError } from '@/shared/errors/AppError';

@injectable()
export class CreateAcademicYear implements ICreateAcademicYearUseCase {
  constructor(
    @inject(TYPES.AcademicYearRepository)
    private readonly _academicYearRepository: IAcademicYearRepository
  ) {}

  async execute(dto: CreateAcademicYearDTO): Promise<AcademicYearResponseDTO> {
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new ValidationError('End date must be after start date');
    }

    const existingCode = await this._academicYearRepository.findByCode(dto.code);
    if (existingCode) {
      throw new ConflictError(`Academic Year with code "${dto.code}" already exists`);
    }

    const existingName = await this._academicYearRepository.findByName(dto.name);
    if (existingName) {
      throw new ConflictError(`Academic Year with name "${dto.name}" already exists`);
    }

    if (dto.current) {
      await this._academicYearRepository.unsetCurrent();
    }

    const academicYear = new AcademicYear({
      name: dto.name,
      code: dto.code,
      startDate,
      endDate,
      current: dto.current ?? false,
      centers: dto.centers ?? [],
      isDeleted: false,
    });

    const saved = await this._academicYearRepository.create(academicYear);

    return {
      id: saved.id!,
      name: saved.name,
      code: saved.code,
      startDate: saved.startDate.toISOString(),
      endDate: saved.endDate.toISOString(),
      current: saved.current,
      centers: saved.centers,
      isDeleted: saved.isDeleted,
      createdAt: saved.createdAt?.toISOString(),
      updatedAt: saved.updatedAt?.toISOString(),
    };
  }
}
