import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ISubjectRepository } from "../../../domain/repositories/ISubjectRepository";
import { ISubjectAssignmentRepository } from "../../../domain/repositories/ISubjectAssignmentRepository";
import { NotFoundError, ValidationError } from "@/shared/errors/AppError";
import { IDeleteSubject } from "../../ports/use-cases/subjects/IDeleteSubjectUseCase";

@injectable()
export class DeleteSubject implements IDeleteSubject {
  constructor(
    @inject(TYPES.SubjectRepository) private _subjectRepo: ISubjectRepository,
    @inject(TYPES.SubjectAssignmentRepository) private _subjectAssignmentRepo: ISubjectAssignmentRepository
  ) {}

  async execute(id: string): Promise<void> {
    const subject = await this._subjectRepo.findById(id);
    if (!subject || subject.isDeleted) {
      throw new NotFoundError("Subject not found.");
    }

    const assignments = await this._subjectAssignmentRepo.findBySubjectId(id);
    if (assignments.length > 0) {
      const count = assignments.length === 1 ? "one" : assignments.length;
      throw new ValidationError(
        `Cannot delete subject ${subject.name}, it is actively assigned to ${count} subject ${assignments.length === 1 ? "assignment" : "assignments"}`
      );
    }

    const success = await this._subjectRepo.softDelete(id);
    if (!success) {
      throw new NotFoundError("Failed to delete subject.");
    }
  }
}
