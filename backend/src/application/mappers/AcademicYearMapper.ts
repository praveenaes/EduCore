import { Types } from 'mongoose';
import { AcademicYear, IAcademicYearCenterInfo } from '../../domain/entities/AcademicYear';
import { IAcademicYearDocument } from '../../infra/db/models/AcademicYearModel';

export class AcademicYearMapper {
  static toDomain(doc: IAcademicYearDocument | any): AcademicYear {
    const rawCenters = doc.centers || [];
    const centers: (IAcademicYearCenterInfo | string)[] = rawCenters.map((c: any) => {
      if (typeof c === 'string') return c;
      if (c && c._id && c.name) {
        return {
          id: c._id.toString(),
          name: c.name,
          code: c.code,
        };
      }
      if (c && c._id) return c._id.toString();
      if (c && typeof c.toString === 'function') return c.toString();
      return String(c);
    });

    return new AcademicYear({
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code,
      startDate: doc.startDate,
      endDate: doc.endDate,
      current: Boolean(doc.current),
      centers,
      isDeleted: Boolean(doc.isDeleted),
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(entity: AcademicYear): Record<string, any> {
    return {
      name: entity.name,
      code: entity.code,
      startDate: entity.startDate,
      endDate: entity.endDate,
      current: entity.current,
      centers: entity.centers.map((c) => {
        const id = typeof c === 'string' ? c : c.id;
        return new Types.ObjectId(id);
      }),
      isDeleted: entity.isDeleted,
    };
  }

  static toPersistencePartial(entity: Partial<AcademicYear>): Record<string, any> {
    const updateData: Record<string, any> = {};

    if (entity.name !== undefined) updateData.name = entity.name;
    if (entity.code !== undefined) updateData.code = entity.code;
    if (entity.startDate !== undefined) updateData.startDate = entity.startDate;
    if (entity.endDate !== undefined) updateData.endDate = entity.endDate;
    if (entity.current !== undefined) updateData.current = entity.current;
    if (entity.centers !== undefined) {
      updateData.centers = entity.centers.map((c) => {
        const id = typeof c === 'string' ? c : c.id;
        return new Types.ObjectId(id);
      });
    }
    if (entity.isDeleted !== undefined) updateData.isDeleted = entity.isDeleted;

    return updateData;
  }
}
