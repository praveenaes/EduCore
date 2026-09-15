import { Types } from "mongoose";
import { Program } from "../../domain/entities/Program";

export interface IProgramPersistenceInput {
  _id: Types.ObjectId |string
  name: string;
  code: string;
  description?: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ProgramMapper {
  static toDomain(doc: IProgramPersistenceInput): Program {
    return new Program({
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code,
      description: doc.description,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(program: Program): {
    name: string;
    code: string;
    description?: string;
    isDeleted: boolean;
  } {
    return {
      name: program.name,
      code: program.code,
      description: program.description,
      isDeleted: program.isDeleted,
    };
  }

  static toPersistencePartial(program: Partial<Program>): {
    name?: string;
    code?: string;
    description?: string;
    isDeleted?: boolean;
  } {
    const updateData: {
      name?: string;
      code?: string;
      description?: string;
      isDeleted?: boolean;
    } = {};

    if (program.name !== undefined) updateData.name = program.name;
    if (program.code !== undefined) updateData.code = program.code;
    if (program.description !== undefined) updateData.description = program.description;
    if (program.isDeleted !== undefined) updateData.isDeleted = program.isDeleted;

    return updateData;
  }
}