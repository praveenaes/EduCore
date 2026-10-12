import { Types } from 'mongoose';
import { Center, ICenterAddress, ICenterProgramInfo } from '../../../domain/entities/Center';

export interface ICenterPersistenceInput {
  _id: Types.ObjectId | string;
  name: string;
  code: string;
  phone: string;
  email: string;
  timezone: string;
  address: ICenterAddress;
  status: 'active' | 'inactive';
  programs?: any[];
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CenterMapper {
  static toDomain(doc: ICenterPersistenceInput | any): Center {
    const rawPrograms = doc.programs || [];
    const programs: (ICenterProgramInfo | string)[] = rawPrograms.map((p: any) => {
      if (typeof p === 'string') return p;
      if (p && p._id && p.name) {
        return {
          id: p._id.toString(),
          name: p.name,
          code: p.code,
        };
      }
      if (p && p._id) return p._id.toString();
      if (p && typeof p.toString === 'function') return p.toString();
      return String(p);
    });

    return new Center({
      id: doc._id.toString(),
      name: doc.name,
      code: doc.code,
      phone: doc.phone,
      email: doc.email,
      timezone: doc.timezone,
      address: {
        addressLine1: doc.address.addressLine1,
        city: doc.address.city,
        state: doc.address.state,
        postalCode: doc.address.postalCode,
        country: doc.address.country,
      },
      status: doc.status,
      programs,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    });
  }

  static toPersistence(center: Center): {
    name: string;
    code: string;
    phone: string;
    email: string;
    timezone: string;
    address: ICenterAddress;
    status: 'active' | 'inactive';
    programs: Types.ObjectId[];
  } {
    return {
      name: center.name,
      code: center.code,
      phone: center.phone,
      email: center.email,
      timezone: center.timezone,
      address: {
        addressLine1: center.address.addressLine1,
        city: center.address.city,
        state: center.address.state,
        postalCode: center.address.postalCode,
        country: center.address.country,
      },
      status: center.status,
      programs: (center.programs || []).map((p) => {
        const id = typeof p === 'string' ? p : p.id;
        return new Types.ObjectId(id);
      }),
    };
  }

  static toPersistencePartial(center: Partial<Center>): Record<string, any> {
    const updateData: Record<string, any> = {};

    if (center.name !== undefined) updateData.name = center.name;
    if (center.code !== undefined) updateData.code = center.code;
    if (center.phone !== undefined) updateData.phone = center.phone;
    if (center.email !== undefined) updateData.email = center.email;
    if (center.timezone !== undefined) updateData.timezone = center.timezone;
    if (center.address !== undefined) updateData.address = center.address;
    if (center.status !== undefined) updateData.status = center.status;
    if (center.programs !== undefined) {
      updateData.programs = center.programs.map((p) => {
        const id = typeof p === 'string' ? p : p.id;
        return new Types.ObjectId(id);
      });
    }

    return updateData;
  }
}
