import { CreateProgramDTO, ProgramResponseDTO } from "@/application/dto/programs/programDtos";

export interface ICreateProgram {
  execute(dto: CreateProgramDTO): Promise<ProgramResponseDTO>;
}