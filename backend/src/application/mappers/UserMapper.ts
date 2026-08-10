import { UserRole } from "@/domain/enums/UserRole";
import { User } from "../../domain/entities/User";
import { IUserDocument } from "../../infra/db/models/UserModel";

interface UserPersistence {
  name?: string;
  email?: string;
  password?: string;
  role?: string;
}

export class UserMapper {
  static toDomain(doc: IUserDocument): User {
    return new User(
      doc._id.toString(),
      doc.email,
      doc.password,
      doc.role as UserRole,
      doc.name,
      doc.passwordResetOtp,
      doc.passwordResetOtpExpiresAt,
      doc.emailChangeOtp,
      doc.emailChangeOtpExpiresAt
    );
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
