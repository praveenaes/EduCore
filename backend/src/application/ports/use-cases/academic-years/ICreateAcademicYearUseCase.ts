import { CreateAcademicYearDTO, AcademicYearResponseDTO } from '@/application/dto/academic-years/academicYearDtos';

export interface ICreateAcademicYearUseCase {
  execute(dto: CreateAcademicYearDTO): Promise<AcademicYearResponseDTO>;
}
