import { inject, injectable } from 'inversify';
import { TYPES } from '../../../config/di/types';
import { ISubjectAssignmentRepository } from '../../../domain/repositories/ISubjectAssignmentRepository';
import { IDeleteSubjectAssignmentUseCase } from '../../ports/use-cases/subject-assignments/IDeleteSubjectAssignmentUseCase';
import { NotFoundError } from '@/shared/errors/AppError';

@injectable()
export class DeleteSubjectAssignment implements IDeleteSubjectAssignmentUseCase {
  constructor(
    @inject(TYPES.SubjectAssignmentRepository)
    private _assignmentRepo: ISubjectAssignmentRepository
  ) {}

  async execute(id: string): Promise<boolean> {
    const assignment = await this._assignmentRepo.findById(id);
    if (!assignment || assignment.isDeleted) {
      throw new NotFoundError(`Subject assignment with id "${id}" not found`);
    }

    return await this._assignmentRepo.softDelete(id);
  }
}
