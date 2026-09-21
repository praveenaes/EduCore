import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { IAcademicYearRepository } from '../../../domain/repositories/IAcademicYearRepository';
import { ICreateAcademicYearUseCase } from '../../ports/use-cases/academic-years/ICreateAcademicYearUseCase';
import { CreateAcademicYearDTO, AcademicYearResponseDTO } from '../../dto/academic-years/academicYearDtos';
import { AcademicYear } from '../../../domain/entities/AcademicYear';
import { ConflictError } from '@/shared/errors/AppError';

@injectable()
export class CreateAcademicYear implements ICreateAcademicYearUseCase {
  constructor(
    @inject(TYPES.AcademicYearRepository)
    private _academicYearRepository: IAcademicYearRepository
  ) {}

  async execute(dto: CreateAcademicYearDTO): Promise<AcademicYearResponseDTO> {
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

    const academicYear = AcademicYear.createNew({
      name: dto.name,
      code: dto.code,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      current: dto.current,
      centers: dto.centers,
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
