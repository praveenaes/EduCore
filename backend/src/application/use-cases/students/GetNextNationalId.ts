import { injectable, inject } from "inversify";
import { TYPES } from "@/config/di/types";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { IGetNextNationalIdUseCase } from "@/application/ports/use-cases/students/IGetNextNationalIdUseCase";

@injectable()
export class GetNextNationalId implements IGetNextNationalIdUseCase {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository
  ) {}

  async execute(): Promise<string> {
    const lastNationalId = await this._studentRepo.findLastNationalId();
    if (!lastNationalId) {
      return "NID001";
    }

    const match = lastNationalId.match(/^NID(\d+)$/);
    if (!match) {
      return "NID001";
    }

    const nextNum = parseInt(match[1], 10) + 1;
    return `NID${String(nextNum).padStart(3, "0")}`;
  }
}
