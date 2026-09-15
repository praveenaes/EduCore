import { UserRole } from "@/domain/enums/UserRole";
import { User } from "../../domain/entities/User";
import { Types } from "mongoose";

export interface IUserPersistenceInput {
  _id: Types.ObjectId |string
  name: string;
  email: string;
  password: string;
  role: string;
  passwordResetOtp?: string;
  passwordResetOtpExpiresAt?: Date;
  emailChangeOtp?: string;
  emailChangeOtpExpiresAt?: Date;
}

interface UserPersistence {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export class UserMapper {
  static toDomain(doc: IUserPersistenceInput): User {
    return new User({
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      role: doc.role as UserRole,
      name: doc.name,
      passwordResetOtp: doc.passwordResetOtp,
      passwordResetOtpExpiresAt: doc.passwordResetOtpExpiresAt,
      emailChangeOtp: doc.emailChangeOtp,
      emailChangeOtpExpiresAt: doc.emailChangeOtpExpiresAt,
    });
  }

  static toPersistence(user: User):UserPersistence {
    return {
      name: user.name,
      email: user.email,
      password: user.password,
      role: user.role,
    };
  }

  static toPersistencePartial(user: Partial<User>):UserPersistence {
    const updateData: UserPersistence= {};
    if (user.name !== undefined) updateData.name = user.name;
    if (user.email !== undefined) updateData.email = user.email;
    if (user.password !== undefined) updateData.password = user.password;
    if (user.role !== undefined) updateData.role = user.role;
    return updateData;
  }
}
