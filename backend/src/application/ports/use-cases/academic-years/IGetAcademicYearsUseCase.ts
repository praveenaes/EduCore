import { AcademicYearQueryDTO, AcademicYearListResultDTO } from '@/application/dto/academic-years/academicYearDtos';

export interface IGetAcademicYearsUseCase {
  execute(query: AcademicYearQueryDTO): Promise<AcademicYearListResultDTO>;
}
