import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ISubjectRepository } from "../../../domain/repositories/ISubjectRepository";
import { NotFoundError } from "@/shared/errors/AppError";
import { IDeleteSubject } from "../../ports/use-cases/subjects/IDeleteSubjectUseCase";

@injectable()
export class DeleteSubject implements IDeleteSubject {
  constructor(
    @inject(TYPES.SubjectRepository) private _subjectRepo: ISubjectRepository
  ) {}

  async execute(id: string): Promise<void> {
    const subject = await this._subjectRepo.findById(id);
    if (!subject || subject.isDeleted) {
      throw new NotFoundError("Subject not found.");
    }

    const success = await this._subjectRepo.softDelete(id);
    if (!success) {
      throw new NotFoundError("Failed to delete subject.");
    }
  }
}
