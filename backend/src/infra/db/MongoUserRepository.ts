import { injectable } from "inversify";
import { IUserRepository } from "../../application/ports/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { UserModel, IUserDocument } from "./models/UserModel";
import { UserMapper } from "../../application/mappers/UserMapper";

@injectable()
export class MongoUserRepository implements IUserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const document = await UserModel.findOne({ email });
    if (!document) return null;

    return UserMapper.toDomain(document);
  }

  async create(user: User): Promise<User> {
    const document = new UserModel(UserMapper.toPersistence(user));
    await document.save();

    return UserMapper.toDomain(document);
  }

  async findById(id: string): Promise<User | null> {
    const document = await UserModel.findById(id);
    if (!document) return null;

    return UserMapper.toDomain(document);
  }

  async savePasswordResetOtp(email: string, otp: string, expiresAt: Date): Promise<void> {
    await UserModel.updateOne(
      { email },
      {
        passwordResetOtp: otp,
        passwordResetOtpExpiresAt: expiresAt,
      }
    );
  }

  async saveEmailChangeOtp(email: string, otp: string, expiresAt: Date): Promise<void> {
    await UserModel.updateOne(
      { email },
      {
        emailChangeOtp: otp,
        emailChangeOtpExpiresAt: expiresAt,
      }
    );
  }

  async clearEmailChangeOtp(email: string): Promise<void> {
    await UserModel.updateOne(
      { email },
      {
        $unset: { emailChangeOtp: 1, emailChangeOtpExpiresAt: 1 }
      }
    );
  }

  async updatePassword(email: string, passwordHash: string): Promise<void> {
    await UserModel.updateOne(
      { email },
      {
        password: passwordHash,
        $unset: { passwordResetOtp: 1, passwordResetOtpExpiresAt: 1 }
      }
    );
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updateData = UserMapper.toPersistencePartial(user)
    //userData will be a single field

    const document = await UserModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
    if (!document) return null;

    return UserMapper.toDomain(document);
  }

  async delete(id: string): Promise<boolean> {
    const result = await UserModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
