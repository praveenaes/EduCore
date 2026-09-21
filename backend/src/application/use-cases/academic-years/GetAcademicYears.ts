import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { IAcademicYearRepository } from '../../../domain/repositories/IAcademicYearRepository';
import { IGetAcademicYearsUseCase } from '../../ports/use-cases/academic-years/IGetAcademicYearsUseCase';
import { AcademicYearQueryDTO, AcademicYearListResultDTO } from '../../dto/academic-years/academicYearDtos';

@injectable()
export class GetAcademicYears implements IGetAcademicYearsUseCase {
  constructor(
    @inject(TYPES.AcademicYearRepository)
    private _academicYearRepository: IAcademicYearRepository
  ) {}

  async execute(query: AcademicYearQueryDTO): Promise<AcademicYearListResultDTO> {
    const { page = 1, limit = 10, search, centerId, current, sortBy, sortOrder } = query;

    const { academicYears, total } = await this._academicYearRepository.findAll(
      { search, centerId, current },
      { page, limit, sortBy, sortOrder }
    );

    return {
      academicYears: academicYears.map((ay) => ({
        id: ay.id!,
        name: ay.name,
        code: ay.code,
        startDate: ay.startDate.toISOString(),
        endDate: ay.endDate.toISOString(),
        current: ay.current,
        centers: ay.centers,
        isDeleted: ay.isDeleted,
        createdAt: ay.createdAt?.toISOString(),
        updatedAt: ay.updatedAt?.toISOString(),
      })),
      total,
    };
  }
}
