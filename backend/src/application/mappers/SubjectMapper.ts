import { Types } from "mongoose";
import { Subject } from "../../domain/entities/Subject";

export interface ISubjectPersistenceInput {
  _id: Types.ObjectId | string;
  name: string;
  code: string;
  description: string;
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class SubjectMapper {
  static toDomain(doc: ISubjectPersistenceInput): Subject {
    return new Subject({
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code,
      description: doc.description,
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(subject: Subject): {
    name: string;
    code: string;
    description: string;
    isDeleted: boolean;
  } {
    return {
      name: subject.name,
      code: subject.code,
      description: subject.description,
      isDeleted: subject.isDeleted,
    };
  }

  static toPersistencePartial(subject: Partial<Subject>): {
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

    if (subject.name !== undefined) updateData.name = subject.name;
    if (subject.code !== undefined) updateData.code = subject.code;
    if (subject.description !== undefined) updateData.description = subject.description;
    if (subject.isDeleted !== undefined) updateData.isDeleted = subject.isDeleted;

    return updateData;
  }
}
