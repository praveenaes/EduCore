import { ProgramResponseDTO, UpdateProgramDTO } from "@/application/dto/programs/programDtos";

export interface IUpdateProgram {
  execute(id: string, dto: UpdateProgramDTO): Promise<ProgramResponseDTO>;
}
