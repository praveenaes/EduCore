import { injectable, inject } from "inversify";
import { TYPES } from "../../../config/di/types";
import { ISubjectRepository } from "../../../domain/repositories/ISubjectRepository";
import { NotFoundError, ValidationError } from "@/shared/errors/AppError";
import { IUpdateSubject } from "../../ports/use-cases/subjects/IUpdateSubjectUseCase";
import { UpdateSubjectDTO, SubjectResponseDTO } from "../../dto/subjects/subjectDtos";

@injectable()
export class UpdateSubject implements IUpdateSubject {
  constructor(
    @inject(TYPES.SubjectRepository) private _subjectRepo: ISubjectRepository
  ) {}

  async execute(id: string, dto: UpdateSubjectDTO): Promise<SubjectResponseDTO> {
    const subject = await this._subjectRepo.findById(id);
    if (!subject || subject.isDeleted) {
      throw new NotFoundError("Subject not found.");
    }

    if (dto.code && dto.code.trim().toUpperCase() !== subject.code) {
      const existingByCode = await this._subjectRepo.findByCode(dto.code);
      if (existingByCode && existingByCode.id !== id) {
        throw new ValidationError("Subject with this code already exists.");
      }
    }

    if (dto.name && dto.name.trim() !== subject.name) {
      const existingByName = await this._subjectRepo.findByName(dto.name);
      if (existingByName && existingByName.id !== id) {
        throw new ValidationError("Subject with this name already exists.");
      }
    }

    subject.updateDetails(dto.name, dto.code, dto.description);

    const updated = await this._subjectRepo.update(id, subject);
    if (!updated) {
      throw new NotFoundError("Failed to update subject.");
    }

    return {
      id: updated.id!,
      name: updated.name,
      code: updated.code,
      description: updated.description,
      isDeleted: updated.isDeleted,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    };
  }
}
