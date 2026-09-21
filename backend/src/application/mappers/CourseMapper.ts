import { Types } from "mongoose";
import { Course, CourseLevelProps } from "../../domain/entities/Course";

export interface ICoursePersistenceInput {
  _id: Types.ObjectId | string;
  programId: any;
  name: string;
  code: string;
  description: string;
  durationMonths?: number;
  levelName: string;
  levelCount: number;
  levels: CourseLevelProps[];
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CourseMapper {
  static toDomain(doc: ICoursePersistenceInput): Course {
    const programId = doc.programId?._id
      ? doc.programId._id.toString()
      : (doc.programId ? doc.programId.toString() : '');
    const programName = doc.programId?.name;

    return new Course({
      id: doc._id.toString(),
      programId,
      programName,
      name: doc.name,
      code: doc.code,
      description: doc.description,
      durationMonths: doc.durationMonths ?? 0,
      levelName: doc.levelName,
      levelCount: doc.levelCount,
      levels: doc.levels || [],
      isDeleted: doc.isDeleted,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(course: Course): {
    programId: string;
    name: string;
    code: string;
    description: string;
    durationMonths?: number;
    levelName: string;
    levelCount: number;
    levels: CourseLevelProps[];
    isDeleted: boolean;
  } {
    return {
      programId: course.programId,
      name: course.name,
      code: course.code,
      description: course.description,
      durationMonths: course.durationMonths ?? 0,
      levelName: course.levelName,
      levelCount: course.levelCount,
      levels: course.levels,
      isDeleted: course.isDeleted,
    };
  }

  static toPersistencePartial(course: Partial<Course>): {
    programId?: string;
    name?: string;
    code?: string;
    description?: string;
    durationMonths?: number;
    levelName?: string;
    levelCount?: number;
    levels?: CourseLevelProps[];
    isDeleted?: boolean;
  } {
    const updateData: {
      programId?: string;
      name?: string;
      code?: string;
      description?: string;
      durationMonths?: number;
      levelName?: string;
      levelCount?: number;
      levels?: CourseLevelProps[];
      isDeleted?: boolean;
    } = {};

    if (course.programId !== undefined) updateData.programId = course.programId;
    if (course.name !== undefined) updateData.name = course.name;
    if (course.code !== undefined) updateData.code = course.code;
    if (course.description !== undefined) updateData.description = course.description;
    if (course.durationMonths !== undefined) updateData.durationMonths = course.durationMonths;
    if (course.levelName !== undefined) updateData.levelName = course.levelName;
    if (course.levelCount !== undefined) updateData.levelCount = course.levelCount;
    if (course.levels !== undefined) updateData.levels = course.levels;
    if (course.isDeleted !== undefined) updateData.isDeleted = course.isDeleted;

    return updateData;
  }
}
