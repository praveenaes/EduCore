import { Types } from 'mongoose';
import { Center, ICenterAddress } from '../../domain/entities/Center';

export interface ICenterPersistenceInput {
  _id: Types.ObjectId | string;
  name: string;
  code: string;
  phone: string;
  email: string;
  timezone: string;
  address: ICenterAddress;
  status: 'active' | 'inactive';
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CenterMapper {
  static toDomain(doc: ICenterPersistenceInput): Center {
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

    return updateData;
  }
}
