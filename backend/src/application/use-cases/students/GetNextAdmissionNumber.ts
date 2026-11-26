import { injectable, inject } from "inversify";
import { TYPES } from "@/config/di/types";
import { IStudentRepository } from "@/domain/repositories/IStudentRepository";
import { IGetNextAdmissionNumberUseCase } from "@/application/ports/use-cases/students/IGetNextAdmissionNumberUseCase";

@injectable()
export class GetNextAdmissionNumber implements IGetNextAdmissionNumberUseCase {
  constructor(
    @inject(TYPES.StudentRepository) private _studentRepo: IStudentRepository
  ) {}

  async execute(): Promise<string> {
    const lastAdmissionNumber = await this._studentRepo.findLastAdmissionNumber();
    if (!lastAdmissionNumber) {
      return "STU001";
    }

    const match = lastAdmissionNumber.match(/^STU(\d+)$/);
    if (!match) {
      return "STU001";
    }

    const nextNum = parseInt(match[1], 10) + 1;
    return `STU${String(nextNum).padStart(3, "0")}`;
  }
}
