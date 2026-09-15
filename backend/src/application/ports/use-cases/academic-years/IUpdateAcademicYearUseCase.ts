import { UpdateAcademicYearDTO, AcademicYearResponseDTO } from '../../../dto/academic-years/academicYearDtos';

export interface IUpdateAcademicYearUseCase {
  execute(id: string, dto: UpdateAcademicYearDTO): Promise<AcademicYearResponseDTO>;
}
